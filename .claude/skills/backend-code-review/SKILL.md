---
name: backend-code-review
description: >
  Use when the user wants a code review of backend services or server-side
  code, including architecture, code quality, duplication, error handling,
  configuration drift, and maintainability. Covers requests to audit, review,
  or check backend code for issues or improvements. Do not use for frontend
  or UI code reviews, PR descriptions, or deployment issues.
---

## Review Approach

Review the entire backend layer systematically — Services first (they contain the
core logic), then Controllers, then Routes, then Config. Read every file; don't
skim.

## Review Framework

### 1. Services Layer — Core Logic

**For each service, check:**

- **Single Responsibility** — Does the class do ONE thing? A service over 400
  lines likely has too many responsibilities. Flag god classes and suggest
  splits.
- **Constructor dependencies** — Are they injected via constructor promotion or
  resolved inline? Constructor injection is preferred.
- **Duplication** — Same method in multiple services? Same logic copied?
  Highlight the files and line numbers.
- **Error handling** — Does it silently swallow exceptions with `try/catch` +
  `Log::warning`, or does it surface them properly? Silently returning
  `null`/`[]` on catastrophic failures is a bug pattern.
- **Fallback behavior** — Fallbacks are good, but they must be distinguishable
  from "no data." If a method returns the same value for "API failed" and
  "empty result", flag it.
- **Hardcoded values** — Magic strings/numbers that bypass config. Every
  hardcoded default is a future outage.
- **HTTP client patterns** — Check for: explicit timeouts, retry counts, auth
  header handling, response validation. Inconsistent HTTP setup across a
  service class is a smell.
- **Config usage** — Are config keys consistent? Check that different services
  calling the same external API use the SAME config path.

### 2. Controllers Layer — HTTP Boundary

**For each controller, check:**

- **Validation** — Does every `POST`/mutating endpoint use `$request->validate()`?
  Are the rules specific enough?
- **Error response format** — Is it consistent across all actions in the
  controller? Flag if one action returns `{error, message}` and another returns
  `{success, message}`.
- **Status code usage** — 422 for validation, 404 for not-found, 503 for
  external service failure, 500 for internal errors. Flag wrong codes.
- **Controller size** — A controller should be thin (route → validate → delegate
  to service → format response). If a controller has >150 lines or contains
  business logic, flag it.
- **Try/catch consistency** — Are exceptions handled at the right level? All
  actions should wrap external calls in try/catch and return proper error
  responses.

### 3. Routes — API Surface

**Check:**

- **Naming consistency** — Are routes RESTful or RPC-style? Use resource
  naming: `GET /resources, POST /resources/{id}/advice`. Avoid pseudo-RPC:
  `POST /clickup/doc/save`. Flag mixed styles.
- **Grouping** — Are routes for the same resource together? Is the file
  logically organized?
- **Route-to-controller mapping** — Does each route map to a clearly named
  controller method? Flag routes that go to bloated controllers.

### 4. Config Files — External Dependencies

**Check:**

- **Duplicate config blocks** — Same service name appearing twice (e.g., two
  `fabric` blocks). This WILL confuse developers — flag it.
- **Unused keys** — Config keys with no consumers in the codebase.
- **Key naming consistency** — Does the AI/Fabric config live under
  `services.ai.fabric`, `services.fabric`, or both? Pick one.
- **Hardcoded defaults** — Are default values for external service IDs/URLs
  appropriate, or should they fail fast when not configured?

## Output Format

Structure the review as:

1. **Overall Assessment** — One paragraph summary
2. **Findings by severity** — High / Medium / Low
   - Each finding: what, which files & lines, why it matters, how to fix
3. **Positive Observations** — What's done well
4. **Priority Action Items** — Ranked list of what to fix first
