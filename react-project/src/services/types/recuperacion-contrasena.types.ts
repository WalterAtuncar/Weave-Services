/**
 * Interfaces para el servicio de Recuperación de Contraseña
 * Basado en el controlador RecuperacionContrasenaController
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES PRINCIPALES =====

export interface RecuperacionContrasena {
  recuperacionContrasenaId: number;
  email: string;
  codigo: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  fechaUso?: string;
  esValido: boolean;
  esExpirado: boolean;
  intentosRestantes: number;
  estado: number;
  version: number;
  creadoPor?: number;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
}

export interface RecuperacionContrasenaDto extends RecuperacionContrasena {
  // Campos calculados
  tiempoRestante?: number; // en minutos
  tiempoRestanteTexto?: string;
  estadoTexto?: string;
  esUrgente?: boolean; // si expira en menos de 30 minutos
}

// ===== COMMANDS =====

export interface SolicitarCodigoRecuperacionCommand {
  email: string;
}

export interface ValidarCodigoRecuperacionPorEmailCommand {
  email: string;
  codigo: string;
}

export interface CambiarContrasenaCommand {
  email: string;
  nuevaContrasena: string;
}

export interface CreateRecuperacionContrasenaCommand {
  email: string;
  codigo: string;
  fechaExpiracion: string;
  intentosRestantes?: number;
  estado?: number;
  creadoPor?: number;
}

export interface ValidarCodigoRecuperacionCommand {
  email: string;
  codigo: string;
}

// ===== REQUESTS =====

export interface GetRecuperacionesPaginatedRequest {
  // Paginación
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDescending?: boolean;
  
  // Filtros básicos
  includeDeleted?: boolean;
  estado?: number;
  
  // Filtros por datos
  email?: string;
  codigo?: string;
  
  // Filtros por fechas
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaExpiracionDesde?: string;
  fechaExpiracionHasta?: string;
  fechaUsoDesde?: string;
  fechaUsoHasta?: string;
  
  // Filtros por estado
  esValido?: boolean;
  esExpirado?: boolean;
  
  // Búsqueda general
  searchTerm?: string;
}

// ===== RESPONSES =====

export type SolicitarCodigoRecuperacionResponseData = any;
export type ValidarCodigoRecuperacionPorEmailResponseData = boolean;
export type CambiarContrasenaResponseData = boolean;
export type CreateRecuperacionContrasenaResponseData = number;
export type ValidarCodigoRecuperacionResponseData = any;
export type GetRecuperacionesPaginatedResponseData = any;

export interface HealthCheckResponseData {
  Status: string;
  Timestamp: string;
}

export interface TestEmailConnectionResponseData {
  ConnectionStatus: string;
  Message: string;
  Timestamp: string;
}

// ===== TIPOS AUXILIARES =====

export interface RecuperacionContrasenaFilters {
  email?: string;
  codigo?: string;
  estado?: number;
  esValido?: boolean;
  esExpirado?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaExpiracionDesde?: string;
  fechaExpiracionHasta?: string;
  fechaUsoDesde?: string;
  fechaUsoHasta?: string;
  includeDeleted?: boolean;
}

export interface RecuperacionContrasenaSortOptions {
  orderBy?: string;
  ascending?: boolean;
}

export interface RecuperacionContrasenaPaginationOptions {
  page?: number;
  pageSize?: number;
}

// ===== ENUMS =====

export enum EstadoRecuperacionContrasena {
  PENDIENTE = 1,
  USADO = 2,
  EXPIRADO = 3,
  INVALIDADO = 4,
  ELIMINADO = 5
}

export enum TipoRecuperacionContrasena {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  TOKEN = 'TOKEN'
}

// ===== TYPE ALIASES =====

export type SolicitarCodigoRecuperacionResponse = ApiResponse<SolicitarCodigoRecuperacionResponseData>;
export type ValidarCodigoRecuperacionPorEmailResponse = ApiResponse<ValidarCodigoRecuperacionPorEmailResponseData>;
export type CambiarContrasenaResponse = ApiResponse<CambiarContrasenaResponseData>;
export type CreateRecuperacionContrasenaResponse = ApiResponse<CreateRecuperacionContrasenaResponseData>;
export type ValidarCodigoRecuperacionResponse = ApiResponse<ValidarCodigoRecuperacionResponseData>;
export type GetRecuperacionesPaginatedResponse = ApiResponse<GetRecuperacionesPaginatedResponseData>;
export type HealthCheckResponse = ApiResponse<HealthCheckResponseData>;
export type TestEmailConnectionResponse = ApiResponse<TestEmailConnectionResponseData>; 