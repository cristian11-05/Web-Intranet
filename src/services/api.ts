import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const USE_MOCK = false; // Forzamos modo simulación para que el usuario pueda navegar sin BD

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
            // Return data as is, whether it's an array or an object
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

        // Extract message from server response if available
        const serverData = error.response?.data;
        let serverMessage = serverData?.message || serverData?.error || serverData?.detail || error.message;

        // If message is an array (validation errors), join them
        if (Array.isArray(serverMessage)) {
            serverMessage = serverMessage.join(', ');
        }

        return Promise.reject(new Error(serverMessage));
    }
);

export default api;
