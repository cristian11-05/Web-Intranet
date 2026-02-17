import axios from 'axios';
import { toast } from 'sonner';

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

// Mapeo de errores comunes del backend a español
const translateErrorMessage = (msg: string): string => {
    if (!msg) return 'Error desconocido';

    const translations: Record<string, string> = {
        'email must be an email': 'El correo electrónico no es válido',
        'documento must be longer than or equal to 8 characters': 'El documento debe tener al menos 8 caracteres',
        'documento length must be equal to 8': 'El documento debe tener exactamente 8 caracteres',
        'area_id must be an integer number': 'El área seleccionada no es válida (debe ser un número)',
        'nombre should not be empty': 'El nombre no puede estar vacío',
        'rol must be a valid enum value': 'El rol seleccionado no es válido',
        'password must be longer than or equal to 6 characters': 'La contraseña debe tener al menos 6 caracteres',
        'Unauthorized': 'No autorizado',
        'User not found': 'Usuario no encontrado',
        'Invalid credentials': 'Credenciales inválidas',
        'Internal server error': 'Error interno del servidor',
    };

    // Búsqueda por coincidencia exacta
    if (translations[msg]) return translations[msg];

    // Búsqueda por coincidencia parcial (para errores tipo "X must be an Y")
    for (const [key, value] of Object.entries(translations)) {
        if (msg.toLowerCase().includes(key.toLowerCase())) return value;
    }

    return msg;
};

// Interceptor to handle standardized response format { status: true, data: { ... }, message: "" }
api.interceptors.response.use(
    (response) => {
        const { status, data, message } = response.data;

        if (typeof status !== 'undefined') {
            if (status === false) {
                const errorMsg = translateErrorMessage(message);
                toast.error('Error del Sistema', { description: errorMsg });
                return Promise.reject(new Error(errorMsg));
            }
            if (message && response.config.method !== 'get') {
                toast.success('Operación Exitosa', { description: translateErrorMessage(message) });
            }
            return data;
        }

        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
            toast.error('Sesión Expirada', { description: 'Por favor, inicia sesión nuevamente.' });
            return Promise.reject(new Error('Sesión Expirada'));
        }

        const serverData = error.response?.data;
        let serverMessage = serverData?.message || serverData?.error || serverData?.detail || error.message;

        if (Array.isArray(serverMessage)) {
            serverMessage = serverMessage.map(m => translateErrorMessage(m)).join(', ');
        } else {
            serverMessage = translateErrorMessage(serverMessage);
        }

        toast.error('Error de Comunicación', { description: serverMessage });
        return Promise.reject(new Error(serverMessage));
    }
);

export default api;
