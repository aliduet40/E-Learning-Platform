import api from './axiosInstance';

export const createAssignment = (lessonId, data) => api.post(`/lessons/${lessonId}/assignment`, data);
export const getAssignment = (id) => api.get(`/assignments/${id}`);
export const submitAssignment = (id, data) => api.post(`/assignments/${id}/submit`, data);
export const gradeSubmission = (submissionId, data) => api.put(`/submissions/${submissionId}/grade`, data);
