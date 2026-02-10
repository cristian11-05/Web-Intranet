import api, { USE_MOCK } from './api';
import { Suggestion, MOCK_SUGGESTIONS } from '../data/mockData';
import { formatImageUrl } from './comunicado.service';

export const suggestionService = {
    getAllSuggestions: async (): Promise<Suggestion[]> => {
        if (USE_MOCK) return MOCK_SUGGESTIONS;
        // Note: User summary didn't specify GET /suggestions, but assuming consistency
        const response: any = await api.get('/suggestions');
        const rawData = Array.isArray(response) ? response : (response.data || []);

        return rawData.map((item: any) => ({
            ...item,
            id: String(item.id),
            usuario_id: String(item.usuario_id),
            area_id: String(item.area_id),
            area_nombre: item.area_nombre || item.area?.nombre || 'General',
            usuario_nombre: item.usuario_nombre || item.usuario?.nombre,
            usuario_rol: item.usuario?.rol,
            // Formatear imágenes si existen
            adjunto_url: item.adjunto_url ? formatImageUrl(item.adjunto_url) : undefined,
            adjuntos: (item.adjuntos || []).map((adj: any) => ({
                ...adj,
                ruta_archivo: formatImageUrl(adj.ruta_archivo || adj.url || adj.path)
            }))
        })) as Suggestion[];
    },

    createSuggestion: async (data: { tipo: string; titulo: string; descripcion: string }): Promise<Suggestion> => {
        const response = await api.post('/suggestions', data);
        return response as unknown as Suggestion;
    },

    updateStatus: async (id: string, status: number, comment?: string): Promise<Suggestion> => {
        const response: any = await api.patch(`/suggestions/${id}/status`, { estado: status, comentario: comment });
        return response.data || response;
    },
};
