import { create } from "zustand";
import axios from "axios";

// ✅ خلي VITE_API_URL يكون لحد /api فقط
// مثال: https://www.programshouse.com/dashboards/prof/api
const API_ROOT =
  import.meta?.env?.VITE_API_URL ||
  "https://www.programshouse.com/dashboards/prof/api";

const api = axios.create({ baseURL: API_ROOT });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const normalizeSettings = (data) => {
  const d = data || {};
  return {
    id: d.id ?? d._id ?? null,
    siteName: d.siteName ?? d.site_name ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    address: d.address ?? "",
    socials: {
      facebook: d.socials?.facebook ?? d.facebook ?? "",
      whatsapp: d.socials?.whatsapp ?? d.whatsapp ?? "",
      instagram: d.socials?.instagram ?? d.instagram ?? "",
      twitter: d.socials?.twitter ?? d.twitter ?? "",
      linkedin: d.socials?.linkedin ?? d.linkedin ?? "",
    },
  };
};

export const useSettingsStore = create((set) => ({
  settings: null,
  loading: false,
  error: null,

  async fetchSettings() {
    set({ loading: true, error: null });
    try {
      // ✅ endpoint الصحيح (حسب Postman collection عندك: settings)
      const res = await api.get("/settings");
      const raw = res?.data?.data ?? res?.data ?? null;
      const data = normalizeSettings(raw);
      set({ settings: data, loading: false });
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load settings";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  async updateSettings(payload) {
    set({ loading: true, error: null });
    try {
      const p = payload || {};

      // ✅ backend متوقع fields flat زي postman
      const fd = new FormData();
      fd.append("site_name", p.siteName ?? "");
      fd.append("email", p.email ?? "");
      fd.append("phone", p.phone ?? "");
      fd.append("address", p.address ?? "");

      fd.append("facebook", p.socials?.facebook ?? "");
      fd.append("whatsapp", p.socials?.whatsapp ?? "");
      fd.append("instagram", p.socials?.instagram ?? "");
      fd.append("twitter", p.socials?.twitter ?? "");
      fd.append("linkedin", p.socials?.linkedin ?? "");

      const res = await api.post("/settings/save", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const raw = res?.data?.data ?? res?.data ?? null;
      const data = normalizeSettings(raw);

      set({ settings: data, loading: false });
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update settings";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  async deleteSettings() {
    set({ loading: true, error: null });
    try {
      await api.delete("/settings");
      set({ settings: null, loading: false });
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete settings";
      set({ error: msg, loading: false });
      throw err;
    }
  },
}));
