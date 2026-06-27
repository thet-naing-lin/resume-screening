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
    <div>
      <div className={`flex flex-wrap gap-2 p-3 border rounded-2xl min-h-[48px] bg-white
                       focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-300
                       transition-all ${error ? "border-red-400 bg-red-50" : "border-surface-200"}`}>
        {skills.map((skill) => (
          <span key={skill}
                className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-sm
                           px-3 py-1 rounded-xl font-medium border border-brand-100">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="text-brand-400 hover:text-brand-700 font-bold ml-1
                         hover:bg-brand-100 rounded-full w-4 h-4 flex items-center justify-center"
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
                     placeholder:text-surface-400"
        />
      </div>
      <p className="text-xs text-surface-400 mt-1.5">
        Press{" "}
        <kbd className="px-1.5 py-0.5 bg-surface-100 rounded-md text-[11px] text-surface-500 border border-surface-200">
          Enter
        </kbd>{" "}
        or{" "}
        <kbd className="px-1.5 py-0.5 bg-surface-100 rounded-md text-[11px] text-surface-500 border border-surface-200">
          ,
        </kbd>{" "}
        to add a skill
      </p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
