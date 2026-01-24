import api from './api';
import { User } from '../data/mockData';

export const userService = {
    getAllUsers: async (filters?: { rol?: string; areaId?: string }): Promise<User[]> => {
        const response = await api.get('/users', { params: filters });
        return response as unknown as User[];
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get('/users/profile');
        return response as unknown as User;
    },

    createUser: async (userData: Partial<User>): Promise<User> => {
        const response = await api.post('/users', userData);
        return response as unknown as User;
    },

    updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
        const response = await api.patch(`/users/${id}`, userData);
        return response as unknown as User;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};
