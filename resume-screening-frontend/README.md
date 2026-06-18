# Resume Screening Tool — Frontend

React-based frontend for the Automated Resume Screening Tool. Built as part of a BSc Computing Final Year Project at the University of Roehampton.

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Zustand** for auth state management
- **React Router v6** for navigation
- **Spatie Laravel Permission** roles reflected in UI (admin / hr_recruiter)

## Features

- Email/password login with protected routes
- **Google OAuth login** — "Continue with Google" button on login page
- **Forgot password flow** — request reset link, receive email, set new password
- Job description management (create, edit, delete)
- Bulk resume upload (PDF / DOCX, max 5MB)
- Candidate ranking table with filtering and pagination
- Candidate status management (shortlist / reject / under review)
- **Individual email send modal** — per-candidate with editable subject and body
- **Bulk email send** — one-click send to all shortlisted or all rejected with preview
- AI insights modal (candidate summary + interview questions)
- CSV export of ranked candidates
- Audit logs viewer (admin only)
- User management with create user form (admin only)
- Reports & Export page
- **Role-aware dashboard** — HR sees own stats, admin sees system-wide stats
- **Role-based data isolation** — HR only sees their own resumes and candidates
- Responsive dashboard with live stats

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see backend README)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/resume-screening-frontend.git
cd resume-screening-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Variables

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_AUTH_URL=http://localhost:8000/api/auth/google/redirect
```

### Running the App

```bash
# Development server
npm run dev

# Production build
npm run build
```

App runs at `http://localhost:5173` by default.

## Available Pages

| Route                 | Description                                | Access |
| --------------------- | ------------------------------------------ | ------ |
| `/login`              | Login page (email/password + Google OAuth) | Public |
| `/forgot-password`    | Request password reset email               | Public |
| `/reset-password`     | Set new password via token link            | Public |
| `/dashboard`          | Role-aware stats overview                  | All    |
| `/jobs`               | Job descriptions list                      | All    |
| `/resumes`            | Resume upload & list (role-scoped)         | All    |
| `/candidate-rankings` | Ranked candidates (role-scoped)            | All    |
| `/reports`            | CSV export                                 | All    |
| `/admin/users`        | User management + create user              | Admin  |
| `/admin/audit-logs`   | Audit logs                                 | Admin  |

## Role-Based Access

| Feature                     | HR Recruiter  | Admin         |
| --------------------------- | ------------- | ------------- |
| Login (email/password)      | ✅            | ✅            |
| Login (Google OAuth)        | ✅            | ✅            |
| Forgot / reset password     | ✅            | ✅            |
| Upload resumes              | ✅            | ✅            |
| View own resumes only       | ✅            | ❌ (sees all) |
| View rankings               | ✅ (own only) | ✅ (all)      |
| Generate AI insights        | ✅            | ✅            |
| Send individual email       | ✅            | ✅            |
| Bulk email shortlisted      | ✅ (own only) | ✅ (all)      |
| Bulk email rejected         | ✅ (own only) | ✅ (all)      |
| Export CSV                  | ✅            | ✅            |
| Create users                | ❌            | ✅            |
| Manage users                | ❌            | ✅            |
| View audit logs             | ❌            | ✅            |
| System-wide dashboard stats | ❌            | ✅            |
