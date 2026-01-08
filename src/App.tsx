import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import { SuggestionsList } from './components/SuggestionsList'
import { JustificationsView } from './components/JustificationsView'
import { UserMaster } from './components/UserMaster'

// Placeholder Login (Movido aquí por simplicidad)
const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <div className="flex flex-col items-center mb-6">
                    {/* Logo Image */}
                    <img src="/logo.png" alt="AQUANQA Logo" className="h-20 w-auto object-contain mb-4" />
                    {/* <h1 className="text-3xl font-bold text-aquanqa-dark mb-1">Aquanqa</h1> - Removed text title since logo has it */}
                    <p className="text-gray-500 text-sm">Envía tus sugerencias y justificaciones</p>
                </div>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" placeholder="tu@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aquanqa-blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input type="password" placeholder="........" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aquanqa-blue" />
                    </div>
                    <Link to="/dashboard" className="block w-full text-center bg-slate-600 text-white py-2 rounded-md hover:bg-slate-700 transition font-medium">
                        Iniciar Sesión
                    </Link>
                </form>
            </div>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sugerencias" element={<SuggestionsList />} />
                <Route path="/justificaciones" element={<JustificationsView />} />
                <Route path="/usuarios" element={<UserMaster />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
