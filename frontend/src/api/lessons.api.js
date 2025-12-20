import api from './axiosInstance';

export const getLessonById = (id) => api.get(`/lessons/${id}`);
export const completeLesson = (id) => api.post(`/lessons/${id}/complete`);
export const addResource = (id, data) => api.post(`/lessons/${id}/resources`, data);
