// src/pages/candidates/ResumeList.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DeleteModal from "../../components/common/DeleteModal";
import { getResumes, deleteResume } from "../../api/resumeApi";

const PROCESSING_STATUSES = ["uploaded", "parsing", "parsed", "scoring"];
const POLL_INTERVAL_MS = 3000;

const statusConfig = {
  uploaded: { label: "Uploaded", style: "bg-surface-100 text-surface-600 border-surface-200" },
  parsing: { label: "Parsing", style: "bg-amber-50 text-amber-700 border-amber-200" },
  parsed: { label: "Parsed", style: "bg-blue-50 text-blue-700 border-blue-200" },
  scoring: { label: "Scoring", style: "bg-purple-50 text-purple-700 border-purple-200" },
  scored: { label: "Scored", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "Failed", style: "bg-red-50 text-red-600 border-red-200" },
};

const DELETABLE = ["uploaded", "failed"];

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.uploaded;
  const isActive = PROCESSING_STATUSES.includes(status);
  return (
    <span className={`badge border ${cfg.style}`}>
      {isActive && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {cfg.label}
    </span>
  );
}

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const initialLoadDone = useRef(false);
  const batchProcessingRef = useRef(new Set());
  const processingToastId = useRef(null);

  const fetchResumes = useCallback(async () => {
    try {
      if (!initialLoadDone.current) setInitialLoading(true);
      const res = await getResumes();
      const raw = res.data?.data ?? res.data ?? [];
      const data = Array.isArray(raw) ? raw : Object.values(raw);
      setResumes(data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load resumes.");
    } finally {
      setInitialLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  // Auto-polling: refetch every 3s while resumes are processing
  useEffect(() => {
    const activeIds = new Set(
      resumes.filter((r) => PROCESSING_STATUSES.includes(r.status)).map((r) => r.id)
    );

    activeIds.forEach((id) => batchProcessingRef.current.add(id));

    if (activeIds.size === 0 || !initialLoadDone.current) return;

    // Show persistent processing toast if not already showing
    if (!processingToastId.current) {
      processingToastId.current = toast.loading(
        "Processing resumes… Status updates automatically.",
        { duration: Infinity }
      );
    }

    const interval = setInterval(fetchResumes, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [resumes, fetchResumes]);

  // Detect when all processing resumes finish → dismiss loading toast, show success
  const prevActiveRef = useRef(0);
  useEffect(() => {
    const activeCount = resumes.filter((r) => PROCESSING_STATUSES.includes(r.status)).length;
    const prevActive = prevActiveRef.current;

    if (prevActive > 0 && activeCount === 0 && initialLoadDone.current) {
      const count = batchProcessingRef.current.size;
      batchProcessingRef.current.clear();

      // Dismiss the processing loading toast
      if (processingToastId.current) {
        toast.dismiss(processingToastId.current);
        processingToastId.current = null;
      }

      // Show completion toast
      toast.success(
        `All done! ${count} resume${count !== 1 ? "s" : ""} scored.`,
        { duration: 4000 }
      );
    }
    prevActiveRef.current = activeCount;
  }, [resumes]);

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await deleteResume(deleteTarget.id);
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success(res.data.message);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete resume.");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  const filtered = resumes.filter((resume) => {
    const candidateName = resume.candidate?.name?.toLowerCase() ?? "";
    const jobTitle = resume.job_description?.title?.toLowerCase() ?? "";
    const filename = resume.original_filename.toLowerCase();
    const query = search.toLowerCase();
    const matchSearch = candidateName.includes(query) || jobTitle.includes(query) || filename.includes(query);
    const matchJob = filterJob === "all" || String(resume.job_description?.id) === filterJob;
    return matchSearch && matchJob;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Uploaded Resumes</h1>
            <p>All resumes uploaded across all job positions.</p>
          </div>
          <Link to="/resumes/upload" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Resume
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="flash-error">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* Search + Filter bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by candidate name, job, or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search resumes"
            />
            {search && (
              <button onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)} className="select-field" aria-label="Filter by job position">
            <option value="all">All Positions</option>
            {[...new Map(resumes.filter((r) => r.job_description).map((r) => [r.job_description.id, r.job_description])).values()]
              .map((job) => (
                <option key={job.id} value={String(job.id)}>{job.title}</option>
              ))}
          </select>
        </div>

        {/* Table card */}
        <div className="table-card">
          <div className="table-card-header">
            <h2>All Resumes</h2>
            <span className="text-sm text-surface-400">{filtered.length} results</span>
          </div>

          {initialLoading && (
            <div className="overflow-x-auto table-container animate-pulse">
              <table>
                <thead>
                  <tr>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-12" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-24" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-20" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-14" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-16" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-10" /></th>
                    <th className="text-right"><div className="h-3 bg-surface-100 rounded w-16 ml-auto" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-surface-100 rounded-xl flex-shrink-0" />
                          <div className="h-4 bg-surface-100 rounded w-32" />
                        </div>
                      </td>
                      <td><div className="h-4 bg-surface-100 rounded w-28" /></td>
                      <td><div className="h-4 bg-surface-100 rounded w-24" /></td>
                      <td><div className="h-6 bg-surface-100 rounded-full w-20" /></td>
                      <td><div className="h-4 bg-surface-100 rounded w-20" /></td>
                      <td><div className="h-4 bg-surface-100 rounded w-12" /></td>
                      <td className="text-right"><div className="h-8 bg-surface-100 rounded-xl w-16 ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!initialLoading && filtered.length === 0 && !error && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-4" aria-hidden="true">{search || filterJob !== "all" ? "🔍" : "📄"}</p>
              <p className="font-semibold text-surface-500">
                {search || filterJob !== "all" ? "No resumes match your search." : "No resumes uploaded yet"}
              </p>
              <p className="text-sm text-surface-400 mt-1">
                {search || filterJob !== "all"
                  ? "Try a different name or job position."
                  : "Upload your first resume to get started."}
              </p>
              {!search && filterJob === "all" && (
                <Link to="/resumes/upload" className="btn-primary mt-5 inline-flex">
                  Upload Resume
                </Link>
              )}
            </div>
          )}

          {!initialLoading && filtered.length > 0 && (
            <div className="overflow-x-auto table-container">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">File</th>
                    <th className="text-left">Job Position</th>
                    <th className="text-left">Candidate</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Uploaded</th>
                    <th className="text-left">Size</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((resume) => (
                    <tr key={resume.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${resume.file_type === "pdf" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                            {resume.file_type === "pdf" ? "PDF" : "DOC"}
                          </div>
                          <span className="font-medium text-surface-800 max-w-[180px] truncate">
                            {resume.original_filename}
                          </span>
                        </div>
                      </td>
                      <td className="text-surface-600 max-w-[160px] truncate">
                        {resume.job_description?.title ?? "—"}
                      </td>
                      <td className="text-surface-500">
                        {resume.candidate?.name ?? (
                          <span className="text-surface-300 italic text-xs">Pending</span>
                        )}
                      </td>
                      <td>
                        {resume.status === "failed" && resume.parse_error ? (
                          <div className="relative group">
                            <StatusBadge status="failed" />
                            <div className="absolute left-0 top-7 z-10 hidden group-hover:block w-64
                                            bg-surface-900 text-white text-xs rounded-2xl px-4 py-3 shadow-xl">
                              {resume.parse_error}
                            </div>
                          </div>
                        ) : (
                          <StatusBadge status={resume.status} />
                        )}
                      </td>
                      <td className="text-surface-500 whitespace-nowrap">
                        {new Date(resume.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="text-surface-400">
                        {(resume.file_size / 1024).toFixed(0)} KB
                      </td>
                      <td className="text-right">
                        {DELETABLE.includes(resume.status) ? (
                          <button onClick={() => setDeleteTarget(resume)}
                                  className="btn-danger text-xs !py-1.5 !px-3">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        ) : (
                          <span title={`Cannot delete — resume is ${resume.status}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                           text-surface-300 bg-surface-50 rounded-xl cursor-not-allowed">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
