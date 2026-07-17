import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMapPin,
} from "react-icons/hi2";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJobs, deleteJob } from "../../api/jobApi";
import DeleteModal from "../../components/common/DeleteModal";

// ── Badge helpers ──
const EXP_BADGE = {
  junior: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  mid: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  senior: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
};

const EMP_BADGE = {
  "full-time": "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
  "part-time": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  contract: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  internship: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
  freelance: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await getJobs();
      setJobs(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    // Show flash from navigation state as a toast
    if (location.state?.flash) {
      toast.success(location.state.flash);
      // Clear the flash from history state
      window.history.replaceState({}, "");
    }
  }, []);

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await deleteJob(deleteTarget.id);
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      toast.success(res.data.message);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete.");
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
            <HiOutlinePlus className="w-4 h-4" />
            New Job Description
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flash-error">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-card">
                <div className="h-8 bg-surface-100 rounded-lg w-16 mb-2" />
                <div className="h-4 bg-surface-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Jobs", value: jobs.length, accent: "text-surface-900 dark:text-surface-100", bg: "bg-surface-50" },
              { label: "Active", value: activeCount, accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50" },
              { label: "Closed", value: closedCount, accent: "text-red-500 dark:text-red-400", bg: "bg-red-50" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <p className={`text-[28px] font-bold ${s.accent} tracking-tight`}>{s.value}</p>
                <p className="text-sm text-surface-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filter bar */}
        {loading ? (
          <div className="filter-bar mb-6 animate-pulse">
            <div className="search-input-wrapper flex-1 relative">
              <div className="h-4 w-4 bg-surface-200 rounded absolute left-4 top-1/2 -translate-y-1/2" />
              <div className="h-10 bg-surface-100 rounded-2xl border border-surface-200 w-full" />
            </div>
            <div className="h-10 bg-surface-100 rounded-2xl border border-surface-200 w-32" />
          </div>
        ) : (
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <HiOutlineMagnifyingGlass className="w-4 h-4" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search job descriptions"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select-field"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {/* Table */}
        <div className="table-card">
          <div className="table-card-header">
            <h2>All Job Descriptions</h2>
            <span className="text-sm text-surface-400">{filtered.length} results</span>
          </div>

          {loading ? (
            <div className="animate-pulse">
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
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        {/* Job Title */}
                        <td>
                          <div className="h-4 bg-surface-100 rounded w-32 mb-1.5" />
                          <div className="h-3 bg-surface-100 rounded w-24" />
                        </td>
                        {/* Skills */}
                        <td>
                          <div className="flex gap-1">
                            <div className="h-5 bg-surface-100 rounded-lg w-14" />
                            <div className="h-5 bg-surface-100 rounded-lg w-16" />
                            <div className="h-5 bg-surface-100 rounded-lg w-12" />
                          </div>
                        </td>
                        {/* Level */}
                        <td><div className="h-6 bg-surface-100 rounded-full w-16" /></td>
                        {/* Type */}
                        <td><div className="h-6 bg-surface-100 rounded-full w-20" /></td>
                        {/* Exp. Years */}
                        <td><div className="h-4 bg-surface-100 rounded w-10" /></td>
                        {/* Status */}
                        <td><div className="h-6 bg-surface-100 rounded-full w-14" /></td>
                        {/* Created */}
                        <td><div className="h-3 bg-surface-100 rounded w-20" /></td>
                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="h-8 w-8 bg-surface-100 rounded-xl" />
                            <div className="h-8 w-8 bg-surface-100 rounded-xl" />
                            <div className="h-8 w-8 bg-surface-100 rounded-xl" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-4" aria-hidden="true">📋</p>
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
                        <Link to={`/jobs/${job.id}`} className="font-semibold text-surface-900 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded
                                                                dark:text-surface-100 dark:hover:text-brand-400">
                          {job.title}
                        </Link>
                        {job.location && (
                          <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                            <HiOutlineMapPin className="w-3 h-3" aria-hidden="true" />
                            {job.location}
                          </p>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {job.required_skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="bg-surface-100 text-surface-600 text-xs px-2 py-0.5 rounded-lg font-medium
                                                         dark:bg-surface-800 dark:text-surface-300">
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
                      <td className="text-sm text-surface-600 dark:text-surface-300">
                        {job.experience_years != null ? `${job.experience_years} yr${job.experience_years !== 1 ? "s" : ""}`
                          : <span className="text-surface-300">—</span>}
                      </td>
                      <td>
                        <Badge
                          label={job.status}
                          style={job.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-surface-100 text-surface-500 border-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700"}
                        />
                      </td>
                      <td className="text-surface-400 text-xs">{job.created_at}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => navigate(`/jobs/${job.id}`)}
                                  className="text-surface-400 hover:text-surface-700 text-xs font-medium p-2.5 min-w-[44px] min-h-[44px] rounded-xl hover:bg-surface-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30
                                            dark:hover:text-surface-200 dark:hover:bg-surface-800"
                                  aria-label={`View ${job.title}`}
                                  title="View">
                            <HiOutlineEye />
                          </button>
                          <button onClick={() => navigate(`/jobs/${job.id}/edit`)}
                                  className="text-brand-500 hover:text-brand-700 text-xs font-medium p-2.5 min-w-[44px] min-h-[44px] rounded-xl hover:bg-brand-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30
                                            dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
                                  aria-label={`Edit ${job.title}`}
                                  title="Edit">
                            <HiOutlinePencilSquare />
                          </button>
                          <button onClick={() => setDeleteTarget(job)}
                                  className="text-red-400 hover:text-red-600 text-xs font-medium p-2.5 min-w-[44px] min-h-[44px] rounded-xl hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30
                                            dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                  aria-label={`Delete ${job.title}`}
                                  title="Delete">
                            <HiOutlineTrash />
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
              <strong className="text-surface-900 dark:text-surface-100">"{deleteTarget.title}"</strong>?
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
