# Security Audit Report — 2026-06-19 — Full Scope

## Findings Summary

| # | Severity | Category | Finding | Action |
|---|----------|----------|---------|--------|
| 1 | **Critical** | Rate Limiting | Zero rate limiting on any route (login, AI, upload, email) | Add throttle middleware |
| 2 | **Critical** | Credentials | `.env.prod` with all live secrets exists on disk | Rotate all credentials & ensure secure storage |
| 3 | **High** | Dependencies | 9 PHP CVEs (Laravel CRLF injection in email rule — actionable) | `composer update` |
| 4 | **High** | Dependencies | 5 npm vulnerabilities (react-router RCE, open redirect, CSRF) | `npm audit fix` |
| 5 | **High** | Auth | Sanctum tokens never expire (`expiration: null`) | Set 24h expiration |
| 6 | **High** | Frontend | Token stored in `localStorage` (XSS-exfiltratable) | Consider httpOnly cookie or short-lived tokens |
| 7 | **Medium** | Credentials | `.env.example` lists all secret key names — maps attack surface | Already placeholder values; add a warning comment |
| 8 | **Medium** | Gitignore | No root `.gitignore` | Create one with `.DS_Store`, `*.log` |
| 9 | **Medium** | Gitignore | No `python-scorer/.gitignore` | Create with Python ignores |
| 10 | **Medium** | Gitignore | Frontend `.gitignore` missing `.env*` pattern | Add `.env` and `.env.*` |
| 11 | **Medium** | Auth | Google OAuth token in URL query param (logged by proxies) | Use single-use code exchange or POST-based handoff |
| 12 | **Medium** | Auth | Reset password token passed in URL (logged in server logs) | Rotate tokens after use, shorten expiry |
| 13 | **Medium** | CORS | `allowed_methods: ['*']` and `allowed_headers: ['*']` with `supports_credentials: true` | Restrict to known methods/headers |
| 14 | **Medium** | Session | `SESSION_ENCRYPT=false` in production | Set to `true` to encrypt DB-stored sessions |
| 15 | **Medium** | Email | `symfony/mime` CRLF injection CVE — email header injection risk | Upgrade symfony/mime |
| 16 | **Low** | Transport | No `TrustProxies` middleware — `request()->ip()` returns proxy IP | Add TrustProxies for correct client IPs |
| 17 | **Low** | File Upload | Original filenames stored without sanitization (Unicode abuse risk) | Sanitize with `preg_replace('/[^\w\.\-]/', '', ...)` |
| 18 | **Low** | Frontend | 401 interceptor doesn't clear Zustand stores | Add store reset on 401 |
| 19 | **Low** | Frontend | No CSP headers configured | Add Content-Security-Policy headers |
| 20 | **Low** | Logging | `LOG_CHANNEL=stack` with `LOG_STACK=single` — large log file risk | Switch to `daily` in production |

---

## Detailed Findings

### Finding 1: Zero Rate Limiting on All Routes
- **Severity:** Critical
- **Location:** `resume-screening-api/routes/api.php:33`
- **Finding:** No `throttle` middleware is applied to any route group or individual route. The entire API is un-rate-limited.
- **Exploitation:**
  - `/auth/login`: Unlimited password guessing (brute force)
  - `/auth/forgot-password`: Unlimited password reset spam
  - `/resumes/{id}/ai-insights`: Unlimited Gemini API calls (costs money per call)
  - `/resumes` (POST): Unlimited file uploads (disk fill)
  - `/candidates/send-mail` & `/candidates/mail/send-bulk`: Unlimited email sending
- **Fix:**
  ```php
  // In bootstrap/app.php or RouteServiceProvider, add:
  RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
  RateLimiter::for('ai', fn (Request $request) => Limit::perHour(10)->by($request->user()->id));

  // In routes/api.php:
  Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
  Route::middleware('throttle:60,1')->group(function () { ... }); // 60 req/min general
  ```
- **Verification:** After adding, run: `curl -X POST https://.../auth/login -d '...'` 6 times in one minute — the 6th should return 429.

---

### Finding 2: `.env.prod` Contains All Live Secrets
- **Severity:** Critical
- **Location:** `resume-screening-api/.env.prod`
- **Finding:** File contains: `APP_KEY`, `DB_URL` with embedded `root:VcjicRb...`, `MAIL_PASSWORD`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_SECRET`. While this file IS in `.gitignore` and NOT currently tracked, it exists on the developer's machine and was included in the repo directory.
- **Exploitation:** If the repo is ever copied, shared, or backed up, all production credentials are exposed. If `.gitignore` is ever bypassed (`git add -f`), secrets are committed.
- **Fix:**
  1. **Rotate immediately:** DB password, Gemini API key, Gmail app password, Google OAuth client secret
  2. Move `.env.prod` outside the repo directory entirely (e.g., `~/.config/resume-screening/.env.prod` or use a secrets manager)
  3. Add to `.gitignore`: `!.env.example` block to ensure no other `.env.*` files sneak in
- **Verification:** Move the file out, verify `git status` is clean.

---

### Finding 3: 9 PHP CVEs in Dependencies
- **Severity:** High
- **Location:** `resume-screening-api/composer.lock`
- **Finding:** `composer audit` reports 9 advisories across 5 packages:
  - **`laravel/framework`** — CRLF injection in default email rule (HIGH), signed URL path confusion, CRLF injection (CVE-2026-48019)
  - **`symfony/mime`** — Email header/SMTP command injection via CRLF (HIGH, CVE-2026-45067)
  - **`guzzlehttp/psr7`** — Host confusion (CVE-2026-48998), CRLF injection (CVE-2026-49214)
  - **`symfony/routing`** — URL dot-segment encoding bypass (CVE-2026-48784), route requirement bypass (CVE-2026-45065)
  - **`phpseclib/phpseclib`** — SSRF via X.509 AIA, OID amplification DoS (CVE-2026-44167)
  - **`symfony/polyfill-intl-idn`** — Punycode equivalence bypass (CVE-2026-46644)
- **Exploitation:** The `symfony/mime` CRLF injection could allow email header injection in the mail sending flow (CandidateMailController). The Laravel email rule CRLF injection affects validation logic.
- **Fix:** Run `composer update` in `resume-screening-api/`.
- **Verification:** `composer audit` should report 0 advisories after update.

---

### Finding 4: 5 npm Vulnerabilities in Frontend
- **Severity:** High
- **Location:** `resume-screening-frontend/package.json`
- **Finding:** `npm audit` reports 5 vulnerabilities:
  - **react-router / react-router-dom** (4 HIGH):
    - Unauthenticated RCE via `TYPE_ERROR` turbostream deserialization (GHSA-49rj-9fvp-4h2h)
    - Open redirect via `//` protocol-relative URL (GHSA-2j2x-hqr9-3h42)
    - DoS via unbounded path expansion in `__manifest` (GHSA-8x6r-g9mw-2r78)
    - CSRF via PUT/PATCH/DELETE document requests (GHSA-84g9-w2xq-vcv6)
  - **form-data**: CRLF injection via multipart field names (MODERATE)
- **Exploitation:** The react-router RCE via turbostream deserialization is the most critical. An attacker who controls a redirect target could potentially execute arbitrary code.
- **Fix:** Run `npm audit fix` in `resume-screening-frontend/`.
- **Verification:** `npm audit --production` should report 0 vulnerabilities.

---

### Finding 5: Sanctum Tokens Never Expire
- **Severity:** High
- **Location:** `resume-screening-api/config/sanctum.php:50`
- **Finding:** `'expiration' => null` means tokens are valid forever once issued. A leaked or forgotten token grants permanent access.
- **Exploitation:** If a token is leaked (logs, browser extension, XSS, clipboard), the attacker has permanent API access until the token is manually revoked.
- **Fix:** Set a reasonable expiration:
  ```php
  'expiration' => (int) env('SANCTUM_EXPIRATION', 1440), // 24 hours
  ```
  Then add `SANCTUM_EXPIRATION=1440` to `.env.example`. Consider setting shorter expirations for sensitive operations.
- **Verification:** Create a token, wait for expiration window, verify 401 response.

---

### Finding 6: Token in localStorage
- **Severity:** High
- **Location:** `resume-screening-frontend/src/api/axios.js:13`
- **Finding:** The Bearer token is stored in `localStorage` and attached via Axios interceptor. Any XSS vulnerability in any dependency gives attackers access to the token.
- **Exploitation:** A supply-chain attack on any npm dependency that injects `localStorage.getItem('token')` exfiltrates all user tokens. There have been multiple real-world attacks using this vector.
- **Fix (options — pick one):**
  1. **Preferred:** Use httpOnly cookies with Sanctum's SPA authentication mode (cookie-based, not Bearer). Requires same-domain or proper CORS + `supports_credentials`.
  2. **Pragmatic:** Keep localStorage but set short token expirations (1-4 hours) and implement refresh token rotation. This limits the blast radius.
  3. **Minimal:** Add fingerprinting (hash of user agent + IP) tied to each token.
- **Verification:** Audit that tokens are short-lived and refresh flow is secure.

---

### Finding 7: `.env.example` Maps Attack Surface
- **Severity:** Medium
- **Location:** `resume-screening-api/.env.example`
- **Finding:** The example file lists 76 lines of configuration, exposing every environment variable name used by the application. While all values are placeholders, this serves as a configuration map for attackers.
- **Fix:** Add a comment at the top:
  ```
  # ATTENTION: This file lists ALL configuration keys used in production.
  # Never commit real values here. Use a secrets manager for production credentials.
  ```
  Or consider splitting into two files: `.env.example` (public-safe, minimal) and a separate internal config reference.
- **Verification:** Review `.env.example` and confirm no real values present.

---

### Finding 8-10: Missing .gitignore Files
- **Severity:** Medium
- **Location:** Project root, `python-scorer/`, `resume-screening-frontend/.gitignore`
- **Finding:**
  - **No root `.gitignore`** — risk of `.DS_Store`, `.claude/` artifacts being committed
  - **No `python-scorer/.gitignore`** — risk of `__pycache__/`, `*.pyc`, `venv/`, `.env` being committed
  - **Frontend `.gitignore` missing `.env*`** — `resume-screening-frontend/.env` currently exists on disk; no rule prevents future accidental commit
- **Fix:** Create the three files:
  ```gitignore
  # Root .gitignore
  .DS_Store
  *.log
  .claude/
  ```
  ```gitignore
  # python-scorer/.gitignore
  __pycache__/
  *.pyc
  *.pyo
  venv/
  .env
  .env.*
  *.log
  ```
  ```gitignore
  # Add to frontend .gitignore:
  .env
  .env.local
  .env.*.local
  ```
- **Verification:** `git status` shows no untracked sensitive files.

---

### Finding 11: OAuth Token in URL
- **Severity:** Medium
- **Location:** `resume-screening-api/app/Http/Controllers/Api/GoogleAuthController.php:62`
- **Finding:** `return redirect(env('FRONTEND_URL') . '/auth/google/callback?token=' . $token);` — the plain-text Sanctum token travels through the browser URL, which is logged in browser history, server access logs, and any proxy/CDN between the API and frontend.
- **Exploitation:** Anyone with access to server logs, CDN logs, or the user's browser history can extract valid API tokens.
- **Fix:** Generate a single-use authorization code (stored in cache with 60-second TTL), redirect with that code, then have the frontend exchange the code for a token via a POST endpoint. This is the standard OAuth 2.0 Authorization Code flow.
- **Verification:** After implementing, verify the token never appears in the URL bar.

---

### Finding 12: Reset Password Token in URL
- **Severity:** Medium
- **Location:** `resume-screening-api/app/Notifications/ResetPasswordNotification.php:12`
- **Finding:** `$url = env('FRONTEND_URL') . '/reset-password?token=' . $this->token;` — reset tokens are sent via email as URL params. When the user clicks, the token appears in the browser URL and in server access logs.
- **Exploitation:** If the API's access logs are compromised, all recent password reset tokens are exposed. If the user copy-pastes the URL, the token may leak.
- **Fix:**
  1. Ensure tokens expire quickly (Laravel default is 60 minutes — acceptable)
  2. Invalidate tokens after first use
  3. Consider: redirect to a `/reset-password` page where the user manually enters the token from the email (inconvenient but more secure), OR use the token from the URL immediately and redirect to a token-free URL after extraction
- **Verification:** Verify password reset tokens are single-use and expire.

---

### Finding 13: Overly Permissive CORS
- **Severity:** Medium
- **Location:** `resume-screening-api/config/cors.php:9-11`
- **Finding:** `'allowed_methods' => ['*']` and `'allowed_headers' => ['*']` with `'supports_credentials' => true`. While browsers reject wildcard origins with credentials, the methods/headers wildcards allow any HTTP method and header from the allowed origin.
- **Fix:** Restrict to known values:
  ```php
  'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  ```
- **Verification:** After changing, test that all frontend API calls still work.

---

### Finding 14: Unencrypted Sessions
- **Severity:** Medium
- **Location:** `resume-screening-api/.env.prod:29` (`SESSION_ENCRYPT=false`)
- **Finding:** Session data stored in the database is not encrypted at rest. If the database is compromised, session data is readable in plaintext.
- **Exploitation:** Database breach → read all session payloads → session hijacking for every active user.
- **Fix:** Set `SESSION_ENCRYPT=true` in `.env.prod`.
- **Verification:** After changing, log in and verify the `sessions` table stores encrypted payloads.

---

### Finding 15: Symfony Mime Email Header Injection CVE
- **Severity:** Medium
- **Location:** `resume-screening-api/composer.lock` (symfony/mime)
- **Finding:** CVE-2026-45067 — CRLF injection in `Symfony\Component\Mime\Address` enables email header injection and SMTP command injection. This directly impacts `CandidateMailController` which constructs and sends emails with user-supplied data (candidate names, job titles).
- **Exploitation:** A candidate with a crafted name (containing `\r\nBcc: attacker@evil.com`) could inject headers into outgoing emails.
- **Fix:** `composer update symfony/mime` to the latest patched version.
- **Verification:** `composer audit` should no longer list symfony/mime advisories.

---

### Findings 16-20: Low-Severity Items

| # | Finding | Location | Fix |
|---|---------|----------|-----|
| 16 | No `TrustProxies` — client IPs are proxy IPs | Middleware missing | Add `TrustProxies` middleware with Render's proxy IPs |
| 17 | Unsanitized filenames (Unicode abuse) | `ResumeController.php:54` | Add `preg_replace('/[^\w\.\-]/', '', $filename)` |
| 18 | 401 interceptor doesn't clear Zustand stores | `axios.js:25-27` | Import and call store reset on 401 |
| 19 | No CSP headers configured | Both frontend & API | Add CSP headers via Laravel middleware or Vercel config |
| 20 | Stack log channel in production — unbounded growth | `.env.prod:14-15` | Set `LOG_CHANNEL=daily` with `LOG_DAILY_DAYS=30` |

---

## Items Verified as Secure

- [x] `.env.prod` is in `.gitignore` and NOT tracked by git
- [x] `APP_DEBUG=false` in production
- [x] `SESSION_SECURE_COOKIE=true` in production
- [x] No `dangerouslySetInnerHTML` in React source
- [x] PhpWord library uses `libxml_disable_entity_loader(true)` for XXE protection
- [x] The commented-out `whereRaw` in CandidateRankingController uses parameterized binding
- [x] Python scorer validates `resume_text` and `job_text` are non-empty
- [x] `StoreResumeRequest` validates file types (PDF/DOCX only), max 5MB, max 10 files
- [x] Files stored to `private` disk, not public
- [x] `SESSION_SAME_SITE=none` + `SESSION_SECURE_COOKIE=true` — correct for cross-origin SPA
- [x] HR role isolation enforced in both `ResumeController` and `CandidateRankingController`
- [x] Admin routes behind `role:admin` middleware
- [x] All routes (except login/forgot-password/reset-password) behind `auth:sanctum`
- [x] No secrets committed in git history
- [x] Frontend `.env` contains only local dev URLs (no production secrets)
- [x] Audit logging covers 16 event types across all controllers
- [x] No dangerous PHP functions (eval, exec, system, etc.) in app code

---

## Remediation Priority

### Immediate (this sprint):
1. Run `composer update` + `npm audit fix`
2. Add rate limiting to auth and AI endpoints
3. Rotate all credentials in `.env.prod`

### This week:
4. Set Sanctum token expiration
5. Add `.gitignore` files (root, python-scorer, frontend `.env*`)
6. Enable `SESSION_ENCRYPT=true`
7. Restrict CORS methods and headers

### Next sprint:
8. Fix OAuth token-in-URL (implement code exchange)
9. Add TrustProxies middleware
10. Add CSP headers

---

**Audit executed at:** 2026-06-19  
**Scope:** Full — all 3 components, 10 categories  
**Tools used:** git log, composer audit, npm audit, grep, code review  
**Excluded:** No checks were skipped.
