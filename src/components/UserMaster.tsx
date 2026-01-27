import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { MOCK_AREAS, User } from '../data/mockData';
import { Search, UserPlus, Edit2, Trash2, FileDown, UploadCloud, UserCircle, Loader2, Trash } from 'lucide-react';
import { UserModal } from './UserModal';
import { userService } from '../services/user.service';
import * as XLSX from 'xlsx';

export const UserMaster = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterArea, setFilterArea] = useState('Todas');
    const [filterDoc, setFilterDoc] = useState('');
    const [filterName, setFilterName] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

        const matchesArea = filterArea === 'Todas' || user.area_id === filterArea;
        const matchesDoc = !filterDoc || (user.documento && user.documento.includes(filterDoc));
        const matchesName = !filterName || user.nombre.toLowerCase().includes(filterName.toLowerCase());

        return matchesGlobal && matchesArea && matchesDoc && matchesName;
    });

    const getAreaName = (id: string) => MOCK_AREAS.find(a => a.id === id)?.nombre || 'N/A';

    const handleSave = async (userData: Partial<User>) => {
        try {
            if (selectedUser) {
                // Update existing user
                await userService.updateUser(selectedUser.id, userData);
            } else {
                // New
                await userService.createUser(userData);
            }
            loadUsers(); // Refresh list from server
            setIsModalOpen(false);
            setSelectedUser(null);
        } catch (err) {
            alert('Error al guardar el usuario');
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

    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json<any>(sheet);

                // Process Excel data: DNI, Apellido_paterno, apellido_materno, nombres, tipo_de_contrato
                const usersToCreate = data.map((row: any) => ({
                    documento: row.DNI || row.dni,
                    nombre: `${row.nombres || ''} ${row.Apellido_paterno || ''} ${row.apellido_materno || ''}`.trim(),
                    rol: ((row.tipo_de_contrato === 'OBR' || row.tipo_de_contrato === 'obr') ? 'obrero' : 'administrativo') as User['rol'],
                    estado: 'Activo' as User['estado'],
                }));

                // Send to backend (you'll need to implement this in userService)
                usersToCreate.forEach(async (user) => {
                    try {
                        await userService.createUser(user);
                    } catch (err) {
                        console.error('Error creating user:', err);
                    }
                });

                setTimeout(() => loadUsers(), 1000); // Reload after short delay
                alert(`Se procesaron ${usersToCreate.length} trabajadores`);
            } catch (err) {
                alert('Error al procesar el archivo Excel');
                console.error(err);
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = ''; // Reset input
    };

    const handleBulkDelete = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json<any>(sheet);

                // Extract DNIs to delete
                const dnisToDelete = data.map((row: any) => row.DNI || row.dni).filter(Boolean);

                if (confirm(`¿Estás seguro de eliminar ${dnisToDelete.length} trabajadores?`)) {
                    // Filter out users with matching DNI
                    setUsers(users.filter(u => !dnisToDelete.includes(u.documento)));
                    alert(`Se eliminaron ${dnisToDelete.length} trabajadores`);
                }
            } catch (err) {
                alert('Error al procesar el archivo Excel');
                console.error(err);
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = ''; // Reset input
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
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleBulkUpload}
                        className="hidden"
                        id="bulk-upload"
                    />
                    <label
                        htmlFor="bulk-upload"
                        className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-bold shadow-sm text-sm cursor-pointer"
                    >
                        <UploadCloud size={18} className="text-slate-400" />
                        <span>Carga Masiva</span>
                    </label>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleBulkDelete}
                        className="hidden"
                        id="bulk-delete"
                    />
                    <label
                        htmlFor="bulk-delete"
                        className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-50 transition-all font-bold shadow-sm text-sm cursor-pointer"
                    >
                        <Trash size={18} className="text-rose-400" />
                        <span>Baja Masiva</span>
                    </label>
                    <button
                        onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-aquanqa-blue text-white rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-blue-100 font-bold text-sm"
                    >
                        <UserPlus size={18} />
                        <span>Nuevo Trabajador</span>
                    </button>
                </div>
            </div>

            {/* Filtros Estilo Referencia (Underline) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Filtros de Trabajadores</h3>
                    <button
                        type="button"
                        onClick={() => { setFilterArea('Todas'); setFilterDoc(''); setFilterName(''); setSearchTerm(''); }}
                        className="text-xs text-aquanqa-blue hover:text-aquanqa-dark transition-colors font-black uppercase tracking-wider"
                    >
                        Limpiar Filtros
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="group">
                        <label htmlFor="filterArea" className="text-[10px] font-black text-slate-400 mb-1 block transition-colors group-focus-within:text-aquanqa-blue uppercase tracking-widest">Zona de Procedencia (Área)</label>
                        <select
                            id="filterArea"
                            value={filterArea}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterArea(e.target.value)}
                            className="w-full border-b-2 border-slate-100 py-3 focus:border-aquanqa-blue outline-none bg-transparent text-sm font-bold transition-all appearance-none cursor-pointer"
                        >
                            <option value="Todas">Filtro zona de procedencia</option>
                            {MOCK_AREAS.map(area => (
                                <option key={area.id} value={area.id}>{area.nombre}</option>
                            ))}
                        </select>
                    </div>
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

            {/* Tabla de Trabajadores Premium */}
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
                                    <th className="px-6 py-6 font-center">Departamento</th>
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
                                            <div className="inline-flex items-center space-x-2 bg-blue-50/40 text-aquanqa-blue px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight border border-blue-100 hover:bg-aquanqa-blue hover:text-white transition-all cursor-default">
                                                <span className="w-1.5 h-1.5 rounded-full bg-aquanqa-blue group-hover:bg-white"></span>
                                                <span>{getAreaName(user.area_id)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-7">
                                            <div className="flex flex-col">
                                                <span className="text-slate-600 font-bold text-sm tracking-tight">{user.fecha_registro}</span>
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
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    className="p-3 text-slate-300 hover:text-aquanqa-blue hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100"
                                                    title="Editar Trabajador"
                                                >
                                                    <Edit2 size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100"
                                                    title="Eliminar Trabajador"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {filteredUsers.length === 0 && (
                        <div className="py-32 flex flex-col items-center justify-center text-slate-400 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                            <div className="relative">
                                <Search size={80} className="text-slate-100" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black text-slate-200">?</span>
                                </div>
                            </div>
                            <div className="text-center group">
                                <p className="font-black text-slate-700 text-2xl tracking-tight">Sin coincidencias exactas</p>
                                <p className="text-slate-400 font-bold mt-1 max-w-xs mx-auto">Prueba ajustando los filtros o revisa la ortografía de la búsqueda.</p>
                                <button
                                    onClick={() => { setFilterArea('Todas'); setFilterDoc(''); setFilterName(''); setSearchTerm(''); }}
                                    className="mt-6 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Reiniciar parámetros
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest gap-4">
                    <p className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-aquanqa-blue animate-pulse mr-2"></span>
                        Visualizando {filteredUsers.length} registros • Base completa: {users.length}
                    </p>
                    <div className="flex items-center space-x-6">
                        <span className="hover:text-aquanqa-blue transition-colors cursor-help">Soporte Técnico</span>
                        <span className="hover:text-aquanqa-blue transition-colors cursor-help">Manual de Usuario</span>
                        <span className="text-slate-200">|</span>
                        <span className="text-slate-500">Aquanqa v2.4 PREMIUM</span>
                    </div>
                </div>
            </div>

            {/* Modal de Usuario */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                onSave={handleSave}
                user={selectedUser}
            />
        </Layout>
    );
};
