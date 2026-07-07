// Skill tag input
import { useState } from "react";

export function SkillTagInput({ skills, onChange, error }) {
  const [input, setInput] = useState("");

  function addSkill(e) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const newSkill = input.trim().replace(",", "");
      if (!skills.includes(newSkill)) onChange([...skills, newSkill]);
      setInput("");
    }
  }

  function handleBlur() {
    if (input.trim()) {
      const newSkill = input.trim().replace(",", "");
      if (!skills.includes(newSkill)) onChange([...skills, newSkill]);
      setInput("");
    }
  }

  function removeSkill(skill) {
    onChange(skills.filter((s) => s !== skill));
  }

  return (
    <div role="group" aria-label="Required skills">
      <div className={`flex flex-wrap gap-2 p-3 border rounded-2xl min-h-[48px] bg-white
                       focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-300
                       transition-all dark:bg-surface-800 dark:border-surface-700 dark:focus-within:border-brand-500
                       ${error ? "border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-700" : "border-surface-200"}`}>
        {skills.map((skill) => (
          <span key={skill}
                className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-sm
                           px-3 py-1 rounded-xl font-medium border border-brand-100
                           dark:bg-brand-900/30 dark:text-brand-400 dark:border-brand-800">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              aria-label={`Remove ${skill}`}
              className="text-brand-400 hover:text-brand-700 font-bold ml-1
                         hover:bg-brand-100 rounded-full w-4 h-4 flex items-center justify-center
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30
                         dark:hover:bg-brand-900/50 dark:hover:text-brand-300"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={addSkill}
          onBlur={handleBlur}
          placeholder={skills.length === 0 ? 'Type a skill and press Enter (e.g. "Laravel")' : "Add more..."}
          className="flex-1 outline-none text-sm text-surface-700 min-w-[160px] bg-transparent
                     placeholder:text-surface-400 dark:text-surface-200 dark:placeholder:text-surface-500"
        />
      </div>
      <p className="text-xs text-surface-400 mt-1.5">
        Press{" "}
        <kbd className="px-1.5 py-0.5 bg-surface-100 rounded-md text-[11px] text-surface-500 border border-surface-200
                        dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700">
          Enter
        </kbd>{" "}
        or{" "}
        <kbd className="px-1.5 py-0.5 bg-surface-100 rounded-md text-[11px] text-surface-500 border border-surface-200
                        dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700">
          ,
        </kbd>{" "}
        to add a skill
      </p>
      {error && <p className="text-red-500 text-xs mt-1" role="alert">{error}</p>}
    </div>
  );
}
