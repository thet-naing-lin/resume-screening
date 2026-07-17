import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineArrowUpTray,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import useAuthStore from "../../store/authStore";

// Nav items visible to ALL roles
const hrLinks = [
  { to: "/dashboard", label: "Dashboard", icon: <HiOutlineHome className="w-5 h-5" /> },
  { to: "/jobs", label: "Job Descriptions", icon: <HiOutlineBriefcase className="w-5 h-5" /> },
  { to: "/resumes", label: "Resumes", icon: <HiOutlineArrowUpTray className="w-5 h-5" /> },
  { to: "/candidate-rankings", label: "Candidate Rankings", icon: <HiOutlineUsers className="w-5 h-5" /> },
  { to: "/reports", label: "Reports & Export", icon: <HiOutlineChartBar className="w-5 h-5" /> },
];

// Extra links only for admins
const adminLinks = [
  { to: "/admin/users", label: "User Management", icon: <HiOutlineUserGroup className="w-5 h-5" /> },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: <HiOutlineClipboardDocumentList className="w-5 h-5" /> },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes("admin");
  const sidebarRef = useRef(null);
  const [railExpanded, setRailExpanded] = useState(false);

  // Handle Escape key to close mobile sidebar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus first link when sidebar opens on mobile
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const firstLink = sidebarRef.current.querySelector("a, button");
      firstLink?.focus();
    }
  }, [isOpen]);

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium
     transition-all duration-200 relative
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30
     ${isActive
        ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-900/30 dark:text-brand-400"
        : "text-surface-500 hover:text-surface-800 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800"
     }`;

  // Collapsed rail link class — icon only, centered
  const railLinkClass = ({ isActive }) =>
    `group flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium
     transition-all duration-200 relative
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30
     ${isActive
        ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-900/30 dark:text-brand-400"
        : "text-surface-500 hover:text-surface-800 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800"
     }`;

  const getRoleLabel = (role) => {
    const labels = { admin: "Admin", hr: "HR" };
    return labels[role] ?? role;
  };

  const renderNavLinks = (links, showLabels) =>
    links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.to === "/dashboard"}
        className={showLabels ? linkClass : railLinkClass}
        onClick={onClose}
        title={!showLabels ? link.label : undefined}
      >
        {({ isActive }) => (
          <>
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6
                               bg-brand-500 rounded-r-full" />
            )}
            <span className={isActive ? "text-brand-600" : "text-surface-400 group-hover:text-surface-600 transition-colors"}>
              {link.icon}
            </span>
            {showLabels && link.label}
          </>
        )}
      </NavLink>
    ));

  return (
    <>
      {/* Mobile overlay — only on small screens (below md) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-surface-950/40 backdrop-blur-sm z-20 md:hidden animate-fade-in dark:bg-surface-950/60"
          onClick={onClose}
        />
      )}

      {/* ── Mobile sidebar (below md: < 768px) ── */}
      <aside
        ref={sidebarRef}
        className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-100
        z-30 flex flex-col transition-transform duration-300 ease-in-out
        dark:bg-surface-950 dark:border-surface-800
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:hidden
      `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-100 dark:border-surface-800">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600
                          flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
            <HiOutlineClipboardDocumentList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900 leading-tight tracking-tight dark:text-surface-50">Resume</p>
            <p className="text-[11px] text-surface-400 leading-tight font-medium">Screening Tool</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest px-4 mb-3">
            Main Menu
          </p>
          {renderNavLinks(hrLinks, true)}

          {isAdmin && (
            <>
              <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest px-4 mt-6 mb-3">
                Admin
              </p>
              {renderNavLinks(adminLinks, true)}
            </>
          )}
        </nav>

        {/* User Info at bottom */}
        <div className="px-4 py-4 border-t border-surface-100 bg-surface-50/50 dark:border-surface-800 dark:bg-surface-900/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500
                            flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-800 truncate dark:text-surface-100">
                {user?.name}
              </p>
              <p className="text-xs text-surface-400 capitalize font-medium">
                {getRoleLabel(user?.roles?.[0])}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Tablet collapsed rail (md: 768px – lg: 1024px) ── */}
      <aside
        className={`
        hidden md:flex lg:hidden flex-col
        ${railExpanded ? "w-64" : "w-[68px]"}
        bg-white border-r border-surface-100
        h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden
        dark:bg-surface-950 dark:border-surface-800
      `}
        onMouseEnter={() => setRailExpanded(true)}
        onMouseLeave={() => setRailExpanded(false)}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-surface-100 dark:border-surface-800
                         ${railExpanded ? "gap-3 px-5 py-5" : "justify-center px-0 py-5"}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600
                          flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
            <HiOutlineClipboardDocumentList className="w-5 h-5 text-white" />
          </div>
          {railExpanded && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-surface-900 leading-tight tracking-tight dark:text-surface-50">Resume</p>
              <p className="text-[11px] text-surface-400 leading-tight font-medium">Screening Tool</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-5 space-y-1 ${railExpanded ? "px-3" : "px-1.5"}`}>
          {railExpanded && (
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest px-4 mb-3">
              Main Menu
            </p>
          )}
          {renderNavLinks(hrLinks, railExpanded)}

          {isAdmin && (
            <>
              {railExpanded && (
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest px-4 mt-6 mb-3">
                  Admin
                </p>
              )}
              {renderNavLinks(adminLinks, railExpanded)}
            </>
          )}
        </nav>

        {/* User avatar at bottom */}
        <div className={`border-t border-surface-100 bg-surface-50/50 dark:border-surface-800 dark:bg-surface-900/50
                         ${railExpanded ? "px-4 py-4" : "px-0 py-4 flex justify-center"}`}>
          <div className={`flex items-center gap-3 ${railExpanded ? "px-2" : "justify-center"}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500
                            flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {railExpanded && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-surface-800 truncate dark:text-surface-100">
                  {user?.name}
                </p>
                <p className="text-xs text-surface-400 capitalize font-medium">
                  {getRoleLabel(user?.roles?.[0])}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Desktop full sidebar (lg: >= 1024px) ── */}
      <aside
        className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-100
                   h-full shrink-0
                   dark:bg-surface-950 dark:border-surface-800"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-100 dark:border-surface-800">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600
                          flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
            <HiOutlineClipboardDocumentList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900 leading-tight tracking-tight dark:text-surface-50">Resume</p>
            <p className="text-[11px] text-surface-400 leading-tight font-medium">Screening Tool</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest px-4 mb-3">
            Main Menu
          </p>
          {renderNavLinks(hrLinks, true)}

          {isAdmin && (
            <>
              <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest px-4 mt-6 mb-3">
                Admin
              </p>
              {renderNavLinks(adminLinks, true)}
            </>
          )}
        </nav>

        {/* User Info at bottom */}
        <div className="px-4 py-4 border-t border-surface-100 bg-surface-50/50 dark:border-surface-800 dark:bg-surface-900/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500
                            flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-800 truncate dark:text-surface-100">
                {user?.name}
              </p>
              <p className="text-xs text-surface-400 capitalize font-medium">
                {getRoleLabel(user?.roles?.[0])}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
