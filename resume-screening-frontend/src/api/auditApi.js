// src/api/auditApi.js
import api from "./axios";
import { withCache } from "../utils/apiCache";

export const getAuditLogs = (params) => {
  // Create a cache key that includes the params
  const cacheKey = `audit-logs:${JSON.stringify(params || {})}`;
  return withCache(cacheKey, () => api.get("/admin/audit-logs", { params }));
};
