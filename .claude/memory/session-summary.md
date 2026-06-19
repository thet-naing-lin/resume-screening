# Session Summary — Resume Screening Project

## Reviews Completed

### Front-End (React + Vite + Tailwind)
- **Critical**: Duplicate property in `EditJob.jsx:94` (`experience_years` set twice), stray `` `` `` in `App.jsx:10`, `ProtectedRoute` only checks token existence not validity
- **Medium**: 3 `useEffect` missing dependency arrays (`BulkMailModal`, `SendMailModal`, `AiInsightsModal`), no client-side password match check, hard 401 redirect loses unsaved work, unused `react-hook-form`/`zod` in package.json, demo credentials in `Login.jsx`
- **Minor**: Inconsistent design tokens (rounded-xl vs rounded-2xl, indigo vs blue), duplicated CSV export logic, duplicated `Field` component, inline SVG sprawl (lucide-react already installed), no error boundary, `App.css` is unused Vite template CSS

### Back-End (Laravel 13 + Sanctum + Spatie Permissions + Python Flask scorer)
- **Critical**: `.env` with 3 live secrets on disk (Gmail app passwords, Gemini API key, Google OAuth secret), tests reference `ResumeScore`/`ResumeScoreFactory` which don't exist (model is `Score`), `ResumeControllerTest` uses `'resume'` instead of `'resume_files'`, `CandidateRankingControllerTest` missing required `job_description_id` param, no ownership check on job update/delete
- **Medium**: Role name inconsistency (`hr` vs `hr_recruiter`), `sleep(2)` in synchronous bulk mail (blocks HTTP response), duplicate `AuditLogService` (dead code — all code uses `AuditLogger`), no rate limiting on login, Gemini prompt injection risk, Google OAuth uses `'user.login'` instead of `'auth.login'`
- **Minor**: `ResumeUploadTest.php` entirely commented out, Python scorer port mismatch in `.env.example`, `requirements.txt` has duplicate/commented packages, redundant `ini_set('memory_limit')` in job, `CandidateRankingResource` references `extracted_skills` which doesn't exist on candidates table

### Priority Action Items
1. Rotate exposed credentials (.env)
2. Fix ResumeScore → Score in tests
3. Fix resume field name in controller tests
4. Add job_description_id param to ranking test
5. Standardize role names (hr vs hr_recruiter)
6. Add ownership check to job update/delete
7. Remove sleep(2), use queued mail
8. Add rate limiting to login/forgot-password
9. Delete AuditLogService.php (dead code)
10. Fix Google OAuth action name to auth.login

## Skills Created

- `.claude/skills/test-fixer/SKILL.md` — Diagnoses test failures, triages into categories (wrong model name, wrong field name, real bug), fixes one file at a time, re-runs until green

## Discussion: Agents vs Skills

- No agents infrastructure exists yet (.claude/agents/ is empty)
- Skills are the simplest mechanism — one SKILL.md file, no new dependencies
- Agents = separate sub-sessions with fresh context
- Workflows = orchestrate multiple agents in parallel
- Recommendation: create as Skills first, upgrade to Agents only when you need parallel execution or isolated context

## Suggested Future Agents/Skills
1. `resume-pipeline` — Debugger for the upload→parse→score→AI pipeline
2. `role-isolation-checker` — Audit authorization across controllers
3. `test-fixer` — **CREATED**
4. `api-contract-checker` — Validate frontend expectations against API responses
5. `seeder-maintainer` — Maintain demo data seeders
