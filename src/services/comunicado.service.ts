import api from './api';

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
        const response = await api.get('/comunicados');
        return response as unknown as Comunicado[];
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
