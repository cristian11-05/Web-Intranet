import { Layout } from './Layout';
import { MOCK_JUSTIFICATIONS, MOCK_SUGGESTIONS } from '../data/mockData';

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
    // Calcular contadores reales basados en Mocks
    const totalJustif = MOCK_JUSTIFICATIONS.length + 153; // Simulando más datos 
    const aprobadas = MOCK_JUSTIFICATIONS.filter(j => j.estado === 'aprobado').length + 147;
    const pendientes = MOCK_JUSTIFICATIONS.filter(j => j.estado === 'pendiente').length + 4;
    const rechazadas = MOCK_JUSTIFICATIONS.filter(j => j.estado === 'rechazado').length + 2;

    const totalSugerencias = MOCK_SUGGESTIONS.length + 33;
    const reclamos = MOCK_SUGGESTIONS.filter(s => s.tipo === 'reclamo').length + 11;
    const sugerencias = MOCK_SUGGESTIONS.filter(s => s.tipo === 'sugerencia').length + 22;

    return (
        <Layout>
            <div className="space-y-8">
                {/* Sección Justificaciones */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-aquanqa-dark">Resumen de Justificaciones</h2>
                        <button className="bg-aquanqa-dark text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition">Ver todas</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard count={totalJustif} title="Total" subtitle="Total de Justificaciones" />
                        <StatCard count={aprobadas} title="Aprobadas" subtitle="Solicitudes aprobadas" type="success" />
                        <StatCard count={pendientes} title="Pendientes" subtitle="Por revisar" type="warning" />
                        <StatCard count={rechazadas} title="Rechazadas" subtitle="Solicitudes rechazadas" type="danger" />
                    </div>
                </div>

                {/* Sección Sugerencias */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-aquanqa-dark">Sugerencias y Reclamos</h2>
                        <button className="bg-aquanqa-dark text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition">Ver todas</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard count={totalSugerencias} title="Total General" subtitle="Sugerencias + Reclamos" />
                        <StatCard count={sugerencias} title="Sugerencias" subtitle="Ideas y propuestas" type="success" />
                        <StatCard count={reclamos} title="Reclamos" subtitle="Reportes de problemas" type="danger" />
                    </div>
                </div>
            </div>
        </Layout>
    );
};
