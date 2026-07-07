import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";

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
  const { theme, toggleTheme } = useThemeStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch {
      setIsLoggingOut(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = { admin: "Admin", hr: "HR" };
    return labels[role] ?? role;
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-surface-100
                        flex items-center justify-between px-4 md:px-6 shrink-0 z-10
                        dark:bg-surface-950/80 dark:border-surface-800">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-surface-700
                     hover:bg-surface-100 transition-all dark:hover:text-surface-200 dark:hover:bg-surface-800"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight dark:text-surface-50">{pageTitle}</h1>
        </div>
      </div>

      {/* Right: user badge + logout */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100
                     transition-all dark:hover:text-surface-200 dark:hover:bg-surface-800"
        >
          {theme === "dark" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User badge */}
        <div className="hidden sm:flex items-center gap-2.5 bg-surface-50
                        border border-surface-100 rounded-2xl px-3 py-1.5
                        dark:bg-surface-800 dark:border-surface-700">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500
                          flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
            {user?.name}
          </span>
          <span className="text-[11px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full
                           capitalize font-semibold dark:bg-brand-900/30 dark:text-brand-400">
            {getRoleLabel(user?.roles?.[0])}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Logout"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                     text-surface-400 hover:text-red-600 hover:bg-red-50
                     rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                     dark:hover:text-red-400 dark:hover:bg-red-900/30"
        >
          {isLoggingOut ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
          <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
