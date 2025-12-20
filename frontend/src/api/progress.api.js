import api from './axiosInstance';

// Matches backend route: router.get('/enrollments/:id/progress', protect, getProgress);
// If mounted at /api, then url is /api/enrollments/:id/progress
// If mounted at /api/progress, then url is /api/progress/enrollments/:id/progress
// We will assume root mount based on previous context, but will verify with server.js.
// Based on standard practices, likely mounted as /api (handled by axiosInstance) + /enrollments...
// Wait, if it's in progress.js, usually routes are grouped.
// Let's defer exact string until server.js check, but writing placeholders.

export const getEnrollmentProgress = (enrollmentIdOrCourseId) => api.get(`/progress/enrollments/${enrollmentIdOrCourseId}/progress`);
export const getStudentStats = () => api.get('/stats');
