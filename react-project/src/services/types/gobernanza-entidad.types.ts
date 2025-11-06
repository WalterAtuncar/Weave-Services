/**
 * Tipos para el servicio de GobernanzaEntidad
 * Maneja las asociaciones entre gobernanzas y entidades específicas
 */

import { BaseEntity } from './api.types';

// ==========================================
// ENTIDAD PRINCIPAL
// ==========================================

export interface GobernanzaEntidad extends BaseEntity {
  gobernanzaEntidadId: number;
  gobernanzaId: number;
  entidadId: number;
  fechaAsociacion: string;
  fechaDesasociacion?: string;
  observaciones?: string;
  esActiva: boolean;
}

// ==========================================
// COMMANDS PARA OPERACIONES CRUD
// ==========================================

export interface CreateGobernanzaEntidadCommand {
  gobernanzaId: number;
  entidadId: number;
  fechaAsociacion: string;
  observaciones?: string;
  esActiva: boolean;
}

export interface UpdateGobernanzaEntidadCommand {
  gobernanzaEntidadId: number;
  gobernanzaId: number;
  entidadId: number;
  fechaAsociacion: string;
  fechaDesasociacion?: string;
  observaciones?: string;
  esActiva: boolean;
}

export interface DesactivarAsociacionCommand {
  gobernanzaId: number;
  entidadId: number;
  fechaDesasociacion: string;
  observaciones?: string;
}

export interface ActivarAsociacionCommand {
  gobernanzaId: number;
  entidadId: number;
  fechaAsociacion: string;
  observaciones?: string;
}

// ==========================================
// QUERIES Y FILTROS
// ==========================================

export interface GobernanzaEntidadFilters {
  gobernanzaId?: number;
  entidadId?: number;
  soloActivas?: boolean;
  fechaAsociacionDesde?: string;
  fechaAsociacionHasta?: string;
  fechaDesasociacionDesde?: string;
  fechaDesasociacionHasta?: string;
  includeDeleted?: boolean;
}

export interface ExisteAsociacionActivaQuery {
  gobernanzaId: number;
  entidadId: number;
  fechaReferencia?: string;
}

// ==========================================
// DTOS ENRIQUECIDOS
// ==========================================

export interface GobernanzaEntidadEnrichedDto extends GobernanzaEntidad {
  // Información de la gobernanza
  gobernanzaNombre?: string;
  gobernanzaCodigo?: string;
  tipoGobiernoNombre?: string;
  tipoEntidadNombre?: string;
  
  // Información de la entidad (genérica)
  entidadNombre?: string;
  entidadCodigo?: string;
  entidadTipo?: string;
  
  // Información específica para sistemas
  sistemaNombre?: string;
  sistemaCodigo?: string;
  sistemaEstado?: number;
  sistemaFamilia?: string;
  
  // Metadatos de la asociación
  diasAsociacion?: number;
  estaVencida?: boolean;
  requiereAtencion?: boolean;
}

// ==========================================
// RESPONSES DE API
// ==========================================

export interface CreateGobernanzaEntidadResponse {
  gobernanzaEntidadId: number;
  success: boolean;
  message: string;
}

export interface UpdateGobernanzaEntidadResponse {
  success: boolean;
  message: string;
}

export interface DeleteGobernanzaEntidadResponse {
  success: boolean;
  message: string;
}

export interface GetGobernanzaEntidadResponse {
  data: GobernanzaEntidad;
  success: boolean;
  message: string;
}

export interface GetGobernanzaEntidadListResponse {
  data: GobernanzaEntidad[];
  success: boolean;
  message: string;
  totalCount?: number;
}

export interface GetGobernanzaEntidadEnrichedListResponse {
  data: GobernanzaEntidadEnrichedDto[];
  success: boolean;
  message: string;
  totalCount?: number;
}

// ==========================================
// TIPOS DE UTILIDAD
// ==========================================

export interface AsociacionSistemaGobernanza {
  sistemaId: number;
  sistemaNombre: string;
  sistemaCodigo: string;
  gobernanzaId: number;
  gobernanzaNombre: string;
  fechaAsociacion: string;
  esActiva: boolean;
  observaciones?: string;
}

export interface ResumenAsociaciones {
  totalAsociaciones: number;
  asociacionesActivas: number;
  asociacionesInactivas: number;
  sistemasSinGobernanza: number;
  gobernanzasSinSistemas: number;
  ultimaActualizacion: string;
}

// ==========================================
// ENUMS Y CONSTANTES
// ==========================================

export enum EstadoAsociacion {
  ACTIVA = 1,
  INACTIVA = 0
}

export const ESTADO_ASOCIACION_LABELS = {
  [EstadoAsociacion.ACTIVA]: 'Activa',
  [EstadoAsociacion.INACTIVA]: 'Inactiva'
} as const;

export enum TipoEntidadAsociacion {
  SISTEMA = 1,
  PROCESO = 2,
  DATA = 3,
  APLICACION = 4
}

export const TIPO_ENTIDAD_ASOCIACION_LABELS = {
  [TipoEntidadAsociacion.SISTEMA]: 'Sistema',
  [TipoEntidadAsociacion.PROCESO]: 'Proceso',
  [TipoEntidadAsociacion.DATA]: 'Data',
  [TipoEntidadAsociacion.APLICACION]: 'Aplicación'
} as const;

// ==========================================
// VALIDACIONES
// ==========================================

export interface GobernanzaEntidadValidationRules {
  gobernanzaId: {
    required: boolean;
    min: number;
  };
  entidadId: {
    required: boolean;
    min: number;
  };
  fechaAsociacion: {
    required: boolean;
    format: string;
  };
  observaciones: {
    maxLength: number;
  };
}

export const GOBERNANZA_ENTIDAD_VALIDATION: GobernanzaEntidadValidationRules = {
  gobernanzaId: {
    required: true,
    min: 1
  },
  entidadId: {
    required: true,
    min: 1
  },
  fechaAsociacion: {
    required: true,
    format: 'YYYY-MM-DD'
  },
  observaciones: {
    maxLength: 1000
  }
};