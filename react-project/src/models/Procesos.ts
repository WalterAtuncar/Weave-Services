// =============================================
// ENUMS Y TIPOS PARA MÓDULO PROCESOS
// =============================================

// Enum para Tipo de Proceso
export enum TipoProceso {
  ESTRATEGICO = 1,
  OPERATIVO = 2,
  SOPORTE = 3
}

// Enum para Categoría de Proceso
export enum CategoriaProceso {
  GESTION = 1,
  CONTROL = 2,
  MEJORA = 3,
  INNOVACION = 4,
  CUMPLIMIENTO = 5,
  OPERACIONAL = 6
}

// Enum para Estado de Proceso
export enum EstadoProceso {
  // Estados del backend según la investigación
  Borrador = -4,        // Borrador (usado en backend)
  IniciarFlujo = -3,    // Iniciar Flujo
  Pendiente = -2,       // Pendiente (usado en backend)
  Rechazado = -1,       // Rechazado
  Inactivo = 0,         // Inactivo (usado en backend)
  Activo = 1,           // Activo (usado en backend)
  EnRevision = 3,       // En Revisión (usado en backend)
  EnMejora = 4          // En Mejora (usado en backend)
}

// Enum para Prioridad de Proceso
export enum PrioridadProceso {
  BAJA = 1,
  MEDIA = 2,
  ALTA = 3,
  CRITICA = 4
}

// Enum para Estados de Workflow (si necesitas usar workflow después)
export enum EstadoWorkflow {
  EDICION = 1,
  VIGENTE = 2,
  NO_VIGENTE = 3,
  ARCHIVADO = 4
}

// =============================================
// NUEVO MODELO JERÁRQUICO DE PROCESOS
// =============================================

// Tipo de Proceso (entidad de catálogo)
export interface TipoProcesoEntity {
  tipoProcesoId: number;
  nombreTipoProceso: string;
  descripcionTipoProceso?: string | null;
  nivel: number;
  estadoTipoProceso: boolean;
  organizacionId: number;
  creadoPor: number;
  fechaCreacion: string;
  actualizadoPor?: number | null;
  fechaActualizacion?: string | null;
  registroEliminado: boolean;
}

// Proceso jerárquico unificado (nueva estructura)
export interface ProcesoJerarquico {
  procesoId: number;
  padreId?: number | null;
  organizacionId: number;
  tipoProcesoId: number;
  codigoProceso: string;
  nombreProceso: string;
  descripcionProceso?: string | null;
  versionProceso?: string;
  nivel: number;
  rutaJerarquica?: string | null;
  ordenProceso?: number;
  estadoId: number;
  creadoPor: number;
  fechaCreacion: string;
  actualizadoPor?: number | null;
  fechaActualizacion?: string | null;
  registroEliminado: boolean;
  
  // Propiedades calculadas/navegación
  nombrePadre?: string;
  hijos?: ProcesoJerarquico[];
  tipoProcesoNombre?: string;
}

// =============================================
// DTOs PARA CARGA MASIVA JERÁRQUICA
// =============================================

// DTO para insertar proceso jerárquico
export interface InsertarProcesoJerarquicoRequest {
  padreId?: number | null;
  organizacionId: number;
  tipoProcesoId: number;
  codigoProceso: string;
  nombreProceso: string;
  descripcionProceso?: string | null;
  versionProceso?: string;
  ordenProceso?: number;
  creadoPor: number;
}

export interface InsertarProcesoJerarquicoResponse {
  procesoId: number;
  mensaje: string;
  exito: boolean;
}

// Datos parseados del Excel para proceso jerárquico
export interface ParsedProcesoJerarquicoFromExcel {
  tempId: number; // ID temporal para relacionar en el Excel
  padreCodigoProceso?: string | null; // Código del proceso padre
  organizacionId: number;
  tipoProcesoId?: number; // Opcional, se puede asignar por defecto
  codigoProceso: string;
  nombreProceso: string;
  descripcionProceso?: string | null;
  versionProceso?: string;
  ordenProceso?: number;
  nivel: number; // Calculado basado en la jerarquía
}

// Resultado del parsing de Excel jerárquico
export interface ExcelProcesosJerarquicoParseResult {
  procesos: ParsedProcesoJerarquicoFromExcel[];
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validProcesos: number;
    invalidProcesos: number;
    maxNivel: number; // Nivel máximo encontrado en la jerarquía
  };
}

// Payload final para enviar al backend (carga masiva jerárquica)
export interface BulkInsertProcesosJerarquicoPayload {
  organizacionId: number;
  creadoPor: number;
  procesos: Array<{
    tempId: number;
    padreCodigoProceso?: string | null;
    tipoProcesoId: number;
    codigoProceso: string;
    nombreProceso: string;
    descripcionProceso?: string | null;
    versionProceso?: string;
    ordenProceso?: number;
    nivel: number;
  }>;
}

// =============================================
// INTERFACES TYPESCRIPT
// =============================================

export interface ProcesoActividad {
  procesoActividadId: number;
  procesoId: number;
  nombreActividad: string;
  descripcionActividad: string;
  orden: number;
  duracionEstimada: number | null; // en días
  responsableId: number | null;
  version: number;
  estado: EstadoProceso;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  // Nombres de usuario para mostrar en la UI
  nombreUsuarioCreador?: string | null;
  nombreUsuarioActualizador?: string | null;
  nombreResponsable?: string | null;
  registroEliminado: boolean;
}

export interface ProcesoDocumento {
  procesoDocumentoId: number;
  procesoId: number;
  nombreDocumento: string;
  tipoDocumento: string;
  rutaArchivo: string | null;
  version: number;
  estado: EstadoProceso;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
}

export interface Proceso {
  procesoId: number;
  organizacionId: number;
  codigoProceso: string | null;
  nombreProceso: string;
  objetivos?: string | null; // Cambio: renombrado de descripcion a objetivos para coincidir con el mapeo
  procesoDepende: number | null;
  tipoProceso: number; // Cambio: ahora usa ID dinámico del backend
  categoriaProceso: number; // Cambio: ahora usa ID dinámico del backend
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number | null; // ✅ AGREGADO: ID del gobierno asociado al proceso
  version: string | number; // Cambio: puede ser string o number
  estado: EstadoProceso;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  
  // Campos adicionales del usuario
  nombreUsuarioCreador?: string | null;
  nombreUsuarioActualizador?: string | null;
  
  // Campos adicionales para el modal
  responsableId?: number | null;
  alcance?: string | null;
  
  // Campos de la nueva estructura proporcionada por el usuario
  nombreTipoProceso?: string | null;
  nombreEstado?: string | null;
  categoria?: string | null;
  responsable?: string | null;
  duracion?: number | null;
  nivel?: number | null;
  rutaJerarquica?: string | null;
  tieneHijos?: boolean;
  nombrePadre?: string | null;
  
  // Campos de navegación y relaciones
  procesoDepende_Nombre?: string;
  nombreResponsable?: string | null;
  actividades?: ProcesoActividad[];
  documentos?: ProcesoDocumento[];
  subprocesos?: Proceso[];
}

// =============================================
// DTOS PARA CREAR/ACTUALIZAR PROCESOS
// =============================================

export interface CreateProcesoDto {
  organizacionId: number;
  codigoProceso?: string | null;
  nombreProceso: string;
  descripcion?: string | null;
  procesoDepende?: number | null;
  tipoProceso: number;
  categoriaProceso: number;
  prioridad: PrioridadProceso;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number | null;
  responsableId?: number | null;
  duracionEstimada?: number | null;
  fechaInicioEstimada?: string | null;
  fechaFinEstimada?: string | null;
}

export interface UpdateProcesoDto extends Partial<CreateProcesoDto> {
  procesoId: number;
  version: number;
}

// =============================================
// INTERFACES PARA FILTROS Y BÚSQUEDAS
// =============================================

export interface ProcesoFiltros {
  search?: string;
  tipoProceso?: number[];
  categoriaProceso?: number[];
  estado?: EstadoProceso[];
  prioridad?: PrioridadProceso[];
  responsableId?: number[];
  tieneGobernanza?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
}

export interface ProcesosPaginados {
  procesos: Proceso[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

// =============================================
// INTERFACES PARA ESTADÍSTICAS Y REPORTES
// =============================================

export interface ProcesoEstadisticas {
  totalProcesos: number;
  procesosPorTipo: { [key: number]: number };
  procesosPorCategoria: { [key: number]: number };
  procesosPorEstado: { [key: number]: number };
  procesosPorPrioridad: { [key: number]: number };
  duracionPromedio: number;
  procesosConGobernanza: number;
  procesosVencidos: number;
}

// =============================================
// INTERFACES PARA VALIDACIÓN
// =============================================

export interface ProcesoValidacion {
  isValid: boolean;
  errores: string[];
  advertencias: string[];
}

// =============================================
// FUNCIONES HELPER PARA ENUMS
// =============================================

export const getTipoProcesoLabel = (tipo: number): string => {
  switch (tipo) {
    case TipoProceso.ESTRATEGICO:
      return 'Estratégico';
    case TipoProceso.OPERATIVO:
      return 'Operativo';
    case TipoProceso.SOPORTE:
      return 'Soporte';
    default:
      return 'No definido';
  }
};

export const getCategoriaProcesoLabel = (categoria: number): string => {
  switch (categoria) {
    case CategoriaProceso.GESTION:
      return 'Gestión';
    case CategoriaProceso.CONTROL:
      return 'Control';
    case CategoriaProceso.MEJORA:
      return 'Mejora';
    case CategoriaProceso.INNOVACION:
      return 'Innovación';
    case CategoriaProceso.CUMPLIMIENTO:
      return 'Cumplimiento';
    case CategoriaProceso.OPERACIONAL:
      return 'Operacional';
    default:
      return 'No definida';
  }
};

export const getEstadoProcesoLabel = (estado: EstadoProceso): string => {
  switch (estado) {
    case EstadoProceso.Borrador:
      return 'Borrador';
    case EstadoProceso.IniciarFlujo:
      return 'Iniciar Flujo';
    case EstadoProceso.Pendiente:
      return 'Pendiente';
    case EstadoProceso.Rechazado:
      return 'Rechazado';
    case EstadoProceso.Inactivo:
      return 'Inactivo';
    case EstadoProceso.Activo:
      return 'Activo';
    case EstadoProceso.EnRevision:
      return 'En Revisión';
    case EstadoProceso.EnMejora:
      return 'En Mejora';
    default:
      return 'Desconocido';
  }
};

export const getPrioridadProcesoLabel = (prioridad: PrioridadProceso): string => {
  switch (prioridad) {
    case PrioridadProceso.BAJA:
      return 'Baja';
    case PrioridadProceso.MEDIA:
      return 'Media';
    case PrioridadProceso.ALTA:
      return 'Alta';
    case PrioridadProceso.CRITICA:
      return 'Crítica';
    default:
      return 'No definida';
  }
};

// =============================================
// CONSTANTES
// =============================================

export const PROCESO_CONSTANTS = {
  MAX_NOMBRE_LENGTH: 100,
  MAX_DESCRIPCION_LENGTH: 500,
  MAX_CODIGO_LENGTH: 20,
  MIN_DURACION_DIAS: 1,
  MAX_DURACION_DIAS: 365,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100
} as const;