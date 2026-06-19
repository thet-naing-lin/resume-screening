---
name: test-fixer
description: Run the backend test suite, diagnose every failure, fix the root cause, and re-run until green. Trigger when user says "fix the tests", "run tests", "debug tests", "test suite is failing", or "test-fixer".
---

## Purpose

Run the Laravel test suite (`php artisan test`), triage every single failure into one of three categories, fix each one, and re-run until 100% passing.

## Before You Start

1. Read `phpunit.xml` to understand the test environment (SQLite in-memory, queue sync, etc.)
2. Read `tests/TestCase.php` for any base setup
3. List all test files with `find tests/ -name "*Test.php" | sort`
4. Read every test file before attempting fixes — you need the full picture

## Step 1 — Run the suite

```bash
cd resume-screening-api && php artisan test --stop-on-failure 2>&1
```

If it passes cleanly, report success and stop.

## Step 2 — Triage each failure into one of three categories

### Category A: Code Under Test is Wrong (model name, field name, route param)

**These are the most common failures in this codebase.** Known root causes:

| Pattern | Wrong | Right | Files affected |
|---------|-------|-------|---------------|
| Non-existent model | `use App\Models\ResumeScore` | `use App\Models\Score` | `CandidateRankingControllerTest`, `CandidateMailControllerTest` |
| Non-existent factory | `ResumeScoreFactory::factory()` | `Score::factory()` or `DB::table('scores')->insert(...)` | Same as above |
| Wrong form field name | `'resume' => $file` | `'resume_files' => [$file]` | `ResumeControllerTest` |
| Missing required route param | `->getJson('/api/candidate-rankings')` | `->getJson('/api/candidate-rankings?job_description_id=' . $job->id)` | `CandidateRankingControllerTest`, `CandidateMailControllerTest` export test |
| Route uses `{resumeId}` but test gives `$score->id` | `patchJson("/api/candidate-rankings/{$score->id}/status"` | Use `$resume->id` because the route parameter is `{resumeId}` | `CandidateRankingControllerTest::test_hr_can_update_candidate_status_to_shortlisted` |
| Resume factory with non-existent columns | `['status' => 'shortlisted', 'score' => 85.5]` | Only use columns that exist on the `resumes` table | `CandidateRankingControllerTest` |

### Category B: Test Infrastructure is Wrong (seeder, role, mock, disk)

Known root causes:
- **Role name mismatch** — Some test `setUp()` methods create `'hr_recruiter'` but the production code assigns `'hr'`. The `RoleSeeder` determines which exists. Either standardize on `'hr'` across all tests, or create both roles in `setUp()`.
- **Storage fake mismatch** — `Storage::fake('local')` when the controller uses `Storage::disk('private')`. Change to `Storage::fake('private')`.

### Category C: Genuine Production Bug Exposed by the Test

These are rare but important. When you find one:
1. Document exactly what the test expected vs what happened
2. Fix the **production code** first, then re-run the test
3. Do NOT weaken the test assertion to match broken behavior

## Step 3 — Fix one file at a time

For each failing test file:

1. **Diagnose**: Read the test, the controller it hits, the route definition, and any related models/factories. Match form field names against `$request->validate()` rules. Match route parameter names against the route definition in `routes/api.php`.
2. **Fix**: Make the minimal change to align the test with the production code. Prefer fixing the test to match production behavior — UNLESS the test reveals a genuine bug (Category C).
3. **Verify**: Run just that test file:
   ```bash
   cd resume-screening-api && php artisan test --filter=TheTestClassName 2>&1
   ```
4. **Move on** to the next failing file.

## Step 4 — Full suite re-run

After all individual fixes pass, run the entire suite twice:

```bash
cd resume-screening-api && php artisan test 2>&1
```

Tests must pass consistently — run it twice to catch any test-order dependency bugs.

## Step 5 — Report

Report:
- Total tests before fix
- Failures found and their categories (A/B/C)
- Changes made per file
- Total tests passing after fix
- Any tests you couldn't fix and why

## Important Rules

- **Never weaken a test assertion** to make it pass — unless the assertion was objectively wrong (e.g., asserting a field that doesn't exist on the model).
- **Never delete a test** because it's hard to fix. If a test is genuinely obsolete (tests a removed feature), explain why and ask before deleting.
- **Fix the root cause, not the symptom.** If 5 tests all fail because a factory doesn't exist, create/fix the factory — don't rewrite all 5 tests to use raw DB inserts.
- **Don't guess about route definitions.** Check `routes/api.php` to verify path, method, parameter names, and middleware.
- **Don't guess about model columns.** Check the migration files in `database/migrations/` to verify what actually exists.
