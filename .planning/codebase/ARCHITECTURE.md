<!-- refreshed: 2026-07-18 -->
# Architecture

**Analysis Date:** 2026-07-18

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Frontend (React SPA)                                │
│  resume-screening-frontend/                                                 │
│  ┌─────────────┬──────────────┬──────────────┬──────────────┬─────────────┐ │
│  │   Pages     │  Components  │   Stores     │    API       │   Utils     │ │
│  │ (Routes)    │ (UI Pieces)  │ (Zustand)    │ (Axios)      │ (Cache)     │ │
│  └──────┬──────┴──────┬───────┴──────┬───────┴──────┬───────┴──────┬──────┘ │
│         │             │              │              │              │         │
│         └─────────────┴──────────────┴──────┬───────┴──────────────┘         │
│                                             │                               │
│                                      VITE_API_URL                           │
│                                    (HTTP/REST API)                          │
└─────────────────────────────────────────────┼───────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Backend (Laravel 13 PHP 8.3)                              │
│  resume-screening-api/                                                      │
│  ┌──────────────┬───────────────┬──────────────┬──────────────────────────┐ │
│  │ Controllers  │   Services    │    Jobs      │       Models             │ │
│  │ (API Layer)  │ (Business)    │ (Queue)      │  (Eloquent ORM)          │ │
│  └──────┬───────┴───────┬───────┴──────┬───────┴──────────┬───────────────┘ │
│         │               │              │                   │                 │
│         └───────────────┴──────┬───────┴───────────────────┘                 │
│                                │                                            │
│                   ┌────────────┴────────────────┐                           │
│                   │    MySQL Database            │                           │
│                   │    + Redis Queue              │                           │
│                   └────────────┬────────────────┘                           │
│                                │                                            │
│                    ┌───────────┴────────────┐                               │
│                    │   External Services     │                               │
│                    │  • Python Scorer        │                               │
│                    │  • Gemini AI API        │                               │
│                    │  • SendGrid Email       │                               │
│                    └────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Python Scoring Service (Flask)                               │
│  python-scorer/                                                             │
│  ┌──────────────────────┬──────────────────────────┐                        │
│  │  TF-IDF Endpoint     │  Semantic Endpoint        │                        │
│  │  /score/tfidf        │  /score/semantic          │                        │
│  │  (scikit-learn)      │  (Sentence-BERT)          │                        │
│  └──────────────────────┴──────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Frontend SPA | UI rendering, routing, state management | `resume-screening-frontend/src/` |
| Laravel API | Business logic, auth, data access | `resume-screening-api/app/` |
| Python Scorer | ML-based resume-job matching | `python-scorer/app.py` |
| MySQL | Persistent data storage | Config: `resume-screening-api/config/database.php` |
| Redis | Queue worker for async jobs | Config: `resume-screening-api/config/queue.php` |

## Pattern Overview

**Overall:** Three-tier architecture with async job processing

**Key Characteristics:**
- Frontend is a pure SPA (React + Vite) communicating via REST API
- Backend follows standard Laravel MVC with Service layer for business logic
- Heavy operations (resume parsing, scoring, bulk email) are dispatched as queued jobs
- Python scoring service is a separate microservice called via HTTP
- Role-based data isolation enforced at controller level (admin sees all, HR sees own)

## Layers

**Frontend Presentation Layer:**
- Purpose: UI rendering and user interaction
- Location: `resume-screening-frontend/src/`
- Contains: React components, pages, layout
- Depends on: Zustand stores, API modules
- Used by: End users via browser

**Frontend State Layer:**
- Purpose: Global state management (auth, theme)
- Location: `resume-screening-frontend/src/store/`
- Contains: Zustand stores (authStore.js, themeStore.js)
- Depends on: API modules
- Used by: Components throughout the app

**Frontend API Layer:**
- Purpose: HTTP client abstraction with caching
- Location: `resume-screening-frontend/src/api/`
- Contains: Axios instance, API modules per domain, cache utility
- Depends on: axios.js (base instance)
- Used by: Stores and components

**Backend API Layer:**
- Purpose: HTTP request handling, validation, response formatting
- Location: `resume-screening-api/app/Http/Controllers/Api/`
- Contains: Controllers (Auth, Jobs, Resumes, Rankings, AI, Mail, Dashboard, Users, Audit)
- Depends on: Services, Models, Jobs
- Used by: Frontend via REST

**Backend Service Layer:**
- Purpose: Business logic, external API integration
- Location: `resume-screening-api/app/Services/`
- Contains: ScoringService, GeminiService, AuditLogger
- Depends on: Laravel HTTP client, Models
- Used by: Controllers and Jobs

**Backend Job Layer:**
- Purpose: Async processing for heavy operations
- Location: `resume-screening-api/app/Jobs/`
- Contains: ProcessResumeJob, ComputeResumeScoreJob, SendBulkCandidateMailJob
- Depends on: Services, Models
- Used by: Controllers (dispatched)

**Backend Model Layer:**
- Purpose: Database access and relationships
- Location: `resume-screening-api/app/Models/`
- Contains: User, JobDescription, Resume, Candidate, Score, AuditLog, Role
- Depends on: Laravel Eloquent ORM
- Used by: Controllers, Services, Jobs

**Scoring Microservice:**
- Purpose: ML-based text similarity scoring
- Location: `python-scorer/app.py`
- Contains: Flask app with TF-IDF and Semantic endpoints
- Depends on: scikit-learn, sentence-transformers, PyTorch
- Used by: Backend ScoringService via HTTP

## Data Flow

### Primary Request Path (Resume Processing)

1. User uploads resume via frontend (`resume-screening-frontend/src/pages/resumes/UploadResume.jsx`)
2. Frontend calls `POST /api/resumes` (`resume-screening-frontend/src/api/resumeApi.js`)
3. `ResumeController::store()` validates, saves file to private storage, creates DB record (`resume-screening-api/app/Http/Controllers/Api/ResumeController.php:42`)
4. `ProcessResumeJob::dispatch()` queued for async processing (`resume-screening-api/app/Jobs/ProcessResumeJob.php`)
5. Job extracts text from PDF/DOCX, parses candidate info, upserts Candidate record (`resume-screening-api/app/Jobs/ProcessResumeJob.php:34`)
6. `ComputeResumeScoreJob::dispatch()` queued after parsing completes (`resume-screening-api/app/Jobs/ComputeResumeScoreJob.php`)
7. Score job calls Python Scorer via `ScoringService` (`resume-screening-api/app/Services/ScoringService.php:22`)
8. Python scorer computes TF-IDF and Semantic scores (`python-scorer/app.py:72`, `python-scorer/app.py:94`)
9. Final score computed: `0.4 * TF-IDF + 0.6 * Semantic` (`resume-screening-api/app/Jobs/ComputeResumeScoreJob.php:53`)
10. Score saved to `scores` table, resume status updated to `scored`

### Candidate Ranking Flow

1. User selects job on frontend (`resume-screening-frontend/src/pages/candidates/CandidateRankingPage.jsx`)
2. Frontend calls `GET /api/candidate-rankings?job_description_id=X` (`resume-screening-frontend/src/api/candidatesRankingApi.js:7`)
3. `CandidateRankingController::index()` queries scored resumes with filters (`resume-screening-api/app/Http/Controllers/Api/CandidateRankingController.php:19`)
4. Results serialized via `CandidateRankingResource` (`resume-screening-api/app/Http/Resources/CandidateRankingResource.php`)
5. Frontend displays ranked table with scores, status badges, action buttons

### AI Insights Flow

1. User clicks "AI Insights" on candidate ranking page
2. Frontend calls `POST /api/resumes/{id}/ai-insights` (`resume-screening-frontend/src/api/resumeApi.js`)
3. `AiInsightController::generate()` calls `GeminiService` (`resume-screening-api/app/Http/Controllers/Api/AiInsightController.php:21`)
4. `GeminiService` sends prompt to Google Gemini API (`resume-screening-api/app/Services/GeminiService.php:23`)
5. Summary and 5 interview questions generated and saved to `scores` table
6. Frontend displays in modal (`resume-screening-frontend/src/components/candidates/AiInsightsModal.jsx`)

**State Management:**
- Auth state: Zustand store with localStorage persistence (`resume-screening-frontend/src/store/authStore.js`)
- Theme state: Zustand store with localStorage persistence (`resume-screening-frontend/src/store/themeStore.js`)
- API responses: Client-side cache with 5-minute TTL (`resume-screening-frontend/src/utils/apiCache.js`)
- Page state: Local `useState` in components (no Redux)

## Key Abstractions

**ProtectedRoute:**
- Purpose: Auth guard wrapper for protected pages
- Examples: `resume-screening-frontend/src/components/layout/ProtectedRoute.jsx`
- Pattern: HOC that checks Zustand auth store, redirects to /login if no token

**DashboardLayout:**
- Purpose: Consistent layout with sidebar, header, and main content area
- Examples: `resume-screening-frontend/src/components/layout/DashboardLayout.jsx`
- Pattern: Wrapper component that pages render inside

**CandidateRankingResource:**
- Purpose: Transform Eloquent models into clean API JSON
- Examples: `resume-screening-api/app/Http/Resources/CandidateRankingResource.php`
- Pattern: Laravel JSON Resource for API response formatting

**AuditLogger:**
- Purpose: Centralized audit logging for all user actions
- Examples: `resume-screening-api/app/Services/AuditLogger.php`
- Pattern: Static `log()` method called from controllers/jobs

**ScoringService:**
- Purpose: Abstract Python scorer HTTP calls
- Examples: `resume-screening-api/app/Services/ScoringService.php`
- Pattern: Service class with timeout handling and error logging

## Entry Points

**Frontend Entry:**
- Location: `resume-screening-frontend/src/main.jsx`
- Triggers: Browser loads index.html
- Responsibilities: Initialize theme, preload routes if logged in, render App

**Frontend Router:**
- Location: `resume-screening-frontend/src/App.jsx`
- Triggers: React Router
- Responsibilities: Route definitions, lazy loading, Suspense boundaries

**Backend API Routes:**
- Location: `resume-screening-api/routes/api.php`
- Triggers: HTTP requests to /api/*
- Responsibilities: Route definitions, middleware application

**Python Scorer Entry:**
- Location: `python-scorer/app.py`
- Triggers: HTTP requests to Flask server
- Responsibilities: TF-IDF and Semantic scoring endpoints

**Queue Worker:**
- Location: Laravel Queue Worker (artisan queue:listen)
- Triggers: Dispatched jobs
- Responsibilities: Process async jobs (resume parsing, scoring, email)

## Architectural Constraints

- **Threading:** Python scorer uses single-threaded CPU mode with `torch.set_num_threads(1)` to minimize memory on small instances (`python-scorer/app.py:29`)
- **Global state:** Python scorer uses module-level `_model` singleton with thread lock for lazy model loading (`python-scorer/app.py:33`)
- **Data isolation:** Controllers enforce `uploaded_by = auth()->id()` for HR role, full access for admin (`resume-screening-api/app/Http/Controllers/Api/ResumeController.php:24`)
- **Rate limiting:** Configured in AppServiceProvider for login (5/min), AI (10/hr), upload (30/hr), bulk-mail (10/hr) (`resume-screening-api/app/Providers/AppServiceProvider.php:28`)

## Anti-Patterns

### Duplicated Role Checks in Controllers

**What happens:** Each controller independently checks `$fullAccessRoles = ['admin', 'super_admin']` and applies data isolation
**Why it's wrong:** Duplicated logic across `ResumeController`, `CandidateRankingController`, `DashboardController`, `CandidateMailController`
**Do this instead:** Extract role-based query scope into a base controller trait or middleware

### No Form Request Validation in Some Controllers

**What happens:** `CandidateRankingController::index()` validates inline instead of using Form Request classes
**Why it's wrong:** Only `StoreResumeRequest` exists; other controllers do inline validation
**Do this instead:** Create dedicated Form Request classes for each endpoint (e.g., `RankingIndexRequest`)

## Error Handling

**Strategy:** Laravel exception handling with JSON responses; Python scorer returns HTTP error codes

**Patterns:**
- Controllers return `response()->json(['message' => '...'], statusCode)` for business errors
- Services catch exceptions and return default values (e.g., `ScoringService` returns `0.0` on failure)
- Jobs catch exceptions, update model status to 'failed', and re-throw for Laravel queue retry
- Frontend catches API errors in try/catch blocks and displays toast notifications (`react-hot-toast`)

## Cross-Cutting Concerns

**Logging:** Laravel Log facade used throughout services and jobs; Python uses standard `logging` module
**Validation:** Laravel Form Requests for some endpoints; inline `$request->validate()` for others
**Authentication:** Laravel Sanctum API tokens; frontend stores token in localStorage and auto-attaches via Axios interceptor (`resume-screening-frontend/src/api/axios.js:12`)
**Authorization:** Spatie Laravel Permission package; role checks via `$user->hasRole()` and `$user->hasAnyRole()`
**Audit Logging:** `AuditLogger::log()` called for all significant actions (login, logout, resume upload/delete, job create/update, candidate status change, AI insights, email sent)

---

*Architecture analysis: 2026-07-18*
