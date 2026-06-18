import { useState, useEffect } from "react";
import { sendBulkMail, getBulkPreview } from "../../api/candidateMailApi";

export default function BulkMailModal({
  status,
  jobDescriptionId,
  defaultSubject,
  defaultBody,
  onClose,
}) {
  const [step, setStep] = useState(1); // 1 = recipient review, 2 = compose
  const [recipients, setRecipients] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [subject, setSubject] = useState(defaultSubject || "");
  const [body, setBody] = useState(defaultBody || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Load recipients on open
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          📨 Bulk Email —{" "}
          {status === "shortlisted" ? "Shortlisted" : "Rejected"} Candidates
        </h2>

        {/* Step indicator */}
        {!result && (
          <div className="flex gap-2 mb-4 text-xs font-medium">
            <span className={step === 1 ? "text-indigo-600" : "text-gray-400"}>
              Step 1: Review Recipients
            </span>
            <span className="text-gray-300">›</span>
            <span className={step === 2 ? "text-indigo-600" : "text-gray-400"}>
              Step 2: Compose & Send
            </span>
          </div>
        )}

        {/* ── Step 1: Recipient list ── */}
        {!result && step === 1 && (
          <>
            {loadingPreview ? (
              <p className="text-sm text-gray-400 py-4">
                Loading recipients...
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">
                  Review and correct email addresses before sending.
                </p>
                <div className="space-y-2 mb-4">
                  {recipients.map((r) => (
                    <div
                      key={r.resume_id}
                      className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2"
                    >
                      <span className="text-sm font-medium text-gray-800 w-36 truncate">
                        {r.candidate_name}
                      </span>
                      <input
                        type="email"
                        // show override if set, else stored email
                        value={r.override_email ?? r.stored_email ?? ""}
                        onChange={(e) =>
                          updateEmail(r.resume_id, e.target.value)
                        }
                        placeholder="No email on record"
                        className={`flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          !r.stored_email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      {/* Show warning if email was missing */}
                      {!r.stored_email && (
                        <span className="text-xs text-red-500 whitespace-nowrap">
                          ⚠️ No email
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={recipients.length === 0}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Next → Review Email
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Step 2: Compose ── */}
        {!result && step === 2 && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 w-full text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 w-full text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            {error && <p className="text-red-500 text-sm mb-3">⚠️ {error}</p>}

            <div className="flex justify-between gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Sending..." : `Send to All ${status}`}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Result screen ── */}
        {result && (
          <div>
            <p className="text-green-700 font-medium mb-3">
              ✅ {result.message}
            </p>
            {result.failed?.length > 0 && (
              <>
                <p className="text-sm font-medium text-red-600 mb-1">
                  ⚠️ Failed:
                </p>
                <ul className="text-sm text-red-500 space-y-1 mb-4">
                  {result.failed.map((f, i) => (
                    <li key={i}>
                      {f.candidate_name} — {f.reason}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
