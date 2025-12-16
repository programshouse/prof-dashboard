// /src/stores/useWorkshopStore.js
import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/workshops";
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
    // convert to FormData only if there is a File/Blob
    const payload = autoFormData(body);

    let res;

    if (isFormData(payload)) {
      // Laravel-friendly: method override for multipart updates
      payload.append("_method", "PATCH");

      res = await api.post(`/${id}`, payload, {
        headers: {
          ...authHeaders(),
          Accept: "application/json",
          // don't set Content-Type (browser sets boundary)
        },
      });
    } else {
      // normal JSON patch
      res = await api.patch(`/${id}`, payload, {
        headers: {
          ...authHeaders(),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    }

    const data = res?.data;
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
