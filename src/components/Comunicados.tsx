import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { MessageSquare, Plus, Image as ImageIcon, Calendar, Edit2, Trash2 } from 'lucide-react';
import { ComunicadoModal } from './ComunicadoModal';
import { comunicadoService, Comunicado } from '../services/comunicado.service';
import { toast } from 'sonner';

export const Comunicados = () => {
    const [comunicados, setComunicados] = useState<Comunicado[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComunicado, setSelectedComunicado] = useState<Comunicado | null>(null);

    useEffect(() => {
        loadComunicados();
    }, []);

    const loadComunicados = async () => {
        try {
            setLoading(true);
            const data = await comunicadoService.getAll();
            setComunicados(data || []);
        } catch (error) {
            console.error('Error loading comunicados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (comunicadoData: Partial<{ titulo: string; contenido: string; imagen?: string }>) => {
        try {
            setIsSaving(true);
            if (selectedComunicado) {
                // Update
                // Note: The modal returns { titulo, contenido, imagen }. Backend expects 'imagen' with base64/url if changed.
                await comunicadoService.update(selectedComunicado.id, {
                    titulo: comunicadoData.titulo,
                    contenido: comunicadoData.contenido,
                    imagen: comunicadoData.imagen // Send base64 if updated
                });
            } else {
                // Create
                await comunicadoService.create({
                    titulo: comunicadoData.titulo || '',
                    contenido: comunicadoData.contenido || '',
                    imagen: comunicadoData.imagen
                });
            }
            loadComunicados();
            setIsModalOpen(false);
            setSelectedComunicado(null);
            toast.success(selectedComunicado ? 'Comunicado actualizado' : 'Comunicado publicado exitosamente');
        } catch (error) {
            // Error handled by global interceptor
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        toast.confirm('¿Estás seguro de eliminar este comunicado?', {
            onConfirm: async () => {
                toast.promise(comunicadoService.delete(id), {
                    loading: 'Eliminando comunicado...',
                    success: () => {
                        loadComunicados();
                        return 'Comunicado eliminado correctamente';
                    },
                    error: 'Error al eliminar el comunicado'
                });
            }
        });
    };

    const openEdit = (comunicado: Comunicado) => {
        setSelectedComunicado(comunicado);
        setIsModalOpen(true);
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <MessageSquare className="text-aquanqa-blue" size={28} />
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Comunicados</h1>
                    </div>
                    <p className="text-slate-500 font-medium tracking-tight">Publica anuncios y comunicaciones para todos los trabajadores</p>
                </div>
                <button
                    onClick={() => { setSelectedComunicado(null); setIsModalOpen(true); }}
                    className="flex items-center space-x-3 px-8 py-3 bg-aquanqa-blue text-white rounded-2xl hover:bg-aquanqa-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-200/50 transition-all active:scale-95 font-black text-xs uppercase tracking-[0.1em]"
                >
                    <Plus size={20} />
                    <span>Nuevo Comunicado</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center text-slate-400">
                        <p>Cargando comunicados...</p>
                    </div>
                ) : comunicados.map((comunicado) => (
                    <div
                        key={comunicado.id}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                        {comunicado.imagen_url && (
                            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                <img
                                    src={comunicado.imagen_url}
                                    alt={comunicado.titulo}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-600 flex items-center space-x-1">
                                    <ImageIcon size={12} />
                                    <span>IMG</span>
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight line-clamp-2 group-hover:text-aquanqa-blue transition-colors">
                                    {comunicado.titulo}
                                </h3>
                            </div>

                            <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                                {comunicado.contenido}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex flex-col text-xs text-slate-400">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Calendar size={12} />
                                        <span className="font-bold">
                                            {comunicado.fecha_publicacion ? new Date(comunicado.fecha_publicacion).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-aquanqa-blue">
                                        {comunicado.autor?.nombre || 'Admin'}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => openEdit(comunicado)}
                                        className="p-2.5 text-slate-300 hover:text-aquanqa-blue hover:bg-white hover:shadow-lg hover:border-slate-100 border border-transparent rounded-xl transition-all active:scale-90"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comunicado.id)}
                                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-white hover:shadow-lg hover:border-slate-100 border border-transparent rounded-xl transition-all active:scale-90"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && comunicados.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-slate-400 space-y-6">
                    <MessageSquare size={80} className="text-slate-100" />
                    <div className="text-center">
                        <p className="font-black text-slate-700 text-2xl tracking-tight">No hay comunicados</p>
                        <p className="text-slate-400 font-bold mt-1">Crea el primer comunicado para tus trabajadores</p>
                    </div>
                </div>
            )}

            <ComunicadoModal
                isOpen={isModalOpen}
                onClose={() => { if (!isSaving) { setIsModalOpen(false); setSelectedComunicado(null); } }}
                onSave={handleSave}
                isSubmitting={isSaving}
                comunicado={selectedComunicado ? {
                    titulo: selectedComunicado.titulo,
                    contenido: selectedComunicado.contenido,
                    imagen: selectedComunicado.imagen_url
                } : null}
            />
        </Layout>
    );
};
