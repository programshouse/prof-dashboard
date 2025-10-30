import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/workshops"; // no trailing slash
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useworkshopsStore = create((set, get) => ({
  workshops: [],
  workshop: null,
  loading: false,
  error: null,
  createdworkshop: null,
  updatedworkshop: null,

  // CREATE: POST /workshops
  async createworkshop(body) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("", body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const created = data?.data ?? data;
      set({ createdworkshop: created, loading: false });
      await get().fetchworkshops();
      return created;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to create workshop", loading: false });
      throw err;
    }
  },

  // UPDATE: PATCH /workshops/:id
  // New explicit signature: updateworkshop(id, body)
  async updateworkshop(idOrObj, maybeBody) {
    // Back-compat: allow updateworkshop({ id, ...fields })
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("updateworkshop: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.patch(`/${id}`, body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const updated = data?.data ?? data;
      set({ updatedworkshop: updated, loading: false });
      await get().fetchworkshops();
      return updated;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update workshop", loading: false });
      throw err;
    }
  },

  // DELETE: DELETE /workshops/:id
  // New explicit signature: deleteworkshop(id)
  async deleteworkshop(idOrObj) {
    // Back-compat: allow deleteworkshop({ id })
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    if (!id) throw new Error("deleteworkshop: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/${id}`, { headers: authHeaders() });
      set({ loading: false });
      await get().fetchworkshops();
      return data?.data ?? data;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to delete workshop", loading: false });
      throw err;
    }
  },

  // LIST: GET /workshops
  async fetchworkshops() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", { headers: authHeaders() });
      const list =
        Array.isArray(data) ? data :
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.items) ? data.items :
        Array.isArray(data?.result) ? data.result : [];
      set({ workshops: list, loading: false });
      return list;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to fetch workshops", loading: false });
      throw err;
    }
  },

  // SHOW: GET /workshops/:id
  async fetchworkshopById(id) {
    if (!id) throw new Error("fetchworkshopById: missing id");
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/${id}`, { headers: authHeaders() });
      const svc = data?.data ?? data;
      set({ workshop: svc, loading: false });
      return svc;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to get workshop", loading: false });
      throw err;
    }
  },
}));
