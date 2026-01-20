import api from './api';

export interface LoginResponse {
    access_token: string;
    user: {
        id: string;
        nombre: string;
        role: 'ADMIN' | 'GESTOR' | 'EMPLEADO';
        email: string;
    };
}

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', { username, password });
        const data = response as unknown as LoginResponse;

        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_role', data.user.role);
        }

        return data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        // You could also decode the JWT here if needed
        return token;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    }
};
