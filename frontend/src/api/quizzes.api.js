import api from './axiosInstance';

export const getQuizById = (id) => api.get(`/quizzes/${id}`);
export const startQuizAttempt = (id) => api.post(`/quizzes/${id}/attempt`);
export const submitQuiz = (id, data) => api.post(`/quizzes/${id}/submit`, data);
export const getQuizResults = (id) => api.get(`/quizzes/${id}/results`);
