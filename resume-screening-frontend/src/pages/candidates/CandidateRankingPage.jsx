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
      ? "bg-green-100 text-green-800"
      : score >= 50
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {Number(score).toFixed(1)}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    shortlisted: { style: "bg-green-100 text-green-700", label: "Shortlisted" },
    under_review: { style: "bg-blue-100 text-blue-700", label: "Under Review" },
    rejected: { style: "bg-red-100 text-red-700", label: "Rejected" },
  };
  const cfg = map[status] ?? map["under_review"];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.style}`}>
      {cfg.label}
    </span>
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
  const [selectedJob, setSelectedJob] = useState("");
  const [filters, setFilters] = useState({
    min_score: "",
    max_score: "",
    status: "",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const [aiTarget, setAiTarget] = useState(null); // the selected resume row

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const [mailTarget, setMailTarget] = useState(null);

  const [bulkStatus, setBulkStatus] = useState(null); // 'shortlisted' | 'rejected' | null
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);

    try {
      const response = await exportRankingsCsv({
        job_description_id: selectedJob,
        // pass active filters too so CSV matches what HR sees on screen
        ...(activeFilters.status && { status: activeFilters.status }),
        ...(activeFilters.min_score && { min_score: activeFilters.min_score }),
        ...(activeFilters.max_score && { max_score: activeFilters.max_score }),
      });

      // Create a temporary download link and click it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header if available
      const disposition = response.headers["content-disposition"];
      const match = disposition?.match(/filename="?([^"]+)"?/);
      link.setAttribute("download", match?.[1] ?? "rankings.csv");

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setExportError(
        "Export failed. Please check your connection and try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  // ── Fetch jobs ONCE on mount — one useEffect, one method ──
  useEffect(() => {
    getJobs()
      .then((res) => {
        // handle both { data: [...] } and { data: { data: [...] } }
        const raw = res.data;
        const jobs = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.jobs)
            ? raw.jobs
            : // : Array.isArray(raw?.data)
              //   ? raw.data
              [];

        setJobDescriptions(jobs);
      })
      .catch((err) => console.error("Failed to load jobs:", err));
  }, []); // empty deps = runs once only

  // ── Rankings data via custom hook ──────────────────────────
  const { candidates, meta, loading, error, refetch, updateCandidateLocally } =
    useRankings(selectedJob, activeFilters);

  const handleApplyFilters = () => setActiveFilters({ ...filters });

  const handleClearFilters = () => {
    const empty = { min_score: "", max_score: "", status: "" };
    setFilters(empty);
    setActiveFilters({});
  };

  const handleStatusChange = async (resumeId, newStatus) => {
    // 1. Update UI instantly — no scroll jump
    updateCandidateLocally(resumeId, newStatus);
    setUpdatingId(resumeId);

    try {
      // 2. Persist to backend in background
      await updateCandidateStatus(resumeId, newStatus);
    } catch {
      // 3. If it fails, revert by refetching the real data
      alert("Failed to update status. Reverting...");
      refetch();
    } finally {
      setUpdatingId(null);
    }
  };

  // Pre-load the template then open modal
  const openBulk = async (status) => {
    const type = status === "shortlisted" ? "interview" : "rejection";
    const jobTitle =
      jobDescriptions.find((j) => String(j.id) === String(selectedJob))
        ?.title ?? "the position";

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
  // ── Render ─────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Candidate Rankings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Select a job position to view ranked candidates.
          </p>
        </div>

        {/* ── Job Selector ───────────────────────────── */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Position
          </label>
          <select
            value={selectedJob}
            onChange={(e) => {
              setSelectedJob(e.target.value);
              handleClearFilters();
            }}
            className="border border-gray-300 rounded-xl px-3 py-2 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">-- Choose a job --</option>
            {jobDescriptions.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {/* ── Everything below only shows after a job is selected ── */}
        {selectedJob && (
          <>
            {/* Filter Panel */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                🔍 Filter Candidates
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Min Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 60"
                    value={filters.min_score}
                    onChange={(e) =>
                      setFilters({ ...filters, min_score: e.target.value })
                    }
                    className="border rounded-xl px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 90"
                    value={filters.max_score}
                    onChange={(e) =>
                      setFilters({ ...filters, max_score: e.target.value })
                    }
                    className="border rounded-xl px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="border rounded-xl px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">All Statuses</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleApplyFilters}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Results count */}
            {!loading && meta && (
              <p className="text-sm text-gray-500 mb-3">
                Showing <strong>{candidates.length}</strong> of{" "}
                <strong>{meta.total}</strong> candidates
              </p>
            )}

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  Loading rankings...
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && candidates.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">🔎</p>
                <p className="font-medium text-gray-500">
                  No candidates found.
                </p>
                <p className="text-sm mt-1">
                  Try clearing the filters or upload more resumes for this job.
                </p>
              </div>
            )}

            {/* Ranking Table */}
            {!loading && candidates.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">
                    Ranked Candidates
                  </h2>
                  <span className="text-sm text-gray-400">
                    {meta?.total} total
                  </span>
                </div> */}

                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">
                    Ranked Candidates
                    <span className="text-xs text-gray-400">
                      ({meta?.total} total)
                    </span>
                  </h2>

                  <div className="flex items-center gap-2">
                    {/* 🆕 Bulk Email buttons */}
                    <button
                      onClick={() => openBulk("shortlisted")}
                      className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
                    >
                      📨 Email Shortlisted
                    </button>
                    <button
                      onClick={() => openBulk("rejected")}
                      className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      📨 Email Rejected
                    </button>

                    {/* existing Export CSV button — untouched */}
                    <button
                      onClick={handleExport}
                      disabled={exporting || candidates.length === 0}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {exporting ? <>⏳ Exporting...</> : <>⬇️ Export CSV</>}
                    </button>
                  </div>
                </div>

                {/* ── Export error message — shows below header, above table ── */}
                {exportError && (
                  <div className="mx-6 mt-3 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    <span>⚠️ {exportError}</span>
                    <button
                      onClick={() => setExportError(null)}
                      className="ml-4 text-red-400 hover:text-red-600 font-bold text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">Rank</th>
                        <th className="px-4 py-3 text-left">Candidate</th>
                        <th className="px-4 py-3 text-center">Exp.</th>
                        <th className="px-4 py-3 text-center">TF-IDF</th>
                        <th className="px-4 py-3 text-center">Semantic</th>
                        <th className="px-4 py-3 text-center">Final Score</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {candidates.map((item, index) => (
                        <tr
                          key={item.resume_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-lg">
                            {getRankMedal(index)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900">
                              {item.candidate.name}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {item.candidate.email}
                            </p>
                            <p className="text-gray-400 text-xs truncate max-w-[180px]">
                              📄 {item.original_filename}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-center text-gray-600">
                            {item.candidate.experience_years != null
                              ? `${item.candidate.experience_years} yr`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ScoreBadge score={item.score.tfidf_score} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ScoreBadge score={item.score.semantic_score} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-lg font-bold text-gray-900">
                              {Number(item.score.final_score).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400"> /100</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={item.score.status} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {/* Stack vertically — no more horizontal cramping */}
                            <div className="flex flex-col items-center gap-1.5">
                              <select
                                value={item.score.status}
                                disabled={updatingId === item.resume_id}
                                onChange={(e) =>
                                  handleStatusChange(
                                    item.resume_id,
                                    e.target.value,
                                  )
                                }
                                className="border rounded-lg px-2 py-1 text-xs w-full max-w-[120px] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              >
                                <option value="shortlisted">Shortlist</option>
                                <option value="under_review">
                                  Under Review
                                </option>
                                <option value="rejected">Reject</option>
                              </select>

                              <button
                                onClick={() => setAiTarget(item)}
                                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors w-full max-w-[120px] whitespace-nowrap"
                              >
                                ✨ AI Insights
                              </button>

                              <button
                                onClick={() => setMailTarget(item)}
                                className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors w-full max-w-[120px] whitespace-nowrap"
                              >
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
                  <div className="flex justify-center gap-2 px-6 py-4 border-t border-gray-100">
                    {Array.from(
                      { length: meta.last_page },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => refetch(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          page === meta.current_page
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
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

      {aiTarget && (
        <AiInsightsModal resume={aiTarget} onClose={() => setAiTarget(null)} />
      )}

      {mailTarget && (
        <SendMailModal
          resume={mailTarget}
          jobTitle={
            jobDescriptions.find((j) => String(j.id) === String(selectedJob))
              ?.title ?? ""
          }
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
