import api from "./axios";

export const generateAiInsights = (resumeId) =>
  api.post(`/resumes/${resumeId}/ai-insights`);

export const getAiInsights = (resumeId) =>
  api.get(`/resumes/${resumeId}/ai-insights`);
