import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJobs, deleteJob } from "../../api/jobApi";
import DeleteModal from "../../components/common/DeleteModal";
import { BsTrash } from "react-icons/bs";
import { FaRegEye, FaUserEdit } from "react-icons/fa";

// ── Badge helpers ──
const EXP_BADGE = {
  junior: "bg-green-50 text-green-700 border-green-200",
  mid: "bg-blue-50 text-blue-700 border-blue-200",
  senior: "bg-purple-50 text-purple-700 border-purple-200",
};

const EMP_BADGE = {
  "full-time": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "part-time": "bg-amber-50 text-amber-700 border-amber-200",
  contract: "bg-orange-50 text-orange-700 border-orange-200",
  internship: "bg-pink-50 text-pink-700 border-pink-200",
  freelance: "bg-teal-50 text-teal-700 border-teal-200",
};

function Badge({ label, style }) {
  return (
    <span className={`badge border ${style}`}>{label}</span>
  );
}

export default function JobList() {
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(location.state?.flash ?? "");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(""), 3000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await getJobs();
      setJobs(res.data.jobs);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await deleteJob(deleteTarget.id);
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      setFlash(res.data.message);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const filtered = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || job.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount = jobs.filter((j) => j.status === "active").length;
  const closedCount = jobs.filter((j) => j.status === "closed").length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Job Descriptions</h1>
            <p>Manage all job postings for resume screening.</p>
          </div>
          <button onClick={() => navigate("/jobs/create")} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Job Description
          </button>
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

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Jobs", value: jobs.length, accent: "text-surface-900", bg: "bg-surface-50" },
            { label: "Active", value: activeCount, accent: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Closed", value: closedCount, accent: "text-red-500", bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <p className={`text-[28px] font-bold ${s.accent} tracking-tight`}>{s.value}</p>
              <p className="text-sm text-surface-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-card-header">
            <h2>All Job Descriptions</h2>
            <span className="text-sm text-surface-400">{filtered.length} results</span>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4 items-center">
                  <div className="h-10 w-10 bg-surface-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-100 rounded w-1/3" />
                    <div className="h-3 bg-surface-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-4">📋</p>
              <p className="font-semibold text-surface-500">No job descriptions found</p>
              <p className="text-sm text-surface-400 mt-1">
                {search ? "Try a different search term." : "Create your first job description to get started."}
              </p>
              {!search && (
                <button onClick={() => navigate("/jobs/create")} className="btn-primary mt-5">
                  Create Job Description
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto table-container">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Job Title</th>
                    <th className="text-left">Skills</th>
                    <th className="text-left">Level</th>
                    <th className="text-left">Type</th>
                    <th className="text-left">Exp. Years</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <p className="font-semibold text-surface-900 hover:text-brand-600 cursor-pointer transition-colors"
                           onClick={() => navigate(`/jobs/${job.id}`)}>
                          {job.title}
                        </p>
                        {job.location && (
                          <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </p>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {job.required_skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="bg-surface-100 text-surface-600 text-xs px-2 py-0.5 rounded-lg font-medium">
                              {skill}
                            </span>
                          ))}
                          {job.required_skills.length > 3 && (
                            <span className="text-xs text-surface-400">+{job.required_skills.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td><Badge label={job.experience_level} style={EXP_BADGE[job.experience_level]} /></td>
                      <td><Badge label={job.employment_type} style={EMP_BADGE[job.employment_type]} /></td>
                      <td className="text-sm text-surface-600">
                        {job.experience_years != null ? `${job.experience_years} yr${job.experience_years !== 1 ? "s" : ""}`
                          : <span className="text-surface-300">—</span>}
                      </td>
                      <td>
                        <Badge
                          label={job.status}
                          style={job.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-surface-100 text-surface-500 border-surface-200"}
                        />
                      </td>
                      <td className="text-surface-400 text-xs">{job.created_at}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => navigate(`/jobs/${job.id}`)}
                                  className="text-surface-400 hover:text-surface-700 text-xs font-medium p-2 rounded-xl hover:bg-surface-100 transition-colors"
                                  title="View">
                            <FaRegEye />
                          </button>
                          <button onClick={() => navigate(`/jobs/${job.id}/edit`)}
                                  className="text-brand-500 hover:text-brand-700 text-xs font-medium p-2 rounded-xl hover:bg-brand-50 transition-colors"
                                  title="Edit">
                            <FaUserEdit />
                          </button>
                          <button onClick={() => setDeleteTarget(job)}
                                  className="text-red-400 hover:text-red-600 text-xs font-medium p-2 rounded-xl hover:bg-red-50 transition-colors"
                                  title="Delete">
                            <BsTrash />
                          </button>
                        </div>
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
          title="Delete Job Description"
          description={
            <>
              Are you sure you want to delete{" "}
              <strong className="text-surface-900">"{deleteTarget.title}"</strong>?
              This cannot be undone.
            </>
          }
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </DashboardLayout>
  );
}
