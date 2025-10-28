import React, { useEffect, useMemo, useState } from "react";

/**
 * BlogCards
 * - GET    https://www.programshouse.com/reem/api/v1/admins/blogs
 * - DELETE https://www.programshouse.com/reem/api/v1/admins/blogs/:id
 *
 * Pass an auth header if required:
 *   const headers = { Authorization: `Bearer ${token}` };
 * Or just store the token in localStorage as 'authToken' | 'accessToken' | 'token'.
 */
export default function BlogCards({ apiUrl, headers = {}, onEdit }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(null); // {title, html}

  // --- helpers ---
  const ensureBearer = (maybeToken) => {
    if (!maybeToken) return undefined;
    return String(maybeToken).toLowerCase().startsWith("bearer ")
      ? maybeToken
      : `Bearer ${maybeToken}`;
  };

  // Build headers per request so we always pick up the freshest token.
  const buildHeaders = () => {
    // token may come from props OR localStorage
    const propAuth = headers?.Authorization || headers?.authorization || headers?.token;
    const storeAuth =
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    const authHeader = ensureBearer(propAuth || storeAuth);

    // Start with caller headers (so you can pass custom headers),
    // then ensure Accept + X-Requested-With, finally normalize Authorization.
    const h = {
      ...headers,
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest", // helpful for many Laravel stacks
    };
    if (!h.Authorization && authHeader) h.Authorization = authHeader;
    return h;
  };

  const stripHtml = (html = "") =>
    (html + "")
      .replace(/<style[^>]*>.*?<\/style>/gis, "")
      .replace(/<script[^>]*>.*?<\/script>/gis, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const formatDate = (value) => {
    if (!value) return "";
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
    if (m) {
      const [_, y, mo, d, h, mi] = m;
      const asDate = new Date(+y, +mo - 1, +d, +h, +mi);
      return asDate.toLocaleString();
    }
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? String(value) : dt.toLocaleString();
  };

  // Normalize ONE blog object from your API into the shape the UI needs
  const normalize = (raw) => {
    const id = raw.id ?? raw._id ?? raw.uuid ?? raw.slug ?? Math.random().toString(36);
    const title = raw.title ?? raw.name ?? raw.slug ?? "Untitled";

    // your API puts HTML in "content"
    const html = raw.content ?? raw.content_html ?? raw.html ?? raw.body ?? "";
    const text = stripHtml(html);

    return {
      id,
      title,
      html,
      text,
      description: raw.description ?? (text ? text.slice(0, 160) : "No content…"),
      image: raw.image || null,
      category: raw.category ?? raw.category_name ?? null,
      adminEmail: raw.admin?.email ?? null,
      created: raw.created_at ?? raw.createdAt ?? raw.date ?? "",
      stats: {
        comments: Number(raw.comments_count ?? 0),
        likes: Number(raw.likes_count ?? 0),
        shares: Number(raw.shares_count ?? 0),
        views: Number(raw.views_count ?? 0),
        upvotes: Number(raw.upvotes_count ?? 0),
      },
      raw,
    };
  };

  // Turn any reasonable API response into an array
  const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;   // common Laravel paginator
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.blogs)) return data.blogs;
    if (data && typeof data === "object") return [data]; // single object fallback
    return [];
  };

  const handleAuthErrors = (res) => {
    if (res.status === 401 || res.status === 403) {
      // Optionally: window.location.assign("/login");
      throw new Error("Unauthorized. Please log in again.");
    }
  };

  // --- API calls ---
  const load = async () => {
    setLoading(true);
    setErr("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: buildHeaders(),
        mode: "cors",
        signal: controller.signal,
        // credentials: "include", // uncomment if cookie/same-site auth
      });

      handleAuthErrors(res);

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`GET ${res.status}: ${t || res.statusText}`);
      }

      const data = await res.json();
      const arr = toArray(data);
      setItems(arr.map(normalize));
    } catch (e) {
      console.error(e);
      setErr("Failed to load blogs. Check CORS/auth and API response.");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this blog?")) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      // Adjust if your backend uses a different route, e.g. `${apiUrl}/delete/${id}`
      const res = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
        headers: buildHeaders(),
        mode: "cors",
        signal: controller.signal,
        // credentials: "include",
      });

      handleAuthErrors(res);

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`DELETE ${res.status}: ${t || res.statusText}`);
      }

      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    } finally {
      clearTimeout(timeout);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // --- UI ---
  if (loading) return <div style={{ padding: 16 }}>Loading blogs…</div>;
  if (err)
    return (
      <div style={{ padding: 16, color: "#b91c1c" }}>
        {err}
        <div style={{ marginTop: 8 }}>
          <button onClick={load} style={btn}>Retry</button>
        </div>
      </div>
    );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Blogs</h3>
        <button onClick={load} style={btn}>Refresh</button>
      </div>

      {!items.length ? (
        <div style={empty}>No blogs yet.</div>
      ) : (
        <div style={grid}>
          {items.map((it) => (
            <article key={it.id} style={card}>
              {it.image ? (
                <div style={{ marginBottom: 10 }}>
                  <img
                    src={it.image}
                    alt={it.title}
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, border: "1px solid #e2e8f0" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              ) : null}

              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <h4 style={{ margin: "0 0 6px 0", lineHeight: 1.25 }}>{it.title}</h4>
                {it.category && <span style={pill}>{it.category}</span>}
              </div>

              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                {it.adminEmail ? <span>by {it.adminEmail} • </span> : null}
                {it.created ? formatDate(it.created) : null}
              </div>

              <p style={{ margin: "0 0 10px 0", color: "#475569" }}>
                {it.description}
              </p>

              <div style={statsRow}>
                <span title="Views">👁 {it.stats.views}</span>
                <span title="Likes">👍 {it.stats.likes}</span>
                <span title="Upvotes">⬆️ {it.stats.upvotes}</span>
                <span title="Comments">💬 {it.stats.comments}</span>
                <span title="Shares">🔗 {it.stats.shares}</span>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button style={btn} onClick={() => setPreview({ title: it.title, html: it.html })}>
                  Preview
                </button>
                {onEdit && (
                  <button style={btn} onClick={() => onEdit(it.raw)}>
                    Edit
                  </button>
                )}
                <button style={{ ...btn, borderColor: "#fecaca" }} onClick={() => del(it.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {!!preview && (
        <div style={overlay} onClick={() => setPreview(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>{preview.title}</h4>
              <button style={btn} onClick={() => setPreview(null)}>Close</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <div dangerouslySetInnerHTML={{ __html: preview.html || "<em>No HTML</em>" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* styles */
const btn = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 12,
};

const card = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  background: "white",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const empty = {
  padding: 16,
  border: "1px dashed #94a3b8",
  borderRadius: 12,
  color: "#64748b",
};

const pill = {
  fontSize: 11,
  color: "#1e293b",
  background: "#e2e8f0",
  borderRadius: 999,
  padding: "2px 8px",
};

const statsRow = {
  display: "flex",
  gap: 10,
  color: "#475569",
  fontSize: 12,
  flexWrap: "wrap",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modal = {
  width: "min(900px, 92vw)",
  maxHeight: "85vh",
  overflow: "auto",
  background: "white",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,.2)",
};
