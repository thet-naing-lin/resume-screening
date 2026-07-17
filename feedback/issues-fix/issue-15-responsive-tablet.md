# Issue #15 — Responsive Tablet Design (768px–1024px)

**GitHub:** [#15 Responsive design issues on tablet screens](https://github.com/thet-naing-lin/resume-screening/issues/15)
**Label:** None
**Status:** Open

## Problem

The application treated tablets (768px–1024px) the same as phones. The sidebar was hidden behind a hamburger menu, tables overflowed without hints, filter bars didn't wrap, and layouts didn't adapt to the available screen width.

## Root Cause

The CSS only had responsive breakpoints at `sm:` (640px) and `lg:` (1024px) for layout decisions. Between 768px and 1024px, there were no `md:` breakpoint changes — the sidebar was binary (hidden or visible), and no layout adjustments kicked in.

## Fix

**Commit:** `f0431b8` — feat: add responsive tablet layout for 768px–1024px screens

### 1. Sidebar — Collapsed Icon Rail on Tablets

**File:** `src/components/layout/Sidebar.jsx`

Split the sidebar into three viewport-specific sections:

| Viewport | Behavior |
|----------|----------|
| Below 768px (`md:hidden`) | Hidden overlay sidebar, toggled by hamburger |
| 768px–1024px (`md:flex lg:hidden`) | Collapsed icon rail (68px wide), expands to full width on hover |
| 1024px+ (`hidden lg:flex`) | Full sidebar, always visible |

The tablet rail uses `onMouseEnter`/`onMouseLeave` to toggle between collapsed (icons only) and expanded (icons + labels). Touch users can tap to navigate directly from the icon rail.

### 2. Header — Hamburger Hidden on Tablets

**File:** `src/components/layout/Header.jsx`

Changed hamburger visibility from `lg:hidden` to `md:hidden`. On tablets the icon rail is always visible, so the hamburger is unnecessary.

### 3. CSS Utility Updates

**File:** `src/index.css`

Added `flex-wrap` to three component classes:

| Class | Change |
|-------|--------|
| `.page-header` | Added `flex-wrap gap-3` so title and action buttons stack on narrower screens |
| `.filter-bar` | Added `flex-wrap` so search + filter controls wrap instead of overflowing |
| `.table-card-header` | Added `flex-wrap gap-3` so header title and action buttons wrap |

### 4. Dashboard — 3-Column Stat Cards

**File:** `src/pages/dashboard/Dashboard.jsx`

Changed stat cards grid from `sm:grid-cols-2 xl:grid-cols-4` to `sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4`. On tablets, three stat cards fit in a row instead of two.

### 5. ViewJob — Earlier Two-Column Layout

**File:** `src/pages/jobs/ViewJob.jsx`

Changed the details grid from `lg:grid-cols-3` to `md:grid-cols-3`. The description + skills sidebar now appears side-by-side at 768px instead of waiting for 1024px.

### 6. CandidateRankingPage — Responsive Controls

**File:** `src/pages/candidates/CandidateRankingPage.jsx`

- Job selector: `w-80` → `w-full sm:w-80` (full width on small screens)
- Header action buttons: added `flex-wrap` so Email Shortlisted / Email Rejected / Export CSV buttons wrap on narrower screens

### Files Changed

- `src/components/layout/Sidebar.jsx` — Three-section sidebar (mobile/tablet/desktop)
- `src/components/layout/Header.jsx` — Hamburger hidden at `md:`
- `src/index.css` — Flex-wrap on page-header, filter-bar, table-card-header
- `src/pages/dashboard/Dashboard.jsx` — 3-column stat grid at `md:`
- `src/pages/jobs/ViewJob.jsx` — Two-column layout at `md:` instead of `lg:`
- `src/pages/candidates/CandidateRankingPage.jsx` — Responsive job selector and button wrapping

## Verification

Test at these breakpoints using browser DevTools responsive mode:

| Width | Expected Behavior |
|-------|-------------------|
| 768px | Sidebar shows as icon rail, filter bars wrap, ViewJob shows two columns, stat cards show 3 columns |
| 820px | Same as above, no overflow |
| 900px | Same, tables scroll horizontally with visible content |
| 1024px | Sidebar expands to full width, matches desktop layout |
