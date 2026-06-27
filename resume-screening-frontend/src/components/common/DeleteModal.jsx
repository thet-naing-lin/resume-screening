export default function DeleteModal({ title, description, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/60
                    backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-modal p-6 w-full max-w-sm animate-scale-in">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl
                        bg-red-50 border border-red-100 mx-auto mb-5">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-surface-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-surface-500 text-center mb-6 leading-relaxed">{description}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-2xl border border-surface-200
                       text-surface-600 hover:bg-surface-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-red-500 text-white
                       hover:bg-red-600 active:bg-red-700 transition-all shadow-md shadow-red-500/20
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
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
