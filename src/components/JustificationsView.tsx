import { useState, useEffect, useCallback } from 'react';
import { Layout } from './Layout';
import { Justification } from '../data/mockData';
import { Filter, ChevronRight, Loader2 } from 'lucide-react';
import { DetailsModal } from './DetailsModal';
import { justificationService } from '../services/justification.service';

export const JustificationsView = () => {
    const [justifications, setJustifications] = useState<Justification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterArea, setFilterArea] = useState('Todas');
    const [filterStatus, setFilterStatus] = useState('Todas');
    const [selectedItem, setSelectedItem] = useState<Justification | null>(null);

    const loadJustifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await justificationService.getAllJustifications();
            setJustifications(data);
            setError('');
        } catch (err) {
            console.error('Error loading:', err);
            setError(err instanceof Error ? err.message : 'No se pudieron cargar las justificaciones');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJustifications();
    }, [loadJustifications]);

    const handleUpdate = useCallback(async (id: string, status: string, reason?: string) => {
        await justificationService.updateStatus(id, status, reason);
        // Update local state immediately to reflect the change
        setJustifications(prev => prev.map(item =>
            item.id === id ? { ...item, estado: status as any, razon_rechazo: reason } : item
        ));
        // Also reload from server to be sure
        loadJustifications();
    }, [loadJustifications]);

    const filtered = justifications.filter(item => {
        if (filterArea !== 'Todas' && item.area_nombre !== filterArea) return false;
        if (filterStatus !== 'Todas' && item.estado?.toLowerCase() !== filterStatus.toLowerCase()) return false;
        return true;
    });

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-aquanqa-dark">Justificaciones</h1>
                <p className="text-gray-500">Gestiona las solicitudes de inasistencia y permisos</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2 text-gray-500">
                    <Filter size={18} />
                    <span className="font-medium">Filtrar por:</span>
                </div>

                {['Todas', 'Pendiente', 'Aprobado', 'Rechazado'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${filterStatus === status
                            ? 'bg-aquanqa-blue text-white shadow-lg shadow-blue-200 ring-2 ring-aquanqa-blue/20'
                            : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                    >
                        {status}
                    </button>
                ))}

                <div className="w-px h-6 bg-slate-100 mx-2 hidden md:block"></div>

                <div className="flex items-center space-x-3">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Área:</span>
                    {['Todas', 'Remuneraciones', 'Bienestar Social', 'ADP', 'Transportes'].map(area => (
                        <button
                            key={area}
                            onClick={() => setFilterArea(area)}
                            className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${filterArea === area
                                ? 'bg-aquanqa-dark text-white shadow-lg shadow-slate-200 ring-2 ring-slate-200'
                                : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            {area}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p className="font-bold">Cargando justificantes...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 flex flex-col items-center justify-center text-red-400">
                        <p className="font-bold">{error}</p>
                        <button onClick={loadJustifications} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Reintentar</button>
                    </div>
                ) : (
                    <>
                        {filtered.map(item => (
                            <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all border-l-4 border-l-aquanqa-dark relative group">
                                {/* Estado Badge - Top Right */}
                                <div className="absolute top-6 right-6 flex items-center space-x-2">
                                    <span className="bg-gray-100 text-aquanqa-blue px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                        {item.area_nombre}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.estado?.toLowerCase() === 'pendiente' ? 'bg-orange-100 text-orange-700' :
                                        item.estado?.toLowerCase() === 'aprobado' ? 'bg-green-100 text-green-700' :
                                            item.estado?.toLowerCase() === 'rechazado' ? 'bg-red-100 text-red-700' :
                                                item.estado?.toLowerCase() === 'en_proceso' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                        }`}>
                                        {item.estado}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.titulo}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-1">{item.descripcion}</p>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center space-x-4">
                                        <span className="font-medium text-aquanqa-dark">{item.usuario_nombre}</span>
                                        <span>•</span>
                                        <span>{(() => {
                                            try {
                                                return item.fecha_evento ? new Date(item.fecha_evento).toLocaleDateString() : 'Fecha no disp.';
                                            } catch (e) {
                                                return 'Fecha inválida';
                                            }
                                        })()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="absolute bottom-6 right-6 px-4 py-2 bg-aquanqa-blue/5 text-aquanqa-blue hover:bg-aquanqa-blue hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-lg active:scale-95 translate-y-2 group-hover:translate-y-0"
                                >
                                    Ver Detalle <ChevronRight size={14} className="ml-1" />
                                </button>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                No se encontraron justificaciones con estos filtros.
                            </div>
                        )}
                    </>
                )}
            </div>

            <DetailsModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                data={selectedItem as any}
                title="Detalle de Justificación"
                onUpdate={handleUpdate}
            />
        </Layout>
    );
};
