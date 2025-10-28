import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/reem/api/v1/admins";

export const useCreateStore = create((set) => ({
  loading: false,
  error: null,
  createdQuiz: null,
  createdQuestion: null,
    latestPrice: null,

  // Create a full quiz
  createQuiz: async (quizData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_ROOT}/quizzes`, quizData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ createdQuiz: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create quiz", loading: false });
      throw err;
    }
  },

  // Add a single question to an existing quiz
  createQuestion: async (quizId, questionData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_ROOT}/quizzes/${quizId}/questions`, questionData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ createdQuestion: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create question", loading: false });
      throw err;
    }
  },
  createSessionPlan: async (sessionData) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post(
      `${API_ROOT}/main-coaching-sessions`,
      sessionData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    set({ createdSessionPlan: res.data.data, loading: false });
    return res.data.data;
  } catch (err) {
    set({
      error: err.response?.data?.message || "Failed to create session plan",
      loading: false,
    });
    throw err;
  }
},
// ✅ Create a new topic
createTopic: async (topicData) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post(`${API_ROOT}/topics`, topicData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });

    set((state) => ({
      approvedTopics: [...(state.approvedTopics || []), res.data.data],
      loading: false,
    }));

    return res.data.data;
  } catch (err) {
    set({
      error: err.response?.data?.message || "Failed to create topic",
      loading: false,
    });
    throw err;
  }
},


// // ---------- Books: Create ----------

  createBook: async (formData) => {
    set({ loading: true, error: null, message: null, createdBook: null });
    try {
      const res = await axios.post(`${API_ROOT}/books`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      set({
        loading: false,
        createdBook: res.data?.data || null,
        message: res.data?.message || "Book created successfully",
      });
      return res.data;
    } catch (err) {
      set({
        loading: false,
        error: err?.response?.data?.message || err?.message || "Failed to create book",
      });
      throw err;
    }
  },
//blog------------------
createBlog: async (payload) => {
    set({ loading: true, error: null });

    try {
      let res;

      if (payload.image) {
        // If there's an image, build FormData
        const fd = new FormData();
        fd.append("title_en", payload.title_en);
        fd.append("title_ar", payload.title_ar);
        fd.append("content_en", payload.content_en);
        fd.append("content_ar", payload.content_ar);
        fd.append("category_id", String(payload.category_id));

        const filename =
          payload.image.name && /\.[A-Za-z0-9]+$/.test(payload.image.name)
            ? payload.image.name
            : "cover.jpg";
        fd.append("image", payload.image, filename);

        res = await axios.post(`${API_ROOT}/blogs`, fd, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            // ⚠️ Do NOT set Content-Type → browser handles boundary
          },
        });
      } else {
        // Otherwise, send JSON
        res = await axios.post(`${API_ROOT}/blogs`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      }

      const blogData = res?.data?.data ?? res?.data;
      set((s) => ({
        blogs: [blogData, ...(s.blogs || [])],
        createdBlog: blogData,
        loading: false,
      }));

      return res.data;
    } catch (err) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create blog",
      });
      throw err;
    }
  },
  createCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_ROOT}/categories`, categoryData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ createdCategory: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create category", loading: false });
      throw err;
    }
  },

// for Coaching 
createPrice: async (priceData) => {
  const num = Number(String(priceData?.price ?? priceData?.amount ?? "").replace(/[,\s]/g, ""));
  if (!Number.isFinite(num)) throw new Error("Invalid price value");

  set({ loading: true, error: null });
  try {
    const res = await axios.post(
      `${API_ROOT}/prices`,
      { price: num, amount: num },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const data = res?.data?.data ?? res?.data;
    set({ createdPrice: data, loading: false });
    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (typeof err?.response?.data === "string" ? err.response.data : "") ||
      err?.message ||
      "Failed to create price";
    set({ error: msg, loading: false });
    throw new Error(msg);
  }
},

// for Individuals 
createIndividualsPrice: async (priceData) => {
  const year = Number(String(priceData?.price_year ?? "").replace(/[,\s]/g, ""));
  const month = Number(String(priceData?.price_month ?? "").replace(/[,\s]/g, ""));

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new Error("Invalid year or month price value");
  }

  set({ loading: true, error: null });
  try {
    const res = await axios.post(
      `${API_ROOT}/individuals`, // ✅ adjust endpoint if needed
      { price_year: year, price_month: month },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const data = res?.data?.data ?? res?.data;
    set({ createdIndividualsPrice: data, loading: false });
    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (typeof err?.response?.data === "string" ? err.response.data : "") ||
      err?.message ||
      "Failed to create individuals price";
    set({ error: msg, loading: false });
    throw new Error(msg);
  }
},

  createSheet: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_ROOT}/import-users`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ createdSheet: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create sheet", loading: false });
      throw err;
    }
  },

    createUser: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_ROOT}/users`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ createdSheet: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create user", loading: false });
      throw err;
    }
  },

}));
