import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJobs } from "../../api/jobApi";
import { exportRankingsCsv } from "../../api/candidatesRankingApi";
import { useEffect } from "react";

export default function ReportsExportPage() {
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    getJobs()
      .then((res) => {
        const raw = res.data;
        const jobs = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.jobs)
            ? raw.jobs
            : [];
        setJobDescriptions(jobs);
      })
      .catch(console.error);
  }, []);

  const handleExport = async () => {
    if (!selectedJob) return;

    setExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      const response = await exportRankingsCsv({
        job_description_id: selectedJob,
        ...(statusFilter && { status: statusFilter }),
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
      setExportSuccess(true);
    } catch {
      setExportError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const selectedJobTitle = jobDescriptions.find(
    (j) => String(j.id) === String(selectedJob),
  )?.title;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>
          <p className="text-sm text-gray-500 mt-1">
            Export candidate ranking data as CSV for offline review or
            reporting.
          </p>
        </div>

        {/* Export Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-green-100 text-green-700 rounded-xl p-3 text-2xl">
              📊
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                Candidate Rankings Export
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Download a CSV file of ranked candidates for a selected job
                position. Includes scores, status, AI summary, and interview
                questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Job selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Position <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedJob}
                onChange={(e) => {
                  setSelectedJob(e.target.value);
                  setExportSuccess(false);
                  setExportError(null);
                }}
                className="border border-gray-300 rounded-xl px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">-- Select a job --</option>
                {jobDescriptions.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">All Candidates</option>
                <option value="shortlisted">Shortlisted Only</option>
                <option value="under_review">Under Review Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>
          </div>

          {/* What's included info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              CSV includes
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
              {[
                "Rank & Candidate Name",
                "Email & Phone",
                "TF-IDF Score",
                "Semantic Score",
                "Final Score",
                "Screening Status",
                "AI Summary",
                "5 Interview Questions",
                "Upload Date",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-gray-600"
                >
                  <span className="text-green-500">✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback messages */}
          {exportError && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              <span>⚠️ {exportError}</span>
              <button
                onClick={() => setExportError(null)}
                className="text-red-400 hover:text-red-600 font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {exportSuccess && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
              <span>
                ✅ Export successful!
                {selectedJobTitle && (
                  <span className="font-medium"> "{selectedJobTitle}"</span>
                )}{" "}
                rankings downloaded.
              </span>
              <button
                onClick={() => setExportSuccess(false)}
                className="text-green-400 hover:text-green-600 font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={!selectedJob || exporting}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? "⏳ Exporting..." : "⬇️ Download CSV"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
