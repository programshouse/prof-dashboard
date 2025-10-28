// src/stors/useData.js
import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/reem/api/v1/admins/";



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

  // JSON shapes like {"token":"..."} or {"access_token":"..."}
  if (v.startsWith("{") && v.endsWith("}")) {
    try {
      const obj = JSON.parse(v);
      v =
        obj?.access_token ||
        obj?.token ||
        obj?.admin_token ||
        obj?.data?.token ||
        "";
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
  timeout: 2 * 60 * 1000, // 2 min
  headers: { Accept: "application/json" },
});

// Attach Authorization automatically (when present in localStorage)
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
const cleanStr = (v) => (v == null ? "" : String(v).trim());

function mapWorkshopFormToApi(payload) {
  // يجعل الحقول سترينج كما في أمثلتك
  return {
    title_ar: cleanStr(payload.title_ar),
    title_en: cleanStr(payload.title_en),
    price: cleanStr(payload.price),          // "200.00"
    duration: cleanStr(payload.duration),    // "3h"
    frequency: cleanStr(payload.frequency),  // "weekly"
    mode: cleanStr(payload.mode),            // "online"
    description_ar: payload.description_ar ?? null,
    description_en: payload.description_en ?? null,
    created_at: cleanStr(payload.created_at) || undefined,
    updated_at: cleanStr(payload.updated_at) || undefined,
  };
}

/* ======================================================================= */
/* ===============           useWorkshopStore             ================= */
/* ======================================================================= */
export const useWorkshopStore = create((set, get) => ({
  loading: false,
  message: null,

  list: [],       // آخر نتيجة getAll
  listMeta: null, // pagination info إن وجدت
  current: null,  // نتيجة show / create

  // ---------- Create workshop ----------
createWorkshop: async (payload) => {
  try {
    set({ loading: true, message: null });

    const token = localStorage.getItem("access_token");
    if (!token) {
      set({
        loading: false,
        message: "⚠ No token found. Please log in first.",
      });
      return;
    }

    // Build FormData for image + other fields
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    const res = await api.post("/workshops", formData, {
      headers: {
        Authorization: `Bearer ${token}`, // <-- fixed
        "Content-Type": "multipart/form-data",
      },
    });

    set({ loading: false, message: "Workshop created successfully!" });
    return res.data;
  } catch (err) {
    console.error("Create Workshop Error:", err);
    set({ loading: false, message: "❌ Failed to create workshop" });
  }
},

  // ---------- Get All ----------
  getAllWorkshops: async (params = {}) => {
    try {
      set({ loading: true, message: null });

      const res = await api.get("workshops", { params });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const meta = res.data?.meta || null;

      set({ list: data, listMeta: meta });
      return { data, meta };
    } catch (error) {
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to fetch workshops";
      console.error("Get All Workshops Error:", error);
      set({ message: serverMsg });
    } finally {
      set({ loading: false });
    }
  },

  // ---------- Show (by id) ----------
  getWorkshop: async (id) => {
    if (!id && id !== 0) {
      set({ message: "⚠️ Workshop id is required." });
      return;
    }
    try {
      set({ loading: true, message: null });
      const res = await api.get(`workshops/${id}`);
      const one = res.data?.data || res.data;
      set({ current: one });
      return one;
    } catch (error) {
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to load workshop";
      console.error("Show Workshop Error:", error);
      set({ message: serverMsg });
    } finally {
      set({ loading: false });
    }
  },
}));

/* ======================================================================= */
/* ===============             useDataStore               ================= */
/* ======================================================================= */
export const useDataStore = create((set, get) => ({
  // Generic UI state
  loading: false,
  message: null,

  // Program Levels state
  levels: [],
  levelsMeta: null,
  currentLevel: null,

  // Reviews state
  reviews: [],
  reviewsMeta: null,
  currentReview: null,
// slider
  sliders: [],
  currentSlider: null,
   loading: false,
  message: null,
// --- session---
sessions: [],
currentSession: null,
sessionErrors: null,


  /* ---------- Program Levels: Create ---------- */
  createProgramLevel: async (payload = {}) => {
    try {
      set({ loading: true, message: null });

      const picked = pickRawToken();
      const token = picked ? normalizeToken(picked.value) : null;
      if (!token) {
        set({
          loading: false,
          message:
            "⚠️ No token found in localStorage (access_token / authToken / token / admin_token). Please log in first.",
        });
        return;
      }

      // Build multipart/form-data
      const fd = new FormData();
      fd.append("name_ar", payload.name_ar ?? "");
      fd.append("name_en", payload.name_en ?? "");
      fd.append("description_en", payload.description_en ?? "");
      fd.append("description_ar", payload.description_ar ?? "");
      fd.append("order", String(payload.order ?? "1"));

      if (payload.image instanceof File || payload.image instanceof Blob) {
        const filename = payload.image.name || "level-image.png";
        fd.append("image", payload.image, filename);
      }

      // POST /levels (Authorization via interceptor)
      const res = await api.post("levels", fd);

      const created = res?.data?.data || res?.data;
      set({
        currentLevel: created,
        message: "✅ Program level created successfully!",
      });

      // Add to list (optimistic)
      const prev = get().levels || [];
      set({ levels: [created, ...prev] });

      return created;
    } catch (error) {
      console.error("Create Program Level Error:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to create program level";
      set({ message: serverMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- Program Levels: Get All ---------- */
  getAllLevels: async (params = {}) => {
    try {
      set({ loading: true, message: null });
      const res = await api.get("levels", { params });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const meta = res.data?.meta || null;
      set({ levels: data, levelsMeta: meta });
      return { data, meta };
    } catch (error) {
      console.error("Get All Levels Error:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to fetch levels";
      set({ message: serverMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- Program Levels: Show by id ---------- */
  getLevel: async (id) => {
    if (!id && id !== 0) {
      set({ message: "⚠️ Level id is required." });
      return;
    }
    try {
      set({ loading: true, message: null });
      const res = await api.get(`levels/${id}`);
      const one = res.data?.data || res.data;
      set({ currentLevel: one });
      return one;
    } catch (error) {
      console.error("Show Level Error:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to load level";
      set({ message: serverMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ========================= Reviews ========================= */

  // ---------- Reviews: Create ----------
  createReview: async (payload = {}) => {
    try {
      set({ loading: true, message: null });

      const hasBinary =
        payload.image instanceof File ||
        payload.image instanceof Blob ||
        payload.avatar instanceof File ||
        payload.avatar instanceof Blob ||
        (Array.isArray(payload.attachments) &&
          payload.attachments.some((f) => f instanceof File || f instanceof Blob));

      let res;

      if (hasBinary) {
        const fd = new FormData();

        // Append non-file fields
        Object.entries(payload).forEach(([k, v]) => {
          if (v == null) return;
          if (k === "image" || k === "avatar" || k === "attachments") return;

          if (typeof v === "boolean") {
            fd.append(k, v ? "1" : "0");
          } else if (typeof v === "number") {
            fd.append(k, String(v));
          } else {
            fd.append(k, v);
          }
        });

        // Files
        if (payload.image instanceof File || payload.image instanceof Blob) {
          fd.append("image", payload.image, payload.image.name || "review-image.png");
        }
        if (payload.avatar instanceof File || payload.avatar instanceof Blob) {
          fd.append("avatar", payload.avatar, payload.avatar.name || "review-avatar.png");
        }
        if (Array.isArray(payload.attachments)) {
          payload.attachments.forEach((f, i) => {
            if (f instanceof File || f instanceof Blob) {
              fd.append("attachments[]", f, f.name || `attachment-${i + 1}`);
            }
          });
        }

        res = await api.post("reviews", fd);
      } else {
        // Pure JSON body
        const body = { ...payload };
        Object.keys(body).forEach((k) => {
          if (typeof body[k] === "boolean") body[k] = body[k] ? 1 : 0;
        });
        res = await api.post("reviews", body, {
          headers: { "Content-Type": "application/json" },
        });
      }

      const created = res?.data?.data || res?.data;

      set({
        currentReview: created,
        reviews: [created, ...(get().reviews || [])],
        message: "✅ Review created successfully!",
      });

      return created;
    } catch (error) {
      console.error("Create Review Error:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to create review";
      set({ message: serverMsg });
    } finally {
      set({ loading: false });
    }
  },

  // ---------- Reviews: Get All ----------
  getAllReviews: async (params = {}) => {
    try {
      set({ loading: true, message: null });
      // أمثلة params: { page:1, per_page:20, search:"keyword", is_active:1 }
      const res = await api.get("reviews", { params });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const meta = res.data?.meta || null;

      set({ reviews: data, reviewsMeta: meta });
      return { data, meta };
    } catch (error) {
      console.error("Get All Reviews Error:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to fetch reviews";
      set({ message: serverMsg });
    } finally {
      set({ loading: false });
    }
  },

  // ---------- Reviews: Show (by id) ----------
  getReview: async (id) => {
    if (!id && id !== 0) {
      set({ message: "⚠️ Review id is required." });
      return;
    }
    try {
      set({ loading: true, message: null });
      const res = await api.get(`reviews/${id}`);
      const one = res.data?.data || res.data;
      set({ currentReview: one });
      return one;
    } catch (error) {
      console.error("Show Review Error:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to load review";
      set({ message: serverMsg });
    } finally {
      set({ loading: false });
    }
  },

  // sliders---------------------------------------------
 // ---------- Sliders: Create ----------
createSlider: async (images) => {
  set({ loading: true, error: null });
  try {
    if (!Array.isArray(images) || !images.length) throw new Error("Please select at least one image.");

    const fd = new FormData();
    images.forEach((file, idx) => {
      const filename = file.name && /\.[A-Za-z0-9]+$/.test(file.name) ? file.name : `slide_${idx+1}.jpg`;
      fd.append("images[]", file, filename);
    });

    // IMPORTANT: no double slashes
    const root = (import.meta.env.VITE_API_ROOT || "https://www.programshouse.com/reem/api/v1").replace(/\/+$/, "");
    const endpoint = "admins/sliders"; // or "slider" if that’s your route
    const url = `${root}/${endpoint}`;

    const res = await api.post(url, fd, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        Accept: "application/json",
      },
    });

    set({ loading: false });
    return res.data;
  } catch (err) {
    set({ loading: false, error: err?.response?.data?.message || err?.message || "Failed to create slider" });
    throw err;
  }
},


// createBook: async (payload) => {
//   try {
//     set({ loading: true, message: null });

//     const picked = pickRawToken();
//     const token = picked ? normalizeToken(picked.value) : null;
//     if (!token) {
//       set({ loading: false, message: "⚠️ No token found. Please log in first." });
//       return;
//     }

//     const fd = new FormData();

//     // ===== Titles & Descriptions (bi-lingual) =====
//     if (payload.title_en) fd.append("title_en", payload.title_en);
//     if (payload.title_ar) fd.append("title_ar", payload.title_ar);
//     if (payload.description_en) fd.append("description_en", payload.description_en);
//     if (payload.description_ar) fd.append("description_ar", payload.description_ar);

//     // ===== Cover image → images[] =====
//     if (payload.image) fd.append("images[]", payload.image);

//     // ===== Media at root + samples[...] (to match your response shape) =====
//     if (payload.ebook) {
//       fd.append("ebook", payload.ebook);
//       fd.append("samples[ebook]", payload.ebook);
//     }
//     if (payload.audio) {
//       fd.append("audio", payload.audio);
//       fd.append("samples[audio]", payload.audio);
//     }
//     if (payload.paperback) {
//       fd.append("paperback", payload.paperback);
//       fd.append("samples[paperback]", payload.paperback);
//     }
//     if (payload.video) {
//       fd.append("video", String(payload.video));
//       fd.append("samples[video]", String(payload.video));
//     }

//     // ===== Prices array =====
//     if (Array.isArray(payload.prices)) {
//       payload.prices
//         .filter((p) => p && p.type && p.price !== "" && p.price != null)
//         .forEach((p, i) => {
//           fd.append(`prices[${i}][type]`, String(p.type));
//           fd.append(`prices[${i}][price]`, Number(p.price).toFixed(2));
//         });
//     }

//     // ===== Stock / availability =====
//     if (typeof payload.is_stock !== "undefined") {
//       fd.append("is_stock", payload.is_stock ? "1" : "0");
//     }
//     if (typeof payload.is_available !== "undefined") {
//       fd.append("is_available", payload.is_available ? "1" : "0");
//     }
//     if (payload.stock_count !== undefined && payload.stock_count !== "") {
//       fd.append("stock_count", String(payload.stock_count));
//     }

//     const res = await api.post("books", fd, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     set({
//       current: res?.data?.data || res?.data,
//       message: "✅ Book created successfully!",
//     });
//     return res?.data;
//   } catch (error) {
//     const serverMsg =
//       error?.response?.data?.message ||
//       error?.response?.data?.error ||
//       error?.message ||
//       "❌ Failed to create book";
//     console.error("Create Book Error:", error);
//     set({ message: serverMsg });
//   } finally {
//     set({ loading: false });
//   }
// },




createSession: async (payload = {}) => {
  try {
    set({ loading: true, message: null });

    // ✅ Token (يلتقطه الانترسبتور، وبرضه نتحقق محليًا لرسالة أوضح)
    const picked = pickRawToken();
    const token = picked ? normalizeToken(picked.value) : null;
    if (!token) {
      set({
        loading: false,
        message:
          "⚠️ No token found in localStorage (access_token / authToken / token / admin_token). Please log in first.",
      });
      return;
    }

    // ✅ Build multipart/form-data — مرن: بيحوّل أي scalar/string/number/boolean، وكمان Files
    const fd = new FormData();
    Object.entries(payload || {}).forEach(([k, v], i) => {
      if (v === undefined || v === null) return;

      // Files / Blobs
      if (v instanceof File || v instanceof Blob) {
        const fname =
          (v && v.name) || `${k}-${Date.now()}${i ? `-${i}` : ""}`;
        fd.append(k, v, fname);
        return;
      }

      // Arrays → append as k[] (بسيط وعملي)
      if (Array.isArray(v)) {
        v.forEach((itm, j) => {
          if (itm instanceof File || itm instanceof Blob) {
            const fname = itm.name || `${k}-${j}.bin`;
            fd.append(`${k}[]`, itm, fname);
          } else if (typeof itm === "boolean") {
            fd.append(`${k}[]`, itm ? "1" : "0");
          } else if (itm !== undefined && itm !== null) {
            fd.append(`${k}[]`, String(itm));
          }
        });
        return;
      }

      // Booleans → "1"/"0"
      if (typeof v === "boolean") {
        fd.append(k, v ? "1" : "0");
        return;
      }

      // Numbers/Strings
      fd.append(k, String(v));
    });

    // ⛳ endpoint: child sessions تحت الخطّة الرئيسية
    const res = await api.post("coaching-sessions", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
        // Authorization بيتحط تلقائيًا من الـ interceptor، بس مفيش مشكلة لو فضل
        Authorization: token,
      },
    });

    const created = res?.data?.data || res?.data;

    // مفيش تعديل على state arrays حسب طلبك — بس رسالة نجاح وإرجاع الناتج
    set({ message: "✅ Session created successfully!" });
    return created;
  } catch (error) {
    console.error("Create Session Error:", error);
    const serverMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "❌ Failed to create session";
    set({ message: serverMsg });
  } finally {
    set({ loading: false });
  }
},




  // ============= State =============
  faqs: [],
  currentFaq: null,
  loading: false,
  message: null,
  faqErrors: null,

  // ============= Single Create =============
  createFaq: async (payload = {}) => {
    try {
      set({ loading: true, message: null, faqErrors: null });

      const {
        question_en,
        question_ar,
        answer_en,
        answer_ar,
        question,
        answer,
        order,
      } = payload || {};

      const body = {
        question_en: (question_en ?? question ?? "").toString().trim(),
        question_ar: (question_ar ?? question ?? "").toString().trim(),
        answer_en: (answer_en ?? answer ?? "").toString().trim(),
        answer_ar: (answer_ar ?? answer ?? "").toString().trim(),
        order: Number.isFinite(order) ? Number(order) : 1,
      };

      // sanitize booleans/numbers
      Object.keys(body).forEach((k) => {
        if (typeof body[k] === "boolean") body[k] = body[k] ? 1 : 0;
        if (typeof body[k] === "number" && Number.isNaN(body[k])) body[k] = 0;
      });

      const res = await api.post("faqs", body, {
        headers: { "Content-Type": "application/json" },
      });

      const created = res?.data?.data || res?.data;

      set((s) => ({
        currentFaq: created,
        faqs: [created, ...(s.faqs || [])],
        message: "✅ FAQ created successfully!",
        faqErrors: null,
      }));

      return created;
    } catch (error) {
      console.error("Create FAQ Error:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to create FAQ";

      const errors = error?.response?.data?.errors || null;

      set({ message: serverMsg, faqErrors: errors });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // ============= Bulk Create =============
  createFaqBulk: async (
    items = [],
    { startOrder = 1, duplicateToBoth = true } = {}
  ) => {
    const { createFaq } = get();
    const results = [];
    let order = Number.isFinite(startOrder) ? startOrder : 1;

    for (const it of items) {
      const payload = duplicateToBoth
        ? {
            question_en: (it.question ?? "").trim(),
            question_ar: (it.question ?? "").trim(),
            answer_en: (it.answer ?? "").trim(),
            answer_ar: (it.answer ?? "").trim(),
            order: it.order ?? order++,
          }
        : {
            question_en: (it.question_en ?? it.question ?? "").trim(),
            question_ar: (it.question_ar ?? it.question ?? "").trim(),
            answer_en: (it.answer_en ?? it.answer ?? "").trim(),
            answer_ar: (it.answer_ar ?? it.answer ?? "").trim(),
            order: it.order ?? order++,
          };

      const created = await createFaq(payload);

      results.push({
        input: it,
        ok: !!created,
        data: created,
        errors: get().faqErrors || null,
      });
    }

    const okCount = results.filter((r) => r.ok).length;
    const failCount = results.length - okCount;

    set((s) => ({
      ...s,
      message: `✅ Created ${okCount} FAQ(s)${
        failCount ? ` • ❌ Failed ${failCount}` : ""
      }`,
    }));

    return results;
  },

// ================= Create Love Legacy =================
createLoveLegacy: async (formData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post(`/love-legacy`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const created = res?.data?.data ?? res?.data ?? null;
      set({ loading: false, message: "Created successfully" });
      return created; // should include { id, ... }
    } catch (err) {
      console.error(err);
      set({ loading: false, error: "Failed to create love-legacy item" });
      throw err;
    }
  },

// ================= Create Session =================

  // state
  loading: false,
  message: null,
  sessionErrors: null,
  sessions: [],
  currentSession: null,

  // normalize helpers
  _toArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
    if (typeof value === "string") {
      return value
        .split(/[\n,]/g)        // split by comma or newline
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (value == null) return [];
    return [String(value).trim()].filter(Boolean);
  },

  // ================= Create Session =================
  createSession: async (payload = {}) => {
    try {
      set({ loading: true, message: null, sessionErrors: null });

      const {
        name_en,
        name_ar,
        description_en,
        description_ar,
        features_en,
        features_ar,
        image,
        // optional simple aliases:
        name, description, features,
        ...rest
      } = payload || {};

      // map fields
      const _features_en = get()._toArray(features_en ?? features ?? "");
      const _features_ar = get()._toArray(features_ar ?? features ?? "");

      const hasBinary = image instanceof File || image instanceof Blob;

      let res;

      if (hasBinary) {
        const fd = new FormData();
        fd.append("name_en", (name_en ?? name ?? "").trim());
        fd.append("name_ar", (name_ar ?? name ?? "").trim());
        fd.append("description_en", (description_en ?? description ?? "").trim());
        fd.append("description_ar", (description_ar ?? description ?? "").trim());

        // arrays: features_en[], features_ar[]
        _features_en.forEach((val) => fd.append("features_en[]", val));
        _features_ar.forEach((val) => fd.append("features_ar[]", val));

        // file
        fd.append("image", image, image.name || "session.png");

        // include extra primitives if any
        Object.entries(rest).forEach(([k, v]) => {
          if (v == null) return;
          if (typeof v === "boolean") fd.append(k, v ? "1" : "0");
          else fd.append(k, String(v));
        });

        res = await api.post("coaching-sessions", fd);
      } else {
        // pure JSON (features as arrays)
        const body = {
          name_en: (name_en ?? name ?? "").trim(),
          name_ar: (name_ar ?? name ?? "").trim(),
          description_en: (description_en ?? description ?? "").trim(),
          description_ar: (description_ar ?? description ?? "").trim(),
          features_en: _features_en, // arrays
          features_ar: _features_ar, // arrays
          ...rest,
        };

        // boolean → 1/0 if the backend expects numeric
        Object.keys(body).forEach((k) => {
          if (typeof body[k] === "boolean") body[k] = body[k] ? 1 : 0;
        });

        res = await api.post("coaching-sessions", body, {
          headers: { "Content-Type": "application/json" },
        });
      }

      const created = res?.data?.data || res?.data;

      set((s) => ({
        currentSession: created,
        sessions: [created, ...(s.sessions || [])],
        message: "✅ Session created successfully!",
        sessionErrors: null,
      }));

      return created;
    } catch (error) {
      console.error("Create Session Error:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ Failed to create session";
      const errors = error?.response?.data?.errors || null;
      set({ message: serverMsg, sessionErrors: errors });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // (optional) bulk helper
  createSessionsBulk: async (items = []) => {
    const results = [];
    for (const it of items) {
      const created = await get().createSession(it);
      results.push({ input: it, ok: !!created, data: created, errors: get().sessionErrors || null });
    }
    const okCount = results.filter((r) => r.ok).length;
    const failCount = results.length - okCount;
    set((s) => ({
      ...s,
      message: `✅ Created ${okCount} session(s)${failCount ? ` • ❌ Failed ${failCount}` : ""}`,
    }));
    return results;
  },


}));
