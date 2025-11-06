/**
 * Mocks para estructura SOE (Sponsor, Owner, Ejecutor) y flujos de aprobación de gobernanza
 */

// =============================================
// INTERFACES SOE
// =============================================

export interface UsuarioSOE {
  id: number;
  nombre: string;
  email: string;
  rol: 'SPONSOR' | 'OWNER' | 'EJECUTOR';
  activo: boolean;
  fechaAsignacion: string;
  departamento?: string;
  cargo?: string;
}

export interface GobernanzaSOE {
  id: number;
  tipoEntidad: 'SISTEMA' | 'PROCESO' | 'RIESGO';
  tipoEntidadNombre: string;
  usuarios: UsuarioSOE[];
  estado: 'ACTIVO' | 'PENDIENTE' | 'SUSPENDIDO';
  fechaCreacion: string;
  creadoPor: string;
  observaciones?: string;
}

export interface SolicitudAprobacion {
  id: number;
  tipoOperacion: 'CREAR' | 'EDITAR' | 'ELIMINAR';
  entidadNombre: string;
  entidadTipo: string;
  solicitadoPor: UsuarioSOE;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaSolicitud: string;
  motivoSolicitud: string;
  aprobaciones: AprobacionSOE[];
  datosEntidad?: any; // Datos de la entidad a crear/modificar
  esBorrador?: boolean; // Para distinguir borradores de solicitudes en proceso
}

export interface AprobacionSOE {
  id: number;
  solicitudId: number;
  aprobador: UsuarioSOE;
  rolAprobador: 'SPONSOR' | 'OWNER';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaRespuesta?: string;
  comentarios?: string;
  orden: number; // Orden de aprobación (1 = Owner, 2 = Sponsor)
}

// =============================================
// DATOS MOCK
// =============================================

// Contador para generar IDs únicos
let solicitudIdCounter = 1000;
let aprobacionIdCounter = 2000;

export const usuariosSOEMocks: UsuarioSOE[] = [
  // SPONSOR
  {
    id: 1,
    nombre: 'Erick Machuca',
    email: 'erick.machuca@empresa.com',
    rol: 'SPONSOR',
    activo: true,
    fechaAsignacion: '2024-01-01T00:00:00Z',
    departamento: 'Dirección General',
    cargo: 'Director General'
  },
  
  // OWNERS
  {
    id: 2,
    nombre: 'Antonio Torre',
    email: 'antonio.torre@empresa.com',
    rol: 'OWNER',
    activo: true,
    fechaAsignacion: '2024-01-01T00:00:00Z',
    departamento: 'Ingeniería de Procesos',
    cargo: 'Ingeniero de Procesos Senior'
  },
  {
    id: 3,
    nombre: 'María González',
    email: 'maria.gonzalez@empresa.com',
    rol: 'OWNER',
    activo: true,
    fechaAsignacion: '2024-01-15T00:00:00Z',
    departamento: 'Tecnología',
    cargo: 'Arquitecta de Sistemas'
  },

  // EJECUTORES
  {
    id: 4,
    nombre: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    rol: 'EJECUTOR',
    activo: true,
    fechaAsignacion: '2024-01-01T00:00:00Z',
    departamento: 'Desarrollo',
    cargo: 'Desarrollador Senior'
  },
  {
    id: 5,
    nombre: 'Ana López',
    email: 'ana.lopez@empresa.com',
    rol: 'EJECUTOR',
    activo: true,
    fechaAsignacion: '2024-01-10T00:00:00Z',
    departamento: 'Desarrollo',
    cargo: 'Desarrolladora Frontend'
  },
  {
    id: 6,
    nombre: 'Carlos Silva',
    email: 'carlos.silva@empresa.com',
    rol: 'EJECUTOR',
    activo: true,
    fechaAsignacion: '2024-01-20T00:00:00Z',
    departamento: 'Infraestructura',
    cargo: 'Administrador de Sistemas'
  },
  {
    id: 7,
    nombre: 'Laura Martínez',
    email: 'laura.martinez@empresa.com',
    rol: 'EJECUTOR',
    activo: false,
    fechaAsignacion: '2024-01-05T00:00:00Z',
    departamento: 'QA',
    cargo: 'Analista de Calidad'
  }
];

export const gobernanzaSOEMocks: GobernanzaSOE[] = [
  {
    id: 1,
    tipoEntidad: 'SISTEMA',
    tipoEntidadNombre: 'Sistemas de Información',
    usuarios: [
      usuariosSOEMocks[0], // Sponsor: Erick Machuca
      usuariosSOEMocks[1], // Owner: Antonio Torre
      usuariosSOEMocks[3], // Ejecutor: Juan Pérez
      usuariosSOEMocks[4], // Ejecutor: Ana López
      usuariosSOEMocks[5]  // Ejecutor: Carlos Silva
    ],
    estado: 'ACTIVO',
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'admin@empresa.com',
    observaciones: 'Gobernanza establecida para todos los sistemas de información de la organización'
  },
  {
    id: 2,
    tipoEntidad: 'PROCESO',
    tipoEntidadNombre: 'Procesos de Negocio',
    usuarios: [
      usuariosSOEMocks[0], // Sponsor: Erick Machuca
      usuariosSOEMocks[2], // Owner: María González
      usuariosSOEMocks[4], // Ejecutor: Ana López
    ],
    estado: 'ACTIVO',
    fechaCreacion: '2024-01-15T00:00:00Z',
    creadoPor: 'admin@empresa.com',
    observaciones: 'Gobernanza para procesos críticos del negocio'
  }
];

export const solicitudesAprobacionMocks: SolicitudAprobacion[] = [
  {
    id: 1,
    tipoOperacion: 'CREAR',
    entidadNombre: 'Sistema de Inventarios',
    entidadTipo: 'SISTEMA',
    solicitadoPor: usuariosSOEMocks[3], // Juan Pérez (Ejecutor)
    estado: 'PENDIENTE',
    fechaSolicitud: '2024-01-25T10:30:00Z',
    motivoSolicitud: 'Necesidad de implementar control de inventarios para el almacén principal',
    aprobaciones: [
      {
        id: 1,
        solicitudId: 1,
        aprobador: usuariosSOEMocks[1], // Antonio Torre (Owner)
        rolAprobador: 'OWNER',
        estado: 'PENDIENTE',
        orden: 1
      },
      {
        id: 2,
        solicitudId: 1,
        aprobador: usuariosSOEMocks[0], // Erick Machuca (Sponsor)
        rolAprobador: 'SPONSOR',
        estado: 'PENDIENTE',
        orden: 2
      }
    ],
    datosEntidad: {
      nombreSistema: 'Sistema de Inventarios',
      descripcion: 'Sistema para gestión de inventarios y almacén',
      tipoSistema: 'WEB',
      familiaSistema: 'GESTION'
    }
  }
];

// =============================================
// FUNCIONES HELPER
// =============================================

export const getGobernanzaByTipoEntidad = (tipoEntidad: string): GobernanzaSOE | null => {
  return gobernanzaSOEMocks.find(g => g.tipoEntidad === tipoEntidad) || null;
};

export const getUsuariosByRol = (rol: 'SPONSOR' | 'OWNER' | 'EJECUTOR'): UsuarioSOE[] => {
  return usuariosSOEMocks.filter(u => u.rol === rol && u.activo);
};

export const getEjecutoresDisponibles = (): UsuarioSOE[] => {
  return usuariosSOEMocks.filter(u => u.rol === 'EJECUTOR');
};

export const crearSolicitudAprobacion = (
  tipoOperacion: 'CREAR' | 'EDITAR' | 'ELIMINAR',
  entidadNombre: string,
  entidadTipo: string,
  solicitadoPor: UsuarioSOE,
  motivoSolicitud: string,
  datosEntidad?: any,
  esBorrador: boolean = false
): SolicitudAprobacion => {
  const gobernanza = getGobernanzaByTipoEntidad(entidadTipo);
  if (!gobernanza && !esBorrador) {
    throw new Error(`No existe gobernanza configurada para tipo de entidad: ${entidadTipo}`);
  }

  const nuevaSolicitud: SolicitudAprobacion = {
    id: solicitudIdCounter++, // Mock ID
    tipoOperacion,
    entidadNombre,
    entidadTipo,
    solicitadoPor,
    estado: esBorrador ? 'PENDIENTE' : 'PENDIENTE',
    fechaSolicitud: new Date().toISOString(),
    motivoSolicitud,
    datosEntidad,
    esBorrador,
    aprobaciones: []
  };

  // Si no es borrador, agregar aprobaciones
  if (!esBorrador && gobernanza) {
    const owner = gobernanza.usuarios.find(u => u.rol === 'OWNER');
    const sponsor = gobernanza.usuarios.find(u => u.rol === 'SPONSOR');

    if (!owner || !sponsor) {
      throw new Error('Gobernanza incompleta: falta Owner o Sponsor');
    }

    nuevaSolicitud.aprobaciones = [
      {
        id: aprobacionIdCounter++,
        solicitudId: nuevaSolicitud.id,
        aprobador: owner,
        rolAprobador: 'OWNER',
        estado: 'PENDIENTE',
        orden: 1
      },
      {
        id: aprobacionIdCounter++,
        solicitudId: nuevaSolicitud.id,
        aprobador: sponsor,
        rolAprobador: 'SPONSOR',
        estado: 'PENDIENTE',
        orden: 2
      }
    ];
  }

  // Agregar a mocks
  solicitudesAprobacionMocks.push(nuevaSolicitud);
  
  return nuevaSolicitud;
};

export const aprobarSolicitud = (
  solicitudId: number,
  aprobadorId: number,
  aprobado: boolean,
  comentarios?: string
): boolean => {
  const solicitud = solicitudesAprobacionMocks.find(s => s.id === solicitudId);
  if (!solicitud) return false;

  const aprobacion = solicitud.aprobaciones.find(a => a.aprobador.id === aprobadorId);
  if (!aprobacion) return false;

  aprobacion.estado = aprobado ? 'APROBADO' : 'RECHAZADO';
  aprobacion.fechaRespuesta = new Date().toISOString();
  aprobacion.comentarios = comentarios;

  // Verificar si todas las aprobaciones están completas
  const todasAprobaciones = solicitud.aprobaciones.every(a => a.estado !== 'PENDIENTE');
  const todasAprobadas = solicitud.aprobaciones.every(a => a.estado === 'APROBADO');

  if (todasAprobaciones) {
    solicitud.estado = todasAprobadas ? 'APROBADO' : 'RECHAZADO';
  }

  return true;
};

// =============================================
// FUNCIONES ADICIONALES PARA BORRADORES Y ESTADOS
// =============================================

export const crearBorrador = (
  tipoOperacion: 'CREAR' | 'EDITAR' | 'ELIMINAR',
  entidadNombre: string,
  entidadTipo: string,
  solicitadoPor: UsuarioSOE,
  motivoSolicitud: string,
  datosEntidad?: any
): SolicitudAprobacion => {
  return crearSolicitudAprobacion(
    tipoOperacion, 
    entidadNombre, 
    entidadTipo, 
    solicitadoPor, 
    motivoSolicitud, 
    datosEntidad, 
    true
  );
};

export const convertirBorradorASolicitud = (solicitudId: number): SolicitudAprobacion | null => {
  const solicitud = solicitudesAprobacionMocks.find(s => s.id === solicitudId);
  if (!solicitud || !solicitud.esBorrador) return null;

  const gobernanza = getGobernanzaByTipoEntidad(solicitud.entidadTipo);
  if (!gobernanza) return null;

  const owner = gobernanza.usuarios.find(u => u.rol === 'OWNER');
  const sponsor = gobernanza.usuarios.find(u => u.rol === 'SPONSOR');

  if (!owner || !sponsor) return null;

  // Convertir borrador a solicitud con aprobaciones
  solicitud.esBorrador = false;
  solicitud.fechaSolicitud = new Date().toISOString();
  solicitud.aprobaciones = [
    {
      id: aprobacionIdCounter++,
      solicitudId: solicitud.id,
      aprobador: owner,
      rolAprobador: 'OWNER',
      estado: 'PENDIENTE',
      orden: 1
    },
    {
      id: aprobacionIdCounter++,
      solicitudId: solicitud.id,
      aprobador: sponsor,
      rolAprobador: 'SPONSOR',
      estado: 'PENDIENTE',
      orden: 2
    }
  ];

  return solicitud;
};

export const getBorradores = (usuarioId?: number): SolicitudAprobacion[] => {
  let borradores = solicitudesAprobacionMocks.filter(s => s.esBorrador);
  
  if (usuarioId) {
    borradores = borradores.filter(s => s.solicitadoPor.id === usuarioId);
  }
  
  return borradores.sort((a, b) => 
    new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
  );
};

export const getSolicitudesPendientes = (usuarioId?: number): SolicitudAprobacion[] => {
  let solicitudes = solicitudesAprobacionMocks.filter(s => !s.esBorrador && s.estado === 'PENDIENTE');
  
  if (usuarioId) {
    // Filtrar solicitudes donde el usuario es aprobador y su aprobación está pendiente
    solicitudes = solicitudes.filter(s => 
      s.aprobaciones.some(a => a.aprobador.id === usuarioId && a.estado === 'PENDIENTE')
    );
  }
  
  return solicitudes.sort((a, b) => 
    new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
  );
};

export const getSolicitudesByEstado = (
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
): SolicitudAprobacion[] => {
  return solicitudesAprobacionMocks
    .filter(s => !s.esBorrador && s.estado === estado)
    .sort((a, b) => 
      new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
    );
};

export const getEstadisticasAprobaciones = () => {
  const total = solicitudesAprobacionMocks.filter(s => !s.esBorrador).length;
  const pendientes = solicitudesAprobacionMocks.filter(s => !s.esBorrador && s.estado === 'PENDIENTE').length;
  const aprobadas = solicitudesAprobacionMocks.filter(s => !s.esBorrador && s.estado === 'APROBADO').length;
  const rechazadas = solicitudesAprobacionMocks.filter(s => !s.esBorrador && s.estado === 'RECHAZADO').length;
  const borradores = solicitudesAprobacionMocks.filter(s => s.esBorrador).length;

  return {
    total,
    pendientes,
    aprobadas,
    rechazadas,
    borradores,
    porcentajeAprobacion: total > 0 ? (aprobadas / total) * 100 : 0
  };
};

// =============================================
// FUNCIONES PARA SEGUIMIENTO POR SISTEMA
// =============================================

export const getSolicitudesBySistema = (sistemaId: number): SolicitudAprobacion[] => {
  const resultado = solicitudesAprobacionMocks.filter(s => {
    // Buscar por múltiples criterios para mayor flexibilidad
    const match = (
      s.datosEntidad?.sistemaId === sistemaId || 
      s.entidadNombre.includes(`Sistema ${sistemaId}`) ||
      s.entidadNombre.toLowerCase().includes('cvb') ||
      s.datosEntidad?.nombreSistema?.toLowerCase().includes('cvb') ||
      s.entidadNombre === 'cvb' ||
      s.datosEntidad?.nombreSistema === 'cvb'
    );
    
    return match;
  }).sort((a, b) => 
    new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
  );
  
  return resultado;
};

export const getEstadoAprobacionSistema = (sistemaId: number): {
  estado: 'SIN_SOLICITUDES' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'BORRADOR';
  ultimaSolicitud?: SolicitudAprobacion;
  cantidadPendientes: number;
  cantidadAprobadas: number;
  cantidadRechazadas: number;
  cantidadBorradores: number;
} => {
  const solicitudes = getSolicitudesBySistema(sistemaId);
  
  if (solicitudes.length === 0) {
    return {
      estado: 'SIN_SOLICITUDES',
      cantidadPendientes: 0,
      cantidadAprobadas: 0,
      cantidadRechazadas: 0,
      cantidadBorradores: 0
    };
  }

  const ultimaSolicitud = solicitudes[0]; // La más reciente
  const pendientes = solicitudes.filter(s => !s.esBorrador && s.estado === 'PENDIENTE').length;
  const aprobadas = solicitudes.filter(s => !s.esBorrador && s.estado === 'APROBADO').length;
  const rechazadas = solicitudes.filter(s => !s.esBorrador && s.estado === 'RECHAZADO').length;
  const borradores = solicitudes.filter(s => s.esBorrador).length;

  let estado: 'SIN_SOLICITUDES' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'BORRADOR';
  
  if (ultimaSolicitud.esBorrador) {
    estado = 'BORRADOR';
  } else {
    estado = ultimaSolicitud.estado;
  }

  return {
    estado,
    ultimaSolicitud,
    cantidadPendientes: pendientes,
    cantidadAprobadas: aprobadas,
    cantidadRechazadas: rechazadas,
    cantidadBorradores: borradores
  };
};

export const crearSolicitudMockParaSistema = (
  sistemaId: number,
  nombreSistema: string,
  tipoOperacion: 'CREAR' | 'EDITAR' | 'ELIMINAR' = 'EDITAR'
): SolicitudAprobacion => {
  const ejecutorActual = usuariosSOEMocks.find(u => u.rol === 'EJECUTOR' && u.activo) || usuariosSOEMocks[3];
  
  return crearSolicitudAprobacion(
    tipoOperacion,
    nombreSistema,
    'SISTEMA',
    ejecutorActual,
    `Solicitud de ${tipoOperacion.toLowerCase()} para el sistema ${nombreSistema}`,
    { 
      sistemaId,
      nombreSistema,
      tipoSistema: 'INTERNO',
      familiaSistema: 'ERP',
      fechaOperacion: new Date().toISOString()
    },
    false
  );
};

// =============================================
// CREAR SOLICITUDES MOCK DE EJEMPLO
// =============================================

// Crear algunas solicitudes de ejemplo para demostrar el seguimiento
export const inicializarSolicitudesMockParaSistemas = () => {
  if (solicitudesAprobacionMocks.length === 0) {
    
    // PRIMERO: Solicitudes específicas para sistema "cvb"
    // ================================================
    
    const solicitudCVBCrear = crearSolicitudAprobacion(
      'CREAR',
      'cvb',
      'SISTEMA',
      usuariosSOEMocks[3], // Ana López como ejecutor
      'Creación inicial del sistema cvb con funcionalidades básicas',
      {
        sistemaId: 1,
        nombreSistema: 'cvb',
        tipoSistema: 'APLICACION',
        familiaSistema: 'GESTION',
        descripcion: 'Sistema de gestión cvb',
        presupuesto: '$50,000 USD'
      },
      false
    );
    solicitudCVBCrear.estado = 'APROBADO';
    solicitudCVBCrear.fechaSolicitud = new Date(Date.now() - 2592000000).toISOString(); // Hace 1 mes
    solicitudCVBCrear.aprobaciones[0].estado = 'APROBADO';
    solicitudCVBCrear.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 2419200000).toISOString();
    solicitudCVBCrear.aprobaciones[0].comentarios = '✅ Sistema cvb aprobado para creación. Funcionalidades necesarias.';
    solicitudCVBCrear.aprobaciones[1].estado = 'APROBADO';
    solicitudCVBCrear.aprobaciones[1].fechaRespuesta = new Date(Date.now() - 2332800000).toISOString();
    solicitudCVBCrear.aprobaciones[1].comentarios = '✅ APROBACION FINAL: Sistema cvb aprobado para implementación.';

    const solicitudCVBEditar = crearSolicitudAprobacion(
      'EDITAR',
      'cvb',
      'SISTEMA',
      usuariosSOEMocks[3], // Ana López como ejecutor
      'Actualización del sistema cvb - Nuevas funcionalidades de reportes',
      {
        sistemaId: 1,
        nombreSistema: 'cvb',
        cambiosSolicitados: [
          'Módulo de reportes avanzados',
          'Dashboard de métricas',
          'Exportación de datos'
        ],
        presupuestoAdicional: '$15,000 USD'
      },
      false
    );
    solicitudCVBEditar.fechaSolicitud = new Date(Date.now() - 172800000).toISOString(); // Hace 2 días
    solicitudCVBEditar.aprobaciones[0].estado = 'APROBADO';
    solicitudCVBEditar.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 86400000).toISOString(); // Hace 1 día
    solicitudCVBEditar.aprobaciones[0].comentarios = '✅ Cambios para sistema cvb son necesarios. Aprobado técnicamente.';
    // Sponsor aún pendiente
    solicitudCVBEditar.aprobaciones[1].estado = 'PENDIENTE';
    // Sistema 1 - Solicitud aprobada
    const solicitud1 = crearSolicitudMockParaSistema(1, 'Sistema de Gestión de Procesos', 'EDITAR');
    solicitud1.estado = 'APROBADO';
    solicitud1.aprobaciones[0].estado = 'APROBADO';
    solicitud1.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 86400000).toISOString(); // Hace 1 día
    solicitud1.aprobaciones[0].comentarios = 'Cambios aprobados, proceder con la implementación';
    solicitud1.aprobaciones[1].estado = 'APROBADO';
    solicitud1.aprobaciones[1].fechaRespuesta = new Date().toISOString();
    solicitud1.aprobaciones[1].comentarios = 'Aprobación final confirmada';

    // Sistema 2 - Solicitud pendiente
    const solicitud2 = crearSolicitudMockParaSistema(2, 'Sistema de Recursos Humanos', 'CREAR');
    // Ya está pendiente por defecto

    // Sistema 3 - Solicitud rechazada de eliminación
    const solicitud3 = crearSolicitudMockParaSistema(3, 'Sistema de Contabilidad', 'ELIMINAR');
    solicitud3.estado = 'RECHAZADO';
    solicitud3.aprobaciones[0].estado = 'RECHAZADO';
    solicitud3.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 3600000).toISOString(); // Hace 1 hora
    solicitud3.aprobaciones[0].comentarios = 'No se puede eliminar este sistema crítico sin un plan de migración';
    
    // Sistema 4 - Solicitud pendiente de eliminación
    const solicitud4 = crearSolicitudMockParaSistema(4, 'Sistema de Reportes Legacy', 'ELIMINAR');
    solicitud4.motivoSolicitud = 'Eliminación de sistema obsoleto que ha sido reemplazado por nueva plataforma';
    solicitud4.datosEntidad.motivoEliminacion = 'Sistema legacy que ya no se utiliza';
    
    // Sistema 5 - Borrador de eliminación
    const borrador5 = crearBorrador(
      'ELIMINAR',
      'Sistema de Pruebas QA',
      'SISTEMA',
      usuariosSOEMocks[4], // Ana López
      'Eliminación de sistema de pruebas temporal',
      {
        sistemaId: 5,
        nombreSistema: 'Sistema de Pruebas QA',
        tipoSistema: 'INTERNO',
        familiaSistema: 'TESTING',
        motivoEliminacion: 'Sistema temporal para testing'
      }
    );

    // EJEMPLOS ADICIONALES PARA DEMOSTRAR SEGUIMIENTO SOE
    // =================================================

    // Sistema 6 - Solicitud de creación en progreso (Owner aprobó, Sponsor pendiente)
    const solicitud6 = crearSolicitudMockParaSistema(6, 'Sistema de Inventario CVB', 'CREAR');
    solicitud6.motivoSolicitud = 'Nuevo sistema para gestión de inventario y control de stock de la compañía';
    solicitud6.datosEntidad = {
      sistemaId: 6,
      nombreSistema: 'Sistema de Inventario CVB',
      tipoSistema: 'GESTION',
      familiaSistema: 'INVENTARIO',
      descripcion: 'Sistema integral para control de inventarios',
      tecnologia: 'React + Node.js',
      presupuesto: '$45,000 USD'
    };
    // Owner ya aprobó
    solicitud6.aprobaciones[0].estado = 'APROBADO';
    solicitud6.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 7200000).toISOString(); // Hace 2 horas
    solicitud6.aprobaciones[0].comentarios = '✅ Aprobado por Owner. El sistema es necesario para mejorar la eficiencia del control de inventarios. Presupuesto aprobado.';
    // Sponsor aún pendiente
    solicitud6.aprobaciones[1].estado = 'PENDIENTE';

    // Sistema 7 - Solicitud de edición aprobada recientemente
    const solicitud7 = crearSolicitudMockParaSistema(7, 'Portal de Empleados CVB', 'EDITAR');
    solicitud7.motivoSolicitud = 'Actualización de módulo de nóminas y agregado de funcionalidades de autoservicio para empleados';
    solicitud7.datosEntidad = {
      sistemaId: 7,
      nombreSistema: 'Portal de Empleados CVB',
      tipoSistema: 'PORTAL',
      familiaSistema: 'RECURSOS_HUMANOS',
      cambiosSolicitados: [
        'Integración con nuevo sistema de nóminas',
        'Módulo de solicitud de vacaciones',
        'Dashboard personalizado para empleados',
        'Sistema de notificaciones push'
      ],
      impactoEstimado: 'MEDIO',
      tiempoImplementacion: '6 semanas'
    };
    solicitud7.estado = 'APROBADO';
    // Owner aprobó
    solicitud7.aprobaciones[0].estado = 'APROBADO';
    solicitud7.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 172800000).toISOString(); // Hace 2 días
    solicitud7.aprobaciones[0].comentarios = '✅ Cambios necesarios para mejorar la experiencia del empleado. Aprobado con presupuesto adicional de $20,000.';
    // Sponsor aprobó
    solicitud7.aprobaciones[1].estado = 'APROBADO';
    solicitud7.aprobaciones[1].fechaRespuesta = new Date(Date.now() - 86400000).toISOString(); // Hace 1 día
    solicitud7.aprobaciones[1].comentarios = '✅ Aprobación final confirmada. Proceder con la implementación según cronograma propuesto.';

    // Sistema 8 - Solicitud de eliminación rechazada por Sponsor
    const solicitud8 = crearSolicitudMockParaSistema(8, 'Sistema Legacy de Facturación', 'ELIMINAR');
    solicitud8.motivoSolicitud = 'Eliminación de sistema legacy de facturación que será reemplazado por nuevo ERP';
    solicitud8.datosEntidad = {
      sistemaId: 8,
      nombreSistema: 'Sistema Legacy de Facturación',
      tipoSistema: 'LEGACY',
      familiaSistema: 'FACTURACION',
      motivoEliminacion: 'Reemplazo por nuevo sistema ERP',
      planMigracion: 'Migración de datos históricos al nuevo ERP',
      fechaEliminacionPropuesta: '2024-06-30'
    };
    solicitud8.estado = 'RECHAZADO';
    // Owner aprobó
    solicitud8.aprobaciones[0].estado = 'APROBADO';
    solicitud8.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 432000000).toISOString(); // Hace 5 días
    solicitud8.aprobaciones[0].comentarios = '✅ Desde el punto de vista técnico, el sistema puede ser eliminado una vez completada la migración.';
    // Sponsor rechazó
    solicitud8.aprobaciones[1].estado = 'RECHAZADO';
    solicitud8.aprobaciones[1].fechaRespuesta = new Date(Date.now() - 259200000).toISOString(); // Hace 3 días
    solicitud8.aprobaciones[1].comentarios = '❌ RECHAZADO: Necesitamos mantener el sistema por 6 meses adicionales como respaldo. Solicitar nuevamente en Q3 2024.';

    // Sistema 9 - Múltiples solicitudes para mostrar historial
    const solicitud9a = crearSolicitudMockParaSistema(9, 'CRM de Ventas CVB', 'EDITAR');
    solicitud9a.motivoSolicitud = 'Primera fase: Integración con WhatsApp Business';
    solicitud9a.estado = 'APROBADO';
    solicitud9a.fechaSolicitud = new Date(Date.now() - 1209600000).toISOString(); // Hace 2 semanas
    solicitud9a.aprobaciones[0].estado = 'APROBADO';
    solicitud9a.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 1123200000).toISOString();
    solicitud9a.aprobaciones[0].comentarios = 'Aprobado - Fase 1 de modernización del CRM';
    solicitud9a.aprobaciones[1].estado = 'APROBADO';
    solicitud9a.aprobaciones[1].fechaRespuesta = new Date(Date.now() - 1036800000).toISOString();
    solicitud9a.aprobaciones[1].comentarios = 'Aprobación final - Presupuesto $15,000';

    const solicitud9b = crearSolicitudMockParaSistema(9, 'CRM de Ventas CVB', 'EDITAR');
    solicitud9b.motivoSolicitud = 'Segunda fase: Dashboard analítico y reportes avanzados';
    solicitud9b.fechaSolicitud = new Date(Date.now() - 86400000).toISOString(); // Hace 1 día
    // Owner aprobó rápidamente
    solicitud9b.aprobaciones[0].estado = 'APROBADO';
    solicitud9b.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 43200000).toISOString(); // Hace 12 horas
    solicitud9b.aprobaciones[0].comentarios = '✅ Excelente propuesta. Los dashboards mejorarán significativamente la toma de decisiones.';
    // Sponsor pendiente
    solicitud9b.aprobaciones[1].estado = 'PENDIENTE';

    // Sistema 10 - Solicitud urgente con comentarios detallados
    const solicitud10 = crearSolicitudMockParaSistema(10, 'Sistema de Seguridad CVB', 'EDITAR');
    solicitud10.motivoSolicitud = '🚨 URGENTE: Actualización crítica de seguridad - Parche de vulnerabilidades detectadas';
    solicitud10.datosEntidad = {
      sistemaId: 10,
      nombreSistema: 'Sistema de Seguridad CVB',
      tipoSistema: 'SEGURIDAD',
      familiaSistema: 'INFRAESTRUCTURA',
      tipoSolicitud: 'URGENTE',
      vulnerabilidades: [
        'CVE-2024-1234: SQL Injection en módulo de autenticación',
        'CVE-2024-5678: XSS en panel de administración',
        'Actualización de certificados SSL expirados'
      ],
      impactoSiNoSeAplica: 'CRITICO - Posible compromiso de datos de usuarios',
      tiempoImplementacion: '2 horas (fuera de horario laboral)'
    };
    // Owner aprobó inmediatamente
    solicitud10.aprobaciones[0].estado = 'APROBADO';
    solicitud10.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 1800000).toISOString(); // Hace 30 minutos
    solicitud10.aprobaciones[0].comentarios = '🚨 APROBADO URGENTE: Vulnerabilidades críticas identificadas. Implementar inmediatamente fuera de horario para minimizar impacto.';
    // Sponsor pendiente (notificado como urgente)
    solicitud10.aprobaciones[1].estado = 'PENDIENTE';

    // CVB - Ejemplos para el sistema que está viendo el usuario
    // ======================================================

    // Crear solicitudes para múltiples IDs posibles del sistema CVB
    const sistemasIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 999]; // IDs posibles
    
    sistemasIds.forEach(id => {
      // Solicitud de creación aprobada para cada ID
      const solicitudCVB = crearSolicitudMockParaSistema(id, 'cvb', 'CREAR');
      solicitudCVB.motivoSolicitud = `Creación del sistema cvb (ID: ${id}) con funcionalidades específicas`;
      solicitudCVB.datosEntidad = {
        sistemaId: id,
        nombreSistema: 'cvb',
        tipoSistema: 'APLICACION',
        familiaSistema: 'GESTION',
        descripcion: 'Sistema de gestión cvb con módulos integrados',
        tecnologias: ['React', 'TypeScript', 'Node.js'],
        presupuesto: '$75,000 USD',
        tiempoImplementacion: '12 semanas'
      };
      solicitudCVB.estado = 'APROBADO';
      solicitudCVB.fechaSolicitud = new Date(Date.now() - 2592000000).toISOString(); // Hace 1 mes
      // Owner aprobó
      solicitudCVB.aprobaciones[0].estado = 'APROBADO';
      solicitudCVB.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 2419200000).toISOString();
      solicitudCVB.aprobaciones[0].comentarios = `✅ Sistema cvb (ID: ${id}) aprobado. Funcionalidades necesarias para la operación.`;
      // Sponsor aprobó
      solicitudCVB.aprobaciones[1].estado = 'APROBADO';
      solicitudCVB.aprobaciones[1].fechaRespuesta = new Date(Date.now() - 2332800000).toISOString();
      solicitudCVB.aprobaciones[1].comentarios = `✅ APROBACION FINAL sistema cvb. Presupuesto aprobado para implementación.`;

      // Solicitud de edición pendiente para cada ID
      const solicitudCVBEdit = crearSolicitudMockParaSistema(id, 'cvb', 'EDITAR');
      solicitudCVBEdit.motivoSolicitud = `Actualización del sistema cvb - Mejoras en interfaz y funcionalidades`;
      solicitudCVBEdit.datosEntidad = {
        sistemaId: id,
        nombreSistema: 'cvb',
        cambiosSolicitados: [
          'Mejora en la interfaz de usuario',
          'Optimización de rendimiento',
          'Nuevas funcionalidades de reportes',
          'Integración con APIs externas'
        ],
        presupuestoAdicional: '$25,000 USD',
        impactoOperacional: 'MEDIO - Mejoras incrementales',
        beneficiosEsperados: [
          'Mejor experiencia de usuario',
          'Mayor eficiencia operativa',
          'Reportes más detallados'
        ]
      };
      solicitudCVBEdit.fechaSolicitud = new Date(Date.now() - 259200000).toISOString(); // Hace 3 días
      // Owner ya aprobó
      solicitudCVBEdit.aprobaciones[0].estado = 'APROBADO';
      solicitudCVBEdit.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 172800000).toISOString(); // Hace 2 días
      solicitudCVBEdit.aprobaciones[0].comentarios = `✅ Cambios propuestos para cvb son necesarios. Aprobado técnicamente.`;
      // Sponsor pendiente
      solicitudCVBEdit.aprobaciones[1].estado = 'PENDIENTE';
    });

    // CVB Sistema original con ID 999 - para compatibilidad
    const solicitudCVB1 = crearSolicitudMockParaSistema(999, 'CVB Sistema Principal', 'CREAR');
    solicitudCVB1.motivoSolicitud = 'Creación del sistema principal de gestión de CVB con módulos integrados';
    solicitudCVB1.datosEntidad = {
      sistemaId: 999,
      nombreSistema: 'CVB Sistema Principal',
      tipoSistema: 'CORE',
      familiaSistema: 'GESTION_PRINCIPAL',
      descripcion: 'Sistema central de la organización con módulos de gestión integral',
      tecnologias: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
      presupuesto: '$125,000 USD',
      tiempoImplementacion: '16 semanas'
    };
    solicitudCVB1.estado = 'APROBADO';
    solicitudCVB1.fechaSolicitud = new Date(Date.now() - 1814400000).toISOString(); // Hace 3 semanas
    // Owner aprobó
    solicitudCVB1.aprobaciones[0].estado = 'APROBADO';
    solicitudCVB1.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 1728000000).toISOString();
    solicitudCVB1.aprobaciones[0].comentarios = '✅ Sistema crítico para la organización. Arquitectura bien planificada. Aprobado sin restricciones.';
    // Sponsor aprobó
    solicitudCVB1.aprobaciones[1].estado = 'APROBADO';
    solicitudCVB1.aprobaciones[1].fechaRespuesta = new Date(Date.now() - 1641600000).toISOString();
    solicitudCVB1.aprobaciones[1].comentarios = '✅ APROBACION FINAL: Presupuesto aprobado. Sistema prioritario Q1 2024. Proceder con implementación.';

    // CVB Sistema - Solicitud de edición pendiente
    const solicitudCVB2 = crearSolicitudMockParaSistema(999, 'CVB Sistema Principal', 'EDITAR');
    solicitudCVB2.motivoSolicitud = 'Agregar módulo de Business Intelligence y reportes ejecutivos';
    solicitudCVB2.datosEntidad = {
      sistemaId: 999,
      nombreSistema: 'CVB Sistema Principal',
      cambiosSolicitados: [
        'Módulo de Business Intelligence',
        'Dashboard ejecutivo en tiempo real',
        'Reportes automatizados',
        'Integración con herramientas de análisis'
      ],
      presupuestoAdicional: '$35,000 USD',
      impactoOperacional: 'BAJO - Solo agregar funcionalidades',
      beneficiosEsperados: [
        'Toma de decisiones basada en datos',
        'Reportes automatizados para ejecutivos',
        'Análisis predictivo de tendencias'
      ]
    };
    solicitudCVB2.fechaSolicitud = new Date(Date.now() - 172800000).toISOString(); // Hace 2 días
    // Owner ya aprobó
    solicitudCVB2.aprobaciones[0].estado = 'APROBADO';
    solicitudCVB2.aprobaciones[0].fechaRespuesta = new Date(Date.now() - 86400000).toISOString(); // Hace 1 día
    solicitudCVB2.aprobaciones[0].comentarios = '✅ Excelente adición al sistema. Los reportes BI son fundamentales para la gestión moderna. Aprobado técnicamente.';
    // Sponsor pendiente
    solicitudCVB2.aprobaciones[1].estado = 'PENDIENTE';
  }
};

// Limpiar y reinicializar datos mock
solicitudesAprobacionMocks.length = 0; // Limpiar array existente
inicializarSolicitudesMockParaSistemas();