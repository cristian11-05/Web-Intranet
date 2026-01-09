export interface User {
    id: string;
    nombre: string;
    email: string;
    contrasena: string;
    area_id: string;
    rol: 'empleado' | 'gestor' | 'admin';
    estado: 'Activo' | 'Inactivo' | 'SIN CONTRATO';
    fecha_registro: string;
    documento?: string; // Agregado para el filtro de la imagen
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
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    razon_rechazo?: string;
    aprobado_por?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    usuario_nombre?: string;
    area_nombre?: string;
    adjuntos?: JustificationAttachment[];
}

export const MOCK_AREAS: Area[] = [
    { id: '1', nombre: 'Recursos Humanos', descripcion: 'Departamento de talento y cultura' },
    { id: '2', nombre: 'Tecnología', descripcion: 'Sistemas e infraestructura' },
    { id: '3', nombre: 'Operaciones', descripcion: 'Planta y logística' },
];

export const MOCK_USERS: User[] = [
    {
        id: '1',
        nombre: 'Admin User',
        email: 'admin@aquanqa.com',
        contrasena: 'password',
        rol: 'admin',
        area_id: '1',
        estado: 'Activo',
        fecha_registro: '2024-01-01',
        documento: '70691234'
    },
    {
        id: '2',
        nombre: 'Juan Pérez',
        email: 'juan@aquanqa.com',
        contrasena: 'password',
        rol: 'empleado',
        area_id: '3',
        estado: 'Activo',
        fecha_registro: '2024-05-15',
        documento: '45678912'
    },
    {
        id: '3',
        nombre: 'María García',
        email: 'maria@aquanqa.com',
        contrasena: 'password',
        rol: 'empleado',
        area_id: '2',
        estado: 'SIN CONTRATO',
        fecha_registro: '2024-06-20',
        documento: '12345678'
    },
    {
        id: '4',
        nombre: 'Sandra López',
        email: 'sandra@aquanqa.com',
        contrasena: 'password',
        rol: 'empleado',
        area_id: '1',
        estado: 'Activo',
        fecha_registro: '2024-02-10',
        documento: '87654321'
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
        area_id: '1',
        tipo: 'sugerencia',
        titulo: 'Implementar sistema de reconocimientos mensuales',
        descripcion: 'Se propone crear un sistema mensual de reconocimiento a empleados destacados para aumentar la motivación...',
        fecha_creacion: '2024-12-18',
    },
    {
        id: '202',
        usuario_id: '3',
        area_id: '2',
        tipo: 'reclamo',
        titulo: 'Problemas con el sistema de control de asistencia',
        descripcion: 'El sistema marca ausencias cuando se intenta registrar la salida, es un problema recurrente...',
        fecha_creacion: '2024-12-16',
    },
];
