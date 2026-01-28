import { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Image as ImageIcon, FileText, Upload } from 'lucide-react';

interface ComunicadoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (comunicado: Partial<{ titulo: string; contenido: string; imagen?: string }>) => void;
    comunicado?: { titulo: string; contenido: string; imagen?: string } | null;
}

export const ComunicadoModal = ({ isOpen, onClose, onSave, comunicado }: ComunicadoModalProps) => {
    const [formData, setFormData] = useState({
        titulo: '',
        contenido: '',
        imagen: '',
    });

    useEffect(() => {
        if (comunicado) {
            setFormData({
                titulo: comunicado.titulo,
                contenido: comunicado.contenido,
                imagen: comunicado.imagen || ''
            });
        } else {
            setFormData({ titulo: '', contenido: '', imagen: '' });
        }
    }, [comunicado, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validación de tamaño (Máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es muy pesada. El tamaño máximo es 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imagen: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-aquanqa-dark text-white p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-700 rounded-lg">
                            <MessageSquare size={24} className="text-aquanqa-green" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{comunicado ? 'Editar Comunicado' : 'Nuevo Comunicado'}</h3>
                            <p className="text-slate-400 text-xs">Crea anuncios visibles para todos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        title="Cerrar"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 flex items-center">
                                <FileText size={12} className="mr-1" /> TÍTULO DEL COMUNICADO
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                placeholder="Ej. Reunión General de Equipo"
                                className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-3 px-4 focus:border-aquanqa-blue outline-none transition-colors text-base font-bold rounded-t-lg"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 flex items-center">
                                <MessageSquare size={12} className="mr-1" /> CONTENIDO / MENSAJE
                            </label>
                            <textarea
                                required
                                rows={6}
                                value={formData.contenido}
                                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                                placeholder="Escribe aquí el mensaje del comunicado..."
                                className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-3 px-4 focus:border-aquanqa-blue outline-none transition-colors text-sm resize-none rounded-t-lg"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 flex items-center">
                                <ImageIcon size={12} className="mr-1" /> IMAGEN (OPCIONAL)
                            </label>

                            {formData.imagen ? (
                                <div className="relative">
                                    <img
                                        src={formData.imagen}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-xl border-2 border-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, imagen: '' })}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                                        title="Eliminar imagen"
                                        aria-label="Eliminar imagen"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-aquanqa-blue hover:bg-blue-50/20 transition-all group">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Upload className="text-slate-300 group-hover:text-aquanqa-blue transition-colors" size={40} />
                                        <p className="text-sm font-bold text-slate-400 group-hover:text-aquanqa-blue transition-colors">
                                            Click para subir imagen
                                        </p>
                                        <p className="text-xs text-slate-300">JPG, PNG o GIF</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 flex space-x-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-bold text-sm"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-aquanqa-blue text-white rounded-xl hover:bg-opacity-90 transition shadow-lg shadow-blue-200 font-bold text-sm flex items-center"
                        >
                            <Save size={18} className="mr-2" />
                            {comunicado ? 'ACTUALIZAR' : 'PUBLICAR COMUNICADO'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
