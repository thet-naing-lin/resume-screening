<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    //  “one line to record who did what to which model, with extra details.”

    /**
     * Log an action.
     *
     * @param string $action     e.g. "resume.uploaded", "candidate.shortlisted"
     * @param Model|null $target The Eloquent model being acted on
     * @param array $metadata    Any extra context to store
     */
    public static function log(
        string $action,
        ?Model $target  = null,
        array  $metadata = []
    ): void {
        [$clientIp, $ipMeta] = self::resolveClientIp();
        $userId = request()->user()?->id;

        AuditLog::create([
            'user_id'     => $userId,
            'action'      => $action,
            'target_type' => $target ? class_basename($target) : null,
            'target_id'   => $target?->id,
            'metadata'    => empty($metadata) ? $ipMeta : array_merge($metadata, $ipMeta),
            'ip_address'  => $clientIp,
        ]);
    }

    /**
     * Resolve the most reliable client IP from proxy/CDN headers.
     *
     * Strategy:
     * 1) Prefer first valid public IP from trusted forwarding headers.
     * 2) Fall back to first valid private/reserved IP.
     * 3) Fall back to Laravel request()->ip().
     *
     * @return array{0: string|null, 1: array<string, mixed>}
     */
    private static function resolveClientIp(): array
    {
        $request = request();

        $forwardedFor = (string) $request->header('X-Forwarded-For', '');
        $candidates = array_merge(
            self::splitIps((string) $request->header('CF-Connecting-IP', '')),
            self::splitIps((string) $request->header('True-Client-IP', '')),
            self::splitIps((string) $request->header('X-Real-IP', '')),
            self::splitIps($forwardedFor),
            self::splitIps((string) $request->ip())
        );

        $firstValid = null;
        $publicIp = null;

        foreach ($candidates as $ip) {
            if (!filter_var($ip, FILTER_VALIDATE_IP)) {
                continue;
            }

            if ($firstValid === null) {
                $firstValid = $ip;
            }

            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                $publicIp = $ip;
                break;
            }
        }

        $resolvedIp = $publicIp ?? $firstValid;

        return [
            $resolvedIp,
            [
                'ip_source' => $publicIp ? 'public_forwarded' : 'fallback',
                'ip_forwarded_for' => $forwardedFor ?: null,
            ],
        ];
    }

    /**
     * Parse comma-separated forwarded IP values into a clean list.
     *
     * @return array<int, string>
     */
    private static function splitIps(string $value): array
    {
        if ($value === '') {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode(',', $value)), static fn($ip) => $ip !== ''));
    }
}
