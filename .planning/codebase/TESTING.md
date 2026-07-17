# Testing Patterns

**Analysis Date:** 2026-07-18

## Test Framework

### Backend (Laravel)

**Runner:**
- PHPUnit 12.5.12
- Config: `resume-screening-api/phpunit.xml`

**Assertion Library:**
- PHPUnit built-in assertions
- Laravel testing helpers (`assertDatabaseHas`, `assertDatabaseMissing`, etc.)

**Run Commands:**
```bash
cd resume-screening-api && php artisan test              # Run all tests
cd resume-screening-api && php artisan test --filter=JobControllerTest  # Run specific test
cd resume-screening-api && composer test                 # Clear config + run tests
cd resume-screening-api && php artisan test --stop-on-failure  # Stop on first failure
```

### Frontend (React)

**No test framework configured.** There are no test files, test configurations, or test scripts in `resume-screening-frontend/`. The `package.json` has no test-related scripts or dependencies (no Jest, Vitest, or testing-library).

### Python Scorer

**No test framework detected.** The `python-scorer/` directory does not contain test files or test configuration.

---

## Backend Test Environment

**Config:** `phpunit.xml`

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
<env name="QUEUE_CONNECTION" value="sync"/>
<env name="CACHE_STORE" value="array"/>
<env name="MAIL_MAILER" value="array"/>
<env name="SESSION_DRIVER" value="array"/>
```

**Key Settings:**
- SQLite in-memory database (fast, isolated)
- Sync queue (no Redis needed in tests)
- Array mail driver (no actual emails sent)
- Array cache and session

---

## Backend Test File Organization

**Location:** `resume-screening-api/tests/`

**Naming:**
- Feature tests: `tests/Feature/{ControllerName}Test.php`
- Unit tests: `tests/Unit/` (currently only `ExampleTest.php`)

**Structure:**
```
tests/
├── Feature/
│   ├── AdminUserControllerTest.php      # Admin user CRUD
│   ├── AuthControllerTest.php           # Login, logout, password reset
│   ├── CandidateMailControllerTest.php  # Email sending
│   ├── CandidateRankingControllerTest.php # Rankings, filtering, export
│   ├── ExampleTest.php                  # Default Laravel test
│   ├── JobControllerTest.php            # Job CRUD
│   ├── ResumeControllerTest.php         # Resume upload, listing, deletion
│   └── ResumeUploadTest.php             # Upload-specific tests
├── Unit/
│   └── ExampleTest.php
└── TestCase.php                         # Base test class
```

---

## Backend Test Structure

**Base Class:** `Tests\TestCase` extends `Illuminate\Foundation\Testing\TestCase`

**Common Pattern:**
```php
class JobControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $hr;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'hr',    'guard_name' => 'web']);

        // Create and assign roles to test users
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->hr = User::factory()->create();
        $this->hr->assignRole('hr');
    }

    public function test_hr_can_list_job_descriptions()
    {
        // Arrange: Create test data
        JobDescription::factory()->count(3)->create();

        // Act: Make API call
        $response = $this->actingAs($this->hr)
            ->getJson('/api/jobs');

        // Assert: Check response
        $response->assertStatus(200);
    }
}
```

**Key Traits:**
- `RefreshDatabase`: Resets database between tests
- `use Mail::fake()`: Intercepts email sending
- `use Storage::fake('private')`: Fakes file storage

---

## Backend Mocking

**Framework:** Laravel built-in facades

**Patterns:**

```php
// Mail faking
Mail::fake();
$response = $this->postJson('/api/candidates/send-mail', [...]);
Mail::assertSentCount(1);

// Storage faking
Storage::fake('private');
$file = UploadedFile::fake()->create('resume.pdf', 500, 'application/pdf');

// HTTP (for external services) - NOT currently mocked in tests
// Services like ScoringService and GeminiService are not mocked
```

**What to Mock:**
- File storage (`Storage::fake`)
- Email sending (`Mail::fake`)
- External HTTP calls (when added)

**What NOT to Mock:**
- Database operations (use `RefreshDatabase` instead)
- Authentication (use `actingAs()`)
- Queue jobs (use `Queue::fake()` if needed)

---

## Backend Fixtures and Factories

**Location:** `resume-screening-api/database/factories/`

**Available Factories:**

| Factory | File | Key States |
|---------|------|------------|
| `UserFactory` | `database/factories/UserFactory.php` | `unverified()` |
| `JobDescriptionFactory` | `database/factories/JobDescriptionFactory.php` | Default creates valid job |
| `ResumeFactory` | `database/factories/ResumeFactory.php` | `uploaded()`, `failed()`, `docx()` |
| `ScoreFactory` | `database/factories/ScoreFactory.php` | `shortlisted()`, `rejected()`, `underReview()`, `highScore()`, `lowScore()` |
| `CandidateFactory` | `database/factories/CandidateFactory.php` | `withoutEmail()` |
| `AuditLogFactory` | `database/factories/AuditLogFactory.php` | `forAction($action)` |

**Factory Usage:**
```php
// Create single record
$user = User::factory()->create();

// Create with overrides
$job = JobDescription::factory()->create(['user_id' => $this->hr->id]);

// Create multiple
$resumes = Resume::factory()->count(5)->create(['uploaded_by' => $this->hr->id]);

// Use state
$score = Score::factory()->highScore()->create();
$resume = Resume::factory()->uploaded()->create();
```

---

## Backend Test Coverage

**Controller Test Coverage:**

| Controller | Test File | Coverage |
|------------|-----------|----------|
| AuthController | `AuthControllerTest.php` | Login, logout, forgot/reset password |
| JobDescriptionController | `JobControllerTest.php` | CRUD operations |
| ResumeController | `ResumeControllerTest.php` | Upload, list, delete, role-based access |
| CandidateRankingController | `CandidateRankingControllerTest.php` | Rankings, status update, CSV export |
| CandidateMailController | `CandidateMailControllerTest.php` | Template, individual send, bulk send |
| UserManagementController | `AdminUserControllerTest.php` | List, create, assign role, delete |
| AiInsightController | Not tested | AI summary and interview questions |
| DashboardController | Not tested | Dashboard stats |
| AuditLogController | Not tested | Audit log listing |
| GoogleAuthController | Not tested | Google OAuth flow |

**Service Test Coverage:**
- `ScoringService`: Not tested (external Python service)
- `GeminiService`: Not tested (external Gemini API)
- `AuditLogger`: Not tested directly

**Model Test Coverage:**
- No dedicated model tests exist
- Models tested implicitly through controller tests

---

## Backend Common Test Patterns

**Authentication Testing:**
```php
// Test unauthenticated access
$response = $this->getJson('/api/jobs');
$response->assertStatus(401);

// Test authenticated access
$response = $this->actingAs($this->hr)
    ->getJson('/api/jobs');
$response->assertStatus(200);
```

**Authorization Testing:**
```php
// Test role-based access
$response = $this->actingAs($this->hr)
    ->getJson('/api/admin/users');
$response->assertStatus(403);

$response = $this->actingAs($this->admin)
    ->getJson('/api/admin/users');
$response->assertStatus(200);
```

**Validation Testing:**
```php
$response = $this->actingAs($this->hr)
    ->postJson('/api/jobs', []);

$response->assertStatus(422)
    ->assertJsonValidationErrors(['title', 'description']);
```

**Database Assertion Testing:**
```php
// Assert record exists
$this->assertDatabaseHas('job_descriptions', ['title' => 'Full Stack Developer']);

// Assert record deleted
$this->assertDatabaseMissing('job_descriptions', ['id' => $job->id]);
```

**File Upload Testing:**
```php
Storage::fake('private');
$file = UploadedFile::fake()->create('resume.pdf', 500, 'application/pdf');

$response = $this->actingAs($this->hr)
    ->postJson('/api/resumes', [
        'resume_files'       => [$file],
        'job_description_id' => $job->id,
    ]);

$response->assertStatus(201);
$this->assertDatabaseHas('resumes', ['original_filename' => 'resume.pdf']);
```

**Response Structure Testing:**
```php
$response->assertStatus(200)
    ->assertJsonStructure(['data', 'meta'])
    ->assertJsonFragment(['title' => 'Job Title']);
```

---

## Frontend Testing

**Status:** No tests exist.

**Recommendation:** Add tests using:
- **Vitest** (faster than Jest, native Vite support)
- **React Testing Library** for component testing
- **MSW (Mock Service Worker)** for API mocking

**Test file location:** Co-located with source files (e.g., `src/components/Button.test.jsx`)

---

## Running Tests

**Backend only:**
```bash
cd resume-screening-api && php artisan test
```

**Backend with verbose output:**
```bash
cd resume-screening-api && php artisan test --verbose
```

**Backend stop on first failure:**
```bash
cd resume-screening-api && php artisan test --stop-on-failure
```

**Run specific test file:**
```bash
cd resume-screening-api && php artisan test --filter=JobControllerTest
```

**Run specific test method:**
```bash
cd resume-screening-api && php artisan test --filter=JobControllerTest::test_hr_can_list_job_descriptions
```

---

*Testing analysis: 2026-07-18*
