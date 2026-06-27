import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuthStore from "../../store/authStore";
import { getDashboardStats } from "../../api/dashboardApi";

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, icon, accent, sub, loading }) {
  const gradients = {
    blue: "from-blue-500 to-blue-600",
    violet: "from-violet-500 to-violet-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  };

  const bgGradients = {
    blue: "bg-blue-50",
    violet: "bg-violet-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
  };

  const iconColors = {
    blue: "text-blue-600",
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
  };

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-500">{label}</p>
          {loading ? (
            <div className="h-10 w-20 bg-surface-100 rounded-xl animate-pulse mt-1.5" />
          ) : (
            <p className="text-[32px] font-bold text-surface-900 mt-1.5 tracking-tight">
              {value}
            </p>
          )}
          {sub && !loading && (
            <p className="text-xs text-surface-400 mt-1">{sub}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${bgGradients[accent]} rounded-2xl flex items-center justify-center shrink-0
                         group-hover:scale-110 transition-transform duration-200`}>
          <span className={iconColors[accent]}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

// ── Activity Item ─────────────────────────────────────────────
function ActivityItem({ action, metadata, time }) {
  const config = {
    "auth.login": { color: "bg-blue-50 text-blue-600", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
    )},
    "auth.logout": { color: "bg-slate-50 text-slate-500", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
    )},
    "resume.uploaded": { color: "bg-violet-50 text-violet-600", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
    )},
    "resume.deleted": { color: "bg-red-50 text-red-500", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    )},
    "job.created": { color: "bg-amber-50 text-amber-600", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    )},
    "job.updated": { color: "bg-amber-50 text-amber-600", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    )},
    "candidate.status_changed": { color: "bg-emerald-50 text-emerald-600", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    "ai.insights_generated": { color: "bg-brand-50 text-brand-600", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
    )},
  };

  const descriptions = {
    "auth.login": "Logged in",
    "auth.logout": "Logged out",
    "resume.uploaded": `Uploaded resume${metadata?.filename ? ` — ${metadata.filename}` : ""}`,
    "resume.deleted": `Deleted resume${metadata?.filename ? ` — ${metadata.filename}` : ""}`,
    "job.created": `Created job${metadata?.title ? ` — ${metadata.title}` : ""}`,
    "job.updated": `Updated job${metadata?.title ? ` — ${metadata.title}` : ""}`,
    "job.deleted": `Deleted job${metadata?.title ? ` — ${metadata.title}` : ""}`,
    "candidate.status_changed": `Candidate status → ${metadata?.new_status ?? "updated"}`,
    "ai.insights_generated": `AI insights generated${metadata?.job_title ? ` for ${metadata.job_title}` : ""}`,
  };

  const cfg = config[action] ?? { color: "bg-surface-100 text-surface-500", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )};

  const label = descriptions[action] ?? action.replace(/\./g, " → ");

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-surface-50 last:border-0">
      <div className={`w-9 h-9 ${cfg.color} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-700 font-medium">{label}</p>
        <p className="text-xs text-surface-400 mt-0.5">{formatTime(time)}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    {
      label: "Active Job Posts",
      value: stats?.active_jobs ?? 0,
      sub: stats?.active_jobs > 0
        ? `${stats.active_jobs} active position${stats.active_jobs > 1 ? "s" : ""}`
        : "No active jobs yet",
      accent: "blue",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Total Resumes",
      value: stats?.total_resumes ?? 0,
      sub: stats?.total_resumes > 0
        ? `${stats.total_resumes} resume${stats.total_resumes > 1 ? "s" : ""} uploaded`
        : "No resumes uploaded yet",
      accent: "violet",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "Candidates Screened",
      value: stats?.candidates_screened ?? 0,
      sub: stats?.candidates_screened > 0
        ? `${stats.candidates_screened} scored`
        : "No candidates screened yet",
      accent: "emerald",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Avg Match Score",
      value: stats?.avg_score != null ? `${stats.avg_score}` : "—",
      sub: stats?.avg_score != null
        ? "Average across all jobs"
        : "Score after AI screening",
      accent: "amber",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  const recentActivity = stats?.recent_activity ?? [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700
                        p-6 md:p-8 text-white shadow-xl shadow-brand-500/20">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/3" />

          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                {greeting}, {user?.name?.split(" ")[0]}! 👋
              </h2>
              <p className="text-brand-100/80 text-sm mt-1.5">
                Here's what's happening with your recruitment today.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/10">
              <p className="text-[11px] text-brand-100/70 uppercase tracking-wider font-medium">Role</p>
              <p className="text-sm font-bold capitalize">{user?.roles?.[0]}</p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} loading={statsLoading} />
          ))}
        </div>

        {/* Bottom two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-6">
            <h3 className="text-base font-semibold text-surface-900 mb-5">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Post a New Job",
                  desc: "Create a job description for screening",
                  to: "/jobs",
                  accent: "blue",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  label: "Upload Resumes",
                  desc: "Bulk upload resumes for a job",
                  to: "/resumes",
                  accent: "violet",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  ),
                },
                {
                  label: "View Candidates",
                  desc: "See ranked and scored candidates",
                  to: "/candidate-rankings",
                  accent: "emerald",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
              ].map((action) => {
                const bgMap = {
                  blue: "bg-blue-50",
                  violet: "bg-violet-50",
                  emerald: "bg-emerald-50",
                };
                const textMap = {
                  blue: "text-blue-600",
                  violet: "text-violet-600",
                  emerald: "text-emerald-600",
                };
                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-50
                               border border-transparent hover:border-surface-100 transition-all group"
                  >
                    <span className={`w-11 h-11 ${bgMap[action.accent]} ${textMap[action.accent]} rounded-2xl
                                       flex items-center justify-center shrink-0`}>
                      {action.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-800 group-hover:text-brand-600 transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-surface-400">{action.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-surface-300 group-hover:text-brand-400 group-hover:translate-x-0.5
                                    ml-auto transition-all shrink-0"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-6">
            <h3 className="text-base font-semibold text-surface-900 mb-5">
              Recent Activity
            </h3>

            {/* Loading skeleton */}
            {statsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 items-center py-2">
                    <div className="w-9 h-9 bg-surface-100 rounded-xl animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-surface-100 rounded animate-pulse w-3/4" />
                      <div className="h-2.5 bg-surface-100 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!statsLoading && recentActivity.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-surface-500">No activity yet</p>
                <p className="text-xs text-surface-400 mt-1">Actions will appear as you use the system</p>
              </div>
            )}

            {/* Activity list */}
            {!statsLoading && recentActivity.length > 0 && (
              <div>
                {recentActivity.map((item, i) => (
                  <ActivityItem
                    key={i}
                    action={item.action}
                    metadata={item.metadata}
                    time={item.created_at}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
