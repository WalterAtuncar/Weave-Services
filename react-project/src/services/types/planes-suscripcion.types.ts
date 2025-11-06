// ============================================================================
// Tipos para PlanesSuscripcion - API de Gestión de Planes de Suscripción
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export enum TipoPlan {
  BASICO = 'BASICO',
  ESTANDAR = 'ESTANDAR',
  PREMIUM = 'PREMIUM',
  EMPRESARIAL = 'EMPRESARIAL',
  DEMO = 'DEMO'
}

export enum EstadoPlan {
  INACTIVO = 0,
  ACTIVO = 1,
  SUSPENDIDO = 2,
  ELIMINADO = 3
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface PlanSuscripcionDto {
  planId: number;
  nombrePlan: string | null;
  descripcion: string | null;
  limiteUsuarios: number;
  duracionDias: number;
  precio: number | null;
  tipoPlan: string | null;
  activo: boolean | null;
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  nombreUsuarioCreador: string | null;
  nombreUsuarioActualizador: string | null;
  totalSuscripciones: number;
  suscripcionesActivas: number;
  suscripcionesVencidas: number;
  suscripcionesPorVencer: number;
  organizacionesSuscritas: number;
  // Propiedades calculadas (readonly)
  readonly precioPorUsuario: number;
  readonly precioPorDia: number;
  readonly estadoTexto: string | null;
  readonly tipoPlanTexto: string | null;
  readonly duracionTexto: string | null;
  readonly esPlanPopular: boolean;
  readonly porcentajeUso: number | null;
  readonly rangoPrecios: string | null;
  readonly tieneSuscripcionesActivas: boolean;
  readonly requiereAtencion: boolean;
  readonly esPlanGratuito: boolean;
  readonly esPlanPremium: boolean;
  readonly categoriaPrecio: string | null;
  readonly duracionMeses: number;
  readonly duracionSemanas: number;
}

export interface PlanSuscripcion {
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  planId: number;
  nombrePlan: string;
  descripcion: string | null;
  limiteUsuarios: number;
  duracionDias: number;
  precio: number | null;
  tipoPlan: string | null;
  activo: boolean | null;
  suscripciones: any[] | null; // SuscripcionOrganizacion[]
  // Propiedades calculadas (readonly)
  readonly precioPorUsuario: number;
  readonly precioPorDia: number;
}

// ============================================================================
// COMMANDS
// ============================================================================

export interface CreatePlanSuscripcionCommand {
  nombrePlan: string;
  descripcion?: string | null;
  limiteUsuarios: number;
  duracionDias: number;
  precio?: number | null;
  tipoPlan?: string | null;
  activo?: boolean | null;
  creadoPor?: number | null;
  estado?: number;
  // Las propiedades readonly (esPlanGratuito, esPlanDemo, etc.) se calculan automáticamente en el backend
}

export interface UpdatePlanSuscripcionCommand {
  planId: number;
  nombrePlan: string;
  descripcion?: string | null;
  limiteUsuarios: number;
  duracionDias: number;
  precio?: number | null;
  tipoPlan?: string | null;
  activo?: boolean | null;
  version: number;
  actualizadoPor?: number | null;
  actualizarSuscripcionesExistentes: boolean;
  notificarCambios: boolean;
  esActualizacionSignificativa: boolean;
  estado?: number;
  // Las propiedades readonly (esPlanGratuito, esPlanDemo, etc.) se calculan automáticamente en el backend
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface GetPlanSuscripcionRequest {
  planId: number;
  includeDeleted?: boolean;
}

export interface GetPlanesSuscripcionRequest {
  includeDeleted?: boolean;
  onlyActive?: boolean;
}

export interface GetPlanCompletoRequest {
  planId: number;
}

export interface GetPlanesActivosRequest {
  // No parameters needed
}

export interface GetPlanesGratuitosRequest {
  // No parameters needed
}

export interface GetPlanesPopularesRequest {
  top?: number;
}

export interface GetPlanesPorTipoRequest {
  tipoPlan: string;
}

export interface DeletePlanSuscripcionRequest {
  planId: number;
  forceDelete?: boolean;
  desactivarEnLugarDeEliminar?: boolean;
  migrarSuscripcionesExistentes?: boolean;
  planIdDestino?: number;
  motivo?: string;
}

export interface ActivarPlanRequest {
  planId: number;
}

export interface DesactivarPlanRequest {
  planId: number;
}

// ============================================================================
// PAGINACIÓN Y FILTROS
// ============================================================================

export interface PlanesSuscripcionPaginatedRequest {
  // Paginación base
  Page?: number;
  PageSize?: number;
  OrderBy?: string;
  OrderDescending?: boolean;
  IncludeDeleted?: boolean;
  Skip?: number;
  Take?: number;
  TieneFiltros?: boolean;

  // Filtros específicos de planes
  OnlyActive?: boolean;
  Estado?: number;
  PlanId?: number;
  NombrePlan?: string;
  TipoPlan?: string;
  Activo?: boolean;
  PrecioMinimo?: number;
  PrecioMaximo?: number;
  EsPlanGratuito?: boolean;
  LimiteUsuariosMinimo?: number;
  LimiteUsuariosMaximo?: number;
  DuracionDiasMinimo?: number;
  DuracionDiasMaximo?: number;
  EsPlanMensual?: boolean;
  EsPlanAnual?: boolean;
  SuscripcionesActivasMinimo?: number;
  SuscripcionesActivasMaximo?: number;
  TieneSuscripcionesActivas?: boolean;
  EsPlanPopular?: boolean;
  FechaCreacionDesde?: string;
  FechaCreacionHasta?: string;
  FechaActualizacionDesde?: string;
  FechaActualizacionHasta?: string;
  CreadoPor?: number;
  ActualizadoPor?: number;
  RequiereAtencion?: boolean;
  EsPlanNuevo?: boolean;
  FueModificadoRecientemente?: boolean;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface GetPlanSuscripcionResponse {
  success: boolean;
  message: string | null;
  data: PlanSuscripcionDto | null;
  errors: string[] | null;
}

export interface GetPlanesSuscripcionResponse {
  success: boolean;
  message: string | null;
  data: PlanSuscripcion[] | null;
  errors: string[] | null;
}

export interface GetPlanesSuscripcionDtoResponse {
  success: boolean;
  message: string | null;
  data: PlanSuscripcionDto[] | null;
  errors: string[] | null;
}

export interface CreatePlanSuscripcionResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

export interface UpdatePlanSuscripcionResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

export interface DeletePlanSuscripcionResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

export interface ActivarPlanResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

export interface DesactivarPlanResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

// ============================================================================
// PAGINACIÓN
// ============================================================================

// PagedResult movido a common.types.ts para evitar duplicaciones

export interface PlanesSuscripcionPaginatedResponse {
  success: boolean;
  message: string | null;
  data: PagedResult<PlanSuscripcionDto> | null;
  errors: string[] | null;
}

// ============================================================================
// CONSTANTES Y FILTROS
// ============================================================================

export const TIPOS_PLAN = [
  { value: TipoPlan.BASICO, label: 'Básico' },
  { value: TipoPlan.ESTANDAR, label: 'Estándar' },
  { value: TipoPlan.PREMIUM, label: 'Premium' },
  { value: TipoPlan.EMPRESARIAL, label: 'Empresarial' },
  { value: TipoPlan.DEMO, label: 'Demo' }
] as const;

export const ESTADOS_PLAN = [
  { value: EstadoPlan.INACTIVO, label: 'Inactivo' },
  { value: EstadoPlan.ACTIVO, label: 'Activo' },
  { value: EstadoPlan.SUSPENDIDO, label: 'Suspendido' },
  { value: EstadoPlan.ELIMINADO, label: 'Eliminado' }
] as const;

export const DURACIONES_COMUNES = [
  { value: 30, label: '30 días (Mensual)' },
  { value: 90, label: '90 días (Trimestral)' },
  { value: 180, label: '180 días (Semestral)' },
  { value: 365, label: '365 días (Anual)' },
  { value: 730, label: '730 días (Bianual)' }
] as const;

export const LIMITES_USUARIOS_COMUNES = [
  { value: 5, label: '5 usuarios' },
  { value: 10, label: '10 usuarios' },
  { value: 25, label: '25 usuarios' },
  { value: 50, label: '50 usuarios' },
  { value: 100, label: '100 usuarios' },
  { value: 250, label: '250 usuarios' },
  { value: 500, label: '500 usuarios' },
  { value: 1000, label: '1000 usuarios' },
  { value: 9999, label: 'Ilimitado' }
] as const;

export const FILTROS_PLANES = {
  SOLO_ACTIVOS: 'solo_activos',
  SOLO_GRATUITOS: 'solo_gratuitos',
  SOLO_PREMIUM: 'solo_premium',
  POPULARES: 'populares',
  CON_SUSCRIPCIONES: 'con_suscripciones',
  REQUIEREN_ATENCION: 'requieren_atencion',
  NUEVOS: 'nuevos',
  MODIFICADOS_RECIENTEMENTE: 'modificados_recientemente'
} as const;

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

export type PlanSuscripcionId = number;
export type TipoPlanValue = `${TipoPlan}`;
export type EstadoPlanValue = EstadoPlan;
export type FiltrosPlanesValue = typeof FILTROS_PLANES[keyof typeof FILTROS_PLANES];

// ============================================================================
// EXPORTACIONES POR DEFECTO
// ============================================================================

export default {
  TipoPlan,
  EstadoPlan,
  TIPOS_PLAN,
  ESTADOS_PLAN,
  DURACIONES_COMUNES,
  LIMITES_USUARIOS_COMUNES,
  FILTROS_PLANES
}; 