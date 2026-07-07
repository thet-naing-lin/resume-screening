import api from "./axios";
import { withCache, clearCacheByPattern } from "../utils/apiCache";

export const getJobs = () =>
  withCache("jobs", () => api.get("/jobs"));

export const getJob = (id) => api.get(`/jobs/${id}`);

export const createJob = async (data) => {
  const response = await api.post("/jobs", data);
  clearCacheByPattern("jobs"); // Clear jobs cache after create
  return response;
};

export const updateJob = async (id, data) => {
  const response = await api.put(`/jobs/${id}`, data);
  clearCacheByPattern("jobs"); // Clear jobs cache after update
  return response;
};

export const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  clearCacheByPattern("jobs"); // Clear jobs cache after delete
  return response;
};
