import api, { USE_MOCK } from './api';
import { MOCK_USERS } from '../data/mockData';

export interface LoginResponse {
    access_token: string;
    user: {
        id: string;
        nombre: string;
        rol: string;
        email: string;
    };
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        if (USE_MOCK) {
            const user = MOCK_USERS.find(u => (u.email === email || u.documento === email) && u.contrasena === password);
            if (!user) {
                throw new Error('Credenciales inválidas (Simulación)');
            }
            const mockResponse: LoginResponse = {
                access_token: 'mock-jwt-token',
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    rol: user.rol,
                    email: user.email
                }
            };
            localStorage.setItem('access_token', mockResponse.access_token);
            localStorage.setItem('user_role', mockResponse.user.rol);
            localStorage.setItem('user_data', JSON.stringify(mockResponse.user));
            return mockResponse;
        }

        const response = await api.post('/auth/login', { email, password });
        const data = response as unknown as LoginResponse;

        if (data.access_token && data.user) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_role', data.user.rol || 'trabajador');
            localStorage.setItem('user_data', JSON.stringify(data.user));
        }

        return data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const userData = localStorage.getItem('user_data');
        if (!userData) return null;
        try {
            return JSON.parse(userData);
        } catch {
            return null;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    }
};
