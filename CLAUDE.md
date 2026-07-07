# Resume Screening System

AI-powered resume screening tool for comparing candidates against job requirements.

## Project Structure

```
resume-screening/
├── resume-screening-frontend/  # React frontend (Vite)
├── resume-screening-api/       # Laravel 13 backend (PHP 8.3)
├── python-scorer/              # Python scoring service
└── screenshots/                # UI screenshots
```

## Tech Stack

### Frontend (`resume-screening-frontend/`)
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS 3
- **State**: Zustand
- **Forms**: React Hook Form + Zod validation
- **UI**: Headless UI, Lucide React icons
- **Routing**: React Router DOM 7

### Backend (`resume-screening-api/`)
- **Framework**: Laravel 13 (PHP 8.3)
- **Auth**: Laravel Sanctum (API tokens)
- **Permissions**: Spatie Laravel Permission
- **PDF Parsing**: smalot/pdfparser
- **Word Docs**: phpoffice/phpword
- **Queue**: Redis (Predis)
- **Email**: SendGrid

## Key Commands

### Frontend
```bash
cd resume-screening-frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

### Backend
```bash
cd resume-screening-api
composer dev      # Full dev stack (server + queue + logs + vite)
composer test     # Run PHPUnit tests
php artisan serve # API server only
```

### Python Scorer
```bash
cd python-scorer
python app.py     # Start Flask server on port 10000
```

## Architecture Notes

### Scoring Pipeline
The backend calls the Python scorer for two metrics:
1. **TF-IDF** (`POST /score/tfidf`) — keyword frequency matching
2. **Semantic** (`POST /score/semantic`) — Sentence-BERT embedding similarity

Final score: `0.4 × TF-IDF + 0.6 × Semantic` (normalized to 0–100).

### Role-Based Data Isolation
- **Admin**: sees all data across the system
- **HR**: sees only their own uploaded resumes and created jobs

### Background Jobs
Queue worker handles async tasks (resume processing, email sending). Run with `php artisan queue:listen`.

### AI Insights
Candidate summaries and interview questions generated via Google Gemini API (`GEMINI_API_KEY`).

### Audit Logging
All user actions logged via `AuditLogger::log()` service. Visible to admins at `/admin/audit-logs`.

## API Endpoints

Backend routes are in `resume-screening-api/routes/api.php`. Key routes:
- `/api/auth/*` — Login, logout, password reset, Google OAuth
- `/api/jobs` — Job description CRUD
- `/api/resumes` — Resume upload (rate-limited: 30/hr) and processing
- `/api/candidate-rankings` — Ranked candidate list with filters and CSV export
- `/api/resumes/{id}/ai-insights` — AI summary and interview questions (rate-limited: 10/hr)
- `/api/candidates/mail/send-bulk` — Bulk email (rate-limited: 10/hr)
- `/api/admin/users` — User management (admin only)
- `/api/admin/audit-logs` — Audit logs (admin only)

## Environment Variables

Backend `.env` required:
- `DB_*` — Database connection (MySQL)
- `REDIS_*` — Queue/cache connection
- `PYTHON_SCORER_URL` — Python scorer service URL (default: `http://127.0.0.1:5001`)
- `GEMINI_API_KEY` — Google Gemini API key for AI insights
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `SENDGRID_API_KEY` — Email service
- `FRONTEND_URL` — Frontend URL for CORS

Frontend `.env`:
- `VITE_API_URL` — Backend API base URL

## Common Patterns

- Frontend uses Zustand stores in `src/store/`, API calls in `src/api/`
- Components in `src/components/` (shared) and `src/pages/` (route-specific)
- Backend services in `app/Services/` (ScoringService, GeminiService, AuditLogger)
- Models use Spatie Permission traits for role-based access
- Controllers enforce data isolation via query scopes based on authenticated user's role
