import axios from 'axios';


// axios is just like a messanger that helps frontend to communicate with backend apis
//axios is library to make HTTP requests from browser (frontend) to server (backend) and handle responses.
// token hr request me automatically add kr deta h
// Interceptor = token auto attachment
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
