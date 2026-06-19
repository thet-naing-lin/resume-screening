import { useState, useEffect } from "react";
import { generateAiInsights, getAiInsights } from "../../api/candidateApi";

export default function AiInsightsModal({ resume, onClose }) {
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFetching(true);
    getAiInsights(resume.resume_id)
      .then((res) => {
        setSummary(res.data.summary || null);
        setQuestions(res.data.questions || []);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [resume.resume_id]);

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
    <div className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in"
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-surface-900 text-lg">AI Insights</h2>
            <p className="text-sm text-surface-400">
              {resume.candidate?.name} — {resume.original_filename}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 w-8 h-8 flex items-center justify-center
                       rounded-xl hover:bg-surface-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {fetching && (
            <div className="flex flex-col items-center justify-center py-12 text-surface-400">
              <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm">Loading insights...</p>
            </div>
          )}

          {!fetching && (
            <>
              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white py-3
                           rounded-2xl text-sm font-semibold transition-all shadow-md shadow-brand-500/20
                           hover:shadow-lg hover:shadow-brand-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : hasInsights ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Re-generate AI Insights
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Generate AI Insights
                  </>
                )}
              </button>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* Summary */}
              {summary && (
                <div>
                  <h3 className="font-semibold text-surface-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Candidate Summary
                  </h3>
                  <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 text-sm text-surface-700 leading-relaxed">
                    {summary}
                  </div>
                </div>
              )}

              {/* Interview Questions */}
              {questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-surface-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Interview Questions
                  </h3>
                  <div className="space-y-2">
                    {questions.map((q, i) => (
                      <div key={i}
                           className="flex gap-3 bg-surface-50 border border-surface-100 rounded-2xl p-4
                                      text-sm text-surface-700 hover:border-surface-200 transition-colors">
                        <span className="font-bold text-brand-500 flex-shrink-0 w-6 text-right">
                          {i + 1}.
                        </span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!hasInsights && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                  <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-surface-500">No insights yet</p>
                  <p className="text-xs mt-1">Click the button above to generate AI insights for this candidate.</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  AI-generated content: Use as decision support only. Human verification is required before any hiring decision.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
