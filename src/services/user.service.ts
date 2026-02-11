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
            // Map backend boolean estado to frontend Activo/Inactivo
            return users.map((u: any) => ({
                ...u,
                id: u.id.toString(),
                estado: u.estado === true ? 'Activo' : (u.estado === false ? 'Inactivo' : 'SIN CONTRATO'),
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
            estado: u.estado === true ? 'Activo' : (u.estado === false ? 'Inactivo' : 'SIN CONTRATO'),
            documento: u.documento || u.dni || '',
        } as User;
    },

    createUser: async (userData: Partial<User>): Promise<User> => {
        const payload = {
            documento: userData.documento,
            nombre: userData.nombre,
            email: userData.email || userData.documento, // Default User to DNI
            // Convert 'Activo' strings back to boolean for backend
            estado: userData.estado === 'Activo',
            rol: (userData.rol === 'admin' ? 'ADMIN' : (userData.rol === 'gestor' ? 'GESTOR' : (userData.rol === 'obrero' ? 'EMPLEADO' : 'EMPLEADO'))),
            contrasena: userData.contrasena || userData.documento || 'password123',
        };
        console.log('Sending create user:', payload);
        const response: any = await api.post('/users', payload);
        const data = response.data || response;
        // Return mapped object for immediate UI update
        return {
            ...data,
            id: data.id?.toString(),
            estado: data.estado === true ? 'Activo' : 'Inactivo',
            documento: data.documento || ''
        } as User;
    },

    updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
        const payload: any = {};
        if (userData.nombre) payload.nombre = userData.nombre;
        if (userData.documento) payload.documento = userData.documento;
        if (userData.email) payload.email = userData.email;
        if (userData.estado !== undefined) {
            payload.estado = userData.estado === 'Activo';
        }
        if (userData.rol) {
            payload.rol = (userData.rol === 'admin' ? 'ADMIN' : (userData.rol === 'gestor' ? 'GESTOR' : 'EMPLEADO'));
        }

        console.log(`Sending update user ${id}:`, payload);
        const response: any = await api.patch(`/users/${id}`, payload);
        const data = response.data || response;
        // Return mapped object for immediate UI update
        return {
            ...data,
            id: data.id?.toString(),
            estado: data.estado === true ? 'Activo' : 'Inactivo',
            documento: data.documento || ''
        } as User;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    importUsers: async (file: File): Promise<{ success: number; errors: any[] }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response: any = await api.post('/users/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data || response;
    },

    bulkDelete: async (documents: string[], action: 'inactivate' | 'delete' = 'inactivate'): Promise<{ success: number; notFound: string[] }> => {
        const response: any = await api.post('/users/bulk-delete', { documents, action });
        return response.data || response;
    }
};
