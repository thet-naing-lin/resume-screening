# Codebase Structure

**Analysis Date:** 2026-07-18

## Directory Layout

```
resume-screening/
├── resume-screening-frontend/    # React SPA (Vite + Tailwind)
├── resume-screening-api/         # Laravel 13 backend (PHP 8.3)
├── python-scorer/                # Python Flask scoring service
├── screenshots/                  # UI screenshots
├── feedback/                     # Issue tracking notes
├── slides/                       # Presentation files
├── .claude/                      # Claude skills and agents
├── .planning/                    # Planning documents
├── CLAUDE.md                     # Project instructions
├── DEPLOY.md                     # Deployment guide
├── README.md                     # Project readme
└── API design review and Improvement.md
```

## Directory Purposes

### Frontend (`resume-screening-frontend/`)

**`src/pages/`:**
- Purpose: Route-level page components (one per route)
- Contains: Dashboard, Jobs (CRUD), Resumes, Candidates, Auth, Admin, Reports
- Key files: `src/pages/dashboard/Dashboard.jsx`, `src/pages/candidates/CandidateRankingPage.jsx`

**`src/pages/auth/`:**
- Purpose: Authentication pages
- Contains: Login, Register (disabled), ForgotPassword, ResetPassword, GoogleCallback
- Key files: `src/pages/auth/Login.jsx`, `src/pages/auth/GoogleCallback.jsx`

**`src/pages/jobs/`:**
- Purpose: Job description management pages
- Contains: JobList, CreateJob, EditJob, ViewJob
- Key files: `src/pages/jobs/JobList.jsx`, `src/pages/jobs/CreateJob.jsx`

**`src/pages/resumes/`:**
- Purpose: Resume upload and listing pages
- Contains: UploadResume, ResumeList
- Key files: `src/pages/resumes/UploadResume.jsx`, `src/pages/resumes/ResumeList.jsx`

**`src/pages/candidates/`:**
- Purpose: Candidate ranking and screening pages
- Contains: CandidateRankingPage
- Key files: `src/pages/candidates/CandidateRankingPage.jsx`

**`src/pages/admin/`:**
- Purpose: Admin-only management pages
- Contains: UserManagement, AuditLogsPage
- Key files: `src/pages/admin/UserManagement.jsx`, `src/pages/admin/AuditLogsPage.jsx`

**`src/pages/reports/`:**
- Purpose: Report export pages
- Contains: ReportExportPage
- Key files: `src/pages/reports/ReportExportPage.jsx`

**`src/components/layout/`:**
- Purpose: Shared layout components (sidebar, header, auth guard)
- Contains: DashboardLayout, Sidebar, Header, ProtectedRoute
- Key files: `src/components/layout/DashboardLayout.jsx`, `src/components/layout/Sidebar.jsx`

**`src/components/common/`:**
- Purpose: Shared reusable UI components
- Contains: DeleteModal
- Key files: `src/components/common/DeleteModal.jsx`

**`src/components/candidates/`:**
- Purpose: Candidate-specific modal components
- Contains: AiInsightsModal, SendMailModal, BulkMailModal
- Key files: `src/components/candidates/AiInsightsModal.jsx`

**`src/components/jobs/`:**
- Purpose: Job-specific form components
- Contains: JobFormFields
- Key files: `src/components/jobs/JobFormFields.jsx`

**`src/store/`:**
- Purpose: Zustand global state stores
- Contains: authStore.js, themeStore.js
- Key files: `src/store/authStore.js` (auth state + login/logout actions)

**`src/api/`:**
- Purpose: API client modules (one per domain)
- Contains: axios.js (base), auth.js, jobApi.js, resumeApi.js, candidatesRankingApi.js, candidateApi.js, candidateMailApi.js, dashboardApi.js, userApi.js, auditApi.js
- Key files: `src/api/axios.js` (base instance with interceptors), `src/api/candidatesRankingApi.js`

**`src/hooks/`:**
- Purpose: Custom React hooks
- Contains: useRankings.js
- Key files: `src/hooks/useRankings.js` (fetch and manage ranking data)

**`src/utils/`:**
- Purpose: Utility functions
- Contains: apiCache.js (localStorage cache), preloadRoutes.js (route preloading), helpers.js
- Key files: `src/utils/apiCache.js` (5-minute TTL cache), `src/utils/preloadRoutes.js`

**`src/assets/`:**
- Purpose: Static assets (images, SVGs)
- Contains: hero.png, vite.svg, react.svg

### Backend (`resume-screening-api/`)

**`app/Http/Controllers/Api/`:**
- Purpose: API request handlers (all prefixed with Api namespace)
- Contains: AuthController, JobDescriptionController, ResumeController, CandidateRankingController, AiInsightController, CandidateMailController, DashboardController, UserManagementController, AuditLogController, GoogleAuthController
- Key files: `app/Http/Controllers/Api/ResumeController.php`, `app/Http/Controllers/Api/CandidateRankingController.php`

**`app/Services/`:**
- Purpose: Business logic and external service integration
- Contains: ScoringService (Python scorer client), GeminiService (Google Gemini AI), AuditLogger (audit trail)
- Key files: `app/Services/ScoringService.php`, `app/Services/GeminiService.php`, `app/Services/AuditLogger.php`

**`app/Jobs/`:**
- Purpose: Async queued jobs for heavy operations
- Contains: ProcessResumeJob (PDF/DOCX parsing), ComputeResumeScoreJob (scoring pipeline), SendBulkCandidateMailJob (bulk email)
- Key files: `app/Jobs/ProcessResumeJob.php` (674 lines, most complex), `app/Jobs/ComputeResumeScoreJob.php`

**`app/Models/`:**
- Purpose: Eloquent ORM models with relationships
- Contains: User, JobDescription, Resume, Candidate, Score, AuditLog, Role
- Key files: `app/Models/Resume.php`, `app/Models/Score.php`, `app/Models/User.php`

**`app/Mail/`:**
- Purpose: Email mailable classes
- Contains: InterviewInvitationMail, RejectionNoticeMail
- Key files: `app/Mail/InterviewInvitationMail.php`

**`app/Http/Resources/`:**
- Purpose: API response transformers
- Contains: CandidateRankingResource
- Key files: `app/Http/Resources/CandidateRankingResource.php`

**`app/Http/Requests/`:**
- Purpose: Form request validation classes
- Contains: StoreResumeRequest
- Key files: `app/Http/Requests/StoreResumeRequest.php`

**`app/Providers/`:**
- Purpose: Service providers and boot configuration
- Contains: AppServiceProvider (rate limiters)
- Key files: `app/Providers/AppServiceProvider.php`

**`routes/`:**
- Purpose: Route definitions
- Contains: api.php (all API routes)
- Key files: `routes/api.php`

**`database/migrations/`:**
- Purpose: Database schema definitions
- Contains: users, cache, jobs, personal_access_tokens, job_descriptions, candidates, resumes, scores, audit_logs, interview_questions, permission_tables
- Key files: `database/migrations/2026_04_09_172043_create_resumes_table.php`, `database/migrations/2026_04_09_172059_create_scores_table.php`

**`config/`:**
- Purpose: Laravel configuration files
- Contains: app.php, auth.php, cache.php, cors.php, database.php, filesystems.php, logging.php, mail.php, permission.php, queue.php, sanctum.php, services.php, session.php

**`tests/`:**
- Purpose: PHPUnit test suites
- Contains: Feature/, Unit/, TestCase.php

### Python Scorer (`python-scorer/`)

**Root files:**
- Purpose: Scoring microservice
- Contains: app.py (Flask app), requirements.txt, Dockerfile, render.yaml, runtime.txt
- Key files: `app.py` (140 lines, all scoring logic)

## Key File Locations

**Entry Points:**
- `resume-screening-frontend/src/main.jsx`: Frontend entry (React root render)
- `resume-screening-frontend/src/App.jsx`: Frontend router (all route definitions)
- `resume-screening-api/routes/api.php`: Backend API routes
- `python-scorer/app.py`: Python scorer entry (Flask app)

**Configuration:**
- `resume-screening-frontend/vite.config.js`: Vite build config
- `resume-screening-frontend/tailwind.config.js`: Tailwind CSS config
- `resume-screening-frontend/package.json`: Frontend dependencies
- `resume-screening-api/config/services.php`: External service URLs (Python scorer, Gemini)
- `resume-screening-api/config/queue.php`: Queue driver config (Redis)
- `python-scorer/requirements.txt`: Python dependencies

**Core Logic:**
- `resume-screening-api/app/Jobs/ProcessResumeJob.php`: Resume parsing pipeline (PDF/DOCX extraction, text cleaning, candidate parsing)
- `resume-screening-api/app/Jobs/ComputeResumeScoreJob.php`: Scoring pipeline (TF-IDF + Semantic)
- `resume-screening-api/app/Services/ScoringService.php`: Python scorer HTTP client
- `resume-screening-api/app/Services/GeminiService.php`: Google Gemini AI client
- `resume-screening-frontend/src/store/authStore.js`: Authentication state management
- `resume-screening-frontend/src/utils/apiCache.js`: Client-side API response caching

## Naming Conventions

**Frontend Files:**
- Pages: PascalCase.jsx (e.g., `CandidateRankingPage.jsx`, `UploadResume.jsx`)
- Components: PascalCase.jsx (e.g., `DashboardLayout.jsx`, `AiInsightsModal.jsx`)
- Stores: camelCase.js (e.g., `authStore.js`, `themeStore.js`)
- API modules: camelCase.js (e.g., `jobApi.js`, `candidatesRankingApi.js`)
- Hooks: camelCase.js prefixed with "use" (e.g., `useRankings.js`)
- Utils: camelCase.js (e.g., `apiCache.js`, `preloadRoutes.js`)

**Backend Files:**
- Controllers: PascalCaseController.php (e.g., `ResumeController.php`, `CandidateRankingController.php`)
- Services: PascalCase.php (e.g., `ScoringService.php`, `GeminiService.php`)
- Jobs: PascalCaseJob.php (e.g., `ProcessResumeJob.php`, `ComputeResumeScoreJob.php`)
- Models: PascalCase.php (e.g., `Resume.php`, `Score.php`)
- Migrations: snake_case.php with timestamp prefix (e.g., `2026_04_09_172043_create_resumes_table.php`)

**Directories:**
- Frontend: kebab-case for pages categories (e.g., `candidate-rankings/`), but actual implementation uses flat directories (e.g., `candidates/`, `auth/`, `jobs/`)
- Backend: PascalCase for app directories (e.g., `Controllers/`, `Services/`, `Jobs/`)

## Where to Add New Code

**New Page/Route:**
- Page component: `resume-screening-frontend/src/pages/{domain}/NewPage.jsx`
- Add lazy import and route in `resume-screening-frontend/src/App.jsx`
- Add nav link in `resume-screening-frontend/src/components/layout/Sidebar.jsx`
- Add preload in `resume-screening-frontend/src/utils/preloadRoutes.js`

**New API Endpoint:**
- Controller method: `resume-screening-api/app/Http/Controllers/Api/ExistingController.php` (or new controller)
- Route definition: `resume-screening-api/routes/api.php`
- Form request: `resume-screening-api/app/Http/Requests/NewRequest.php` (if complex validation)

**New Backend Service:**
- Service class: `resume-screening-api/app/Services/NewService.php`
- Register in `resume-screening-api/app/Providers/AppServiceProvider.php` if needed

**New Background Job:**
- Job class: `resume-screening-api/app/Jobs/NewJob.php`
- Dispatch from controller: `NewJob::dispatch($model)`

**New API Module (Frontend):**
- API module: `resume-screening-frontend/src/api/newDomainApi.js`
- Import base axios: `import api from "./axios"`
- Use cache: `import { withCache, clearCacheByPattern } from "../utils/apiCache"`

**New Zustand Store:**
- Store file: `resume-screening-frontend/src/store/newStore.js`
- Import: `import { create } from "zustand"`

**New Database Table:**
- Migration: `resume-screening-api/database/migrations/YYYY_MM_DD_HHMMSS_create_table_name_table.php`
- Model: `resume-screening-api/app/Models/NewModel.php`

**New Test:**
- Feature test: `resume-screening-api/tests/Feature/NewFeatureTest.php`
- Unit test: `resume-screening-api/tests/Unit/NewUnitTest.php`

## Special Directories

**`resume-screening-frontend/dist/`:**
- Purpose: Vite production build output
- Generated: Yes
- Committed: Yes (for deployment)

**`resume-screening-api/vendor/`:**
- Purpose: Composer dependencies
- Generated: Yes
- Committed: No

**`resume-screening-frontend/node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`resume-screening-api/storage/`:**
- Purpose: Laravel storage (logs, cache, uploaded files)
- Generated: Yes
- Committed: No (except structured subdirectories)

**`python-scorer/venv/`:**
- Purpose: Python virtual environment
- Generated: Yes
- Committed: No

**`screenshots/`:**
- Purpose: UI screenshots for documentation
- Generated: No
- Committed: Yes

**`feedback/`:**
- Purpose: Issue tracking and feedback notes
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-07-18*
