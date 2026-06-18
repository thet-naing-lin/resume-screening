// src/pages/candidates/ResumeList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DeleteModal from "../../components/common/DeleteModal";
import { getResumes, deleteResume } from "../../api/resumeApi";

// ── Status badge config ───────────────────────────────────────────
const statusConfig = {
  uploaded: { label: "Uploaded", bg: "bg-gray-100", text: "text-gray-600" },
  parsing: { label: "Parsing", bg: "bg-yellow-100", text: "text-yellow-700" },
  parsed: { label: "Parsed", bg: "bg-blue-100", text: "text-blue-700" },
  scoring: { label: "Scoring", bg: "bg-purple-100", text: "text-purple-700" },
  scored: { label: "Scored", bg: "bg-green-100", text: "text-green-700" },
  failed: { label: "Failed", bg: "bg-red-100", text: "text-red-600" },
};

// Only these statuses allow deletion
const DELETABLE = ["uploaded", "failed"];

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.uploaded;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(""); // success message
  const [deleteTarget, setDeleteTarget] = useState(null); // resume object to delete
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("all");

  // ── Fetch resumes ─────────────────────────────────────────────
  useEffect(() => {
    fetchResumes();
  }, []);

  // Auto-hide flash after 3 seconds — same as JobList
  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(""), 3000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  async function fetchResumes() {
    try {
      setLoading(true);
      const res = await getResumes();

      // console.log("API response:", res.data);

      const raw = res.data?.data ?? res.data ?? [];

      // If it's an object (numeric keys), convert to array
      const data = Array.isArray(raw) ? raw : Object.values(raw);

      setResumes(data);

      // setResumes(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  }

  // ── Delete handler — same pattern as JobList.handleDelete() ──
  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await deleteResume(deleteTarget.id);
      // Remove from local state — no page reload needed
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setFlash(res.data.message);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to delete resume.");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Client-side filter — runs on every render when search/filterJob changes
  const filtered = resumes.filter((resume) => {
    const candidateName = resume.candidate?.name?.toLowerCase() ?? "";
    const jobTitle = resume.job_description?.title?.toLowerCase() ?? "";
    const filename = resume.original_filename.toLowerCase();
    const query = search.toLowerCase();

    const matchSearch =
      candidateName.includes(query) ||
      jobTitle.includes(query) ||
      filename.includes(query); // bonus: also searchable by filename

    const matchJob =
      filterJob === "all" || String(resume.job_description?.id) === filterJob;

    return matchSearch && matchJob;
  });

  // ── Render ────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Uploaded Resumes
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                All resumes uploaded across all job positions.
              </p>
            </div>
            <Link
              to="/resumes/upload"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Resume
            </Link>
          </div>

          {/* Flash — same style as JobList */}
          {flash && (
            <div className="mb-4 flex items-center justify-between p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl">
              <span>✅ {flash}</span>
              <button onClick={() => setFlash("")} className="font-bold ml-4">
                ✕
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center justify-between p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              <span>❌ {error}</span>
              <button onClick={() => setError("")} className="font-bold ml-4">
                ✕
              </button>
            </div>
          )}

          {/* Search + Filter bar */}
          <div className="flex gap-3 mb-4">
            {/* Search input */}
            <div className="relative flex-1">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by candidate name, job, or filename..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {/* Clear button — only shows when search has text */}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Job position filter dropdown */}
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Positions</option>
              {/* Build unique job options from the loaded resumes */}
              {[
                ...new Map(
                  resumes
                    .filter((r) => r.job_description)
                    .map((r) => [r.job_description.id, r.job_description]),
                ).values(),
              ].map((job) => (
                <option key={job.id} value={String(job.id)}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">All Resumes</h2>
              <span className="text-sm text-gray-400">
                {filtered.length} results
              </span>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex gap-4 items-center"
                  >
                    <div className="h-10 w-10 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48" />
                      <div className="h-3 bg-gray-100 rounded w-32" />
                    </div>
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                    <div className="h-6 w-8 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && !error && (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">
                  {search || filterJob !== "all" ? "🔍" : "📄"}
                </p>
                <p className="font-medium text-gray-500">
                  {search || filterJob !== "all"
                    ? "No resumes match your search."
                    : "No resumes uploaded yet"}
                </p>
                <p className="text-sm mt-1">
                  {search || filterJob !== "all"
                    ? "Try a different name or job position."
                    : "Upload your first resume to get started."}
                </p>
                {!search && filterJob === "all" && (
                  <Link
                    to="/resumes/upload"
                    className="mt-4 inline-block px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Upload Resume
                  </Link>
                )}
              </div>
            )}

            {/* Table */}
            {!loading && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">File</th>
                      <th className="px-6 py-3 text-left">Job Position</th>
                      <th className="px-6 py-3 text-left">Candidate</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Uploaded</th>
                      <th className="px-6 py-3 text-left">Size</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((resume) => (
                      <tr
                        key={resume.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* File */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                              ${
                                resume.file_type === "pdf"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {resume.file_type === "pdf" ? "PDF" : "DOC"}
                            </div>
                            <span className="font-medium text-gray-800 max-w-[180px] truncate">
                              {resume.original_filename}
                            </span>
                          </div>
                        </td>

                        {/* Job */}
                        <td className="px-6 py-4 text-gray-600 max-w-[160px] truncate">
                          {resume.job_description?.title ?? "—"}
                        </td>

                        {/* Candidate */}
                        <td className="px-6 py-4 text-gray-500">
                          {resume.candidate?.name ?? (
                            <span className="text-gray-300 italic text-xs">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {resume.status === "failed" && resume.parse_error ? (
                            <div className="relative group">
                              <StatusBadge status="failed" />
                              {/* Tooltip showing the actual error */}
                              <div className="absolute left-0 top-7 z-10 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                                {resume.parse_error}
                              </div>
                            </div>
                          ) : (
                            <StatusBadge status={resume.status} />
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(resume.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>

                        {/* Size */}
                        <td className="px-6 py-4 text-gray-400">
                          {(resume.file_size / 1024).toFixed(0)} KB
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {DELETABLE.includes(resume.status) ? (
                            // ✅ Deletable — show red trash button
                            <button
                              onClick={() => setDeleteTarget(resume)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          ) : (
                            // 🔒 Non-deletable — show a greyed-out lock hint
                            <span
                              title={`Cannot delete — resume is ${resume.status}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-50 rounded-lg cursor-not-allowed"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              Locked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal — reusing your existing DeleteModal component */}
      {deleteTarget && (
        <DeleteModal
          isOpen={!!deleteTarget}
          title="Delete Resume"
          description={`Are you sure you want to delete "${deleteTarget.original_filename}"? This will permanently remove the file and cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </DashboardLayout>
  );
}
