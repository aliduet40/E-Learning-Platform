import api from './axiosInstance';

export const getStudentDashboardStats = () => api.get('/dashboard/student');
export const getInstructorDashboardStats = () => api.get('/dashboard/instructor');
export const getInstructorStudents = () => api.get('/dashboard/instructor/students');
export const getAdminDashboardStats = () => api.get('/dashboard/admin'); // Assuming admin exists too
