/**
 * Interfaces para el servicio de PersonaPosicion
 * Basado en el swagger API del backend
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES PRINCIPALES =====

export interface PersonaPosicion {
  personaId: number;
  posicionId: number;
  fechaInicio: string;
  fechaFin?: string;
  esActiva: boolean;
  estado: number;
  version: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
}

export interface PersonaPosicionDto {
  personaId: number;
  posicionId: number;
  fechaInicio: string;
  fechaFin?: string;
  esActiva: boolean;
  estado: number;
  version: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
  
  // Datos enriquecidos de Persona
  nombreCompletoPersona?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  emailPersonal?: string;
  celular?: string;
  tipoDoc?: number;
  nroDoc?: string;
  codEmpleado?: string;
  estadoLaboral?: number;
  organizacionId?: number;
  sedeId?: number;
  
  // Datos enriquecidos de Posicion
  nombrePosicion?: string;
  descripcionPosicion?: string;
  categoriaPosicion?: number;
  estadoPosicion?: string;
  nivelPosicion?: number;
  
  // Datos enriquecidos de UnidadOrg
  unidadOrgId?: number;
  nombreUnidadOrg?: string;
  descripcionUnidadOrg?: string;
  tipoUnidadOrg?: number;
  codigoUnidadOrg?: string;
  
  // Datos enriquecidos de Organizacion
  organizacionNombre?: string;
  organizacionCodigo?: string;
  
  // Datos enriquecidos de Sede
  sedeNombre?: string;
  sedeDescripcion?: string;
  
  // Campos calculados
  duracionEnDias?: number;
  duracionEnMeses?: number;
  duracionEnAnios?: number;
  esAsignacionVigente?: boolean;
  esAsignacionHistorica?: boolean;
  diasRestantes?: number;
  porcentajeCompletado?: number;
  estadoTexto?: string;
  categoriaPosicionTexto?: string;
  tipoUnidadOrgTexto?: string;
  estadoLaboralTexto?: string;
}

// ===== COMMANDS =====

export interface CreatePersonaPosicionCommand {
  PersonaId: number;
  PosicionId: number;
  FechaInicio?: string;
  FechaFin?: string;
  CreadoPor?: number;
}

export interface UpdatePersonaPosicionCommand {
  PersonaId: number;
  PosicionId: number;
  FechaInicio?: string;
  FechaFin?: string;
  EsActiva?: boolean;
  Estado?: number;
  ActualizadoPor?: number;
}

export interface DeletePersonaPosicionCommand {
  PersonaId: number;
  PosicionId: number;
  ForceDelete?: boolean;
  FinalizarEnLugarDeEliminar?: boolean;
  Motivo?: string;
  EliminadoPor?: number;
}

// ===== REQUESTS =====

export interface GetAllPersonaPosicionesRequest {
  includeDeleted?: boolean;
  onlyActive?: boolean;
}

export interface GetPersonaPosicionByIdRequest {
  personaId: number;
  posicionId: number;
  includeDeleted?: boolean;
}

export interface GetPersonaPosicionCompletaRequest {
  personaId: number;
  posicionId: number;
}

export interface GetPosicionesByPersonaRequest {
  personaId: number;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  includeHistorical?: boolean;
}

export interface GetPersonasByPosicionRequest {
  posicionId: number;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  includeHistorical?: boolean;
}

export interface GetAllPersonaPosicionesPaginatedRequest {
  // Paginación
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDescending?: boolean;
  
  // Filtros básicos
  includeDeleted?: boolean;
  onlyActive?: boolean;
  estado?: number;
  
  // Filtros por entidad
  personaId?: number;
  posicionId?: number;
  
  // Filtros por datos de persona
  nombrePersona?: string;
  apellidoPersona?: string;
  
  // Filtros por datos de posición
  nombrePosicion?: string;
  categoriaPosicion?: number;
  
  // Filtros por unidad organizacional
  unidadOrgId?: number;
  nombreUnidadOrg?: string;
  tipoUnidadOrg?: number;
  
  // Filtros por fechas
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinDesde?: string;
  fechaFinHasta?: string;
  
  // Filtros por estado de asignación
  esActiva?: boolean;
  
  // Filtros por auditoría
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  
  // Búsqueda general
  searchTerm?: string;
}

// ===== RESPONSES =====

export type GetAllPersonaPosicionesResponseData = PersonaPosicion[];
export type GetPersonaPosicionByIdResponseData = PersonaPosicion;
export type GetPersonaPosicionCompletaResponseData = PersonaPosicionDto;
export type CreatePersonaPosicionResponseData = boolean;
export type UpdatePersonaPosicionResponseData = boolean;
export type DeletePersonaPosicionResponseData = boolean;
export type GetPosicionesByPersonaResponseData = PersonaPosicionDto[];
export type GetPersonasByPosicionResponseData = PersonaPosicionDto[];
export type GetAsignacionesActivasResponseData = PersonaPosicion[];

export interface PersonaPosicionesPaginatedResponseData {
  data: PersonaPosicionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===== TIPOS AUXILIARES =====

export interface PersonaPosicionFilters {
  personaId?: number;
  posicionId?: number;
  nombrePersona?: string;
  apellidoPersona?: string;
  nombrePosicion?: string;
  categoriaPosicion?: number;
  unidadOrgId?: number;
  nombreUnidadOrg?: string;
  tipoUnidadOrg?: number;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinDesde?: string;
  fechaFinHasta?: string;
  esActiva?: boolean;
  estado?: number;
  includeDeleted?: boolean;
  onlyActive?: boolean;
}

// SortOptions y PaginationOptions movidos a common.types.ts para evitar duplicaciones

// ===== ENUMS =====

export enum PersonaPosicionEstado {
  INACTIVO = 0,
  ACTIVO = 1,
  SUSPENDIDO = 2,
  FINALIZADO = 3
}

// CategoriaPosicion y EstadoLaboral movidos a common.types.ts para evitar duplicaciones

// ===== TYPE ALIASES =====

export type GetAllPersonaPosicionesResponse = ApiResponse<GetAllPersonaPosicionesResponseData>;
export type GetPersonaPosicionByIdResponse = ApiResponse<GetPersonaPosicionByIdResponseData>;
export type GetPersonaPosicionCompletaResponse = ApiResponse<GetPersonaPosicionCompletaResponseData>;
export type CreatePersonaPosicionResponse = ApiResponse<CreatePersonaPosicionResponseData>;
export type UpdatePersonaPosicionResponse = ApiResponse<UpdatePersonaPosicionResponseData>;
export type DeletePersonaPosicionResponse = ApiResponse<DeletePersonaPosicionResponseData>;
export type GetPosicionesByPersonaResponse = ApiResponse<GetPosicionesByPersonaResponseData>;
export type GetPersonasByPosicionResponse = ApiResponse<GetPersonasByPosicionResponseData>;
export type PersonaPosicionesPaginatedResponse = ApiResponse<PersonaPosicionesPaginatedResponseData>;
export type GetAsignacionesActivasResponse = ApiResponse<GetAsignacionesActivasResponseData>; 