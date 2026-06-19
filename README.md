# Resume Screening Tool

Automated resume screening platform that scores candidates against job descriptions using NLP and generates AI-powered insights.

## Architecture

The system is split across three services:

| Service | Path | Stack |
|---------|------|-------|
| Backend API | `resume-screening-api/` | Laravel 13, MySQL, Sanctum |
| Frontend SPA | `resume-screening-frontend/` | React 19, Vite, Tailwind CSS |
| NLP Scorer | `python-scorer/` | Flask, scikit-learn, Sentence-BERT |

### How scoring works

Resumes and job descriptions are sent to the Python NLP service, which computes two scores:

1. **TF-IDF** (40% weight) — keyword-frequency matching
2. **Semantic** (60% weight) — Sentence-BERT embedding similarity via `all-MiniLM-L6-v2`

The weighted final score is normalised to 0–100.

AI insights (candidate summaries and interview questions) are generated via the Google Gemini API.

## Features

- Token-based authentication with Sanctum
- Google OAuth login
- Password reset flow
- Role-based access control: `admin` and `hr`
- Job description CRUD
- Bulk resume upload (PDF/DOCX, max 5MB)
- NLP scoring pipeline via Python microservice
- Candidate ranking with filters, pagination, and status management
- AI-generated candidate summaries and interview questions (Gemini)
- Individual and bulk email to candidates
- CSV export of ranked candidates
- Audit logging of all user actions
- Admin user management and role assignment
- Role-scoped data isolation (HR sees only their own data)
- Dashboard with per-role stats
- Rate limiting on auth, uploads, AI insights, and bulk email

## Requirements

- **PHP** 8.3+
- **Composer** 2.x
- **Node.js** 18+
- **MySQL** 8+
- **Python** 3.9+
- **Redis** (optional, for caching)

## Quick start (local development)

### 1. Backend API

```bash
cd resume-screening-api

# Install PHP dependencies
composer install

# Copy environment file and fill in your values
cp .env.example .env
php artisan key:generate

# Run migrations and seed sample data
php artisan migrate --seed

# Start the dev server + queue worker + Vite (all-in-one)
composer run dev
```

### 2. Python NLP Scorer

```bash
cd python-scorer

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

### 3. Frontend SPA

```bash
cd resume-screening-frontend

# Install JS dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the dev server
npm run dev
```

| Service | Default URL |
|---------|-------------|
| Backend API | `http://localhost:8000` |
| NLP Scorer | `http://127.0.0.1:5001` |
| Frontend | `http://localhost:5173` |

## Configuration

Key environment variables for the backend (`.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_CONNECTION` | Database driver | `mysql` |
| `DB_DATABASE` | Database name | — |
| `QUEUE_CONNECTION` | Queue driver | `database` |
| `PYTHON_SCORER_URL` | NLP service URL | `http://127.0.0.1:5001` |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `GEMINI_API_URL` | Gemini endpoint | — |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `FRONTEND_URL` | Frontend URL (CORS) | `http://localhost:5173` |
| `MAIL_MAILER` | Mail driver | `smtp` |

For the frontend (`.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |
| `VITE_GOOGLE_AUTH_URL` | Google OAuth redirect | `http://localhost:8000/api/auth/google/redirect` |

## Default credentials (after seeding)

- **Admin**: <admin@example.com> / Admin@12345
- **HR**: <hr@example.com> / asdfasdf

## API endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (rate-limited: 5/min) |
| POST | `/api/auth/forgot-password` | Request password reset (3/min) |
| POST | `/api/auth/reset-password` | Reset password (3/min) |

### Protected (requires Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List job descriptions |
| POST | `/api/jobs` | Create job description |
| GET | `/api/resumes` | List uploaded resumes |
| POST | `/api/resumes` | Upload resume(s) (rate-limited: 30/hr) |
| GET | `/api/candidate-rankings` | Get ranked candidates |
| PATCH | `/api/candidate-rankings/{id}/status` | Update candidate status |
| POST | `/api/resumes/{id}/ai-insights` | Generate AI insights (10/hr) |
| POST | `/api/candidates/mail/send-bulk` | Send bulk email (10/hr) |
| GET | `/api/candidate-rankings/export` | Export rankings as CSV |
| GET | `/api/dashboard/stats` | Dashboard statistics |

### Admin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| PATCH | `/api/admin/users/{id}/role` | Assign role |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/audit-logs` | View audit logs |

## Rate limiting

| Limiter | Limit | Applies to |
|---------|-------|------------|
| `login` | 5 per minute | Login endpoint |
| `password-reset` | 3 per minute | Forgot/reset password |
| `ai` | 10 per hour | AI insights generation |
| `upload` | 30 per hour | Resume uploads |
| `bulk-mail` | 10 per hour | Bulk email sends |

## Production deployment

Each service includes production-ready configurations:

- **Backend**: `Dockerfile` and `start.sh` — runs migrations at startup and starts the queue worker alongside the web server. Deployable to any Docker-compatible platform (Render, Fly, etc.).
- **NLP Scorer**: `render.yaml` — configured for Render's free tier with single-worker gunicorn.
- **Frontend**: `vercel.json` — ready for Vercel deployment. Run `npm run build` for a static production build.

## Development

```bash
# Backend — run tests
cd resume-screening-api
composer run test

# Frontend — lint
cd resume-screening-frontend
npm run lint
```

Each service has its own README with detailed setup instructions and architecture notes.

## License

MIT
