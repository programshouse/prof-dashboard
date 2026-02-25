// /src/stores/useWhoAmIStore.js
import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/who-am-i";
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ---------- File helpers & validation ---------- */
const isFileLike = (v) =>
  (typeof File !== "undefined" && v instanceof File) ||
  (typeof Blob !== "undefined" && v instanceof Blob);

const isFormData = (v) =>
  typeof FormData !== "undefined" && v instanceof FormData;

const getExt = (name = "") =>
  name.includes(".") ? name.split(".").pop().toLowerCase() : "";

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);
const ALLOWED_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

const VIDEO_EXT = new Set([
  "mp4",
  "mov",
  "m4v",
  "webm",
  "mkv",
  "avi",
  "wmv",
  "flv",
  "mpeg",
  "mpg",
  "3gp",
  "ogg",
  "ogv",
]);

/** Ensure file has a name; assign one based on mime/ext if needed */
const ensureNamedFile = (fileOrBlob, fallbackBase = "upload") => {
  if (typeof File !== "undefined" && fileOrBlob instanceof File) return fileOrBlob;

  const type = fileOrBlob.type || "";
  let ext = "bin";
  if (type && type.includes("/")) {
    const maybe = type.split("/").pop().toLowerCase();
    ext = maybe === "svg+xml" ? "svg" : maybe;
  }

  try {
    return new File([fileOrBlob], `${fallbackBase}.${ext}`, { type });
  } catch {
    return fileOrBlob;
  }
};

const assertValidImage = (file) => {
  const f = ensureNamedFile(file, "image");
  const okMime = f.type ? ALLOWED_IMAGE_MIME.has(f.type) : false;
  const okExt = ALLOWED_IMAGE_EXT.has(getExt(f.name));
  if (!okMime && !okExt) {
    throw new Error("Image must be a file of type: jpg, jpeg, png, gif, webp, svg.");
  }
  return f;
};

const assertValidVideo = (file) => {
  const f = ensureNamedFile(file, "video");
  const ext = getExt(f.name);
  const okMime = f.type?.startsWith("video/");
  const okExt = VIDEO_EXT.has(ext);
  if (!okMime && !okExt) {
    throw new Error("Please choose a valid video file.");
  }
  return f;
};

/* ---------- IMPORTANT: normalize keys (camelCase -> snake_case where needed) ---------- */
const normalizeBodyKeys = (body) => {
  if (!body || typeof body !== "object" || isFormData(body)) return body;

  const out = { ...body };

  // If the form uses camelCase, convert it to what your API expects
  if (out.videoLink != null && out.video_link == null) {
    out.video_link = out.videoLink;
    delete out.videoLink;
  }

  // optional extra safety (if you used a different name before)
  if (out.videoLinkUrl != null && out.video_link == null) {
    out.video_link = out.videoLinkUrl;
    delete out.videoLinkUrl;
  }

  return out;
};

/**
 * Convert plain object with File/Blob values to FormData.
 */
const autoFormData = (body) => {
  if (!body || typeof body !== "object" || isFormData(body)) return body;

  let hasFile = false;
  for (const k in body) {
    if (isFileLike(body[k])) {
      hasFile = true;
      break;
    }
  }
  if (!hasFile) return body;

  const fd = new FormData();
  Object.entries(body).forEach(([k, v]) => {
    if (v === undefined || v === null) return;

    if (isFileLike(v)) {
      const keyLower = k.toLowerCase();
      let file = v;

      if (/(^|_)(image|img|photo|avatar)(_|$)/.test(keyLower)) {
        file = assertValidImage(v);
      } else if (/(^|_)(video|vid)(_|$)/.test(keyLower)) {
        file = assertValidVideo(v);
      } else {
        file = ensureNamedFile(v);
      }

      fd.append(k, file);
      return;
    }

    if (Array.isArray(v)) {
      v.forEach((item) => fd.append(`${k}[]`, item));
    } else {
      fd.append(k, v);
    }
  });

  return fd;
};

const buildHeaders = (body) => {
  const base = { ...authHeaders(), Accept: "application/json" };
  if (isFormData(body)) return base; // axios sets boundary automatically
  return { ...base, "Content-Type": "application/json" };
};

const toList = (data) => {
  const payload = data?.data ?? data?.items ?? data?.result ?? data;
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") return [payload];
  return [];
};

export const useWhoAmIStore = create((set, get) => ({
  items: [],
  item: null,
  loading: false,
  error: null,
  created: null,
  updated: null,

  async create(body) {
    set({ loading: true, error: null });
    try {
      const normalized = normalizeBodyKeys(body);
      const payload = autoFormData(normalized);
      const headers = buildHeaders(payload);

      const { data } = await api.post("", payload, { headers });
      const created = data?.data ?? data;

      set({ created, loading: false });
      await get().fetchAll();
      return created;
    } catch (err) {
      set({
        error: err?.response?.data?.message || err?.message || "Failed to create",
        loading: false,
      });
      throw err;
    }
  },

  async update(idOrObj, maybeBody) {
    const id =
      typeof idOrObj === "string" || typeof idOrObj === "number"
        ? idOrObj
        : idOrObj?.id;

    const rawBody = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("update: missing id");

    set({ loading: true, error: null });
    try {
      const normalized = normalizeBodyKeys(rawBody);
      const payload = autoFormData(normalized);
      const headers = buildHeaders(payload);

      let resp;
      if (isFormData(payload)) {
        payload.append("_method", "PATCH");
        resp = await api.post(`/${id}`, payload, { headers });
      } else {
        resp = await api.patch(`/${id}`, payload, { headers });
      }

      const updated = resp.data?.data ?? resp.data;

      set({ updated, loading: false });
      await get().fetchAll();
      return updated;
    } catch (err) {
      set({
        error: err?.response?.data?.message || err?.message || "Failed to update",
        loading: false,
      });
      throw err;
    }
  },

  async remove(idOrObj) {
    const id =
      typeof idOrObj === "string" || typeof idOrObj === "number"
        ? idOrObj
        : idOrObj?.id;
    if (!id) throw new Error("delete: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/${id}`, { headers: authHeaders() });
      set({ loading: false });
      await get().fetchAll();
      return data?.data ?? data;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to delete",
        loading: false,
      });
      throw err;
    }
  },

  async fetchAll() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", { headers: authHeaders() });
      const list = toList(data);
      set({ items: list, loading: false });
      return list;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to fetch",
        loading: false,
      });
      throw err;
    }
  },

  async fetchById(id) {
    if (!id) throw new Error("fetchById: missing id");
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/${id}`, { headers: authHeaders() });
      const item = data?.data ?? data;
      set({ item, loading: false });
      return item;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to get item",
        loading: false,
      });
      throw err;
    }
  },
}));