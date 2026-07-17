# Issue #12 — Logout Loading Animation

**GitHub:** [#12 Logout issue](https://github.com/thet-naing-lin/resume-screening/issues/12)
**Label:** bug
**Status:** Closed

## Problem

Clicking the logout button gave no visual feedback. The user didn't know if the click was registered until the page redirected after a delay.

## Root Cause

The logout handler in `Header.jsx` called `logout()` and `navigate("/login")` without any loading state management. The button remained enabled and static throughout the process.

## Fix

**Commit:** `5ea39e8` — added as part of the theme toggle PR

Added a `isLoggingOut` state to the Header component:

1. **Button disable** — The logout button is disabled while `isLoggingOut` is true, preventing double-clicks.
2. **Spinner animation** — A rotating SVG spinner replaces the logout icon during the process.
3. **Text change** — Button text changes from "Logout" to "Logging out..." (visible on `sm:` and above).
4. **Error recovery** — If `logout()` throws, `isLoggingOut` resets to `false` so the user can retry.

### Files Changed

- `src/components/layout/Header.jsx` — Added `useState` for `isLoggingOut`, updated `handleLogout` to set/clear the state, conditionally render spinner and text.

## Verification

- Click logout → spinner appears, button is disabled
- On success → redirects to `/login`
- On failure → button re-enables, user can retry
