import { 
  Sistema, 
  SistemaModulo, 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema 
} from '../models/Sistemas';

// =============================================
// MOCKS DE MÓDULOS DE SISTEMAS
// =============================================

export const mockSistemasModulos: SistemaModulo[] = [
  // Módulos para SAP ERP (Sistema ID: 1)
  {
    sistemaModuloId: 1,
    sistemaId: 1,
    nombreModulo: 'SAP FI (Finanzas)',
    funcionModulo: 'Gestión financiera, contabilidad general y reportes financieros',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-15T08:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 2,
    sistemaId: 1,
    nombreModulo: 'SAP CO (Controlling)',
    funcionModulo: 'Control de costos y análisis de rentabilidad',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-15T08:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 3,
    sistemaId: 1,
    nombreModulo: 'SAP MM (Materials Management)',
    funcionModulo: 'Gestión de materiales, compras y inventarios',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-15T08:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 4,
    sistemaId: 1,
    nombreModulo: 'SAP HR (Human Resources)',
    funcionModulo: 'Gestión de recursos humanos y nómina',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-15T08:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },

  // Módulos para Salesforce CRM (Sistema ID: 2)
  {
    sistemaModuloId: 5,
    sistemaId: 2,
    nombreModulo: 'Sales Cloud',
    funcionModulo: 'Gestión de oportunidades de venta y pipeline comercial',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-01T09:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 6,
    sistemaId: 2,
    nombreModulo: 'Service Cloud',
    funcionModulo: 'Atención al cliente y gestión de casos',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-01T09:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 7,
    sistemaId: 2,
    nombreModulo: 'Marketing Cloud',
    funcionModulo: 'Automatización de marketing y campañas',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-01T09:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },

  // Módulos para Microsoft Teams (Sistema ID: 3)
  {
    sistemaModuloId: 8,
    sistemaId: 3,
    nombreModulo: 'Chat y Mensajería',
    funcionModulo: 'Comunicación instantánea entre equipos',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-20T10:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 9,
    sistemaId: 3,
    nombreModulo: 'Videoconferencias',
    funcionModulo: 'Reuniones virtuales y conferencias',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-20T10:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 10,
    sistemaId: 3,
    nombreModulo: 'SharePoint Integration',
    funcionModulo: 'Integración con SharePoint para gestión documental',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-20T10:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },

  // Módulos para Power BI (Sistema ID: 4)
  {
    sistemaModuloId: 11,
    sistemaId: 4,
    nombreModulo: 'Power BI Desktop',
    funcionModulo: 'Creación de reportes y visualizaciones',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-10T11:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 12,
    sistemaId: 4,
    nombreModulo: 'Power BI Service',
    funcionModulo: 'Publicación y compartición de dashboards',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-10T11:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },

  // Módulos para Sistema Interno de Nómina (Sistema ID: 5)
  {
    sistemaModuloId: 13,
    sistemaId: 5,
    nombreModulo: 'Cálculo de Nómina',
    funcionModulo: 'Procesamiento de sueldos y beneficios',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-10T12:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 14,
    sistemaId: 5,
    nombreModulo: 'Reportes Tributarios',
    funcionModulo: 'Generación de reportes para entidades tributarias',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-10T12:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },

  // Módulos para Jira (Sistema ID: 6)
  {
    sistemaModuloId: 15,
    sistemaId: 6,
    nombreModulo: 'Project Management',
    funcionModulo: 'Gestión de proyectos y tareas',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-05T13:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  },
  {
    sistemaModuloId: 16,
    sistemaId: 6,
    nombreModulo: 'Issue Tracking',
    funcionModulo: 'Seguimiento de incidencias y bugs',
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-05T13:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false
  }
];

// =============================================
// MOCKS DE SISTEMAS PRINCIPALES
// =============================================

export const mockSistemas: Sistema[] = [
  {
    sistemaId: 1,
    organizacionId: 1,
    codigoSistema: 'SAP-ERP-001',
    nombreSistema: 'SAP ERP',
    funcionPrincipal: 'Sistema Enterprise Resource Planning para gestión integral de recursos empresariales',
    sistemaDepende: null,
    tipoSistema: TipoSistema.PROVEEDOR,
    familiaSistema: FamiliaSistema.ERP,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-15T08:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: undefined,
    modulos: mockSistemasModulos.filter(m => m.sistemaId === 1)
  },
  {
    sistemaId: 2,
    organizacionId: 1,
    codigoSistema: 'SF-CRM-001',
    nombreSistema: 'Salesforce CRM',
    funcionPrincipal: 'Customer Relationship Management para gestión de clientes y ventas',
    sistemaDepende: null,
    tipoSistema: TipoSistema.PROVEEDOR,
    familiaSistema: FamiliaSistema.CRM,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-01T09:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: undefined,
    modulos: mockSistemasModulos.filter(m => m.sistemaId === 2)
  },
  {
    sistemaId: 3,
    organizacionId: 1,
    codigoSistema: 'MS-TEAMS-001',
    nombreSistema: 'Microsoft Teams',
    funcionPrincipal: 'Plataforma de colaboración y comunicación empresarial',
    sistemaDepende: null,
    tipoSistema: TipoSistema.PROVEEDOR,
    familiaSistema: FamiliaSistema.COLABORACION,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-20T10:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: undefined,
    modulos: mockSistemasModulos.filter(m => m.sistemaId === 3)
  },
  {
    sistemaId: 4,
    organizacionId: 1,
    codigoSistema: 'PBI-001',
    nombreSistema: 'Power BI',
    funcionPrincipal: 'Herramienta de Business Intelligence para análisis y visualización de datos',
    sistemaDepende: 1, // Depende de SAP ERP
    tipoSistema: TipoSistema.PROVEEDOR,
    familiaSistema: FamiliaSistema.BI,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-10T11:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: 'SAP ERP',
    modulos: mockSistemasModulos.filter(m => m.sistemaId === 4)
  },
  {
    sistemaId: 5,
    organizacionId: 1,
    codigoSistema: 'SIN-001',
    nombreSistema: 'Sistema Interno de Nómina',
    funcionPrincipal: 'Sistema desarrollado internamente para gestión de nómina y recursos humanos',
    sistemaDepende: null,
    tipoSistema: TipoSistema.INTERNO,
    familiaSistema: FamiliaSistema.GESTION_RRHH,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-10T12:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: undefined,
    modulos: mockSistemasModulos.filter(m => m.sistemaId === 5)
  },
  {
    sistemaId: 6,
    organizacionId: 1,
    codigoSistema: 'JIRA-001',
    nombreSistema: 'Jira',
    funcionPrincipal: 'Sistema de gestión de proyectos y seguimiento de tareas',
    sistemaDepende: null,
    tipoSistema: TipoSistema.PROVEEDOR,
    familiaSistema: FamiliaSistema.GESTION_PROYECTOS,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-05T13:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: undefined,
    modulos: mockSistemasModulos.filter(m => m.sistemaId === 6)
  },
  {
    sistemaId: 7,
    organizacionId: 1,
    codigoSistema: 'SP-DOC-001',
    nombreSistema: 'SharePoint',
    funcionPrincipal: 'Plataforma de gestión documental y colaboración',
    sistemaDepende: 3, // Depende de Microsoft Teams
    tipoSistema: TipoSistema.PROVEEDOR,
    familiaSistema: FamiliaSistema.GESTION_DOCUMENTAL,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-25T14:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: 'Microsoft Teams'
  },
  {
    sistemaId: 8,
    organizacionId: 1,
    codigoSistema: 'LEGACY-FIN',
    nombreSistema: 'Sistema Legacy Financiero',
    funcionPrincipal: 'Sistema financiero heredado en proceso de migración',
    sistemaDepende: null,
    tipoSistema: TipoSistema.INTERNO,
    familiaSistema: FamiliaSistema.LEGACY,
    version: 1,
    estado: EstadoSistema.INACTIVO,
    creadoPor: 1,
    fechaCreacion: '2020-01-01T00:00:00.000Z',
    actualizadoPor: 1,
    fechaActualizacion: '2024-01-15T15:00:00.000Z',
    registroEliminado: false,
    sistemaDepende_Nombre: undefined
  },
  {
    sistemaId: 9,
    organizacionId: 2, // Otra organización
    codigoSistema: 'ODOO-ERP',
    nombreSistema: 'Odoo ERP',
    funcionPrincipal: 'Sistema ERP open source para pequeñas y medianas empresas',
    sistemaDepende: null,
    tipoSistema: TipoSistema.PROVEEDOR,
    familiaSistema: FamiliaSistema.ERP,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 2,
    fechaCreacion: '2024-03-01T16:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: undefined
  },
  {
    sistemaId: 10,
    organizacionId: 1,
    codigoSistema: 'MONITOR-001',
    nombreSistema: 'Sistema de Monitoreo',
    funcionPrincipal: 'Monitoreo y control de infraestructura tecnológica',
    sistemaDepende: null,
    tipoSistema: TipoSistema.INTERNO,
    familiaSistema: FamiliaSistema.CONTROL_MONITOREO,
    version: 1,
    estado: EstadoSistema.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-20T17:00:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    sistemaDepende_Nombre: undefined
  }
];

// =============================================
// FUNCIONES HELPER PARA TRABAJAR CON MOCKS
// =============================================

// Obtener sistemas por organización
export const getSistemasByOrganizacion = (organizacionId: number): Sistema[] => {
  return mockSistemas.filter(s => s.organizacionId === organizacionId && !s.registroEliminado);
};

// Obtener sistemas activos por organización
export const getSistemasActivosByOrganizacion = (organizacionId: number): Sistema[] => {
  return mockSistemas.filter(s => 
    s.organizacionId === organizacionId && 
    s.estado === EstadoSistema.ACTIVO && 
    !s.registroEliminado
  );
};

// Obtener sistema por ID
export const getSistemaById = (sistemaId: number): Sistema | undefined => {
  return mockSistemas.find(s => s.sistemaId === sistemaId && !s.registroEliminado);
};

// Obtener sistemas por familia
export const getSistemasByFamilia = (organizacionId: number, familia: FamiliaSistema): Sistema[] => {
  return mockSistemas.filter(s => 
    s.organizacionId === organizacionId && 
    s.familiaSistema === familia && 
    !s.registroEliminado
  );
};

// Obtener sistemas que pueden ser padres (no pueden depender de sí mismos)
export const getSistemasPosiblesPadres = (organizacionId: number, sistemaId?: number): Sistema[] => {
  return mockSistemas.filter(s => 
    s.organizacionId === organizacionId && 
    s.estado === EstadoSistema.ACTIVO && 
    s.sistemaId !== sistemaId && 
    !s.registroEliminado
  );
};

// Obtener módulos de un sistema
export const getModulosBySistema = (sistemaId: number): SistemaModulo[] => {
  return mockSistemasModulos.filter(m => m.sistemaId === sistemaId && !m.registroEliminado);
};

// Estadísticas rápidas
export const getSistemasStats = (organizacionId: number) => {
  const sistemas = getSistemasByOrganizacion(organizacionId);
  return {
    total: sistemas.length,
    activos: sistemas.filter(s => s.estado === EstadoSistema.ACTIVO).length,
    inactivos: sistemas.filter(s => s.estado === EstadoSistema.INACTIVO).length,
    internos: sistemas.filter(s => s.tipoSistema === TipoSistema.INTERNO).length,
    externos: sistemas.filter(s => s.tipoSistema !== TipoSistema.INTERNO).length,
    conDependencias: sistemas.filter(s => s.sistemaDepende !== null).length
  };
}; 