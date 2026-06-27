import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAuditLogs } from "../../api/auditApi";

function ActionBadge({ action }) {
  const color = action.startsWith("auth")
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : action.startsWith("resume")
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : action.startsWith("job")
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : action.startsWith("candidate")
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : action.startsWith("ai")
            ? "bg-brand-50 text-brand-700 border-brand-200"
            : "bg-surface-100 text-surface-600 border-surface-200";
  return (
    <span className={`badge border ${color}`}>{action}</span>
  );
}

function DetailsCell({ metadata }) {
  const [showModal, setShowModal] = useState(false);
  if (!metadata) return <span className="text-surface-300">—</span>;
  const entries = Object.entries(metadata);
  const preview = entries.map(([k, v]) => `${k}: ${v}`).join(", ");

  return (
    <>
      <button onClick={() => setShowModal(true)}
              className="text-left text-xs font-mono bg-surface-100 hover:bg-brand-50 hover:text-brand-700
                         px-3 py-1.5 rounded-xl transition-colors w-full max-w-[200px] truncate block"
              title="Click to view full details">
        {preview}
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-md p-6 animate-scale-in"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900">Log Details</h3>
              <button onClick={() => setShowModal(false)}
                      className="text-surface-400 hover:text-surface-600 text-xl w-8 h-8 flex items-center
                                 justify-center rounded-xl hover:bg-surface-100 transition-colors">✕</button>
            </div>
            <div className="space-y-2">
              {entries.map(([key, value]) => (
                <div key={key} className="flex gap-3 py-2 border-b border-surface-100 last:border-0">
                  <span className="text-xs font-semibold text-surface-500 w-32 flex-shrink-0 uppercase tracking-wide">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm text-surface-800 break-all">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ action: "", date_from: "", date_to: "" });
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditLogs({ ...activeFilters, page, per_page: 20 });
      setLogs(res.data.data);
      setMeta(res.data);
      setCurrentPage(page);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const handleApply = () => setActiveFilters({ ...filters });
  const handleClear = () => {
    const empty = { action: "", date_from: "", date_to: "" };
    setFilters(empty);
    setActiveFilters({});
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="page-header">
          <div>
            <h1>Audit Logs</h1>
            <p>Full history of all user actions in the system.</p>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-surface-50 border border-surface-200 rounded-3xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Logs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-surface-500 mb-1">Action</label>
              <input type="text" placeholder="e.g. resume.uploaded" value={filters.action}
                     onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                     className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-surface-500 mb-1">From Date</label>
              <input type="date" value={filters.date_from}
                     onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                     className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-surface-500 mb-1">To Date</label>
              <input type="date" value={filters.date_to}
                     onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                     className="input-field" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleApply} className="btn-primary">Apply Filters</button>
            <button onClick={handleClear} className="btn-secondary">Clear</button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-3xl border border-surface-200 p-12 text-center shadow-card">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-surface-100 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {error && <div className="flash-error">{error}</div>}

        {!loading && !error && logs.length === 0 && (
          <div className="bg-white rounded-3xl border border-surface-200 py-16 text-center shadow-card">
            <p className="text-4xl mb-4">📋</p>
            <p className="font-semibold text-surface-500">No audit logs found.</p>
          </div>
        )}

        {!loading && logs.length > 0 && (
          <div className="table-card">
            <div className="table-card-header">
              <h2>Activity History</h2>
              <span className="text-sm text-surface-400">{meta?.total} total entries</span>
            </div>
            <div className="overflow-x-auto table-container">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Timestamp</th>
                    <th className="text-left">User</th>
                    <th className="text-left">Action</th>
                    <th className="text-left">Target</th>
                    <th className="text-left">Details</th>
                    <th className="text-left">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-surface-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <p className="font-semibold text-surface-900">{log.user?.name ?? "System"}</p>
                        <p className="text-xs text-surface-400">{log.user?.email ?? "—"}</p>
                      </td>
                      <td><ActionBadge action={log.action} /></td>
                      <td>
                        {log.target_label ? (
                          <div>
                            <p className="text-sm text-surface-800 font-medium">{log.target_label}</p>
                            <p className="text-xs text-surface-400">{log.target_type} #{log.target_id}</p>
                          </div>
                        ) : <span className="text-surface-300">—</span>}
                      </td>
                      <td className="max-w-[200px]"><DetailsCell metadata={log.metadata} /></td>
                      <td className="text-surface-400 font-mono text-xs">{log.ip_address ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.last_page > 1 && (
              <div className="flex justify-center gap-2 px-6 py-4 border-t border-surface-100">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => fetchLogs(page)}
                          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                            page === currentPage
                              ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                              : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50"
                          }`}>
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
