// src/pages/reviews/reviews-list.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDataStore } from "../../stors/useDataStore.js";

const Star = ({ filled }) => (
  <svg viewBox="0 0 20 20" className={`h-4 w-4 ${filled ? "text-yellow-500" : "text-gray-300"}`} fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.5 14.347a1 1 0 00-1.175 0l-2.788 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.904 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
  </svg>
);
const Stars = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((n)=>(<Star key={n} filled={n<=rating}/>))}
  </div>
);

function ReviewRow({ r, onDelete }) {
  const [busy, setBusy] = useState(false);
  const date = r.date ? new Date(r.date).toLocaleDateString() : "";

  const handleDelete = async () => {
    if (busy) return;
    if (!confirm("Delete this review?")) return;
    setBusy(true);
    await onDelete(r.id);
    setBusy(false);
  };

  return (
    <div className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{date}</p>
          <h4 className="text-base font-semibold text-brand-700">{r.author || "Anonymous"}</h4>
          {r.reviewable_type && (
            <p className="text-xs text-gray-500 mt-0.5">
              On: {r.reviewable_type}{r.reviewable_id ? ` #${r.reviewable_id}` : ""}
            </p>
          )}
        </div>
        <Stars rating={r.rate ?? r.rating ?? 0}/>
      </div>
      <p className="mt-2 text-gray-700">{r.description}</p>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button onClick={handleDelete}
          className="px-3 py-1.5 rounded-md font-semibold border border-brand-600 text-brand-600"
          disabled={busy}>
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default function ReviewsListPage() {
  const { reviews, reviewsMeta, loading, message, getAllReviews, deleteReview } = useDataStore();

  useEffect(() => {
    getAllReviews?.();
  }, [getAllReviews]);

  return (
    <div className="min-h-screen bg-brand-25">
      <header className="mx-auto max-w-5xl px-4 py-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-700">All Reviews</h1>
          <p className="text-gray-600">Browse and manage reviews.</p>
        </div>
        <Link to="/review" className="rounded-md px-4 py-2 bg-brand-600 text-white hover:bg-brand-700">
          + New Review
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        {loading && reviews.length === 0 && (
          <div className="mt-6 animate-pulse space-y-3">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="h-24 w-full rounded bg-gray-200" />
          </div>
        )}

        {message && <p className="mb-4 text-brand-700">{message}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <ReviewRow key={r.id ?? r._id ?? JSON.stringify(r)} r={r} onDelete={deleteReview}/>
          ))}
        </div>

        {reviewsMeta?.last_page > 1 && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Page {reviewsMeta.current_page} of {reviewsMeta.last_page}
          </p>
        )}
      </main>
    </div>
  );
}
