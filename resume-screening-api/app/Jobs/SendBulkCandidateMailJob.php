<?php

namespace App\Jobs;

use App\Mail\InterviewInvitationMail;
use App\Mail\RejectionNoticeMail;
use App\Models\Resume;
use App\Services\AuditLogger;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendBulkCandidateMailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 30;

    /**
     * @var int Maximum emails to send per job execution to avoid timeout
     */
    public int $batchSize = 50;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $resumeIds,
        public string $status,
        public string $subject,
        public string $body,
        public int $userId,
        public array $overrideMap = [],
    ) {
        $this->onQueue('emails');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $resumes = Resume::with('candidate')
            ->whereIn('id', $this->resumeIds)
            ->get();

        $sent = 0;
        $failed = 0;

        foreach ($resumes as $index => $resume) {
            try {
                $candidate = $resume->candidate;
                $recipientEmail = $this->overrideMap[$resume->id] ?? $candidate?->email;

                if (!$recipientEmail) {
                    Log::warning("Bulk mail: No email for resume {$resume->id}");
                    $failed++;
                    continue;
                }

                $candidateName = $candidate?->name ?? 'Candidate';
                $type = $this->status === 'shortlisted' ? 'interview' : 'rejection';

                $mailable = $type === 'interview'
                    ? new InterviewInvitationMail($this->subject, $this->body, $candidateName)
                    : new RejectionNoticeMail($this->subject, $this->body, $candidateName);

                Mail::to($recipientEmail)->send($mailable);

                AuditLogger::log("candidate.email_sent", $resume, [
                    'type'           => $type,
                    'to'             => $recipientEmail,
                    'original_email' => $candidate?->email,
                    'corrected'      => $recipientEmail !== ($candidate?->email ?? ''),
                    'candidate_name' => $candidateName,
                    'subject'        => $this->subject,
                    'bulk'           => true,
                ]);

                $sent++;

                // Delay between emails to avoid rate limiting (skip after last email)
                if ($index < $resumes->count() - 1) {
                    sleep(2);
                }
            } catch (\Exception $e) {
                Log::error("Bulk mail failed for resume {$resume->id}: " . $e->getMessage());
                $failed++;
            }
        }

        Log::info("Bulk mail job completed. Sent: {$sent}, Failed: {$failed}");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Bulk mail job failed completely: " . $exception->getMessage());
    }
}
