/**
 * Tipos para el servicio de Familia de Sistema
 * Controller CRUD básico
 */

import { ApiResponse } from './api.types';

// ===== ENTIDAD BASE =====

export interface FamiliaSistema {
  FamiliaSistemaId: number; // Cambio: usar la misma propiedad que el backend
  id?: number; // Mantener compatibilidad temporal
  FamiliaSistemaCodigo: string; // Cambio: usar la misma propiedad que el backend
  codigo?: string; // Mantener compatibilidad temporal
  FamiliaSistemaNombre: string; // Cambio: usar la misma propiedad que el backend
  nombre?: string; // Mantener compatibilidad temporal
  FamiliaSistemaDescripcion?: string; // Cambio: usar la misma propiedad que el backend
  descripcion?: string; // Mantener compatibilidad temporal
  Estado: number; // Cambio: usar la misma propiedad que el backend
  estado?: number; // Mantener compatibilidad temporal
  FechaCreacion: string; // Cambio: usar la misma propiedad que el backend
  fechaCreacion?: string; // Mantener compatibilidad temporal
  FechaActualizacion: string; // Cambio: usar la misma propiedad que el backend
  fechaActualizacion?: string; // Mantener compatibilidad temporal
  CreadoPor: number; // Cambio: usar la misma propiedad que el backend
  creadoPor?: number; // Mantener compatibilidad temporal
  ActualizadoPor: number; // Cambio: usar la misma propiedad que el backend
  actualizadoPor?: number; // Mantener compatibilidad temporal
  EstadoRegistro: number; // Cambio: usar la misma propiedad que el backend
  estado_registro?: number; // Mantener compatibilidad temporal
}

// ===== REQUESTS =====

export interface GetAllFamiliasSistemaRequest {
  includeDeleted?: boolean;
}

export interface GetFamiliaSistemaByIdRequest {
  familiaSistemaId: number;
}

export interface CreateFamiliaSistemaRequest {
  FamiliaSistemaCodigo: string;
  FamiliaSistemaNombre: string;
  FamiliaSistemaDescripcion?: string;
  CreadoPor: number;
}

export interface UpdateFamiliaSistemaRequest {
  familiaSistemaId: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  estado?: number;
}

export interface DeleteFamiliaSistemaRequest {
  familiaSistemaId: number;
  forceDelete?: boolean;
  motivo?: string;
}

// ===== RESPONSES =====

export type GetAllFamiliasSistemaResponseData = FamiliaSistema[];
export type GetFamiliaSistemaByIdResponseData = FamiliaSistema;
export type CreateFamiliaSistemaResponseData = FamiliaSistema;
export type UpdateFamiliaSistemaResponseData = FamiliaSistema;
export type DeleteFamiliaSistemaResponseData = boolean;

// Tipo para familias activas (formato simplificado para dropdowns)
export interface FamiliaSistemaOption {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export type GetFamiliasSistemaActivasResponseData = FamiliaSistemaOption[];

// ===== FILTROS Y OPCIONES =====

export interface FamiliaSistemaFilters {
  estado?: number;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
}

export interface FamiliaSistemaSortOptions {
  orderBy?: 'codigo' | 'nombre' | 'fechaCreacion' | 'fechaActualizacion';
  ascending?: boolean;
}