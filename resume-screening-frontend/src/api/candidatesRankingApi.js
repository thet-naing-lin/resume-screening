import api from "./axios";
import { withCache, clearCacheByPattern } from "../utils/apiCache";

// US-014: Get ranked candidates for a job (with optional filters)
export const getRankings = (params) => {
  // Create a cache key that includes the params
  const cacheKey = `candidate-rankings:${JSON.stringify(params || {})}`;
  return withCache(cacheKey, () => api.get("/candidate-rankings", { params }));
};

// Update candidate status (shortlist / reject / under_review)
export const updateCandidateStatus = async (resumeId, status) => {
  const response = await api.patch(`/candidate-rankings/${resumeId}/status`, { status });
  clearCacheByPattern("candidate-rankings"); // Clear rankings cache after status update
  return response;
};

// Export CSV — returns a blob for download
export const exportRankingsCsv = async (params) => {
  const response = await api.get("/candidate-rankings/export", {
    params,
    responseType: "blob", // ← critical, tells axios to expect binary data
  });
  return response;
};
