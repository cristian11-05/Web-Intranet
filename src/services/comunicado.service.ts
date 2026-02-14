import api, { USE_MOCK, API_BASE_URL } from './api';
import { MOCK_COMUNICADOS } from '../data/mockData';

// Helper to format image URLs from the backend
export const formatImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // Prepend API_BASE_URL to relative paths from backend (e.g. /uploads/...)
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
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
