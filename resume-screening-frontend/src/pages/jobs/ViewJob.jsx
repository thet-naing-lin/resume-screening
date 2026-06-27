import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJob } from "../../api/jobApi";

const EXP_BADGE = {
  junior: "bg-emerald-50 text-emerald-700 border-emerald-200",
  mid: "bg-blue-50 text-blue-700 border-blue-200",
  senior: "bg-purple-50 text-purple-700 border-purple-200",
};

const EMP_BADGE = {
  "full-time": "bg-brand-50 text-brand-700 border-brand-200",
  "part-time": "bg-amber-50 text-amber-700 border-amber-200",
  contract: "bg-orange-50 text-orange-700 border-orange-200",
  internship: "bg-pink-50 text-pink-700 border-pink-200",
  freelance: "bg-teal-50 text-teal-700 border-teal-200",
};

function Badge({ label, style }) {
  return <span className={`badge border ${style}`}>{label}</span>;
}

export default function ViewJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await getJob(id);
        setJob(res.data.job);
      } catch {
        setError("Failed to load job description.");
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout>
        <div className="flash-error mx-auto max-w-4xl">{error || "Job not found."}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => navigate("/jobs")}
          className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-700 mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Job Descriptions
        </button>

        {/* Header card with gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700
                        p-6 md:p-8 text-white shadow-xl shadow-brand-500/20 mb-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 rounded-full translate-y-1/3" />

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{job.title}</h1>
              {job.location && (
                <p className="flex items-center gap-1.5 text-brand-100/70 text-sm mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge label={job.experience_level} style={EXP_BADGE[job.experience_level] ?? ""} />
                <Badge label={job.employment_type} style={EMP_BADGE[job.employment_type] ?? ""} />
                <span className="badge border bg-surface-50/20 text-white border-white/20 backdrop-blur-sm">
                  {job.status}
                </span>
              </div>
            </div>

            <Link
              to={`/jobs/${job.id}/edit`}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm
                         border border-white/10 rounded-2xl text-sm font-semibold text-white
                         hover:bg-white/25 transition-all shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          </div>

          {/* Meta row */}
          <div className="relative flex flex-wrap gap-x-8 gap-y-1 mt-6 pt-5 border-t border-white/10
                          text-xs text-brand-100/60">
            <span>Created by <strong className="text-brand-100/90">{job.created_by}</strong></span>
            <span>Created <strong className="text-brand-100/90">{job.created_at}</strong></span>
            <span>Updated <strong className="text-brand-100/90">{job.updated_at}</strong></span>
            {job.experience_years != null && (
              <span>Experience <strong className="text-brand-100/90">{job.experience_years} yr{job.experience_years !== 1 ? "s" : ""}</strong></span>
            )}
          </div>
        </div>

        {/* Two-column details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Description — takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-surface-200 shadow-card p-6 md:p-8">
            <h2 className="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand-500 rounded-full" />
              Job Description
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Sidebar — Skills & Qualification */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-6">
              <h2 className="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-brand-500 rounded-full" />
                Required Skills
                <span className="text-xs font-normal text-surface-400 ml-1">({job.required_skills.length})</span>
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {job.required_skills.map((skill) => (
                  <span key={skill}
                        className="bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-xl font-medium
                                   border border-brand-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Qualification */}
            {job.required_qualification && (
              <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-6">
                <h2 className="text-base font-semibold text-surface-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-brand-500 rounded-full" />
                  Required Qualification
                </h2>
                <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-line">
                  {job.required_qualification}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
