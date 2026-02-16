export interface User {
    id: string;
    nombre: string;
    email: string;
    contrasena: string;
    area_id: string;
    area_nombre?: string; // Nombre del área para mostrar
    rol: 'obrero' | 'trabajador' | 'empleado' | 'administrador';
    estado: 'Activo' | 'Inactivo' | 'SIN CONTRATO';
    fecha_registro: string;
    documento?: string;
    empresa?: 'Aquanqa 1' | 'Aquanqa 2';
}

export interface Area {
    id: string;
    nombre: string;
    descripcion?: string;
}

export interface SuggestionAttachment {
    id: string;
    suggestion_id: string;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_archivo: string;
    tamaño: string;
    fecha_carga: string;
}

export interface Suggestion {
    id: string;
    usuario_id: string;
    area_id: string;
    tipo: 'sugerencia' | 'reclamo';
    titulo: string;
    descripcion: string;
    fecha_creacion: string;
    area_nombre?: string;
    adjuntos?: SuggestionAttachment[];
    // Simplified fields
    estado: 'pendiente' | 'revisada';
    comentario_admin?: string;
    fecha_actualizacion?: string;
    usuario_nombre?: string;
    user?: { nombre: string }; // Optional relation from backend
}

export interface JustificationAttachment {
    id: string;
    justification_id: string;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_archivo: string;
    fecha_carga: string;
}

export interface Justification {
    id: string;
    usuario_id: string;
    area_id: string;
    titulo: string;
    descripcion: string;
    fecha_evento: string;
    hora_inicio: string;
    hora_fin: string;
    estado: 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado';
    razon_rechazo?: string;
    aprobado_por?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    usuario_nombre?: string;
    usuario_documento?: string;
    area_nombre?: string;
    adjuntos?: JustificationAttachment[];
}

export const MOCK_AREAS: Area[] = [
    { id: '1', nombre: 'Remuneraciones', descripcion: 'Gestión de sueldos y salarios' },
    { id: '2', nombre: 'Bienestar Social', descripcion: 'Beneficios y bienestar del personal' },
    { id: '3', nombre: 'ADP', descripcion: 'Administración de Personal' },
    { id: '4', nombre: 'Transportes', descripcion: 'Logística y transporte' },
];

export const MOCK_USERS: User[] = [
    {
        id: '1',
        nombre: 'Admin User',
        email: 'admin@aquanqa.com',
        contrasena: 'password',
        rol: 'administrador',
        area_id: '1',
        area_nombre: 'Remuneraciones',
        estado: 'Activo',
        fecha_registro: '2024-01-01',
        documento: '70691234',
        empresa: 'Aquanqa 1'
    },
    {
        id: '2',
        nombre: 'Juan Pérez',
        email: 'juan@aquanqa.com',
        contrasena: 'password',
        rol: 'empleado',
        area_id: '3',
        area_nombre: 'ADP',
        estado: 'Activo',
        fecha_registro: '2024-05-15',
        documento: '45678912',
        empresa: 'Aquanqa 1'
    },
    {
        id: '3',
        nombre: 'María García',
        email: 'maria@aquanqa.com',
        contrasena: 'password',
        rol: 'trabajador',
        area_id: '2',
        area_nombre: 'Bienestar Social',
        estado: 'SIN CONTRATO',
        fecha_registro: '2024-06-20',
        documento: '12345678',
        empresa: 'Aquanqa 2'
    },
    {
        id: '4',
        nombre: 'Sandra López',
        email: 'sandra@aquanqa.com',
        contrasena: 'password',
        rol: 'obrero',
        area_id: '1',
        area_nombre: 'Remuneraciones',
        estado: 'Activo',
        fecha_registro: '2024-02-10',
        documento: '87654321',
        empresa: 'Aquanqa 2'
    },
];

export const MOCK_JUSTIFICATIONS: Justification[] = [
    {
        id: '101',
        usuario_id: '4',
        usuario_nombre: 'Sandra López',
        area_id: '1',
        area_nombre: 'Recursos Humanos',
        titulo: 'Cita médica urgente',
        descripcion: 'Ausencia para cita médica de 10:00 AM a 12:00 PM. Se adjunta comprobante...',
        fecha_evento: '2024-12-20',
        hora_inicio: '10:00',
        hora_fin: '12:00',
        estado: 'pendiente',
        fecha_creacion: '2024-12-18',
        fecha_actualizacion: '2024-12-18',
        adjuntos: [
            {
                id: '1',
                justification_id: '101',
                nombre_archivo: 'constancia.jpg',
                ruta_archivo: 'https://images.unsplash.com/photo-1542884748-2b87b3664b40?q=80&w=1000&auto=format&fit=crop',
                tipo_archivo: 'image/jpeg',
                fecha_carga: '2024-12-18'
            }
        ]
    },
    {
        id: '102',
        usuario_id: '2',
        usuario_nombre: 'Juan Pérez',
        area_id: '3',
        area_nombre: 'Operaciones',
        titulo: 'Problema familiar',
        descripcion: 'Solicito permiso por asunto familiar grave.',
        fecha_evento: '2024-12-19',
        hora_inicio: '08:00',
        hora_fin: '17:00',
        estado: 'rechazado',
        razon_rechazo: 'No se notificó con anticipación.',
        fecha_creacion: '2024-12-17',
        fecha_actualizacion: '2024-12-17',
    },
    {
        id: '103',
        usuario_id: '3',
        usuario_nombre: 'María García',
        area_id: '2',
        area_nombre: 'Tecnología',
        titulo: 'Capacitación externa',
        descripcion: 'Asistencia a curso de seguridad informática.',
        fecha_evento: '2024-12-18',
        hora_inicio: '14:00',
        hora_fin: '18:00',
        estado: 'aprobado',
        aprobado_por: '1',
        fecha_creacion: '2024-12-15',
        fecha_actualizacion: '2024-12-16',
    },
];

export const MOCK_SUGGESTIONS: Suggestion[] = [
    {
        id: '201',
        usuario_id: '2',
        usuario_nombre: 'Juan Pérez',
        area_id: '1',
        tipo: 'sugerencia',
        titulo: 'Implementar sistema de reconocimientos mensuales',
        descripcion: 'Se propone crear un sistema mensual de reconocimiento a empleados destacados para aumentar la motivación...',
        fecha_creacion: '2024-12-18',
        estado: 'pendiente',
        adjuntos: [
            { id: '1', suggestion_id: '201', nombre_archivo: 'propuesta.jpg', ruta_archivo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800', tipo_archivo: 'image/jpeg', tamaño: '1.2MB', fecha_carga: '2024-12-18' }
        ]
    },
    {
        id: '202',
        usuario_id: '3',
        usuario_nombre: 'Maria García',
        area_id: '2',
        tipo: 'reclamo',
        titulo: 'Problemas con el sistema de control de asistencia',
        descripcion: 'El sistema marca ausencias cuando se intenta registrar la salida, es un problema recurrente...',
        fecha_creacion: '2024-12-16',
        estado: 'revisada',
        comentario_admin: 'Estamos revisando los logs del sistema.',
        adjuntos: [
            { id: '2', suggestion_id: '202', nombre_archivo: 'error_sistema.jpg', ruta_archivo: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800', tipo_archivo: 'image/jpeg', tamaño: '0.8MB', fecha_carga: '2024-12-16' },
            { id: '3', suggestion_id: '202', nombre_archivo: 'Captura.png', ruta_archivo: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&q=80&w=800', tipo_archivo: 'image/png', tamaño: '1.5MB', fecha_carga: '2024-12-16' }
        ]
    },
];

export const MOCK_COMUNICADOS: Comunicado[] = [
    {
        id: '1',
        titulo: 'Bienvenidos a la Nueva Intranet',
        contenido: 'Estamos felices de lanzar nuestra nueva plataforma de RRHH para mejorar la comunicación interna.',
        fecha_publicacion: '2024-12-20',
        activo: true,
        autor: { nombre: 'RRHH Team', rol: 'admin' }
    },
    {
        id: '2',
        titulo: 'Horario Navideño',
        contenido: 'Se les informa que el día 24 de diciembre la salida será a la 1:00 PM.',
        fecha_publicacion: '2024-12-21',
        activo: true,
        autor: { nombre: 'Gerencia', rol: 'admin' }
    }
];

export interface Comunicado {
    id: string;
    titulo: string;
    contenido: string;
    imagen_url?: string;
    fecha_publicacion?: string;
    autor?: {
        nombre: string;
        rol: string;
    };
    activo?: boolean;
}
