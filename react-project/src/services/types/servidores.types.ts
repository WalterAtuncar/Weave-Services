/**
 * Tipos para el servicio de Servidores
 * Controller CRUD completo con estadísticas, filtros avanzados y gestión de sistemas alojados
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES BASE =====

export interface Servidor {
  id: number;
  codigo: string;
  nombre: string;
  tipo: number; // 0=Virtual, 1=Físico
  ambiente: number; // 0=Desarrollo, 1=Producción
  sistemaOperativo: string;
  ip: string;
  estado: number; // 0=Activo, 1=Inactivo
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  estadoRegistro: number;
}

export interface ServidorDto extends Servidor {
  // Información relacionada
  nombreUsuarioCreador?: string;
  nombreUsuarioActualizador?: string;
  
  // Computed properties
  tipoTexto: string;
  ambienteTexto: string;
  estadoTexto: string;
  estadoRegistroTexto: string;
  
  // Estadísticas y relaciones
  totalSistemas: number;
  sistemasActivos: number;
  
  // Propiedades calculadas adicionales
  antiguedadEnDias?: number;
  tieneCodigoCompleto: boolean;
  tieneSistemas: boolean;
  esVirtual: boolean;
  esFisico: boolean;
  esProduccion: boolean;
  esDesarrollo: boolean;
  estaActivo: boolean;
  
  // Lista de sistemas alojados (opcional)
  sistemas?: SistemaEnServidorDto[];
}

export interface ServidorSimpleDto {
  id: number;
  codigo: string;
  nombre: string;
  ip: string;
  tipo: number;
  ambiente: number;
  estado: number;
  tipoTexto: string;
  ambienteTexto: string;
  estadoTexto: string;
  totalSistemas: number;
}

export interface SistemaEnServidorDto {
  sistemaId: number;
  codigoSistema?: string;
  nombreSistema: string;
  funcionPrincipal?: string;
  estado: number;
  estadoTexto: string;
  nombreFamiliaSistema?: string;
  nombreTipoSistema?: string;
}

// ===== REQUESTS =====

export interface GetAllServidoresRequest {
  organizationId: number; // Requerido según swagger
  includeDeleted?: boolean;
  tipo?: number;
  ambiente?: number;
  estado?: number;
}

export interface GetServidorByIdRequest {
  servidorId: number;
  organizationId: number;
  includeDeleted?: boolean;
}

export interface GetServidorCompletoRequest {
  servidorId: number;
  incluirSistemas?: boolean;
  soloSistemasActivos?: boolean;
  includeDeleted?: boolean;
}

export interface GetServidoresActivosRequest {
  tipo?: number;
  ambiente?: number;
}

export interface GetServidoresPaginatedRequest {
  // Organización (requerido)
  organizationId: number;
  
  // Paginación
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDescending?: boolean;
  
  // Filtros básicos
  includeDeleted?: boolean;
  estado?: number;
  
  // Filtros de información del servidor
  codigo?: string;
  nombre?: string;
  sistemaOperativo?: string;
  ip?: string;
  searchTerm?: string;
  
  // Filtros por tipos y ambiente
  tipo?: number;
  ambiente?: number;
  
  // Filtros booleanos
  soloActivos?: boolean;
  soloVirtuales?: boolean;
  soloFisicos?: boolean;
  soloProduccion?: boolean;
  soloDesarrollo?: boolean;
  tieneSistemas?: boolean;
  sinSistemas?: boolean;
  
  // Filtros por fechas
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  
  // Filtros por rangos de IP
  ipRangoInicio?: string;
  ipRangoFin?: string;
}

export interface GetEstadisticasServidoresRequest {
  organizationId: number; // Requerido para estadísticas por organización
  tipo?: number;
  ambiente?: number;
}

export interface GetServidoresByTipoRequest {
  tipo: number;
  ambiente?: number;
}

export interface GetServidoresByAmbienteRequest {
  ambiente: number;
  tipo?: number;
}

export interface CreateServidorRequest {
  organizationId: number; // Requerido para crear en la organización correcta
  codigo: string;
  nombre: string;
  tipo: number;
  ambiente: number;
  sistemaOperativo: string;
  ip: string;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateServidorRequest {
  id: number;
  organizationId: number; // Requerido para validación de pertenencia
  codigo: string;
  nombre: string;
  tipo: number;
  ambiente: number;
  sistemaOperativo: string;
  ip: string;
  estado: number;
  actualizadoPor?: number;
}

export interface DeleteServidorRequest {
  servidorId: number;
  organizationId: number; // ✅ REQUERIDO: ID de la organización
  forceDelete?: boolean;
  reasignarSistemas?: boolean;
  servidorDestinoId?: number;
  motivo?: string;
  eliminadoPor?: number;
}

// ===== RESPONSES =====

export type GetAllServidoresResponseData = Servidor[];

export type GetServidorByIdResponseData = Servidor | null;

export type GetServidorCompletoResponseData = ServidorDto | null;

export type GetServidoresActivosResponseData = Servidor[];

export interface ServidoresPaginatedResponseData {
  data: ServidorDto[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface EstadisticasServidoresResponseData {
  Total: number;
  Activos: number;
  Virtuales: number;
  Fisicos: number;
  Produccion: number;
  Desarrollo: number;
}

export type GetServidoresByTipoResponseData = ServidorDto[];

export type GetServidoresByAmbienteResponseData = ServidorDto[];

export type CreateServidorResponseData = number; // ID del servidor creado

export type UpdateServidorResponseData = boolean;

export type DeleteServidorResponseData = boolean;

// ===== TIPOS AUXILIARES =====

export interface ServidoresFilters {
  includeDeleted?: boolean;
  estado?: number;
  codigo?: string;
  nombre?: string;
  sistemaOperativo?: string;
  ip?: string;
  searchTerm?: string;
  tipo?: number;
  ambiente?: number;
  soloActivos?: boolean;
  soloVirtuales?: boolean;
  soloFisicos?: boolean;
  soloProduccion?: boolean;
  soloDesarrollo?: boolean;
  tieneSistemas?: boolean;
  sinSistemas?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  ipRangoInicio?: string;
  ipRangoFin?: string;
}

export interface ServidoresSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ServidoresPaginationOptions {
  page: number;
  pageSize: number;
}

// ===== ENUMS =====

export enum TipoServidor {
  Virtual = 0,
  Fisico = 1
}

export enum AmbienteServidor {
  Desarrollo = 0,
  Produccion = 1
}

export enum EstadoServidor {
  Inactivo = 0,
  Activo = 1
}

// ===== CONSTANTES =====

export const SERVIDOR_TIPO_LABELS = {
  [TipoServidor.Virtual]: 'Virtual',
  [TipoServidor.Fisico]: 'Físico'
};

export const SERVIDOR_AMBIENTE_LABELS = {
  [AmbienteServidor.Desarrollo]: 'Desarrollo',
  [AmbienteServidor.Produccion]: 'Producción'
};

export const SERVIDOR_ESTADO_LABELS = {
  [EstadoServidor.Activo]: 'Activo',
  [EstadoServidor.Inactivo]: 'Inactivo'
};

// ===== VALIDATORS =====

export interface ServidorValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
} 