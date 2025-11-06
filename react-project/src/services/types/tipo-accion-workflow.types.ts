/**
 * Tipos para el servicio de Tipo de Acción Workflow
 * Controller CRUD básico con endpoints adicionales
 */

import { ApiResponse } from './api.types';

// ===== ENTIDAD BASE =====

export interface TipoAccionWorkflow {
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

export interface GetAllTiposAccionWorkflowRequest {
  includeDeleted?: boolean;
}

export interface GetTipoAccionWorkflowByIdRequest {
  tipoAccionWorkflowId: number;
}

export interface GetTipoAccionWorkflowByCodigoRequest {
  codigo: string;
}

export interface CreateTipoAccionWorkflowRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado?: number;
}

export interface UpdateTipoAccionWorkflowRequest {
  tipoAccionWorkflowId: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  estado?: number;
}

export interface DeleteTipoAccionWorkflowRequest {
  tipoAccionWorkflowId: number;
  forceDelete?: boolean;
  motivo?: string;
}

// ===== RESPONSES =====

export type GetAllTiposAccionWorkflowResponseData = TipoAccionWorkflow[];
export type GetTipoAccionWorkflowByIdResponseData = TipoAccionWorkflow;
export type GetTipoAccionWorkflowByCodigoResponseData = TipoAccionWorkflow;
export type CreateTipoAccionWorkflowResponseData = TipoAccionWorkflow;
export type UpdateTipoAccionWorkflowResponseData = TipoAccionWorkflow;
export type DeleteTipoAccionWorkflowResponseData = boolean;
export type GetTiposAccionWorkflowActivosResponseData = TipoAccionWorkflow[];

// ===== FILTROS Y OPCIONES =====

export interface TipoAccionWorkflowFilters {
  estado?: number;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
}

export interface TipoAccionWorkflowSortOptions {
  orderBy?: 'codigo' | 'nombre' | 'fechaCreacion' | 'fechaActualizacion';
  ascending?: boolean;
} 