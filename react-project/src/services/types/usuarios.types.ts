/**
 * Interfaces para el servicio de usuarios
 * Basado en el swagger API del backend
 */

// ===== ENTIDADES PRINCIPALES =====

// Usuario con información de persona y posición para el formulario de gobernanza
export interface UsuarioConPersonaPosicion {
  // Información del Usuario
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  estado: number;
  personaId?: number;
  organizacionId?: number;

  // Información de la Persona
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombres?: string;
  emailPersonal?: string;

  // Información de la Posición
  nombrePosicion?: string;
  categoriaPosicion?: string;

  // Campos calculados
  nombreCompleto: string;
  nombreCompletoConPosicion: string;
  esActivo: boolean;
}

// Usuario básico (entidad del dominio) - ACTUALIZADO con nueva estructura API
export interface Usuario {
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  usuarioId: number;
  tipoUsuarioId: number | null;
  personaId: number | null;
  perfilId: number | null;
  nombreUsuario: string;
  hashPassword: string;
  fechaExpiracion: string | null;
  // NUEVOS CAMPOS: Información del perfil directamente en la respuesta
  nombrePerfil: string;
  descripcionPerfil: string;
  // CAMPOS EXISTENTES
  persona: PersonaSimpleDto | null;
  perfil: PerfilSimpleDto | null;
  passwordExpirado: boolean;
  diasParaExpiracion: number;
}

// DTOs relacionados (simplificados)
export interface PersonaSimpleDto {
  personaId: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  nroDoc?: string | null;
  tipoDoc?: number | null;
  emailPersonal?: string | null;
  nombreCompleto?: string | null;
}

// UsuarioDto con información extendida
export interface UsuarioDto {
  usuarioId: number;
  tipoUsuarioId: number | null;
  personaId: number | null;
  perfilId: number | null;
  nombreUsuario: string;
  fechaExpiracion: string | null;
  // REMOVIDO: organizacionId ya no es parte de Usuario según swagger
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string | null;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  version: number;
  nombreUsuarioCreador: string | null;
  nombreUsuarioActualizador: string | null;
  nombrePersona: string | null;
  nombrePerfil: string | null;
  esActivo: boolean;
  estaExpirado: boolean;
  diasParaExpiracion: number | null;
  tienePersona: boolean;
  tienePerfil: boolean;
  persona: PersonaSimpleDto | null;
  perfil: PerfilSimpleDto | null;
}

export interface PerfilSimpleDto {
  perfilId: number;
  nombrePerfil: string;
  descripcion?: string | null;
}

// ===== COMMANDS (REQUESTS) =====

// Crear usuario
export interface CreateUsuarioCommand {
  tipoUsuarioId?: number | null;
  personaId?: number | null;
  perfilId?: number | null;
  nombreUsuario: string;
  password: string;
  fechaExpiracion?: string | null;
  // REMOVIDO: organizacionId ya no es parte de Usuario según swagger
}

// Actualizar usuario
export interface UpdateUsuarioCommand {
  usuarioId: number;
  tipoUsuarioId?: number | null;
  personaId?: number | null;
  perfilId?: number | null;
  nombreUsuario: string;
  password: string;
  fechaExpiracion?: string | null;
  // REMOVIDO: organizacionId ya no es parte de Usuario según swagger
}

// ===== REQUESTS =====

export interface GetUsuariosRequest {
  includeDeleted?: boolean;
}

export interface GetUsuarioByIdRequest {
  usuarioId: number;
  includeDeleted?: boolean;
}

export interface GetUsuarioByUsernameRequest {
  nombreUsuario: string;
  includeDeleted?: boolean;
}

export interface GetUsuarioByPersonaIdRequest {
  personaId: number;
  includeDeleted?: boolean;
}

export interface CreateUsuarioRequest extends CreateUsuarioCommand {}

export interface UpdateUsuarioRequest extends UpdateUsuarioCommand {}

export interface DeleteUsuarioRequest {
  usuarioId: number;
  forceDelete?: boolean;
  motivo?: string;
}

// Request para búsqueda paginada
export interface GetUsuariosPaginatedRequest {
  // Filtros de usuario
  nombreUsuario?: string;
  personaId?: number;
  perfilId?: number;
  tipoUsuarioId?: number;
  estado?: number;
  fechaExpiracionDesde?: string;
  fechaExpiracionHasta?: string;
  esActivo?: boolean;
  estaExpirado?: boolean;
  tienePersona?: boolean;
  tienePerfil?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  includeDeleted?: boolean;
  
  // Filtros de persona relacionada
  nombresPersona?: string;
  apellidoPaternoPersona?: string;
  apellidoMaternoPersona?: string;
  nroDocPersona?: string;
  emailPersonalPersona?: string;
  
  // Filtros de perfil relacionado
  nombrePerfil?: string;
  
  // Paginación
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
}

// ===== RESPONSES =====

export type GetUsuariosResponseData = Usuario[];
export type GetUsuariosDtoResponseData = UsuarioDto[];
export type GetUsuariosConPersonaPosicionResponseData = UsuarioConPersonaPosicion[];
export type GetUsuarioByIdResponseData = Usuario;
export type GetUsuarioDtoByIdResponseData = UsuarioDto;
export type GetUsuarioByUsernameResponseData = Usuario;
export type GetUsuarioByPersonaIdResponseData = Usuario;
export type CreateUsuarioResponseData = number; // ID del usuario creado
export type UpdateUsuarioResponseData = boolean;
export type DeleteUsuarioResponseData = boolean;

// Response paginado
export interface UsuariosPaginatedResponseData {
  data: UsuarioDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===== TIPOS AUXILIARES =====

// Filtros para búsqueda de usuarios
export interface UsuarioFilters {
  nombreUsuario?: string;
  personaId?: number;
  perfilId?: number;
  tipoUsuarioId?: number;
  estado?: number;
  fechaExpiracionDesde?: string;
  fechaExpiracionHasta?: string;
  esActivo?: boolean;
  estaExpirado?: boolean;
  tienePersona?: boolean;
  tienePerfil?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  includeDeleted?: boolean;
  
  // Filtros de persona relacionada
  nombresPersona?: string;
  apellidoPaternoPersona?: string;
  apellidoMaternoPersona?: string;
  nroDocPersona?: string;
  emailPersonalPersona?: string;
  
  // Filtros de perfil relacionado
  nombrePerfil?: string;
}

// Las interfaces SortOptions y PaginationOptions ahora están en common.types.ts

// Estados de usuario
export enum UsuarioEstado {
  INACTIVO = 0,
  ACTIVO = 1,
  BLOQUEADO = 2,
  PENDIENTE = 3
}

// Tipos de usuario
export enum TipoUsuario {
  ADMINISTRADOR = 1,
  USUARIO_REGULAR = 2,
  SUPERVISOR = 3,
  OPERADOR = 4
}

// Tipos de estadísticas
export interface UsuarioEstadisticas {
  total: number;
  activos: number;
  inactivos: number;
  bloqueados: number;
  pendientes: number;
  expirados: number;
  proximosAExpirar: number;
  conPersona: number;
  sinPersona: number;
  conPerfil: number;
  sinPerfil: number;
  porTipoUsuario: { [key: string]: number };
  porPerfil: { [key: string]: number };
}