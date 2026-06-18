import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ResumeUploadForm from "../../components/ResumeUploadForm";

export default function UploadResume() {
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          {/* Back button */}
          <Link
            to="/resumes"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
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
            Back to Resumes
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Upload Resume</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a candidate's PDF or DOCX resume and link it to a job
            position.
          </p>
        </div>

        {/* Card wrapper */}
        <div className="bg-white rounded-lg shadow p-6">
          <ResumeUploadForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
