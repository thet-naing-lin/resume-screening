import { create } from "zustand";
import { authApi } from "../api/auth";
import api from "../api/axios";

// stores user + token globally via Zustand

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // LOGIN action
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const { token, user } = response.data;

      // Persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({ user, token, loading: false });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // LOGOUT action
  logout: async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // Even if API fails, clear local data
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  // REGISTER action
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.register(data);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({ user, token, loading: false });
      return { success: true };
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join(" ")
        : error.response?.data?.message || "Registration failed.";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  loginWithToken: async (token) => {
    localStorage.setItem("token", token);
    try {
      const res = await api.get("/auth/me"); // your existing /api/auth/me endpoint
      const user = res.data.user ?? res.data; // handle both { user: {...} } and direct object
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, error: null });
      return { success: true };
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
      return { success: false };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
