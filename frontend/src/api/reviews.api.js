import api from './axiosInstance';

export const getCourseReviews = (courseId) => api.get(`/courses/${courseId}/reviews`);
export const createReview = (courseId, data) => api.post(`/courses/${courseId}/reviews`, data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const markReviewHelpful = (id) => api.post(`/reviews/${id}/helpful`);
