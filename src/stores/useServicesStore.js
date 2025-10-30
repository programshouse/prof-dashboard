import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/services"; // no trailing slash
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useServicesStore = create((set, get) => ({
  services: [],
  service: null,
  loading: false,
  error: null,
  createdService: null,
  updatedService: null,

  // CREATE: POST /services
  async createService(body) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("", body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const created = data?.data ?? data;
      set({ createdService: created, loading: false });
      await get().fetchServices();
      return created;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to create service", loading: false });
      throw err;
    }
  },

  // UPDATE: PATCH /services/:id
  // New explicit signature: updateService(id, body)
  async updateService(idOrObj, maybeBody) {
    // Back-compat: allow updateService({ id, ...fields })
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("updateService: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.patch(`/${id}`, body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const updated = data?.data ?? data;
      set({ updatedService: updated, loading: false });
      await get().fetchServices();
      return updated;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update service", loading: false });
      throw err;
    }
  },

  // DELETE: DELETE /services/:id
  // New explicit signature: deleteService(id)
  async deleteService(idOrObj) {
    // Back-compat: allow deleteService({ id })
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    if (!id) throw new Error("deleteService: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/${id}`, { headers: authHeaders() });
      set({ loading: false });
      await get().fetchServices();
      return data?.data ?? data;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to delete service", loading: false });
      throw err;
    }
  },

  // LIST: GET /services
  async fetchServices() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", { headers: authHeaders() });
      const list =
        Array.isArray(data) ? data :
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.items) ? data.items :
        Array.isArray(data?.result) ? data.result : [];
      set({ services: list, loading: false });
      return list;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to fetch services", loading: false });
      throw err;
    }
  },

  // SHOW: GET /services/:id
  async fetchServiceById(id) {
    if (!id) throw new Error("fetchServiceById: missing id");
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/${id}`, { headers: authHeaders() });
      const svc = data?.data ?? data;
      set({ service: svc, loading: false });
      return svc;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to get service", loading: false });
      throw err;
    }
  },
}));
