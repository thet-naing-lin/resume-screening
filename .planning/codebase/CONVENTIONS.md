# Coding Conventions

**Analysis Date:** 2026-07-18

## Project Overview

This is a multi-service project with a React frontend, Laravel backend, and Python scoring service. Each layer follows its own conventions, but consistency is maintained within each layer.

## Frontend Conventions (`resume-screening-frontend/`)

### Naming Patterns

**Files:**
- React components: PascalCase filenames (e.g., `Dashboard.jsx`, `JobList.jsx`, `ProtectedRoute.jsx`)
- API modules: camelCase with "Api" suffix (e.g., `jobApi.js`, `resumeApi.js`, `candidatesRankingApi.js`)
- Zustand stores: camelCase with "Store" suffix (e.g., `authStore.js`, `themeStore.js`)
- Custom hooks: camelCase with "use" prefix (e.g., `useRankings.js`)
- Utility files: camelCase (e.g., `apiCache.js`, `preloadRoutes.js`)

**Functions:**
- Event handlers: `handle` prefix (e.g., `handleDelete`, `handleLogout`, `handleSubmit`)
- API fetchers: `get` prefix for reads (e.g., `getJobs`, `getRankings`, `getResumes`)
- Async state setters: `set` prefix with descriptive name (e.g., `setDeleteLoading`, `setStatsLoading`)

**Components:**
- Default exports for page-level components
- Named exports for sub-components defined within page files (e.g., `StatCard`, `ActivityItem`, `Badge`)
- Component subdirectories organized by feature: `components/candidates/`, `components/jobs/`, `components/layout/`

**Variables:**
- Constants: UPPER_SNAKE_CASE for config maps (e.g., `EXP_BADGE`, `EMP_BADGE`, `EMPTY_FORM`)
- State variables: camelCase descriptive names (e.g., `deleteTarget`, `filterStatus`, `activeFilters`)
- Boolean state: use descriptive names (e.g., `isLoggingOut`, `jobsLoading`, `exporting`)

### Code Style

**Formatting:**
- ESLint with flat config (`eslint.config.js`)
- Prettier is NOT configured (no `.prettierrc` found)
- Single quotes for strings
- Semicolons used consistently
- Trailing commas in multi-line arrays/objects

**Key ESLint rules:**
```javascript
'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]  // Allow unused vars starting with uppercase or underscore
```

**Linting:**
- Run with `npm run lint`
- Uses `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`

### Import Organization

**Order:**
1. React/core imports
2. Third-party libraries (react-router-dom, react-hot-toast, react-icons)
3. Local components
4. API modules
5. Hooks and stores
6. Utilities

**Pattern:**
```javascript
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlineSomething } from "react-icons/hi2";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJobs, deleteJob } from "../../api/jobApi";
import useAuthStore from "../../store/authStore";
```

**Path Aliases:** None used. All imports use relative paths.

### Component Patterns

**Page Components:**
- Always wrap in `DashboardLayout`
- Use `animate-fade-in` class on main container
- Handle loading, error, and empty states explicitly
- Use `react-hot-toast` for user notifications

**State Management:**
- Global state: Zustand stores in `src/store/`
- Local state: React `useState` within components
- Derived state: computed during render, not stored separately
- Server data fetched via custom hooks or direct API calls in `useEffect`

**API Layer:**
- Central Axios instance with interceptors (`src/api/axios.js`)
- API modules export individual functions, not classes
- Use `withCache()` wrapper for GET requests
- Use `clearCacheByPattern()` after mutations

**Form Handling:**
- Manual state management with `useState` (not React Hook Form in all pages)
- Inline validation with `validate()` functions
- Display validation errors from API response: `err.response?.data?.errors`
- Default form state: `EMPTY_FORM` constant at module level

**Error Handling Pattern:**
```javascript
try {
  setLoading(true);
  const res = await someApiCall();
  // handle success
} catch (err) {
  const message = err.response?.data?.message ?? "Fallback error message.";
  // display to user via toast or state
} finally {
  setLoading(false);
}
```

**Loading States:**
- Boolean state: `loading`, `statsLoading`, `deleteLoading`
- Skeleton screens with `animate-pulse` for loading UI
- Disabled buttons during async operations

### Styling Conventions

**Framework:** Tailwind CSS 3 with dark mode (`class` strategy)

**Design System:**
- Custom color tokens: `brand` (purple tones), `surface` (neutral grays)
- Custom shadows: `shadow-card`, `shadow-elevated`, `shadow-modal`
- Custom animations: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`
- Custom border radius: `rounded-2xl` (16px), `rounded-3xl` (20px)

**Dark Mode:**
- Use `dark:` prefix for all dark variants
- Toggle via `useThemeStore`
- Class-based: `document.documentElement.classList.toggle("dark", ...)`

**Component Styling:**
- Inline Tailwind classes directly on elements
- Reusable badge styles defined as constant maps (e.g., `EXP_BADGE`, `EMP_BADGE`)
- Focus visible ring: `focus-visible:ring-2 focus-visible:ring-brand-500/30`
- Minimum touch target: `min-w-[44px] min-h-[44px]`

### Accessibility

- Use semantic HTML where possible (`<main>`, `<nav>`, `<header>`)
- `aria-label` on icon-only buttons
- `aria-hidden="true"` on decorative icons
- `aria-modal="true"` and `role="dialog"` on modals
- Skip to content link: `<a href="#main-content" className="sr-only focus:not-sr-only ...">`
- Keyboard navigation: Escape key handling on modals and sidebars
- Focus management: `cancelRef?.focus()` on modal mount

### Icons

**Primary:** `react-icons/hi2` (Heroicons v2 outline)
**Secondary:** `react-icons/im` (IcoMoon) for spinners (`ImSpinner9`)
**Pattern:** Import specific icons, never wildcard imports

---

## Backend Conventions (`resume-screening-api/`)

### Naming Patterns

**Files:**
- Controllers: PascalCase with `Controller` suffix (e.g., `JobDescriptionController.php`)
- Services: PascalCase with `Service` suffix (e.g., `ScoringService.php`, `GeminiService.php`)
- Models: PascalCase singular (e.g., `JobDescription.php`, `Resume.php`, `Score.php`)
- Factories: PascalCase with `Factory` suffix (e.g., `JobDescriptionFactory.php`)
- Tests: PascalCase with `Test` suffix (e.g., `JobControllerTest.php`)

**Database:**
- Tables: snake_case plural (e.g., `job_descriptions`, `resumes`, `scores`)
- Columns: snake_case (e.g., `uploaded_by`, `job_description_id`, `tfidf_score`)
- Foreign keys: `{model}_id` pattern (e.g., `user_id`, `resume_id`)

**Routes:**
- RESTful naming: `/api/jobs`, `/api/resumes`, `/api/candidate-rankings`
- Nested resources for sub-actions: `/api/candidate-rankings/{resumeId}/status`
- Prefix groups: `auth`, `admin`

### Code Style

**Formatting:**
- Laravel Pint is a dev dependency (`laravel/pint`)
- 4-space indentation (standard Laravel)
- Single quotes for strings
- PHPDoc blocks for complex methods

**Key Patterns:**

**Controller Structure:**
```php
class JobDescriptionController extends Controller
{
    // Methods: index, show, store, update, destroy
    // Each method:
    // 1. Validate request
    // 2. Execute business logic
    // 3. Return JSON response
    // 4. Log audit event
}
```

**Service Pattern:**
```php
class ScoringService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.python_scorer.url');
    }
}
```

**Response Format:**
```php
return response()->json([
    'message' => 'Success message.',
    'data'    => $result,
], 200);

// Error response
return response()->json([
    'message' => 'Error message.',
], 422);
```

### Validation

**Pattern:** Use `$request->validate()` in controllers, NOT Form Request classes (except `StoreResumeRequest`)

**Rules:**
- Always validate on mutating endpoints (POST, PUT, PATCH)
- Use specific validation rules: `required`, `string`, `max:255`, `in:`
- Return 422 for validation errors (Laravel default)

**Example:**
```php
$validated = $request->validate([
    'title'            => 'required|string|max:255',
    'description'      => 'required|string|min:20',
    'required_skills'  => 'required|array|min:1',
    'experience_level' => 'required|in:junior,mid,senior',
]);
```

### Error Handling

**Pattern:** Try-catch with logging, return appropriate HTTP status

```php
try {
    $response = Http::timeout(30)->post("{$this->baseUrl}/endpoint", $data);
    if ($response->failed()) {
        Log::error('Service failed', [
            'status' => $response->status(),
            'body'   => $response->body(),
        ]);
        return 0.0;
    }
    return $response->json('score', 0);
} catch (\Exception $e) {
    Log::error('Service unreachable: ' . $e->getMessage());
    return 0.0;
}
```

### Audit Logging

**Service:** `App\Services\AuditLogger`

**Pattern:**
```php
AuditLogger::log('action.name', $model, ['metadata_key' => 'value']);
```

**Actions:** `auth.login`, `auth.logout`, `resume.uploaded`, `job.created`, `candidate.status_changed`

### Model Conventions

- Use `$fillable` for mass-assignment protection
- Use `$casts` for JSON columns and type casting
- Use HasFactory trait for all models
- Use Spatie HasRoles trait on User model
- Relationships defined with descriptive method names

### Queue Jobs

- Implement `ShouldQueue` interface
- Set `$tries` and `$timeout` properties
- Use `Dispatchable` trait
- Store constructor arguments with `public` promotion
- Handle exceptions and update model status

### HTTP Client

- Use Laravel `Http` facade (Guzzle under the hood)
- Always set `timeout()` (30s for scoring, 60s for semantic)
- Check `$response->failed()` before accessing data
- Wrap in try-catch for network errors

---

## Python Scorer Conventions (`python-scorer/`)

**Framework:** Flask
**Entry:** `app.py`
**Port:** 10000 (production) or 5001 (development)
**Endpoints:** `POST /score/tfidf`, `POST /score/semantic`

---

*Convention analysis: 2026-07-18*
