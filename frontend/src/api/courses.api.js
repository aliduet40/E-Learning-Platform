import api from './axiosInstance';

export const getCourses = (params) => api.get('/courses', { params });
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const enrollCourse = (id) => api.post(`/courses/${id}/enroll`);
export const getEnrolledCourses = () => api.get('/courses/my-courses'); // Updated path per user req
export const getInstructorCourses = () => api.get('/courses/my-teaching');
export const getCourseCurriculum = (id) => api.get(`/courses/${id}/curriculum`);
