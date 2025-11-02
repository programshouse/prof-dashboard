import React from "react";

export default function ServiceCard({
  title,
  description,
  image = null,
  link,
  className = "",
  widthClass = "w-full",
  // optional action buttons: { label, onClick, disabled }
  primaryAction,
  secondaryAction,
  dangerAction,
}) {
  return (
    <div className={`${widthClass}`}>
      <div
        className={`h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${className}`}
      >
      {/* Media */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-700">
        {image ? (
          <img src={image} alt={title || "Service image"} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
          {title}
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* Actions */}
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
          ) : link ? (
            <a
              href={link}
              target="_blank" rel="noreferrer"
              className="col-span-1 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              Get Service
            </a>
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
