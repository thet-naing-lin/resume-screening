import { useState, useEffect } from "react";
import { getMailTemplate, sendCandidateMail } from "../../api/candidateMailApi";

export default function SendMailModal({ resume, jobTitle, onClose }) {
  const [type, setType] = useState("interview");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [toEmail, setToEmail] = useState(resume?.candidate?.email ?? "");

  const candidateName = resume?.candidate?.name ?? "Candidate";

  useEffect(() => {
    setFetching(true);
    setSuccess(false);
    setError(null);
    getMailTemplate(type, candidateName, jobTitle)
      .then((res) => {
        setSubject(res.data.subject);
        setBody(res.data.body);
      })
      .catch(() => setError("Failed to load template."))
      .finally(() => setFetching(false));
  }, [type]);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendCandidateMail({
        resume_id: resume.resume_id,
        type,
        subject,
        body,
        to_email: toEmail,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ?? "Failed to send email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-modal w-full max-w-2xl flex flex-col max-h-[90vh] animate-scale-in"
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div>
            <h2 className="font-bold text-surface-900 text-lg">Send Email</h2>
            <p className="text-sm text-surface-400">
              To: <span className="font-medium text-surface-600">{candidateName}</span>
              {" "}
              <span className="text-surface-300">({resume?.candidate?.email})</span>
            </p>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-surface-400
                             hover:bg-surface-100 hover:text-surface-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Mail type toggle — pill style */}
          <div className="flex gap-1.5 p-1 bg-surface-100 rounded-2xl">
            <button
              onClick={() => setType("interview")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                type === "interview"
                  ? "bg-white text-surface-900 shadow-sm"
                  : "text-surface-500 hover:text-surface-700"
              }`}
            >
              Interview Invitation
            </button>
            <button
              onClick={() => setType("rejection")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                type === "rejection"
                  ? "bg-white text-surface-900 shadow-sm"
                  : "text-surface-500 hover:text-surface-700"
              }`}
            >
              Rejection Notice
            </button>
          </div>

          {fetching ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-surface-100 rounded-2xl" />
              <div className="h-48 bg-surface-100 rounded-2xl" />
            </div>
          ) : (
            <>
              {/* To Email */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  To (Email Address)
                </label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="input-field"
                  placeholder="candidate@email.com"
                />
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify the email is correct before sending.
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                       className="input-field" />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Message Body</label>
                <textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="input-field resize-y font-mono text-sm"
                />
                <p className="text-xs text-surface-400 mt-1.5">
                  You can freely edit the subject and message before sending.
                </p>
              </div>
            </>
          )}

          {/* Feedback */}
          {error && (
            <div className="flash-error mb-0">{error}</div>
          )}
          {success && (
            <div className="flash-success mb-0">
              <span>Email sent successfully to {toEmail}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-100 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            {success ? "Close" : "Cancel"}
          </button>
          {!success && (
            <button
              onClick={handleSend}
              disabled={loading || fetching || !subject || !body}
              className="btn-primary"
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
