import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import { SuggestionsList } from './components/SuggestionsList'
import { JustificationsView } from './components/JustificationsView'
import { UserMaster } from './components/UserMaster'

import { Login } from './components/Login'

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
