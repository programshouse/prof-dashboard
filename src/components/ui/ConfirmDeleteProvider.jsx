import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ConfirmDeleteContext = createContext(null);

export function ConfirmDeleteProvider({ children }) {
  const resolverRef = useRef(null);
  const [dialog, setDialog] = useState(null);

  const close = useCallback((result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setDialog(null);
    resolve?.(result);
  }, []);

  const confirmDelete = useCallback((options = {}) => {
    const normalized =
      typeof options === "string"
        ? { message: options }
        : options || {};

    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        title: normalized.title || "Confirm delete",
        message:
          normalized.message ||
          "Are you sure you want to delete this item? This action cannot be undone.",
        confirmText: normalized.confirmText || "Delete",
        cancelText: normalized.cancelText || "Cancel",
      });
    });
  }, []);

  const value = useMemo(() => ({ confirmDelete }), [confirmDelete]);

  return (
    <ConfirmDeleteContext.Provider value={value}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") close(false);
          }}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-[2px]"
            aria-label="Close confirmation"
            onClick={() => close(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0115.916 21H8.084a2.25 2.25 0 01-2.244-1.327L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0V4.477c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>

              <h3 id="confirm-delete-title" className="text-xl font-semibold text-gray-900">
                {dialog.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{dialog.message}</p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {dialog.cancelText}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDeleteContext.Provider>
  );
}

export function useConfirmDelete() {
  const context = useContext(ConfirmDeleteContext);
  if (!context) {
    throw new Error("useConfirmDelete must be used inside ConfirmDeleteProvider");
  }
  return context.confirmDelete;
}
