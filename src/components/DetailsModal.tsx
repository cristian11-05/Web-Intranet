import { useState, useEffect, useRef } from 'react';
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

    const lastUpdatedId = useRef<string | null>(null);

    const isJustification = !data?.tipo; // If no 'tipo', it's a justification
    const tipoLower = data?.tipo?.toLowerCase() || '';
    const isReclamo = tipoLower.includes('reclamo') || tipoLower.includes('escuchamos');
    const isReporte = !!(data?.tipo && !isReclamo);

    // Auto-mark as reviewed when opening a pending suggestion/report
    useEffect(() => {
        const autoMarkAsReviewed = async () => {
            if (isOpen && data?.id && data.estado === 'pendiente' && !isJustification && onUpdate) {
                if (lastUpdatedId.current === data.id) return;

                try {
                    lastUpdatedId.current = data.id;
                    await onUpdate(data.id, 'revisada');
                } catch (error) {
                    console.error('Error in auto-marking as reviewed:', error);
                    lastUpdatedId.current = null; // Reset on error to allow retry
                }
            }
        };

        if (!isOpen) {
            lastUpdatedId.current = null;
        }

        autoMarkAsReviewed();
    }, [isOpen, data?.id, data?.estado, isJustification, onUpdate]);

    if (!isOpen || !data) return null;

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] border border-slate-100 relative">
                    {/* Header with Background Gradient */}
                    <div className="h-24 bg-gradient-to-br from-aquanqa-blue/5 via-white to-aquanqa-green/5 absolute top-0 left-0 w-full -z-10"></div>

                    <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50 relative shrink-0">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar modal"
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar relative">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{data?.titulo}</h2>
                                <p className="text-sm text-gray-400 font-medium">{formatDate(data?.fecha_evento || data?.fecha_creacion)}</p>
                            </div>
                            {data?.estado && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${data.estado.toLowerCase()?.includes('aprobada') || data.estado.toLowerCase() === 'aprobado' ? 'bg-green-100 text-green-700' :
                                    data.estado.toLowerCase()?.includes('rechazada') || data.estado.toLowerCase() === 'rechazado' ? 'bg-red-100 text-red-700' :
                                        data.estado.toLowerCase()?.includes('revisada') ? 'bg-blue-100 text-blue-700' :
                                            data.estado.toLowerCase()?.includes('proceso') ? 'bg-purple-100 text-purple-700' :
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
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowCommentInput(false)}
                                        className="px-5 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleSubmit(actionType!)}
                                        disabled={(actionType === 'rechazado' && !actionComment.trim()) || isSubmitting}
                                        className="px-8 py-2.5 bg-aquanqa-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-aquanqa-dark hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-blue-100 flex items-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={16} />
                                                Procesando...
                                            </>
                                        ) : 'Confirmar Acción'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center bg-slate-50/50 -mx-8 -mb-8 p-8 border-t border-slate-100">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Acciones Administrativas</span>
                                <div className="flex space-x-3">
                                    {onUpdate && isJustification ? (
                                        // Actions for Justifications
                                        <>
                                            {data?.estado !== 'aprobado' && (
                                                <button
                                                    onClick={() => handleActionClick('aprobado')}
                                                    disabled={isSubmitting}
                                                    className="flex items-center px-5 py-2.5 bg-aquanqa-green text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 shadow-md shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting && actionType === 'aprobado' ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CheckCircle size={16} className="mr-2" />}
                                                    {isSubmitting && actionType === 'aprobado' ? 'Procesando...' : 'Aprobar'}
                                                </button>
                                            )}
                                            {data?.estado !== 'rechazado' && (
                                                <button
                                                    onClick={() => handleActionClick('rechazado', true)}
                                                    disabled={isSubmitting}
                                                    className="flex items-center px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 shadow-md shadow-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting && actionType === 'rechazado' ? <Loader2 size={16} className="mr-2 animate-spin" /> : <XCircle size={16} className="mr-2" />}
                                                    {isSubmitting && actionType === 'rechazado' ? 'Procesando...' : 'Rechazar'}
                                                </button>
                                            )}
                                        </>
                                    ) : onUpdate ? (
                                        // Auto-reviewed view for Suggestions (Te escuchamos / Reportes)
                                        <div className="flex items-center space-x-3 text-aquanqa-green font-black text-[10px] uppercase tracking-widest bg-aquanqa-green/10 px-5 py-2.5 rounded-xl border border-aquanqa-green/10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="w-2 h-2 rounded-full bg-aquanqa-green animate-pulse"></div>
                                            <span>{data?.estado === 'revisada' ? 'Revisada Correctamente' : 'Sincronizando Estado...'}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
                                        >
                                            Cerrar Ventana
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
