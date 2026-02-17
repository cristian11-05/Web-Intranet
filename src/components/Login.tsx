import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

export const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(identifier, contrasena);
            toast.success('Sesión iniciada', { description: 'Bienvenido al sistema AQUANQA.' });
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            // API errors are handled by interceptor, but we should still show something if it fails here
            if (err.message && !err.message.includes('handled')) {
                // If it's not a handled API error, show it
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="AQUANQA Logo" className="h-20 w-auto object-contain mb-4" />
                    <p className="text-gray-500 text-sm">Envía tus sugerencias y justificaciones</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email o DNI</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="tu@email.com o DNI"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aquanqa-blue"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="........"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aquanqa-blue pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl bg-aquanqa-blue text-white font-black text-xs uppercase tracking-[0.2em] relative overflow-hidden transition-all duration-300 shadow-xl shadow-blue-100/50 hover:bg-aquanqa-dark hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-3" size={18} />
                                Iniciando sesión...
                            </>
                        ) : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};
