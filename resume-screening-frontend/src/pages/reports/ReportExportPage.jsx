import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";
import { ImSpinner9 } from "react-icons/im";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJobs } from "../../api/jobApi";
import { exportRankingsCsv } from "../../api/candidatesRankingApi";

export default function ReportsExportPage() {
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);

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
      toast.success(`Export successful!${selectedJobTitle ? ` "${selectedJobTitle}"` : ""} rankings downloaded.`);
    } catch {
      toast.error("Export failed. Please try again.");
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
        <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-6 md:p-8
                        dark:bg-surface-900 dark:border-surface-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-brand-50 text-brand-600 rounded-2xl p-3.5 dark:bg-brand-900/30 dark:text-brand-400">
              <HiOutlineChartBar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-surface-900 text-lg dark:text-surface-50">
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
              <label className="block text-sm font-medium text-surface-700 mb-1.5 dark:text-surface-300">
                Job Position <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="select-field w-full"
              >
                <option value="">-- Select a job --</option>
                {jobDescriptions.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5 dark:text-surface-300">
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
          <div className="bg-surface-50 rounded-2xl p-5 mb-6 dark:bg-surface-800">
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
                <div key={item} className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-300">
                  <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Download button — uses brand primary, not green */}
          <button
            onClick={handleExport}
            disabled={!selectedJob || exporting}
            className="btn-primary"
          >
            {exporting ? (
              <>
                <ImSpinner9 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <HiOutlineArrowDownTray className="w-4 h-4" />
                Download CSV
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
