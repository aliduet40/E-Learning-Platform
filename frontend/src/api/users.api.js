import api from './axiosInstance';

export const getUsers = (params) => api.get('/users', { params });
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
