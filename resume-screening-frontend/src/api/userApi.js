import api from "./axios";
import { withCache, clearCacheByPattern } from "../utils/apiCache";

export const getUsers = () =>
  withCache("admin/users", () => api.get("/admin/users"));

export const createUser = async (data) => {
  const response = await api.post("/admin/users", data);
  clearCacheByPattern("admin/users"); // Clear users cache after create
  return response;
};

export const assignRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  clearCacheByPattern("admin/users"); // Clear users cache after role update
  return response;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  clearCacheByPattern("admin/users"); // Clear users cache after delete
  return response;
};
