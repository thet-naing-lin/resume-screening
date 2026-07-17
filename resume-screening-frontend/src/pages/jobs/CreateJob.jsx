import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createJob } from "../../api/jobApi";
import { SkillTagInput } from "../../components/jobs/JobFormFields";

const EMPTY_FORM = {
  title: "",
  description: "",
  required_skills: [],
  required_qualification: "",
  experience_level: "",
  experience_years: "",
  employment_type: "",
  location: "",
  status: "active",
};

function Field({ label, required, error, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1.5 dark:text-surface-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1" role="alert">{error}</p>}
    </div>
  );
}

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Job title is required.";
    if (form.description.length < 20) e.description = "Description must be at least 20 characters.";
    if (form.required_skills.length === 0) e.required_skills = "Add at least one skill.";
    if (!form.experience_level) e.experience_level = "Select an experience level.";
    if (!form.employment_type) e.employment_type = "Select an employment type.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      setLoading(true);
      await createJob(form);
      setForm(EMPTY_FORM);
      setErrors({});
      toast.success("Job description created successfully!");
      navigate("/jobs");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        toast.error(err.response?.data?.message ?? "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field) =>
    `input-field ${errors[field] ? "!border-red-400 !bg-red-50" : ""}`;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-8">
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-700 mb-3 transition-colors
                       dark:hover:text-surface-200"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Job Descriptions
          </button>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Create Job Description</h1>
          <p className="text-sm text-surface-500 mt-1">
            Fields marked <span className="text-red-500">*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-surface-200 shadow-card p-6 md:p-8 space-y-6
                                                dark:bg-surface-900 dark:border-surface-800">
          <Field label="Job Title" required error={errors.title} id="create-title">
            <input id="create-title" type="text" name="title" value={form.title} onChange={handleChange}
                   placeholder="e.g. Senior Backend Developer" className={inputClass("title")} />
          </Field>

          <Field label="Job Description" required error={errors.description} id="create-description">
            <textarea id="create-description" name="description" value={form.description} onChange={handleChange}
                      rows={5} placeholder="Describe the role, responsibilities..."
                      className={`${inputClass("description")} resize-y min-h-[140px] max-h-[420px]`} />
            <p className="text-xs text-surface-400 mt-1 text-right">{form.description.length} characters</p>
          </Field>

          <Field label="Required Skills" required error={errors.required_skills} id="create-skills">
            <SkillTagInput
              skills={form.required_skills}
              onChange={(skills) => {
                setForm((prev) => ({ ...prev, required_skills: skills }));
                if (errors.required_skills) setErrors((prev) => ({ ...prev, required_skills: "" }));
              }}
            />
          </Field>

          <Field label="Required Qualification" error={errors.required_qualification} id="create-qualification">
            <textarea id="create-qualification" name="required_qualification" value={form.required_qualification}
                      onChange={handleChange} rows={3}
                      placeholder="e.g. Bachelor's degree in Computer Science or related field..."
                      className={`${inputClass("required_qualification")} resize-none`} />
          </Field>

          <Field label="Experience Years" error={errors.experience_years} id="create-exp-years">
            <input id="create-exp-years" type="number" name="experience_years" value={form.experience_years}
                   onChange={handleChange} min={0} max={50} placeholder="e.g. 3"
                   className={inputClass("experience_years")} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Experience Level" required error={errors.experience_level} id="create-exp-level">
              <select id="create-exp-level" name="experience_level" value={form.experience_level}
                      onChange={handleChange} className={`${inputClass("experience_level")} bg-white dark:bg-surface-800`}>
                <option value="">Select level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
              </select>
            </Field>
            <Field label="Employment Type" required error={errors.employment_type} id="create-emp-type">
              <select id="create-emp-type" name="employment_type" value={form.employment_type}
                      onChange={handleChange} className={`${inputClass("employment_type")} bg-white dark:bg-surface-800`}>
                <option value="">Select type</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location" id="create-location">
              <input id="create-location" type="text" name="location" value={form.location}
                     onChange={handleChange} placeholder="e.g. Yangon / Remote"
                     className={inputClass("location")} />
            </Field>
            <Field label="Status" id="create-status">
              <select id="create-status" name="status" value={form.status} onChange={handleChange}
                      className="select-field w-full">
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={() => navigate("/jobs")} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} aria-busy={loading} className="btn-primary">
              {loading ? "Creating..." : "Create Job Description"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
