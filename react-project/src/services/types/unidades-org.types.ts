// ============================================================================
// UNIDADES ORGANIZACIONALES - TYPES
// ============================================================================
// Tipos TypeScript para el servicio de unidades organizacionales
// Basado en el swagger-api.json

// ============================================================================
// ENUMS
// ============================================================================

export enum TipoUnidad {
  CORPORATIVO = 1,
  DIVISION = 2,
  GERENCIA = 3,
  SUBGERENCIA = 4,
  DEPARTAMENTO = 5,
  AREA = 6,
  SECCION = 7,
  EQUIPO = 8
}

export enum EstadoUnidadOrg {
  INACTIVO = 0,
  ACTIVO = 1
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface UnidadOrg {
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  unidadesOrgId: number;
  organizacionId: number | null;
  sedeId: number | null;
  unidadPadreId: number | null;
  tipoUnidad: number;
  nombre: string;
  nombreCorto: string | null;
  objetivo: string | null;
  posicionCategoria: number | null;
  centroCosto: string | null;
  organizacion?: any; // Organizacion
  unidadPadre?: UnidadOrg | null;
  unidadesHijas?: UnidadOrg[] | null;
  posiciones?: any[] | null; // Posicion[]
  
  // Propiedades calculadas (readonly)
  readonly tipoUnidadTexto: string | null;
}

export interface UnidadOrgDto {
  unidadesOrgId: number;
  organizacionId: number | null;
  sedeId: number | null;
  unidadPadreId: number | null;
  tipoUnidad: number;
  nombre: string | null;
  nombreCorto: string | null;
  objetivo: string | null;
  posicionCategoria: number | null;
  centroCosto: string | null;
  tipoUnidadTexto: string | null;
  
  // Información de la organización
  codigoOrganizacion: string | null;
  razonSocialOrganizacion: string | null;
  nombreComercialOrganizacion: string | null;
  
  // Información de la unidad padre
  nombreUnidadPadre: string | null;
  nombreCortoUnidadPadre: string | null;
  tipoUnidadPadre: number | null;
  tipoUnidadPadreTexto: string | null;
  
  // Información jerárquica
  nivelJerarquico: number;
  rutaJerarquica: string | null;
  jerarquiaNombres: string[] | null;
  
  // Estadísticas
  cantidadUnidadesHijas: number;
  cantidadPosiciones: number;
  cantidadPosicionesOcupadas: number;
  cantidadPosicionesVacantes: number;
  
  // Información de auditoría
  fechaCreacion: string;
  fechaActualizacion: string | null;
  creadoPor: number | null;
  actualizadoPor: number | null;
  estado: number;
  registroEliminado: boolean;
  fechaEliminacion: string | null;
  eliminadoPor: number | null;
  version: number;
  
  // Propiedades calculadas adicionales (readonly)
  readonly esUnidadRaiz: boolean;
  readonly esUnidadHoja: boolean;
  readonly tienePosiciones: boolean;
  readonly todasPosicionesOcupadas: boolean;
  readonly porcentajeOcupacion: number;
}

// ============================================================================
// COMANDOS
// ============================================================================

export interface CreateUnidadOrgCommand {
  organizacionId: number;
  sedeId?: number | null;
  tipoUnidad: number;
  nombre: string;
  unidadPadreId?: number | null;
  nombreCorto?: string | null;
  objetivo?: string | null;
  posicionCategoria?: number | null;
  centroCosto?: string | null;
  creadoPor?: number | null;
}

export interface UpdateUnidadOrgCommand {
  unidadesOrgId: number;
  organizacionId?: number | null;
  sedeId?: number | null;
  unidadPadreId?: number | null;
  tipoUnidad?: number | null;
  nombre?: string | null;
  nombreCorto?: string | null;
  objetivo?: string | null;
  posicionCategoria?: number | null;
  centroCosto?: string | null;
  
  // Flags de control de actualización
  actualizarOrganizacion: boolean;
  actualizarUnidadPadre: boolean;
  actualizarTipo: boolean;
  actualizarInformacionBasica: boolean;
  actualizarObjetivo: boolean;
  actualizarCentroCosto: boolean;
  validarJerarquia: boolean;
  permitirCambioOrganizacion: boolean;
  
  actualizadoPor?: number | null;
  motivoModificacion?: string | null;
}

// ============================================================================
// REQUESTS
// ============================================================================

export interface GetUnidadOrgRequest {
  id: number;
  includeDeleted?: boolean;
}

export interface GetUnidadesOrgRequest {
  includeDeleted?: boolean;
  organizacionId?: number;
  tipoUnidad?: number;
  unidadPadreId?: number;
  soloUnidadesRaiz?: boolean;
  soloUnidadesHoja?: boolean;
}

export interface GetUnidadOrgCompletaRequest {
  id: number;
}

export interface GetJerarquiaUnidadRequest {
  unidadId: number;
  incluirUnidadActual?: boolean;
  ordenAscendente?: boolean;
}

export interface GetUnidadesPorOrganizacionRequest {
  organizacionId: number;
  includeDeleted?: boolean;
}

export interface GetArbolJerarquicoRequest {
  organizacionId: number;
  includeDeleted?: boolean;
  maxNiveles?: number;
  unidadRaizId?: number;
}

export interface GetUnidadesRaizRequest {
  organizacionId: number;
  includeDeleted?: boolean;
}

export interface GetUnidadesHijasRequest {
  unidadPadreId: number;
  includeDeleted?: boolean;
}

export interface GetUnidadesPaginatedRequest {
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  OrganizacionId?: number;
  TipoUnidad?: number;
  UnidadPadreId?: number;
  CentroCosto?: string;
  IncludeDeleted?: boolean;
  SoloUnidadesRaiz?: boolean;
  SoloUnidadesHoja?: boolean;
  SoloUnidadesConPosiciones?: boolean;
  SoloUnidadesSinPosiciones?: boolean;
  OrderBy?: string;
  OrderDescending?: boolean;
  FechaCreacionDesde?: string;
  FechaCreacionHasta?: string;
}

export interface GetUnidadesPorTipoRequest {
  tipoUnidad: number;
  includeDeleted?: boolean;
}

export interface DeleteUnidadOrgRequest {
  id: number;
  forceDelete?: boolean;
  eliminarUnidadesHijas?: boolean;
  reasignarPosiciones?: boolean;
  nuevaUnidadParaPosiciones?: number;
  motivoEliminacion?: string;
}

// ============================================================================
// RESPONSES
// ============================================================================

export interface GetUnidadOrgResponse {
  success: boolean;
  message: string | null;
  data: UnidadOrg | null;
  errors: string[] | null;
}

export interface GetUnidadesOrgResponse {
  success: boolean;
  message: string | null;
  data: UnidadOrg[] | null;
  errors: string[] | null;
}

export interface GetUnidadOrgDtoResponse {
  success: boolean;
  message: string | null;
  data: UnidadOrgDto | null;
  errors: string[] | null;
}

export interface GetUnidadesOrgDtoResponse {
  success: boolean;
  message: string | null;
  data: UnidadOrgDto[] | null;
  errors: string[] | null;
}

export interface CreateUnidadOrgResponse {
  success: boolean;
  message: string | null;
  data: number | null; // ID de la unidad creada
  errors: string[] | null;
}

export interface UpdateUnidadOrgResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

export interface DeleteUnidadOrgResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: string[] | null;
}

// ============================================================================
// PAGINACIÓN
// ============================================================================

// PaginatorMetadata y PagedResult movidos a common.types.ts para evitar duplicaciones

export interface UnidadesOrgPaginatedResponse {
  success: boolean;
  message: string | null;
  data: PagedResult<UnidadOrgDto> | null;
  errors: string[] | null;
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export type UnidadOrgId = number;
export type TipoUnidadValue = TipoUnidad;
export type EstadoUnidadOrgValue = EstadoUnidadOrg;

// Filtros y opciones
export interface UnidadOrgFilters {
  searchTerm?: string;
  organizacionId?: number;
  tipoUnidad?: number;
  unidadPadreId?: number;
  centroCosto?: string;
  includeDeleted?: boolean;
  soloUnidadesRaiz?: boolean;
  soloUnidadesHoja?: boolean;
  soloUnidadesConPosiciones?: boolean;
  soloUnidadesSinPosiciones?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
}

// SortOptions y PaginationOptions movidos a common.types.ts para evitar duplicaciones

// ============================================================================
// CONSTANTES
// ============================================================================

export const TIPOS_UNIDAD = [
  { value: TipoUnidad.CORPORATIVO, label: 'Corporativo' },
  { value: TipoUnidad.DIVISION, label: 'División' },
  { value: TipoUnidad.GERENCIA, label: 'Gerencia' },
  { value: TipoUnidad.SUBGERENCIA, label: 'Sub Gerencia' },
  { value: TipoUnidad.DEPARTAMENTO, label: 'Departamento' },
  { value: TipoUnidad.AREA, label: 'Área' },
  { value: TipoUnidad.SECCION, label: 'Sección' },
  { value: TipoUnidad.EQUIPO, label: 'Equipo' }
] as const;

export const ESTADOS_UNIDAD_ORG = [
  { value: EstadoUnidadOrg.INACTIVO, label: 'Inactivo' },
  { value: EstadoUnidadOrg.ACTIVO, label: 'Activo' }
] as const;

export const FILTROS_UNIDADES_ORG = {
  TODAS: 'todas',
  SOLO_RAIZ: 'soloRaiz',
  SOLO_HOJA: 'soloHoja',
  CON_POSICIONES: 'conPosiciones',
  SIN_POSICIONES: 'sinPosiciones'
} as const;

export type FiltrosUnidadesOrgValue = typeof FILTROS_UNIDADES_ORG[keyof typeof FILTROS_UNIDADES_ORG]; 