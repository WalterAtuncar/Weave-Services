/**
 * Tipos para el servicio de Reglas de Gobernanza
 * Actualizado según el modelo Domain.Entities.Governance.ReglaGobernanza
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES BASE =====

export interface ReglaGobernanza {
  reglaGobernanzaId: number;
  rolGobernanzaId: number;
  maximoUsuarios: number;
  minimoUsuarios: number;
  esObligatorio: boolean;
  diasAlertaVencimiento?: number;
  configuracionJson?: string;
  // Información del rol de gobernanza (incluida en respuesta paginada)
  rolGobernanzaNombre?: string;
  rolGobernanzaDescripcion?: string;
  rolGobernanzaCodigo?: string;
  rolGobernanzaNivel?: number;
  rolGobernanzaColor?: string;
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
  permiteMultiplesUsuarios?: boolean;
  tieneAlertaVencimiento?: boolean;
  configuracionTexto?: string;
  tipoReglaTexto?: string;
  rangoUsuariosTexto?: string;
  descripcionCompleta?: string;
  configuracionResumen?: string;
  // Relaciones (solo cuando se incluyen en la respuesta)
  rolGobernanza?: any;
}

export interface ReglaGobernanzaCompleta extends ReglaGobernanza {
  rolGobernanza?: {
    rolGobernanzaId: number;
    rolGobernanzaCodigo: string;
    rolGobernanzaNombre: string;
    rolGobernanzaDescripcion?: string;
    nivel: number;
    color?: string;
  };
  historialEjecuciones?: any[];
  configuracionCompleta?: any;
}

// ===== COMMANDS =====

export interface CreateReglaGobernanzaCommand {
  rolGobernanzaId: number;
  maximoUsuarios: number;
  minimoUsuarios: number;
  esObligatorio?: boolean;
  diasAlertaVencimiento?: number;
  configuracionJson?: string;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateReglaGobernanzaCommand {
  reglaGobernanzaId: number;
  rolGobernanzaId?: number;
  maximoUsuarios?: number;
  minimoUsuarios?: number;
  esObligatorio?: boolean;
  diasAlertaVencimiento?: number;
  configuracionJson?: string;
  estado?: number;
  actualizadoPor?: number;
}

// ===== REQUESTS =====

export interface GetAllReglasGobernanzaRequest {
  includeDeleted?: boolean;
}

export interface GetReglaGobernanzaByIdRequest {
  reglaGobernanzaId: number;
  includeDeleted?: boolean;
}

export interface GetReglasByRolGobernanzaRequest {
  rolGobernanzaId: number;
  includeDeleted?: boolean;
}

export interface GetReglasGobernanzaPaginatedRequest {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDescending?: boolean;
  includeDeleted?: boolean;
  estado?: number;
  rolGobernanzaId?: number;
  esObligatorio?: boolean;
  tieneAlertaVencimiento?: boolean;
  minimoUsuarios?: number;
  maximoUsuarios?: number;
}

export interface DeleteReglaGobernanzaRequest {
  reglaGobernanzaId: number;
  forceDelete?: boolean;
  motivo?: string;
}

export interface ValidarReglaGobernanzaRequest {
  reglaGobernanzaId: number;
  entidadId: number;
  tipoEntidadId: number;
  usuariosAsignados: number[];
}

// ===== RESPONSES =====

export interface GetAllReglasGobernanzaResponseData {
  reglas: ReglaGobernanza[];
  total: number;
}

export interface GetReglaGobernanzaByIdResponseData {
  regla: ReglaGobernanza;
}

export interface GetReglaGobernanzaCompletaResponseData {
  regla: ReglaGobernanzaCompleta;
}

export interface CreateReglaGobernanzaResponseData {
  reglaGobernanza: ReglaGobernanza;
}

export interface UpdateReglaGobernanzaResponseData {
  reglaGobernanza: ReglaGobernanza;
}

export interface DeleteReglaGobernanzaResponseData {
  success: boolean;
  message: string;
}

export interface ReglasGobernanzaPaginatedResponseData {
  data: ReglaGobernanza[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ValidarReglaGobernanzaResponseData {
  esValida: boolean;
  errores: string[];
  advertencias: string[];
  detalles: {
    minimoRequerido: number;
    maximoPermitido: number;
    usuariosActuales: number;
    cumpleMinimo: boolean;
    cumpleMaximo: boolean;
    esObligatorio: boolean;
  };
}

export interface GetEstadisticasReglasGobernanzaResponseData {
  totalReglas: number;
  reglasActivas: number;
  reglasInactivas: number;
  reglasPorRol: Array<{
    rolGobernanzaId: number;
    rolNombre: string;
    totalReglas: number;
    reglasActivas: number;
  }>;
  reglas: {
    obligatorias: number;
    opcionales: number;
    conAlertaVencimiento: number;
    sinAlertaVencimiento: number;
  };
  rangosUsuarios: {
    promedioMinimo: number;
    promedioMaximo: number;
    rangoMenorMinimo: number;
    rangoMayorMaximo: number;
  };
}

// ===== TIPOS AUXILIARES =====

export interface ReglasGobernanzaFilters {
  rolGobernanzaId?: number;
  esObligatorio?: boolean;
  estado?: number;
  minimoUsuarios?: number;
  maximoUsuarios?: number;
  tieneAlertaVencimiento?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  includeDeleted?: boolean;
}

export interface ReglasGobernanzaSortOptions {
  field: 'reglaGobernanzaId' | 'rolGobernanzaId' | 'minimoUsuarios' | 'maximoUsuarios' | 'fechaCreacion' | 'fechaActualizacion';
  direction: 'asc' | 'desc';
}

export interface ReglasGobernanzaPaginationOptions {
  page: number;
  pageSize: number;
}

// ===== ENUMS =====

export enum EstadoReglaGobernanza {
  Activa = 1,
  Inactiva = 2,
  Suspendida = 3,
  Eliminada = 4
}

export enum TipoValidacionRegla {
  MinimosUsuarios = 'MINIMOS_USUARIOS',
  MaximosUsuarios = 'MAXIMOS_USUARIOS',
  ObligatoriedadRol = 'OBLIGATORIEDAD_ROL',
  AlertaVencimiento = 'ALERTA_VENCIMIENTO'
}

// ===== TIPOS RESPONSE =====

export type GetAllReglasGobernanzaResponse = ApiResponse<ReglaGobernanza[]>;
export type GetReglaGobernanzaByIdResponse = ApiResponse<ReglaGobernanza>;
export type GetReglaGobernanzaCompletaResponse = ApiResponse<ReglaGobernanzaCompleta>;
export type CreateReglaGobernanzaResponse = ApiResponse<ReglaGobernanza>;
export type UpdateReglaGobernanzaResponse = ApiResponse<ReglaGobernanza>;
export type DeleteReglaGobernanzaResponse = ApiResponse<boolean>;
export type ReglasGobernanzaPaginatedResponse = ApiResponse<ReglasGobernanzaPaginatedResponseData>;
export type ValidarReglaGobernanzaResponse = ApiResponse<ValidarReglaGobernanzaResponseData>;
export type GetEstadisticasReglasGobernanzaResponse = ApiResponse<GetEstadisticasReglasGobernanzaResponseData>; 