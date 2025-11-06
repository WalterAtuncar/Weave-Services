// ============================================================================
// SUSCRIPCIONES ORGANIZACIÓN - TYPES
// ============================================================================
// Tipos TypeScript para el servicio de suscripciones de organizaciones
// Basado en el swagger-api.json actualizado

// ============================================================================
// ENUMS
// ============================================================================

export enum EstadoSuscripcionEnum {
  NUEVA = 1,
  ACTIVA = 2,
  VENCIDA = 3,
  SUSPENDIDA = 4,
  CANCELADA = 5,
  RENOVADA = 6
}

export enum TipoOperacionSuscripcion {
  NUEVA = 1,
  RENOVACION = 2,
  EXTENSION = 3,
  MIGRACION = 4,
  REACTIVACION = 5
}

export enum EstadoSuscripcion {
  INACTIVA = 0,
  ACTIVA = 1,
  VENCIDA = 2,
  SUSPENDIDA = 3,
  CANCELADA = 4
}

export enum TipoSuscripcion {
  DEMO = 'demo',
  REGULAR = 'regular',
  PRUEBA = 'prueba',
  EMPRESARIAL = 'empresarial',
  COMERCIAL = 'comercial'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface SuscripcionOrganizacion {
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  suscripcionId: number;
  organizacionId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  limiteUsuarios: number;
  esDemo: boolean | null;
  organizacion?: any; // Organizacion
  plan?: any; // PlanSuscripcion
  
  // Propiedades calculadas (readonly)
  readonly estaVigente: boolean;
  readonly diasRestantes: number;
  readonly estaPorVencer: boolean;
  readonly estadoSuscripcion: string | null;
}

export interface SuscripcionOrganizacionDto {
  suscripcionId: number;
  organizacionId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  limiteUsuarios: number;
  esDemo: boolean | null;
  tipoOperacion: TipoOperacionSuscripcion;
  estadoSuscripcion: EstadoSuscripcionEnum;
  suscripcionAnteriorId: number | null;
  motivoOperacion: string | null;
  estaVigente: boolean;
  diasRestantes: number;
  estaPorVencer: boolean;
  estadoDescripcion: string | null;
  tipoOperacionDescripcion: string | null;
  estadoSuscripcionDescripcion: string | null;
  
  // Información de la organización
  codigoOrganizacion: string | null;
  razonSocial: string | null;
  nombreComercial: string | null;
  numeroDocumento: string | null;
  telefonoOrganizacion: string | null;
  emailOrganizacion: string | null;
  direccionOrganizacion: string | null;
  sitioWebOrganizacion: string | null;
  logoUrlOrganizacion: string | null;
  
  // Información del plan
  nombrePlan: string | null;
  descripcionPlan: string | null;
  limiteUsuariosPlan: number;
  duracionDiasPlan: number;
  precioPlan: number;
  tipoPlan: string | null;
  activoPlan: boolean;
  
  // Información de ubicación
  nombrePais: string | null;
  nombreDepartamento: string | null;
  nombreProvincia: string | null;
  nombreDistrito: string | null;
  
  // Información de auditoría
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  eliminadoPor: number | null;
  fechaEliminacion: string | null;
  version: number;
  
  // Propiedades calculadas adicionales (readonly)
  readonly montoTotal: number | null;
  readonly fechaProximoVencimiento: string | null;
  readonly requiereRenovacion: boolean;
  readonly tipoSuscripcion: string | null;
  readonly porcentajeTiempoTranscurrido: number;
  
  // Información de usuarios
  usuariosActuales: number | null;
  readonly usuariosDisponibles: number | null;
  readonly porcentajeUsoUsuarios: number | null;
  readonly limiteUsuariosAlcanzado: boolean;
  
  // Información de facturación
  ultimaFechaFacturacion: string | null;
  proximaFechaFacturacion: string | null;
  montoUltimaFacturacion: number | null;
}

// ============================================================================
// COMANDOS
// ============================================================================

export interface CreateSuscripcionOrganizacionCommand {
  organizacionId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  limiteUsuarios: number;
  esDemo?: boolean | null;
  tipoOperacion?: TipoOperacionSuscripcion;
  estadoSuscripcion?: EstadoSuscripcionEnum;
  motivoOperacion?: string | null;
}

export interface UpdateSuscripcionOrganizacionCommand {
  suscripcionId: number;
  organizacionId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  limiteUsuarios: number;
  esDemo?: boolean | null;
  tipoOperacion?: TipoOperacionSuscripcion;
  estadoSuscripcion?: EstadoSuscripcionEnum;
  motivoOperacion?: string | null;
}

// ============================================================================
// REQUESTS
// ============================================================================

export interface GetSuscripcionOrganizacionRequest {
  suscripcionId: number;
  includeDeleted?: boolean;
}

export interface GetSuscripcionesOrganizacionRequest {
  includeDeleted?: boolean;
  onlyActive?: boolean;
  onlyDemo?: boolean;
  onlyCommercial?: boolean;
  organizacionId?: number;
  planId?: number;
}

export interface GetSuscripcionesPaginatedRequest {
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  OrganizacionId?: number;
  PlanId?: number;
  EsDemo?: boolean;
  SoloVigentes?: boolean;
  SoloPorVencer?: boolean;
  FechaInicioDesde?: string;
  FechaInicioHasta?: string;
  FechaFinDesde?: string;
  FechaFinHasta?: string;
  LimiteUsuariosMinimo?: number;
  LimiteUsuariosMaximo?: number;
  OrderBy?: string;
  OrderDescending?: boolean;
  IncludeDeleted?: boolean;
}

export interface GetSuscripcionesPorOrganizacionRequest {
  organizacionId: number;
  includeDeleted?: boolean;
}

export interface GetSuscripcionActivaRequest {
  organizacionId: number;
}

export interface GetHistorialSuscripcionesRequest {
  organizacionId: number;
}

export interface GetSuscripcionesPorPlanRequest {
  planId: number;
  includeDeleted?: boolean;
}

export interface GetSuscripcionesVigentesRequest {
  includeRelated?: boolean;
  ordenarPor?: string;
}

export interface GetSuscripcionesPorVencerRequest {
  diasAnticipacion?: number;
  includeRelated?: boolean;
}

export interface ExtenderSuscripcionRequest {
  id: number;
  diasExtension?: number;
  motivoOperacion?: string;
}

export interface RenovarSuscripcionRequest {
  id: number;
  nuevoPlanId?: number;
  motivoOperacion?: string;
}

export interface EliminarSuscripcionRequest {
  id: number;
  forceDelete?: boolean;
  motivoEliminacion?: string;
}

// ============================================================================
// RESPONSES
// ============================================================================

export interface GetSuscripcionOrganizacionResponse {
  success: boolean;
  message: string | null;
  data: SuscripcionOrganizacion | null;
  errors: string[] | null;
}

export interface GetSuscripcionOrganizacionDtoResponse {
  success: boolean;
  message: string | null;
  data: SuscripcionOrganizacionDto | null;
  errors: string[] | null;
}

export interface GetSuscripcionesOrganizacionResponse {
  success: boolean;
  message: string | null;
  data: SuscripcionOrganizacion[] | null;
  errors: string[] | null;
}

export interface GetSuscripcionesOrganizacionDtoResponse {
  success: boolean;
  message: string | null;
  data: SuscripcionOrganizacionDto[] | null;
  errors: string[] | null;
}

export interface CreateSuscripcionOrganizacionResponse {
  success: boolean;
  message: string | null;
  data: number | null; // ID de la suscripción creada
  errors: string[] | null;
}

export interface UpdateSuscripcionOrganizacionResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

export interface DeleteSuscripcionOrganizacionResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

export interface ExtenderSuscripcionResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

export interface RenovarSuscripcionResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

// ============================================================================
// PAGINACIÓN
// ============================================================================

// PaginatorMetadata y PagedResult movidos a common.types.ts para evitar duplicaciones

export interface SuscripcionesOrganizacionPaginatedResponse {
  success: boolean;
  message: string | null;
  data: PagedResult<SuscripcionOrganizacionDto> | null;
  errors: string[] | null;
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export type SuscripcionOrganizacionId = number;
export type EstadoSuscripcionValue = EstadoSuscripcion;
export type TipoSuscripcionValue = `${TipoSuscripcion}`;

// ============================================================================
// CONSTANTES
// ============================================================================

export const ESTADOS_SUSCRIPCION = {
  INACTIVA: EstadoSuscripcion.INACTIVA,
  ACTIVA: EstadoSuscripcion.ACTIVA,
  VENCIDA: EstadoSuscripcion.VENCIDA,
  SUSPENDIDA: EstadoSuscripcion.SUSPENDIDA,
  CANCELADA: EstadoSuscripcion.CANCELADA
} as const;

export const TIPOS_SUSCRIPCION = {
  DEMO: TipoSuscripcion.DEMO,
  REGULAR: TipoSuscripcion.REGULAR,
  PRUEBA: TipoSuscripcion.PRUEBA,
  EMPRESARIAL: TipoSuscripcion.EMPRESARIAL,
  COMERCIAL: TipoSuscripcion.COMERCIAL
} as const;

export const FILTROS_SUSCRIPCIONES = {
  TODAS: 'todas',
  VIGENTES: 'vigentes',
  VENCIDAS: 'vencidas',
  POR_VENCER: 'por_vencer',
  DEMO: 'demo',
  COMERCIALES: 'comerciales'
} as const;

// ============================================================================
// EXPORTS ADICIONALES
// ============================================================================

export type FiltrosSuscripcionesValue = typeof FILTROS_SUSCRIPCIONES[keyof typeof FILTROS_SUSCRIPCIONES]; 