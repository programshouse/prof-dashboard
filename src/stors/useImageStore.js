// src/stors/useImageStore.js
import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/reem/api/v1/admins";

/* ================= Token Helpers ================= */
function pickRawToken() {
  const keys = ["access_token", "authToken", "token", "admin_token", "adminToken"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return { key: k, value: v };
  }
  return null;
}
function normalizeToken(raw) {
  if (!raw) return null;
  let v = raw.trim();

  // Handle JSON tokens: {"access_token":"..."} etc.
  if (v.startsWith("{") && v.endsWith("}")) {
    try {
      const obj = JSON.parse(v);
      v = obj?.access_token || obj?.token || obj?.admin_token || obj?.data?.token || "";
    } catch (_) {}
  }

  // Strip wrapping quotes
  v = v.replace(/^"(.*)"$/, "$1").trim();
  if (!v) return null;
  return v.startsWith("Bearer ") ? v : `Bearer ${v}`;
}

/* ================= Axios Client ================= */
const api = axios.create({
  baseURL: API_ROOT,
  timeout: 5 * 60 * 1000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const picked = pickRawToken();
  const bearer = picked ? normalizeToken(picked.value) : null;
  if (bearer) {
    config.headers = config.headers || {};
    config.headers.Authorization = bearer;
  }
  return config;
});

/* ================= Helpers ================= */
const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

/* ================= Store ================= */
export const useImageStore = create((set, get) => ({
  loading: false,
  message: null,
  error: null,

  images: [],
  videos: [],

  /* ===== Upload Image ===== */
  uploadImage: async (file, section) => {
    try {
      set({ loading: true, message: null, error: null });

      const picked = pickRawToken();
      if (!picked) {
        set({ loading: false, message: "⚠️ No token found in localStorage. Please log in first." });
        return null;
      }
      if (!file) {
        set({ loading: false, message: "⚠️ Please choose an image file first." });
        return null;
      }

      const formData = new FormData();
      formData.append("image", file);
      if (section != null) formData.append("section", section);

      // IMPORTANT: use a leading slash so the path is /admins/images/upload
      const res = await api.post("/images/upload", formData, {
        // Let axios set the multipart boundary automatically
        timeout: 6 * 60 * 1000,
      });

      const payload = unwrap(res);
      set({ message: "✅ Image uploaded successfully!" });
      return payload;
    } catch (error) {
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to upload image";
      set({ message: serverMsg, error: serverMsg });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /* ===== List Images (used by AllImages.jsx) ===== */
  getAllImages: async () => {
    set({ loading: true, message: null, error: null });
    try {
      // Use axios client WITH proper base + leading slash
      const res = await api.get("/images");
      const images = unwrap(res) || [];
      set({ images, loading: false });
      return images;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "❌ Failed to fetch images!";
      set({ loading: false, message: msg, error: msg });
      console.error(err);
      return [];
    }
  },

  /* ===== Optional alias (if some pages call fetchImages) ===== */
  fetchImages: async () => {
    return await get().getAllImages();
  },

  /* ===== Get One (your table page calls fetchImageById) ===== */
  fetchImageById: async (id) => {
    try {
      set({ loading: true, message: null, error: null });
      const res = await api.get(`/images/${id}`);
      const item = unwrap(res);
      set({ loading: false });
      return item;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "❌ Failed to fetch image details";
      set({ loading: false, message: msg, error: msg });
      return null;
    }
  },

  /* ===== Update Image File ===== */
// in useImageStore.js
updateImageFile: async (id, file) => {
  try {
    set({ loading: true, message: null, error: null });

    if (!file) {
      const msg = "⚠️ Please choose a new image first.";
      set({ message: msg, error: msg });
      return null;
    }

    const formData = new FormData();
    formData.append("_method", "PUT");      // 👈 Laravel-friendly method spoof
    formData.append("image", file);

    // Use POST + _method=PUT to /admins/images/:id
    const res = await api.post(`/images/${id}`, formData);

    // Accept {data: {...}} OR {...} OR even {image: "..."}
    const payload = res?.data?.data ?? res?.data ?? null;

    // Normalize what we return to always have .image if server sent it
    const normalized =
      payload && typeof payload === "object"
        ? payload
        : { image: payload }; // e.g. if server returns just the URL/string

    set((s) => ({
      images: (s.images || []).map((img) =>
        img.id === id ? { ...img, ...normalized } : img
      ),
      message: "✅ Image updated successfully",
    }));

    return normalized;
  } catch (err) {
    console.error("❌ Failed to update image", err);
    const msg =
      err?.response?.data?.message || err?.message || "❌ Failed to update image";
    set({ message: msg, error: msg });
    return null;
  } finally {
    set({ loading: false });
  }
},


  /* ===== Delete ===== */
  deleteImage: async (id) => {
    try {
      set({ loading: true, message: null, error: null });
      // IMPORTANT: leading slash
      await api.delete(`/images/${id}`);
      set((s) => ({
        images: (s.images || []).filter((img) => img.id !== id),
        message: "🗑️ Image deleted successfully",
      }));
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "❌ Failed to delete image";
      set({ message: msg, error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },



  // ================= Videos =================

  loading: false,
  error: null,
  message: "",
  createdVideo: null,
  selectedVideo: null,
  deletedVideo: null,

  // Upload video
  uploadVideo: async (file, section) => {
    set({ loading: true, message: "", error: null });
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("section", section);

      const res = await axios.post(`${API_ROOT}/videos/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set({ loading: false, message: "✅ Video uploaded successfully!" });
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "❌ Upload failed!";
      set({ loading: false, message: msg, error: msg });
      console.error(err);
      return null;
    }
  },

  // Get video by ID
  getVideo: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/videos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ selectedVideo: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch video";
      set({ error: msg, loading: false });
      console.error(err);
      throw err;
    }
  },


updateVideoFile: async (id, file) => {
  try {
    set({ loading: true, message: null, error: null });

    if (!file) {
      const msg = "⚠️ Please choose a new video first.";
      set({ message: msg, error: msg });
      return null;
    }

    const formData = new FormData();
    formData.append("_method", "PUT");      // 👈 Laravel-friendly method spoof
    formData.append("video", file);

    // Use POST + _method=PUT to /admins/images/:id
    const res = await api.post(`/videos/${id}`, formData);

    // Accept {data: {...}} OR {...} OR even {image: "..."}
    const payload = res?.data?.data ?? res?.data ?? null;

    // Normalize what we return to always have .image if server sent it
    const normalized =
      payload && typeof payload === "object"
        ? payload
        : { video: payload }; // e.g. if server returns just the URL/string

    set((s) => ({
      images: (s.images || []).map((img) =>
        img.id === id ? { ...img, ...normalized } : img
      ),
      message: "✅ video updated successfully",
    }));

    return normalized;
  } catch (err) {
    console.error("❌ Failed to update video", err);
    const msg =
      err?.response?.data?.message || err?.message || "❌ Failed to update video";
    set({ message: msg, error: msg });
    return null;
  } finally {
    set({ loading: false });
  }
},


  // Delete video by ID
  deleteVideo: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`${API_ROOT}/videos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ deletedVideo: id, loading: false, message: "✅ Video deleted successfully!" });
      return res.data.message || "Video deleted successfully";
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete video";
      set({ error: msg, loading: false, message: msg });
      console.error(err);
      throw err;
    }
  },

  // Get all videos
  getAllVideos: async () => {
    set({ loading: true, message: "", error: null });
    try {
      const res = await axios.get(`${API_ROOT}/videos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const videos = res.data?.data || [];
      set({ videos, loading: false });
      return videos;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "❌ Failed to fetch videos!";
      set({ loading: false, message: msg, error: msg });
      console.error(err);
      return [];
    }
  },
}));


