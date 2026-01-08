import { useState } from 'react';
import { Layout } from './Layout';
import { MOCK_SUGGESTIONS, Suggestion } from '../data/mockData';
import { Filter, ChevronRight, MessageSquare, AlertTriangle } from 'lucide-react';
import { DetailsModal } from './DetailsModal';

export const SuggestionsList = () => {
    const [filterType, setFilterType] = useState('Todos');
    const [selectedItem, setSelectedItem] = useState<Suggestion | null>(null);

    const filtered = MOCK_SUGGESTIONS.filter(item => {
        if (filterType === 'Todos') return true;
        if (filterType === 'Sugerencias' && item.tipo !== 'sugerencia') return false;
        if (filterType === 'Reclamos' && item.tipo !== 'reclamo') return false;
        return true;
    });

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-aquanqa-dark">Sugerencias y Reclamos</h1>
                <p className="text-gray-500">Buzón de entrada de comentarios de empleados</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-500">
                    <Filter size={18} />
                    <span className="font-medium">Filtrar por:</span>
                </div>

                {['Todos', 'Sugerencias', 'Reclamos'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterType === type
                            ? 'bg-aquanqa-dark text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {filtered.map(item => (
                    <div key={item.id} className={`bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all relative group ${item.tipo === 'reclamo' ? 'border-l-4 border-l-aquanqa-orange' : 'border-l-4 border-l-aquanqa-blue'
                        }`}>

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{item.titulo}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center ${item.tipo === 'reclamo' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {item.tipo === 'reclamo' ? <AlertTriangle size={12} className="mr-1" /> : <MessageSquare size={12} className="mr-1" />}
                                        {item.tipo}
                                    </span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                        {item.area_id === '1' ? 'Recursos Humanos' : item.area_id === '2' ? 'Tecnología' : 'Operaciones'}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{item.descripcion}</p>

                                <div className="flex items-center text-sm text-gray-400">
                                    <span>Usuario ID: {item.usuario_id}</span>
                                    <span className="mx-2">•</span>
                                    <span>{item.fecha_creacion}</span>
                                </div>
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
            </div>

            <DetailsModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                data={selectedItem}
                title={selectedItem?.tipo === 'reclamo' ? 'Detalle de Reclamo' : 'Detalle de Sugerencia'}
            />
        </Layout>
    );
};
