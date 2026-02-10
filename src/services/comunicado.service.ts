import api, { USE_MOCK } from './api';
import { MOCK_COMUNICADOS } from '../data/mockData';

// Helper to format image URLs from the backend
export const formatImageUrl = (url?: string) => {
    if (!url) return undefined;
    // Backend now returns full Supabase URLs, so we just return the URL as is.
    // We keep the check just in case, but no longer prepend API_BASE_URL for relative paths blindly.
    return url;
};

export interface Comunicado {
    id: string;
    titulo: string;
    contenido: string;
    imagen_url?: string;
    fecha_publicacion?: string;
    autor?: {
        nombre: string;
        rol: string;
    };
    activo?: boolean;
}

export const comunicadoService = {
    getAll: async (): Promise<Comunicado[]> => {
        if (USE_MOCK) return MOCK_COMUNICADOS;
        const response: any = await api.get('/comunicados');
        const rawData = Array.isArray(response) ? response : (response.data || []);

        return rawData.map((item: any) => ({
            ...item,
            id: String(item.id),
            imagen_url: formatImageUrl(item.imagen_url || item.imagen)
        })) as Comunicado[];
    },

    create: async (data: { titulo: string; contenido: string; imagen?: string }) => {
        const response = await api.post('/comunicados', data);
        return response;
    },

    update: async (id: string, data: { titulo?: string; contenido?: string; imagen?: string; activo?: boolean }) => {
        const response = await api.put(`/comunicados/${id}`, data);
        return response;
    },

    delete: async (id: string) => {
        await api.delete(`/comunicados/${id}`);
    }
};
