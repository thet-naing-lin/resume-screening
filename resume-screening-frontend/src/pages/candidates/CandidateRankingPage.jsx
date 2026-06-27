import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJobs } from "../../api/jobApi";
import { useRankings } from "../../hooks/useRankings";
import {
  exportRankingsCsv,
  updateCandidateStatus,
} from "../../api/candidatesRankingApi";
import AiInsightsModal from "../../components/candidates/AiInsightsModal";
import SendMailModal from "../../components/candidates/SendMailModal";
import BulkMailModal from "../../components/candidates/BulkMailModal";
import { getMailTemplate } from "../../api/candidateMailApi";

// ── Helpers ──────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color =
    score >= 75
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 50
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`badge border ${color}`}>
      {Number(score).toFixed(1)}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    shortlisted: { style: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Shortlisted" },
    under_review: { style: "bg-blue-50 text-blue-700 border-blue-200", label: "Under Review" },
    rejected: { style: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
  };
  const cfg = map[status] ?? map["under_review"];
  return (
    <span className={`badge border ${cfg.style}`}>{cfg.label}</span>
  );
}

const getRankMedal = (index) => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
};

// ── Main Component ────────────────────────────────────────────
export default function CandidateRankingPage() {
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState("");
  const [filters, setFilters] = useState({
    min_score: "",
    max_score: "",
    status: "",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const [aiTarget, setAiTarget] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [mailTarget, setMailTarget] = useState(null);

  const [bulkStatus, setBulkStatus] = useState(null);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const response = await exportRankingsCsv({
        job_description_id: selectedJob,
        ...(activeFilters.status && { status: activeFilters.status }),
        ...(activeFilters.min_score && { min_score: activeFilters.min_score }),
        ...(activeFilters.max_score && { max_score: activeFilters.max_score }),
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      const match = disposition?.match(/filename="?([^"]+)"?/);
      link.setAttribute("download", match?.[1] ?? "rankings.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setExportError("Export failed. Please check your connection and try again.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    setJobsLoading(true);
    getJobs()
      .then((res) => {
        const raw = res.data;
        const jobs = Array.isArray(raw) ? raw : Array.isArray(raw?.jobs) ? raw.jobs : [];
        setJobDescriptions(jobs);
      })
      .catch((err) => console.error("Failed to load jobs:", err))
      .finally(() => setJobsLoading(false));
  }, []);

  const { candidates, meta, loading, error, refetch, updateCandidateLocally } =
    useRankings(selectedJob, activeFilters);

  const handleApplyFilters = () => setActiveFilters({ ...filters });
  const handleClearFilters = () => {
    const empty = { min_score: "", max_score: "", status: "" };
    setFilters(empty);
    setActiveFilters({});
  };

  const handleStatusChange = async (resumeId, newStatus) => {
    updateCandidateLocally(resumeId, newStatus);
    setUpdatingId(resumeId);
    try {
      await updateCandidateStatus(resumeId, newStatus);
    } catch {
      alert("Failed to update status. Reverting...");
      refetch();
    } finally {
      setUpdatingId(null);
    }
  };

  const openBulk = async (status) => {
    const type = status === "shortlisted" ? "interview" : "rejection";
    const jobTitle =
      jobDescriptions.find((j) => String(j.id) === String(selectedJob))?.title ?? "the position";
    try {
      const res = await getMailTemplate(type, "Candidate", jobTitle);
      setBulkSubject(res.data.subject);
      setBulkBody(res.data.body);
    } catch {
      setBulkSubject("");
      setBulkBody("");
    }
    setBulkStatus(status);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="page-header">
          <div>
            <h1>Candidate Rankings</h1>
            <p>Select a job position to view ranked candidates.</p>
          </div>
        </div>

        {/* Job Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Job Position
          </label>
          <select
            value={selectedJob}
            onChange={(e) => { setSelectedJob(e.target.value); handleClearFilters(); }}
            className="select-field w-80"
            disabled={jobsLoading}
          >
            <option value="">{jobsLoading ? "Loading jobs..." : "-- Choose a job --"}</option>
            {jobDescriptions.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        {selectedJob && (
          <>
            {/* Filter Panel */}
            <div className="bg-surface-50 border border-surface-200 rounded-3xl p-5 mb-6">
              <h2 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Candidates
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Min Score</label>
                  <input type="number" min="0" max="100" placeholder="e.g. 60"
                         value={filters.min_score}
                         onChange={(e) => setFilters({ ...filters, min_score: e.target.value })}
                         className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Max Score</label>
                  <input type="number" min="0" max="100" placeholder="e.g. 90"
                         value={filters.max_score}
                         onChange={(e) => setFilters({ ...filters, max_score: e.target.value })}
                         className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Status</label>
                  <select value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          className="select-field w-full">
                    <option value="">All Statuses</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleApplyFilters} className="btn-primary">Apply Filters</button>
                <button onClick={handleClearFilters} className="btn-secondary">Clear</button>
              </div>
            </div>

            {/* Results count */}
            {!loading && meta && (
              <p className="text-sm text-surface-500 mb-3">
                Showing <strong className="text-surface-700">{candidates.length}</strong> of{" "}
                <strong className="text-surface-700">{meta.total}</strong> candidates
              </p>
            )}

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-3xl border border-surface-200 p-12 text-center shadow-card">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-surface-100 rounded-2xl" />
                  ))}
                </div>
                <p className="text-surface-400 text-sm mt-4">Loading rankings...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flash-error">{error}</div>
            )}

            {/* Empty state */}
            {!loading && !error && candidates.length === 0 && (
              <div className="bg-white rounded-3xl border border-surface-200 py-16 text-center shadow-card">
                <p className="text-4xl mb-4">🔎</p>
                <p className="font-semibold text-surface-500">No candidates found.</p>
                <p className="text-sm text-surface-400 mt-1">
                  Try clearing the filters or upload more resumes for this job.
                </p>
              </div>
            )}

            {/* Ranking Table */}
            {!loading && candidates.length > 0 && (
              <div className="table-card">
                <div className="table-card-header">
                  <div>
                    <h2>
                      Ranked Candidates
                      <span className="text-sm text-surface-400 font-normal ml-2">({meta?.total} total)</span>
                    </h2>
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-2 inline-block">
                      💡 For AI Insights, need VPN in Myanmar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openBulk("shortlisted")}
                            className="btn-secondary !text-brand-600 !border-brand-200 hover:!bg-brand-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Shortlisted
                    </button>
                    <button onClick={() => openBulk("rejected")}
                            className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Rejected
                    </button>
                    <button onClick={handleExport} disabled={exporting || candidates.length === 0}
                            className="btn-primary !bg-emerald-500 hover:!bg-emerald-600 !shadow-emerald-500/20
                                       disabled:!opacity-50 disabled:!cursor-not-allowed">
                      {exporting ? "Exporting..." : "Export CSV"}
                    </button>
                  </div>
                </div>

                {exportError && (
                  <div className="mx-6 mt-3 flash-error">{exportError}
                    <button onClick={() => setExportError(null)} className="ml-4 text-red-400 hover:text-red-600 font-bold">✕</button>
                  </div>
                )}

                <div className="overflow-x-auto table-container">
                  <table>
                    <thead>
                      <tr>
                        <th className="text-left">Rank</th>
                        <th className="text-left">Candidate</th>
                        <th className="text-center">Exp.</th>
                        <th className="text-center">TF-IDF</th>
                        <th className="text-center">Semantic</th>
                        <th className="text-center">Final Score</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((item, index) => (
                        <tr key={item.resume_id}>
                          <td className="font-mono text-lg font-semibold">{getRankMedal(index)}</td>
                          <td>
                            <p className="font-semibold text-surface-900">{item.candidate.name}</p>
                            <p className="text-surface-400 text-xs">{item.candidate.email}</p>
                            <p className="text-surface-400 text-xs truncate max-w-[180px]">
                              📄 {item.original_filename}
                            </p>
                          </td>
                          <td className="text-center text-surface-600">
                            {item.candidate.experience_years != null ? `${item.candidate.experience_years} yr` : "—"}
                          </td>
                          <td className="text-center"><ScoreBadge score={item.score.tfidf_score} /></td>
                          <td className="text-center"><ScoreBadge score={item.score.semantic_score} /></td>
                          <td className="text-center">
                            <span className="text-lg font-bold text-surface-900">
                              {Number(item.score.final_score).toFixed(1)}
                            </span>
                            <span className="text-xs text-surface-400"> /100</span>
                          </td>
                          <td className="text-center"><StatusBadge status={item.score.status} /></td>
                          <td>
                            <div className="flex flex-col items-center gap-1.5">
                              <select
                                value={item.score.status}
                                disabled={updatingId === item.resume_id}
                                onChange={(e) => handleStatusChange(item.resume_id, e.target.value)}
                                className="border border-surface-200 rounded-xl px-2 py-1 text-xs w-full max-w-[120px]
                                           disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30
                                           bg-white text-surface-700"
                              >
                                <option value="shortlisted">Shortlist</option>
                                <option value="under_review">Under Review</option>
                                <option value="rejected">Reject</option>
                              </select>
                              <button onClick={() => setAiTarget(item)}
                                      className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100
                                                 px-3 py-1.5 rounded-xl transition-colors w-full max-w-[120px]
                                                 font-medium">
                                ✨ AI Insights
                              </button>
                              <button onClick={() => setMailTarget(item)}
                                      className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                                                 px-3 py-1.5 rounded-xl transition-colors w-full max-w-[120px]
                                                 font-medium">
                                ✉️ Send Mail
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                  <div className="flex justify-center gap-2 px-6 py-4 border-t border-surface-100">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => refetch(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                          page === meta.current_page
                            ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                            : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {aiTarget && <AiInsightsModal resume={aiTarget} onClose={() => setAiTarget(null)} />}
      {mailTarget && (
        <SendMailModal
          resume={mailTarget}
          jobTitle={jobDescriptions.find((j) => String(j.id) === String(selectedJob))?.title ?? ""}
          onClose={() => setMailTarget(null)}
        />
      )}
      {bulkStatus && (
        <BulkMailModal
          status={bulkStatus}
          jobDescriptionId={selectedJob}
          defaultSubject={bulkSubject}
          defaultBody={bulkBody}
          onClose={() => setBulkStatus(null)}
        />
      )}
    </DashboardLayout>
  );
}
