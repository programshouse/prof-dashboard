import React from "react";

export default function SubscriberCard({
  email,
  name,
  createdAt,
  className = "",
  widthClass = "w-full",
  primaryAction,   // { label, onClick, disabled }
  secondaryAction, // optional
  dangerAction,    // optional
}) {
  return (
    <div className={`${widthClass}`}>
      <div className={`h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${className}`}>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white break-words">{email}</h3>
            {createdAt ? (
              <span className="shrink-0 text-xs text-gray-500">{new Date(createdAt).toLocaleDateString()}</span>
            ) : null}
          </div>
          {name ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{name}</p>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-2">
            {primaryAction ? (
              <button
                type="button"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="col-span-1 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {primaryAction.label ?? "Open"}
              </button>
            ) : (
              <div className="col-span-1" />
            )}

            {secondaryAction ? (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
                className="col-span-1 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-gray-700 dark:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {secondaryAction.label ?? "Edit"}
              </button>
            ) : (
              <div className="col-span-1" />
            )}

            {dangerAction ? (
              <button
                type="button"
                onClick={dangerAction.onClick}
                disabled={dangerAction.disabled}
                className="col-span-1 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                {dangerAction.label ?? "Delete"}
              </button>
            ) : (
              <div className="col-span-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
