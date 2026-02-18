import { useState, useEffect, useCallback } from 'react';
import { Layout } from './Layout';
import { Suggestion } from '../data/mockData';
import { Filter, ChevronRight, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react';
import { DetailsModal } from './DetailsModal';
import { suggestionService } from '../services/suggestion.service';

export const SuggestionsList = () => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('Todos');
    const [filterStatus, setFilterStatus] = useState('Todas');
    const [selectedItem, setSelectedItem] = useState<Suggestion | null>(null);

    const loadSuggestions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await suggestionService.getAllSuggestions();
            setSuggestions(data);
            setError('');
        } catch (err) {
            console.error('Error loading:', err);
            setError(err instanceof Error ? err.message : 'No se pudieron cargar las sugerencias');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSuggestions();
    }, [loadSuggestions]);

    const handleUpdate = useCallback(async (id: string, status: string, comment?: string) => {
        await suggestionService.updateStatus(id, status, comment);
        // Update local state immediately to reflect the change
        setSuggestions(prev => prev.map(item =>
            item.id === id ? { ...item, estado: status as any, comentario_admin: comment } : item
        ));
        // Also reload from server to be sure
        loadSuggestions();
    }, [loadSuggestions]);

    const filtered = suggestions.filter(item => {
        const tipoCS = item.tipo?.toLowerCase() || '';
        const isReclamo = tipoCS.includes('reclamo') || tipoCS.includes('escuchamos');

        if (filterType === 'Reporte de situación' && isReclamo) return false;
        if (filterType === 'Te escuchamos' && !isReclamo) return false;

        if (filterStatus !== 'Todas' && item.estado?.toLowerCase() !== filterStatus.toLowerCase()) return false;

        return true;
    });

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-aquanqa-dark">Reportes y Consultas</h1>
                <p className="text-gray-500">Buzón de entrada de comentarios de empleados</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
                <div className="flex items-center space-x-2 text-slate-400">
                    <Filter size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Filtrar por:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {['Todos', 'Reporte de situación', 'Te escuchamos'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${filterType === type
                                ? 'bg-aquanqa-blue text-white shadow-lg shadow-blue-200 ring-2 ring-aquanqa-blue/20'
                                : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-100 mx-2 hidden md:block"></div>

                <div className="flex items-center space-x-3">
                    <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Estado:</span>
                    <div className="flex flex-wrap items-center gap-3">
                        {['Todas', 'Pendiente', 'Revisada'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${filterStatus === status
                                    ? 'bg-aquanqa-dark text-white shadow-lg shadow-slate-200 ring-2 ring-slate-200'
                                    : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p className="font-bold">Cargando datos...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 flex flex-col items-center justify-center text-red-400">
                        <p className="font-bold">{error}</p>
                        <button onClick={loadSuggestions} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Reintentar</button>
                    </div>
                ) : (
                    <>
                        {filtered.map(item => (
                            <div key={item.id} className={`bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all relative group ${((item.tipo?.toLowerCase() || '').includes('reclamo') || (item.tipo?.toLowerCase() || '').includes('escuchamos'))
                                ? 'border-l-4 border-l-aquanqa-orange'
                                : 'border-l-4 border-l-aquanqa-blue'
                                }`}>

                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{item.titulo}</h3>
                                            {(() => {
                                                const tipoCS = item.tipo?.toLowerCase() || '';
                                                const isReclamo = tipoCS.includes('reclamo') || tipoCS.includes('escuchamos');

                                                return (
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center ${isReclamo ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {isReclamo ? <AlertTriangle size={12} className="mr-1" /> : <MessageSquare size={12} className="mr-1" />}
                                                        {isReclamo ? 'Te escuchamos' : 'Reporte de situación'}
                                                    </span>
                                                );
                                            })()}
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                                {item.area_nombre || 'General'}
                                            </span>
                                            {item.estado && (
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${item.estado === 'pendiente' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {item.estado}
                                                </span>
                                            )}

                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{item.descripcion}</p>

                                        <div className="flex items-center text-sm text-gray-500 font-medium">
                                            <span>Enviado por {item.usuario_nombre || item.user?.nombre || `Usuario ${item.usuario_id}`}</span>
                                            <span className="mx-2">•</span>
                                            <span className="capitalize">{(() => {
                                                try {
                                                    return item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Fecha no disp.';
                                                } catch (e) {
                                                    return 'Fecha inválida';
                                                }
                                            })()}</span>
                                        </div>
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
                                No se encontraron sugerencias con estos filtros.
                            </div>
                        )}
                    </>
                )}
            </div>

            <DetailsModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                data={selectedItem as any}
                title={(selectedItem?.tipo?.toLowerCase() || '').includes('reclamo') || (selectedItem?.tipo?.toLowerCase() || '').includes('escuchamos') ? 'Detalle de Te escuchamos' : 'Detalle de Reporte de situación'}
                onUpdate={handleUpdate}
            />
        </Layout>
    );
};
