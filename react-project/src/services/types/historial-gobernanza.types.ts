/**
 * Tipos para el servicio de Historial de Gobernanza
 * Basado en el modelo Domain.Entities.Governance.HistorialGobernanza
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES BASE =====

export interface HistorialGobernanza {
  historialGobernanzaId: number;
  gobernanzaId: number;
  usuarioAnterior?: number;
  usuarioNuevo?: number;
  fechaInicio: string;
  fechaFin?: string;
  motivoTransferencia?: string;
  tipoMovimiento: string;
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
  tipoMovimientoTexto?: string;
  duracionEnDias?: number;
  esMovimientoActivo?: boolean;
  involucraTransferenciaUsuario?: boolean;
  // Referencias de navegación
  tipoGobiernoId?: number;
  tipoEntidadId?: number;
  entidadId?: number;
  rolGobernanzaId?: number;
  // Relaciones (solo cuando se incluyen en la respuesta)
  gobernanza?: any;
  usuarioAnteriorNavigation?: any;
  usuarioNuevoNavigation?: any;
}

export interface HistorialGobernanzaCompleta extends HistorialGobernanza {
  gobernanza?: {
    gobernanzaId: number;
    tipoGobiernoId: number;
    tipoEntidadId: number;
    entidadId: number;
    rolGobernanzaId: number;
    usuarioId: number;
    fechaAsignacion: string;
    fechaVencimiento?: string;
    observaciones?: string;
  };
  usuarioAnteriorNavigation?: {
    usuarioId: number;
    nombre: string;
    email: string;
  };
  usuarioNuevoNavigation?: {
    usuarioId: number;
    nombre: string;
    email: string;
  };
  entidad?: any;
  tipoEntidad?: any;
  rolGobernanza?: any;
  tipoGobierno?: any;
}

// ===== COMMANDS =====

export interface CreateHistorialGobernanzaCommand {
  gobernanzaId: number;
  usuarioAnterior?: number;
  usuarioNuevo?: number;
  fechaInicio: string;
  fechaFin?: string;
  motivoTransferencia?: string;
  tipoMovimiento: string;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateHistorialGobernanzaCommand {
  historialGobernanzaId: number;
  fechaFin?: string;
  motivoTransferencia?: string;
  estado?: number;
  actualizadoPor?: number;
}

// ===== REQUESTS =====

export interface GetAllHistorialGobernanzaRequest {
  includeDeleted?: boolean;
  gobernanzaId?: number;
  usuarioId?: number;
  tipoMovimiento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface GetHistorialGobernanzaByIdRequest {
  historialGobernanzaId: number;
  includeDeleted?: boolean;
}

export interface GetHistorialByGobernanzaRequest {
  gobernanzaId: number;
  includeDeleted?: boolean;
  tipoMovimiento?: string;
}

export interface GetHistorialByUsuarioRequest {
  usuarioId: number;
  includeDeleted?: boolean;
  soloMovimientosActivos?: boolean;
  tipoMovimiento?: string;
}

export interface GetHistorialPaginatedRequest {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDescending?: boolean;
  includeDeleted?: boolean;
  estado?: number;
  gobernanzaId?: number;
  usuarioAnterior?: number;
  usuarioNuevo?: number;
  tipoMovimiento?: string;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinDesde?: string;
  fechaFinHasta?: string;
  searchTerm?: string;
}

export interface DeleteHistorialGobernanzaRequest {
  historialGobernanzaId: number;
  forceDelete?: boolean;
  motivo?: string;
}

export interface GetHistorialResumenRequest {
  gobernanzaId?: number;
  usuarioId?: number;
  tipoEntidadId?: number;
  entidadId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

// ===== RESPONSES =====

export interface GetAllHistorialGobernanzaResponseData {
  historial: HistorialGobernanza[];
  total: number;
}

export interface GetHistorialGobernanzaByIdResponseData {
  historial: HistorialGobernanza;
}

export interface GetHistorialGobernanzaCompletaResponseData {
  historial: HistorialGobernanzaCompleta;
}

export interface CreateHistorialGobernanzaResponseData {
  historial: HistorialGobernanza;
}

export interface UpdateHistorialGobernanzaResponseData {
  historial: HistorialGobernanza;
}

export interface DeleteHistorialGobernanzaResponseData {
  success: boolean;
  message: string;
}

export interface HistorialGobernanzaPaginatedResponseData {
  data: HistorialGobernanza[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetHistorialResumenResponseData {
  totalMovimientos: number;
  movimientosPorTipo: Array<{
    tipoMovimiento: string;
    total: number;
    ultimoMovimiento: string;
  }>;
  usuariosInvolucrados: Array<{
    usuarioId: number;
    usuarioNombre: string;
    movimientosComoAnterior: number;
    movimientosComoNuevo: number;
  }>;
  periodoAnalizado: {
    fechaInicio: string;
    fechaFin: string;
    totalDias: number;
  };
  movimientosRecientes: HistorialGobernanza[];
}

export interface GetEstadisticasHistorialResponseData {
  totalMovimientos: number;
  movimientosActivos: number;
  movimientosFinalizados: number;
  movimientosPorTipo: Array<{
    tipoMovimiento: string;
    total: number;
    activos: number;
    finalizados: number;
  }>;
  movimientosPorMes: Array<{
    mes: string;
    total: number;
    asignaciones: number;
    transferencias: number;
    revocaciones: number;
  }>;
  duracionPromedio: {
    general: number;
    porTipoMovimiento: Array<{
      tipoMovimiento: string;
      duracionPromedioDias: number;
    }>;
  };
  usuariosMasActivos: Array<{
    usuarioId: number;
    usuarioNombre: string;
    totalMovimientos: number;
    ultimoMovimiento: string;
  }>;
}

// ===== TIPOS AUXILIARES =====

export interface HistorialGobernanzaFilters {
  gobernanzaId?: number;
  usuarioAnterior?: number;
  usuarioNuevo?: number;
  tipoMovimiento?: string;
  estado?: number;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinDesde?: string;
  fechaFinHasta?: string;
  soloMovimientosActivos?: boolean;
  includeDeleted?: boolean;
}

export interface HistorialGobernanzaSortOptions {
  field: 'historialGobernanzaId' | 'fechaInicio' | 'fechaFin' | 'tipoMovimiento' | 'fechaCreacion';
  direction: 'asc' | 'desc';
}

export interface HistorialGobernanzaPaginationOptions {
  page: number;
  pageSize: number;
}

// ===== ENUMS =====

export enum TipoMovimientoHistorial {
  Asignacion = 'ASIGNACION',
  Transferencia = 'TRANSFERENCIA',
  Revocacion = 'REVOCACION',
  Suspension = 'SUSPENSION',
  Reactivacion = 'REACTIVACION',
  Renovacion = 'RENOVACION',
  Modificacion = 'MODIFICACION'
}

export enum EstadoHistorialGobernanza {
  Activo = 1,
  Finalizado = 2,
  Cancelado = 3,
  Eliminado = 4
}

// ===== TIPOS RESPONSE =====

export type GetAllHistorialGobernanzaResponse = ApiResponse<HistorialGobernanza[]>;
export type GetHistorialGobernanzaByIdResponse = ApiResponse<HistorialGobernanza>;
export type GetHistorialGobernanzaCompletaResponse = ApiResponse<HistorialGobernanzaCompleta>;
export type CreateHistorialGobernanzaResponse = ApiResponse<HistorialGobernanza>;
export type UpdateHistorialGobernanzaResponse = ApiResponse<HistorialGobernanza>;
export type DeleteHistorialGobernanzaResponse = ApiResponse<boolean>;
export type HistorialGobernanzaPaginatedResponse = ApiResponse<HistorialGobernanzaPaginatedResponseData>;
export type GetHistorialResumenResponse = ApiResponse<GetHistorialResumenResponseData>;
export type GetEstadisticasHistorialResponse = ApiResponse<GetEstadisticasHistorialResponseData>;