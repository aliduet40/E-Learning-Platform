import api from './axiosInstance';

// api= http://localhost:5000/api/auth/register

export const login = (credentials) => api.post('/auth/login', credentials);
export const signup = (userData) => {
    // If an avatar File was provided, send as multipart so the backend can
    // pipe it to Cloudinary; otherwise stick with JSON.
    if (userData && userData.avatar instanceof File) {
        const fd = new FormData();
        Object.entries(userData).forEach(([k, v]) => {
            if (v !== undefined && v !== null) fd.append(k, v);
        });
        return api.post('/auth/register', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
    return api.post('/auth/register', userData);
};
export const logout = () => api.post('/auth/logout');
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => {
    if (data && data.avatar instanceof File) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
            if (v !== undefined && v !== null) fd.append(k, v);
        });
        return api.put('/auth/profile', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
    return api.put('/auth/profile', data);
};
export const changePassword = (data) => api.put('/auth/change-password', data);
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.put(`/auth/reset-password/${token}`, { password });

