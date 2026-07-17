# Issue #14 — Slow Initial Load Time

**GitHub:** [#14 Slow initial load time in production](https://github.com/thet-naing-lin/resume-screening/issues/14)
**Label:** enhancement
**Status:** Closed

## Problem

The production app took too long to load. First-time visitors saw a blank page with no loading indicator, and subsequent visits were equally slow due to no caching.

## Root Cause

- All route components were imported eagerly in `App.jsx`, creating a single large JavaScript bundle
- No API response caching — every page visit triggered fresh network requests
- No preloading strategy after authentication

## Fix

Three commits addressed this in sequence:

### 1. Code Splitting with Lazy Loading

**Commit:** `3a794ed` — fix: implement code splitting with lazy loading for route components

Wrapped every route component in `React.lazy()` with dynamic `import()`:

```jsx
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));
const JobList = React.lazy(() => import("./pages/jobs/JobList"));
// ... all other routes
```

Added a `<Suspense>` wrapper with a skeleton loading fallback so users see a loading state instead of a blank page.

**Result:** The initial bundle is now split into per-route chunks. Only the login page loads immediately; other routes load on demand.

### 2. Route Preloading After Login

**Commit:** `2a418fd` — perf: pre-load route components after login for instant navigation

Created `src/utils/preloadRoutes.js` which dynamically imports all route components:

```js
export function preloadRoutes() {
  return Promise.all([
    import("./pages/dashboard/Dashboard"),
    import("./pages/jobs/JobList"),
    // ... all routes
  ]);
}
```

Called in two places:
- **After successful login** in `authStore.js` — triggers background preload so navigating to dashboard is instant
- **On app load** when a token exists in `localStorage` — ensures returning users get instant navigation

**Result:** After the first page loads, all route chunks are cached by the browser. Subsequent navigation is instant.

### 3. API Response Caching

**Commit:** `c501aff` — perf: add API response caching with 5-minute TTL

Created `src/utils/apiCache.js` — a localStorage-based cache with:

- **5-minute TTL** — stale data is evicted after 5 minutes
- **Per-endpoint keys** — each API call gets a unique cache key based on URL + params
- **Cache invalidation** — mutations (create/update/delete) invalidate relevant cache entries

Applied to all major API calls:

| API Module | Cached Endpoints |
|------------|-----------------|
| `dashboardApi.js` | `getDashboardStats()` |
| `jobApi.js` | `getJobs()`, `getJob(id)` |
| `resumeApi.js` | `getResumes()`, `getResumesByJob(id)` |
| `candidatesRankingApi.js` | `getRankings()` |
| `auditApi.js` | `getAuditLogs()` |
| `userApi.js` | `getUsers()` |

**Result:** After the first load, pages display cached data instantly while a background refetch updates in the stale-while-revalidate pattern.

### Files Changed

- `src/App.jsx` — React.lazy for all route components, Suspense wrapper
- `src/utils/preloadRoutes.js` — New preload utility
- `src/store/authStore.js` — Call preloadRoutes after login
- `src/main.jsx` — Call preloadRoutes on app init
- `src/utils/apiCache.js` — New caching utility
- `src/api/dashboardApi.js` — Cache integration
- `src/api/jobApi.js` — Cache integration
- `src/api/resumeApi.js` — Cache integration
- `src/api/candidatesRankingApi.js` — Cache integration
- `src/api/auditApi.js` — Cache integration
- `src/api/userApi.js` — Cache integration

## Verification

- First visit → loading skeleton shown, then page renders
- After login → navigating to any page is instant (preloaded)
- Second visit within 5 min → pages load from cache instantly
- After creating/editing data → cache invalidated, fresh data fetched
