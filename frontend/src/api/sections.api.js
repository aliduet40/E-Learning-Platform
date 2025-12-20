import api from './axiosInstance';

export const createSection = (courseId, data) => api.post(`/courses/${courseId}/sections`, data);
export const updateSection = (id, data) => api.put(`/sections/${id}`, data);
export const deleteSection = (id) => api.delete(`/sections/${id}`);
