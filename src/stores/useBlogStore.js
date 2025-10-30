import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/blogs"; // no trailing slash
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useBlogsStore = create((set, get) => ({
  Blogs: [],
  Blog: null,
  loading: false,
  error: null,
  createdBlog: null,
  updatedBlog: null,

  // CREATE: POST /Blogs
  async createBlog(body) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("", body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const created = data?.data ?? data;
      set({ createdBlog: created, loading: false });
      await get().fetchBlogs();
      return created;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to create Blog", loading: false });
      throw err;
    }
  },

  // UPDATE: PATCH /Blogs/:id
  // New explicit signature: updateBlog(id, body)
  async updateBlog(idOrObj, maybeBody) {
    // Back-compat: allow updateBlog({ id, ...fields })
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("updateBlog: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.patch(`/${id}`, body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const updated = data?.data ?? data;
      set({ updatedBlog: updated, loading: false });
      await get().fetchBlogs();
      return updated;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update Blog", loading: false });
      throw err;
    }
  },

  // DELETE: DELETE /Blogs/:id
  // New explicit signature: deleteBlog(id)
  async deleteBlog(idOrObj) {
    // Back-compat: allow deleteBlog({ id })
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
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

  // LIST: GET /Blogs
  async fetchBlogs() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", { headers: authHeaders() });
      const list =
        Array.isArray(data) ? data :
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.items) ? data.items :
        Array.isArray(data?.result) ? data.result : [];
      set({ Blogs: list, loading: false });
      return list;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to fetch Blogs", loading: false });
      throw err;
    }
  },

  // SHOW: GET /Blogs/:id
  async fetchBlogById(id) {
    if (!id) throw new Error("fetchBlogById: missing id");
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/${id}`, { headers: authHeaders() });
      const svc = data?.data ?? data;
      set({ Blog: svc, loading: false });
      return svc;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to get Blog", loading: false });
      throw err;
    }
  },
}));
