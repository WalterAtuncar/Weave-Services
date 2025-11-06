/**
 * Tipos para el servicio de Tipo de Gobierno
 * Actualizado según el modelo Domain.Entities.Governance.TipoGobierno
 */

import { ApiResponse } from './api.types';

// ===== ENTIDAD BASE =====

export interface TipoGobierno {
  tipoGobiernoId: number;
  tipoGobiernoCodigo: string;
  tipoGobiernoNombre: string;
  tipoGobiernoDescripcion?: string;
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

export interface CreateTipoGobiernoCommand {
  tipoGobiernoCodigo: string;
  tipoGobiernoNombre: string;
  tipoGobiernoDescripcion?: string;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateTipoGobiernoCommand {
  tipoGobiernoId: number;
  tipoGobiernoCodigo?: string;
  tipoGobiernoNombre?: string;
  tipoGobiernoDescripcion?: string;
  estado?: number;
  actualizadoPor?: number;
}

// ===== REQUESTS =====

export interface GetAllTiposGobiernoRequest {
  includeDeleted?: boolean;
}

export interface GetTipoGobiernoByIdRequest {
  tipoGobiernoId: number;
  includeDeleted?: boolean;
}

export interface GetTipoGobiernoByCodigoRequest {
  codigo: string;
  includeDeleted?: boolean;
}

export interface GetTiposGobiernoActivosRequest {
  // Sin parámetros, solo tipos activos
}

export interface DeleteTipoGobiernoRequest {
  tipoGobiernoId: number;
  forceDelete?: boolean;
  motivo?: string;
}

// ===== RESPONSES =====

export type GetAllTiposGobiernoResponseData = TipoGobierno[];
export type GetTipoGobiernoByIdResponseData = TipoGobierno;
export type GetTipoGobiernoByCodigoResponseData = TipoGobierno;
export type CreateTipoGobiernoResponseData = TipoGobierno;
export type UpdateTipoGobiernoResponseData = TipoGobierno;
export type DeleteTipoGobiernoResponseData = boolean;
export type GetTiposGobiernoActivosResponseData = TipoGobierno[];

// ===== FILTROS Y OPCIONES =====

export interface TipoGobiernoFilters {
  codigo?: string;
  nombre?: string;
  estado?: number;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  includeDeleted?: boolean;
}

export interface TipoGobiernoSortOptions {
  orderBy?: 'tipoGobiernoCodigo' | 'tipoGobiernoNombre' | 'fechaCreacion' | 'fechaActualizacion';
  ascending?: boolean;
}

// ===== ENUMS =====

export enum EstadoTipoGobierno {
  Activo = 1,
  Inactivo = 2,
  Suspendido = 3,
  Eliminado = 4
}

export enum TipoGobiernoCodigos {
  Operativo = 'OPERATIVO',
  Estrategico = 'ESTRATEGICO',
  Normativo = 'NORMATIVO',
  Supervision = 'SUPERVISION',
  Control = 'CONTROL',
  Auditoria = 'AUDITORIA'
}

// ===== TIPOS DE RESPUESTA =====

export type GetTipoGobiernoResponse = ApiResponse<TipoGobierno>;
export type GetTipoGobiernoListResponse = ApiResponse<TipoGobierno[]>;
export type CreateTipoGobiernoResponse = ApiResponse<TipoGobierno>;
export type UpdateTipoGobiernoResponse = ApiResponse<TipoGobierno>;
export type DeleteTipoGobiernoResponse = ApiResponse<boolean>; 