import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJobs } from "../../api/jobApi";
import { exportRankingsCsv } from "../../api/candidatesRankingApi";

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
        const jobs = Array.isArray(raw) ? raw : Array.isArray(raw?.jobs) ? raw.jobs : [];
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
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Reports & Export</h1>
            <p>Export candidate ranking data as CSV for offline review or reporting.</p>
          </div>
        </div>

        {/* Export Card */}
        <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-brand-50 text-brand-600 rounded-2xl p-3.5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-surface-900 text-lg">
                Candidate Rankings Export
              </h2>
              <p className="text-sm text-surface-500 mt-0.5">
                Download a CSV file of ranked candidates for a selected job position.
                Includes scores, status, AI summary, and interview questions.
              </p>
            </div>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Job Position <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedJob}
                onChange={(e) => {
                  setSelectedJob(e.target.value);
                  setExportSuccess(false);
                  setExportError(null);
                }}
                className="select-field w-full"
              >
                <option value="">-- Select a job --</option>
                {jobDescriptions.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select-field w-full"
              >
                <option value="">All Candidates</option>
                <option value="shortlisted">Shortlisted Only</option>
                <option value="under_review">Under Review Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>
          </div>

          {/* CSV includes info */}
          <div className="bg-surface-50 rounded-2xl p-5 mb-6">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
              CSV includes
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                <div key={item} className="flex items-center gap-2 text-xs text-surface-600">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          {exportError && (
            <div className="flash-error mb-4">
              <span>{exportError}</span>
              <button onClick={() => setExportError(null)} className="font-bold ml-4">✕</button>
            </div>
          )}

          {exportSuccess && (
            <div className="flash-success mb-4">
              <span>
                Export successful!
                {selectedJobTitle && (
                  <span className="font-medium"> "{selectedJobTitle}"</span>
                )}{" "}
                rankings downloaded.
              </span>
              <button onClick={() => setExportSuccess(false)} className="font-bold ml-4">✕</button>
            </div>
          )}

          {/* Download button — uses brand primary, not green */}
          <button
            onClick={handleExport}
            disabled={!selectedJob || exporting}
            className="btn-primary"
          >
            {exporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
