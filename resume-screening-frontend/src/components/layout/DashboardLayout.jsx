import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden dark:bg-surface-950">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2
                   bg-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:text-brand-700
                   focus:font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content — scrollable */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 focus:outline-none">{children}</main>
      </div>
    </div>
  );
}
