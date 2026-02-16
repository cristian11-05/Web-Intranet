import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { User } from '../data/mockData';
import { Search, UserPlus, Edit2, Trash2, FileDown, UploadCloud, UserCircle, Loader2, Trash, X } from 'lucide-react';
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
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDoc, setFilterDoc] = useState('');
    const [filterName, setFilterName] = useState('');
    const [filterCompany, setFilterCompany] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Bulk Delete State
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [pendingDnis, setPendingDnis] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<'inactivate' | 'delete'>('inactivate');

    // Preview Modal State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewType, setPreviewType] = useState<'carga' | 'baja'>('carga');

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

    // Búsqueda Global + Filtros Específicos + Ordenamiento
    const filteredUsers = users
        .filter(user => {
            const globalSearch = searchTerm.toLowerCase();
            const matchesGlobal = (user.nombre?.toLowerCase().includes(globalSearch)) ||
                (user.documento && user.documento.includes(globalSearch)) ||
                (user.email?.toLowerCase().includes(globalSearch));

            const matchesDoc = !filterDoc || (user.documento && user.documento.includes(filterDoc));
            const matchesName = !filterName || (user.nombre && user.nombre.toLowerCase().includes(filterName.toLowerCase()));
            const matchesCompany = !filterCompany || user.empresa === filterCompany;

            return matchesGlobal && matchesDoc && matchesName && matchesCompany;
        })
        .sort((a, b) => {
            // Primero ordenar por estado: Activo > Inactivo > SIN CONTRATO
            const estadoOrder = { 'Activo': 0, 'Inactivo': 1, 'SIN CONTRATO': 2 };
            const estadoDiff = estadoOrder[a.estado] - estadoOrder[b.estado];
            if (estadoDiff !== 0) return estadoDiff;

            // Luego ordenar alfabéticamente por nombre
            return (a.nombre || '').localeCompare(b.nombre || '', 'es');
        });

    const handleSave = async (userData: Partial<User>) => {
        try {
            setIsSaving(true);
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
        } finally {
            setIsSaving(false);
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

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                setLoading(true);
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<any>(sheet);

                if (rows.length === 0) {
                    alert('El archivo está vacío');
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                for (const row of rows) {
                    try {
                        // Mapeo flexible de cabeceras
                        const headerMap: Record<string, string> = {};
                        Object.keys(row).forEach(key => {
                            headerMap[normalizeHeader(key)] = key;
                        });

                        const nameKey = headerMap['nombre'] || headerMap['colaborador'] || headerMap['nombre_completo'];
                        const docKey = headerMap['documento'] || headerMap['dni'] || headerMap['nro_documento'];
                        const rolKey = headerMap['rol'] || headerMap['contrato'] || headerMap['tipo_contrato'];
                        const areaKey = headerMap['area'] || headerMap['area_id'] || headerMap['id_area'] || headerMap['departamento'];
                        const empresaKey = headerMap['empresa'];

                        if (!row[nameKey] || !row[docKey]) {
                            console.warn('Fila omitida por falta de nombre o documento:', row);
                            errorCount++;
                            continue;
                        }

                        // Mapear área por nombre a ID
                        const areaValue = row[areaKey]?.toString().toLowerCase().trim() || '';
                        let areaId = '1'; // Default: Remuneraciones

                        if (areaValue.includes('bienestar')) areaId = '2';
                        else if (areaValue.includes('adp')) areaId = '3';
                        else if (areaValue.includes('transporte')) areaId = '4';
                        else if (areaValue.includes('remunera')) areaId = '1';
                        // if numeric, use as is
                        else if (/^\d+$/.test(areaValue)) areaId = areaValue;

                        // Mapear rol a formato backend (obrero, trabajador, empleado, administrador)
                        let rol = (row[rolKey]?.toString().toLowerCase() || 'obrero');
                        if (rol.includes('admin')) rol = 'administrador';

                        await userService.createUser({
                            nombre: row[nameKey]?.toString(),
                            documento: row[docKey]?.toString(),
                            rol: rol as any,
                            estado: 'Activo',
                            area_id: areaId,
                            empresa: row[empresaKey]?.toString() as any || 'Aquanqa 1'
                        });
                        successCount++;
                    } catch (err) {
                        console.error('Error procesando fila:', row, err);
                        errorCount++;
                    }
                }

                alert(`Proceso completado.\nÉxito: ${successCount}\nErrores: ${errorCount}`);
                loadUsers();
            } catch (err: any) {
                alert('Error al leer el archivo Excel: ' + err.message);
            } finally {
                setLoading(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
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
            ? [['Nombre', 'Documento', 'Rol', 'Area', 'Empresa']]
            : [['Documento']];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(headers);
        XLSX.utils.book_append_sheet(wb, ws, "Formato");
        XLSX.writeFile(wb, `formato_${type}_masivo.xlsx`);
        setIsPreviewOpen(false);
    };

    return (
        <Layout>
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-3 bg-blue-50 text-aquanqa-blue rounded-2xl shadow-sm border border-blue-100">
                            <UserCircle size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Maestro de Usuarios</h1>
                            <p className="text-slate-400 font-medium text-sm tracking-tight">Gestiona el personal y permisos del sistema RRHH</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                    {/* ACCIONES MASIVAS */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col group">
                            <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} className="hidden" id="bulk-upload" />
                            <label htmlFor="bulk-upload" className="flex items-center space-x-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-aquanqa-blue hover:text-aquanqa-blue hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all active:scale-95 font-black text-[10px] cursor-pointer uppercase tracking-widest shadow-sm">
                                <UploadCloud size={18} />
                                <span>Carga Masiva</span>
                            </label>
                            <button onClick={() => { setPreviewType('carga'); setIsPreviewOpen(true); }} className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hover:text-aquanqa-blue mt-2 text-center transition-colors">
                                Formato Carga
                            </button>
                        </div>

                        <div className="flex flex-col group">
                            <input type="file" accept=".xlsx,.xls" onChange={handleBulkDelete} className="hidden" id="bulk-delete" />
                            <label htmlFor="bulk-delete" className="flex items-center space-x-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-rose-500 hover:text-rose-600 hover:shadow-xl hover:shadow-rose-100/50 hover:-translate-y-1 transition-all active:scale-95 font-black text-[10px] cursor-pointer uppercase tracking-widest shadow-sm">
                                <Trash size={18} />
                                <span>Baja Masiva</span>
                            </label>
                            <button onClick={() => { setPreviewType('baja'); setIsPreviewOpen(true); }} className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hover:text-rose-600 mt-2 text-center transition-colors">
                                Formato Baja
                            </button>
                        </div>
                    </div>

                    <div className="w-px h-12 bg-slate-100 mx-2 hidden lg:block"></div>

                    <button
                        onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                        className="flex items-center space-x-3 px-8 py-4 bg-aquanqa-blue text-white rounded-2xl hover:bg-aquanqa-dark hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200/60 transition-all active:scale-95 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100/50"
                    >
                        <UserPlus size={20} />
                        <span>Nuevo Trabajador</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 mb-12 transition-all hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-1.5 h-6 bg-aquanqa-blue rounded-full"></div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Filtros Avanzados</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setFilterDoc(''); setFilterName(''); setFilterCompany(''); setSearchTerm(''); }}
                        className="text-[10px] text-slate-400 hover:text-aquanqa-blue transition-all font-black uppercase tracking-widest px-4 py-2 hover:bg-slate-50 rounded-xl"
                    >
                        Limpiar Filtros
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="group">
                        <label htmlFor="filterDoc" className="text-[10px] font-black text-slate-400 mb-2 block transition-colors group-focus-within:text-aquanqa-blue uppercase tracking-widest opacity-70">Número de Documento</label>
                        <input
                            id="filterDoc"
                            type="text"
                            placeholder="Buscar por DNI..."
                            value={filterDoc}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterDoc(e.target.value)}
                            className="w-full border-b border-slate-100 py-3 focus:border-aquanqa-blue outline-none text-sm font-bold transition-all placeholder:font-medium placeholder:text-slate-200 bg-transparent"
                        />
                    </div>
                    <div className="group">
                        <label htmlFor="filterName" className="text-[10px] font-black text-slate-400 mb-2 block transition-colors group-focus-within:text-aquanqa-blue uppercase tracking-widest opacity-70">Nombre del Colaborador</label>
                        <input
                            id="filterName"
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={filterName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterName(e.target.value)}
                            className="w-full border-b border-slate-100 py-3 focus:border-aquanqa-blue outline-none text-sm font-bold transition-all placeholder:font-medium placeholder:text-slate-200 bg-transparent"
                        />
                    </div>
                    <div className="group">
                        <label htmlFor="filterCompany" className="text-[10px] font-black text-slate-400 mb-2 block transition-colors group-focus-within:text-aquanqa-blue uppercase tracking-widest opacity-70">Empresa / Sede</label>
                        <select
                            id="filterCompany"
                            value={filterCompany}
                            onChange={(e) => setFilterCompany(e.target.value)}
                            className="w-full border-b border-slate-100 py-3 focus:border-aquanqa-blue outline-none text-sm font-bold transition-all bg-transparent appearance-none"
                        >
                            <option value="">Todas las Empresas</option>
                            <option value="Aquanqa 1">Aquanqa 1</option>
                            <option value="Aquanqa 2">Aquanqa 2</option>
                        </select>
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
                                placeholder="Búsqueda rápida por nombre o DNI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-14 pr-6 py-4 bg-white border border-slate-200/60 rounded-2xl text-sm w-full focus:ring-4 focus:ring-aquanqa-blue/5 focus:border-aquanqa-blue outline-none transition-all shadow-sm font-medium placeholder:text-slate-300"
                            />
                        </div>
                        <button className="flex items-center justify-center space-x-3 px-8 py-4 bg-aquanqa-green text-white rounded-2xl hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-200/50 transition-all active:scale-95 font-black text-xs uppercase tracking-widest">
                            <FileDown size={20} />
                            <span className="hidden lg:inline">Exportar Excel</span>
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
                            <thead className="bg-slate-50/50 border-y border-slate-100/80">
                                <tr>
                                    <th className="px-10 py-5 w-20 text-center font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">#</th>
                                    <th className="px-6 py-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Documento</th>
                                    <th className="px-6 py-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Colaborador</th>
                                    <th className="px-6 py-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Área</th>
                                    <th className="px-6 py-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Empresa</th>
                                    <th className="px-6 py-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Contrato</th>
                                    <th className="px-6 py-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Registro</th>
                                    <th className="px-6 py-5 text-center font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Estado</th>
                                    <th className="px-10 py-5 text-right font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] w-40">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-10 py-8 text-center text-slate-300 font-mono text-xs group-hover:text-aquanqa-blue transition-colors">{String(index + 1).padStart(2, '0')}</td>

                                        {/* DOCUMENTACIÓN */}
                                        <td className="px-6 py-8">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 font-mono text-sm tracking-tight">{user.documento || '---'}</span>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mt-1">DNI / DOCUMENTO</span>
                                            </div>
                                        </td>

                                        {/* COLABORADOR */}
                                        <td className="px-6 py-8">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mr-4 text-slate-400 font-black text-xs border border-slate-200/50 shadow-sm group-hover:from-aquanqa-blue group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                                                    {user.nombre?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-aquanqa-blue transition-colors">{user.nombre}</span>
                                                    <span className="text-[11px] text-slate-400 font-medium">{user.email || 'sin correo registrado'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ÁREA */}
                                        <td className="px-6 py-8">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 text-xs">{user.area_nombre || 'Sin área'}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 opacity-60">ÁREA</span>
                                            </div>
                                        </td>

                                        {/* EMPRESA */}
                                        <td className="px-6 py-8">
                                            <div className="flex">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.05em] min-w-[100px] text-center shadow-sm border ${user.empresa === 'Aquanqa 1'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    {user.empresa || '---'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* CONTRATO / ROL */}
                                        <td className="px-6 py-8">
                                            <div className="flex">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.05em] min-w-[110px] text-center border shadow-sm ${user.rol === 'administrador' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                    user.rol === 'empleado' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                                                        user.rol === 'trabajador' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                                            'bg-orange-50 text-orange-700 border-orange-100'
                                                    }`}>
                                                    {user.rol === 'obrero' ? 'Obrero' : user.rol === 'trabajador' ? 'Trabajador' : user.rol === 'empleado' ? 'Empleado' : 'Administrador'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* REGISTRO */}
                                        <td className="px-6 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-slate-600 font-bold text-sm tracking-tight">
                                                    {user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString('es-PE', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    }) : '---'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">FECHA ALTA</span>
                                            </div>
                                        </td>

                                        {/* ESTADO */}
                                        <td className="px-6 py-8">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-24 text-center border ${user.estado === 'Activo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    user.estado === 'Inactivo' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                                                    }`}>
                                                    {user.estado}
                                                </span>
                                            </div>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-aquanqa-blue hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 group/btn"
                                                    title="Editar trabajador"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                                                            userService.deleteUser(user.id).then(() => loadUsers());
                                                        }
                                                    }}
                                                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-200 transition-all duration-200 group/btn"
                                                    title="Eliminar trabajador"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-10 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] gap-4">
                    <p className="flex items-center bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-aquanqa-blue animate-pulse mr-3"></span>
                        Visualizando {filteredUsers.length} registros • Base completa: {users.length}
                    </p>
                    <p className="flex items-center opacity-60">
                        Última actualización: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => { if (!isSaving) { setIsModalOpen(false); setSelectedUser(null); } }}
                onSave={handleSave}
                isSubmitting={isSaving}
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
                                    className="flex-1 px-4 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmBulkAction}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${bulkAction === 'inactivate' ? 'bg-aquanqa-blue hover:bg-blue-600 shadow-blue-100 hover:shadow-blue-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100 hover:shadow-rose-200'}`}
                                >
                                    {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                                    {loading ? 'Procesando...' : `Confirmar ${bulkAction === 'inactivate' ? 'Baja' : 'Eliminación'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="bg-gradient-to-r from-aquanqa-blue to-blue-700 p-8 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white tracking-tight">Vista Previa del Formato</h3>
                                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Asegúrate de seguir esta estructura de columnas</p>
                            </div>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all active:scale-90 text-white"
                                title="Cerrar vista previa"
                                aria-label="Cerrar vista previa"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10">
                            <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-inner mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-200/50">
                                                {previewType === 'carga' ? (
                                                    ['Nombre', 'Documento', 'Rol', 'Area', 'Empresa'].map(h => (
                                                        <th key={h} className="px-5 py-4 text-slate-500 font-black uppercase tracking-widest border-r border-slate-200 last:border-0 text-left">{h}</th>
                                                    ))
                                                ) : (
                                                    <th className="px-5 py-4 text-slate-500 font-black uppercase tracking-widest text-left">Documento</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                {previewType === 'carga' ? (
                                                    <>
                                                        <td className="px-5 py-4 text-slate-400 font-medium italic border-r border-slate-100 last:border-0">[Ejemplo Nombre]</td>
                                                        <td className="px-5 py-4 text-slate-400 font-medium italic border-r border-slate-100 last:border-0">[Ejemplo DNI]</td>
                                                        <td className="px-5 py-4 text-slate-400 font-medium italic border-r border-slate-100 last:border-0">[Ejemplo Rol]</td>
                                                        <td className="px-5 py-4 text-slate-400 font-medium italic border-r border-slate-100 last:border-0">[ADP / Remuneraciones]</td>
                                                        <td className="px-5 py-4 text-slate-400 font-medium italic border-r border-slate-100 last:border-0">[Aquanqa 1]</td>
                                                    </>
                                                ) : (
                                                    <td className="px-5 py-4 text-slate-400 font-medium italic">[Ejemplo DNI]</td>
                                                )}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="flex-1 px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => downloadTemplate(previewType)}
                                    className="flex-[2] px-8 py-4 bg-aquanqa-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-aquanqa-dark hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center space-x-3 group"
                                >
                                    <FileDown size={20} className="group-hover:bounce" />
                                    <span>Descargar Excel de {previewType === 'carga' ? 'Carga' : 'Baja'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
