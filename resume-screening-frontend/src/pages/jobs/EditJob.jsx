import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getJob, updateJob } from "../../api/jobApi";
import { SkillTagInput } from "../../components/jobs/JobFormFields";

// function SkillTagInput({ skills, onChange }) {
//   const [input, setInput] = useState("");
//   function addSkill(e) {
//     if ((e.key === "Enter" || e.key === ",") && input.trim()) {
//       e.preventDefault();
//       const s = input.trim().replace(",", "");
//       if (!skills.includes(s)) onChange([...skills, s]);
//       setInput("");
//     }
//   }
//   return (
//     <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-xl min-h-[48px] bg-white focus-within:ring-2 focus-within:ring-indigo-400">
//       {skills.map((skill) => (
//         <span
//           key={skill}
//           className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium"
//         >
//           {skill}
//           <button
//             type="button"
//             onClick={() => onChange(skills.filter((s) => s !== skill))}
//             className="text-indigo-400 hover:text-indigo-700 font-bold ml-1"
//           >
//             ×
//           </button>
//         </span>
//       ))}
//       <input
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={addSkill}
//         placeholder={
//           skills.length === 0 ? "Type a skill, press Enter" : "Add more..."
//         }
//         className="flex-1 outline-none text-sm min-w-[160px] bg-transparent"
//       />
//     </div>
//   );
// }

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    required_skills: [],
    required_qualification: "",
    experience_level: "",
    experience_years: "",
    employment_type: "",
    location: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitErr, setSubmitErr] = useState("");

  // Load existing job data
  useEffect(() => {
    async function loadJob() {
      try {
        const res = await getJob(id);
        const job = res.data.job;
        setForm({
          title: job.title,
          description: job.description,
          required_skills: job.required_skills,
          required_qualification: job.required_qualification ?? "",
          experience_level: job.experience_level,
          experience_years: job.experience_years ?? "",
          experience_years: job.experience_years ?? "",
          employment_type: job.employment_type,
          location: job.location ?? "",
          status: job.status,
        });
      } catch {
        setSubmitErr("Failed to load job description.");
      } finally {
        setFetching(false);
      }
    }
    loadJob();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Job title is required.";
    if (form.description.length < 20)
      e.description = "Description must be at least 20 characters.";
    if (form.required_skills.length === 0)
      e.required_skills = "Add at least one skill.";
    if (!form.experience_level)
      e.experience_level = "Select an experience level.";
    if (!form.employment_type) e.employment_type = "Select an employment type.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitErr("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      setLoading(true);
      await updateJob(id, form);
      navigate("/jobs", {
        state: { flash: "Job description updated successfully!" },
      });
    } catch (err) {
      if (err.response?.status === 422)
        setErrors(err.response.data.errors ?? {});
      else setSubmitErr(err.response?.data?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"}`;

  if (fetching)
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate("/jobs")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
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
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Job Description
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update the job details below.
            </p>
          </div>

          {submitErr && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              ❌ {submitErr}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6"
          >
            <Field label="Job Title" required error={errors.title}>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior Backend Developer"
                className={inputClass("title")}
              />
            </Field>

            <Field label="Job Description" required error={errors.description}>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the role..."
                className={`${inputClass("description")} resize-y min-h-[140px] max-h-[420px] overflow-y-auto`}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.description.length} characters
              </p>
            </Field>

            <Field
              label="Required Skills"
              required
              error={errors.required_skills}
            >
              <SkillTagInput
                skills={form.required_skills}
                onChange={(skills) => {
                  setForm((prev) => ({ ...prev, required_skills: skills }));
                  if (errors.required_skills)
                    setErrors((prev) => ({ ...prev, required_skills: "" }));
                }}
              />
            </Field>

            <Field
              label="Required Qualification"
              error={errors.required_qualification}
            >
              <textarea
                name="required_qualification"
                value={form.required_qualification}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Bachelor's degree in Computer Science or related field..."
                className={`${inputClass("required_qualification")} resize-none`}
              />
            </Field>

            <Field label="Experience Years" error={errors.experience_years}>
              <input
                type="number"
                name="experience_years"
                value={form.experience_years}
                onChange={handleChange}
                min={0}
                max={50}
                placeholder="e.g. 3"
                className={inputClass("experience_years")}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Experience Level"
                required
                error={errors.experience_level}
              >
                <select
                  name="experience_level"
                  value={form.experience_level}
                  onChange={handleChange}
                  className={`${inputClass("experience_level")} bg-white`}
                >
                  <option value="">Select level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="senior">Senior</option>
                </select>
              </Field>
              <Field
                label="Employment Type"
                required
                error={errors.employment_type}
              >
                <select
                  name="employment_type"
                  value={form.employment_type}
                  onChange={handleChange}
                  className={`${inputClass("employment_type")} bg-white`}
                >
                  <option value="">Select type</option>
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location">
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Yangon / Remote"
                  className={inputClass("location")}
                />
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </Field>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
