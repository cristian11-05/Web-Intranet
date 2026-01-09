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

    // Add more methods as needed (update, delete, etc.)
};
