// src/pages/candidates/ResumeList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DeleteModal from "../../components/common/DeleteModal";
import { getResumes, deleteResume } from "../../api/resumeApi";

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
  return (
    <span className={`badge border ${cfg.style}`}>{cfg.label}</span>
  );
}

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("all");

  useEffect(() => { fetchResumes(); }, []);

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
      const raw = res.data?.data ?? res.data ?? [];
      const data = Array.isArray(raw) ? raw : Object.values(raw);
      setResumes(data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await deleteResume(deleteTarget.id);
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

        {/* Flash */}
        {flash && (
          <div className="flash-success">
            <span>{flash}</span>
            <button onClick={() => setFlash("")} className="font-bold ml-4">✕</button>
          </div>
        )}

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
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by candidate name, job, or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)} className="select-field">
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

          {loading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex gap-4 items-center">
                  <div className="h-10 w-10 bg-surface-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-100 rounded w-48" />
                    <div className="h-3 bg-surface-100 rounded w-32" />
                  </div>
                  <div className="h-6 w-20 bg-surface-100 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && !error && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-4">{search || filterJob !== "all" ? "🔍" : "📄"}</p>
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

          {!loading && filtered.length > 0 && (
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
