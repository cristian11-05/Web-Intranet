import api from './api';
import { Justification } from '../data/mockData';

export const justificationService = {
    getAllJustifications: async (): Promise<Justification[]> => {
        const response = await api.get('/justifications');
        return response as unknown as Justification[];
    },

    createJustification: async (data: { titulo: string; descripcion: string; fecha_evento: string }): Promise<Justification> => {
        const response = await api.post('/justifications', data);
        return response as unknown as Justification;
    },

    // Note: Backend might need specific endpoints for approval/rejection later
};
