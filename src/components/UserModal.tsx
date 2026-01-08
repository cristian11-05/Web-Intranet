import { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Mail, Shield, Building, ToggleLeft } from 'lucide-react';
import { User, MOCK_AREAS } from '../data/mockData';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    user?: User | null;
}

export const UserModal = ({ isOpen, onClose, onSave, user }: UserModalProps) => {
    const [formData, setFormData] = useState<Partial<User>>({
        nombre: '',
        email: '',
        rol: 'empleado',
        area_id: '1',
        estado: 'Activo',
        documento: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(user);
        } else {
            setFormData({
                nombre: '',
                email: '',
                rol: 'empleado',
                area_id: '1',
                estado: 'Activo',
                documento: '',
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-aquanqa-dark text-white p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-700 rounded-lg">
                            <UserIcon size={24} className="text-aquanqa-green" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{user ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h3>
                            <p className="text-slate-400 text-xs">Completa los datos del perfil</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        title="Cerrar modal"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Datos Personales */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Información Personal</h4>

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
                                    <Mail size={12} className="mr-1" /> CORREO ELECTRÓNICO
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="correo@aquanqa.com"
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
                                    value={formData.documento}
                                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                                    placeholder="00000000"
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none transition-colors text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Configuración de Sistema */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Configuración de Sistema</h4>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center">
                                    <Building size={12} className="mr-1" /> ÁREA / DEPARTAMENTO
                                </label>
                                <select
                                    name="area_id"
                                    value={formData.area_id}
                                    onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none bg-transparent text-sm font-medium"
                                    title="Seleccionar área"
                                >
                                    {MOCK_AREAS.map(area => (
                                        <option key={area.id} value={area.id}>{area.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center">
                                    <Shield size={12} className="mr-1" /> ROL DE ACCESO
                                </label>
                                <select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none bg-transparent text-sm font-medium"
                                    title="Seleccionar rol"
                                >
                                    <option value="empleado">Empleado</option>
                                    <option value="gestor">Gestor</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center">
                                    <ToggleLeft size={12} className="mr-1" /> ESTADO ACTUAL
                                </label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-2 focus:border-aquanqa-blue outline-none bg-transparent text-sm font-medium"
                                    title="Seleccionar estado"
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="SIN CONTRATO">Sin Contrato</option>
                                </select>
                            </div>
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
                            {user ? 'ACTUALIZAR' : 'GUARDAR TRABAJADOR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
