import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, LogOut, User, MessageSquare } from 'lucide-react';
import { useState, useEffect, ReactNode } from 'react';

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center space-x-3 px-6 py-3.5 rounded-2xl transition-all duration-300 mb-2 group active:scale-95 ${isActive
                ? 'bg-aquanqa-blue text-white shadow-lg shadow-blue-500/20 font-black text-xs uppercase tracking-widest'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white font-bold text-xs uppercase tracking-widest'
                }`}
        >
            <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-aquanqa-blue'} transition-colors duration-300`} />
            <span>{label}</span>
        </Link>
    );
};

export const Layout = ({ children }: { children: ReactNode }) => {
    const [userName, setUserName] = useState('Usuario');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserName(user.nombre || 'Usuario');
                setUserRole(user.rol || '');
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    return (
        <div className="flex min-h-screen bg-aquanqa-bg font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-aquanqa-dark text-white flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-start">
                        <img src="/logo.png" alt="AQUANQA" className="h-12 w-auto object-contain brightness-0 invert" />
                    </div>
                </div>

                <nav className="flex-1 p-4 py-6">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menú</p>
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

                    {/* Solo Administrativos ven gestión de RRHH */}
                    {(userRole?.toLowerCase() === 'administrativo' || userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'administrador') && (
                        <>
                            <SidebarItem to="/usuarios" icon={User} label="Trabajadores" />
                            <SidebarItem to="/comunicados" icon={MessageSquare} label="Comunicados" />
                        </>
                    )}

                    <SidebarItem to="/sugerencias" icon={FileText} label="Sugerencias" />
                    <SidebarItem to="/justificaciones" icon={CheckSquare} label="Justificaciones" />
                </nav>

                <div className="p-6 border-t border-slate-800/50">
                    <Link to="/login" className="flex items-center space-x-3 px-6 py-3.5 w-full text-left text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all duration-300 group active:scale-95">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-xs uppercase tracking-widest">Cerrar Sesión</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white text-slate-800 shadow-sm h-20 flex items-center justify-between px-10 sticky top-0 z-10 border-b border-slate-100 backdrop-blur-md bg-white/80">
                    <h2 className="text-xl font-black tracking-tight text-slate-800">Panel de Administración</h2>
                    <div className="flex items-center space-x-6">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-black text-slate-800 tracking-tight">{userName}</p>
                            <p className="text-[10px] font-black text-aquanqa-blue uppercase tracking-widest">{userRole || 'Recursos Humanos'}</p>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-aquanqa-blue shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95">
                            <User size={24} />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
