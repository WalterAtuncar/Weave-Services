// Mocks para el módulo de Gobernanza
// Basado en el diagrama de base de datos proporcionado

// ===== TIPOS DE GOBIERNO =====
export interface TipoGobierno {
  tipoGobiernoId: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  version: number;
  estado: number;
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
}

export const tiposGobiernoMocks: TipoGobierno[] = [
  {
    tipoGobiernoId: 1,
    codigo: 'SISTEMA',
    nombre: 'Sistema',
    descripcion: 'Sistemas tecnológicos y aplicaciones',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    tipoGobiernoId: 2,
    codigo: 'PROCESO',
    nombre: 'Proceso',
    descripcion: 'Procesos de negocio y operacionales',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    tipoGobiernoId: 3,
    codigo: 'DOCUMENTO',
    nombre: 'Documento',
    descripcion: 'Documentos y archivos corporativos',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    tipoGobiernoId: 4,
    codigo: 'POLITICA',
    nombre: 'Política',
    descripcion: 'Políticas y normativas organizacionales',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    tipoGobiernoId: 5,
    codigo: 'INDICADOR',
    nombre: 'Indicador',
    descripcion: 'Indicadores y métricas de gestión',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    tipoGobiernoId: 6,
    codigo: 'RIESGO',
    nombre: 'Riesgo',
    descripcion: 'Riesgos organizacionales y operacionales',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  }
];

// ===== ROLES DE GOBERNANZA =====
export interface RolGobernanza {
  rolGobernanzaId: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel: number;
  color: string;
  activo: boolean;
  version: number;
  estado: number;
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
}

export const rolesGobernanzaMocks: RolGobernanza[] = [
  {
    rolGobernanzaId: 1,
    codigo: 'OWNER',
    nombre: 'Propietario',
    descripcion: 'Propietario responsable de la entidad',
    nivel: 1,
    color: '#FF6B6B',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    rolGobernanzaId: 2,
    codigo: 'SUPERVISOR',
    nombre: 'Supervisor',
    descripcion: 'Supervisor y responsable de control',
    nivel: 2,
    color: '#4ECDC4',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    rolGobernanzaId: 3,
    codigo: 'EDITOR',
    nombre: 'Editor',
    descripcion: 'Editor con permisos de modificación',
    nivel: 3,
    color: '#5B7D1',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    rolGobernanzaId: 4,
    codigo: 'REVISOR',
    nombre: 'Revisor',
    descripcion: 'Revisor con permisos de solo lectura',
    nivel: 4,
    color: '#96CEB4',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    rolGobernanzaId: 5,
    codigo: 'CONSULTOR',
    nombre: 'Consultor',
    descripcion: 'Consultor externo con acceso limitado',
    nivel: 5,
    color: '#FFEE47',
    activo: true,
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  }
];

// ===== REGLAS DE GOBERNANZA =====
export interface ReglaGobernanza {
  reglaGobernanzaId: number;
  tipoGobiernoId: number;
  rolGobernanzaId: number;
  maximoUsuarios: number;
  minimoUsuarios: number;
  esObligatorio: boolean;
  diasAlertaVencimiento: number;
  configuracionJson: string;
  version: number;
  estado: number;
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
}

export const reglasGobernanzaMocks: ReglaGobernanza[] = [
  {
    reglaGobernanzaId: 1,
    tipoGobiernoId: 1, // SISTEMA
    rolGobernanzaId: 1, // OWNER
    maximoUsuarios: 1,
    minimoUsuarios: 1,
    esObligatorio: true,
    diasAlertaVencimiento: 30,
    configuracionJson: '{"requiereAprobacion": true, "puedeAutoAsignar": false}',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    reglaGobernanzaId: 2,
    tipoGobiernoId: 1, // SISTEMA
    rolGobernanzaId: 2, // SUPERVISOR
    maximoUsuarios: 2,
    minimoUsuarios: 0,
    esObligatorio: false,
    diasAlertaVencimiento: 60,
    configuracionJson: '{"requiereAprobacion": false, "puedeAutoAsignar": true}',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  },
  {
    reglaGobernanzaId: 3,
    tipoGobiernoId: 1, // SISTEMA
    rolGobernanzaId: 3, // EDITOR
    maximoUsuarios: 5,
    minimoUsuarios: 0,
    esObligatorio: false,
    diasAlertaVencimiento: 90,
    configuracionJson: '{"requiereAprobacion": true, "puedeAutoAsignar": false}',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-01T00:00:00.000Z',
    registroEliminado: false
  }
];

// ===== GOBERNANZA (Tabla Principal) =====
export interface Gobernanza {
  gobernanzaId: number;
  tipoGobiernoId: number;
  entidadId: number;
  rolGobernanzaId: number;
  usuarioId: number;
  fechaAsignacion: string;
  fechaVencimiento: string | null;
  activo: boolean;
  observaciones: string;
  version: number;
  estado: number;
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
  // Propiedades calculadas para mostrar
  tipoGobierno?: TipoGobierno;
  rolGobernanza?: RolGobernanza;
  usuarioNombre?: string;
  usuarioEmail?: string;
  entidadNombre?: string;
  nombreEntidad?: string;
  nombreEmpresa?: string;
}

export const gobernanzaMocks: Gobernanza[] = [
  {
    gobernanzaId: 1,
    tipoGobiernoId: 1, // SISTEMA
    entidadId: 1, // Sistema SAP
    rolGobernanzaId: 1, // OWNER
    usuarioId: 1,
    fechaAsignacion: '2024-01-15T00:00:00.000Z',
    fechaVencimiento: '2024-12-31T00:00:00.000Z',
    activo: true,
    observaciones: 'Asignación inicial del propietario del sistema SAP',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-15T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-15T00:00:00.000Z',
    registroEliminado: false,
    usuarioNombre: 'Juan Pérez',
    usuarioEmail: 'juan.perez@empresa.com',
    entidadNombre: 'Sistema SAP',
    nombreEntidad: 'Sistema SAP',
    nombreEmpresa: 'Corporación TechSolutions'
  },
  {
    gobernanzaId: 2,
    tipoGobiernoId: 1, // SISTEMA
    entidadId: 1, // Sistema SAP
    rolGobernanzaId: 2, // SUPERVISOR
    usuarioId: 2,
    fechaAsignacion: '2024-02-01T00:00:00.000Z',
    fechaVencimiento: null,
    activo: true,
    observaciones: 'Supervisor técnico del sistema SAP',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-02-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-02-01T00:00:00.000Z',
    registroEliminado: false,
    usuarioNombre: 'María García',
    usuarioEmail: 'maria.garcia@empresa.com',
    entidadNombre: 'Sistema SAP',
    nombreEntidad: 'Sistema SAP',
    nombreEmpresa: 'Corporación TechSolutions'
  },
  {
    gobernanzaId: 3,
    tipoGobiernoId: 1, // SISTEMA
    entidadId: 2, // Sistema CRM
    rolGobernanzaId: 1, // OWNER
    usuarioId: 3,
    fechaAsignacion: '2024-01-20T00:00:00.000Z',
    fechaVencimiento: '2024-12-31T00:00:00.000Z',
    activo: true,
    observaciones: 'Responsable del sistema CRM',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-20T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-20T00:00:00.000Z',
    registroEliminado: false,
    usuarioNombre: 'Carlos Rodriguez',
    usuarioEmail: 'carlos.rodriguez@empresa.com',
    entidadNombre: 'Sistema CRM',
    nombreEntidad: 'Sistema CRM',
    nombreEmpresa: 'Innovación Digital S.A.'
  },
  {
    gobernanzaId: 4,
    tipoGobiernoId: 1, // SISTEMA
    entidadId: 3, // Sistema Nómina
    rolGobernanzaId: 1, // OWNER
    usuarioId: 4,
    fechaAsignacion: '2024-02-15T00:00:00.000Z',
    fechaVencimiento: '2024-12-31T00:00:00.000Z',
    activo: true,
    observaciones: 'Propietario del sistema de nómina',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-02-15T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-02-15T00:00:00.000Z',
    registroEliminado: false,
    usuarioNombre: 'Ana López',
    usuarioEmail: 'ana.lopez@empresa.com',
    entidadNombre: 'Sistema Nómina',
    nombreEntidad: 'Sistema Nómina',
    nombreEmpresa: 'Recursos Humanos Corp.'
  },
  {
    gobernanzaId: 5,
    tipoGobiernoId: 1, // SISTEMA
    entidadId: 2, // Sistema CRM
    rolGobernanzaId: 3, // EDITOR
    usuarioId: 5,
    fechaAsignacion: '2024-03-01T00:00:00.000Z',
    fechaVencimiento: '2024-12-31T00:00:00.000Z',
    activo: true,
    observaciones: 'Editor del sistema CRM',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-03-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-03-01T00:00:00.000Z',
    registroEliminado: false,
    usuarioNombre: 'Luis Martínez',
    usuarioEmail: 'luis.martinez@empresa.com',
    entidadNombre: 'Sistema CRM',
    nombreEntidad: 'Sistema CRM',
    nombreEmpresa: 'Innovación Digital S.A.'
  }
];

// ===== HISTORIAL DE GOBERNANZA =====
export interface HistorialGobernanza {
  historialGobernanzaId: number;
  gobernanzaId: number;
  tipoGobiernoId: number;
  entidadId: number;
  rolGobernanzaId: number;
  usuarioAnterior: number | null;
  usuarioNuevo: number | null;
  fechaInicio: string;
  fechaFin: string | null;
  motivoTransferencia: string;
  tipoMovimiento: string;
  version: number;
  estado: number;
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
  // Propiedades calculadas
  usuarioAnteriorNombre?: string;
  usuarioNuevoNombre?: string;
  entidadNombre?: string;
  rolNombre?: string;
}

export const historialGobernanzaMocks: HistorialGobernanza[] = [
  {
    historialGobernanzaId: 1,
    gobernanzaId: 1,
    tipoGobiernoId: 1,
    entidadId: 1,
    rolGobernanzaId: 1,
    usuarioAnterior: null,
    usuarioNuevo: 1,
    fechaInicio: '2024-01-15T00:00:00.000Z',
    fechaFin: null,
    motivoTransferencia: 'Asignación inicial',
    tipoMovimiento: 'ASIGNACION',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-15T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-15T00:00:00.000Z',
    registroEliminado: false,
    usuarioAnteriorNombre: undefined,
    usuarioNuevoNombre: 'Juan Pérez',
    entidadNombre: 'Sistema SAP',
    rolNombre: 'Propietario'
  },
  {
    historialGobernanzaId: 2,
    gobernanzaId: 2,
    tipoGobiernoId: 1,
    entidadId: 1,
    rolGobernanzaId: 2,
    usuarioAnterior: null,
    usuarioNuevo: 2,
    fechaInicio: '2024-02-01T00:00:00.000Z',
    fechaFin: null,
    motivoTransferencia: 'Asignación de supervisor técnico',
    tipoMovimiento: 'ASIGNACION',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-02-01T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-02-01T00:00:00.000Z',
    registroEliminado: false,
    usuarioAnteriorNombre: undefined,
    usuarioNuevoNombre: 'María García',
    entidadNombre: 'Sistema SAP',
    rolNombre: 'Supervisor'
  },
  {
    historialGobernanzaId: 3,
    gobernanzaId: 3,
    tipoGobiernoId: 1,
    entidadId: 2,
    rolGobernanzaId: 1,
    usuarioAnterior: null,
    usuarioNuevo: 3,
    fechaInicio: '2024-01-20T00:00:00.000Z',
    fechaFin: null,
    motivoTransferencia: 'Asignación inicial del CRM',
    tipoMovimiento: 'ASIGNACION',
    version: 1,
    estado: 1,
    creadoPor: 'Admin',
    fechaCreacion: '2024-01-20T00:00:00.000Z',
    actualizadoPor: 'Admin',
    fechaActualizacion: '2024-01-20T00:00:00.000Z',
    registroEliminado: false,
    usuarioAnteriorNombre: undefined,
    usuarioNuevoNombre: 'Carlos Rodriguez',
    entidadNombre: 'Sistema CRM',
    rolNombre: 'Propietario'
  }
];

// ===== NOTIFICACIONES DE GOBERNANZA =====
export interface NotificacionGobernanza {
  notificacionGobernanzaId: number;
  gobernanzaId: number;
  tipoNotificacion: string;
  titulo: string;
  mensaje: string;
  fechaEnvio: string;
  enviado: boolean;
  leido: boolean;
  fechaLectura: string | null;
  version: number;
  estado: number;
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
  // Propiedades calculadas
  entidadNombre?: string;
  usuarioNombre?: string;
  rolNombre?: string;
}

export const notificacionesGobernanzaMocks: NotificacionGobernanza[] = [
  {
    notificacionGobernanzaId: 1,
    gobernanzaId: 1,
    tipoNotificacion: 'VENCIMIENTO_PROXIMO',
    titulo: 'Rol próximo a vencer',
    mensaje: 'El rol OWNER de Juan Pérez en Sistema SAP vence en 30 días',
    fechaEnvio: '2024-12-01T00:00:00.000Z',
    enviado: true,
    leido: false,
    fechaLectura: null,
    version: 1,
    estado: 1,
    creadoPor: 'Sistema',
    fechaCreacion: '2024-12-01T00:00:00.000Z',
    actualizadoPor: 'Sistema',
    fechaActualizacion: '2024-12-01T00:00:00.000Z',
    registroEliminado: false,
    entidadNombre: 'Sistema SAP',
    usuarioNombre: 'Juan Pérez',
    rolNombre: 'Propietario'
  },
  {
    notificacionGobernanzaId: 2,
    gobernanzaId: 2,
    tipoNotificacion: 'NUEVO_ROL',
    titulo: 'Nuevo rol asignado',
    mensaje: 'Se ha asignado el rol SUPERVISOR a María García en Sistema SAP',
    fechaEnvio: '2024-02-01T00:00:00.000Z',
    enviado: true,
    leido: true,
    fechaLectura: '2024-02-01T08:30:00.000Z',
    version: 1,
    estado: 1,
    creadoPor: 'Sistema',
    fechaCreacion: '2024-02-01T00:00:00.000Z',
    actualizadoPor: 'Sistema',
    fechaActualizacion: '2024-02-01T00:00:00.000Z',
    registroEliminado: false,
    entidadNombre: 'Sistema SAP',
    usuarioNombre: 'María García',
    rolNombre: 'Supervisor'
  },
  {
    notificacionGobernanzaId: 3,
    gobernanzaId: 3,
    tipoNotificacion: 'CAMBIO_PROPIETARIO',
    titulo: 'Cambio de propietario',
    mensaje: 'Carlos Rodriguez ha sido asignado como propietario del Sistema CRM',
    fechaEnvio: '2024-01-20T00:00:00.000Z',
    enviado: true,
    leido: true,
    fechaLectura: '2024-01-20T09:15:00.000Z',
    version: 1,
    estado: 1,
    creadoPor: 'Sistema',
    fechaCreacion: '2024-01-20T00:00:00.000Z',
    actualizadoPor: 'Sistema',
    fechaActualizacion: '2024-01-20T00:00:00.000Z',
    registroEliminado: false,
    entidadNombre: 'Sistema CRM',
    usuarioNombre: 'Carlos Rodriguez',
    rolNombre: 'Propietario'
  },
  {
    notificacionGobernanzaId: 4,
    gobernanzaId: 4,
    tipoNotificacion: 'VENCIMIENTO_PROXIMO',
    titulo: 'Rol próximo a vencer',
    mensaje: 'El rol OWNER de Ana López en Sistema Nómina vence en 45 días',
    fechaEnvio: '2024-11-15T00:00:00.000Z',
    enviado: true,
    leido: false,
    fechaLectura: null,
    version: 1,
    estado: 1,
    creadoPor: 'Sistema',
    fechaCreacion: '2024-11-15T00:00:00.000Z',
    actualizadoPor: 'Sistema',
    fechaActualizacion: '2024-11-15T00:00:00.000Z',
    registroEliminado: false,
    entidadNombre: 'Sistema Nómina',
    usuarioNombre: 'Ana López',
    rolNombre: 'Propietario'
  }
];

// ===== USUARIOS MOCK (Para SearchableSelect) =====
export interface UsuarioGobernanza {
  usuarioId: number;
  nombre: string;
  email: string;
  activo: boolean;
}

export const usuariosGobernanzaMocks: UsuarioGobernanza[] = [
  {
    usuarioId: 1,
    nombre: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    activo: true
  },
  {
    usuarioId: 2,
    nombre: 'María García',
    email: 'maria.garcia@empresa.com',
    activo: true
  },
  {
    usuarioId: 3,
    nombre: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@empresa.com',
    activo: true
  },
  {
    usuarioId: 4,
    nombre: 'Ana López',
    email: 'ana.lopez@empresa.com',
    activo: true
  },
  {
    usuarioId: 5,
    nombre: 'Luis Martínez',
    email: 'luis.martinez@empresa.com',
    activo: true
  },
  {
    usuarioId: 6,
    nombre: 'Patricia Sánchez',
    email: 'patricia.sanchez@empresa.com',
    activo: true
  },
  {
    usuarioId: 7,
    nombre: 'Diego Vargas',
    email: 'diego.vargas@empresa.com',
    activo: true
  },
  {
    usuarioId: 8,
    nombre: 'Carmen Torres',
    email: 'carmen.torres@empresa.com',
    activo: true
  }
];

// ===== ENTIDADES MOCK (Para asociar con sistemas) =====
export interface EntidadGobernanza {
  entidadId: number;
  nombre: string;
  tipo: string;
  activo: boolean;
}

export const entidadesGobernanzaMocks: EntidadGobernanza[] = [
  {
    entidadId: 1,
    nombre: 'Sistema SAP',
    tipo: 'SISTEMA',
    activo: true
  },
  {
    entidadId: 2,
    nombre: 'Sistema CRM',
    tipo: 'SISTEMA',
    activo: true
  },
  {
    entidadId: 3,
    nombre: 'Sistema Nómina',
    tipo: 'SISTEMA',
    activo: true
  },
  {
    entidadId: 4,
    nombre: 'Sistema Facturación',
    tipo: 'SISTEMA',
    activo: true
  },
  {
    entidadId: 5,
    nombre: 'Sistema Inventario',
    tipo: 'SISTEMA',
    activo: true
  }
];

// ===== HELPER FUNCTIONS =====

// Función para obtener gobernanza por entidad
export const getGobernanzaPorEntidad = (entidadId: number, tipoGobiernoId: number = 1): Gobernanza[] => {
  return gobernanzaMocks.filter(g => 
    g.entidadId === entidadId && 
    g.tipoGobiernoId === tipoGobiernoId && 
    g.activo && 
    !g.registroEliminado
  );
};

// Función para obtener historial por gobernanza
export const getHistorialPorGobernanza = (gobernanzaId: number): HistorialGobernanza[] => {
  return historialGobernanzaMocks.filter(h => h.gobernanzaId === gobernanzaId);
};

// Función para obtener notificaciones por gobernanza
export const getNotificacionesPorGobernanza = (gobernanzaId: number): NotificacionGobernanza[] => {
  return notificacionesGobernanzaMocks.filter(n => n.gobernanzaId === gobernanzaId);
};

// Función para obtener todas las entidades con gobernanza
export const getEntidadesConGobernanza = (): Array<EntidadGobernanza & { 
  responsables: number; 
  alertas: number; 
  propietario?: string;
}> => {
  return entidadesGobernanzaMocks.map(entidad => {
    const gobernanza = getGobernanzaPorEntidad(entidad.entidadId);
    const responsables = gobernanza.length;
    const alertas = gobernanza.reduce((acc, g) => {
      const notificaciones = getNotificacionesPorGobernanza(g.gobernanzaId);
      return acc + notificaciones.filter(n => !n.leido).length;
    }, 0);
    
    const propietario = gobernanza.find(g => g.rolGobernanzaId === 1)?.usuarioNombre;
    
    return {
      ...entidad,
      responsables,
      alertas,
      propietario
    };
  });
};

// Función para obtener usuario por ID
export const getUsuarioPorId = (usuarioId: number): UsuarioGobernanza | undefined => {
  return usuariosGobernanzaMocks.find(u => u.usuarioId === usuarioId);
};

// Función para obtener rol por ID
export const getRolPorId = (rolId: number): RolGobernanza | undefined => {
  return rolesGobernanzaMocks.find(r => r.rolGobernanzaId === rolId);
};

// Función para obtener tipo de gobierno por ID
export const getTipoGobiernoPorId = (tipoId: number): TipoGobierno | undefined => {
  return tiposGobiernoMocks.find(t => t.tipoGobiernoId === tipoId);
}; 

// =============================================================================
// MOCKS DE CONFIGURACIÓN DE GOBERNANZA
// =============================================================================

export interface ConfiguracionRol {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel: number;
  color: string;
  badge: string;
  permisos: {
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    asignar: boolean;
    transferir: boolean;
    revocar: boolean;
    renovar: boolean;
    verHistorial: boolean;
    verNotificaciones: boolean;
    exportar: boolean;
  };
  activo: boolean;
  fechaCreacion: string;
  creadoPor: string;
  fechaModificacion?: string;
  modificadoPor?: string;
}

export interface ConfiguracionTipoEntidad {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  version: string;
  camposObligatorios: string[];
  flujoAprobacion: boolean;
  plantillaMetadata: any;
  activo: boolean;
  fechaCreacion: string;
  creadoPor: string;
}

export interface ConfiguracionRegla {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: 'LIMITE_USUARIOS' | 'OBLIGATORIEDAD' | 'TRANSFERENCIA' | 'VENCIMIENTO' | 'ESCALAMIENTO';
  condiciones: any;
  acciones: any;
  activo: boolean;
  prioridad: number;
  fechaCreacion: string;
  creadoPor: string;
}

export interface ConfiguracionAlerta {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: 'VENCIMIENTO' | 'ASIGNACION' | 'TRANSFERENCIA' | 'REVOCACION' | 'ESCALAMIENTO';
  umbral: number;
  unidad: 'DIAS' | 'HORAS' | 'MINUTOS';
  plantilla: {
    asunto: string;
    cuerpo: string;
    variables: string[];
  };
  canales: ('EMAIL' | 'SMS' | 'PUSH' | 'SISTEMA')[];
  activo: boolean;
  fechaCreacion: string;
  creadoPor: string;
}

export interface ConfiguracionFlujo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoEntidad: string;
  tipoAccion: 'ASIGNACION' | 'TRANSFERENCIA' | 'REVOCACION' | 'RENOVACION';
  pasos: {
    orden: number;
    nombre: string;
    tipo: 'APROBACION' | 'NOTIFICACION' | 'VALIDACION' | 'EJECUCION';
    aprobadores: string[];
    condiciones: any;
    autoAprobacion: boolean;
    tiempoLimite: number;
    escalamiento: boolean;
  }[];
  activo: boolean;
  fechaCreacion: string;
  creadoPor: string;
}

export interface ConfiguracionExportacion {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: 'EXCEL' | 'CSV' | 'PDF' | 'JSON';
  plantilla: {
    nombre: string;
    hojas: {
      nombre: string;
      campos: string[];
      filtros: any;
      formato: any;
    }[];
  };
  programacion: {
    activo: boolean;
    frecuencia: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL';
    dia?: number;
    hora: string;
    destinatarios: string[];
  };
  activo: boolean;
  fechaCreacion: string;
  creadoPor: string;
}

export interface ConfiguracionUsuario {
  id: number;
  codigo: string;
  nombre: string;
  email: string;
  telefono?: string;
  cargo: string;
  departamento: string;
  ubicacion: string;
  permisos: {
    modulos: string[];
    roles: string[];
    entidades: string[];
    acciones: string[];
  };
  grupoUsuarios: string[];
  jerarquia: {
    superior?: number;
    subordinados: number[];
  };
  configuracionPersonal: {
    idioma: 'ES' | 'EN';
    tema: 'CLARO' | 'OSCURO' | 'AUTO';
    notificaciones: {
      email: boolean;
      sistema: boolean;
      frecuencia: 'INMEDIATA' | 'DIARIA' | 'SEMANAL';
    };
  };
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export interface ConfiguracionGeneral {
  id: number;
  configuracion: {
    sistema: {
      nombre: string;
      version: string;
      idioma: 'ES' | 'EN';
      tema: 'CLARO' | 'OSCURO';
      timezone: string;
      fechaFormato: string;
    };
    gobernanza: {
      requiereAprobacion: boolean;
      permiteDelegacion: boolean;
      limiteTiempoAsignacion: number;
      alertasVencimiento: boolean;
      diasAlertaVencimiento: number;
      escalamientoAutomatico: boolean;
      horasEscalamiento: number;
      permiteMultiplesRoles: boolean;
      logHistorial: boolean;
      retencionHistorial: number;
    };
    seguridad: {
      sesionTimeout: number;
      intentosLoginMax: number;
      passwordComplexidad: boolean;
      dobleFactorAuth: boolean;
      auditoria: boolean;
      encriptacion: boolean;
    };
    notificaciones: {
      emailServidor: string;
      emailPuerto: number;
      emailUsuario: string;
      emailPassword: string;
      smsProveedor: string;
      smsApiKey: string;
      pushNotifications: boolean;
    };
    integraciones: {
      activeDirectory: boolean;
      ldap: boolean;
      sso: boolean;
      api: boolean;
      webhook: boolean;
    };
  };
  fechaModificacion: string;
  modificadoPor: string;
}

// Mocks de datos para configuración
export const configuracionRolesMocks: ConfiguracionRol[] = [
  {
    id: 1,
    codigo: 'OWNER',
    nombre: 'Propietario',
    descripcion: 'Responsable principal de la entidad con todos los permisos',
    nivel: 1,
    color: '#ef4444',
    badge: 'Propietario',
    permisos: {
      crear: true,
      editar: true,
      eliminar: true,
      asignar: true,
      transferir: true,
      revocar: true,
      renovar: true,
      verHistorial: true,
      verNotificaciones: true,
      exportar: true
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema',
    fechaModificacion: '2024-01-15T10:30:00Z',
    modificadoPor: 'admin@empresa.com'
  },
  {
    id: 2,
    codigo: 'SUPERVISOR',
    nombre: 'Supervisor',
    descripcion: 'Supervisa la gestión de la entidad',
    nivel: 2,
    color: '#f59e0b',
    badge: 'Supervisor',
    permisos: {
      crear: false,
      editar: true,
      eliminar: false,
      asignar: true,
      transferir: false,
      revocar: false,
      renovar: true,
      verHistorial: true,
      verNotificaciones: true,
      exportar: true
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 3,
    codigo: 'EDITOR',
    nombre: 'Editor',
    descripcion: 'Puede editar contenido y configuración',
    nivel: 3,
    color: '#3b82f6',
    badge: 'Editor',
    permisos: {
      crear: false,
      editar: true,
      eliminar: false,
      asignar: false,
      transferir: false,
      revocar: false,
      renovar: false,
      verHistorial: true,
      verNotificaciones: false,
      exportar: false
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 4,
    codigo: 'REVISOR',
    nombre: 'Revisor',
    descripcion: 'Revisa y valida contenido',
    nivel: 4,
    color: '#10b981',
    badge: 'Revisor',
    permisos: {
      crear: false,
      editar: false,
      eliminar: false,
      asignar: false,
      transferir: false,
      revocar: false,
      renovar: false,
      verHistorial: true,
      verNotificaciones: false,
      exportar: false
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 5,
    codigo: 'CONSULTOR',
    nombre: 'Consultor',
    descripcion: 'Acceso de solo lectura para consulta',
    nivel: 5,
    color: '#6b7280',
    badge: 'Consultor',
    permisos: {
      crear: false,
      editar: false,
      eliminar: false,
      asignar: false,
      transferir: false,
      revocar: false,
      renovar: false,
      verHistorial: true,
      verNotificaciones: false,
      exportar: false
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  }
];

export const configuracionTiposEntidadMocks: ConfiguracionTipoEntidad[] = [
  {
    id: 1,
    codigo: 'SISTEMA',
    nombre: 'Sistema',
    descripcion: 'Sistemas informáticos y aplicaciones',
    version: '1.0',
    camposObligatorios: ['nombre', 'descripcion', 'propietario', 'criticidad'],
    flujoAprobacion: true,
    plantillaMetadata: {
      criticidad: ['ALTA', 'MEDIA', 'BAJA'],
      ambiente: ['PRODUCCION', 'DESARROLLO', 'PRUEBAS'],
      tecnologia: ['JAVA', 'NET', 'PYTHON', 'NODE', 'REACT', 'ANGULAR']
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 2,
    codigo: 'PROCESO',
    nombre: 'Proceso',
    descripcion: 'Procesos de negocio y operativos',
    version: '1.0',
    camposObligatorios: ['nombre', 'descripcion', 'propietario', 'tipo'],
    flujoAprobacion: true,
    plantillaMetadata: {
      tipo: ['CORE', 'APOYO', 'ESTRATEGICO'],
      complejidad: ['ALTA', 'MEDIA', 'BAJA'],
      frecuencia: ['DIARIA', 'SEMANAL', 'MENSUAL', 'TRIMESTRAL']
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 3,
    codigo: 'DOCUMENTO',
    nombre: 'Documento',
    descripcion: 'Documentos y políticas corporativas',
    version: '1.0',
    camposObligatorios: ['nombre', 'descripcion', 'propietario', 'categoria'],
    flujoAprobacion: true,
    plantillaMetadata: {
      categoria: ['POLITICA', 'PROCEDIMIENTO', 'INSTRUCTIVO', 'FORMATO'],
      confidencialidad: ['PUBLICA', 'INTERNA', 'CONFIDENCIAL', 'RESTRINGIDA']
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  }
];

export const configuracionReglasMocks: ConfiguracionRegla[] = [
  {
    id: 1,
    codigo: 'LIMITE_USUARIOS_SISTEMA',
    nombre: 'Límite de usuarios por sistema',
    descripcion: 'Máximo 5 usuarios con roles activos por sistema',
    tipo: 'LIMITE_USUARIOS',
    condiciones: {
      tipoEntidad: 'SISTEMA',
      maxUsuarios: 5,
      rolesExcluidos: ['CONSULTOR']
    },
    acciones: {
      bloquearAsignacion: true,
      notificarPropietario: true,
      requiereAprobacion: true
    },
    activo: true,
    prioridad: 1,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 2,
    codigo: 'OBLIGATORIO_PROPIETARIO',
    nombre: 'Propietario obligatorio',
    descripcion: 'Toda entidad debe tener un propietario asignado',
    tipo: 'OBLIGATORIEDAD',
    condiciones: {
      tipoEntidad: 'TODOS',
      rolObligatorio: 'OWNER'
    },
    acciones: {
      bloquearCreacion: true,
      notificarAdministrador: true,
      asignarPorDefecto: false
    },
    activo: true,
    prioridad: 1,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 3,
    codigo: 'TRANSFERENCIA_APROBACION',
    nombre: 'Transferencia requiere aprobación',
    descripcion: 'Transferencia de propietario requiere aprobación del supervisor',
    tipo: 'TRANSFERENCIA',
    condiciones: {
      rolOrigen: 'OWNER',
      requiereAprobacion: true,
      aprobadores: ['SUPERVISOR']
    },
    acciones: {
      enviarNotificacion: true,
      crearTarea: true,
      tiempoLimite: 72
    },
    activo: true,
    prioridad: 2,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  }
];

export const configuracionAlertasMocks: ConfiguracionAlerta[] = [
  {
    id: 1,
    codigo: 'VENCIMIENTO_30_DIAS',
    nombre: 'Alerta vencimiento 30 días',
    descripcion: 'Notificación 30 días antes del vencimiento',
    tipo: 'VENCIMIENTO',
    umbral: 30,
    unidad: 'DIAS',
    plantilla: {
      asunto: 'Rol próximo a vencer - {{entidad}}',
      cuerpo: 'Su rol {{rol}} en {{entidad}} vencerá el {{fecha_vencimiento}}. Por favor, gestione la renovación.',
      variables: ['entidad', 'rol', 'fecha_vencimiento', 'usuario']
    },
    canales: ['EMAIL', 'SISTEMA'],
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 2,
    codigo: 'VENCIMIENTO_7_DIAS',
    nombre: 'Alerta vencimiento 7 días',
    descripcion: 'Notificación urgente 7 días antes del vencimiento',
    tipo: 'VENCIMIENTO',
    umbral: 7,
    unidad: 'DIAS',
    plantilla: {
      asunto: 'URGENTE: Rol próximo a vencer - {{entidad}}',
      cuerpo: 'Su rol {{rol}} en {{entidad}} vencerá en {{dias}} días. Acción requerida inmediata.',
      variables: ['entidad', 'rol', 'dias', 'usuario']
    },
    canales: ['EMAIL', 'SMS', 'PUSH', 'SISTEMA'],
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 3,
    codigo: 'ASIGNACION_NUEVA',
    nombre: 'Nueva asignación',
    descripcion: 'Notificación de nueva asignación de rol',
    tipo: 'ASIGNACION',
    umbral: 0,
    unidad: 'MINUTOS',
    plantilla: {
      asunto: 'Nuevo rol asignado - {{entidad}}',
      cuerpo: 'Se le ha asignado el rol {{rol}} en {{entidad}}. Válido hasta {{fecha_vencimiento}}.',
      variables: ['entidad', 'rol', 'fecha_vencimiento', 'usuario', 'asignado_por']
    },
    canales: ['EMAIL', 'SISTEMA'],
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  }
];

export const configuracionFlujosMocks: ConfiguracionFlujo[] = [
  {
    id: 1,
    codigo: 'ASIGNACION_PROPIETARIO',
    nombre: 'Asignación de Propietario',
    descripcion: 'Flujo para asignar rol de propietario',
    tipoEntidad: 'SISTEMA',
    tipoAccion: 'ASIGNACION',
    pasos: [
      {
        orden: 1,
        nombre: 'Validación inicial',
        tipo: 'VALIDACION',
        aprobadores: ['SISTEMA'],
        condiciones: { verificarCapacidad: true, validarPermisos: true },
        autoAprobacion: true,
        tiempoLimite: 1,
        escalamiento: false
      },
      {
        orden: 2,
        nombre: 'Aprobación supervisor',
        tipo: 'APROBACION',
        aprobadores: ['SUPERVISOR'],
        condiciones: { requiereJustificacion: true },
        autoAprobacion: false,
        tiempoLimite: 48,
        escalamiento: true
      },
      {
        orden: 3,
        nombre: 'Notificación y ejecución',
        tipo: 'EJECUCION',
        aprobadores: ['SISTEMA'],
        condiciones: { enviarNotificacion: true },
        autoAprobacion: true,
        tiempoLimite: 1,
        escalamiento: false
      }
    ],
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 2,
    codigo: 'TRANSFERENCIA_PROPIETARIO',
    nombre: 'Transferencia de Propietario',
    descripcion: 'Flujo para transferir rol de propietario',
    tipoEntidad: 'PROCESO',
    tipoAccion: 'TRANSFERENCIA',
    pasos: [
      {
        orden: 1,
        nombre: 'Solicitud transferencia',
        tipo: 'NOTIFICACION',
        aprobadores: ['OWNER'],
        condiciones: { requiereMotivo: true },
        autoAprobacion: false,
        tiempoLimite: 24,
        escalamiento: true
      },
      {
        orden: 2,
        nombre: 'Validación usuario destino',
        tipo: 'VALIDACION',
        aprobadores: ['SISTEMA'],
        condiciones: { verificarCapacidad: true, validarPermisos: true },
        autoAprobacion: true,
        tiempoLimite: 1,
        escalamiento: false
      },
      {
        orden: 3,
        nombre: 'Aprobación gerencial',
        tipo: 'APROBACION',
        aprobadores: ['SUPERVISOR'],
        condiciones: { requiereJustificacion: true },
        autoAprobacion: false,
        tiempoLimite: 72,
        escalamiento: true
      },
      {
        orden: 4,
        nombre: 'Ejecución transferencia',
        tipo: 'EJECUCION',
        aprobadores: ['SISTEMA'],
        condiciones: { enviarNotificacion: true, actualizarHistorial: true },
        autoAprobacion: true,
        tiempoLimite: 1,
        escalamiento: false
      }
    ],
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  }
];

export const configuracionExportacionMocks: ConfiguracionExportacion[] = [
  {
    id: 1,
    codigo: 'REPORTE_GOBERNANZA_COMPLETO',
    nombre: 'Reporte Gobernanza Completo',
    descripcion: 'Exportación completa de todas las entidades y asignaciones',
    tipo: 'EXCEL',
    plantilla: {
      nombre: 'Gobernanza_Completo_{{fecha}}',
      hojas: [
        {
          nombre: 'Entidades',
          campos: ['id', 'nombre', 'tipo', 'estado', 'propietario', 'responsables', 'alertas'],
          filtros: { activo: true },
          formato: { encabezados: true, colores: true }
        },
        {
          nombre: 'Asignaciones',
          campos: ['entidad', 'rol', 'usuario', 'fechaAsignacion', 'fechaVencimiento', 'estado'],
          filtros: { activo: true },
          formato: { encabezados: true, fechas: 'DD/MM/YYYY' }
        },
        {
          nombre: 'Historial',
          campos: ['fecha', 'entidad', 'accion', 'usuarioAnterior', 'usuarioNuevo', 'motivo'],
          filtros: { ultimosMeses: 6 },
          formato: { encabezados: true, ordenar: 'fecha_desc' }
        }
      ]
    },
    programacion: {
      activo: false,
      frecuencia: 'MENSUAL',
      dia: 1,
      hora: '08:00',
      destinatarios: ['admin@empresa.com', 'supervisor@empresa.com']
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 2,
    codigo: 'REPORTE_VENCIMIENTOS',
    nombre: 'Reporte de Vencimientos',
    descripcion: 'Exportación de roles próximos a vencer',
    tipo: 'EXCEL',
    plantilla: {
      nombre: 'Vencimientos_{{fecha}}',
      hojas: [
        {
          nombre: 'Vencimientos',
          campos: ['entidad', 'rol', 'usuario', 'fechaVencimiento', 'diasRestantes', 'estado'],
          filtros: { proximosVencer: 30 },
          formato: { encabezados: true, condicional: true }
        }
      ]
    },
    programacion: {
      activo: true,
      frecuencia: 'SEMANAL',
      dia: 1,
      hora: '07:00',
      destinatarios: ['admin@empresa.com']
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  }
];

export const configuracionUsuariosMocks: ConfiguracionUsuario[] = [
  {
    id: 1,
    codigo: 'ADMIN_001',
    nombre: 'María García',
    email: 'admin@empresa.com',
    telefono: '+51 999 123 456',
    cargo: 'Administrador de Sistema',
    departamento: 'Tecnología',
    ubicacion: 'Lima, Perú',
    permisos: {
      modulos: ['GOBERNANZA', 'SISTEMAS', 'USUARIOS', 'CONFIGURACION'],
      roles: ['OWNER', 'SUPERVISOR', 'EDITOR', 'REVISOR', 'CONSULTOR'],
      entidades: ['TODOS'],
      acciones: ['CREAR', 'EDITAR', 'ELIMINAR', 'ASIGNAR', 'TRANSFERIR', 'REVOCAR', 'RENOVAR', 'EXPORTAR']
    },
    grupoUsuarios: ['ADMINISTRADORES', 'SUPER_USUARIOS'],
    jerarquia: {
      subordinados: [2, 3, 4]
    },
    configuracionPersonal: {
      idioma: 'ES',
      tema: 'CLARO',
      notificaciones: {
        email: true,
        sistema: true,
        frecuencia: 'INMEDIATA'
      }
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    ultimoAcceso: '2024-01-20T14:30:00Z'
  },
  {
    id: 2,
    codigo: 'SUP_001',
    nombre: 'Carlos Mendoza',
    email: 'supervisor@empresa.com',
    telefono: '+51 999 234 567',
    cargo: 'Supervisor de Procesos',
    departamento: 'Operaciones',
    ubicacion: 'Lima, Perú',
    permisos: {
      modulos: ['GOBERNANZA', 'SISTEMAS', 'PROCESOS'],
      roles: ['SUPERVISOR', 'EDITOR', 'REVISOR', 'CONSULTOR'],
      entidades: ['PROCESO', 'SISTEMA'],
      acciones: ['EDITAR', 'ASIGNAR', 'RENOVAR', 'EXPORTAR']
    },
    grupoUsuarios: ['SUPERVISORES'],
    jerarquia: {
      superior: 1,
      subordinados: [5, 6]
    },
    configuracionPersonal: {
      idioma: 'ES',
      tema: 'OSCURO',
      notificaciones: {
        email: true,
        sistema: true,
        frecuencia: 'DIARIA'
      }
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    ultimoAcceso: '2024-01-20T12:15:00Z'
  },
  {
    id: 3,
    codigo: 'ED_001',
    nombre: 'Ana Rodríguez',
    email: 'editor@empresa.com',
    cargo: 'Editor de Contenido',
    departamento: 'Calidad',
    ubicacion: 'Lima, Perú',
    permisos: {
      modulos: ['GOBERNANZA', 'DOCUMENTOS'],
      roles: ['EDITOR', 'REVISOR', 'CONSULTOR'],
      entidades: ['DOCUMENTO', 'POLITICA'],
      acciones: ['EDITAR', 'REVISAR']
    },
    grupoUsuarios: ['EDITORES'],
    jerarquia: {
      superior: 1,
      subordinados: []
    },
    configuracionPersonal: {
      idioma: 'ES',
      tema: 'AUTO',
      notificaciones: {
        email: true,
        sistema: false,
        frecuencia: 'DIARIA'
      }
    },
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    ultimoAcceso: '2024-01-19T16:45:00Z'
  }
];

export const configuracionGeneralMocks: ConfiguracionGeneral = {
  id: 1,
  configuracion: {
    sistema: {
      nombre: 'Sistema de Gestión por Procesos',
      version: '2.1.0',
      idioma: 'ES',
      tema: 'CLARO',
      timezone: 'America/Lima',
      fechaFormato: 'DD/MM/YYYY'
    },
    gobernanza: {
      requiereAprobacion: true,
      permiteDelegacion: false,
      limiteTiempoAsignacion: 72,
      alertasVencimiento: true,
      diasAlertaVencimiento: 30,
      escalamientoAutomatico: true,
      horasEscalamiento: 48,
      permiteMultiplesRoles: true,
      logHistorial: true,
      retencionHistorial: 365
    },
    seguridad: {
      sesionTimeout: 480,
      intentosLoginMax: 3,
      passwordComplexidad: true,
      dobleFactorAuth: false,
      auditoria: true,
      encriptacion: true
    },
    notificaciones: {
      emailServidor: 'smtp.empresa.com',
      emailPuerto: 587,
      emailUsuario: 'notificaciones@empresa.com',
      emailPassword: '***',
      smsProveedor: 'TwilioSMS',
      smsApiKey: '***',
      pushNotifications: true
    },
    integraciones: {
      activeDirectory: true,
      ldap: false,
      sso: true,
      api: true,
      webhook: false
    }
  },
  fechaModificacion: '2024-01-15T10:30:00Z',
  modificadoPor: 'admin@empresa.com'
};

// Funciones para obtener datos de configuración
export const getConfiguracionRoles = (): ConfiguracionRol[] => {
  return configuracionRolesMocks;
};

export const getConfiguracionTiposEntidad = (): ConfiguracionTipoEntidad[] => {
  return configuracionTiposEntidadMocks;
};

export const getConfiguracionReglas = (): ConfiguracionRegla[] => {
  return configuracionReglasMocks;
};

export const getConfiguracionAlertas = (): ConfiguracionAlerta[] => {
  return configuracionAlertasMocks;
};

export const getConfiguracionFlujos = (): ConfiguracionFlujo[] => {
  return configuracionFlujosMocks;
};

export const getConfiguracionExportacion = (): ConfiguracionExportacion[] => {
  return configuracionExportacionMocks;
};

export const getConfiguracionUsuarios = (): ConfiguracionUsuario[] => {
  return configuracionUsuariosMocks;
};

export const getConfiguracionGeneral = (): ConfiguracionGeneral => {
  return configuracionGeneralMocks;
};

// Funciones para actualizar configuración
export const actualizarConfiguracionRol = (id: number, datos: Partial<ConfiguracionRol>): ConfiguracionRol | null => {
  const index = configuracionRolesMocks.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  configuracionRolesMocks[index] = { ...configuracionRolesMocks[index], ...datos };
  return configuracionRolesMocks[index];
};

export const crearConfiguracionRol = (datos: Omit<ConfiguracionRol, 'id'>): ConfiguracionRol => {
  const nuevoId = Math.max(...configuracionRolesMocks.map(r => r.id)) + 1;
  const nuevoRol: ConfiguracionRol = { ...datos, id: nuevoId };
  configuracionRolesMocks.push(nuevoRol);
  return nuevoRol;
};

export const eliminarConfiguracionRol = (id: number): boolean => {
  const index = configuracionRolesMocks.findIndex(r => r.id === id);
  if (index === -1) return false;
  
  configuracionRolesMocks.splice(index, 1);
  return true;
};

export const actualizarConfiguracionGeneral = (datos: Partial<ConfiguracionGeneral['configuracion']>): ConfiguracionGeneral => {
  configuracionGeneralMocks.configuracion = { ...configuracionGeneralMocks.configuracion, ...datos };
  configuracionGeneralMocks.fechaModificacion = new Date().toISOString();
  return configuracionGeneralMocks;
};