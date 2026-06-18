import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJobs, deleteJob } from "../../api/jobApi";
import DeleteModal from "../../components/common/DeleteModal";
import { BsTrash } from "react-icons/bs";
import { FaRegEye, FaUserEdit } from "react-icons/fa";

// ── Badge helpers ──
const EXP_BADGE = {
  junior: "bg-green-100 text-green-700",
  mid: "bg-blue-100  text-blue-700",
  senior: "bg-purple-100 text-purple-700",
};

const EMP_BADGE = {
  "full-time": "bg-indigo-100 text-indigo-700",
  "part-time": "bg-yellow-100 text-yellow-700",
  contract: "bg-orange-100 text-orange-700",
  internship: "bg-pink-100   text-pink-700",
  freelance: "bg-teal-100   text-teal-700",
};

function Badge({ label, style }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}
    >
      {label}
    </span>
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

  // Auto-hide flash after 3s
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

  // Client-side filter + search
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
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Job Descriptions
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage all job postings for resume screening.
              </p>
            </div>
            <button
              onClick={() => navigate("/jobs/create")}
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
              New Job Description
            </button>
          </div>

          {/* Flash */}
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

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Total Jobs",
                value: jobs.length,
                color: "text-gray-800",
              },
              { label: "Active", value: activeCount, color: "text-green-600" },
              { label: "Closed", value: closedCount, color: "text-red-500" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search + Filter bar */}
          <div className="flex gap-3 mb-4">
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
                placeholder="Search by title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                All Job Descriptions
              </h2>
              <span className="text-sm text-gray-400">
                {filtered.length} results
              </span>
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex gap-4 items-center"
                  >
                    <div className="h-10 w-10 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium text-gray-500">
                  No job descriptions found
                </p>
                <p className="text-sm mt-1">
                  {search
                    ? "Try a different search term."
                    : "Create your first job description to get started."}
                </p>
                {!search && (
                  <button
                    onClick={() => navigate("/jobs/create")}
                    className="mt-4 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Create Job Description
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Job Title</th>
                      <th className="px-6 py-3 text-left">Skills</th>
                      <th className="px-6 py-3 text-left">Level</th>
                      <th className="px-6 py-3 text-left">Type</th>
                      <th className="px-6 py-3 text-left">Exp. Years</th>
                      {/* <th className="px-6 py-3 text-left">Qualification</th> */}
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Created</th>
                      <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((job) => (
                      <tr
                        key={job.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {/* <p className="font-medium text-gray-900">
                            {job.title}
                          </p> */}

                          <p
                            className="font-medium text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            {job.title}
                          </p>

                          {job.location && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {job.location}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {job.required_skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.required_skills.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{job.required_skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            label={job.experience_level}
                            style={EXP_BADGE[job.experience_level]}
                          />
                        </td>

                        <td className="px-6 py-4">
                          <Badge
                            label={job.employment_type}
                            style={EMP_BADGE[job.employment_type]}
                          />
                        </td>

                        {/* ← ADD: Experience Years */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {job.experience_years != null ? (
                            `${job.experience_years} yr${job.experience_years !== 1 ? "s" : ""}`
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* ← ADD: Required Qualification */}
                        {/* <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px]">
                          {job.required_qualification ? (
                            <span className="line-clamp-2">
                              {job.required_qualification}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td> */}

                        <td className="px-6 py-4">
                          <Badge
                            label={job.status}
                            style={
                              job.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }
                          />
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {job.created_at}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* View button */}
                            <button
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              className="text-gray-500 hover:text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <FaRegEye />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => navigate(`/jobs/${job.id}/edit`)}
                              className="text-indigo-500 hover:text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                              <FaUserEdit />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget(job)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
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
      </div>

      {deleteTarget && (
        <DeleteModal
          title="Delete Job Description"
          description={
            <>
              Are you sure you want to delete{" "}
              <strong className="text-gray-800">"{deleteTarget.title}"</strong>?
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
