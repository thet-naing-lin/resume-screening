# Technology Stack

**Analysis Date:** 2026-07-18

## Languages

**Primary:**
- JavaScript (ES2022+) - Frontend application (`resume-screening-frontend/src/`)
- PHP 8.3 - Backend API (`resume-screening-api/`)
- Python 3.x - Scoring microservice (`python-scorer/`)

**Secondary:**
- SQL - Database queries (Laravel Eloquent ORM)
- Tailwind CSS - Utility-first styling

## Runtime

**Frontend:**
- Node.js (latest LTS recommended)
- Vite 8 dev server / build tool

**Backend:**
- PHP 8.3 CLI / php-fpm
- Laravel 13 artisan

**Python Scorer:**
- Python 3.10+
- Flask WSGI server

**Package Managers:**
- npm (frontend) - Lockfile: `package-lock.json`
- Composer (backend) - Lockfile: `composer.lock`
- pip (python scorer) - No lockfile (requirements.txt)

## Frameworks

**Frontend:**
- React 19.2.4 - UI library
- Vite 8.0.4 - Build tool and dev server
- Tailwind CSS 3.4.19 - CSS utility framework
- React Router DOM 7.14.0 - Client-side routing

**Backend:**
- Laravel 13 (Framework) - PHP MVC framework
- Laravel Sanctum 4.0 - API token authentication
- Spatie Laravel Permission 7.3 - Role-based access control

**Python:**
- Flask 3.1.3 - HTTP microservice framework
- Sentence-Transformers 3.0.1 - Semantic embeddings

**Testing:**
- PHPUnit 12.5.12 (backend)
- ESLint 9.39.4 (frontend)

## Key Dependencies

**Critical:**
- `react` 19.2.4 - Core UI framework
- `axios` 1.15.0 - HTTP client for API calls
- `zustand` 5.0.12 - Lightweight state management
- `react-hook-form` 7.72.1 - Form handling
- `zod` 4.3.6 - Schema validation (with hookform resolvers)
- `@tanstack/react-table` 8.21.3 - Table rendering
- `smalot/pdfparser` 2.12 - PDF resume parsing
- `phpoffice/phpword` 1.4 - Word document parsing
- `sentence-transformers` 3.0.1 - Semantic similarity model

**UI Components:**
- `@headlessui/react` 2.2.10 - Accessible UI primitives
- `lucide-react` 1.8.0 - Icon library
- `react-icons` 5.6.0 - Additional icons (Heroicons)
- `react-hot-toast` 2.6.0 - Toast notifications
- `papaparse` 5.5.3 - CSV parsing/export

**Infrastructure:**
- `predis/predis` 3.4 - Redis PHP client
- `laravel/socialite` 5.26 - OAuth provider integration
- `s-ichikawa/laravel-sendgrid-driver` 4.0 - SendGrid email driver
- `gunicorn` 21.2.0 - Python WSGI server (production)

## Configuration

**Frontend:**
- `vite.config.js` - Vite build config (React plugin)
- `tailwind.config.js` - Tailwind CSS customization
- `.env` - Environment variables (`VITE_API_URL`, `VITE_GOOGLE_AUTH_URL`)

**Backend:**
- `config/services.php` - Third-party service credentials
- `config/database.php` - Database connections (MySQL default)
- `config/queue.php` - Queue connections (Redis/database)
- `config/cors.php` - CORS policy
- `.env` - Environment variables (see below)

**Python Scorer:**
- `requirements.txt` - Python dependencies
- Environment: `PORT` (default 10000), `MODEL_NAME` (default all-MiniLM-L6-v2)

## Environment Variables

**Required Backend (`resume-screening-api/.env`):**
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` - MySQL
- `REDIS_CLIENT`, `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_PORT` - Redis queue/cache
- `PYTHON_SCORER_URL` - Python scorer endpoint (default: `http://127.0.0.1:5001`)
- `GEMINI_API_KEY`, `GEMINI_API_URL` - Google Gemini for AI insights
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` - Google OAuth
- `SENDGRID_API_KEY` - Email service
- `FRONTEND_URL` - Frontend URL for CORS and callbacks
- `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` - Sanctum cookie auth

**Required Frontend (`resume-screening-frontend/.env`):**
- `VITE_API_URL` - Backend API base URL
- `VITE_GOOGLE_AUTH_URL` - Google OAuth URL

## Platform Requirements

**Development:**
- Node.js 18+ / npm 9+
- PHP 8.3+ / Composer 2.x
- Python 3.10+ / pip
- MySQL 8.0+
- Redis 7.0+

**Production:**
- Any Linux hosting (e.g., Render, Railway, Vercel frontend)
- Python scorer runs on port 10000 (CPU-only PyTorch)
- Queue worker: `php artisan queue:listen`

---

*Stack analysis: 2026-07-18*
