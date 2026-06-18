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

  // ← ADD THIS: fires when user clicks away or presses Tab
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
      <div
        className={`flex flex-wrap gap-2 p-3 border rounded-xl min-h-[48px] bg-white focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent ${error ? "border-red-400 bg-red-50" : "border-gray-300"}`}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="text-indigo-400 hover:text-indigo-700 font-bold ml-1"
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
          placeholder={
            skills.length === 0
              ? 'Type a skill and press Enter (e.g. "Laravel")'
              : "Add more..."
          }
          className="flex-1 outline-none text-sm text-gray-700 min-w-[160px] bg-transparent"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Press{" "}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> or{" "}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">,</kbd> to add
        a skill
      </p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
