import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { dashboardService } from '../services/dashboard.service';
import { Loader2 } from 'lucide-react';

const StatCard = ({ title, count, subtitle, type }: { title: string; count: number; subtitle: string; type?: 'default' | 'success' | 'warning' | 'danger' }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
                <span className={`text-4xl font-bold mb-2 ${type === 'success' ? 'text-aquanqa-green' :
                    type === 'warning' ? 'text-aquanqa-orange' :
                        type === 'danger' ? 'text-red-500' : 'text-aquanqa-dark'
                    }`}>
                    {count}
                </span>
                <h3 className="text-gray-900 font-semibold mb-1">{title}</h3>
                <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const [stats, setStats] = useState({
        totalJustif: 0,
        aprobadas: 0,
        pendientes: 0,
        rechazadas: 0,
        totalSugerencias: 0,
        reclamos: 0,
        sugerencias: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getStats();

            setStats({
                totalJustif: data.totalJustificaciones,
                aprobadas: data.aprobadas,
                pendientes: data.pendientes,
                rechazadas: data.rechazadas,
                totalSugerencias: data.totalSugerencias,
                reclamos: data.teEscuchamos,
                sugerencias: data.reporteSituacion,
            });
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="font-bold">Cargando tablero informativo...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Sección Justificaciones */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-aquanqa-dark">Resumen de Justificaciones</h2>
                        <button className="bg-aquanqa-dark text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition">Ver todas</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard count={stats.totalJustif} title="Total" subtitle="Total de Justificaciones" />
                        <StatCard count={stats.aprobadas} title="Aprobadas" subtitle="Solicitudes aprobadas" type="success" />
                        <StatCard count={stats.pendientes} title="Pendientes" subtitle="Por revisar" type="warning" />
                        <StatCard count={stats.rechazadas} title="Rechazadas" subtitle="Solicitudes rechazadas" type="danger" />
                    </div>
                </div>

                {/* Sección Sugerencias */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-aquanqa-dark">Reportes y Consultas</h2>
                        <button className="bg-aquanqa-dark text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition">Ver todas</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard count={stats.totalSugerencias} title="Total General" subtitle="Reportes + Consultas" />
                        <StatCard count={stats.sugerencias} title="Reporte de situación" subtitle="Ideas y propuestas" type="success" />
                        <StatCard count={stats.reclamos} title="Te escuchamos" subtitle="Reportes de problemas" type="danger" />
                    </div>
                </div>
            </div>
        </Layout>
    );
};
