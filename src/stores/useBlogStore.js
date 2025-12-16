// /src/stores/useBlogStore.js
import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/blogs"; // no trailing slash
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

export const useBlogsStore = create((set, get) => ({
  Blogs: [],
  Blog: null,
  loading: false,
  error: null,
  createdBlog: null,
  updatedBlog: null,

  // CREATE: POST /blogs  (multipart supported)
  async createBlog(body) {
    set({ loading: true, error: null });
    try {
      const isFormData = body instanceof FormData;
      const headers = {
        ...authHeaders(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      };

      const { data } = await api.post("", body, { headers });
      const created = data?.data ?? data;

      set({ createdBlog: created, loading: false });
      await get().fetchBlogs();
      return created;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to create Blog", loading: false });
      throw err;
    }
  },

  // UPDATE: PATCH /blogs/:id
  // If multipart => prefer POST + _method=PATCH (Laravel safe)
  async updateBlog(idOrObj, maybeBody, opts = {}) {
    const id =
      typeof idOrObj === "string" || typeof idOrObj === "number"
        ? idOrObj
        : idOrObj?.id;

    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("updateBlog: missing id");

    set({ loading: true, error: null });
    try {
      const isFormData = body instanceof FormData;
      const headers = {
        ...authHeaders(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      };

      let res;

      if (opts.forcePost && isFormData) {
        // IMPORTANT: body should already contain _method=PATCH
        res = await api.post(`/${id}`, body, { headers });
      } else {
        res = await api.patch(`/${id}`, body, { headers });
      }

      const updated = res.data?.data ?? res.data;

      set({ updatedBlog: updated, loading: false });
      await get().fetchBlogs();
      return updated;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update Blog", loading: false });
      throw err;
    }
  },

  // DELETE: DELETE /blogs/:id
  async deleteBlog(idOrObj) {
    const id =
      typeof idOrObj === "string" || typeof idOrObj === "number"
        ? idOrObj
        : idOrObj?.id;
    if (!id) throw new Error("deleteBlog: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/${id}`, { headers: authHeaders() });
      set({ loading: false });
      await get().fetchBlogs();
      return data?.data ?? data;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to delete Blog", loading: false });
      throw err;
    }
  },

  // LIST: GET /blogs
  async fetchBlogs() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", { headers: authHeaders() });
      const list = normalizeList(data);
      set({ Blogs: list, loading: false });
      return list;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to fetch Blogs", loading: false });
      throw err;
    }
  },

  // SHOW: GET /blogs/:id
  async fetchBlogById(id) {
    if (!id) throw new Error("fetchBlogById: missing id");
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/${id}`, { headers: authHeaders() });
      const blog = data?.data ?? data;
      set({ Blog: blog, loading: false });
      return blog;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to get Blog", loading: false });
      throw err;
    }
  },
}));
