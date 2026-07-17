# External Integrations

**Analysis Date:** 2026-07-18

## APIs & External Services

**Google Gemini API:**
- AI-powered candidate summaries and interview questions generation
- SDK/Client: HTTP POST via Laravel `Http` facade (`app/Services/GeminiService.php`)
- Auth: API key passed as query parameter (`GEMINI_API_KEY`)
- Endpoint: `{GEMINI_API_URL}?key={API_KEY}`
- Rate limit: 10 requests/hr (throttle:ai middleware)
- Usage: Candidate summaries (3-4 sentences), interview questions (5 per resume)

**Python Scoring Service:**
- TF-IDF and semantic similarity scoring (Sentence-BERT embeddings)
- SDK/Client: HTTP POST via Laravel `Http` facade (`app/Services/ScoringService.php`)
- Auth: None (internal service)
- Endpoints:
  - `POST /score/tfidf` - Keyword frequency matching (cosine similarity)
  - `POST /score/semantic` - MiniLM-L6-v2 semantic embeddings
  - `GET /health` - Service availability check
- URL: Configured via `PYTHON_SCORER_URL` (default: `http://127.0.0.1:5001`)
- Timeout: 30s for TF-IDF, 60s for semantic scoring

## Data Storage

**Primary Database:**
- MySQL 8.0 (production) / SQLite (development fallback)
- Connection: `DB_*` environment variables
- ORM: Laravel Eloquent
- Tables: users, jobs, resumes, candidate_rankings, audit_logs, personal_access_tokens, etc.
- Queue table: `jobs` (for background job processing)

**File Storage:**
- Local filesystem (`FILESYSTEM_DISK=local`)
- Uploaded resumes stored in `storage/app/`
- Resume text extracted and stored in database

**Caching:**
- Redis (via Predis client) - optional, configured for queue
- Default cache: file-based (`CACHE_STORE=file`)

## Authentication & Identity

**Primary Auth Provider:**
- Laravel Sanctum 4.0 (API token-based)
- Implementation: Bearer token in Authorization header
- Token storage: Frontend localStorage
- Session: Single-session enforcement (old tokens deleted on login)
- CSRF protection: Sanctum stateful domains configured

**OAuth Provider:**
- Google OAuth 2.0 via Laravel Socialite
- Implementation: `laravel/socialite` package
- Config: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Frontend redirect: `VITE_GOOGLE_AUTH_URL`

**Role-Based Access Control:**
- Spatie Laravel Permission 7.3
- Roles: `admin`, `hr`
- Data isolation: HR sees only own uploads/jobs; Admin sees all

## Email & Notifications

**Email Service:**
- SendGrid (via `s-ichikawa/laravel-sendgrid-driver`)
- Auth: `SENDGRID_API_KEY`
- Implementation: Laravel Mailable classes
- Mail templates:
  - `app/Mail/RejectionNoticeMail.php` - Rejection notifications
  - `app/Mail/InterviewInvitationMail.php` - Interview invitations
- Rate limit: 10 bulk emails/hr (throttle:bulk-mail)

**Password Reset:**
- Built-in Laravel password reset via email
- Routes: `/api/auth/forgot-password`, `/api/auth/reset-password`

## Monitoring & Observability

**Error Tracking:**
- Laravel logging (`LOG_CHANNEL=stack`, `LOG_DEPRECATIONS_CHANNEL=null`)
- Application errors logged via `Log::error()` in services

**Audit Logging:**
- Custom implementation: `app/Services/AuditLogger.php`
- Logs: auth.login, auth.logout, and other user actions
- Stored in: `audit_logs` table
- Viewable by admins: `/api/admin/audit-logs`

## CI/CD & Deployment

**Hosting:**
- Frontend: Vercel/Netlify (static React build)
- Backend: Any PHP host (Render, Railway, Laravel Forge)
- Python scorer: Render/Fly.io (CPU-only PyTorch)

**CI Pipeline:**
- Not detected (no CI config files found)

## Environment Configuration

**Required Backend Environment Variables:**
- `APP_KEY` - Laravel encryption key (auto-generated)
- `DB_*` - MySQL connection credentials
- `REDIS_*` - Redis connection (for queue)
- `PYTHON_SCORER_URL` - Python scorer endpoint
- `GEMINI_API_KEY` - Google Gemini API key
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `SENDGRID_API_KEY` - SendGrid email API key
- `FRONTEND_URL` - Frontend URL for CORS/callbacks
- `SANCTUM_STATEFUL_DOMAINS` - Sanctum cookie domain
- `CORS_ALLOWED_ORIGINS` - Allowed frontend origins

**Required Frontend Environment Variables:**
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:8000/api`)
- `VITE_GOOGLE_AUTH_URL` - Google OAuth redirect URL

**Secrets Location:**
- `.env` files (not committed to git)
- `.env.example` provided as template

## Webhooks & Callbacks

**Incoming:**
- Google OAuth callback: `GET /auth/google/callback` (handled by Socialite)

**Outgoing:**
- Google Gemini API: POST requests for AI generation
- Python scorer: POST requests for resume scoring
- SendGrid API: Email delivery

## Rate Limiting

**Configured Throttles:**
- `throttle:login` - Login attempts
- `throttle:password-reset` - Password reset requests
- `throttle:upload` - Resume uploads (30/hr per user)
- `throttle:ai` - AI insights generation (10/hr per user)
- `throttle:bulk-mail` - Bulk email sending (10/hr per user)

**Implementation:**
- Laravel built-in rate limiting middleware
- Configured in `routes/api.php`

## CORS Policy

**Configuration:** `config/cors.php`
- Allowed origins: Configurable via `CORS_ALLOWED_ORIGINS` (default: `localhost:5173,localhost:3000`)
- Allowed methods: `*`
- Allowed headers: `*`
- Supports credentials: `true`
- Exposed headers: `Content-Disposition` (for CSV export)

---

*Integration audit: 2026-07-18*
