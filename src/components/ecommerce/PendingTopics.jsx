// src/components/ecommerce/PendingTopics.jsx
import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApiStore } from "../../stors/useApiStore";

/* ---------- helpers ---------- */
function initials(str = "") {
  const parts = String(str).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p?.[0]?.toUpperCase() || "").join("") || "U";
}

function safeNum(n, fallback = 0) {
  if (typeof n === "number") return n;
  if (typeof n === "string" && n.trim() !== "" && !isNaN(Number(n))) return Number(n);
  return fallback;
}

// try multiple keys: contacts → list
function extractPendingList(contacts) {
  if (!contacts) return [];
  const src = contacts?.data ? contacts.data : contacts;

  // accept various server keys
  const candidate =
    src?.["pending topics"] ||
    src?.pending_topics ||
    src?.pendingTopics ||
    src?.pending ||
    src?.topics_pending ||
    [];

  return Array.isArray(candidate) ? candidate : [];
}

// normalize each topic to a predictable shape
function normalizeTopic(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id ?? raw.topic_id ?? raw._id;
  const title =
    raw.title_en ??
    raw.title_ar ??
    raw.title ??
    raw.name ??
    "(no title)";

  // user can be nested as user/author/owner OR just user_id (with nested object)
  const user =
    raw.user ??
    raw.author ??
    raw.owner ??
    (raw.user_id ? { id: raw.user_id } : {});

  return {
    id,
    title,
    user: {
      id: user?.id ?? user?._id ?? raw.user_id ?? null,
      name: user?.name ?? user?.full_name ?? user?.username ?? null,
      email: user?.email ?? user?.mail ?? null,
    },
  };
}

/* ---------- UI ---------- */
function TopicCard({ t }) {
  const userName = t.user?.name || (t.user?.id ? `#${t.user.id}` : "Unknown");
  const userEmail = t.user?.email || "—";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
          {initials(userName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h4
              title={t.title}
              className="font-semibold text-brand-800 line-clamp-2 break-words"
            >
        {t.title}
            </h4>

            <Link
              to={`/topicdetails/${t.id}`}
              className="shrink-0 rounded-lg border border-brand-600 px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-25"
            >
              View
            </Link>
          </div>

          <div className="mt-1 text-sm text-brand-600 flex items-center gap-2">
            <span className="truncate">
              By <span className="font-medium text-brand-700">{userName}</span>
            </span>
            <span className="mx-1.5 text-brand-300">•</span>
            <span className="truncate break-all">{userEmail}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PendingTopics() {
  const { fetchHome, contacts, loading } = useApiStore();

  // Only fetch if not already present (lets EcommerceMetrics reuse the same call)
  useEffect(() => {
    if (!contacts) fetchHome?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  // normalize list
  const pendingList = useMemo(() => {
    const raw = extractPendingList(contacts);
    return raw
      .map(normalizeTopic)
      .filter(Boolean);
  }, [contacts]);

  // count (accept various possible keys as well)
  const totals = useMemo(() => {
    const src = contacts?.data ? contacts.data : contacts || {};
    return {
      users: safeNum(src.users_count ?? src.users ?? src.total_users),
      books: safeNum(src.books_count ?? src.books),
      workshops: safeNum(src.workshops_count ?? src.workshops),
      sessions: safeNum(src.sessions_count ?? src.sessions),
      pending: safeNum(
        (src["pending topics"]?.length ??
          src.pending_topics?.length ??
          src.pendingTopics?.length ??
          src.pending?.length ??
          src.topics_pending?.length),
        pendingList.length
      ),
    };
  }, [contacts, pendingList.length]);

  return (
    <div className="rounded-2xl  bg-white p-5 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-end gap-2">
          <h3 className="text-lg font-bold text-brand-800">Pending Topics</h3>
          <span className="rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {totals.pending}
          </span>
        </div>

        <Link
          to="/alltopics"
          className="rounded-lg border border-brand-600 px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-25"
        >
          View all
        </Link>
      </div>

      {loading && !contacts ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-brand-200 bg-white p-4">
              <div className="flex items-start gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-brand-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-brand-100" />
                  <div className="h-3 w-1/2 rounded bg-brand-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : pendingList.length === 0 ? (
        <div className="rounded-xl border border-brand-100 p-4 text-sm text-brand-600 bg-brand-25">
          No pending topics right now.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pendingList.map((t) => (
            <TopicCard key={t.id ?? `${t.title}-${t.user?.email ?? Math.random()}`} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
