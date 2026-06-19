---
name: frontend-code-review
description: Reviews frontend code for component architecture, state
  management, performance, accessibility, styling, testing, security, and
  maintainability. Trigger when user says "review the frontend", "code review
  frontend", "review my UI code", "review the front-end code" or "check the frontend code".
---

## Review Approach

Review the frontend layer systematically. Start with the component tree (pages →
features → shared), then state management, then styling, then routing, then
testing, then config/build tooling. Read every file; don't skim.

If a framework is obvious from the code (React, Vue, Angular, Svelte, etc.),
apply that framework's conventions. If unclear, default to React patterns.

## Review Framework

### 1. Component Architecture

**For each component, check:**

- **Single Responsibility** — Does the component do ONE thing? A component over
  250 lines likely has too many responsibilities. Flag god components and
  suggest splitting into container/presentational pairs or smaller sub-components.
- **Props drilling** — Is a prop passed through 3+ layers of components that
  don't use it? Suggest context, composition (children/slots), or a state
  management solution.
- **Conditional rendering** — Are there chains of ternary operators or nested
  `&&` conditions that hurt readability? Suggest extracting to named variables,
  early returns, or a dedicated sub-component.
- **Key usage in lists** — Are `key` props stable and unique? Flag `index` as
  key when items can be reordered, added, or removed.
- **useEffect / lifecycle usage** — Check for: missing cleanup (subscriptions,
  timers, event listeners), missing dependency arrays, infinite re-render
  potential, derived state that should be computed during render instead.
- **Refs vs state** — Is mutable data that doesn't need re-render stored in
  state? Is DOM measurement properly using refs + callbacks?
- **Lazy loading** — Are large/heavy components below the fold lazy-loaded with
  `React.lazy` / dynamic imports? Are route-level code splits in place?

### 2. State Management

- **State placement** — Is state at the right level? Local component state vs
  lifted vs global. Flag state that lives too high (causing unnecessary
  re-renders) or too low (causing prop drilling).
- **Server vs client state** — Is server data going through a caching layer
  (React Query, SWR, Apollo) rather than being manually copied into local state?
  Flag manual `useState` + `useEffect` for data fetching.
- **Derived state** — Is data being duplicated in state when it could be derived
  from existing state/props? Every redundant `useState` is a source of bugs.
- **Store structure** — For global stores (Redux, Zustand, Pinia): is the store
  flat and normalized? Are there deeply nested objects that cause selector
  complexity?
- **State update patterns** — Are there mutations of objects/arrays that should
  be immutable? Flag direct state mutation.

### 3. Performance

- **Memoization** — Is `useMemo`/`useCallback` used where needed (expensive
  computations, stable references passed to memo'd children)? Is it over-used
  (wrapping cheap operations, primitives)?
- **Re-render analysis** — Are there components that re-render when their props
  haven't changed? Check for inline object/array/function props that break
  `React.memo`.
- **Virtualization** — For lists over ~100 items, is virtualization
  (react-window, virtuoso) used?
- **Image optimization** — Are images using `loading="lazy"`, proper sizes/srcset,
  modern formats (webp/avif)? Are there unoptimized hero images blocking LCP?
- **Bundle size** — Are there heavy imports that could be tree-shaken or
  dynamically imported? Check for moment.js (use date-fns/dayjs), lodash
  whole-package imports (use `lodash/get`), unused icon libraries.
- **Network waterfalls** — Are there sequential data fetches that could
  parallelize? Does a parent block rendering until its data loads, delaying
  children that fetch independently?

### 4. Accessibility (a11y)

- **Semantic HTML** — Are `div`/`span` used where `button`, `nav`, `main`,
  `article`, `section`, `header`, `aside` belong? Flag divs with onClick but
  no role, tabIndex, or keyboard handler.
- **Labels and descriptions** — Do form inputs have associated `<label>` (htmlFor
  or wrapping)? Do icon-only buttons have `aria-label`? Do images have
  meaningful `alt` text (including empty `alt=""` for decorative)?
- **Keyboard navigation** — Can all interactive elements be reached and operated
  via keyboard? Are focus outlines visible (no `outline: none` without a
  replacement)? Is tab order logical?
- **ARIA** — Are ARIA attributes used correctly? Flag: `aria-*` on elements
  where the semantic HTML equivalent works, missing `aria-expanded` on toggles,
  missing `aria-controls`, `role` values that conflict with native semantics.
- **Color and contrast** — Are there hardcoded colors that could fail contrast
  requirements? Is information conveyed by color alone (errors, status)?
- **Screen reader text** — Is there visually hidden text for context that
  sighted users get from layout? Are live regions (`aria-live`, `role="alert"`,
  `role="status"`) used for dynamic content updates?
- **Focus management** — On route change, does focus move to the new content?
  When a modal opens, is focus trapped inside? When it closes, does focus
  return to the trigger?

### 5. Styling & CSS

- **Approach consistency** — Is the styling approach consistent across the
  project (CSS Modules, Tailwind, styled-components, etc.)? Flag mixed
  approaches in the same component.
- **Responsive design** — Do layouts work at mobile, tablet, and desktop
  breakpoints? Are there hardcoded pixel widths that break responsiveness?
  Check for missing min/max-width constraints.
- **Magic numbers** — Are there arbitrary pixel values for layout (negative
  margins, large absolute positioning offsets)? Suggest using the design
  system's spacing scale.
- **CSS specificity wars** — Are there deeply nested selectors, `!important`
  usage, or inline styles that override stylesheet rules?
- **Design token usage** — Are colors, spacing, typography, and shadows using
  CSS custom properties or design tokens, or hardcoded repeatedly?
- **Layout approach** — Is the layout using modern CSS (flexbox/grid) rather
  than float-based or excessive absolute positioning?

### 6. Error Handling & Edge Cases

- **Loading states** — Does every async operation handle loading? Are there
  skeleton screens or spinners rather than blank pages?
- **Error states** — Does every async operation handle errors? Are errors shown
  to the user in a friendly way? Are there error boundaries at key split points?
- **Empty states** — When a list/table/search has zero results, is there a
  meaningful empty state message, or just a blank area?
- **Network failures** — Are API calls wrapped with retry logic or at least
  user-visible error messages? Are there offline-aware patterns?
- **Edge cases** — Very long strings (does the UI overflow?), very short strings
  (empty state confusion?), special characters (XSS risks?), null/undefined
  data (crashes with "Cannot read property of undefined"?).
- **Race conditions** — If a user clicks "Save" twice quickly, does it
  double-submit? Are stale responses handled (e.g., ignoring results from a
  previous request if a new one was fired)?

### 7. Security

- **XSS** — Is user-generated content rendered safely? Flag `dangerouslySetInnerHTML`
  without sanitization, `innerHTML` usage, or `v-html` without escaping.
- **Input sanitization** — Is form input sanitized before display? Are URLs
  validated before being used in links/images?
- **Sensitive data** — Are API keys, tokens, or secrets hardcoded in the
  frontend? Are access tokens stored in httpOnly cookies (preferred) or
  localStorage (acceptable with understanding of XSS risk)?
- **Authentication guards** — Are protected routes behind an auth check that
  runs on the server or at least redirects? Are there client-only guards that
  briefly flash protected content?
- **CSP readiness** — Are there inline scripts or styles that would break under
  a Content Security Policy?

### 8. Testing

- **Coverage gaps** — Are critical user flows covered by tests? Are utility
  functions tested? Are there tests for error and edge-case states, not just
  happy paths?
- **Test quality** — Do tests test behavior (what the user sees/does) rather
  than implementation (internal state, method names)? Are there tests that pass
  regardless of correctness (e.g., `expect(true).toBe(true)`)?
- **Mocking** — Are mocks at the right boundary? Over-mocking (mocking
  everything) makes tests brittle; under-mocking (real API calls in unit tests)
  makes them slow and flaky.
- **Selector resilience** — Do tests use fragile selectors (`nth-child`,
  overly specific CSS paths, test IDs that match component internals)? Prefer
  accessible selectors (role, label, text content) or dedicated `data-testid`.

### 9. Routing & Navigation

- **Route structure** — Are routes RESTful and logical? No deeply nested
  parameter spaghetti. Are there catch-all / 404 routes?
- **Guards and redirects** — Are auth guards consistent across protected route
  groups? Are there redirect loops possible?
- **Query parameters** — Are filter/sort/pagination state in the URL
  (shareable, back-button friendly) rather than component-only state?
- **Scroll restoration** — Does navigation preserve expected scroll behavior?
  Does a route change scroll to top when it should?

### 10. Build & Config

- **Environment variables** — Are env vars prefixed consistently (e.g.,
  `NEXT_PUBLIC_*`, `VITE_*`, `REACT_APP_*`)? Are there secrets in
  non-prefixed vars that would leak to the client?
- **Dead code** — Are there commented-out blocks of JSX, unused imports, or
  abandoned feature flags?
- **Console statements** — Are there leftover `console.log` / `debugger`
  statements that should be removed?
- **Dependencies** — Are there unused dependencies in package.json? Are there
  duplicates (same package at different versions)? Are there deprecated
  packages with known vulnerabilities?

## Output Format

Structure the review as:

1. **Overall Assessment** — One paragraph summarizing the frontend's health.
   Mention the framework, the overall architecture, and the top 1-2 themes.
2. **Findings by Severity** — High / Medium / Low
   - Each finding: what, which files & lines, why it matters, how to fix
   - Include code examples for the fix when helpful
3. **Positive Observations** — What's done well. Be specific: which patterns,
   which components, which decisions.
4. **Priority Action Items** — Ranked list of what to fix first, ordered by
   impact (user-facing bugs > security > performance > maintainability)
