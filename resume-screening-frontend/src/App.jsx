import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import UserManagement from "./pages/admin/UserManagement";
import JobList from "./pages/jobs/JobList";
import CreateJob from "./pages/jobs/CreateJob";
import EditJob from "./pages/jobs/EditJob";
``;
import ViewJob from "./pages/jobs/ViewJob";
import UploadResume from "./pages/resumes/UploadResume";
import ResumeList from "./pages/resumes/ResumeList";
import CandidateRankingPage from "./pages/candidates/CandidateRankingPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import ReportsExportPage from "./pages/reports/ReportExportPage";
import GoogleCallback from "./pages/auth/GoogleCallback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const PlaceholderPage = ({ title }) => (
  <DashboardLayout>
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
        <p className="text-sm text-slate-400 mt-1">Coming in the next sprint</p>
      </div>
    </div>
  </DashboardLayout>
);

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
