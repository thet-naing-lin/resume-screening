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

  // Load template whenever type changes
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
        err.response?.data?.message ??
          "Failed to send email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Send Email</h2>
            <p className="text-sm text-gray-400">
              To:{" "}
              <span className="font-medium text-gray-600">{candidateName}</span>{" "}
              <span className="text-gray-300">
                ({resume?.candidate?.email})
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Mail type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setType("interview")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                type === "interview"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              🎉 Interview Invitation
            </button>
            <button
              onClick={() => setType("rejection")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                type === "rejection"
                  ? "bg-gray-600 text-white border-gray-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              📩 Rejection Notice
            </button>
          </div>

          {fetching ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-9 bg-gray-100 rounded-xl" />
              <div className="h-48 bg-gray-100 rounded-xl" />
            </div>
          ) : (
            <>
              {/* To Email — editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To (Email Address)
                </label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="candidate@email.com"
                />
                <p className="text-xs text-amber-600 mt-1">
                  ✏️ Verify the email is correct before sending.
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  You can freely edit the subject and message before sending.
                </p>
              </div>
            </>
          )}

          {/* Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {/* ✅ Email sent successfully to {resume?.candidate?.email} */}✅
              Email sent successfully to {toEmail}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {success ? "Close" : "Cancel"}
          </button>
          {!success && (
            <button
              onClick={handleSend}
              disabled={loading || fetching || !subject || !body}
              className={`px-5 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                type === "interview"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
