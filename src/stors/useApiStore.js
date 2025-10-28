import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/reem/api/v1/admins";

const api = axios.create({
  baseURL: API_ROOT,
  timeout: 2 * 60 * 1000,
  headers: { Accept: "application/json" },
});

const pickToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("admin_token") ||
  localStorage.getItem("token");

const authHeader = () => {
  const t = pickToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const useApiStore = create((set, get) => ({


  
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
// In your store
listCategories: async (type) => {
  try {
    set({ categoriesLoading: true, categoriesError: null });

    // Build URL with optional ?type=...
    const u = new URL(`${API_ROOT}/categories`);
    if (type && type !== "all") u.searchParams.set("type", String(type));

    const res = await axios.get(u.toString(), { headers: authHeader() });

    const rows = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : [];

    const normalized = rows.map((r) => ({
      id: r.id,
      name_en: r.name_en || r.title_en || r.name || r.title || `Category #${r.id}`,
      // keep anything else you rely on:
      name_ar: r.name_ar,
      image: r.image,
      order: r.order,
      is_active: r.is_active,
      children: r.children,
      type: r.type, // <-- helpful downstream
    }));

    set({ categories: normalized, categoriesLoading: false });
    return normalized;
  } catch (err) {
    set({
      categoriesLoading: false,
      categoriesError:
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load categories",
    });
    throw err;
  }
},


  quizzes: [],
  selectedQuiz: null, // <-- for single quiz
  loading: false,
  error: null,
  workshops: [],
  current: null,
  selectedWorkshop: null,
  reviews: [],
  selectedReview: null,
  sliders: [],
  levels: [],
  selectedLevel: null,
  loveLegacy: [],
  selectedLoveLegacy: null,
  books: [],
  coachingSessions: [],
  selectedCoachingSession: null,
  books: [],
  selectedBook: null,
  sessionPlans: [],
  selectedSessionPlan: null,
  approvedTopics: [],
  pendingTopics: [],
  blogs: [],
  categories: [],
  sitePrice: null,
    ticket: null,
  // Fetch all quizzes

  fetchQuizzes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/quizzes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ quizzes: res.data.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch quizzes", loading: false });
    }
  },

  // Fetch a single quiz by id
  fetchQuizById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/quizzes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ selectedQuiz: res.data.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch quiz", loading: false });
    }
  },
  deleteQuiz: async (quizId) => {
    try {
      await axios.delete(`${API_ROOT}/quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set((state) => ({
        quizzes: state.quizzes.filter((q) => q.id !== quizId),
      }));

      return true;
    } catch (err) {
      console.error("Delete quiz failed:", err);
      throw err;
    }
  },
  //  Quiz: async (quizId) => {
  //   try {
  //     await axios.patch(`${API_ROOT}/quizzes/${quizId}`, {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  //     });
  //     set((state) => ({
  //       quizzes: state.quizzes.filter((q) => q.id !== quizId),
  //     }));
  //     return true;
  //   } catch (err) {
  //     console.error("update quiz failed:", err);
  //     throw err;
  //   }
  // },

  // Fetch a workshops list
  // stors/useApiStore.js
  updateQuiz: async (quizId, payload) => {
    // payload shape should match your Postman JSON (see builder below)
    set({ loading: true, error: null });
    try {
      const res = await api.patch(`${API_ROOT}/quizzes/${quizId}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const updated = res?.data?.data ?? res?.data;
      set((s) => ({
        quizzes: (s.quizzes || []).map((q) =>
          String(q.id) === String(quizId) ? { ...q, ...updated } : q
        ),
        selectedQuiz:
          s.selectedQuiz && String(s.selectedQuiz.quizId) === String(quizId)
            ? { ...s.selectedQuiz, ...updated }
            : s.selectedQuiz,
        loading: false,
        error: null,
      }));

      return updated;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update quiz";
      set({ loading: false, error: msg });
      throw err;
    }
  },

  fetchWorkshops: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/workshops", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ workshops: res.data.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch workshops", loading: false });
    }
  },

  // Fetch a single workshop by id
  fetchWorkshopById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/workshops/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ selectedWorkshop: res.data.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch workshop", loading: false });
    }
  },
  // Update a workshop by id
  // updateWorkshop: async (id, payload) => {
  //   set({ loading: true, error: null });
  //   try {
  //     const token = localStorage.getItem("access_token");
  //     const formData = new FormData();

  //     Object.entries(payload).forEach(([key, value]) => {
  //       if (value !== null && value !== undefined && value !== "") {
  //         formData.append(key, value);
  //       }
  //     });

  //     const res = await api.post(`/workshops/${id}?_method=PUT`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     set({ selectedWorkshop: res.data.data, loading: false });
  //     return res.data;
  //   } catch (err) {
  //     console.error("Update Workshop Error:", err);
  //     set({ error: "Failed to update workshop", loading: false });
  //   }
  // },

  // Delete a workshop by id

  // in useApiStore.js (or wherever your actions live)
  updateWorkshop: async (id, data) => {
    set({ loading: true, error: null });
    try {
      let body;
      let headers = {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };

      // If data.image is a File -> use FormData for multipart; otherwise JSON.
      const hasFile = data && data.image instanceof File;

      if (hasFile) {
        const fd = new FormData();
        // copy all keys from the plain object
        Object.entries(data).forEach(([k, v]) => {
          if (v === undefined) return;
          fd.append(k, v);
        });
        fd.append("_method", "PATCH");
        body = fd;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(data);
      }

      const res = await api.request({
        url: `/workshops/${id}`, // adjust to your endpoint
        method: hasFile ? "POST" : "PATCH", // POST when using _method override
        data: body,
        headers,
      });

      const updated = res?.data?.data ?? res?.data ?? null;
      set({ selectedWorkshop: updated, loading: false });
      // Optionally: also update in list if you keep a workshops array in state
      set((s) => ({
        workshops: Array.isArray(s.workshops)
          ? s.workshops.map((w) =>
              w.id === updated?.id ? { ...w, ...updated } : w
            )
          : s.workshops,
      }));

      return updated;
    } catch (err) {
      set({ error: "Failed to update workshop", loading: false });
      throw err;
    }
  },

  deleteWorkshop: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/workshops/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      set((state) => ({
        workshops: (state.workshops || []).filter((w) => w.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to delete workshop", loading: false });
    }
  },

  getAllReviews: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({
        reviews: res?.data?.data ?? res?.data ?? [],
        reviewsMeta: res?.data?.meta ?? null,
        loading: false,
      });
    } catch (err) {
      set({ error: "Failed to load reviews", loading: false });
      throw err;
    }
  },
  getAllApproved: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/reviews", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({
        reviews: res?.data?.data ?? res?.data ?? [],
        reviewsMeta: res?.data?.meta ?? null,
        loading: false,
      });
    } catch (err) {
      set({ error: "Failed to load reviews", loading: false });
      throw err;
    }
  },

    getAllpending: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/pending", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({
        reviews: res?.data?.data ?? res?.data ?? [],
        reviewsMeta: res?.data?.meta ?? null,
        loading: false,
      });
    } catch (err) {
      set({ error: "Failed to load reviews", loading: false });
      throw err;
    }
  },


  fetchReviewById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const review = res?.data?.data ?? res?.data;
      set({ selectedReview: review, loading: false });
      return review;
    } catch (err) {
      set({ error: "Failed to fetch review", loading: false });
      throw err;
    }
  },

  deleteReview: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set((s) => ({
        reviews: (s.reviews || []).filter((r) => String(r.id) !== String(id)),
        selectedReview:
          s.selectedReview && String(s.selectedReview.id) === String(id)
            ? null
            : s.selectedReview,
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: "Failed to delete review", loading: false });
      throw err;
    }
  },
  // Get all sliders
  fetchSliders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/sliders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ sliders: res.data?.data ?? res.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch sliders", loading: false });
    }
  },
  // Show one slider (GET /sliders/:id)
  fetchSliderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/sliders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const slider = res?.data?.data ?? res?.data;
      set({ selectedSlider: slider, loading: false });
      return slider; // optional: so callers can use the value directly
    } catch (err) {
      set({ error: "Failed to fetch slider", loading: false });
      throw err;
    }
  },

  // Update a slider (PATCH /sliders/:id)

  updateSlider: async (id, payload) => {
    set({ loading: true, error: null });

    // Helper: detect FormData safely
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;

    try {
      let res;

      if (isFormData) {
        // Laravel-friendly: method override when using multipart
        if (!payload.has("_method")) payload.append("_method", "PATCH");

        res = await api.post(`/sliders/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
          },
        });
      } else {
        // JSON PATCH
        res = await api.patch(`/sliders/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      }

      const updated = res?.data?.data ?? res?.data;

      set((s) => ({
        sliders: (s.sliders || []).map((x) =>
          String(x.id) === String(id) ? { ...x, ...updated } : x
        ),
        selectedSlider:
          s.selectedSlider && String(s.selectedSlider.id) === String(id)
            ? { ...s.selectedSlider, ...updated }
            : s.selectedSlider,
        loading: false,
        error: null,
      }));

      return updated;
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update slider";
      set({ error: serverMsg, loading: false });
      throw err;
    }
  },

  // Delete a slider (DELETE /sliders/:id)
  deleteSlider: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/sliders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // remove from list + clear selected if it's the one deleted
      set((s) => ({
        sliders: (s.sliders || []).filter((x) => String(x.id) !== String(id)),
        selectedSlider:
          s.selectedSlider && String(s.selectedSlider.id) === String(id)
            ? null
            : s.selectedSlider,
        loading: false,
      }));

      return true;
    } catch (err) {
      set({ error: "Failed to delete slider", loading: false });
      throw err;
    }
  },


// replaceSliderImage: async (sliderId, imageId, file) => {
//   if (!file) throw new Error("No file provided");
//   set({ loading: true, error: null });

//   try {
//     const fd = new FormData();
//     const name =
//       file.name && /\.[A-Za-z0-9]+$/.test(file.name) ? file.name : "image.jpg";
//     fd.append("image", file, name);

//     const res = await api.post(
//       `/sliders/${sliderId}/images/${imageId}/replace`,
//       fd,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//           Accept: "application/json",
//         },
//       }
//     );

//     const payload = res?.data?.data ?? res?.data;
//     const newImage =
//       payload?.image ??
//       payload; // be flexible; adjust if your backend returns a fixed shape

//     // attempt to read the new url/src from common keys
//     const newUrl =
//       newImage?.url ??
//       newImage?.image_url ??
//       newImage?.path ??
//       newImage?.src ??
//       null;

//     // update state: selectedSlider.images & sliders list
//     set((s) => {
//       const patchSlider = (sl) => {
//         if (!sl) return sl;
//         return {
//           ...sl,
//           images: Array.isArray(sl.images)
//             ? sl.images.map((im) => {
//                 const imId =
//                   im?.id ?? im?.image_id ?? im?.uuid ?? im?.pivot_id ?? null;
//                 if (String(imId) !== String(imageId)) return im;
//                 // merge the new data while keeping id intact
//                 const merged = { ...(im || {}), ...(newImage || {}) };
//                 if (newUrl) {
//                   // normalize a "url" field for clients
//                   merged.url = newUrl;
//                 }
//                 return merged;
//               })
//             : sl.images,
//         };
//       };

//       return {
//         sliders: (s.sliders || []).map((x) =>
//           String(x.id) === String(sliderId) ? patchSlider(x) : x
//         ),
//         selectedSlider:
//           s.selectedSlider && String(s.selectedSlider.id) === String(sliderId)
//             ? patchSlider(s.selectedSlider)
//             : s.selectedSlider,
//         loading: false,
//         error: null,
//       };
//     });

//     return newImage;
//   } catch (err) {
//     const serverMsg =
//       err?.response?.data?.message ||
//       err?.response?.data?.error ||
//       err?.message ||
//       "Failed to replace image";
//     set({ error: serverMsg, loading: false });
//     throw err;
//   }
// },

// /**
//  * Delete a single image from a slider.
//  * Endpoint: DELETE /sliders/:sliderId/images/:imageId
//  */
// deleteSliderImage: async (sliderId, imageId) => {
//   set({ loading: true, error: null });
//   try {
//     const res = await api.delete(
//       `/sliders/${sliderId}/images/${imageId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//           Accept: "application/json",
//         },
//       }
//     );

//     // some APIs return remaining slider; some return success flag
//     const payload = res?.data?.data ?? res?.data;

//     set((s) => {
//       const stripFrom = (sl) => {
//         if (!sl?.images) return sl;
//         return {
//           ...sl,
//           images: sl.images.filter((im) => {
//             const imId =
//               im?.id ?? im?.image_id ?? im?.uuid ?? im?.pivot_id ?? null;
//             return String(imId) !== String(imageId);
//           }),
//         };
//       };

//       return {
//         sliders: (s.sliders || []).map((x) =>
//           String(x.id) === String(sliderId) ? stripFrom(x) : x
//         ),
//         selectedSlider:
//           s.selectedSlider && String(s.selectedSlider.id) === String(sliderId)
//             ? stripFrom(s.selectedSlider)
//             : s.selectedSlider,
//         loading: false,
//         error: null,
//       };
//     });

//     return payload ?? { success: true };
//   } catch (err) {
//     const serverMsg =
//       err?.response?.data?.message ||
//       err?.response?.data?.error ||
//       err?.message ||
//       "Failed to delete image";
//     set({ error: serverMsg, loading: false });
//     throw err;
//   }
// },


  // Get ALL levels (GET /levels)
  fetchLevels: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/levels", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ levels: res.data?.data ?? res.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch levels", loading: false });
    }
  },

  // Get ONE level by id (GET /levels/:id)
  fetchLevelById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/levels/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const level = res.data?.data ?? res.data;
      set({ selectedLevel: level, loading: false });
      return level;
    } catch (err) {
      set({ error: "Failed to fetch level", loading: false });
      throw err;
    }
  },
  // Show a level by id (GET /levels/:id)
  showLevel: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/levels/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const level = res?.data?.data ?? res?.data;
      set({ selectedLevel: level, loading: false });
      return level; // optional for callers
    } catch (err) {
      set({ error: "Failed to fetch level", loading: false });
      throw err;
    }
  },

  //update a level by id (PATCH /levels/:id)

  updateLevel: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();

      // أضف كل القيم ما عدا null/undefined/empty
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      // زي الـ LoveLegacy
      formData.append("_method", "PATCH");

      const res = await api.post(`/levels/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = res?.data?.data ?? res?.data ?? null;

      set((s) => ({
        level: (s.level || []).map((it) =>
          String(it.id) === String(id) ? { ...it, ...updated } : it
        ),
        selectedLevel:
          s.selectedLevel && String(s.selectedLevel.id) === String(id)
            ? { ...s.selectedLevel, ...updated }
            : s.selectedLevel,
        loading: false,
      }));

      return updated;
    } catch (err) {
      console.error("Update level error:", err.response?.data);
      set({ error: "Failed to update level item", loading: false });
      throw err;
    }
  },

  // Delete a level by id (DELETE /levels/:id)
  deleteLevel: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/levels/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      set((s) => ({
        levels: (s.levels || []).filter((lv) => String(lv.id) !== String(id)),
        selectedLevel:
          s.selectedLevel && String(s.selectedLevel.id) === String(id)
            ? null
            : s.selectedLevel,
        loading: false,
      }));

      return true;
    } catch (err) {
      set({ error: "Failed to delete level", loading: false });
      throw err;
    }
  },

  // Fetch love-legacy list
  fetchLoveLegacy: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/love-legacy", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = res?.data?.data ?? res?.data ?? [];
      set({ loveLegacy: data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch love-legacy", loading: false });
    }
  },

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

  // Show ONE love-legacy by id (GET /love-legacy/:id)
  showLoveLegacy: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/love-legacy/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const item = res?.data?.data ?? res?.data ?? null;
      set({ selectedLoveLegacy: item, loading: false });
      return item;
    } catch (err) {
      set({ error: "Failed to fetch love-legacy item", loading: false });
      throw err;
    }
  },

  // Update ONE love-legacy by id (PATCH /love-legacy/:id)
  updateLoveLegacy: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      formData.append("_method", "PATCH");

      const res = await api.post(`/love-legacy/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = res?.data?.data ?? res?.data ?? null;

      set((s) => ({
        loveLegacy: (s.loveLegacy || []).map((it) =>
          String(it.id) === String(id) ? { ...it, ...updated } : it
        ),
        selectedLoveLegacy:
          s.selectedLoveLegacy && String(s.selectedLoveLegacy.id) === String(id)
            ? { ...s.selectedLoveLegacy, ...updated }
            : s.selectedLoveLegacy,
        loading: false,
      }));

      return updated;
    } catch (err) {
      set({ error: "Failed to update love-legacy item", loading: false });
      throw err;
    }
  },

  // Delete ONE love-legacy by id (DELETE /love-legacy/:id)
  deleteLoveLegacy: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/love-legacy/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      set((s) => ({
        loveLegacy: (s.loveLegacy || []).filter(
          (it) => String(it.id) !== String(id)
        ),
        selectedLoveLegacy:
          s.selectedLoveLegacy && String(s.selectedLoveLegacy.id) === String(id)
            ? null
            : s.selectedLoveLegacy,
        loading: false,
      }));

      return true;
    } catch (err) {
      set({ error: "Failed to delete love-legacy item", loading: false });
      throw err;
    }
  },
  // ✅ Get all books
  getAllBooks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/books`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ books: res.data.data || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch books",
        loading: false,
      });
    }
  },
  // Get all FAQs
  getAllFaqs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/faqs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ faqs: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch FAQs",
        loading: false,
      });
      throw err;
    }
  },
  // ================== Show one FAQ ==================
  fetchFaqById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/faqs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ selectedFaq: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch FAQ",
        loading: false,
      });
      throw err;
    }
  },

  // ================== Delete FAQ ==================
  deleteFaq: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_ROOT}/faqs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set((state) => ({
        faqs: state.faqs.filter((f) => f.id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete FAQ",
        loading: false,
      });
      throw err;
    }
  },

  // ================== Update FAQ ==================
  updateFaq: async (id, faqData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`${API_ROOT}/faqs/${id}`, faqData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set((state) => ({
        faqs: state.faqs.map((f) => (f.id === id ? res.data.data : f)),
        loading: false,
      }));
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update FAQ",
        loading: false,
      });
      throw err;
    }
  },

  // ================= Coaching Sessions =================

  // Get all coaching sessions
  getAllCoachingSessions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/coaching-sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ coachingSessions: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message || "Failed to fetch coaching sessions",
        loading: false,
      });
      throw err;
    }
  },

  // Show one coaching session by ID
  showCoachingSession: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/coaching-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ selectedCoachingSession: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message || "Failed to fetch coaching session",
        loading: false,
      });
      throw err;
    }
  },

  // Update a coaching session
  // updateCoachingSession: async (id, sessionData) => {
  //   set({ loading: true, error: null });
  //   try {
  //     const res = await axios.patch(
  //       `${API_ROOT}/coaching-sessions/${id}`,
  //       sessionData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         },
  //       }
  //     );
  //     set({ updatedCoachingSession: res.data.data, loading: false });
  //     return res.data.data;
  //   } catch (err) {
  //     set({
  //       error:
  //         err.response?.data?.message || "Failed to update coaching session",
  //       loading: false,
  //     });
  //     throw err;
  //   }
  // },

// in stors/useApiStore.js
updateCoachingSession: async (id, payload) => {
  set({ loading: true, error: null });
  try {
    const token = localStorage.getItem("access_token");

    const needsMultipart = payload?.image instanceof File || payload?.image instanceof Blob;

    let dataToSend = payload;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (needsMultipart) {
      const fd = new FormData();
      if (payload.name_en != null) fd.append("name_en", payload.name_en);
      if (payload.name_ar != null) fd.append("name_ar", payload.name_ar);
      if (payload.description_en != null) fd.append("description_en", payload.description_en);
      if (payload.description_ar != null) fd.append("description_ar", payload.description_ar);

      if (Array.isArray(payload.features_en)) {
        payload.features_en.forEach((v) => fd.append("features_en[]", v));
      }
      if (Array.isArray(payload.features_ar)) {
        payload.features_ar.forEach((v) => fd.append("features_ar[]", v));
      }

      if (payload.image) fd.append("image", payload.image); // <-- IMPORTANT: field name "image"

      dataToSend = fd;
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }

    const res = await api.post(`/coaching-sessions/${id}?_method=PATCH`, dataToSend, { headers });

    const updated = res?.data?.data ?? res?.data ?? null;
    set({
      selectedCoachingSession: updated ?? get().selectedCoachingSession,
      loading: false,
    });
    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.errors?.image?.[0] ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to update session";
    console.error(err);
    set({ error: msg, loading: false });
    throw err;
  }
},


  // Delete a coaching session
  deleteCoachingSession: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_ROOT}/coaching-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        error:
          err.response?.data?.message || "Failed to delete coaching session",
        loading: false,
      });
      throw err;
    }
  },

  // Fetch all books
  fetchBooks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/books", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ books: res.data.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch books", loading: false });
    }
  },

showBook: async (id) => {
  // ---- small helpers (inline; no external imports) ----
  const toUrl = (x) =>
    typeof x === "string"
      ? x
      : x?.url || x?.path || x?.src || x?.image || x?.full_url || "";

  const listFrom = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(toUrl).filter(Boolean);
    if (typeof val === "string") return [val];
    if (typeof val === "object" && Array.isArray(val.data)) return val.data.map(toUrl).filter(Boolean);
    if (typeof val === "object") return Object.values(val).map(toUrl).filter(Boolean);
    return [];
  };

  const normalizeBook = (raw = {}) => {
    const n = { ...raw };

    // unify primary file/link fields
    n.video     = raw.video ?? raw.video_url ?? "";
    n.e_book    = raw.e_book ?? raw.ebook ?? raw.ebook_url ?? raw.ebook_file ?? raw.ebook_path ?? "";
    n.audio     = raw.audio ?? raw.audio_url ?? raw.audio_file ?? raw.audio_path ?? "";
    n.paperback = raw.paperback ?? raw.paperback_url ?? raw.paperback_file ?? raw.paperback_path ?? "";

    // unify samples
    n.sample_video     = raw.sample_video ?? raw.sample_video_url ?? raw?.samples?.video ?? "";
    n.sample_e_book    = raw.sample_e_book ?? raw.sample_ebook ?? raw?.samples?.ebook ?? "";
    n.sample_audio     = raw.sample_audio ?? raw?.samples?.audio ?? "";
    n.sample_paperback = raw.sample_paperback ?? raw?.samples?.paperback ?? "";

    // payment URLs (keep your exact keys)
    n.e_book_payment_url_ar     = raw.e_book_payment_url_ar     ?? raw?.payments?.ebook?.ar     ?? raw?.payments?.e_book?.ar ?? "";
    n.e_book_payment_url_en     = raw.e_book_payment_url_en     ?? raw?.payments?.ebook?.en     ?? raw?.payments?.e_book?.en ?? "";
    n.audio_payment_url_ar      = raw.audio_payment_url_ar      ?? raw?.payments?.audio?.ar     ?? "";
    n.audio_payment_url_en      = raw.audio_payment_url_en      ?? raw?.payments?.audio?.en     ?? "";
    n.paperback_payment_url_ar  = raw.paperback_payment_url_ar  ?? raw?.payments?.paperback?.ar ?? "";
    n.paperback_payment_url_en  = raw.paperback_payment_url_en  ?? raw?.payments?.paperback?.en ?? "";
    n.video_payment_url_ar      = raw.video_payment_url_ar      ?? raw?.payments?.video?.ar     ?? "";
    n.video_payment_url_en      = raw.video_payment_url_en      ?? raw?.payments?.video?.en     ?? "";

    // prices: accept array or map
    if (Array.isArray(raw.prices)) {
      n.prices = raw.prices;
    } else if (raw.prices && typeof raw.prices === "object") {
      n.prices = Object.entries(raw.prices).map(([type, price]) => ({ type, price }));
    } else if (!n.prices) {
      n.prices = [];
    }

    // ---- images: put COVER first, then gallery; dedupe ----
    const cover =
      (typeof raw.image === "string" && raw.image) ||
      toUrl(raw.image) || raw.cover || raw.cover_url || "";

    const gallery = [
      ...listFrom(raw.images),
      ...listFrom(raw.gallery),
      ...listFrom(raw.media),
      ...listFrom(raw.files),
    ];

    n.cover_url = cover || "";
    n.images = Array.from(new Set([cover, ...gallery].filter(Boolean)));

    return n;
  };

  set({ loading: true, error: null });
  try {
    const res = await api.get(`/books/${id}?_=${Date.now()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });

    const item = res?.data?.data ?? res?.data ?? null;
    const normalized = normalizeBook(item || {});

    set((state) => ({
      selectedBook: normalized,
      // bump version so UI can cache-bust images
      selectedBookVersion: (state.selectedBookVersion || 0) + 1,
      loading: false,
    }));

    return normalized;
  } catch (err) {
    set({ error: "Failed to fetch book", loading: false });
    throw err;
  }
},
updateBook: async (id, payload = {}) => {
  // Convert [{type,price}] -> { type: price }
  const pricesToMap = (arr = []) =>
    arr.reduce((acc, p) => {
      const type = p?.type;
      const raw = `${p?.price ?? ""}`.trim();
      if (type && raw !== "") acc[type] = Number(raw);
      return acc;
    }, {});

  try {
    set({ loading: true, message: null, error: null });

    const fd = new FormData();
    fd.append("_method", "PATCH"); // Laravel-style

    // helpers
    const text = (v) => (typeof v === "string" ? v.trim() : v);
    const maybeAppend = (k, v) => {
      if (v === undefined || v === null) return;
      if (typeof v === "string" && v.trim() === "") return; // don't wipe with blanks
      fd.append(k, v);
    };
    const isFileLike = (v) =>
      (typeof File !== "undefined" && v instanceof File) ||
      (typeof Blob !== "undefined" && v instanceof Blob);

    const appendFile = (key, file, fallback = "upload.bin") => {
      if (!isFileLike(file)) return;
      const name = file?.name || fallback;
      fd.append(key, file, name);
    };

    // ---- primitives ----
    const primitives = {
      title_en:                 text(payload.title_en),
      title_ar:                 text(payload.title_ar),
      description_en:           text(payload.description_en),
      description_ar:           text(payload.description_ar),
      video_url:                text(payload.video_url),
      is_stock:                 Number(payload.is_stock ?? 0),
      is_available:             Number(payload.is_available ?? 0),
      stock_count:              Number.isFinite(Number(payload.stock_count)) ? Number(payload.stock_count) : undefined,

      // payment URLs
      e_book_payment_url_ar:    text(payload.e_book_payment_url_ar),
      e_book_payment_url_en:    text(payload.e_book_payment_url_en),
      audio_payment_url_ar:     text(payload.audio_payment_url_ar),
      audio_payment_url_en:     text(payload.audio_payment_url_en),
      paperback_payment_url_ar: text(payload.paperback_payment_url_ar),
      paperback_payment_url_en: text(payload.paperback_payment_url_en),
      video_payment_url_ar:     text(payload.video_payment_url_ar),
      video_payment_url_en:     text(payload.video_payment_url_en),
    };
    Object.entries(primitives).forEach(([k, v]) => maybeAppend(k, v));

    // ---- prices -> prices[TYPE] ----
    const pricesMap =
      Array.isArray(payload.prices) ? pricesToMap(payload.prices)
      : (payload.prices && typeof payload.prices === "object") ? payload.prices
      : {};
    Object.entries(pricesMap).forEach(([type, price]) => {
      if (price !== undefined && price !== null && `${price}` !== "") {
        fd.append(`prices[${type}]`, price);
      }
    });

    // ---- files ----
    // COVER
    if (isFileLike(payload.image)) {
      appendFile("image", payload.image, "cover.jpg");
      fd.append("replace_cover", "1");
    }

    // images[]
    if (Array.isArray(payload.images)) {
      payload.images.forEach((f, i) => {
        if (isFileLike(f)) appendFile("images[]", f, `image_${i}.jpg`);
      });
    }

    if (isFileLike(payload.e_book))           appendFile("e_book", payload.e_book, "ebook.bin");
    if (isFileLike(payload.audio))            appendFile("audio", payload.audio, "audio.bin");
    if (isFileLike(payload.paperback))        appendFile("paperback", payload.paperback, "paperback.bin");
    if (isFileLike(payload.sample_e_book))    appendFile("sample_e_book", payload.sample_e_book, "sample_ebook.bin");
    if (isFileLike(payload.sample_audio))     appendFile("sample_audio", payload.sample_audio, "sample_audio.bin");
    if (isFileLike(payload.sample_paperback)) appendFile("sample_paperback", payload.sample_paperback, "sample_paperback.bin");

    // send
    const res = await api.post(`/books/${id}`, fd, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      // Let the browser set the multipart boundary automatically
    });

    // re-fetch to get the fresh normalized book (with updated cover)
    await get().showBook(id);

    // client-side cache buster so lists/details re-render with fresh <img>
    const bust = Date.now();

    set((s) => ({
      books: (s.books || []).map((b) =>
        b.id === id
          ? {
              ...b,
              ...(res?.data?.data ?? {}),
              __img_bust: bust, // new harmless field for UI cache-busting
            }
          : b
      ),
      message: "✅ Book updated successfully",
    }));

    return true;
  } catch (err) {
    console.error("❌ Failed to update book", err);
    const msg =
      err?.response?.data?.message || err?.message || "❌ Failed to update book";
    set({ message: msg, error: msg });
    return false;
  } finally {
    set({ loading: false });
  }
},

 deleteBook: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to delete book", loading: false });
    }
  },

  fetchSessionPlans: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/main-coaching-sessions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        // cache-buster to avoid stale GET responses
        params: { t: Date.now() },
      });

      const list = res?.data?.data ?? res?.data ?? [];
      set({
        sessionPlans: Array.isArray(list) ? list : [],
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("fetchSessionPlans error:", err);
      set({ error: "Failed to fetch session plans", loading: false });
    }
  },

  // Get a single session plan by id
  fetchSessionPlanById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/main-coaching-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        // cache-buster to avoid old copies after edit
        params: { t: Date.now() },
      });

      const item = res?.data?.data ?? res?.data ?? null;
      set({
        selectedSessionPlan: item,
        loading: false,
        error: null,
      });
      return item;
    } catch (err) {
      console.error("fetchSessionPlanById error:", err);
      set({ error: "Failed to fetch session plan", loading: false });
      throw err;
    }
  },

  updateSessionPlan: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("access_token");
      const res = await api.patch(`/main-coaching-sessions/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      set({ selectedSessionPlan: res.data.data, loading: false });
      return res.data;
    } catch (err) {
      console.error(
        "Update SessionPlan Error:",
        err.response?.data || err.message
      );
      set({ error: "Failed to update session plan", loading: false });
      throw err;
    }
  },

  // Delete a session plan by id
  deleteSessionPlan: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/main-coaching-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      set((state) => ({
        sessionPlans: (state.sessionPlans || []).filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to delete session plan", loading: false });
    }
  },
  // ================== Topics ==================
  getAllApprovedTopics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/topics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ approvedTopics: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch approved topics",
        loading: false,
      });
      throw err;
    }
  },

  getAllPendingTopics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/topics_admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ pendingTopics: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch pending topics",
        loading: false,
      });
      throw err;
    }
  },
  // ✅ Show one topic by ID
  getTopicById: async (topicId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/topics/${topicId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const payload = res.data?.data ?? res.data;
      const topic = payload?.topic ?? payload; // ← مهم
      set({ selectedTopic: topic, loading: false });
      return topic;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch topic",
        loading: false,
      });
      throw err;
    }
  },

  updateTopic: async (topicId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(
        `${API_ROOT}/topics/${topicId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      const payload = res.data?.data ?? res.data;
      const topic = payload?.topic ?? payload;

      set((state) => ({
        loading: false,
        selectedTopic: topic ?? state.selectedTopic, // ← أهو
        approvedTopics: state.approvedTopics.map((t) =>
          t.id === Number(topicId) ? topic || t : t
        ),
      }));
      return topic;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update topic",
        loading: false,
      });
      throw err;
    }
  },

  deleteTopic: async (topicId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_ROOT}/topics/${topicId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set((state) => ({
        approvedTopics: state.approvedTopics.filter((t) => t.id !== topicId),
        pendingTopics:
          state.pendingTopics?.filter((t) => t.id !== topicId) || [],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete topic",
        loading: false,
      });
      throw err;
    }
  },

  approveTopic: async (topic) => {
    set({ loading: true, error: null, message: null });
    try {
      if (!topic.category?.id) {
        throw new Error("Category is required to approve this topic");
      }

      const res = await axios.post(
        `${API_ROOT}/topics/${topic.id}/approve`,
        { category_id: topic.category.id }, // ✅ send category_id
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const updatedTopic = res.data.data;

      set((state) => ({
        pendingTopics: state.pendingTopics.filter((t) => t.id !== topic.id),
        approvedTopics: [updatedTopic, ...state.approvedTopics],
        message: res.data.message || "Topic approved successfully",
        loading: false,
      }));

      return updatedTopic;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to approve topic",
        loading: false,
      });
      throw err;
    }
  },

  rejectTopic: async (topic) => {
    set({ loading: true, error: null, message: null });
    try {
      if (!topic.category?.id) {
        throw new Error("Category is required to reject this topic");
      }

      const res = await axios.post(
        `${API_ROOT}/topics/${topic.id}/reject`,
        { category_id: topic.category.id }, // ✅ send category_id
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      set({
        message: res.data.message || "Topic rejected successfully",
        loading: false,
      });

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to reject topic",
        loading: false,
      });
      throw err;
    }
  },

  getAllBlogs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_ROOT}/blogs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ blogs: res.data.data, loading: false });
      return res.data.data; // returns array of blogs
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch blogs",
        loading: false,
      });
      throw err;
    }
  },
  // In your useBlogStore.js (or similar store)
  updateBlog: async (id, data) => {
    set({ loading: true, error: null });

    try {
      const isMultipart =
        typeof FormData !== "undefined" && data instanceof FormData;

      let res;
      if (isMultipart) {
        // Laravel-friendly: send multipart with method override
        data.append("_method", "PATCH");
        res = await api.post(`/blogs/${id}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            // do NOT set Content-Type for FormData; axios sets boundary
          },
        });
      } else {
        // Pure JSON PATCH
        res = await api.patch(`/blogs/${id}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      }

      const updated = res?.data?.data ?? res?.data;

      set((state) => ({
        blogs: (state.blogs || []).map((b) => (b.id === id ? updated : b)),
        selectedBlog: updated, // keep details page in sync
        loading: false,
      }));

      return updated;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to update blog",
        loading: false,
      });
      throw err;
    }
  },

  showBlog: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // ممكن تحفظ البوست المختار في state
      set({ selectedBlog: res.data.data, loading: false });

      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch blog",
        loading: false,
      });
      throw err;
    }
  },
  deleteBlog: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.delete(`/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ selectedBlog: res.data.data, loading: false });

      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch blog",
        loading: false,
      });
      throw err;
    }
  },

  // Fetch all categories
// in useApiStore (or wherever fetchCategories lives)
fetchCategories: async (type) => {
  set({ loading: true, error: null });
  try {
    const q = (type && String(type).trim() !== "")
      ? `?type=${encodeURIComponent(type)}`
      : "";
    const res = await api.get(`/categories${q}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    set({ categories: res.data?.data ?? [], loading: false });
  } catch (err) {
    set({ error: "Failed to fetch categories", loading: false });
  }
},

  // Fetch a single category by id
  fetchCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ selectedCategory: res.data.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch category", loading: false });
    }
  },
  deleteCategory: async (id) => {
    try {
      await axios.delete(`${API_ROOT}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set((state) => ({
        categories: (state.categories || []).filter((c) => c.id !== Number(id)),
      }));
      return true;
    } catch (err) {
      console.error("Delete category failed:", err);
      throw err;
    }
  },

  // in stors/useApiStore.js (or wherever your store is)
  updateCategory: async (id, data) => {
    set({ loading: true, error: null });

    try {
      const isMultipart =
        typeof FormData !== "undefined" && data instanceof FormData;
      let res;

      if (isMultipart) {
        // ✅ Laravel-friendly: method override + POST for file upload
        data.append("_method", "PATCH");
        res = await api.post(`/categories/${id}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            // DO NOT set Content-Type; axios will set the boundary for FormData
          },
        });
      } else {
        // ✅ Plain JSON PATCH when no file is sent
        res = await api.patch(`/categories/${id}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      }

      const updated = res?.data?.data ?? res?.data;

      set((state) => ({
        // keep any categories list in sync if you have it
        categories: (state.categories || []).map((c) =>
          c.id === Number(id) ? updated : c
        ),
        selectedCategory: updated, // ✅ critical for the details page to re-render with the new image url
        loading: false,
      }));

      return updated;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to update category",
        loading: false,
      });
      throw err;
    }
  },

  // ================== Site Price ==================

  updateCurrentPrice: async (priceData) => {
    const num = Number(
      String(priceData?.price ?? priceData?.amount ?? "").replace(/[,\s]/g, "")
    );
    if (!Number.isFinite(num)) throw new Error("Invalid price value");

    set({ loading: true, error: null });
    try {
      // مَسار بدون id
      const res = await axios.patch(
        `${API_ROOT}/price`,
        { price: num, amount: num },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      const updated = res.data?.data ?? res.data;
      set({ sitePrice: updated, loading: false });
      return updated;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        err?.message ||
        "Failed to update price";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteCurrentPrice: async () => {
    set({ loading: true, error: null });
    try {
        const res = await axios.delete(`${API_ROOT}/price`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ loading: false, sitePrice: null });
      return res?.status === 200 || res?.status === 204 || true;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        err?.message ||
        "Failed to delete price";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

// ===== Individuals price: UPDATE (no id) =====
updateIndividualsPrice: async (priceData) => {
  // expect: { price_year, price_month }
  const year = Number(String(priceData?.price_year ?? "").replace(/[,\s]/g, ""));
  const month = Number(String(priceData?.price_month ?? "").replace(/[,\s]/g, ""));

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new Error("Invalid year or month price value");
  }

  set({ loading: true, error: null });
  try {
    // ⬇️ adjust endpoint if your backend is different
    const res = await axios.patch(
      `${API_ROOT}/individuals`,
      { price_year: year, price_month: month },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const updated = res?.data?.data ?? res?.data;
    // keep separate state key so it doesn't overwrite sitePrice
    set({ individualsPrice: updated, loading: false });
    return updated;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (typeof err?.response?.data === "string" ? err.response.data : "") ||
      err?.message ||
      "Failed to update individuals price";
    set({ error: msg, loading: false });
    throw new Error(msg);
  }
},

// ===== Individuals price: DELETE (no id) =====
deleteIndividualsPrice: async () => {
  set({ loading: true, error: null });
  try {
    // ⬇️ adjust endpoint if your backend is different
    const res = await axios.delete(`${API_ROOT}/individuals`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    set({ loading: false, individualsPrice: null });
    return res?.status === 200 || res?.status === 204 || true;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (typeof err?.response?.data === "string" ? err.response.data : "") ||
      err?.message ||
      "Failed to delete individuals price";
    set({ error: msg, loading: false });
    throw new Error(msg);
  }
},


  getOldUsers: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/oldUsers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ selectedUser: res.data.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch users", loading: false });
    }
  },
  getRegisteredUsers: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/registeredUsers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ selectedUser: res.data.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch users", loading: false });
    }
  }, 
  
updateUser: async (id, data) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.patch(`${API_ROOT}/users/${id}`, data, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem("access_token")}` 
      },
    });
    set({ createdSheet: res.data.data, loading: false });
    return res.data.data;
  } catch (err) {
    set({ 
      error: err.response?.data?.message || "Failed to update user", 
      loading: false 
    });
    throw err;
  }
},

deleteUser: async (id) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.delete(`${API_ROOT}/users/${id}`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem("access_token")}` 
      },
    });
    set({ createdSheet: res.data.data, loading: false });
    return res.data.data;
  } catch (err) {
    set({ 
      error: err.response?.data?.message || "Failed to delete user", 
      loading: false 
    });
    throw err;
  }
},


  
  // ================== Contact ==================

  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/contacts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ contacts: res.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch contacts", loading: false });
    }
  },
    fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/tickets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ tickets: res.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch tickets", loading: false });
    }
  },

 showTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/tickets/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const ticket = res.data?.data ?? res.data;
      set({ ticket, loading: false });
    } catch (err) {
      console.error(err);
      set({ error: "Failed to fetch ticket", loading: false });
    }
  },

  fetchHome: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/home", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({ contacts: res.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch home", loading: false });
    }
  },

// approveReview: async (id) => {
//   set({ loading: true, error: null });
//   try {
//     const token = getToken();
//     if (!token) {
//       const err = new Error("Unauthenticated");
//       set({ loading: false, error: err.message });
//       throw err;
//     }

//     const res = await api.post(
//       `/reviews/${id}/approve`,
//       null,
//       { headers: authHeader() }
//     );

//     // optimistic update
//     set((state) => ({
//       reviews: state.reviews.map((r) =>
//         String(r.id) === String(id) ? { ...r, status: "approved" } : r
//       ),
//       loading: false,
//     }));
//     return res.data;
//   } catch (err) {
//     console.error(err);
//     set({ error: "Failed to approve review", loading: false });
//     throw err;
//   }
// },

// rejectReview: async (id) => {
//   set({ loading: true, error: null });
//   try {
//     const token = getToken();
//     if (!token) {
//       const err = new Error("Unauthenticated");
//       set({ loading: false, error: err.message });
//       throw err;
//     }

//     const res = await api.post(
//       `/reviews/${id}/reject`,
//       null,
//       { headers: authHeader() }
//     );

//     // optimistic update
//     set((state) => ({
//       reviews: state.reviews.map((r) =>
//         String(r.id) === String(id) ? { ...r, status: "rejected" } : r
//       ),
//       loading: false,
//     }));
//     return res.data;
//   } catch (err) {
//     console.error(err);
//     set({ error: "Failed to reject review", loading: false });
//     throw err;
//   }
// },
approveReview: async (id, payload = {}) => {
  set({ loading: true, error: null });
  try {
    const res = await api.post(`/reviews/${id}/approve`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const updated = res?.data?.data ?? res?.data;
    set((s) => ({
      selectedReview:
        s.selectedReview && String(s.selectedReview.id) === String(id)
          ? { ...s.selectedReview, ...updated }
          : s.selectedReview,
      loading: false,
      error: null,
    }));
    return updated;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Approve failed";
    set({ loading: false, error: msg });
    throw err;
  }
},


rejectReview: async (id) => {
  set({ loading: true, error: null });
  try {
    const res = await api.post(
      `/reviews/${id}/reject`,
      null,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // optimistic update
    set((state) => ({
      reviews: state.reviews.map((r) =>
        String(r.id) === String(id) ? { ...r, status: "rejected" } : r
      ),
      loading: false,
    }));

    return res.data;
  } catch (err) {
    console.error(err);
    set({ error: "Failed to reject", loading: false });
    throw err;
  }
},


fetchEmails: async () => {
  set({ loading: true, error: null });
  try {
    const res = await api.get("/subscribers", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    const list = Array.isArray(res.data.data) ? res.data.data : res.data;

    set({ subscribers: list || [], loading: false });
  } catch (err) {
    console.error("Failed to fetch subscribers:", err);
    set({ error: "Failed to fetch subscribers", loading: false });
  }
},

// stors/useApiStore.js

getBooksPayments: async () => {
  set({ loading: true, error: null });
  try {
    const res = await api.get("/payments/books", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const users =
      res?.data?.data?.users ??
      res?.data?.users ??
      res?.data ??
      [];

    set({
      booksPayments: Array.isArray(users) ? users : [],
      loading: false,
      error: null,
    });
  } catch (e) {
    console.error("getBooksPayments error:", e);
    set({
      error: "Failed to fetch book payments",
      loading: false,
      booksPayments: [],
    });
  }
},

getWorkshopsPayments: async () => {
  set({ loading: true, error: null });
  try {
    const res = await api.get("/payments/workshops", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const users =
      res?.data?.data?.users ??
      res?.data?.users ??
      res?.data ??
      [];

    set({
      workshopsPayments: Array.isArray(users) ? users : [],
      loading: false,
      error: null,
    });
  } catch (e) {
    console.error("getWorkshopsPayments error:", e);
    set({
      error: "Failed to fetch workshop payments",
      loading: false,
      workshopsPayments: [],
    });
  }
},

getSessionsPayments: async () => {
  set({ loading: true, error: null });
  try {
    const res = await api.get("/payments/sessions", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const users =
      res?.data?.data?.users ??
      res?.data?.users ??
      res?.data ??
      [];

    set({
      sessionsPayments: Array.isArray(users) ? users : [],
      loading: false,
      error: null,
    });
  } catch (e) {
    console.error("getSessionsPayments error:", e);
    set({
      error: "Failed to fetch session payments",
      loading: false,
      sessionsPayments: [],
    });
  }
},



}));
