import api, { USE_MOCK } from './api';
import { Justification, MOCK_JUSTIFICATIONS } from '../data/mockData';

export const justificationService = {
    getAllJustifications: async (): Promise<Justification[]> => {
        if (USE_MOCK) return MOCK_JUSTIFICATIONS;
        const response = await api.get('/justifications');
        return response as unknown as Justification[];
    },

    createJustification: async (data: { titulo: string; descripcion: string; fecha_evento: string }): Promise<Justification> => {
        const response = await api.post('/justifications', data);
        return response as unknown as Justification;
    },

    // Note: Backend might need specific endpoints for approval/rejection later
};
