/**
 * Tipos para el servicio de Rol de Gobernanza
 * Actualizado según el modelo Domain.Entities.Governance.RolGobernanza
 */

import { ApiResponse } from './api.types';

// ===== ENTIDAD BASE =====

export interface RolGobernanza {
  rolGobernanzaId: number;
  rolGobernanzaCodigo: string;
  rolGobernanzaNombre: string;
  rolGobernanzaDescripcion?: string;
  nivel: number;
  color?: string;
  // Campos base de entidad
  version: number;
  estado: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
  // Propiedades calculadas
  estadoTexto?: string;
  nivelTexto?: string;
  colorHex?: string;
  puedeEliminar?: boolean;
  puedeEditar?: boolean;
  totalAsignaciones?: number;
  asignacionesActivas?: number;
  // Relaciones (solo cuando se incluyen en la respuesta)
  reglasGobernanza?: any[];
  gobernanzas?: any[];
  historialGobernanzas?: any[];
}

// ===== COMMANDS =====

export interface CreateRolGobernanzaCommand {
  rolGobernanzaCodigo: string;
  rolGobernanzaNombre: string;
  rolGobernanzaDescripcion?: string;
  nivel: number;
  color?: string;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateRolGobernanzaCommand {
  rolGobernanzaId: number;
  rolGobernanzaCodigo?: string;
  rolGobernanzaNombre?: string;
  rolGobernanzaDescripcion?: string;
  nivel?: number;
  color?: string;
  estado?: number;
  actualizadoPor?: number;
}

// ===== REQUESTS =====

export interface GetAllRolesGobernanzaRequest {
  includeDeleted?: boolean;
}

export interface GetRolGobernanzaByIdRequest {
  rolGobernanzaId: number;
  includeDeleted?: boolean;
}

export interface GetRolGobernanzaByCodigoRequest {
  codigo: string;
  includeDeleted?: boolean;
}

export interface GetRolesGobernanzaByNivelRequest {
  nivel: number;
  includeDeleted?: boolean;
}

export interface GetRolesGobernanzaActivosRequest {
  // Sin parámetros, solo roles activos
}

export interface DeleteRolGobernanzaRequest {
  rolGobernanzaId: number;
  forceDelete?: boolean;
  motivo?: string;
}

// ===== RESPONSES =====

export type GetAllRolesGobernanzaResponseData = RolGobernanza[];
export type GetRolGobernanzaByIdResponseData = RolGobernanza;
export type GetRolGobernanzaByCodigoResponseData = RolGobernanza;
export type GetRolesGobernanzaByNivelResponseData = RolGobernanza[];
export type CreateRolGobernanzaResponseData = RolGobernanza;
export type UpdateRolGobernanzaResponseData = RolGobernanza;
export type DeleteRolGobernanzaResponseData = boolean;
export type GetRolesGobernanzaActivosResponseData = RolGobernanza[];

// ===== FILTROS Y OPCIONES =====

export interface RolGobernanzaFilters {
  nivel?: number;
  estado?: number;
  color?: string;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  includeDeleted?: boolean;
}

export interface RolGobernanzaSortOptions {
  orderBy?: 'rolGobernanzaCodigo' | 'rolGobernanzaNombre' | 'nivel' | 'fechaCreacion' | 'fechaActualizacion';
  ascending?: boolean;
}

// ===== ENUMS =====

export enum EstadoRolGobernanza {
  Activo = 1,
  Inactivo = 2,
  Suspendido = 3,
  Eliminado = 4
}

export enum NivelRolGobernanza {
  Basico = 1,
  Intermedio = 2,
  Avanzado = 3,
  Experto = 4,
  Critico = 5
}

// ===== TIPOS DE RESPUESTA =====

export type GetRolGobernanzaResponse = ApiResponse<RolGobernanza>;
export type GetRolGobernanzaListResponse = ApiResponse<RolGobernanza[]>;
export type CreateRolGobernanzaResponse = ApiResponse<RolGobernanza>;
export type UpdateRolGobernanzaResponse = ApiResponse<RolGobernanza>;
export type DeleteRolGobernanzaResponse = ApiResponse<boolean>; 