import { create } from "zustand";
import axios from "axios";

// Endpoints (Laravel):
//   GET    /tools        -> list
//   GET    /tools/:id    -> show
//   POST   /tools        -> create   (multipart when an image is attached)
//   PATCH  /tools/:id    -> update   (multipart => POST + _method=PATCH)
//   DELETE /tools/:id    -> delete
const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/tools";
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

// Converts a plain object to FormData only when it contains a File
const autoFormData = (body) => {
  if (!body || typeof body !== "object" || isFormData(body)) return body;
  const hasFile = Object.values(body).some(isFileLike);
  if (!hasFile) return body;

  const fd = new FormData();
  Object.entries(body).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((it) => fd.append(`${k}[]`, it));
    else if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
};

const getId = (idOrObj) =>
  typeof idOrObj === "string" || typeof idOrObj === "number"
    ? idOrObj
    : idOrObj?.id;

const unwrapList = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.result)
    ? data.result
    : [];

export const useToolsStore = create((set, get) => ({
  tools: [],
  tool: null,
  loading: false,
  error: null,

  // ---------- READ (list) ----------
  async fetchTools() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", {
        headers: { ...authHeaders(), Accept: "application/json" },
      });
      const list = unwrapList(data);
      set({ tools: list, loading: false });
      return list;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to fetch tools",
        loading: false,
      });
      throw err;
    }
  },

  // ---------- READ (show) ----------
  async fetchToolById(id) {
    if (!id) throw new Error("fetchToolById: missing id");
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/${id}`, {
        headers: { ...authHeaders(), Accept: "application/json" },
      });
      const tool = data?.data ?? data;
      set({ tool, loading: false });
      return tool;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to get tool",
        loading: false,
      });
      throw err;
    }
  },

  // ---------- CREATE ----------
  async createTool(body) {
    set({ loading: true, error: null });
    try {
      const payload = autoFormData(body);
      const headers = {
        ...authHeaders(),
        Accept: "application/json",
        // For FormData the browser sets the multipart boundary itself
        ...(isFormData(payload) ? {} : { "Content-Type": "application/json" }),
      };
      const { data } = await api.post("", payload, { headers });
      const created = data?.data ?? data;
      set({ loading: false });
      await get().fetchTools();
      return created;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to create tool",
        loading: false,
      });
      throw err;
    }
  },

  // ---------- UPDATE ----------
  async updateTool(idOrObj, maybeBody) {
    const id = getId(idOrObj);
    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("updateTool: missing id");

    set({ loading: true, error: null });
    try {
      const payload = autoFormData(body);
      let res;

      if (isFormData(payload)) {
        // Laravel can't parse multipart on PATCH/PUT -> POST + _method override
        payload.append("_method", "PATCH");
        res = await api.post(`/${id}`, payload, {
          headers: { ...authHeaders(), Accept: "application/json" },
        });
      } else {
        res = await api.patch(`/${id}`, payload, {
          headers: {
            ...authHeaders(),
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      }

      const updated = res?.data?.data ?? res?.data;
      set({ loading: false });
      await get().fetchTools();
      return updated;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to update tool",
        loading: false,
      });
      throw err;
    }
  },

  // ---------- DELETE ----------
  async deleteTool(idOrObj) {
    const id = getId(idOrObj);
    if (!id) throw new Error("deleteTool: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/${id}`, {
        headers: { ...authHeaders(), Accept: "application/json" },
      });
      set({ loading: false });
      await get().fetchTools();
      return data?.data ?? data;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to delete tool",
        loading: false,
      });
      throw err;
    }
  },
}));
