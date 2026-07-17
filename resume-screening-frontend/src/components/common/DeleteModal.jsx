import { useEffect, useRef } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { ImSpinner9 } from "react-icons/im";

export default function DeleteModal({ title, description, onConfirm, onCancel, loading }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    // Focus the cancel button on mount
    cancelRef.current?.focus();

    // Trap Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/60
                 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-modal p-6 w-full max-w-sm animate-scale-in
                      dark:bg-surface-900 dark:border dark:border-surface-800">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl
                        bg-red-50 border border-red-100 mx-auto mb-5 dark:bg-red-900/30 dark:border-red-800">
          <HiOutlineTrash className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>

        <h3 id="delete-modal-title" className="text-lg font-bold text-surface-900 text-center mb-2 dark:text-surface-50">{title}</h3>
        <p className="text-sm text-surface-500 text-center mb-6 leading-relaxed">{description}</p>

        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-2xl border border-surface-200
                       text-surface-600 hover:bg-surface-50 transition-colors disabled:opacity-50
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50
                       dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-red-500 text-white
                       hover:bg-red-600 active:bg-red-700 transition-all shadow-md shadow-red-500/20
                       disabled:opacity-50 flex items-center justify-center gap-2
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
          >
            {loading ? (
              <>
                <ImSpinner9 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
