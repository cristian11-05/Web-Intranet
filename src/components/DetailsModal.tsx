import { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, Plus, Loader2 } from 'lucide-react';

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
    comentario_admin?: string;
    tipo?: string; // 'sugerencia', 'reclamo' or undefined for justifications
}

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DetailsData | null;
    title: string;
    onUpdate?: (id: string, status: string, commentOrReason?: string) => Promise<void>;
}

export const DetailsModal = ({ isOpen, onClose, data, title, onUpdate }: DetailsModalProps) => {
    const [actionComment, setActionComment] = useState('');
    const [actionType, setActionType] = useState<string | null>(null);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !data) return null;

    const isJustification = !data.tipo; // If no 'tipo', it's a justification

    const handleActionClick = (status: string, requiresInput: boolean = false) => {
        setActionType(status);
        if (requiresInput) {
            setActionComment('');
            setShowCommentInput(true);
        } else {
            handleSubmit(status);
        }
    };

    const handleSubmit = async (status: string) => {
        try {
            setIsSubmitting(true);
            if (onUpdate && data.id) {
                await onUpdate(data.id, status, actionComment);
            }
            setShowCommentInput(false);
            setActionType(null);
            onClose();
        } catch (error: any) {
            console.error('Action error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            // Show more detailed error message if available
            const errorDetail = error.response?.data?.message || error.message || 'Error desconocido';
            alert(`Error al procesar la acción: ${errorDetail}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper for date formatting
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Fecha no disponible';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Flexible attachment resolution
    const rawAdjuntos = data.adjuntos || (data as any).imagenes || (data as any).evidencias || [];
    const attachments = (Array.isArray(rawAdjuntos) && rawAdjuntos.length > 0)
        ? rawAdjuntos
        : (data.adjunto_url ? [{ ruta_archivo: data.adjunto_url }] : []);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                    <div className="bg-aquanqa-dark text-white p-4 flex justify-between items-center shrink-0">
                        <h3 className="text-lg font-bold">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar modal"
                            className="hover:bg-slate-700 p-1 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{data?.titulo}</h2>
                                <p className="text-sm text-gray-400 font-medium">{formatDate(data?.fecha_evento || data?.fecha_creacion)}</p>
                            </div>
                            {data?.estado && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${data.estado.toLowerCase().includes('aprobada') || data.estado.toLowerCase() === 'aprobado' ? 'bg-green-100 text-green-700' :
                                    data.estado.toLowerCase().includes('rechazada') || data.estado.toLowerCase() === 'rechazado' ? 'bg-red-100 text-red-700' :
                                        data.estado.toLowerCase().includes('revisada') ? 'bg-blue-100 text-blue-700' :
                                            data.estado.toLowerCase().includes('proceso') ? 'bg-purple-100 text-purple-700' :
                                                'bg-orange-100 text-orange-700'
                                    }`}>
                                    {data.estado}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Descripción</label>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {data?.descripcion}
                            </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Usuario</label>
                                <p className="text-sm font-bold text-aquanqa-dark flex items-center">
                                    <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mr-2 text-xs font-bold text-slate-500">
                                        {(data?.usuario_nombre || 'U')[0]}
                                    </span>
                                    {data?.usuario_nombre || (data?.usuario_id ? `User ${data.usuario_id}` : 'Desconocido')}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Área</label>
                                <span className="inline-block bg-blue-50 text-aquanqa-blue px-2 py-1 rounded text-xs font-bold mt-1">
                                    {data?.area_nombre || (data?.area_id === '1' ? 'Remuneraciones' : data?.area_id === '2' ? 'Bienestar Social' : data?.area_id === '3' ? 'ADP' : 'Transportes')}
                                </span>
                            </div>
                        </div>

                        {/* Attachments Section */}
                        {attachments.length > 0 && (
                            <div className="pt-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Imágenes Adjuntas ({attachments.length})</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {attachments.map((adj, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer hover:border-aquanqa-blue transition-all"
                                            onClick={() => setSelectedImage(adj.ruta_archivo || adj.url || adj.path || adj)}
                                        >
                                            <img
                                                src={adj.ruta_archivo || adj.url || adj.path || adj}
                                                alt={`Adjunto ${idx + 1}`}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                                                <Plus className="text-white opacity-0 group-hover:opacity-100" size={20} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Reason/Comment Display */}
                        {data?.razon_rechazo && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <label className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">Motivo de Rechazo</label>
                                <p className="text-sm text-red-700 font-medium">{data.razon_rechazo}</p>
                            </div>
                        )}
                        {data?.comentario_admin && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Comentario Administrador</label>
                                <p className="text-sm text-blue-700 italic">"{data.comentario_admin}"</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-4 border-t border-gray-100 bg-gray-100 shrink-0">
                        {showCommentInput ? (
                            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                                <label className="text-sm font-bold text-gray-700">
                                    {actionType === 'rechazado' ? 'Motivo del rechazo (Obligatorio)' : 'Agregar un comentario (Opcional)'}
                                </label>
                                <textarea
                                    value={actionComment}
                                    onChange={(e) => setActionComment(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-aquanqa-blue outline-none transition-all shadow-inner"
                                    rows={3}
                                    placeholder={actionType === 'rechazado' ? 'Explica por qué se rechaza...' : 'Escribe un comentario...'}
                                    autoFocus
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setShowCommentInput(false)}
                                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleSubmit(actionType!)}
                                        disabled={(actionType === 'rechazado' && !actionComment.trim()) || isSubmitting}
                                        className="px-6 py-2 bg-aquanqa-dark text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={14} />
                                                Procesando...
                                            </>
                                        ) : 'Confirmar Acción'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Acciones</span>
                                <div className="flex space-x-2">
                                    {onUpdate && isJustification ? (
                                        // Actions for Justifications
                                        <>
                                            {data?.estado !== 'aprobado' && (
                                                <button onClick={() => handleActionClick('aprobado')} className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm">
                                                    <CheckCircle size={14} className="mr-1" /> Aprobar
                                                </button>
                                            )}
                                            {data?.estado !== 'rechazado' && (
                                                <button onClick={() => handleActionClick('rechazado', true)} className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition shadow-sm">
                                                    <XCircle size={14} className="mr-1" /> Rechazar
                                                </button>
                                            )}
                                            {data?.estado !== 'en_proceso' && data?.estado !== 'aprobado' && data?.estado !== 'rechazado' && (
                                                <button onClick={() => handleActionClick('en_proceso')} className="flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition shadow-sm">
                                                    <Clock size={14} className="mr-1" /> En Proceso
                                                </button>
                                            )}
                                        </>
                                    ) : onUpdate ? (
                                        // Simplified Actions for Suggestions (Te escuchamos / Reportes)
                                        <>
                                            {data?.estado === 'pendiente' ? (
                                                <button
                                                    onClick={() => handleActionClick('revisada', true)}
                                                    className="flex items-center px-5 py-2.5 bg-aquanqa-blue text-white rounded-lg text-sm font-bold hover:bg-opacity-90 hover:scale-105 active:scale-95 transition-all shadow-md"
                                                >
                                                    <CheckCircle size={18} className="mr-2" /> Marcar como revisada
                                                </button>
                                            ) : (
                                                <div className="flex items-center space-x-2 text-green-600 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                                    <CheckCircle size={18} />
                                                    <span>Revisada</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-bold text-sm shadow-sm">
                                            Cerrar
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md p-4 animate-in fade-in duration-300 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                        onClick={() => setSelectedImage(null)}
                        aria-label="Cerrar vista previa"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Vista previa"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    />
                </div>
            )}
        </>
    );
};
