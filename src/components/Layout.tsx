import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, LogOut, User } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 ${isActive
                ? 'bg-aquanqa-blue text-white font-medium'
                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
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
                    <SidebarItem to="/usuarios" icon={User} label="Trabajadores" />
                    <SidebarItem to="/sugerencias" icon={FileText} label="Sugerencias" />
                    <SidebarItem to="/justificaciones" icon={CheckSquare} label="Justificaciones" />
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <Link to="/login" className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-aquanqa-dark text-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10 border-b border-slate-700">
                    <h2 className="text-lg font-medium">Panel de Administración</h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium">Admin User</p>
                            <p className="text-xs text-aquanqa-blue">Gerente RH | Recursos Humanos</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-aquanqa-green">
                            <User size={20} />
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
