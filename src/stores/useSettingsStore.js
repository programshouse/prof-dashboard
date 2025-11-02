import { create } from "zustand";
import axios from "axios";

const API_ROOT = (import.meta?.env?.VITE_API_URL || "https://www.programshouse.com/dashboards/prof/api/settings") ;
const api = axios.create({ baseURL: API_ROOT });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const useSettingsStore = create((set) => ({
  settings: null,
  loading: false,
  error: null,

  async fetchSettings() {
    set({ loading: true, error: null });
    try {
      const res = await api.get("");
      const data = res?.data?.data ?? res?.data ?? null;
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
      const res = await api.put("", payload);
      const data = res?.data?.data ?? res?.data ?? null;
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
      await api.delete("");
      set({ settings: null, loading: false });
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete settings";
      set({ error: msg, loading: false });
      throw err;
    }
  },
}));
