import api from "./axios";

// Upload one or multiple resumes
export const uploadResumes = (formData) => {
  return api.post("/resumes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get all resumes uploaded by the logged-in HR user
export const getResumes = () => {
  return api.get("/resumes");
};

export const deleteResume = (id) => api.delete(`/resumes/${id}`);
