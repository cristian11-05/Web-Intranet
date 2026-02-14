import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { justificationService } from '../services/justification.service';
import { suggestionService } from '../services/suggestion.service';
import { Loader2 } from 'lucide-react';

const StatCard = ({ title, count, subtitle, type }: { title: string; count: number; subtitle: string; type?: 'default' | 'success' | 'warning' | 'danger' }) => {
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-2 h-full ${type === 'success' ? 'bg-aquanqa-green' : type === 'warning' ? 'bg-amber-400' : type === 'danger' ? 'bg-rose-500' : 'bg-aquanqa-blue'}`}></div>
            <div className="flex flex-col items-center relative z-10">
                <span className={`text-5xl font-black mb-3 tracking-tighter ${type === 'success' ? 'text-aquanqa-green' :
                    type === 'warning' ? 'text-amber-500' :
                        type === 'danger' ? 'text-rose-500' : 'text-slate-800'
                    }`}>
                    {count}
                </span>
                <h3 className="text-slate-800 font-extrabold text-sm mb-1 uppercase tracking-widest">{title}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-0 opacity-50"></div>
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
            const [justif, sug] = await Promise.all([
                justificationService.getAllJustifications(),
                suggestionService.getAllSuggestions(),
            ]);

            setStats({
                totalJustif: justif.length,
                aprobadas: justif.filter(j => j.estado?.toLowerCase() === 'aprobado').length,
                pendientes: justif.filter(j => j.estado?.toLowerCase() === 'pendiente').length,
                rechazadas: justif.filter(j => j.estado?.toLowerCase() === 'rechazado').length,
                totalSugerencias: sug.length,
                reclamos: sug.filter(s => {
                    const tipo = s.tipo?.toLowerCase() || '';
                    return tipo.includes('reclamo') || tipo.includes('escuchamos');
                }).length,
                sugerencias: sug.filter(s => {
                    const tipo = s.tipo?.toLowerCase() || '';
                    return !tipo.includes('reclamo') && !tipo.includes('escuchamos');
                }).length,
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Resumen de Justificaciones</h2>
                        <button
                            onClick={() => window.location.hash = '/justificaciones'}
                            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-400 hover:text-aquanqa-blue hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 font-black px-6 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest shadow-sm"
                        >
                            Ver todas
                        </button>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reportes y Consultas</h2>
                        <button
                            onClick={() => window.location.hash = '/sugerencias'}
                            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-400 hover:text-aquanqa-blue hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 font-black px-6 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest shadow-sm"
                        >
                            Ver todas
                        </button>
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
