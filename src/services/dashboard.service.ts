import api from './api';

export interface DashboardStats {
    totalJustificaciones: number;
    aprobadas: number;
    pendientes: number;
    rechazadas: number;
    totalSugerencias: number;
    reporteSituacion: number;
    teEscuchamos: number;
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response: any = await api.get('/dashboard/stats');
        return response.data || response;
    },
};
