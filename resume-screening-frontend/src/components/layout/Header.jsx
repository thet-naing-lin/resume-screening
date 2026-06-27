import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

// Maps route paths to readable page titles
const pageTitles = {
  "/dashboard": "Dashboard",
  "/jobs": "Job Descriptions",
  "/resumes": "Resumes",
  "/candidate-rankings": "Candidate Rankings",
  "/reports": "Reports & Export",
  "/admin/users": "User Management",
  "/admin/audit-logs": "Audit Logs",
};

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleLabel = (role) => {
    const labels = { admin: "Admin", hr: "HR" };
    return labels[role] ?? role;
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-surface-100
                        flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-surface-700
                     hover:bg-surface-100 transition-all"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">{pageTitle}</h1>
        </div>
      </div>

      {/* Right: user badge + logout */}
      <div className="flex items-center gap-3">
        {/* User badge */}
        <div className="hidden sm:flex items-center gap-2.5 bg-surface-50
                        border border-surface-100 rounded-2xl px-3 py-1.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500
                          flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-surface-700">
            {user?.name}
          </span>
          <span className="text-[11px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full
                           capitalize font-semibold">
            {getRoleLabel(user?.roles?.[0])}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                     text-surface-400 hover:text-red-600 hover:bg-red-50
                     rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
