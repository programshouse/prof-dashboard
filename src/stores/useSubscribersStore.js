import { create } from "zustand";
import axios from "axios";

const API_ROOT = "https://www.programshouse.com/dashboards/prof/api/subscribers";
const api = axios.create({ baseURL: API_ROOT });

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useSubscribersStore = create((set, get) => ({
  subscribers: [],
  subscriber: null,
  loading: false,
  error: null,

  async createSubscriber(body) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("", body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const created = data?.data ?? data;
      set({ loading: false });
      await get().fetchSubscribers();
      return created;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to create subscriber", loading: false });
      throw err;
    }
  },

  async updateSubscriber(idOrObj, maybeBody) {
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    const body = maybeBody ?? (typeof idOrObj === "object" ? idOrObj : {});
    if (!id) throw new Error("updateSubscriber: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.patch(`/${id}`, body, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      set({ loading: false });
      await get().fetchSubscribers();
      return data?.data ?? data;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update subscriber", loading: false });
      throw err;
    }
  },

  async deleteSubscriber(idOrObj) {
    const id = typeof idOrObj === "string" || typeof idOrObj === "number" ? idOrObj : idOrObj?.id;
    if (!id) throw new Error("deleteSubscriber: missing id");

    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/${id}`, { headers: authHeaders() });
      set({ loading: false });
      await get().fetchSubscribers();
      return data?.data ?? data;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to delete subscriber", loading: false });
      throw err;
    }
  },

  async fetchSubscribers() {
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
      set({ subscribers: list, loading: false });
      return list;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to fetch subscribers", loading: false });
      throw err;
    }
  },

  async fetchSubscriberById(id) {
    if (!id) throw new Error("fetchSubscriberById: missing id");
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/${id}`, { headers: authHeaders() });
      const item = data?.data ?? data;
      set({ subscriber: item, loading: false });
      return item;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to get subscriber", loading: false });
      throw err;
    }
  },
}));
