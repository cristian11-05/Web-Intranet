import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { User } from '../data/mockData';
import { Search, UserPlus, Edit2, Trash2, FileDown, UploadCloud, UserCircle, Loader2, Trash } from 'lucide-react';
import { UserModal } from './UserModal';
import { userService } from '../services/user.service';
import * as XLSX from 'xlsx';

const normalizeHeader = (header: string) => {
    return header.toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_');
};

export const UserMaster = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDoc, setFilterDoc] = useState('');
    const [filterName, setFilterName] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Bulk Delete State
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [pendingDnis, setPendingDnis] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<'inactivate' | 'delete'>('inactivate');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError('No se pudieron cargar los usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Búsqueda Global + Filtros Específicos
    const filteredUsers = users.filter(user => {
        const globalSearch = searchTerm.toLowerCase();
        const matchesGlobal = (user.nombre?.toLowerCase().includes(globalSearch)) ||
            (user.documento && user.documento.includes(globalSearch)) ||
            (user.email?.toLowerCase().includes(globalSearch));

        const matchesDoc = !filterDoc || (user.documento && user.documento.includes(filterDoc));
        const matchesName = !filterName || (user.nombre && user.nombre.toLowerCase().includes(filterName.toLowerCase()));

        return matchesGlobal && matchesDoc && matchesName;
    });

    const handleSave = async (userData: Partial<User>) => {
        try {
            if (selectedUser) {
                // Update existing user
                const updatedUser = await userService.updateUser(selectedUser.id, userData);
                setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...updatedUser } : u));
            } else {
                // New
                const newUser = await userService.createUser(userData);
                setUsers(prev => [newUser, ...prev]);
            }
            // Still reload from server to be 100% in sync, but UI already updated
            loadUsers();
            setIsModalOpen(false);
            setSelectedUser(null);
        } catch (err: any) {
            alert(err.message || 'Error al guardar el usuario');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar a este trabajador?')) {
            try {
                await userService.deleteUser(id);
                setUsers(users.filter(u => u.id !== id));
            } catch (err) {
                alert('Error al eliminar el usuario');
            }
        }
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const result = await userService.importUsers(file);
            alert(`Carga completada: ${result.success} procesados exitosamente.`);
            if (result.errors && result.errors.length > 0) {
                console.warn('Errores en importación:', result.errors);
                alert(`Hubo errores en ${result.errors.length} filas. Revisa la consola.`);
            }
            loadUsers();
        } catch (err: any) {
            console.error('Error in bulk upload:', err);
            alert('Error al procesar la carga masiva: ' + err.message);
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const handleBulkDelete = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];

                // Flexible mapping
                const rows = XLSX.utils.sheet_to_json<any>(sheet);
                if (rows.length === 0) {
                    alert('El archivo está vacío');
                    return;
                }

                // Get normalized headers from the first row keys
                const firstRow = rows[0];
                const headerMap: Record<string, string> = {};
                Object.keys(firstRow).forEach(key => {
                    headerMap[normalizeHeader(key)] = key;
                });

                const dniKey = headerMap['documento'] || headerMap['dni'] || headerMap['nro_documento'] || headerMap['nro_doc'];

                if (!dniKey) {
                    alert('No se encontró una columna de DNI o Documento. Asegúrate de que el excel tenga una columna llamada "DNI" o "Documento"');
                    return;
                }

                const dnis = rows.map(row => row[dniKey]?.toString()).filter(Boolean);

                if (dnis.length === 0) {
                    alert('No se encontraron números de documento válidos en el archivo');
                    return;
                }

                setPendingDnis(dnis);
                setIsBulkDeleteModalOpen(true);
            } catch (err: any) {
                alert('Error al leer el archivo Excel: ' + err.message);
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const confirmBulkAction = async () => {
        try {
            setLoading(true);
            setIsBulkDeleteModalOpen(false);
            const result = await userService.bulkDelete(pendingDnis, bulkAction);
            alert(`Acción completada: ${result.success} trabajadores procesados.`);
            if (result.notFound && result.notFound.length > 0) {
                console.warn('DNI no encontrados:', result.notFound);
            }
            loadUsers();
        } catch (err: any) {
            alert('Error al procesar la acción masiva: ' + err.message);
        } finally {
            setLoading(false);
            setPendingDnis([]);
        }
    };

    const downloadTemplate = (type: 'carga' | 'baja') => {
        const headers = type === 'carga'
            ? [['Nombre', 'Email', 'Documento', 'Rol', 'Estado', 'Area ID']]
            : [['Documento']];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(headers);
        XLSX.utils.book_append_sheet(wb, ws, "Formato");
        XLSX.writeFile(wb, `formato_${type}_masivo.xlsx`);
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <UserCircle className="text-aquanqa-blue" size={28} />
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Maestro de Usuarios</h1>
                    </div>
                    <p className="text-slate-500 font-medium tracking-tight">Gestiona el personal y permisos del sistema RRHH</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col">
                        <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} className="hidden" id="bulk-upload" />
                        <label htmlFor="bulk-upload" className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-bold shadow-sm text-sm cursor-pointer">
                            <UploadCloud size={18} className="text-slate-400" />
                            <span>Carga Masiva</span>
                        </label>
                        <button onClick={() => downloadTemplate('carga')} className="text-[10px] text-aquanqa-blue font-bold hover:underline mt-1 text-center">
                            Descargar Formato
                        </button>
                    </div>

                    <div className="flex flex-col">
                        <input type="file" accept=".xlsx,.xls" onChange={handleBulkDelete} className="hidden" id="bulk-delete" />
                        <label htmlFor="bulk-delete" className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-50 transition-all font-bold shadow-sm text-sm cursor-pointer">
                            <Trash size={18} className="text-rose-400" />
                            <span>Baja Masiva</span>
                        </label>
                        <button onClick={() => downloadTemplate('baja')} className="text-[10px] text-rose-500 font-bold hover:underline mt-1 text-center">
                            Descargar Formato
                        </button>
                    </div>
                    <button
                        onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-aquanqa-blue text-white rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-blue-100 font-bold text-sm"
                    >
                        <UserPlus size={18} />
                        <span>Nuevo Trabajador</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Filtros de Trabajadores</h3>
                    <button
                        type="button"
                        onClick={() => { setFilterDoc(''); setFilterName(''); setSearchTerm(''); }}
                        className="text-xs text-aquanqa-blue hover:text-aquanqa-dark transition-colors font-black uppercase tracking-wider"
                    >
                        Limpiar Filtros
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="group">
                        <label htmlFor="filterDoc" className="text-[10px] font-black text-slate-400 mb-1 block transition-colors group-focus-within:text-aquanqa-blue uppercase tracking-widest">Listado de Nro. de Documento</label>
                        <input
                            id="filterDoc"
                            type="text"
                            placeholder="Filtro nro de documento"
                            value={filterDoc}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterDoc(e.target.value)}
                            className="w-full border-b-2 border-slate-100 py-3 focus:border-aquanqa-blue outline-none text-sm font-bold transition-all placeholder:font-medium placeholder:text-slate-200"
                        />
                    </div>
                    <div className="group">
                        <label htmlFor="filterName" className="text-[10px] font-black text-slate-400 mb-1 block transition-colors group-focus-within:text-aquanqa-blue uppercase tracking-widest">Nombre Trabajador</label>
                        <input
                            id="filterName"
                            type="text"
                            placeholder="Filtro nombre de trabajador"
                            value={filterName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterName(e.target.value)}
                            className="w-full border-b-2 border-slate-100 py-3 focus:border-aquanqa-blue outline-none text-sm font-bold transition-all placeholder:font-medium placeholder:text-slate-200"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden transition-all">
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/20 gap-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-8 bg-aquanqa-green rounded-full"></div>
                        <h2 className="font-black text-slate-800 text-xl tracking-tight uppercase">Lista de Trabajadores</h2>
                    </div>
                    <div className="flex space-x-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Búsqueda rápida..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm w-full focus:ring-8 focus:ring-aquanqa-blue/5 focus:border-aquanqa-blue outline-none transition-all shadow-inner font-medium"
                            />
                        </div>
                        <button className="flex items-center justify-center space-x-3 px-7 py-4 bg-aquanqa-green text-white rounded-2xl hover:bg-opacity-90 transition-all shadow-xl shadow-green-100 font-black text-sm uppercase tracking-wider">
                            <FileDown size={20} />
                            <span className="hidden lg:inline">Exportar</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="animate-spin mb-4" size={40} />
                            <p className="font-bold">Cargando trabajadores...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 flex flex-col items-center justify-center text-red-400">
                            <p className="font-bold">{error}</p>
                            <button onClick={loadUsers} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Reintentar</button>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50/30 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b border-slate-50">
                                <tr>
                                    <th className="px-10 py-6 w-20 text-center">#</th>
                                    <th className="px-6 py-6">Documentación</th>
                                    <th className="px-6 py-6">Colaborador</th>
                                    <th className="px-6 py-6">Registro</th>
                                    <th className="px-6 py-6 text-center">Estado</th>
                                    <th className="px-10 py-6 text-right w-40">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="group hover:bg-blue-50/20 transition-all duration-300">
                                        <td className="px-10 py-7 text-center text-slate-300 font-black text-xs group-hover:text-aquanqa-blue transition-colors">{String(index + 1).padStart(2, '0')}</td>
                                        <td className="px-6 py-7">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-700 font-mono text-base tracking-tighter">{user.documento || '---'}</span>
                                                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1">DNI PERÚ</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-7">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mr-5 text-slate-400 font-black text-sm border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-aquanqa-blue/20 transition-all">
                                                    {user.nombre?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-tight group-hover:text-aquanqa-blue transition-colors">{user.nombre}</span>
                                                    <span className="text-xs text-slate-400 font-bold mt-0.5">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-7">
                                            <div className="flex flex-col">
                                                <span className="text-slate-600 font-bold text-sm tracking-tight">
                                                    {user.fecha_registro ? new Date(user.fecha_registro).toLocaleString('es-PE', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }) : '---'}
                                                </span>
                                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">ALTA SISTEMA</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-7 text-center">
                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm transform transition-all group-hover:scale-105 ${user.estado === 'Activo' ? 'bg-aquanqa-green/10 text-aquanqa-green ring-2 ring-aquanqa-green/10' :
                                                user.estado === 'Inactivo' ? 'bg-rose-50 text-rose-500 ring-2 ring-rose-100' :
                                                    'bg-slate-100 text-slate-400 ring-2 ring-slate-200'
                                                }`}>
                                                {user.estado === 'Activo' ? 'Activo' : user.estado === 'Inactivo' ? 'Inactivo' : 'S. Contrato'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => openEdit(user)} className="p-3 text-slate-300 hover:text-aquanqa-blue hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100" title="Editar Trabajador">
                                                    <Edit2 size={20} />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100" title="Eliminar Trabajador">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest gap-4">
                    <p className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-aquanqa-blue animate-pulse mr-2"></span>
                        Visualizando {filteredUsers.length} registros • Base completa: {users.length}
                    </p>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                onSave={handleSave}
                user={selectedUser}
            />

            {/* Bulk Delete Modal */}
            {isBulkDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-rose-600 text-white p-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Confirmar Acción Masiva</h3>
                            <button onClick={() => setIsBulkDeleteModalOpen(false)} className="hover:bg-rose-700 p-1 rounded-full transition-colors">
                                <Search size={20} className="rotate-45" /> {/* Close icon substitution or use Lucide X if available in other components */}
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-slate-600 font-medium">
                                Se han reconocido <span className="font-bold text-rose-600">{pendingDnis.length}</span> trabajadores en el archivo.
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Selecciona la acción</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => setBulkAction('inactivate')}
                                        className={`p-4 border-2 rounded-xl flex flex-col items-start transition-all ${bulkAction === 'inactivate' ? 'border-aquanqa-blue bg-blue-50/50 ring-2 ring-aquanqa-blue/10' : 'border-slate-100'}`}
                                    >
                                        <span className={`font-bold ${bulkAction === 'inactivate' ? 'text-aquanqa-blue' : 'text-slate-700'}`}>Inhabilitar (Desactivar)</span>
                                        <span className="text-[10px] text-slate-500">Mantiene al trabajador en la BD pero no podrá ingresar al sistema.</span>
                                    </button>
                                    <button
                                        onClick={() => setBulkAction('delete')}
                                        className={`p-4 border-2 rounded-xl flex flex-col items-start transition-all ${bulkAction === 'delete' ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-100' : 'border-slate-100'}`}
                                    >
                                        <span className={`font-bold ${bulkAction === 'delete' ? 'text-rose-500' : 'text-slate-700'}`}>Borrar de la BD (Eliminar Permanente)</span>
                                        <span className="text-[10px] text-slate-500">Elimina toda la información del trabajador definitivamente.</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    onClick={() => setIsBulkDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmBulkAction}
                                    className={`flex-1 px-4 py-3 text-white rounded-xl font-bold text-sm transition-all shadow-lg ${bulkAction === 'inactivate' ? 'bg-aquanqa-blue hover:bg-blue-600 shadow-blue-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}
                                >
                                    Confirmar {bulkAction === 'inactivate' ? 'Baja' : 'Eliminación'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
