/**
 * Tipos para el servicio de Tipo de Entidad
 * Actualizado según el modelo Domain.Entities.Governance.TipoEntidad
 */

import { ApiResponse } from './api.types';

// ===== ENTIDAD BASE =====

export interface TipoEntidad {
  tipoEntidadId: number;
  tipoEntidadCodigo: string;
  tipoEntidadNombre: string;
  tipoEntidadDescripcion?: string;
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
  // Relaciones (solo cuando se incluyen en la respuesta)
  gobernanzas?: any[];
  historialGobernanzas?: any[];
}

// ===== COMMANDS =====

export interface CreateTipoEntidadCommand {
  tipoEntidadCodigo: string;
  tipoEntidadNombre: string;
  tipoEntidadDescripcion?: string;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateTipoEntidadCommand {
  tipoEntidadId: number;
  tipoEntidadCodigo?: string;
  tipoEntidadNombre?: string;
  tipoEntidadDescripcion?: string;
  estado?: number;
  actualizadoPor?: number;
}

// ===== REQUESTS =====

export interface GetAllTiposEntidadRequest {
  includeDeleted?: boolean;
}

export interface GetTipoEntidadByIdRequest {
  tipoEntidadId: number;
  includeDeleted?: boolean;
}

export interface GetTipoEntidadByCodigoRequest {
  codigo: string;
  includeDeleted?: boolean;
}

export interface GetTiposEntidadActivosRequest {
  // Sin parámetros, solo tipos activos
}

export interface DeleteTipoEntidadRequest {
  tipoEntidadId: number;
  forceDelete?: boolean;
  motivo?: string;
}

// ===== RESPONSES =====

export type GetAllTiposEntidadResponseData = TipoEntidad[];
export type GetTipoEntidadByIdResponseData = TipoEntidad;
export type GetTipoEntidadByCodigoResponseData = TipoEntidad;
export type CreateTipoEntidadResponseData = TipoEntidad;
export type UpdateTipoEntidadResponseData = TipoEntidad;
export type DeleteTipoEntidadResponseData = boolean;
export type GetTiposEntidadActivosResponseData = TipoEntidad[];

// ===== FILTROS Y OPCIONES =====

export interface TipoEntidadFilters {
  codigo?: string;
  nombre?: string;
  estado?: number;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  includeDeleted?: boolean;
}

export interface TipoEntidadSortOptions {
  orderBy?: 'tipoEntidadCodigo' | 'tipoEntidadNombre' | 'fechaCreacion' | 'fechaActualizacion';
  ascending?: boolean;
}

// ===== ENUMS =====

export enum EstadoTipoEntidad {
  Activo = 1,
  Inactivo = 2,
  Suspendido = 3,
  Eliminado = 4
}

export enum TipoEntidadCodigos {
  Sistema = 'SISTEMA',
  Proceso = 'PROCESO',
  Documento = 'DOCUMENTO',
  Usuario = 'USUARIO',
  Organizacion = 'ORGANIZACION',
  Posicion = 'POSICION',
  UnidadOrganizacional = 'UNIDAD_ORG'
}

// ===== TIPOS DE RESPUESTA =====

export type GetTipoEntidadResponse = ApiResponse<TipoEntidad>;
export type GetTipoEntidadListResponse = ApiResponse<TipoEntidad[]>;
export type CreateTipoEntidadResponse = ApiResponse<TipoEntidad>;
export type UpdateTipoEntidadResponse = ApiResponse<TipoEntidad>;
export type DeleteTipoEntidadResponse = ApiResponse<boolean>; 