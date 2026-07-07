// Pre-load all route components for instant navigation after login
export function preloadRoutes() {
  // Pre-load all route components in the background
  import("../pages/dashboard/Dashboard");
  import("../pages/admin/UserManagement");
  import("../pages/jobs/JobList");
  import("../pages/jobs/CreateJob");
  import("../pages/jobs/EditJob");
  import("../pages/jobs/ViewJob");
  import("../pages/resumes/UploadResume");
  import("../pages/resumes/ResumeList");
  import("../pages/candidates/CandidateRankingPage");
  import("../pages/admin/AuditLogsPage");
  import("../pages/reports/ReportExportPage");
}
