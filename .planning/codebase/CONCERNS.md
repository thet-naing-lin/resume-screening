# Codebase Concerns

**Analysis Date:** 2026-07-18

## Tech Debt

**ProcessResumeJob God Class:**
- Issue: `ProcessResumeJob.php` is 674 lines and handles PDF parsing, DOCX parsing, text cleaning, text structuring, candidate parsing (name/email/phone/skills/experience), and candidate upsert — all in one class
- Files: `resume-screening-api/app/Jobs/ProcessResumeJob.php`
- Impact: Difficult to maintain, test, or modify any single parsing stage without risking others. Adding a new file format means editing a 674-line class
- Fix approach: Extract into dedicated classes — `PdfExtractor`, `DocxExtractor`, `TextCleaner`, `TextStructurer`, `CandidateParser` — and compose them in the job

**Duplicated Query Logic in CandidateRankingController:**
- Issue: The `index()` and `export()` methods in `CandidateRankingController` contain nearly identical query-building logic (role check, filters, join). Any filter change must be duplicated in both places
- Files: `resume-screening-api/app/Http/Controllers/Api/CandidateRankingController.php:19-82` and `resume-screening-api/app/Http/Controllers/Api/CandidateRankingController.php:113-217`
- Impact: Divergence risk — one method gets a filter fix while the other does not
- Fix approach: Extract a shared `buildRankingQuery(Request $request)` method that both methods call

**Duplicated Validation Rules:**
- Issue: `JobDescriptionController::store()` and `update()` have identical validation rule arrays (lines 42-53 and 71-82). Any field addition requires editing two places
- Files: `resume-screening-api/app/Http/Controllers/Api/JobDescriptionController.php`
- Impact: Validation rules will drift apart over time
- Fix approach: Create a `StoreJobRequest` form request class and reuse it in both methods

**Commented-Out Code Blocks:**
- Issue: Multiple files contain large commented-out code blocks — alternate implementations kept as reference
- Files:
  - `resume-screening-api/app/Jobs/ProcessResumeJob.php:307-311` (old extractEmail)
  - `resume-screening-api/app/Jobs/ProcessResumeJob.php:346-373` (old extractName)
  - `resume-screening-api/app/Jobs/ProcessResumeJob.php:557-581` (old extractExperienceYears)
  - `resume-screening-api/app/Jobs/ProcessResumeJob.php:372` (commented return null)
  - `resume-screening-api/app/Http/Controllers/Api/AuthController.php:77` (old logout logic)
  - `resume-screening-api/app/Http/Controllers/Api/CandidateRankingController.php:60-69` (commented skill filter)
  - `resume-screening-api/app/Jobs/ProcessResumeJob.php:86` (old dispatch call)
- Impact: Increases cognitive load; git history preserves old code already
- Fix approach: Delete all commented-out code. The git history preserves previous implementations

**Frontend Component Size:**
- Issue: Multiple page components exceed 250 lines, making them difficult to reason about
- Files:
  - `resume-screening-frontend/src/pages/candidates/CandidateRankingPage.jsx` (426 lines)
  - `resume-screening-frontend/src/pages/jobs/JobList.jsx` (363 lines)
  - `resume-screening-frontend/src/pages/resumes/ResumeList.jsx` (356 lines)
  - `resume-screening-frontend/src/pages/dashboard/Dashboard.jsx` (349 lines)
  - `resume-screening-frontend/src/components/ResumeUploadForm.jsx` (335 lines)
  - `resume-screening-frontend/src/pages/admin/UserManagement.jsx` (317 lines)
  - `resume-screening-frontend/src/components/layout/Sidebar.jsx` (303 lines)
- Impact: Hard to understand, test, and modify. Inline helper components (ScoreBadge, StatusBadge, etc.) pollute the file
- Fix approach: Extract inline sub-components (ScoreBadge, StatusBadge, StatCard, etc.) into separate files under `src/components/`. Extract complex logic into custom hooks

**Hardcoded Skill Keywords List:**
- Issue: `ProcessResumeJob::extractSkills()` contains a hardcoded array of 52 skill keywords (lines 467-542). No way to extend without code changes
- Files: `resume-screening-api/app/Jobs/ProcessResumeJob.php:464-555`
- Impact: Cannot add new skills without a code deployment. Domain-specific skills (medical, legal, finance) are excluded
- Fix approach: Move skill keywords to a config file or database table. Allow admin configuration via the UI

## Known Bugs

**GeminiService Silent Failure Returns null:**
- Symptoms: `GeminiService::generate()` returns `null` when the API fails (line 41) or throws (line 47). `AiInsightController::generate()` then saves `null` to `ai_summary` and `[]` to `questions_json`, which overwrites any previous valid insights
- Files: `resume-screening-api/app/Services/GeminiService.php:36-48`, `resume-screening-api/app/Http/Controllers/Api/AiInsightController.php:52-55`
- Trigger: Gemini API is down, rate-limited, or returns an error
- Workaround: None — user sees "AI insights generated successfully" with empty data. The frontend shows "No insights yet" even though the generation was attempted

**ScoringService Silent Failure Returns 0.0:**
- Symptoms: `ScoringService::computeTfIdf()` and `computeSemantic()` return `0.0` on failure (lines 35, 68). `ComputeResumeScoreJob` then saves these zero scores, indistinguishable from a legitimate zero-score match
- Files: `resume-screening-api/app/Services/ScoringService.php:30-42`, `resume-screening-api/app/Jobs/ComputeResumeScoreJob.php:47-50`
- Trigger: Python scorer is down, unreachable, or returns an error
- Workaround: None — candidate appears as "scored" with 0.0, which looks like a terrible match rather than an error

**UserManagementController::destroy() Uses Deleted Model:**
- Symptoms: After `$user->delete()` on line 116, the response on line 119 accesses `$user->name`. In Laravel, accessing attributes on a deleted model returns `null` (or the cached value), so the message may say " has been deleted" instead of "John Doe has been deleted"
- Files: `resume-screening-api/app/Http/Controllers/Api/UserManagementController.php:116-121`
- Trigger: Deleting any user
- Workaround: The `$userName` variable is saved on line 108 but never used in the response — only `$user->name` is used

**Google OAuth Token Exposed in URL:**
- Symptoms: The Google callback redirects to `FRONTEND_URL/auth/google/callback?token=TOKEN`, putting the auth token in the URL. This token is visible in browser history, server logs, referrer headers, and analytics
- Files: `resume-screening-api/app/Http/Controllers/Api/GoogleAuthController.php:62`
- Trigger: Any Google OAuth login
- Workaround: None — this is a design flaw in the OAuth flow

## Security Considerations

**Auth Token Stored in localStorage:**
- Risk: If XSS is present anywhere in the application, the attacker can read `localStorage.getItem("token")` and exfiltrate the user's session
- Files: `resume-screening-frontend/src/store/authStore.js:10,22`, `resume-screening-frontend/src/api/axios.js:13`
- Current mitigation: No `dangerouslySetInnerHTML` usage detected in the frontend. Axios interceptor auto-attaches the token
- Recommendations: Consider httpOnly cookies for token storage. If localStorage is kept, add a Content Security Policy header to reduce XSS surface

**Google OAuth Token in URL Query Parameter:**
- Risk: Auth tokens in URLs are logged by browsers, proxies, CDNs, and analytics tools. An attacker with access to any of these can steal the session
- Files: `resume-screening-api/app/Http/Controllers/Api/GoogleAuthController.php:62`
- Current mitigation: None
- Recommendations: Use a short-lived authorization code exchanged server-side, or pass the token via a form POST or httpOnly cookie instead of a URL parameter

**SendBulkCandidateMailJob No Authorization Check:**
- Risk: The job receives `resumeIds` and processes them without verifying that the user who dispatched the job still has access to those resumes. If a user's role is changed after dispatching, the job still sends emails
- Files: `resume-screening-api/app/Jobs/SendBulkCandidateMailJob.php:55-57`
- Current mitigation: Rate limiting on the dispatch endpoint (10/hr)
- Recommendations: Add a role/ownership check inside the job's `handle()` method before sending each email

**No CSRF Protection on Google OAuth Redirect:**
- Risk: The Google OAuth redirect endpoint (`/auth/google/callback`) is a GET request that creates an auth token. A CSRF attacker could craft a link that logs a victim into the attacker's Google-linked account
- Files: `resume-screening-api/routes/api.php` (Google routes not shown in api.php — likely in web.php), `resume-screening-api/app/Http/Controllers/Api/GoogleAuthController.php`
- Current mitigation: The callback only creates tokens for users already in the database (`User::where('email', ...)->first()`)
- Recommendations: Use the `state` parameter in the OAuth flow to verify the request originated from your application

**AuditLogController SQL LIKE Injection:**
- Risk: `$request->action` is used directly in a LIKE query without escaping wildcard characters: `->where('action', 'like', '%' . $request->action . '%')`. An attacker can use `%` or `_` to perform broader searches than intended
- Files: `resume-screening-api/app/Http/Controllers/Api/AuditLogController.php:35`
- Current mitigation: Low practical impact — the action field is short and the data is admin-only
- Recommendations: Escape LIKE wildcards: `str_replace(['%', '_'], ['\%', '\_'], $request->action)`

## Performance Bottlenecks

**SendBulkCandidateMailJob sleep(2) Blocks Queue Worker:**
- Problem: The job calls `sleep(2)` between each email (line 96), which blocks the entire queue worker process for the duration. With 50 recipients, this adds 100 seconds of dead time where no other jobs can be processed
- Files: `resume-screening-api/app/Jobs/SendBulkCandidateMailJob.php:94-97`
- Cause: Rate limiting for the email provider (SendGrid) is implemented via blocking sleep instead of job-level delays
- Improvement path: Use Laravel's `$this->release(2)` or `dispatch(new ...)->delay(now()->addSeconds(2))` to release the job back to the queue instead of sleeping. Or batch emails and use SendGrid's batch API

**AuditLogController N+1 Query in resolveTargetLabel:**
- Problem: For each audit log entry, `resolveTargetLabel()` performs a separate `Model::find($id)` query (lines 68-72). With 20 results per page, this adds 20 extra queries
- Files: `resume-screening-api/app/Http/Controllers/Api/AuditLogController.php:49-55`
- Cause: The target models are not eager-loaded, and each log has a different target_type
- Improvement path: Collect all unique (target_type, target_id) pairs, batch-load each model type, and build a lookup map

**CandidateRankingController::export Loads All Results Into Memory:**
- Problem: The export method calls `$query->get()` (line 147) which loads all matching resumes into memory. For a job with thousands of candidates, this could exhaust PHP memory
- Files: `resume-screening-api/app/Http/Controllers/Api/CandidateRankingController.php:147`
- Cause: The CSV generation iterates over the full collection in memory
- Improvement path: Use `cursor()` or `chunk()` to iterate lazily. Stream rows directly to `php://output` without collecting the full result set

**ProcessResumeJob 512MB Memory Override:**
- Problem: The job overrides PHP's memory limit to 512MB (`ini_set('memory_limit', '512M')`) on every execution, even for small resumes
- Files: `resume-screening-api/app/Jobs/ProcessResumeJob.php:37`
- Cause: PDF parsing with smalot/pdfparser can be memory-hungry for large or malformed PDFs
- Improvement path: Set a more conservative limit (e.g., 256MB) and only increase on retry. Or validate file size earlier and reject oversized files at upload time

## Fragile Areas

**ProcessResumeJob Name Extraction Heuristics:**
- Files: `resume-screening-api/app/Jobs/ProcessResumeJob.php:375-461`
- Why fragile: The extractName method uses a 19-element section headers filter list, strips URLs/emails/phones/parentheses, filters by length (3-60 chars), excludes lines containing job titles (developer, engineer, etc.), and requires pure ASCII. Any non-standard resume format (non-English names, names with titles like "Dr.", names with special characters) will fail to extract
- Safe modification: When changing the name extraction logic, test against a diverse set of resume formats. Add unit tests for extractName with edge cases
- Test coverage: No unit tests exist for ProcessResumeJob at all

**GeminiService JSON Parsing:**
- Files: `resume-screening-api/app/Services/GeminiService.php:90-98`
- Why fragile: The code strips markdown code blocks with regex (`preg_replace('/```json\s*|\s*```/', '', ...)`) and then calls `json_decode`. If Gemini returns malformed JSON (truncated output, extra text after the array), `json_decode` returns `null` and the method returns `[]`. There is no error message to the user explaining why no questions were generated
- Safe modification: Add try/catch around json_decode and log the raw response for debugging
- Test coverage: No tests for GeminiService

**Python Scorer Single-Threaded Model Loading:**
- Files: `python-scorer/app.py:37-45`
- Why fragile: The SentenceTransformer model is loaded lazily on first request with a threading lock. If the model file is corrupted or disk is full, every request will fail until the process is restarted. There is no health check that verifies model integrity
- Safe modification: Add model loading verification at startup and expose model load status in the `/health` endpoint
- Test coverage: No tests for the Python scorer

**Frontend ProtectedRoute Client-Only Auth Guard:**
- Files: `resume-screening-frontend/src/components/layout/ProtectedRoute.jsx:6-13`
- Why fragile: The guard only checks `useAuthStore().token` — a truthy string in localStorage. It does not verify the token is valid or the user still exists. A user whose account is deleted will still see protected pages until their token expires or they hit a 401
- Safe modification: Call `/auth/me` on mount to validate the token, and redirect on failure
- Test coverage: No tests for ProtectedRoute

## Scaling Limits

**Python Scorer Single-Worker Inference:**
- Current capacity: One model loaded in memory, one inference at a time (single-threaded PyTorch)
- Limit: Under concurrent resume scoring, requests will queue in Flask's single-threaded mode. With the backend dispatching ComputeResumeScoreJob with a 2-second delay, a burst of 30 uploads will create 30 sequential scoring requests
- Scaling path: Run multiple Flask workers with gunicorn (`gunicorn -w 4 app:app`). Or switch to a proper queue-based inference service

**SendBulkCandidateMailJob Linear Sleep Pattern:**
- Current capacity: ~50 emails per job execution (batchSize limit) with 2-second sleep between each = ~100 seconds per batch
- Limit: With the 10/hour rate limit on the bulk-mail endpoint and 50 emails per batch, the theoretical maximum is ~500 emails/hour. The sleep(2) makes the actual throughput lower
- Scaling path: Replace sleep with job chaining, or use SendGrid's batch sending API

**Resume File Storage Without Cleanup:**
- Current capacity: Unlimited private storage for resume files
- Limit: No scheduled job to clean up old files. Deleted resumes have their files removed (line 113 of ResumeController), but orphaned files from failed jobs accumulate
- Scaling path: Add a scheduled job to clean up files in `storage/app/private/resumes/` that have no corresponding database record

## Dependencies at Risk

**smalot/pdfparser:**
- Risk: The library handles arbitrary PDF input and has had memory exhaustion vulnerabilities. PDFs with deeply nested objects or malformed cross-reference tables can cause OOM
- Impact: ProcessResumeJob crashes, retrying up to 3 times with 512MB each time
- Migration plan: Monitor for CVEs. Add hard file size limit (already done at 10MB) and timeout. Consider switching to `spatie/pdf-to-text` which uses external tools (pdftotext) for better isolation

**phpoffice/phpword:**
- Risk: The library has had XML injection vulnerabilities (CVE-2023-25180, CVE-2023-25181). A malicious DOCX file could exploit these
- Impact: Potential code execution on the server during resume parsing
- Migration plan: Keep updated. Validate file extensions strictly (already done). Consider running the parser in a sandboxed process

**sentence-transformers (Python):**
- Risk: The `all-MiniLM-L6-v2` model requires ~80MB of disk and ~200MB of RAM. Model loading takes several seconds on first request
- Impact: Cold start latency. If the model download is corrupted, the service fails permanently until redeployed
- Migration plan: Pre-download the model during Docker build. Add a startup health check that verifies model loading

## Missing Critical Features

**No Frontend Test Suite:**
- Problem: Zero test files exist in `resume-screening-frontend/src/`. No unit tests, no integration tests, no component tests
- Blocks: Cannot safely refactor components, modify state management, or change API integration patterns without manual verification

**No ProcessResumeJob Tests:**
- Problem: The most complex file in the codebase (674 lines) has no unit tests for its extraction methods
- Files: `resume-screening-api/app/Jobs/ProcessResumeJob.php`
- Blocks: Cannot verify that text parsing, candidate extraction, or skill detection works correctly for different resume formats

**No Scoring Pipeline Integration Tests:**
- Problem: No tests verify the end-to-end flow from resume upload through Python scoring to final score computation
- Files: `resume-screening-api/app/Jobs/ComputeResumeScoreJob.php`, `resume-screening-api/app/Services/ScoringService.php`
- Blocks: Cannot verify that score weighting (0.4 TF-IDF + 0.6 Semantic) produces correct results

## Test Coverage Gaps

**ProcessResumeJob — All Methods Untested:**
- What's not tested: `extractFromPdf()`, `extractFromDocx()`, `cleanText()`, `structureText()`, `extractEmail()`, `extractPhone()`, `extractName()`, `extractSkills()`, `extractExperienceYears()`, `upsertCandidate()`
- Files: `resume-screening-api/app/Jobs/ProcessResumeJob.php`
- Risk: Text parsing heuristics break silently on new resume formats. Name extraction already uses complex filtering that could miss valid names
- Priority: High

**GeminiService — No Tests:**
- What's not tested: `generate()`, `generateSummary()`, `generateInterviewQuestions()`, JSON parsing of Gemini responses
- Files: `resume-screening-api/app/Services/GeminiService.php`
- Risk: Gemini API response format changes or prompt engineering regressions go undetected
- Priority: High

**AiInsightController — No Tests:**
- What's not tested: Authorization checks (HR vs admin), null summary handling, empty questions handling
- Files: `resume-screening-api/app/Http/Controllers/Api/AiInsightController.php`
- Risk: AI insights can be generated for resumes the user doesn't own
- Priority: Medium

**ScoringService — No Tests:**
- What's not tested: HTTP client calls to Python scorer, error handling, timeout behavior
- Files: `resume-screening-api/app/Services/ScoringService.php`
- Risk: Scoring silently returns 0.0 on failure, corrupting candidate rankings
- Priority: High

**DashboardController — No Tests:**
- What's not tested: Role-based data isolation, avg_score calculation with no data
- Files: `resume-screening-api/app/Http/Controllers/Api/DashboardController.php`
- Risk: HR users could see admin-level stats
- Priority: Medium

---

*Concerns audit: 2026-07-18*
