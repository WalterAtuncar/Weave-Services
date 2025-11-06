/**
 * Interfaces para el servicio de perfiles
 * Basado en el swagger API del backend
 */

// ===== ENTIDADES PRINCIPALES =====

// Perfil básico (entidad del dominio)
export interface Perfil {
  perfilId: number;
  nombrePerfil: string;
  descripcion?: string;
  registroEliminado?: boolean;
  estado?: number;
}

// Perfil DTO del backend con información completa
export interface PerfilDto {
  perfilId: number;
  nombrePerfil: string;
  descripcion: string | null;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string | null;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  version: number;
  nombreUsuarioCreador: string | null;
  nombreUsuarioActualizador: string | null;
  totalUsuarios: number;
  usuariosActivos: number;
  totalMenusAsignados: number;
  menusAsignados: MenuPerfilDto[] | null;
  usuarios: UsuarioDto[] | null;
  // Campos calculados
  estadoTexto: string | null;
  descripcionCorta: string | null;
  diasDesdeCreacion: number;
  diasDesdeActualizacion: number;
  esPerfilNuevo: boolean;
  requiereActualizacion: boolean;
  porcentajeUsoMenus: number;
}

// Menu Perfil DTO para relaciones
export interface MenuPerfilDto {
  menuPerfilId: number;
  menuId: number;
  perfilId: number;
  accesoId: number | null;
  tituloMenu: string | null;
  rutaMenu: string | null;
  iconoMenu: string | null;
  esTituloGrupo: boolean | null;
  nombrePerfil: string | null;
  descripcionPerfil: string | null;
  tipoAcceso: string | null;
  tipoAccesoCorto: string | null;
  menuCompleto: string | null;
  perfilCompleto: string | null;
}

// Usuario DTO básico para relaciones
export interface UsuarioDto {
  usuarioId: number;
  nombreUsuario: string;
  // Agregar más campos según necesidad
}

// ===== REQUESTS =====

// Request para obtener perfiles
export interface GetPerfilesRequest {
  includeDeleted?: boolean;
}

// Request para obtener perfil por ID
export interface GetPerfilByIdRequest {
  perfilId: number;
  includeDeleted?: boolean;
}

// Request para obtener perfil completo
export interface GetPerfilCompletoRequest {
  perfilId: number;
}

// Request para crear perfil
export interface CreatePerfilRequest {
  nombrePerfil: string;
  descripcion?: string;
}

// Request para actualizar perfil
export interface UpdatePerfilRequest {
  perfilId: number;
  nombrePerfil: string;
  descripcion?: string;
  estado: number;
}

// Request para eliminar perfil
export interface DeletePerfilRequest {
  perfilId: number;
}

// Request para buscar perfiles por nombre
export interface BuscarPerfilesPorNombreRequest {
  nombre: string;
}

// Request para obtener perfil por nombre
export interface GetPerfilPorNombreRequest {
  nombre: string;
}

// Request para perfiles paginados
export interface GetPerfilesPaginatedRequest {
  nombrePerfil?: string;
  descripcion?: string;
  estado?: number;
  tieneUsuarios?: boolean;
  tieneMenus?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  includeDeleted?: boolean;
  orderBy?: string;
  ascending?: boolean;
  page?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

// ===== RESPONSES =====

// Response para obtener perfiles
export type GetPerfilesResponseData = Perfil[];

// Response para obtener perfiles DTO
export type GetPerfilesDtoResponseData = PerfilDto[];

// Response para obtener perfil por ID
export type GetPerfilByIdResponseData = Perfil;

// Response para obtener perfil DTO por ID
export type GetPerfilDtoByIdResponseData = PerfilDto;

// Response para crear perfil
export type CreatePerfilResponseData = number; // ID del perfil creado

// Response para actualizar perfil
export type UpdatePerfilResponseData = boolean;

// Response para eliminar perfil
export type DeletePerfilResponseData = boolean;

// Response para buscar perfiles
export type BuscarPerfilesResponseData = PerfilDto[];

// Response para obtener perfil por nombre
export type GetPerfilPorNombreResponseData = PerfilDto;

// Response para estadísticas de perfiles
export type GetEstadisticasPerfilesResponseData = Record<string, number>;

// Response para perfiles paginados
export interface PerfilesPaginatedResponseData {
  data: PerfilDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Response para perfiles activos
export type GetPerfilesActivosResponseData = PerfilDto[];

// Response para perfiles sin menús
export type GetPerfilesSinMenusResponseData = PerfilDto[];

// Response para perfiles sin usuarios
export type GetPerfilesSinUsuariosResponseData = PerfilDto[];

// ===== TIPOS AUXILIARES =====

// Filtros para búsqueda de perfiles
export interface PerfilFilters {
  nombrePerfil?: string;
  descripcion?: string;
  estado?: number;
  tieneUsuarios?: boolean;
  tieneMenus?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  includeDeleted?: boolean;
}

// SortOptions y PaginationOptions movidos a common.types.ts para evitar duplicaciones

// Estados de perfil
export enum PerfilEstado {
  Inactivo = 0,
  Activo = 1
}

// Tipos de estadísticas
export interface PerfilEstadisticas {
  total: number;
  activos: number;
  inactivos: number;
  conUsuarios: number;
  sinUsuarios: number;
  conMenus: number;
  sinMenus: number;
} 