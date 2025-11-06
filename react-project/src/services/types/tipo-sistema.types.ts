/**
 * Tipos para el servicio de Tipo de Sistema
 * Controller CRUD básico con endpoints adicionales
 */

import { ApiResponse } from './api.types';

// ===== ENTIDAD BASE =====

export interface TipoSistema {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  estado_registro: number;
}

// ===== REQUESTS =====

export interface GetAllTiposSistemaRequest {
  includeDeleted?: boolean;
}

export interface GetTipoSistemaByIdRequest {
  tipoSistemaId: number;
}

export interface GetTipoSistemaByCodigoRequest {
  codigo: string;
}

export interface CreateTipoSistemaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado?: number;
}

export interface UpdateTipoSistemaRequest {
  tipoSistemaId: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  estado?: number;
}

export interface DeleteTipoSistemaRequest {
  tipoSistemaId: number;
  forceDelete?: boolean;
  motivo?: string;
}

// ===== RESPONSES =====

export type GetAllTiposSistemaResponseData = TipoSistema[];
export type GetTipoSistemaByIdResponseData = TipoSistema;
export type GetTipoSistemaByCodigoResponseData = TipoSistema;
export type CreateTipoSistemaResponseData = TipoSistema;
export type UpdateTipoSistemaResponseData = TipoSistema;
export type DeleteTipoSistemaResponseData = boolean;

// Tipo para tipos de sistema activos (formato simplificado para dropdowns)
export interface TipoSistemaOption {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export type GetTiposSistemaActivosResponseData = TipoSistemaOption[];

// ===== FILTROS Y OPCIONES =====

export interface TipoSistemaFilters {
  estado?: number;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
}

export interface TipoSistemaSortOptions {
  orderBy?: 'codigo' | 'nombre' | 'fechaCreacion' | 'fechaActualizacion';
  ascending?: boolean;
} 