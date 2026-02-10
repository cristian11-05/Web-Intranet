import api, { USE_MOCK } from './api';
import { Justification, MOCK_JUSTIFICATIONS } from '../data/mockData';
import { formatImageUrl } from './comunicado.service';

export const justificationService = {
    getAllJustifications: async (): Promise<Justification[]> => {
        if (USE_MOCK) return MOCK_JUSTIFICATIONS;
        const response: any = await api.get('/justifications');

        // El backend devuelve { data: [...], meta: {...} }
        const rawData = Array.isArray(response) ? response : (response.data || []);

        return rawData.map((item: any) => ({
            ...item,
            id: String(item.id),
            usuario_id: String(item.usuario_id),
            area_id: String(item.area_id),
            // Priorizamos los valores que ya vienen del backend
            area_nombre: item.area_nombre || item.area?.nombre || 'General',
            usuario_nombre: item.usuario_nombre || item.usuario?.nombre,
            usuario_documento: item.usuario_documento || item.usuario?.documento,
            // Formatear imágenes si existen
            adjunto_url: item.adjunto_url ? formatImageUrl(item.adjunto_url) : undefined,
            adjuntos: (item.adjuntos || []).map((adj: any) => ({
                ...adj,
                ruta_archivo: formatImageUrl(adj.ruta_archivo || adj.url || adj.path)
            }))
        })) as Justification[];
    },

    createJustification: async (data: { titulo: string; descripcion: string; fecha_evento: string }): Promise<Justification> => {
        const response = await api.post('/justifications', data);
        return response as unknown as Justification;
    },

    updateStatus: async (id: string, status: number, reason?: string): Promise<Justification> => {
        try {
            // Ensure ID is passed as needed by backend (some backends expect number or string)
            const response: any = await api.patch(`/justifications/${id}/status`, {
                estado: status,
                razon_rechazo: reason
            });
            return response.data || response;
        } catch (error: any) {
            // Rethrow with more context if needed, but api interceptor already does most of it
            throw error;
        }
    },
};
