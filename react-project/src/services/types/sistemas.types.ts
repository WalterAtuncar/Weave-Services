/**
 * Tipos para el servicio de Sistemas
 * Controller CRUD completo con estadísticas, módulos y filtros avanzados
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES BASE =====

export interface Sistema {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  version?: string;
  familiaSistemaId: number;
  sistemaParentId?: number;
  url?: string;
  idServidor?: number;
  estado: number;
  tieneGobernanzaPropia: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  estado_registro: number;
}

export interface SistemaCompleto extends Sistema {
  familiaSistema?: any;
  sistemaParent?: Sistema;
  subSistemas?: Sistema[];
  modulos?: SistemaModulo[];
  servidor?: {
    codigo: string;
    nombre: string;
    ip: string;
    tipo: number;
    ambiente: number;
    estado: number;
  };
}

// ✅ ACTUALIZADO: Tipos basados en el swagger exacto
export interface SistemaModulo {
  sistemaModuloId: number;
  sistemaId: number;
  nombreModulo: string;
  funcionModulo?: string;
  version: number;
  estado: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
  sistema?: Sistema;
  estadoTexto?: string;
}

// ===== REQUESTS =====

export interface GetAllSistemasRequest {
  includeDeleted?: boolean;
  organizacionId?: number;
  soloSistemasRaiz?: boolean;
  soloConGobernanzaPropia?: boolean;
}

export interface GetSistemaByIdRequest {
  sistemaId: number;
}

export interface GetSistemaCompletoRequest {
  sistemaId: number;
}

export interface GetSistemasPaginatedRequest {
  // Parámetros de paginación
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
  includeDeleted?: boolean;
  
  // Filtros según swagger
  estado?: number;
  codigoSistema?: string;
  nombreSistema?: string;
  funcionPrincipal?: string;
  searchTerm?: string;
  organizacionId?: number;
  tipoSistemaId?: number;
  familiaSistemaId?: number;
  sistemaDepende?: number;
  idServidor?: number;
  soloSistemasRaiz?: boolean;
  tieneSistemasHijos?: boolean;
  tieneModulos?: boolean;
  soloActivos?: boolean;
  
  // Filtros de fecha
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  
  // Para compatibilidad con el código existente
  codigo?: string;
  nombre?: string;
  sistemaParentId?: number;
  version?: string;
}

export interface CreateSistemaRequest {
  organizacionId: number;
  codigoSistema?: string;
  nombreSistema: string;
  funcionPrincipal?: string;
  sistemaDepende?: number;
  tipoSistemaId: number;
  familiaSistemaId: number;
  estado: number; // ✅ AGREGADO: Estado del sistema (Borrador=-4, IniciarFlujo=-3, Pendiente=-2, Rechazado=-1, Inactivo=0, Activo=1)
  tieneGobernanzaPropia: boolean;
  servidorIds?: number[]; // ✅ ACTUALIZADO: Cambiado de idServidor a servidorIds
  modulos?: CreateSistemaModuloInSystemRequest[]; // ✅ AGREGADO: Array de módulos para crear junto con el sistema
}

// ✅ AGREGADO: Interface para módulos en la creación de sistema
export interface CreateSistemaModuloInSystemRequest {
  nombreModulo: string;
  funcionModulo?: string;
  estado?: number; // Por defecto será 1 (Activo)
}

export interface UpdateSistemaRequest {
  sistemaId: number;
  organizacionId: number;
  codigoSistema?: string;
  nombreSistema: string;
  funcionPrincipal?: string;
  sistemaDepende?: number;
  tipoSistemaId: number;
  familiaSistemaId: number;
  estado: number; // ✅ AGREGADO: Estado del sistema (Borrador=-4, IniciarFlujo=-3, Pendiente=-2, Rechazado=-1, Inactivo=0, Activo=1)
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number; // ✅ AGREGADO: ID de la gobernanza asociada al sistema
  servidoresToDelete?: number[]; // ✅ ACTUALIZADO: Para UPDATE
  servidoresToInsert?: number[]; // ✅ ACTUALIZADO: Para UPDATE
  // ✅ NUEVO: Flags para identificar solicitud de eliminación vía workflow
  esEliminacion?: boolean;
  registroEliminadoSolicitado?: boolean;
}

export interface DeleteSistemaRequest {
  sistemaId: number;
  forceDelete?: boolean;
  motivo?: string;
}

export interface GetSistemasByFamiliaRequest {
  familiaSistemaId: number;
}

// ✅ ACTUALIZADO: Requests basados en el swagger exacto

export interface CreateSistemaModuloRequest {
  sistemaId: number;
  nombreModulo: string;
  funcionModulo?: string;
  creadoPor?: number;
}

export interface UpdateSistemaModuloRequest {
  sistemaModuloId: number;
  sistemaId: number;
  nombreModulo: string;
  funcionModulo?: string;
  actualizadoPor?: number;
}

export interface DeleteSistemaModuloRequest {
  sistemaId: number;
  moduloId: number;
}

export interface GetSistemaModulosRequest {
  sistemaId: number;
  includeDeleted?: boolean;
}

// ===== RESPONSES =====

export type GetAllSistemasResponseData = Sistema[];
export type GetSistemaByIdResponseData = Sistema;
export type GetSistemaCompletoResponseData = SistemaCompleto;
export type CreateSistemaResponseData = Sistema;
export type UpdateSistemaResponseData = Sistema;
export type DeleteSistemaResponseData = boolean;
export type GetSistemasActivosResponseData = Sistema[];
export type GetSistemasByFamiliaResponseData = Sistema[];
// ✅ ACTUALIZADO: Responses para módulos
export type GetSistemaModulosResponseData = SistemaModulo[];
export type CreateSistemaModuloResponseData = number; // El backend retorna el ID del nuevo módulo
export type UpdateSistemaModuloResponseData = boolean;
export type DeleteSistemaModuloResponseData = boolean;

// Paginación
export interface SistemasPaginatedResponseData {
  data: Sistema[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Estadísticas
export interface EstadisticasSistemas {
  totalSistemas: number;
  sistemasActivos: number;
  sistemasInactivos: number;
  sistemasRaiz: number;
  subSistemas: number;
  familiasConMasSistemas: Array<{
    familiaSistemaId: number;
    nombreFamilia: string;
    totalSistemas: number;
  }>;
  sistemasConMasModulos: Array<{
    sistemaId: number;
    nombreSistema: string;
    totalModulos: number;
  }>;
  distribucionPorVersion: Array<{
    version: string;
    totalSistemas: number;
  }>;
}

export type GetEstadisticasSistemasResponseData = EstadisticasSistemas;

// ===== FILTROS Y OPCIONES =====

export interface SistemasFilters {
  familiaSistemaId?: number;
  sistemaParentId?: number;
  estado?: number;
  version?: string;
  idServidor?: number;
  soloSistemasRaiz?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  organizacionId?: number;
}

export interface SistemasSortOptions {
  orderBy?: 'codigo' | 'nombre' | 'version' | 'fechaCreacion' | 'fechaActualizacion';
  ascending?: boolean;
}

export interface SistemasPaginationOptions {
  page?: number;
  pageSize?: number;
}

// ===== BULK IMPORT TYPES =====

export interface BulkImportModuloRequest {
  nombreModulo: string;
  funcionModulo: string;
  estado: number;
  creadoPor: number;
}

export interface BulkImportSistemaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  version: string;
  familiaSistemaId: number;
  tipoSistemaId: number;
  codigoSistemaDepende?: string;
  idServidor?: number;
  estado: number;
  creadoPor: number;
  tieneGobernanzaPropia: boolean;
  modulos: BulkImportModuloRequest[];
}

export interface BulkImportRequest {
  organizacionId: number;
  sistemas: BulkImportSistemaRequest[];
}

export interface BulkImportSistemaResult {
  codigoSistema: string;
  nombreSistema: string;
  sistemaId: number;
  exitoso: boolean;
  mensajeError?: string;
  modulosCreados: number;
  erroresModulos: string[];
}

export interface BulkImportResponseData {
  organizacionId: number;
  totalSistemasProcesados: number;
  sistemasCreados: number;
  totalModulosProcesados: number;
  modulosCreados: number;
  resultados: BulkImportSistemaResult[];
  errores: string[];
  fechaProceso: string;
}

export type BulkImportResponse = ApiResponse<BulkImportResponseData>;