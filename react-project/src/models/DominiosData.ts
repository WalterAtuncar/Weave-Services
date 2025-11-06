/**
 * Modelos para gestión de Dominios y Sub-dominios de Data
 * Basado en la estructura de Sistemas pero adaptado para activos de datos
 */

// ===== ENUMS =====

/**
 * Estados posibles de un dominio de data
 */
export enum EstadoDominioData {
  BORRADOR = -4,
  INICIAR_FLUJO = -3,
  PENDIENTE = -2,
  RECHAZADO = -1,
  INACTIVO = 0,
  ACTIVO = 1
}

/**
 * Tipos de dominio de data
 */
export enum TipoDominioData {
  PERSONAS = 'personas',
  FINANCIERO = 'financiero',
  OPERACIONAL = 'operacional',
  COMERCIAL = 'comercial',
  RECURSOS_HUMANOS = 'recursos_humanos',
  TECNOLOGIA = 'tecnologia',
  LEGAL_COMPLIANCE = 'legal_compliance',
  MARKETING = 'marketing',
  LOGISTICA = 'logistica',
  CALIDAD = 'calidad'
}

/**
 * Categorías de sub-dominio
 */
export enum CategoriaSubDominio {
  DATOS_PERSONALES = 'datos_personales',
  DATOS_FINANCIEROS = 'datos_financieros',
  DATOS_MEDICOS = 'datos_medicos',
  DATOS_LABORALES = 'datos_laborales',
  DATOS_COMERCIALES = 'datos_comerciales',
  DATOS_TECNICOS = 'datos_tecnicos',
  DATOS_LEGALES = 'datos_legales',
  DATOS_MARKETING = 'datos_marketing',
  DATOS_OPERACIONALES = 'datos_operacionales',
  DATOS_CALIDAD = 'datos_calidad'
}

/**
 * Nivel de sensibilidad de los datos
 */
export enum NivelSensibilidad {
  PUBLICO = 'publico',
  INTERNO = 'interno',
  CONFIDENCIAL = 'confidencial',
  RESTRINGIDO = 'restringido',
  ALTAMENTE_CONFIDENCIAL = 'altamente_confidencial'
}

// ===== INTERFACES PRINCIPALES =====

/**
 * Interface para Sub-dominio de Data (DTO del backend)
 */
export interface SubDominioDataDto {
  subDominioDataId: number;
  dominioDataId: number;
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio?: string;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number | null; // ✅ AGREGADO: ID del gobierno asociado al subdominio
  
  // Información del dominio padre
  dominioCodigo?: string;
  dominioNombre?: string;
  
  // Campos de auditoría
  version: number;
  estado: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
  
  // Propiedades computadas
  estadoTexto: string;
  nombreCompleto: string;
  codigoCompleto: string;
}

/**
 * Interface para Dominio de Data (DTO del backend)
 */
export interface DominioDataDto {
  dominioDataId: number;
  organizacionId: number;
  codigoDominio: string;
  nombreDominio: string;
  descripcionDominio?: string;
  tipoDominioId?: number;
  gobernanzaId?: number | null; // ✅ AGREGADO: ID del gobierno asociado al dominio
  
  // Información de organización relacionada
  codigoOrganizacion?: string;
  razonSocialOrganizacion?: string;
  nombreComercialOrganizacion?: string;
  
  // Información de tipo dominio relacionada
  tipoDominioCodigo?: string;
  tipoDominioNombre?: string;
  tipoDominioDescripcion?: string;
  
  // Propiedades de auditoría
  estado: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
  version: number;
  
  // Información relacionada
  nombreUsuarioCreador?: string;
  nombreUsuarioActualizador?: string;
  
  // Propiedades computadas
  codigoCompleto: string;
  estadoTexto: string;
  
  // Estadísticas y relaciones
  totalSubDominios: number;
  subDominiosActivos: number;
  
  // Propiedades calculadas adicionales
  antiguedadEnDias?: number;
  tieneCodigo: boolean;
  tieneDescripcion: boolean;
  tieneSubDominios: boolean;
  
  // Lista de subdominios
  subDominios?: SubDominioDataDto[];
}

/**
 * Interface para Sub-dominio de Data (modelo original para compatibilidad)
 */
export interface SubDominioData {
  subDominioId: number;
  dominioId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaSubDominio;
  nivelSensibilidad: NivelSensibilidad;
  estado: EstadoDominioData;
  tieneGobernanzaPropia?: boolean;
  gobernanzaId?: number | null; // ✅ AGREGADO: ID del gobierno asociado al subdominio
  propietarioResponsable?: string;
  custodioData?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  registroEliminado: boolean;
  
  // Relaciones
  dominio?: DominioData;
  
  // Campos calculados
  estadoTexto?: string;
  categoriaTexto?: string;
  nivelSensibilidadTexto?: string;
}

/**
 * Interface para Dominio de Data (modelo original para compatibilidad)
 */
export interface DominioData {
  dominioId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoDominioData;
  dominioParentId?: number;
  organizacionId: number;
  estado: EstadoDominioData;
  gobernanzaId?: number | null; // ✅ AGREGADO: ID del gobierno asociado al dominio
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  registroEliminado: boolean;
  
  // Relaciones
  dominioParent?: DominioData;
  subDominios?: DominioData[];
  subDominiosData?: SubDominioData[];
  
  // Campos calculados
  estadoTexto?: string;
  tipoTexto?: string;
  totalSubDominios?: number;
  dominioParent_Nombre?: string;
}

/**
 * DTO para crear un nuevo dominio
 */
export interface CreateDominioDataDto {
  organizacionId: number;
  codigoDominio?: string;
  nombreDominio: string;
  descripcionDominio?: string;
  tipoDominioId?: number;
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  gobernanzaId?: number;
  tieneGobernanzaPropia?: boolean;
}

// Interfaces para el formulario
export interface CreateDominioDataFormDto {
  organizacionId: number;
  codigoDominio?: string;
  nombreDominio: string;
  descripcionDominio?: string;
  tipoDominioId?: number;
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  gobernanzaId?: number;
  tieneGobernanzaPropia?: boolean;
}

/**
 * DTO para actualizar un dominio existente
 */
export interface UpdateDominioDataDto {
  dominioDataId: number;
  organizacionId: number;
  codigoDominio?: string;
  nombreDominio: string;
  descripcionDominio?: string;
  tipoDominioId?: number;
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  gobernanzaId?: number;
  tieneGobernanzaPropia?: boolean;
}

// Interfaces para el formulario
export interface UpdateDominioDataFormDto {
  id: number;
  organizacionId: number;
  codigoDominio?: string;
  nombreDominio: string;
  descripcionDominio?: string;
  tipoDominioId?: number;
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  gobernanzaId?: number;
  tieneGobernanzaPropia?: boolean;
}

// Interface para TipoDominio
export interface TipoDominio {
  tipoDominioId: number;
  tipoDominioCodigo: string;
  tipoDominioNombre: string;
  tipoDominioDescripcion?: string;
  dominios: any[];
  estadoTexto: string;
  version: number;
  estado: number;
  creadoPor: string | null;
  fechaCreacion: string;
  actualizadoPor: string | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
}

// Interface para formulario de DominioData
export interface DominioDataFormData {
  codigoDominio: string;
  nombreDominio: string;
  descripcionDominio: string;
  tipoDominioId: number;
  propietarioNegocio: string;
  stewardData: string;
  politicasGobierno: string;
}

// Interface para errores del formulario
export interface DominioDataFormErrors {
  nombreDominio?: string;
  codigoDominio?: string;
  tipoDominioId?: string;
  propietarioNegocio?: string;
  stewardData?: string;
  general?: string[];
}

/**
 * DTO para crear un nuevo sub-dominio (alineado con backend)
 */
export interface CreateSubDominioDataDto {
  // ID de la organización (requerido por el backend en CreateSubDominioDataCommand)
  organizacionId?: number;
  dominioDataId: number;
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio?: string;
  tieneGobernanzaPropia?: boolean;
  gobernanzaId?: number;
  estado?: number;
  creadoPor?: number;
}

/**
 * DTO para actualizar un sub-dominio existente (alineado con backend)
 */
export interface UpdateSubDominioDataDto {
  subDominioDataId: number;
  dominioDataId: number;
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio?: string;
  tieneGobernanzaPropia?: boolean;
  gobernanzaId?: number;
  estado?: number;
  actualizadoPor?: number;
}

/**
 * DTO para actualizar un subdominio existente
 */
export interface UpdateSubDominioDataFormDto {
  id: number;
  dominioDataId: number;
  codigoSubDominio?: string;
  nombreSubDominio: string;
  descripcionSubDominio?: string;
  tieneGobernanzaPropia?: boolean;
  gobernanzaId?: number;
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Obtiene el label de un estado de dominio
 */
export const getEstadoDominioDataLabel = (estado: EstadoDominioData): string => {
  switch (estado) {
    case EstadoDominioData.BORRADOR:
      return 'Borrador';
    case EstadoDominioData.INICIAR_FLUJO:
      return 'Iniciar Flujo';
    case EstadoDominioData.PENDIENTE:
      return 'Pendiente';
    case EstadoDominioData.RECHAZADO:
      return 'Rechazado';
    case EstadoDominioData.INACTIVO:
      return 'Inactivo';
    case EstadoDominioData.ACTIVO:
      return 'Activo';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene el label de un tipo de dominio
 */
export const getTipoDominioDataLabel = (tipo: TipoDominioData): string => {
  switch (tipo) {
    case TipoDominioData.PERSONAS:
      return 'Datos de Personas';
    case TipoDominioData.FINANCIERO:
      return 'Datos Financieros';
    case TipoDominioData.OPERACIONAL:
      return 'Datos Operacionales';
    case TipoDominioData.COMERCIAL:
      return 'Datos Comerciales';
    case TipoDominioData.RECURSOS_HUMANOS:
      return 'Recursos Humanos';
    case TipoDominioData.TECNOLOGIA:
      return 'Datos de Tecnología';
    case TipoDominioData.LEGAL_COMPLIANCE:
      return 'Legal y Compliance';
    case TipoDominioData.MARKETING:
      return 'Datos de Marketing';
    case TipoDominioData.LOGISTICA:
      return 'Datos de Logística';
    case TipoDominioData.CALIDAD:
      return 'Datos de Calidad';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene el label de una categoría de sub-dominio
 */
export const getCategoriaSubDominioLabel = (categoria: CategoriaSubDominio): string => {
  switch (categoria) {
    case CategoriaSubDominio.DATOS_PERSONALES:
      return 'Datos Personales';
    case CategoriaSubDominio.DATOS_FINANCIEROS:
      return 'Datos Financieros';
    case CategoriaSubDominio.DATOS_MEDICOS:
      return 'Datos Médicos';
    case CategoriaSubDominio.DATOS_LABORALES:
      return 'Datos Laborales';
    case CategoriaSubDominio.DATOS_COMERCIALES:
      return 'Datos Comerciales';
    case CategoriaSubDominio.DATOS_TECNICOS:
      return 'Datos Técnicos';
    case CategoriaSubDominio.DATOS_LEGALES:
      return 'Datos Legales';
    case CategoriaSubDominio.DATOS_MARKETING:
      return 'Datos de Marketing';
    case CategoriaSubDominio.DATOS_OPERACIONALES:
      return 'Datos Operacionales';
    case CategoriaSubDominio.DATOS_CALIDAD:
      return 'Datos de Calidad';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene el label de un nivel de sensibilidad
 */
export const getNivelSensibilidadLabel = (nivel: NivelSensibilidad): string => {
  switch (nivel) {
    case NivelSensibilidad.PUBLICO:
      return 'Público';
    case NivelSensibilidad.INTERNO:
      return 'Interno';
    case NivelSensibilidad.CONFIDENCIAL:
      return 'Confidencial';
    case NivelSensibilidad.RESTRINGIDO:
      return 'Restringido';
    case NivelSensibilidad.ALTAMENTE_CONFIDENCIAL:
      return 'Altamente Confidencial';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene las opciones de estado para selects
 */
export const getEstadoDominioDataOptions = () => [
  { value: EstadoDominioData.BORRADOR, label: getEstadoDominioDataLabel(EstadoDominioData.BORRADOR) },
  { value: EstadoDominioData.INICIAR_FLUJO, label: getEstadoDominioDataLabel(EstadoDominioData.INICIAR_FLUJO) },
  { value: EstadoDominioData.PENDIENTE, label: getEstadoDominioDataLabel(EstadoDominioData.PENDIENTE) },
  { value: EstadoDominioData.RECHAZADO, label: getEstadoDominioDataLabel(EstadoDominioData.RECHAZADO) },
  { value: EstadoDominioData.INACTIVO, label: getEstadoDominioDataLabel(EstadoDominioData.INACTIVO) },
  { value: EstadoDominioData.ACTIVO, label: getEstadoDominioDataLabel(EstadoDominioData.ACTIVO) }
];

/**
 * Obtiene las opciones de tipo de dominio para selects
 */
export const getTipoDominioDataOptions = () => [
  { value: TipoDominioData.PERSONAS, label: getTipoDominioDataLabel(TipoDominioData.PERSONAS) },
  { value: TipoDominioData.FINANCIERO, label: getTipoDominioDataLabel(TipoDominioData.FINANCIERO) },
  { value: TipoDominioData.OPERACIONAL, label: getTipoDominioDataLabel(TipoDominioData.OPERACIONAL) },
  { value: TipoDominioData.COMERCIAL, label: getTipoDominioDataLabel(TipoDominioData.COMERCIAL) },
  { value: TipoDominioData.RECURSOS_HUMANOS, label: getTipoDominioDataLabel(TipoDominioData.RECURSOS_HUMANOS) },
  { value: TipoDominioData.TECNOLOGIA, label: getTipoDominioDataLabel(TipoDominioData.TECNOLOGIA) },
  { value: TipoDominioData.LEGAL_COMPLIANCE, label: getTipoDominioDataLabel(TipoDominioData.LEGAL_COMPLIANCE) },
  { value: TipoDominioData.MARKETING, label: getTipoDominioDataLabel(TipoDominioData.MARKETING) },
  { value: TipoDominioData.LOGISTICA, label: getTipoDominioDataLabel(TipoDominioData.LOGISTICA) },
  { value: TipoDominioData.CALIDAD, label: getTipoDominioDataLabel(TipoDominioData.CALIDAD) }
];

// ===== TIPOS DE RESPUESTA PAGINADA =====

/**
 * Interface para información de paginación
 */
export interface PaginationInfo {
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * Interface para respuesta paginada de dominios
 */
export interface DominiosDataPagedResponse {
  data: DominioDataDto[];
  pagination: PaginationInfo;
}

/**
 * Interface para respuesta API estándar
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  statusCode?: number;
  metadata?: any;
}

/**
 * Tipo para la respuesta completa de dominios paginados
 */
export type DominiosDataApiResponse = ApiResponse<DominiosDataPagedResponse>;

/**
 * Interface para filtros de búsqueda de dominios
 */
export interface DominiosDataFilters {
  searchTerm?: string;
  organizacionId?: number;
  tipoDominioId?: number;
  estado?: number;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  includeDeleted?: boolean;
}

/**
 * Interface para parámetros de consulta paginada
 */
export interface DominiosDataQueryParams {
  page: number;
  pageSize: number;
  orderBy: string;
  ascending: boolean;
  filters?: DominiosDataFilters;
}

/**
 * Obtiene las opciones de categoría de sub-dominio para selects
 */
export const getCategoriaSubDominioOptions = () => [
  { value: CategoriaSubDominio.DATOS_PERSONALES, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_PERSONALES) },
  { value: CategoriaSubDominio.DATOS_FINANCIEROS, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_FINANCIEROS) },
  { value: CategoriaSubDominio.DATOS_MEDICOS, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_MEDICOS) },
  { value: CategoriaSubDominio.DATOS_LABORALES, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_LABORALES) },
  { value: CategoriaSubDominio.DATOS_COMERCIALES, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_COMERCIALES) },
  { value: CategoriaSubDominio.DATOS_TECNICOS, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_TECNICOS) },
  { value: CategoriaSubDominio.DATOS_LEGALES, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_LEGALES) },
  { value: CategoriaSubDominio.DATOS_MARKETING, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_MARKETING) },
  { value: CategoriaSubDominio.DATOS_OPERACIONALES, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_OPERACIONALES) },
  { value: CategoriaSubDominio.DATOS_CALIDAD, label: getCategoriaSubDominioLabel(CategoriaSubDominio.DATOS_CALIDAD) }
];

/**
 * Obtiene las opciones de nivel de sensibilidad para selects
 */
export const getNivelSensibilidadOptions = () => [
  { value: NivelSensibilidad.PUBLICO, label: getNivelSensibilidadLabel(NivelSensibilidad.PUBLICO) },
  { value: NivelSensibilidad.INTERNO, label: getNivelSensibilidadLabel(NivelSensibilidad.INTERNO) },
  { value: NivelSensibilidad.CONFIDENCIAL, label: getNivelSensibilidadLabel(NivelSensibilidad.CONFIDENCIAL) },
  { value: NivelSensibilidad.RESTRINGIDO, label: getNivelSensibilidadLabel(NivelSensibilidad.RESTRINGIDO) },
  { value: NivelSensibilidad.ALTAMENTE_CONFIDENCIAL, label: getNivelSensibilidadLabel(NivelSensibilidad.ALTAMENTE_CONFIDENCIAL) }
];

/**
 * Obtiene el color asociado a un estado
 */
export const getEstadoDominioDataColor = (estado: EstadoDominioData): string => {
  switch (estado) {
    case EstadoDominioData.ACTIVO:
      return 'success';
    case EstadoDominioData.INACTIVO:
      return 'secondary';
    case EstadoDominioData.PENDIENTE:
      return 'warning';
    case EstadoDominioData.RECHAZADO:
      return 'danger';
    case EstadoDominioData.BORRADOR:
      return 'info';
    case EstadoDominioData.INICIAR_FLUJO:
      return 'primary';
    default:
      return 'secondary';
  }
};

/**
 * Obtiene el color asociado a un nivel de sensibilidad
 */
export const getNivelSensibilidadColor = (nivel: NivelSensibilidad): string => {
  switch (nivel) {
    case NivelSensibilidad.PUBLICO:
      return 'success';
    case NivelSensibilidad.INTERNO:
      return 'info';
    case NivelSensibilidad.CONFIDENCIAL:
      return 'warning';
    case NivelSensibilidad.RESTRINGIDO:
      return 'danger';
    case NivelSensibilidad.ALTAMENTE_CONFIDENCIAL:
      return 'dark';
    default:
      return 'secondary';
  }
};