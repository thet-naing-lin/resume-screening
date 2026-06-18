// src/components/ResumeUploadForm.jsx
import { useState, useEffect, useRef } from "react";
import { getJobs } from "../api/jobApi";
import { uploadResumes } from "../api/resumeApi";

export default function ResumeUploadForm() {
  const [files, setFiles] = useState([]); // array of File objects
  const [jobId, setJobId] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [results, setResults] = useState(null); // { uploaded[], failed[] }
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getJobs()
      .then((res) => setJobs(res.data.jobs))
      .catch(() => setError("Could not load job list. Please refresh."))
      .finally(() => setJobsLoading(false));
  }, []);

  // Add files — prevent duplicates by filename
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
      // Prevent duplicate filenames
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
      // Scroll back up to show the error to the user
      window.scrollTo({ top: 0, behavior: "smooth" });
      return; // stop — don't submit
    }

    setError("");
    setResults(null);
    setFieldErrors({});
    setLoading(true);

    // Build FormData — append each file with the same key + []
    const formData = new FormData();
    files.forEach((f) => formData.append("resume_files[]", f));
    formData.append("job_description_id", jobId);

    try {
      const res = await uploadResumes(formData);
      setResults(res.data);
      setFiles([]); // clear queue
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors || {});
      } else {
        setError("Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── RESULTS STATE ─────────────────────────────────────────────
  if (results) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-7 h-7 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {results.message}
          </h2>
        </div>

        {/* Uploaded list */}
        {results.uploaded.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Uploaded
            </p>
            <div className="space-y-2">
              {results.uploaded.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-lg px-4 py-2.5"
                >
                  <svg
                    className="w-4 h-4 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 flex-1">
                    {r.filename}
                  </span>
                  <span className="text-xs text-gray-400">ID #{r.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed list */}
        {results.failed.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Failed
            </p>
            <div className="space-y-2">
              {results.failed.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5"
                >
                  <svg
                    className="w-4 h-4 text-red-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 flex-1">
                    {r.filename}
                  </span>
                  <span className="text-xs text-red-400">{r.error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setResults(null)}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          Upload More
        </button>
      </div>
    );
  }

  // ── FORM STATE ────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Job Selector */}
        <div>
          <label
            htmlFor="job_id"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Job Position <span className="text-red-500">*</span>
          </label>
          {jobsLoading ? (
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <select
              id="job_id"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Select a job position —</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          )}
          {fieldErrors.job_description_id && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.job_description_id[0]}
            </p>
          )}
        </div>

        {/* Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resume Files <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1">
              (up to 10 files)
            </span>
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-colors
              ${
                dragging
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
              }
            `}
          >
            <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">
              {dragging ? "Drop files here!" : "Drag & drop resumes here"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              or click to browse multiple files
            </p>
            <p className="text-xs text-gray-400 mt-2">
              PDF or DOCX · Max 5MB each
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple // ← this enables multi-select
              onChange={(e) => addFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File validation errors */}
          {fieldErrors.resume_files &&
            Array.isArray(fieldErrors.resume_files) && (
              <div className="mt-2 space-y-1">
                {fieldErrors.resume_files.map((e, i) => (
                  <p key={i} className="text-red-500 text-xs">
                    {e}
                  </p>
                ))}
              </div>
            )}
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {files.length} file{files.length > 1 ? "s" : ""} ready to upload
            </p>
            <div className="space-y-2">
              {files.map((f, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${f.name.endsWith(".pdf") ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {f.name.endsWith(".pdf") ? "PDF" : "DOC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">
                      {(f.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Over-limit warning — shows near submit button when > 10 files */}
        {files.length > 10 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-800 text-sm px-4 py-3 rounded-lg">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <div>
              <p className="font-medium">Too many files selected</p>
              <p className="text-amber-700 mt-0.5">
                You have {files.length} files. Please remove {files.length - 10}{" "}
                to continue. Maximum is 10 per upload.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={
            loading ||
            jobsLoading ||
            files.length === 0 ||
            !jobId ||
            files.length > 10
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Uploading {files.length} file{files.length > 1 ? "s" : ""}...
            </>
          ) : (
            `Upload ${files.length > 0 ? files.length : ""} Resume${files.length !== 1 ? "s" : ""}`
          )}
        </button>
      </form>
    </div>
  );
}
