import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/who-am-i"; // corrected slug
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
      const { data } = await api.post("", body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const created = data?.data ?? data;
      set({ created: created, loading: false });
      await get().fetchAll();
      return created;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to create", loading: false });
      throw err;
    }
  },

  async update(idOrObj, maybeBody) {
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("update: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.patch(`/${id}`, body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const updated = data?.data ?? data;
      set({ updated: updated, loading: false });
      await get().fetchAll();
      return updated;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update", loading: false });
      throw err;
    }
  },

  async remove(idOrObj) {
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    if (!id) throw new Error("delete: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/${id}`, { headers: authHeaders() });
      set({ loading: false });
      await get().fetchAll();
      return data?.data ?? data;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to delete", loading: false });
      throw err;
    }
  },

  async fetchAll() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", { headers: authHeaders() });
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.result)
        ? data.result
        : [];
      set({ items: list, loading: false });
      return list;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to fetch", loading: false });
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
      set({ error: err?.response?.data?.message || "Failed to get item", loading: false });
      throw err;
    }
  },
}))
;
