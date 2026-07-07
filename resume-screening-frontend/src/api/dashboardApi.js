import api from "./axios";
import { withCache, clearCache } from "../utils/apiCache";

export const getDashboardStats = () =>
  withCache("dashboard/stats", () => api.get("/dashboard/stats"));

// Clear dashboard cache when data changes
export const invalidateDashboardCache = () => clearCache("dashboard/stats");
