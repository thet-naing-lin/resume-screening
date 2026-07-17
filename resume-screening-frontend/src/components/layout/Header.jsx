import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineBars3,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { ImSpinner9 } from "react-icons/im";
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
    <header
      className="h-16 bg-white/80 backdrop-blur-lg border-b border-surface-100
                        flex items-center justify-between px-4 md:px-6 shrink-0 z-10
                        dark:bg-surface-950/80 dark:border-surface-800"
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button — only on screens below md (768px) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-surface-400 hover:text-surface-700
                     hover:bg-surface-100 transition-all dark:hover:text-surface-200 dark:hover:bg-surface-800"
          aria-label="Open menu"
        >
          <HiOutlineBars3 className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight dark:text-surface-50">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: user badge + logout */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100
                     transition-all dark:hover:text-surface-200 dark:hover:bg-surface-800"
        >
          {theme === "dark" ? (
            <HiOutlineSun className="w-5 h-5" />
          ) : (
            <HiOutlineMoon className="w-5 h-5" />
          )}
        </button>

        {/* User badge */}
        <div
          className="hidden sm:flex items-center gap-2.5 bg-surface-50
                        border border-surface-100 rounded-2xl px-3 py-1.5
                        dark:bg-surface-800 dark:border-surface-700"
        >
          <div
            className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500
                          flex items-center justify-center"
          >
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
            {user?.name}
          </span>
          <span
            className="text-[11px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full
                           capitalize font-semibold dark:bg-brand-900/30 dark:text-brand-400"
          >
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
            <ImSpinner9 className="w-4 h-4 animate-spin" />
          ) : (
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}
