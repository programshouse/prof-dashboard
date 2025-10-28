import React from "react";

export default function VideoTable({ rows = [], onDelete, onEdit }) {
  if (!rows.length) {
    return (
      <div className="mt-6">
        <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
          No videos uploaded yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-25 text-brand-700">
            <tr>
              <th className="px-4 py-3 text-left">Preview</th>
              <th className="px-4 py-3 text-left">Section Name</th>
              <th className="px-4 py-3 text-left">File Name</th>
              <th className="px-4 py-3 text-left">Size</th>
              <th className="px-4 py-3 text-left">Uploaded At</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <video
                    src={row.url}
                    className="h-16 w-28 rounded-lg border object-cover"
                    controls={false}
                    muted
                  />
                </td>
                <td className="px-4 py-3">{row.section || "-"}</td>
                <td className="px-4 py-3">{row.fileName || "-"}</td>
                <td className="px-4 py-3">{row.sizeReadable || "-"}</td>
                <td className="px-4 py-3">{row.createdAt || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(row)}
                      className="rounded-lg border border-[var(--border-brand)] px-3 py-1 text-xs hover:bg-brand-25"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(row)}
                      className="rounded-lg bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-500"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
