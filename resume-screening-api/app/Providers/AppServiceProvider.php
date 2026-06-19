<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ── Rate limiters for security-sensitive endpoints ──

        // Auth: 5 login attempts per minute per IP → brute-force protection
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)
            ->by($request->ip())
            ->response(fn () => response()->json([
                'message' => 'Too many login attempts. Please try again in one minute.',
            ], 429)));

        // Password reset: 3 attempts per minute per IP → abuse prevention
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute(3)
            ->by($request->ip())
            ->response(fn () => response()->json([
                'message' => 'Too many password reset attempts. Please try again later.',
            ], 429)));

        // AI insights: 10 per hour per authenticated user → cost control
        RateLimiter::for('ai', fn (Request $request) => Limit::perHour(10)
            ->by(optional($request->user())->id ?: $request->ip())
            ->response(fn () => response()->json([
                'message' => 'AI insight generation limit reached. Please try again later.',
            ], 429)));

        // File upload: 30 per hour per authenticated user → disk-fill prevention
        RateLimiter::for('upload', fn (Request $request) => Limit::perHour(30)
            ->by(optional($request->user())->id ?: $request->ip())
            ->response(fn () => response()->json([
                'message' => 'Upload limit reached. Please try again later.',
            ], 429)));

        // Bulk email: 10 per hour per user → spam prevention
        RateLimiter::for('bulk-mail', fn (Request $request) => Limit::perHour(10)
            ->by(optional($request->user())->id ?: $request->ip())
            ->response(fn () => response()->json([
                'message' => 'Bulk email limit reached. Please try again later.',
            ], 429)));
    }
}
