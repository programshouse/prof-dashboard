// /src/stores/useWorkshopStore.js
import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/workshops";
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const isFormData = (v) =>
  typeof FormData !== "undefined" && v instanceof FormData;

const buildHeaders = (body) => {
  const base = { ...authHeaders(), Accept: "application/json" };
  if (isFormData(body)) return base; // let browser set boundary
  return { ...base, "Content-Type": "application/json" };
};

const toList = (data) =>
  Array.isArray(data) ? data
  : Array.isArray(data?.data) ? data.data
  : Array.isArray(data?.items) ? data.items
  : Array.isArray(data?.result) ? data.result
  : [];

export const useWorkshopStore = create((set, get) => ({
  workshops: [],
  workshop: null,
  loading: false,
  error: null,
  createdworkshop: null,
  updatedworkshop: null,

  async createworkshop(body) {
    set({ loading: true, error: null });
    try {
      const headers = buildHeaders(body);
      const { data } = await api.post("", body, { headers });
      const created = data?.data ?? data;
      set({ createdworkshop: created, loading: false });
      await get().fetchworkshops();
      return created;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to create workshop",
        loading: false,
      });
      throw err;
    }
  },

  async updateworkshop(idOrObj, maybeBody) {
    const id =
      typeof idOrObj === "string" || typeof idOrObj === "number"
        ? idOrObj
        : idOrObj?.id;

    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("updateworkshop: missing id");

    set({ loading: true, error: null });
    try {
      const headers = buildHeaders(body);
      const { data } = await api.patch(`/${id}`, body, { headers });
      const updated = data?.data ?? data;
      set({ updatedworkshop: updated, loading: false });
      await get().fetchworkshops();
      return updated;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to update workshop",
        loading: false,
      });
      throw err;
    }
  },

  async deleteworkshop(idOrObj) {
    const id =
      typeof idOrObj === "string" || typeof idOrObj === "number"
        ? idOrObj
        : idOrObj?.id;
    if (!id) throw new Error("deleteworkshop: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/${id}`, { headers: authHeaders() });
      set({ loading: false });
      await get().fetchworkshops();
      return data?.data ?? data;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to delete workshop",
        loading: false,
      });
      throw err;
    }
  },

  async fetchworkshops() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", { headers: authHeaders() });
      const list = toList(data);
      set({ workshops: list, loading: false });
      return list;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to fetch workshops",
        loading: false,
      });
      throw err;
    }
  },

  async fetchworkshopById(id) {
    if (!id) throw new Error("fetchworkshopById: missing id");
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/${id}`, { headers: authHeaders() });
      const w = data?.data ?? data;
      set({ workshop: w, loading: false });
      return w;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to get workshop",
        loading: false,
      });
      throw err;
    }
  },
}));
