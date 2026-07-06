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

## Architecture Notes

- **Frontend** communicates with **Backend** via REST API
- **Backend** processes resumes (PDF/Word) and stores in database
- **Python scorer** handles AI-based resume scoring (separate service)
- Authentication uses Sanctum token-based auth
- Role-based access control via Spatie Permission

## API Endpoints

Backend routes are in `resume-screening-api/routes/`. Main resource routes:
- `/api/roles` - Role management
- `/api/candidates` - Candidate CRUD
- `/api/screening-jobs` - Screening job management
- `/api/resumes` - Resume upload and processing

## Environment Variables

Backend `.env` required:
- `DB_*` - Database connection
- `REDIS_*` - Queue/cache connection
- `SENDGRID_*` - Email service
- `CLAUDE_API_KEY` or similar - AI scoring (if used)

## Common Patterns

- Frontend uses Zustand stores in `src/store/`
- API calls centralized in `src/api/` directory
- Components in `src/components/` (shared) and `src/pages/` (route-specific)
- Backend follows standard Laravel structure: Controllers, Models, Services
