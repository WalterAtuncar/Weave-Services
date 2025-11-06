/**
 * Tipos para el servicio de Workflow
 * Incluye ejecuciones de flujo, tareas y aprobaciones
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES BASE =====

export interface EjecucionFlujo {
  id: number;
  nombreFlujo: string;
  descripcion?: string;
  estado: EstadoEjecucion;
  fechaInicio: string;
  fechaFin?: string;
  usuarioInicioId: number;
  entidadRelacionadaId?: number;
  tipoEntidadRelacionada?: string;
  parametrosJson?: string;
  resultadoJson?: string;
  porcentajeCompletado: number;
  tareaActualId?: number;
  observaciones?: string;
  prioridad: PrioridadEjecucion;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  estado_registro: number;
}

export interface EjecucionFlujoCompleta extends EjecucionFlujo {
  usuarioInicio?: any;
  tareaActual?: TareaWorkflow;
  tareas?: TareaWorkflow[];
  aprobaciones?: AprobacionWorkflow[];
  historialEstados?: any[];
}

export interface TareaWorkflow {
  id: number;
  ejecucionFlujoId: number;
  nombreTarea: string;
  descripcion?: string;
  tipoAccionWorkflowId: number;
  estado: EstadoTarea;
  fechaInicio?: string;
  fechaFin?: string;
  usuarioAsignadoId?: number;
  usuarioEjecutorId?: number;
  parametrosJson?: string;
  resultadoJson?: string;
  orden: number;
  esObligatoria: boolean;
  tiempoLimiteHoras?: number;
  observaciones?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  estado_registro: number;
}

export interface AprobacionWorkflow {
  id: number;
  ejecucionFlujoId: number;
  usuarioAprobadorId: number;
  nivelAprobacion: number;
  estado: EstadoAprobacion;
  fechaSolicitud: string;
  fechaRespuesta?: string;
  observaciones?: string;
  documentosAdjuntos?: string;
  requiereJustificacion: boolean;
  justificacion?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  estado_registro: number;
}

// ===== ENUMS =====

export enum EstadoEjecucion {
  Pendiente = 0,
  EnProceso = 1,
  Completado = 2,
  Pausado = 3,
  Cancelado = 4,
  Error = 5
}

export enum PrioridadEjecucion {
  Baja = 0,
  Normal = 1,
  Alta = 2,
  Critica = 3
}

export enum EstadoTarea {
  Pendiente = 0,
  EnProceso = 1,
  Completada = 2,
  Omitida = 3,
  Error = 4
}

export enum EstadoAprobacion {
  Pendiente = 0,
  Aprobado = 1,
  Rechazado = 2,
  Delegado = 3
}

// ===== REQUESTS =====

// Ejecuciones de Flujo
export interface GetAllEjecucionesFlujoRequest {
  soloActivos?: boolean;
  estado?: EstadoEjecucion;
  usuarioInicioId?: number;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  prioridad?: PrioridadEjecucion;
}

export interface GetEjecucionFlujoByIdRequest {
  ejecucionFlujoId: number;
}

export interface GetEjecucionFlujoCompletaRequest {
  ejecucionFlujoId: number;
}

export interface GetEjecucionesFlujosPaginatedRequest {
  nombreFlujo?: string;
  estado?: EstadoEjecucion;
  usuarioInicioId?: number;
  entidadRelacionadaId?: number;
  tipoEntidadRelacionada?: string;
  prioridad?: PrioridadEjecucion;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinDesde?: string;
  fechaFinHasta?: string;
  soloActivos?: boolean;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
}

export interface IniciarEjecucionFlujoRequest {
  nombreFlujo: string;
  descripcion?: string;
  usuarioInicioId: number;
  entidadRelacionadaId?: number;
  tipoEntidadRelacionada?: string;
  parametrosJson?: string;
  prioridad?: PrioridadEjecucion;
  observaciones?: string;
}

export interface UpdateEjecucionFlujoRequest {
  ejecucionFlujoId: number;
  nombreFlujo?: string;
  descripcion?: string;
  estado?: EstadoEjecucion;
  entidadRelacionadaId?: number;
  tipoEntidadRelacionada?: string;
  parametrosJson?: string;
  resultadoJson?: string;
  porcentajeCompletado?: number;
  observaciones?: string;
  prioridad?: PrioridadEjecucion;
}

export interface FinalizarEjecucionFlujoRequest {
  ejecucionFlujoId: number;
  resultadoJson?: string;
  observaciones?: string;
}

// Tareas
export interface GetTareasByEjecucionRequest {
  ejecucionFlujoId: number;
}

export interface CreateTareaWorkflowRequest {
  ejecucionFlujoId: number;
  nombreTarea: string;
  descripcion?: string;
  tipoAccionWorkflowId: number;
  usuarioAsignadoId?: number;
  parametrosJson?: string;
  orden: number;
  esObligatoria?: boolean;
  tiempoLimiteHoras?: number;
  observaciones?: string;
}

export interface CompletarTareaRequest {
  tareaId: number;
  usuarioEjecutorId: number;
  resultadoJson?: string;
  observaciones?: string;
}

// Aprobaciones
export interface GetAprobacionesByEjecucionRequest {
  ejecucionFlujoId: number;
}

export interface CreateAprobacionWorkflowRequest {
  ejecucionFlujoId: number;
  usuarioAprobadorId: number;
  nivelAprobacion: number;
  requiereJustificacion?: boolean;
  observaciones?: string;
}

export interface ResponderAprobacionRequest {
  aprobacionId: number;
  estado: EstadoAprobacion;
  observaciones?: string;
  justificacion?: string;
  documentosAdjuntos?: string;
}

// ===== RESPONSES =====

// Ejecuciones de Flujo
export type GetAllEjecucionesFlujoResponseData = EjecucionFlujo[];
export type GetEjecucionFlujoByIdResponseData = EjecucionFlujo;
export type GetEjecucionFlujoCompletaResponseData = EjecucionFlujoCompleta;
export type IniciarEjecucionFlujoResponseData = EjecucionFlujo;
export type UpdateEjecucionFlujoResponseData = EjecucionFlujo;
export type FinalizarEjecucionFlujoResponseData = EjecucionFlujo;

// Paginación
export interface EjecucionesFlujosPaginatedResponseData {
  data: EjecucionFlujo[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Tareas
export type GetTareasByEjecucionResponseData = TareaWorkflow[];
export type CreateTareaWorkflowResponseData = TareaWorkflow;
export type CompletarTareaResponseData = TareaWorkflow;

// Aprobaciones
export type GetAprobacionesByEjecucionResponseData = AprobacionWorkflow[];
export type CreateAprobacionWorkflowResponseData = AprobacionWorkflow;
export type ResponderAprobacionResponseData = AprobacionWorkflow;

// ===== FILTROS Y OPCIONES =====

export interface WorkflowFilters {
  estado?: EstadoEjecucion;
  usuarioInicioId?: number;
  prioridad?: PrioridadEjecucion;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  soloActivos?: boolean;
}

export interface WorkflowSortOptions {
  orderBy?: 'fechaInicio' | 'fechaFin' | 'nombreFlujo' | 'prioridad' | 'estado' | 'porcentajeCompletado';
  ascending?: boolean;
}

export interface WorkflowPaginationOptions {
  page?: number;
  pageSize?: number;
}

// ===== ESTADÍSTICAS =====

export interface EstadisticasWorkflow {
  totalEjecuciones: number;
  ejecutandose: number;
  completadas: number;
  pausadas: number;
  canceladas: number;
  conError: number;
  promedioTiempoCompletado?: number;
  ejecutoresMasActivos: Array<{
    usuarioId: number;
    nombreUsuario: string;
    totalEjecuciones: number;
  }>;
  flujosMasUtilizados: Array<{
    nombreFlujo: string;
    totalEjecuciones: number;
  }>;
}

export type GetEstadisticasWorkflowResponseData = EstadisticasWorkflow; 