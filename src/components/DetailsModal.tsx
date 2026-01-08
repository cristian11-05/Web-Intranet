import { X } from 'lucide-react';

// Simplified interface for data used in the modal to avoid assignment errors
interface DetailsData {
    id?: string;
    titulo?: string;
    descripcion?: string;
    fecha_creacion?: string;
    fecha_evento?: string;
    estado?: string;
    usuario_id?: string;
    usuario_nombre?: string;
    area_id?: string;
    area_nombre?: string;
    adjuntos?: any[];
    adjunto_url?: string;
    razon_rechazo?: string;
    tipo?: string;
}

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DetailsData | null;
    title: string;
}

export const DetailsModal = ({ isOpen, onClose, data, title }: DetailsModalProps) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-aquanqa-dark text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{data?.titulo}</h2>
                            <p className="text-sm text-gray-500">{data?.fecha_evento || data?.fecha_creacion}</p>
                        </div>
                        {data?.estado && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${data.estado === 'pendiente' ? 'bg-orange-100 text-orange-700' :
                                data.estado === 'aprobado' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {data.estado}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Descripción</label>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {data?.descripcion}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Usuario</label>
                            <p className="text-sm font-medium text-aquanqa-dark flex items-center">
                                <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs">U</span>
                                {data?.usuario_nombre || (data?.usuario_id ? `User ${data.usuario_id}` : 'Desconocido')}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Área</label>
                            <span className="bg-blue-50 text-aquanqa-blue px-2 py-1 rounded text-xs font-bold">
                                {data?.area_nombre || (data?.area_id === '1' ? 'Recursos Humanos' : data?.area_id === '2' ? 'Tecnología' : 'Operaciones')}
                            </span>
                        </div>
                    </div>

                    {data?.adjunto_url && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Comprobante Adjunto</label>
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex justify-center">
                                <img
                                    src={data.adjunto_url}
                                    alt="Comprobante"
                                    className="max-h-64 object-contain"
                                />
                            </div>
                            <a href={data.adjunto_url} target="_blank" rel="noopener noreferrer" className="text-xs text-aquanqa-blue hover:underline mt-1 block text-right">Ver imagen completa</a>
                        </div>
                    )}

                    {data?.razon_rechazo && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <label className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">Motivo de Rechazo</label>
                            <p className="text-sm text-red-700">{data.razon_rechazo}</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium text-sm">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
