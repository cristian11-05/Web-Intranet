import api, { USE_MOCK } from './api';
import { Justification, MOCK_JUSTIFICATIONS } from '../data/mockData';
import { formatImageUrl } from './comunicado.service';

export const justificationService = {
    getAllJustifications: async (): Promise<Justification[]> => {
        if (USE_MOCK) return MOCK_JUSTIFICATIONS;
        const response: any = await api.get('/justifications');

        // El backend devuelve { data: [...], meta: {...} }
        const rawData = Array.isArray(response) ? response : (response.data || []);

        return rawData.map((item: any) => {
            // Map numeric status to string for frontend compatibility
            let statusStr = item.estado;
            if (typeof item.estado === 'number') {
                const statusMap: Record<number, string> = {
                    0: 'pendiente',
                    1: 'aprobado',
                    2: 'rechazado'
                };
                statusStr = statusMap[item.estado] || 'pendiente';
            }

            return {
                ...item,
                id: String(item.id),
                usuario_id: String(item.usuario_id),
                area_id: String(item.area_id),
                estado: statusStr,
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
            };
        }) as Justification[];
    },

    createJustification: async (data: { titulo: string; descripcion: string; fecha_evento: string }): Promise<Justification> => {
        const response = await api.post('/justifications', data);
        return response as unknown as Justification;
    },

    updateStatus: async (id: string, status: string, reason?: string): Promise<Justification> => {
        try {
            // Map string labels back to numeric for backend DTO
            const statusMap: Record<string, number> = {
                'pendiente': 0,
                'aprobado': 1,
                'rechazado': 2,
                'en_proceso': 0 // Fallback if backend doesn't support 3 yet
            };
            const numericStatus = statusMap[status.toLowerCase()] ?? 0;

            const response: any = await api.patch(`/justifications/${id}/status`, {
                estado: numericStatus,
                razon_rechazo: reason
            });
            return response.data || response;
        } catch (error: any) {
            // Rethrow with more context if needed, but api interceptor already does most of it
            throw error;
        }
    },
};
