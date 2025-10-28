// src/components/ImageTable.jsx
import React from "react";

export default function ImageTable({ rows = [], onDelete, onEdit }) {
  if (!rows.length) {
    return (
      <div className="mt-6">
        <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
          No images uploaded yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
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
                  <div className="flex items-center gap-3">
                    <img
                      src={row.url}
                      alt={row.fileName || "image"}
                      className="h-14 w-14 rounded-lg object-cover border"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">{row.section || "-"}</td>
                <td className="px-4 py-3">{row.fileName || "-"}</td>
                <td className="px-4 py-3">{row.sizeReadable || "-"}</td>
                <td className="px-4 py-3">{row.createdAt || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(row)}
                      className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(row)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
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

