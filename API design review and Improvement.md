# API Design Review and Improvement

## Overview

This document details the API design review and improvements made to the Resume Screening application. The review was conducted following RESTful API best practices, focusing on code quality, production readiness, and maintainability.

---

## Table of Contents

1. [Dead Code Removal](#1-dead-code-removal)
2. [Pagination for List Endpoints](#2-pagination-for-list-endpoints)
3. [Fix env() Usage in Production](#3-fix-env-usage-in-production)
4. [Code Cleanup - Commented-Out Code](#4-code-cleanup---commented-out-code)
5. [Duplicate Directory Removal](#5-duplicate-directory-removal)
6. [Async Bulk Mail with Queued Jobs](#6-async-bulk-mail-with-queued-jobs)

---

## 1. Dead Code Removal

### Files Deleted

| File | Reason |
|------|--------|
| `app/Services/AuditLogService.php` | Dead code with incorrect database column names |
| `app/Http/Controllers/Api/ExportController.php` | Empty controller with no methods |

### Why This Change

**AuditLogService.php** was a duplicate audit logger that conflicted with the active `AuditLogger.php` service:

```php
// AuditLogService.php - WRONG column names (deleted)
AuditLog::create([
    'user_id'   => $userId,
    'action'    => $action,
    'entity'    => $entity,        // ❌ Wrong - migration uses 'target_type'
    'entity_id' => $entityId,      // ❌ Wrong - migration uses 'target_id'
    'timestamp' => now(),          // ❌ Wrong - migration uses 'created_at'
]);
```

```php
// AuditLogger.php - CORRECT column names (active)
AuditLog::create([
    'user_id'    => $userId,
    'action'     => $action,
    'target_type' => $model?->getMorphClass(),  // ✅ Correct
    'target_id'   => $model?->getKey(),          // ✅ Correct
    'metadata'   => $metadata,
    'ip_address' => request()->ip(),
]);
```

**ExportController.php** was an empty class file with no methods — export functionality was already implemented in `CandidateRankingController@export`.

### How It Was Done

```bash
rm resume-screening-api/app/Services/AuditLogService.php
rm resume-screening-api/app/Http/Controllers/Api/ExportController.php
```

---

## 2. Pagination for List Endpoints

### Files Modified

| File | Method |
|------|--------|
| `app/Http/Controllers/Api/JobDescriptionController.php` | `index()` |
| `app/Http/Controllers/Api/ResumeController.php` | `index()` |

### Why This Change

**Without pagination**, list endpoints return all records at once:
- Database queries become slow as data grows
- API responses become large, increasing bandwidth usage
- Frontend rendering degrades with thousands of items
- Risk of memory exhaustion on server

**With pagination**, responses are bounded and predictable:
- Consistent response times regardless of total records
- Reduced server memory and network bandwidth
- Better user experience with incremental loading
- Follows RESTful API best practices

### How It Was Done

#### JobDescriptionController@index

**Before:**
```php
public function index()
{
    $jobs = JobDescription::with('creator')
        ->orderBy('created_at', 'desc')
        ->get()                           // ❌ Returns ALL records
        ->map(fn($job) => $this->formatJob($job));

    return response()->json(['jobs' => $jobs]);
}
```

**After:**
```php
public function index(Request $request)
{
    // Allow client to request 1-100 items per page, default 15
    $perPage = min($request->input('per_page', 15), 100);

    $jobs = JobDescription::with('creator')
        ->orderBy('created_at', 'desc')
        ->paginate($perPage)              // ✅ Returns only requested page
        ->through(fn($job) => $this->formatJob($job));

    return response()->json([
        'data' => $jobs->items(),
        'meta' => [
            'current_page' => $jobs->currentPage(),
            'last_page'    => $jobs->lastPage(),
            'per_page'     => $jobs->perPage(),
            'total'        => $jobs->total(),
        ],
    ]);
}
```

#### ResumeController@index

**Before:**
```php
public function index()
{
    $fullAccessRoles = ['admin', 'super_admin'];

    $resumes = Resume::with(['candidate', 'jobDescription', 'score', 'uploader'])->latest();

    if (!auth()->user()->hasAnyRole($fullAccessRoles)) {
        $resumes = $resumes->where('uploaded_by', auth()->id());
    }

    $resumes = $resumes->get()->values();  // ❌ Returns ALL records

    return response()->json(['data' => $resumes]);
}
```

**After:**
```php
public function index(\Illuminate\Http\Request $request)
{
    $fullAccessRoles = ['admin', 'super_admin'];
    $perPage = min($request->input('per_page', 15), 100);

    $resumes = Resume::with(['candidate', 'jobDescription', 'score', 'uploader'])->latest();

    if (!auth()->user()->hasAnyRole($fullAccessRoles)) {
        $resumes = $resumes->where('uploaded_by', auth()->id());
    }

    $paginated = $resumes->paginate($perPage);  // ✅ Returns only requested page

    return response()->json([
        'data' => $paginated->items(),
        'meta' => [
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'per_page'     => $paginated->perPage(),
            'total'        => $paginated->total(),
        ],
    ]);
}
```

### API Response Format

```json
{
  "data": [
    { "id": 1, "title": "Software Engineer", ... },
    { "id": 2, "title": "Product Manager", ... }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 72
  }
}
```

### Frontend Usage

```javascript
// Request specific page with custom page size
const response = await api.get('/jobs?page=2&per_page=20');

// Access pagination metadata
const { data, meta } = response.data;
console.log(`Page ${meta.current_page} of ${meta.last_page}`);
```

---

## 3. Fix env() Usage in Production

### Files Modified

| File | Change |
|------|--------|
| `config/services.php` | Added `frontend.url` configuration |
| `app/Http/Controllers/Api/GoogleAuthController.php` | Replaced `env()` with `config()` |

### Why This Change

In Laravel, calling `env()` directly in application code returns `null` when configuration is cached (`php artisan config:cache`). This causes production failures.

**The Problem:**
```php
// ❌ Returns null in production when config is cached
return redirect(env('FRONTEND_URL') . '/login?error=google_failed');
```

**The Solution:**
```php
// ✅ Always reads from cached config
return redirect(config('services.frontend.url') . '/login?error=google_failed');
```

### How It Was Done

#### Step 1: Add Configuration

**config/services.php:**
```php
'frontend' => [
    'url' => env('FRONTEND_URL', 'http://localhost:5173'),
],
```

#### Step 2: Update Controller

**GoogleAuthController.php:**
```php
// Before (3 occurrences)
return redirect(env('FRONTEND_URL') . '/login?error=google_failed');
return redirect(env('FRONTEND_URL') . '/login?error=not_registered');
return redirect(env('FRONTEND_URL') . '/auth/google/callback?token=' . $token);

// After
return redirect(config('services.frontend.url') . '/login?error=google_failed');
return redirect(config('services.frontend.url') . '/login?error=not_registered');
return redirect(config('services.frontend.url') . '/auth/google/callback?token=' . $token);
```

### Environment Variable

Add to your `.env` file:
```
FRONTEND_URL=http://localhost:5173
```

---

## 4. Code Cleanup - Commented-Out Code

### Files Modified

| File | Change |
|------|--------|
| `routes/api.php` | Removed commented register route |
| `app/Http/Controllers/Api/AuthController.php` | Removed dead `register()` method and unused imports |

### Why This Change

Commented-out code creates confusion:
- Developers don't know if it's intentionally disabled or forgotten
- Clutters the codebase and makes maintenance harder
- Dead code can contain bugs that are never caught

### How It Was Done

#### routes/api.php

**Before:**
```php
Route::prefix('auth')->group(function () {
    // Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    // ...
});
```

**After:**
```php
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    // ...
});
```

#### AuthController.php

**Removed:**
- Entire `register()` method (44 lines) - route was disabled, method was dead code
- `use App\Models\Role;` import - only used by register method
- `use App\Services\AuditLogService;` import - referenced deleted file

---

## 5. Duplicate Directory Removal

### Directory Deleted

| Directory | Reason |
|-----------|--------|
| `resume-scorer/` | Duplicate of `python-scorer/` |

### Why This Change

Having two identical directories:
- Creates confusion about which is the source of truth
- Risk of drift if one is updated but not the other
- Increases repository size unnecessarily

### How It Was Done

```bash
rm -rf resume-scorer/
```

---

## 6. Async Bulk Mail with Queued Jobs

### Files Created/Modified

| File | Change |
|------|--------|
| `app/Jobs/SendBulkCandidateMailJob.php` | **New** - Queued job for email sending |
| `app/Http/Controllers/Api/CandidateMailController.php` | Refactored `sendBulk()` to dispatch job |

### Why This Change

**The Problem:**
```php
foreach ($resumes as $index => $resume) {
    // ...
    if ($index > 0) {
        sleep(2);  // ❌ Blocks the HTTP request for minutes!
    }
    Mail::to($recipientEmail)->send($mailable);
}
// For 50 emails: 50 × 2 seconds = 100 seconds blocking time
```

**Issues:**
- HTTP request blocked for minutes
- User stares at loading spinner
- Possible timeout (nginx/apache default 60s)
- Ties up PHP-FPM worker
- Poor user experience

**The Solution:**
- Dispatch job to queue
- Return immediately with 202 Accepted
- Job processes in background

### How It Was Done

#### Step 1: Create the Job

**app/Jobs/SendBulkCandidateMailJob.php:**
```php
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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendBulkCandidateMailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

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

                // Delay between emails to avoid rate limiting
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
}
```

#### Step 2: Update Controller

**CandidateMailController@sendBulk:**
```php
public function sendBulk(Request $request)
{
    $request->validate([
        'status'             => 'required|in:shortlisted,rejected',
        'subject'            => 'required|string|max:255',
        'body'               => 'required|string|max:5000',
        'job_description_id' => 'nullable|exists:job_descriptions,id',
        'overrides'          => 'nullable|array',
        'overrides.*.resume_id'     => 'required|integer',
        'overrides.*.override_email' => 'nullable|email',
    ]);

    $overrideMap = collect($request->overrides ?? [])
        ->keyBy('resume_id')
        ->map(fn($o) => $o['override_email'])
        ->toArray();

    $resumes = Resume::with('candidate')
        ->whereHas('score', function ($q) use ($request) {
            $q->where('status', $request->status);
            if ($request->filled('job_description_id')) {
                $q->where('job_description_id', $request->job_description_id);
            }
        })
        ->when($request->filled('job_description_id'), function ($q) use ($request) {
            $q->where('job_description_id', $request->job_description_id);
        })
        ->when(!auth()->user()->hasAnyRole(['admin', 'super_admin']), function ($q) {
            $q->where('uploaded_by', auth()->id());
        })
        ->pluck('id');

    if ($resumes->isEmpty()) {
        return response()->json([
            'message' => 'No ' . $request->status . ' candidates found...',
        ], 404);
    }

    // Dispatch to queue (returns immediately)
    SendBulkCandidateMailJob::dispatch(
        resumeIds: $resumes->toArray(),
        status: $request->status,
        subject: $request->subject,
        body: $request->body,
        userId: auth()->id(),
        overrideMap: $overrideMap,
    );

    AuditLogger::log('candidate.bulk_mail_queued', null, [
        'status'             => $request->status,
        'job_description_id' => $request->job_description_id,
        'recipient_count'    => $resumes->count(),
    ]);

    return response()->json([
        'message' => "Bulk email job queued. {$resumes->count()} email(s) will be sent in the background.",
        'count'   => $resumes->count(),
    ], 202);  // 202 Accepted
}
```

### API Response Change

| Before | After |
|--------|-------|
| `200 OK` after all emails sent | `202 Accepted` immediately |
| Response time: minutes | Response time: milliseconds |
| Blocks HTTP worker | Runs in background |

### Frontend Update Required

The frontend needs to handle the new `202` response:

```javascript
// Before
const response = await api.post('/candidates/mail/send-bulk', data);
// response.data.sent = [...], response.data.failed = [...]

// After
const response = await api.post('/candidates/mail/send-bulk', data);
// response.status = 202
// response.data.message = "Bulk email job queued. 10 email(s) will be sent..."
// response.data.count = 10

// Show success toast with count
toast.success(`Emails queued: ${response.data.count} recipients`);
```

### Queue Worker Setup

Run the queue worker for the `emails` queue:

```bash
# Development
php artisan queue:work --queue=emails

# Production (with Supervisor)
# Add to /etc/supervisor/conf.d/laravel-worker.conf
[program:laravel-worker-emails]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --queue=emails --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=2
```

---

## Summary of All Changes

| # | Change | Files Affected | Impact |
|---|--------|----------------|--------|
| 1 | Dead code removal | 2 files deleted | Cleaner codebase, no confusion |
| 2 | Pagination | 2 controllers | Scalable, predictable response times |
| 3 | Fix env() usage | 2 files | Prevents production config caching bug |
| 4 | Code cleanup | 2 files | Readable, maintainable code |
| 5 | Duplicate removal | 1 directory deleted | Single source of truth |
| 6 | Async bulk mail | 1 new job, 1 controller | Non-blocking, better UX |

---

## API Design Principles Applied

1. **Consistent Response Envelope** - `data` + `meta` pattern for all list endpoints
2. **Proper HTTP Status Codes** - `202 Accepted` for async operations
3. **Input Validation** - Form request validation at API boundary
4. **Rate Limiting** - Applied to sensitive endpoints
5. **Pagination** - All list endpoints are paginated (max 100 items)
6. **Queue-based Processing** - Long-running tasks moved to background jobs
7. **Audit Logging** - All significant actions are logged
8. **Role-Based Access** - Data isolation between admin and HR roles
