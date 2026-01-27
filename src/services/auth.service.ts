import api from './api';

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
        const response = await api.post('/auth/login', { email, password });
        const data = response as unknown as LoginResponse;

        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_role', data.user.rol);
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
