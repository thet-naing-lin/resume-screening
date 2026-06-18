import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAuditLogs } from "../../api/auditApi";

// ── Action badge color map ──────────────────────────────────
function ActionBadge({ action }) {
  const color = action.startsWith("auth")
    ? "bg-blue-100 text-blue-700"
    : action.startsWith("resume")
      ? "bg-purple-100 text-purple-700"
      : action.startsWith("job")
        ? "bg-yellow-100 text-yellow-700"
        : action.startsWith("candidate")
          ? "bg-green-100 text-green-700"
          : action.startsWith("ai")
            ? "bg-indigo-100 text-indigo-700"
            : "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {action}
    </span>
  );
}

function DetailsCell({ metadata }) {
  const [showModal, setShowModal] = useState(false);

  if (!metadata) return <span className="text-gray-300">—</span>;

  const entries = Object.entries(metadata);
  const preview = entries.map(([k, v]) => `${k}: ${v}`).join(", ");

  return (
    <>
      {/* Clickable truncated preview */}
      <button
        onClick={() => setShowModal(true)}
        className="text-left text-xs font-mono bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-1 rounded transition-colors w-full max-w-[200px] truncate block"
        title="Click to view full details"
      >
        {preview}
      </button>

      {/* Full details modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)} // click backdrop to close
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()} // prevent backdrop click
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Log Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex gap-3 py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-xs font-semibold text-gray-500 w-32 flex-shrink-0 uppercase tracking-wide">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm text-gray-800 break-all">
                    {String(value)}
                  </span>
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

  const [filters, setFilters] = useState({
    action: "",
    date_from: "",
    date_to: "",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAuditLogs({
          ...activeFilters,
          page,
          per_page: 20,
        });
        setLogs(res.data.data);
        setMeta(res.data);
        setCurrentPage(page);
      } catch {
        setError("Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    },
    [activeFilters],
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleApply = () => {
    setActiveFilters({ ...filters });
  };

  const handleClear = () => {
    const empty = { action: "", date_from: "", date_to: "" };
    setFilters(empty);
    setActiveFilters({});
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Full history of all user actions in the system.
          </p>
        </div>

        {/* Filter Panel */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            🔍 Filter Logs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Action</label>
              <input
                type="text"
                placeholder="e.g. resume.uploaded"
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
                className="border rounded-xl px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
                className="border rounded-xl px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
                className="border rounded-xl px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApply}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClear}
              className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && logs.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-gray-500">No audit logs found.</p>
          </div>
        )}

        {/* Table */}
        {!loading && logs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Activity History</h2>
              <span className="text-sm text-gray-400">
                {meta?.total} total entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Timestamp</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Target</th>
                    <th className="px-4 py-3 text-left">Details</th>
                    <th className="px-4 py-3 text-left">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {log.user?.name ?? "System"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {log.user?.email ?? "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <ActionBadge action={log.action} />
                      </td>

                      {/* <td className="px-4 py-3 text-gray-500">
                        {log.target_type ? (
                          <span>
                            {log.target_type}
                            <span className="text-gray-300 ml-1">
                              #{log.target_id}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td> */}

                      <td className="px-4 py-3">
                        {log.target_label ? (
                          <div>
                            <p className="text-sm text-gray-800 font-medium">
                              {log.target_label}
                            </p>
                            <p className="text-xs text-gray-400">
                              {log.target_type} #{log.target_id}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-[200px]">
                        <DetailsCell metadata={log.metadata} />
                      </td>

                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {log.ip_address ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex justify-center gap-2 px-6 py-4 border-t border-gray-100">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => fetchLogs(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        page === currentPage
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
