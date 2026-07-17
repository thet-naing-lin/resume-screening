// src/components/ResumeUploadForm.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineArrowUpTray,
  HiOutlineExclamationTriangle,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { ImSpinner9 } from "react-icons/im";
import { getJobs } from "../api/jobApi";
import { uploadResumes } from "../api/resumeApi";

export default function ResumeUploadForm() {
  const [files, setFiles] = useState([]);
  const [jobId, setJobId] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getJobs()
      .then((res) => setJobs(res.data.data))
      .catch(() => toast.error("Could not load job list. Please refresh."))
      .finally(() => setJobsLoading(false));
  }, []);

  const addFiles = (newFiles) => {
    const validExts = ["pdf", "docx"];
    const toAdd = [];
    const errors = [];

    Array.from(newFiles).forEach((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!validExts.includes(ext)) {
        errors.push(`"${f.name}" is not a PDF or DOCX.`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        errors.push(`"${f.name}" exceeds 5MB.`);
        return;
      }
      if (files.some((existing) => existing.name === f.name)) {
        errors.push(`"${f.name}" is already in the list.`);
        return;
      }
      toAdd.push(f);
    });

    if (errors.length > 0) {
      setFieldErrors({ resume_files: errors });
    } else {
      setFieldErrors({});
    }

    if (toAdd.length > 0) {
      setFiles((prev) => [...prev, ...toAdd]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    if (files.length > 10) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setResults(null);
    setFieldErrors({});
    setLoading(true);

    const formData = new FormData();
    files.forEach((f) => formData.append("resume_files[]", f));
    formData.append("job_description_id", jobId);

    try {
      const res = await uploadResumes(formData);
      setResults(res.data);
      toast.success("Resumes uploaded successfully!");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors || {});
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── RESULTS STATE ─────────────────────────────────────────────
  if (results) {
    const uploadedCount = results.uploaded?.length ?? 0;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl
                          flex items-center justify-center mx-auto mb-4
                          dark:bg-emerald-900/30 dark:border-emerald-800">
            <HiOutlineCheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">{results.message}</h2>
        </div>

        {uploadedCount > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
              Uploaded ({uploadedCount})
            </p>
            <div className="space-y-2">
              {results.uploaded.map((r) => (
                <div key={r.id}
                     className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3
                                dark:bg-emerald-900/20 dark:border-emerald-800">
                  <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-surface-700 flex-1 font-medium dark:text-surface-200">{r.filename}</span>
                  <span className="text-xs text-surface-400">#{r.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.failed.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
              Failed ({results.failed.length})
            </p>
            <div className="space-y-2">
              {results.failed.map((r, i) => (
                <div key={i}
                     className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3
                                dark:bg-red-900/20 dark:border-red-800">
                  <HiOutlineXMark className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-surface-700 flex-1 font-medium dark:text-surface-200">{r.filename}</span>
                  <span className="text-xs text-red-500 dark:text-red-400">{r.error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {uploadedCount > 0 && (
            <Link to="/resumes" className="btn-primary flex-1 justify-center">
              <HiOutlineClipboardDocumentCheck className="w-4 h-4" />
              View & Track Progress
            </Link>
          )}
          <button onClick={() => setResults(null)}
                  className={`btn-secondary justify-center ${uploadedCount === 0 ? "w-full" : "flex-1"}`}>
            Upload More
          </button>
        </div>
      </div>
    );
  }

  // ── FORM STATE ────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Selector */}
        <div>
          <label htmlFor="job_id" className="block text-sm font-medium text-surface-700 mb-1.5 dark:text-surface-300">
            Job Position <span className="text-red-500">*</span>
          </label>
          <select
            id="job_id"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            required
            disabled={jobsLoading}
            className="select-field w-full"
          >
            <option value="">{jobsLoading ? "Loading jobs..." : "— Select a job position —"}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          {fieldErrors.job_description_id && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.job_description_id[0]}</p>
          )}
        </div>

        {/* Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5 dark:text-surface-300">
            Resume Files <span className="text-red-500">*</span>
            <span className="text-surface-400 font-normal ml-1">(up to 10 files)</span>
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-all
              ${dragging
                ? "border-brand-400 bg-brand-50/50 scale-[1.01] dark:bg-brand-900/20"
                : "border-surface-200 bg-surface-50 hover:border-brand-300 hover:bg-brand-50/30 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/10"
              }`}
          >
            <div className="w-14 h-14 bg-white border border-surface-200 rounded-2xl
                            flex items-center justify-center mx-auto mb-4 shadow-sm
                            group-hover:border-brand-200 transition-colors
                            dark:bg-surface-900 dark:border-surface-700">
              <HiOutlineArrowUpTray className="w-6 h-6 text-brand-500" />
            </div>
            <p className="text-sm font-semibold text-surface-700 dark:text-surface-200">
              {dragging ? "Drop files here!" : "Drag & drop resumes here"}
            </p>
            <p className="text-xs text-surface-400 mt-1">or click to browse multiple files</p>
            <p className="text-xs text-surface-400 mt-3 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              PDF or DOCX · Max 5MB each
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {fieldErrors.resume_files && Array.isArray(fieldErrors.resume_files) && (
            <div className="mt-2 space-y-1">
              {fieldErrors.resume_files.map((e, i) => (
                <p key={i} className="text-red-500 text-xs">{e}</p>
              ))}
            </div>
          )}
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
              {files.length} file{files.length > 1 ? "s" : ""} ready to upload
            </p>
            <div className="space-y-2">
              {files.map((f, index) => (
                <div key={index}
                     className="flex items-center gap-3 bg-white border border-surface-200 rounded-2xl
                                px-4 py-3 shadow-card dark:bg-surface-900 dark:border-surface-800">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${f.name.endsWith(".pdf")
                      ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      : "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"}`}>
                    {f.name.endsWith(".pdf") ? "PDF" : "DOC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-800 font-medium truncate dark:text-surface-200">{f.name}</p>
                    <p className="text-xs text-surface-400">{(f.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-surface-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50
                               dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Over-limit warning */}
        {files.length > 10 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800
                          text-sm px-5 py-4 rounded-2xl
                          dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
            <HiOutlineExclamationTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
            <div>
              <p className="font-semibold">Too many files selected</p>
              <p className="text-amber-700 mt-0.5 dark:text-amber-400">
                You have {files.length} files. Please remove {files.length - 10} to continue. Maximum is 10 per upload.
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || jobsLoading || files.length === 0 || !jobId || files.length > 10}
          className="btn-primary w-full justify-center !py-3"
        >
          {loading ? (
            <>
              <ImSpinner9 className="w-5 h-5 animate-spin" />
              Uploading {files.length} file{files.length > 1 ? "s" : ""}...
            </>
          ) : (
            <>
              <HiOutlineArrowUpTray className="w-5 h-5" />
              Upload {files.length > 0 ? files.length : ""} Resume{files.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
