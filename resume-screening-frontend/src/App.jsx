import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Lazy load route components for code splitting
const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const JobList = lazy(() => import("./pages/jobs/JobList"));
const CreateJob = lazy(() => import("./pages/jobs/CreateJob"));
const EditJob = lazy(() => import("./pages/jobs/EditJob"));
const ViewJob = lazy(() => import("./pages/jobs/ViewJob"));
const UploadResume = lazy(() => import("./pages/resumes/UploadResume"));
const ResumeList = lazy(() => import("./pages/resumes/ResumeList"));
const CandidateRankingPage = lazy(
  () => import("./pages/candidates/CandidateRankingPage"),
);
const AuditLogsPage = lazy(() => import("./pages/admin/AuditLogsPage"));
const ReportsExportPage = lazy(
  () => import("./pages/reports/ReportExportPage"),
);
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Loading...
        </p>
      </div>
    </div>
  );
}

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </h2>
      <p className="text-sm text-slate-400 mt-1">Coming in the next sprint</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "16px",
            background: "#fff",
            color: "#334155",
            fontSize: "14px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Jobs — US-003, US-004, US-005 */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/create"
            element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id/edit"
            element={
              <ProtectedRoute>
                <EditJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <ViewJob />
              </ProtectedRoute>
            }
          />

          {/* Resumes */}
          <Route
            path="/resumes"
            element={
              <ProtectedRoute>
                <ResumeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes/upload"
            element={
              <ProtectedRoute>
                <UploadResume />
              </ProtectedRoute>
            }
          />

          {/* Candidates Ranking */}
          <Route
            path="/candidate-rankings"
            element={
              <ProtectedRoute>
                <CandidateRankingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsExportPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
