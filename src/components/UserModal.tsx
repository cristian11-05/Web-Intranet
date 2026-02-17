import { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Shield, ToggleLeft, Layers } from 'lucide-react';
import { User, MOCK_AREAS } from '../data/mockData';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    user?: User | null;
    isSubmitting?: boolean;
}

export const UserModal = ({ isOpen, onClose, onSave, user, isSubmitting }: UserModalProps) => {
    const [formData, setFormData] = useState<Partial<User>>({
        nombre: '',
        rol: 'obrero',
        estado: 'Activo',
        documento: '',
        empresa: 'AQUANQA I',
        area_id: '1',
    });

    useEffect(() => {
        if (user) {
            setFormData(user);
        } else {
            setFormData({
                nombre: '',
                rol: 'obrero',
                estado: 'Activo',
                documento: '',
                empresa: 'AQUANQA I',
                area_id: '1',
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 relative">
                {/* Header with Background Gradient */}
                <div className="h-24 bg-gradient-to-br from-aquanqa-blue/5 via-white to-aquanqa-green/5 absolute top-0 left-0 w-full -z-10"></div>

                <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50 relative">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-aquanqa-blue/10 rounded-2xl">
                            <UserIcon size={24} className="text-aquanqa-blue" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">{user ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Completa los datos del perfil del colaborador</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
                        title="Cerrar modal"
                        aria-label="Cerrar modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Datos Personales */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Información Personal</h4>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center uppercase tracking-widest">
                                    <Shield size={12} className="mr-1" /> Empresa / Sede
                                </label>
                                <select
                                    required
                                    value={formData.empresa}
                                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value as User['empresa'] })}
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none bg-transparent text-sm font-medium"
                                    title="Seleccionar empresa"
                                >
                                    <option value="AQUANQA I">AQUANQA I</option>
                                    <option value="AQUANQA II">AQUANQA II</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center">
                                    <UserIcon size={12} className="mr-1" /> NOMBRE COMPLETO
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none transition-colors text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center">
                                    NRO. DOCUMENTO (DNI)
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={8}
                                    pattern="[0-9]{8}"
                                    value={formData.documento}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                        setFormData({ ...formData, documento: value });
                                    }}
                                    placeholder="00000000"
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none transition-colors text-sm font-medium"
                                    title="Ingrese exactamente 8 dígitos"
                                />
                            </div>
                        </div>

                        {/* Configuración de Sistema */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Configuración de Sistema</h4>



                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center">
                                    <Shield size={12} className="mr-1" /> TIPO DE CONTRATO
                                </label>
                                <select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as User['rol'] })}
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none bg-transparent text-sm font-medium"
                                    title="Seleccionar tipo de contrato"
                                >
                                    <option value="obrero">Obrero</option>
                                    <option value="trabajador">Trabajador</option>
                                    <option value="empleado">Empleado</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center">
                                    <Layers size={12} className="mr-1" /> ÁREA ASIGNADA
                                </label>
                                <select
                                    required
                                    value={formData.area_id || ''}
                                    onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none bg-transparent text-sm font-medium"
                                    title="Seleccionar área"
                                >
                                    <option value="" disabled>Seleccione un área</option>
                                    {MOCK_AREAS.map(area => (
                                        <option key={area.id} value={area.id}>{area.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center">
                                    <ToggleLeft size={12} className="mr-1" /> ESTADO ACTUAL
                                </label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as User['estado'] })}
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none bg-transparent text-sm font-medium"
                                    title="Seleccionar estado"
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="SIN CONTRATO">Sin Contrato</option>
                                </select>
                            </div>
                        </div >
                    </div >

                    <div className="mt-10 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-end items-center bg-slate-50/50 -mx-8 -mb-8 p-8 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95 text-center"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3 bg-aquanqa-blue text-white rounded-2xl hover:bg-aquanqa-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-200/50 transition-all active:scale-95 font-black text-xs uppercase tracking-[0.1em] flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Shield size={18} className="mr-2 animate-pulse" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    <span>{user ? 'Actualizar Trabajador' : 'Guardar Nuevo Perfil'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
};
