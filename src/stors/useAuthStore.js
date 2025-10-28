import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://www.programshouse.com/reem/api/v1/admins";

export const useAuthStore = create((set) => ({
  admin: null,
  access_token: null,
  loading: false,
  error: null,
  isInitialized: false,

  // ✅ login function
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { access_token, admin } = res.data;

const expiryTime = Date.now() + 24 * 60 * 60 * 1000;


      set({ admin, access_token, loading: false });

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("expiry_time", expiryTime);

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
      throw err;
    }
  },
getProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      set({ getProfile: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to get profile", loading: false });
      throw err;
    }
  },

  // ✅ checkSession function
  checkSession: () => {
    const expiry = localStorage.getItem("expiry_time");
    if (expiry && Date.now() > Number(expiry)) {
      set({ admin: null, access_token: null });
      localStorage.removeItem("access_token");
      localStorage.removeItem("admin");
      localStorage.removeItem("expiry_time");

      toast.error("⏰ Session expired, please login again!");
      return false;
    }
    return true;
  },

  // ✅ logout function
  logout: () => {
    set({ admin: null, access_token: null });
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin");
        localStorage.removeItem("expiry_time");

  },

  // ✅ تحميل البيانات من localStorage عند فتح الصفحة
  loadUserFromStorage: () => {
  const token = localStorage.getItem("access_token");
  const admin = localStorage.getItem("admin");

  if (token && admin) {
    set({
      access_token: token,
      admin: JSON.parse(admin),
      isInitialized: true,
    });
  } else {
    set({ isInitialized: true});
}
},
}));