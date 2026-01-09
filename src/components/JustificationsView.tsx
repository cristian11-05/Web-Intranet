import { useState, useEffect } from 'react';
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

    useEffect(() => {
        loadJustifications();
    }, []);

    const loadJustifications = async () => {
        try {
            setLoading(true);
            const data = await justificationService.getAllJustifications();
            setJustifications(data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar las justificaciones');
        } finally {
            setLoading(false);
        }
    };

    const filtered = justifications.filter(item => {
        if (filterArea !== 'Todas' && item.area_nombre !== filterArea) return false;
        if (filterStatus !== 'Todas' && item.estado !== filterStatus.toLowerCase()) return false;
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
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterStatus === status
                            ? 'bg-aquanqa-dark text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {status}
                    </button>
                ))}

                <div className="w-px h-6 bg-gray-300 mx-2 hidden md:block"></div>

                <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm font-medium">Área:</span>
                    {['Todas', 'Recursos Humanos', 'Tecnología', 'Operaciones'].map(area => (
                        <button
                            key={area}
                            onClick={() => setFilterArea(area)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterArea === area
                                ? 'bg-aquanqa-dark text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.estado === 'pendiente' ? 'bg-orange-100 text-orange-700' :
                                        item.estado === 'aprobado' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {item.estado}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.titulo} - {item.fecha_evento}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-1">{item.descripcion}</p>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center space-x-4">
                                        <span className="font-medium text-aquanqa-dark">{item.usuario_nombre}</span>
                                        <span>•</span>
                                        <span>{item.fecha_evento}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="absolute bottom-6 right-6 text-aquanqa-blue hover:text-aquanqa-dark font-medium text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Ver Detalle <ChevronRight size={16} />
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
                data={selectedItem}
                title="Detalle de Justificación"
            />
        </Layout>
    );
};
