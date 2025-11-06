// =============================================
// ENUMS Y TIPOS PARA MÓDULO SISTEMAS
// =============================================

// Enum para Tipo de Sistema
export enum TipoSistema {
  INTERNO = 1,
  PROVEEDOR = 2,
  SOCIOS_NEGOCIOS = 3
}

// Enum para Familia de Sistema
export enum FamiliaSistema {
  ERP = 1,
  CRM = 2,
  GESTION_RRHH = 3,
  COLABORACION = 4,
  GESTION_DOCUMENTAL = 5,
  BI = 6,
  GESTION_PROYECTOS = 7,
  OPERACIONES = 8,
  FINANCIERO_CONTABLE = 9,
  MARKETING_DIGITAL = 10,
  SEGURIDAD_INFORMACION = 11,
  GESTION_PROCESOS = 12,
  CONTROL_MONITOREO = 13,
  DESARROLLO_SW = 14,
  LEGACY = 15,
  GESTION_ACTIVOS = 16
}

// Enum para Estado de Sistema
export enum EstadoSistema {
  // Estados del backend según la investigación
  Borrador = -4,        // Borrador (usado en backend)
  IniciarFlujo = -3,    // Iniciar Flujo
  Pendiente = -2,       // Pendiente (usado en backend)
  Rechazado = -1,       // Rechazado
  Inactivo = 0,         // Inactivo (usado en backend)
  Activo = 1,           // Activo (usado en backend)
  EnDesarrollo = 3,     // En Desarrollo (usado en backend)
  EnMantenimiento = 4   // En Mantenimiento (usado en backend)
}

// Enum para Estados de Workflow (si necesitas usar workflow después)
export enum EstadoWorkflow {
  EDICION = 1,
  VIGENTE = 2,
  NO_VIGENTE = 3,
  ARCHIVADO = 4
}

// =============================================
// INTERFACES TYPESCRIPT
// =============================================

export interface SistemaModulo {
  sistemaModuloId: number;
  sistemaId: number;
  nombreModulo: string;
  funcionModulo: string;
  version: number;
  estado: EstadoSistema;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  // Nombres de usuario para mostrar en la UI
  nombreUsuarioCreador?: string | null;
  nombreUsuarioActualizador?: string | null;
  registroEliminado: boolean;
}

export interface Sistema {
  sistemaId: number;
  organizacionId: number;
  codigoSistema: string | null;
  nombreSistema: string;
  funcionPrincipal: string | null;
  sistemaDepende: number | null;
  tipoSistema: number; // Cambio: ahora usa ID dinámico del backend
  familiaSistema: number; // Cambio: ahora usa ID dinámico del backend
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number | null; // ✅ AGREGADO: ID del gobierno asociado al sistema
  version: number;
  estado: EstadoSistema;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  // Campos adicionales del modal
  url?: string | null;
  servidorIds?: number[]; // ✅ ACTUALIZADO: Cambiado de idServidor a servidorIds
  // Propiedades calculadas/navegación
  sistemaDepende_Nombre?: string;
  modulos?: SistemaModulo[];
  sistemasHijos?: Sistema[];
}

// Interface para crear/editar sistema
export interface CreateSistemaDto {
  organizacionId: number;
  codigoSistema?: string;
  nombreSistema: string;
  funcionPrincipal?: string;
  sistemaDepende?: number;
  tipoSistema: number; // Cambio: ahora usa ID dinámico del backend
  familiaSistema: number; // Cambio: ahora usa ID dinámico del backend
  tieneGobernanzaPropia?: boolean;
  gobernanzaId?: number; // ✅ AGREGADO: ID del gobierno asociado al sistema
  estado: EstadoSistema; // ✅ AGREGADO: Estado del sistema
  url?: string;
  servidorIds?: number[]; // ✅ ACTUALIZADO: Cambiado de idServidor a servidorIds
  modulos?: CreateModuloDto[]; // ✅ AGREGADO: Array de módulos para crear junto con el sistema
}

export interface UpdateSistemaDto extends CreateSistemaDto {
  sistemaId: number;
  version: number;
  // El estado se hereda de CreateSistemaDto
}

// Interface para crear/editar módulos
export interface CreateModuloDto {
  sistemaId: number;
  nombreModulo: string;
  funcionModulo: string;
}

export interface UpdateModuloDto extends CreateModuloDto {
  sistemaModuloId: number;
  version: number;
}

// =============================================
// DATOS MAESTROS - LABELS PARA LOS ENUMS
// =============================================

export const TIPO_SISTEMA_LABELS: Record<TipoSistema, string> = {
  [TipoSistema.INTERNO]: 'Interno',
  [TipoSistema.PROVEEDOR]: 'Proveedor',
  [TipoSistema.SOCIOS_NEGOCIOS]: 'Socios de Negocios'
};

export const FAMILIA_SISTEMA_LABELS: Record<FamiliaSistema, string> = {
  [FamiliaSistema.ERP]: 'ERP',
  [FamiliaSistema.CRM]: 'CRM',
  [FamiliaSistema.GESTION_RRHH]: 'Gestión de RRHH',
  [FamiliaSistema.COLABORACION]: 'Colaboración',
  [FamiliaSistema.GESTION_DOCUMENTAL]: 'Gestión Documental',
  [FamiliaSistema.BI]: 'Business Intelligence',
  [FamiliaSistema.GESTION_PROYECTOS]: 'Gestión de Proyectos',
  [FamiliaSistema.OPERACIONES]: 'Operaciones',
  [FamiliaSistema.FINANCIERO_CONTABLE]: 'Financiero Contable',
  [FamiliaSistema.MARKETING_DIGITAL]: 'Marketing Digital',
  [FamiliaSistema.SEGURIDAD_INFORMACION]: 'Seguridad de la Información',
  [FamiliaSistema.GESTION_PROCESOS]: 'Gestión por Procesos',
  [FamiliaSistema.CONTROL_MONITOREO]: 'Control y Monitoreo',
  [FamiliaSistema.DESARROLLO_SW]: 'Desarrollo de Software',
  [FamiliaSistema.LEGACY]: 'Sistemas Legacy',
  [FamiliaSistema.GESTION_ACTIVOS]: 'Gestión de Activos'
};

export const ESTADO_SISTEMA_LABELS: Record<EstadoSistema, string> = {
  [EstadoSistema.Borrador]: 'Borrador',
  [EstadoSistema.IniciarFlujo]: 'Iniciar Flujo',
  [EstadoSistema.Pendiente]: 'Pendiente',
  [EstadoSistema.Rechazado]: 'Rechazado',
  [EstadoSistema.Inactivo]: 'Inactivo',
  [EstadoSistema.Activo]: 'Activo',
  [EstadoSistema.EnDesarrollo]: 'En Desarrollo',
  [EstadoSistema.EnMantenimiento]: 'En Mantenimiento'
};

// =============================================
// FUNCIONES HELPER PARA LOS LABELS
// =============================================

export const getTipoSistemaLabel = (tipo: TipoSistema): string => {
  return TIPO_SISTEMA_LABELS[tipo] || 'Desconocido';
};

export const getFamiliaSistemaLabel = (familia: FamiliaSistema): string => {
  return FAMILIA_SISTEMA_LABELS[familia] || 'Desconocido';
};

export const getEstadoSistemaLabel = (estado: EstadoSistema | number | string | null | undefined): string => {
  const validCodes: number[] = [
    EstadoSistema.Borrador,
    EstadoSistema.IniciarFlujo,
    EstadoSistema.Pendiente,
    EstadoSistema.Rechazado,
    EstadoSistema.Inactivo,
    EstadoSistema.Activo
  ];

  const normalize = (raw: any): EstadoSistema | null => {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number') {
      return validCodes.includes(raw) ? (raw as EstadoSistema) : null;
    }

    const str = String(raw).trim();
    if (str === '') return null;

    const asNum = Number(str);
    if (!Number.isNaN(asNum) && validCodes.includes(asNum)) {
      return asNum as EstadoSistema;
    }

    // Buscar por etiqueta (case-insensitive)
    const entry = Object.entries(ESTADO_SISTEMA_LABELS).find(([_code, lbl]) => lbl.toLowerCase() === str.toLowerCase());
    return entry ? (Number(entry[0]) as EstadoSistema) : null;
  };

  const normalized = normalize(estado);
  return normalized !== null ? ESTADO_SISTEMA_LABELS[normalized] : 'Desconocido';
};

// Función para obtener opciones de dropdown
export const getTipoSistemaOptions = () => {
  return Object.entries(TIPO_SISTEMA_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label
  }));
};

export const getFamiliaSistemaOptions = () => {
  return Object.entries(FAMILIA_SISTEMA_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label
  }));
};

export const getEstadoSistemaOptions = () => {
  return Object.entries(ESTADO_SISTEMA_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label
  }));
};