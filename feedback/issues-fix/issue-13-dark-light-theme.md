# Issue #13 — Dark/Light Theme Toggle

**GitHub:** [#13 Inconsistent theme — login page is dark, other pages are light](https://github.com/thet-naing-lin/resume-screening/issues/13)
**Label:** enhancement
**Status:** Closed

## Problem

The login page used a dark theme while all other pages were light-only. There was no way for users to switch themes, creating a jarring visual inconsistency.

## Root Cause

The login page had hardcoded dark colors (`bg-surface-950`, white text), while all dashboard pages used only light-mode Tailwind classes with no `dark:` variants.

## Fix

**Commit:** `5ea39e8` — feat: implement dark/light theme toggle with full dark mode support

### 1. Theme Store (`src/store/themeStore.js`)

Created a Zustand store that:
- Reads initial theme from `localStorage` (key: `theme`)
- Falls back to `prefers-color-scheme: dark` system preference
- Toggles between `"light"` and `"dark"` by adding/removing the `dark` class on `<html>`
- Persists the choice to `localStorage`

### 2. Tailwind Configuration

Enabled `darkMode: "class"` in `tailwind.config.js` so dark mode is toggled by the `dark` class on the root element rather than media queries.

### 3. Theme Toggle Button (`src/components/layout/Header.jsx`)

Added a sun/moon icon button in the header that calls `toggleTheme()`. The icon swaps based on current theme state.

### 4. Dark Mode Classes Across All Pages

Added `dark:` variants to every component and page:

| Area | Key Changes |
|------|-------------|
| `index.css` | Dark scrollbar, selection color, all component classes (`.btn-primary`, `.input-field`, `.table-card`, `.stat-card`, etc.) |
| Dashboard | Stat cards, quick actions, recent activity, welcome banner |
| Jobs | List table, create/edit forms, view page |
| Resumes | List table, upload form |
| Candidates | Ranking table, AI insights modal, send mail modal, bulk mail modal |
| Admin | User management, audit logs |
| Reports | Export page |
| Layout | Sidebar, header, dashboard layout |

### 5. Login Page

The login page already had dark styling. It was updated to support both themes — the dark glass-morphism card works in both modes, and background orbs adapt to the active theme.

### Files Changed

- `src/store/themeStore.js` — New Zustand store for theme state
- `tailwind.config.js` — Enabled `darkMode: "class"`
- `src/index.css` — Dark variants for all base/component styles
- `src/components/layout/Header.jsx` — Theme toggle button
- All page components — Added `dark:` classes throughout

## Verification

- Toggle theme in header → entire app switches
- Refresh page → theme persists from `localStorage`
- New session → defaults to system preference
- Login page → consistent with dashboard theme
