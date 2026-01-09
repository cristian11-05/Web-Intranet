import api from './api';
import { Suggestion } from '../data/mockData';

export const suggestionService = {
    getAllSuggestions: async (): Promise<Suggestion[]> => {
        // Note: User summary didn't specify GET /suggestions, but assuming consistency
        const response = await api.get('/suggestions');
        return response as unknown as Suggestion[];
    },

    createSuggestion: async (data: { tipo: string; titulo: string; descripcion: string }): Promise<Suggestion> => {
        const response = await api.post('/suggestions', data);
        return response as unknown as Suggestion;
    },
};
