import api, { USE_MOCK } from './api';
import { User, MOCK_USERS } from '../data/mockData';

export const userService = {
    getAllUsers: async (filters?: { rol?: string }): Promise<User[]> => {
        if (USE_MOCK) return MOCK_USERS;
        try {
            const response: any = await api.get('/users', { params: filters });
            const users = response.data || response;
            if (!Array.isArray(users)) {
                console.warn('Unexpected response format in getAllUsers:', response);
                return [];
            }
            // Map backend ACTIVO/INACTIVO back to frontend Activo/Inactivo for display
            return users.map((u: any) => ({
                ...u,
                id: u.id.toString(),
                estado: u.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
                documento: u.documento || u.dni || '',
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    getProfile: async (): Promise<User> => {
        if (USE_MOCK) return MOCK_USERS[0];
        const response: any = await api.get('/auth/profile').catch(() => ({ data: MOCK_USERS[0] }));
        const u = response.data || response;
        return {
            ...u,
            id: u.id?.toString() || '0',
            estado: u.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
        } as User;
    },

    createUser: async (userData: Partial<User>): Promise<User> => {
        const payload = {
            documento: userData.documento,
            nombre: userData.nombre,
            email: userData.email,
            estado: userData.estado?.toUpperCase() === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO',
            rol: (userData.rol === 'admin' ? 'ADMIN' : (userData.rol === 'gestor' ? 'GESTOR' : 'EMPLEADO')),
            contrasena: userData.contrasena || 'password123',
        };
        console.log('Sending create user:', payload);
        const response: any = await api.post('/users', payload);
        return response.data || response;
    },

    updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
        const payload: any = {};
        if (userData.nombre) payload.nombre = userData.nombre;
        if (userData.documento) payload.documento = userData.documento;
        if (userData.email) payload.email = userData.email;
        if (userData.estado) payload.estado = userData.estado.toUpperCase() === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO';
        if (userData.rol) {
            payload.rol = (userData.rol === 'admin' ? 'ADMIN' : (userData.rol === 'gestor' ? 'GESTOR' : 'EMPLEADO'));
        }

        console.log(`Sending update user ${id}:`, payload);
        const response: any = await api.patch(`/users/${id}`, payload);
        return response.data || response;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};
