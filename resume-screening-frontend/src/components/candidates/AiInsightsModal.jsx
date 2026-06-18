import { useState, useEffect } from "react";
import { generateAiInsights, getAiInsights } from "../../api/candidateApi";

export default function AiInsightsModal({ resume, onClose }) {
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // loading existing data on open
  const [error, setError] = useState(null);

  // ── On open: fetch existing insights first (no API token used) ──
  useEffect(() => {
    setFetching(true);
    getAiInsights(resume.resume_id)
      .then((res) => {
        setSummary(res.data.summary || null);
        setQuestions(res.data.questions || []);
      })
      .catch(() => {
        // Silently fail — just means no insights yet
      })
      .finally(() => setFetching(false));
  }, [resume.resume_id]);

  // ── Generate NEW insights (calls Gemini) ──
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateAiInsights(resume.resume_id);
      setSummary(res.data.summary);
      setQuestions(res.data.questions);
    } catch {
      setError("Failed to generate insights. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasInsights = summary || questions.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">AI Insights</h2>
            <p className="text-sm text-gray-400">
              {resume.candidate?.name} — {resume.original_filename}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Loading existing insights */}
          {fetching && (
            <div className="text-center py-10 text-gray-400">
              <div className="animate-spin text-3xl mb-2">⏳</div>
              <p className="text-sm">Loading insights...</p>
            </div>
          )}

          {!fetching && (
            <>
              {/* Generate / Re-generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {loading
                  ? "✨ Generating..."
                  : hasInsights
                    ? "🔄 Re-generate AI Insights"
                    : "✨ Generate AI Insights"}
              </button>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              {/* ── US-016: Candidate Summary ── */}
              {summary && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    📋 Candidate Summary
                  </h3>
                  <div className="bg-indigo-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                    {summary}
                  </div>
                </div>
              )}

              {/* ── US-017: Interview Questions ── */}
              {questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    ❓ Interview Questions
                  </h3>
                  <ol className="space-y-2">
                    {questions.map((q, i) => (
                      <li
                        key={i}
                        className="flex gap-3 bg-gray-50 rounded-xl p-3 text-sm text-gray-700"
                      >
                        <span className="font-bold text-indigo-600 flex-shrink-0 w-5">
                          {i + 1}.
                        </span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Empty state — never been generated */}
              {!hasInsights && !loading && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-3">🤖</p>
                  <p className="text-sm font-medium text-gray-500">
                    No insights yet
                  </p>
                  <p className="text-xs mt-1">
                    Click the button above to generate AI insights for this
                    candidate.
                  </p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 text-center rounded-xl px-4 py-3">
                <p className="text-xs sm:text-sm text-amber-800 font-medium">
                  AI-generated content: Use as decision support only. Human
                  verification is required before any hiring decision.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
