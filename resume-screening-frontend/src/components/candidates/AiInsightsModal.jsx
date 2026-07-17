import { useState, useEffect } from "react";
import {
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import { ImSpinner9 } from "react-icons/im";
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
      <div className="bg-white rounded-3xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in
                      dark:bg-surface-900 dark:border dark:border-surface-800"
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0
                        dark:border-surface-800">
          <div>
            <h2 className="font-bold text-surface-900 text-lg dark:text-surface-50">AI Insights</h2>
            <p className="text-sm text-surface-400">
              {resume.candidate?.name} — {resume.original_filename}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 w-8 h-8 flex items-center justify-center
                       rounded-xl hover:bg-surface-100 transition-colors dark:hover:bg-surface-800"
          >
            <HiOutlineXMark className="w-5 h-5" />
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
                    <ImSpinner9 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : hasInsights ? (
                  <>
                    <HiOutlineArrowPath className="w-4 h-4" />
                    Re-generate AI Insights
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-4 h-4" />
                    Generate AI Insights
                  </>
                )}
              </button>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* Summary */}
              {summary && (
                <div>
                  <h3 className="font-semibold text-surface-700 mb-3 flex items-center gap-2 dark:text-surface-200">
                    <HiOutlineDocumentText className="w-4 h-4 text-brand-500" />
                    Candidate Summary
                  </h3>
                  <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 text-sm text-surface-700 leading-relaxed
                                  dark:bg-brand-900/20 dark:border-brand-800 dark:text-surface-200">
                    {summary}
                  </div>
                </div>
              )}

              {/* Interview Questions */}
              {questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-surface-700 mb-3 flex items-center gap-2 dark:text-surface-200">
                    <HiOutlineQuestionMarkCircle className="w-4 h-4 text-brand-500" />
                    Interview Questions
                  </h3>
                  <div className="space-y-2">
                    {questions.map((q, i) => (
                      <div key={i}
                           className="flex gap-3 bg-surface-50 border border-surface-100 rounded-2xl p-4
                                      text-sm text-surface-700 hover:border-surface-200 transition-colors
                                      dark:bg-surface-800 dark:border-surface-700 dark:text-surface-200 dark:hover:border-surface-600">
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
                  <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mb-4 dark:bg-surface-800">
                    <HiOutlineLightBulb className="w-7 h-7 text-surface-400" />
                  </div>
                  <p className="text-sm font-semibold text-surface-500">No insights yet</p>
                  <p className="text-xs mt-1">Click the button above to generate AI insights for this candidate.</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center
                              dark:bg-amber-900/20 dark:border-amber-800">
                <p className="text-xs text-amber-700 font-medium leading-relaxed dark:text-amber-400">
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
