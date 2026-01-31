import api, { USE_MOCK } from './api';
import { Justification, MOCK_JUSTIFICATIONS } from '../data/mockData';

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
            usuario_documento: item.usuario_documento || item.usuario?.documento
        })) as Justification[];
    },

    createJustification: async (data: { titulo: string; descripcion: string; fecha_evento: string }): Promise<Justification> => {
        const response = await api.post('/justifications', data);
        return response as unknown as Justification;
    },

    updateStatus: async (id: string, status: string, reason?: string): Promise<Justification> => {
        const response: any = await api.patch(`/justifications/${id}/status`, { estado: status, razon_rechazo: reason });
        return response.data || response;
    },
};
