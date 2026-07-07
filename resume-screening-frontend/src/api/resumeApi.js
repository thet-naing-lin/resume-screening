import api from "./axios";
import { withCache, clearCacheByPattern } from "../utils/apiCache";

// Upload one or multiple resumes
export const uploadResumes = async (formData) => {
  const response = await api.post("/resumes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  clearCacheByPattern("resumes"); // Clear resumes cache after upload
  return response;
};

// Get all resumes uploaded by the logged-in HR user
export const getResumes = () =>
  withCache("resumes", () => api.get("/resumes"));

export const deleteResume = async (id) => {
  const response = await api.delete(`/resumes/${id}`);
  clearCacheByPattern("resumes"); // Clear resumes cache after delete
  return response;
};
