import { useState, useEffect } from "react";
import { sendBulkMail, getBulkPreview } from "../../api/candidateMailApi";

export default function BulkMailModal({
  status,
  jobDescriptionId,
  defaultSubject,
  defaultBody,
  onClose,
}) {
  const [step, setStep] = useState(1);
  const [recipients, setRecipients] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [subject, setSubject] = useState(defaultSubject || "");
  const [body, setBody] = useState(defaultBody || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBulkPreview({ status, job_description_id: jobDescriptionId })
      .then((res) => setRecipients(res.data.recipients))
      .catch(() => setError("Failed to load recipients."))
      .finally(() => setLoadingPreview(false));
  }, []);

  const updateEmail = (resumeId, value) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.resume_id === resumeId ? { ...r, override_email: value } : r,
      ),
    );
  };

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      const overrides = recipients
        .filter((r) => r.override_email)
        .map((r) => ({
          resume_id: r.resume_id,
          override_email: r.override_email,
        }));
      const res = await sendBulkMail({
        status,
        subject,
        body,
        job_description_id: jobDescriptionId,
        overrides,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const label = status === "shortlisted" ? "Shortlisted" : "Rejected";

  return (
    <div className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-surface-900">
              Bulk Email — {label} Candidates
            </h2>
            <button onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-surface-400
                               hover:bg-surface-100 hover:text-surface-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator — only show during flow */}
          {!result && (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`flex items-center gap-1.5 ${step === 1 ? "text-brand-600" : "text-surface-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === 1 ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-400"}`}>1</span>
                Review Recipients
              </span>
              <span className="w-8 h-px bg-surface-200 mx-1" />
              <span className={`flex items-center gap-1.5 ${step === 2 ? "text-brand-600" : "text-surface-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === 2 ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-400"}`}>2</span>
                Compose & Send
              </span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Step 1: Recipient list */}
          {!result && step === 1 && (
            <>
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm text-surface-400">Loading recipients...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-surface-500 mb-4">
                    Review and correct email addresses before sending.
                  </p>
                  <div className="space-y-2 mb-5">
                    {recipients.map((r) => (
                      <div key={r.resume_id}
                           className="flex items-center gap-3 bg-surface-50 border border-surface-100 rounded-2xl px-4 py-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-500
                                        flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                          {(r.candidate_name || "?")[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-surface-800 w-36 truncate">{r.candidate_name}</span>
                        <input
                          type="email"
                          value={r.override_email ?? r.stored_email ?? ""}
                          onChange={(e) => updateEmail(r.resume_id, e.target.value)}
                          placeholder="No email on record"
                          className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none
                                      focus:ring-2 focus:ring-brand-500/30 transition-all
                                      ${!r.stored_email ? "border-red-300 bg-red-50" : "border-surface-200"}`}
                        />
                        {!r.stored_email && (
                          <span className="text-xs text-red-500 font-medium whitespace-nowrap">No email</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={() => setStep(2)} disabled={recipients.length === 0}
                            className="btn-primary">
                      Next → Review Email
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Step 2: Compose */}
          {!result && step === 2 && (
            <>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Subject</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                         className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Body</label>
                  <textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)}
                            className="input-field resize-y" />
                </div>
              </div>

              {error && <div className="flash-error mb-4">{error}</div>}

              <div className="flex justify-between gap-2">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  ← Back
                </button>
                <div className="flex gap-2">
                  <button onClick={onClose} disabled={loading} className="btn-secondary">Cancel</button>
                  <button onClick={handleSend} disabled={loading} className="btn-primary">
                    {loading ? "Sending..." : `Send to All ${label}`}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Result screen */}
          {result && (
            <div className="animate-scale-in">
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200
                              text-emerald-800 rounded-2xl px-5 py-4 mb-4">
                <svg className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold">{result.message}</p>
                  {result.sent_count && (
                    <p className="text-sm text-emerald-600 mt-0.5">{result.sent_count} email(s) sent</p>
                  )}
                </div>
              </div>

              {result.failed?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-red-600 mb-2">Failed ({result.failed.length}):</p>
                  <div className="space-y-1.5">
                    {result.failed.map((f, i) => (
                      <div key={i}
                           className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm">
                        <span className="font-medium text-surface-700">{f.candidate_name}</span>
                        <span className="text-red-500 text-xs">— {f.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={onClose} className="btn-secondary">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
