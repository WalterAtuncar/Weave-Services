/**
 * Tipos para el servicio de Notificación de Gobernanza
 * Actualizado según el modelo Domain.Entities.Governance.NotificacionGobernanza
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES BASE =====

export interface NotificacionGobernanza {
  notificacionGobernanzaId: number;
  gobernanzaId: number;
  tipoNotificacion: string;
  titulo: string;
  mensaje: string;
  fechaEnvio: string;
  leida: boolean;
  fechaLectura?: string;
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
  tipoNotificacionTexto?: string;
  estadoLecturaTexto?: string;
  diasDesdeEnvio?: number;
  esReciente?: boolean;
  prioridadTexto?: string;
  // Relaciones (solo cuando se incluyen en la respuesta)
  gobernanza?: any;
}

export interface NotificacionGobernanzaCompleta extends NotificacionGobernanza {
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
  usuario?: any;
  entidad?: any;
  tipoEntidad?: any;
  rolGobernanza?: any;
}

// ===== COMMANDS =====

export interface CreateNotificacionGobernanzaCommand {
  gobernanzaId: number;
  tipoNotificacion: string;
  titulo: string;
  mensaje: string;
  fechaEnvio?: string;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateNotificacionGobernanzaCommand {
  notificacionGobernanzaId: number;
  titulo?: string;
  mensaje?: string;
  leida?: boolean;
  fechaLectura?: string;
  estado?: number;
  actualizadoPor?: number;
}

export interface MarcarComoLeidaCommand {
  notificacionGobernanzaId: number;
  fechaLectura?: string;
  actualizadoPor?: number;
}

// ===== REQUESTS =====

export interface GetAllNotificacionesGobernanzaRequest {
  includeDeleted?: boolean;
  soloNoLeidas?: boolean;
  tipoNotificacion?: string;
  gobernanzaId?: number;
  usuarioId?: number;
  fechaEnvioDesde?: string;
  fechaEnvioHasta?: string;
}

export interface GetNotificacionGobernanzaByIdRequest {
  notificacionGobernanzaId: number;
  includeDeleted?: boolean;
}

export interface GetNotificacionesByGobernanzaRequest {
  gobernanzaId: number;
  includeDeleted?: boolean;
  soloNoLeidas?: boolean;
}

export interface GetNotificacionesByUsuarioRequest {
  usuarioId: number;
  includeDeleted?: boolean;
  soloNoLeidas?: boolean;
  tipoNotificacion?: string;
}

export interface GetNotificacionesPaginatedRequest {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDescending?: boolean;
  includeDeleted?: boolean;
  estado?: number;
  gobernanzaId?: number;
  usuarioId?: number;
  tipoNotificacion?: string;
  soloNoLeidas?: boolean;
  fechaEnvioDesde?: string;
  fechaEnvioHasta?: string;
  searchTerm?: string;
}

export interface DeleteNotificacionGobernanzaRequest {
  notificacionGobernanzaId: number;
  forceDelete?: boolean;
  motivo?: string;
}

export interface MarcarVariasComoLeidasRequest {
  notificacionIds: number[];
  fechaLectura?: string;
  actualizadoPor?: number;
}

export interface GenerarNotificacionesVencimientoRequest {
  diasAntelacion?: number;
  tipoGobiernoId?: number;
  tipoEntidadId?: number;
  rolGobernanzaId?: number;
  soloObligatorios?: boolean;
}

// ===== RESPONSES =====

export interface GetAllNotificacionesGobernanzaResponseData {
  notificaciones: NotificacionGobernanza[];
  total: number;
}

export interface GetNotificacionGobernanzaByIdResponseData {
  notificacion: NotificacionGobernanza;
}

export interface GetNotificacionGobernanzaCompletaResponseData {
  notificacion: NotificacionGobernanzaCompleta;
}

export interface CreateNotificacionGobernanzaResponseData {
  notificacion: NotificacionGobernanza;
}

export interface UpdateNotificacionGobernanzaResponseData {
  notificacion: NotificacionGobernanza;
}

export interface DeleteNotificacionGobernanzaResponseData {
  success: boolean;
  message: string;
}

export interface NotificacionesGobernanzaPaginatedResponseData {
  data: NotificacionGobernanza[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MarcarComoLeidaResponseData {
  notificacion: NotificacionGobernanza;
  fechaLectura: string;
}

export interface MarcarVariasComoLeidasResponseData {
  notificacionesActualizadas: number;
  notificacionesIds: number[];
  fechaLectura: string;
}

export interface GenerarNotificacionesVencimientoResponseData {
  notificacionesGeneradas: number;
  gobernanzasAfectadas: number[];
  proximasVencer: Array<{
    gobernanzaId: number;
    usuarioId: number;
    entidadId: number;
    fechaVencimiento: string;
    diasRestantes: number;
  }>;
}

export interface GetEstadisticasNotificacionesResponseData {
  totalNotificaciones: number;
  notificacionesNoLeidas: number;
  notificacionesLeidas: number;
  notificacionesPorTipo: Array<{
    tipoNotificacion: string;
    total: number;
    noLeidas: number;
  }>;
  notificacionesRecientes: Array<{
    fecha: string;
    total: number;
    noLeidas: number;
  }>;
  usuariosConMasNotificaciones: Array<{
    usuarioId: number;
    usuarioNombre: string;
    totalNotificaciones: number;
    noLeidas: number;
  }>;
}

// ===== TIPOS AUXILIARES =====

export interface NotificacionesGobernanzaFilters {
  gobernanzaId?: number;
  usuarioId?: number;
  tipoNotificacion?: string;
  leida?: boolean;
  estado?: number;
  fechaEnvioDesde?: string;
  fechaEnvioHasta?: string;
  includeDeleted?: boolean;
}

export interface NotificacionesGobernanzaSortOptions {
  field: 'notificacionGobernanzaId' | 'fechaEnvio' | 'fechaLectura' | 'tipoNotificacion' | 'fechaCreacion';
  direction: 'asc' | 'desc';
}

export interface NotificacionesGobernanzaPaginationOptions {
  page: number;
  pageSize: number;
}

// ===== ENUMS =====

export enum TipoNotificacionGobernanza {
  AsignacionNueva = 'ASIGNACION_NUEVA',
  ProximaAVencer = 'PROXIMA_A_VENCER',
  Vencida = 'VENCIDA',
  Transferida = 'TRANSFERIDA',
  Revocada = 'REVOCADA',
  Renovada = 'RENOVADA',
  RecordatorioGeneral = 'RECORDATORIO_GENERAL',
  AlertaCritica = 'ALERTA_CRITICA'
}

export enum EstadoNotificacionGobernanza {
  Activa = 1,
  Inactiva = 2,
  Archivada = 3,
  Eliminada = 4
}

export enum PrioridadNotificacion {
  Baja = 'BAJA',
  Normal = 'NORMAL',
  Alta = 'ALTA',
  Critica = 'CRITICA'
}

// ===== TIPOS RESPONSE =====

export type GetAllNotificacionesGobernanzaResponse = ApiResponse<NotificacionGobernanza[]>;
export type GetNotificacionGobernanzaByIdResponse = ApiResponse<NotificacionGobernanza>;
export type GetNotificacionGobernanzaCompletaResponse = ApiResponse<NotificacionGobernanzaCompleta>;
export type CreateNotificacionGobernanzaResponse = ApiResponse<NotificacionGobernanza>;
export type UpdateNotificacionGobernanzaResponse = ApiResponse<NotificacionGobernanza>;
export type DeleteNotificacionGobernanzaResponse = ApiResponse<boolean>;
export type NotificacionesGobernanzaPaginatedResponse = ApiResponse<NotificacionesGobernanzaPaginatedResponseData>;
export type MarcarComoLeidaResponse = ApiResponse<MarcarComoLeidaResponseData>;
export type MarcarVariasComoLeidasResponse = ApiResponse<MarcarVariasComoLeidasResponseData>;
export type GenerarNotificacionesVencimientoResponse = ApiResponse<GenerarNotificacionesVencimientoResponseData>;
export type GetEstadisticasNotificacionesResponse = ApiResponse<GetEstadisticasNotificacionesResponseData>; 