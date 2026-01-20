import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle standardized response format { status: true, data: { ... }, message: "" }
api.interceptors.response.use(
    (response) => {
        // Some backends return { status: true, data: { ... } }
        // Others return just { ...data }
        const { status, data, message } = response.data;

        // If 'status' is explicitly defined, we assume it serves as a success flag
        if (typeof status !== 'undefined') {
            if (status === false) {
                return Promise.reject(new Error(message || 'Error en la respuesta del servidor'));
            }
            return data;
        }

        // Otherwise, assume the entire response.data is the payload
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (e.g., redirect to login or clear storage)
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
