import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/services";
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- helpers to support File uploads ---
const isFileLike = (v) =>
  (typeof File !== "undefined" && v instanceof File) ||
  (typeof Blob !== "undefined" && v instanceof Blob);

const isFormData = (v) =>
  typeof FormData !== "undefined" && v instanceof FormData;

const autoFormData = (body) => {
  if (!body || typeof body !== "object" || isFormData(body)) return body;
  let hasFile = false;
  for (const k in body) if (isFileLike(body[k])) { hasFile = true; break; }
  if (!hasFile) return body;

  const fd = new FormData();
  Object.entries(body).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((it) => fd.append(`${k}[]`, it));
    else if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
};

const buildHeaders = (payload) => {
  const base = { ...authHeaders(), Accept: "application/json" };
  return isFormData(payload) ? base : { ...base, "Content-Type": "application/json" };
};

export const useServicesStore = create((set, get) => ({
  services: [],
  service: null,
  loading: false,
  error: null,
  createdService: null,
  updatedService: null,

  async createService(body) {
    set({ loading: true, error: null });
    try {
      const payload = autoFormData(body);
      const headers = buildHeaders(payload);
      const { data } = await api.post("", payload, { headers });
      const created = data?.data ?? data;
      set({ createdService: created, loading: false });
      await get().fetchServices();
      return created;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to create service", loading: false });
      throw err;
    }
  },

  async updateService(idOrObj, maybeBody) {
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("updateService: missing id");

    set({ loading: true, error: null });
    try {
      const payload = autoFormData(body);
      const headers = buildHeaders(payload);
      const { data } = await api.patch(`/${id}`, payload, { headers });
      const updated = data?.data ?? data;
      set({ updatedService: updated, loading: false });
      await get().fetchServices();
      return updated;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update service", loading: false });
      throw err;
    }
  },

  async deleteService(idOrObj) {
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
