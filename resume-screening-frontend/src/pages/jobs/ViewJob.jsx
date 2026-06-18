import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJob } from "../../api/jobApi";

const EXP_BADGE = {
  junior: "bg-green-100 text-green-700",
  mid: "bg-blue-100 text-blue-700",
  senior: "bg-purple-100 text-purple-700",
};

const EMP_BADGE = {
  "full-time": "bg-indigo-100 text-indigo-700",
  "part-time": "bg-yellow-100 text-yellow-700",
  contract: "bg-orange-100 text-orange-700",
  internship: "bg-pink-100 text-pink-700",
  freelance: "bg-teal-100 text-teal-700",
};

function Badge({ label, style }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${style}`}
    >
      {label}
    </span>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
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
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            ❌ {error || "Job not found."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Job Descriptions
          </button>

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {job.title}
                </h1>
                {job.location && (
                  <p className="flex items-center gap-1 text-sm text-gray-400 mt-1">
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
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge
                    label={job.experience_level}
                    style={EXP_BADGE[job.experience_level]}
                  />
                  <Badge
                    label={job.employment_type}
                    style={EMP_BADGE[job.employment_type]}
                  />
                  <Badge
                    label={job.status}
                    style={
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/jobs/${job.id}/edit`)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
              </div>
            </div>

            {/* Meta info row */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6 text-xs text-gray-400">
              <span>
                Created by{" "}
                <strong className="text-gray-600">{job.created_by}</strong>
              </span>
              <span>
                Created on{" "}
                <strong className="text-gray-600">{job.created_at}</strong>
              </span>
              <span>
                Last updated{" "}
                <strong className="text-gray-600">{job.updated_at}</strong>
              </span>
              {job.experience_years != null && (
                <span>
                  Experience{" "}
                  <strong className="text-gray-600">
                    {job.experience_years} yr
                    {job.experience_years !== 1 ? "s" : ""}
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Job Description
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Skills card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Required Skills
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({job.required_skills.length} skills)
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Qualification card — only show if exists */}
          {job.required_qualification && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                Required Qualification
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {job.required_qualification}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
