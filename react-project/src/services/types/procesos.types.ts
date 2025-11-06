/**
 * Tipos para el servicio de Procesos
 * Controller CRUD completo con estadísticas, actividades y filtros avanzados
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES BASE =====

export interface Proceso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  version?: string;
  categoriaProceso: number;
  procesoParentId?: number;
  objetivos?: string;
  alcance?: string;
  responsableId?: number;
  estado: number;
  tieneGobernanzaPropia: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: number;
  actualizadoPor: number;
  estado_registro: number;
}

export interface ProcesoCompleto extends Proceso {
  categoriaProceso?: any;
  procesoParent?: Proceso;
  subProcesos?: Proceso[];
  actividades?: ProcesoActividad[];
  responsable?: {
    id: number;
    nombre: string;
    email: string;
    cargo: string;
  };
}

export interface ProcesoActividad {
  procesoActividadId: number;
  procesoId: number;
  nombreActividad: string;
  descripcionActividad?: string;
  orden: number;
  tiempoEstimado?: number;
  responsableId?: number;
  estado: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
  proceso?: Proceso;
  estadoTexto?: string;
}

// ===== REQUESTS =====

export interface GetAllProcesosRequest {
  includeDeleted?: boolean;
  organizacionId?: number;
  soloProcesosRaiz?: boolean;
  soloConGobernanzaPropia?: boolean;
}

export interface GetProcesoByIdRequest {
  procesoId: number;
}

export interface GetProcesoCompletoRequest {
  procesoId: number;
}

export interface GetProcesosPaginatedRequest {
  // Parámetros básicos de paginación
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
  
  // Filtros específicos - actualizados para coincidir con el backend
  organizacionId?: number;
  tipoProcesoId?: number;
  estado?: number;
  codigo?: string;
  nombre?: string;
  searchTerm?: string;
  
  // Campos legacy mantenidos para compatibilidad
  includeDeleted?: boolean;
  codigoProceso?: string;
  nombreProceso?: string;
  objetivos?: string;
  tipoProceso?: number;
  categoriaProceso?: number;
  procesoDepende?: number;
  responsableId?: number;
  soloProcesosRaiz?: boolean;
  tieneProcesosHijos?: boolean;
  tieneActividades?: boolean;
  soloActivos?: boolean;
  
  // Campos adicionales
  version?: string;
  procesoParentId?: number;
}

export interface CreateProcesoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  version?: string;
  categoriaProceso: number;
  procesoParentId?: number;
  objetivos?: string;
  alcance?: string;
  responsableId?: number;
  estado?: number;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number;
  organizacionId: number;
  creadoPor?: number;
}

export interface UpdateProcesoRequest {
  procesoId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  version?: string;
  categoriaProceso: number;
  procesoParentId?: number;
  objetivos?: string;
  alcance?: string;
  responsableId?: number;
  estado?: number;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number;
  actualizadoPor?: number;
}

export interface DeleteProcesoRequest {
  procesoId: number;
  forceDelete?: boolean;
  motivo?: string;
}

export interface GetProcesosByCategoriaRequest {
  categoriaProcesoId: number;
}

// ===== REQUESTS DE ACTIVIDADES =====

export interface GetProcesoActividadesRequest {
  procesoId: number;
  includeDeleted?: boolean;
}

export interface CreateProcesoActividadRequest {
  procesoId: number;
  nombreActividad: string;
  descripcionActividad?: string;
  orden: number;
  tiempoEstimado?: number;
  responsableId?: number;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateProcesoActividadRequest {
  procesoId: number;
  procesoActividadId: number;
  nombreActividad: string;
  descripcionActividad?: string;
  orden: number;
  tiempoEstimado?: number;
  responsableId?: number;
  estado?: number;
  actualizadoPor?: number;
}

export interface DeleteProcesoActividadRequest {
  procesoId: number;
  actividadId: number;
}

// ===== RESPONSES =====

export type GetAllProcesosResponseData = Proceso[];

export type GetProcesoByIdResponseData = Proceso;

export type GetProcesoCompletoResponseData = ProcesoCompleto;

export interface ProcesosPaginatedResponseData {
  // Datos principales
  data: Proceso[];
  
  // Información de paginación - actualizada para coincidir con el backend
  paginacion: {
    paginaActual: number;
    tamañoPagina: number;
    totalElementos: number;
    totalPaginas: number;
    tienePaginaAnterior: boolean;
    tienePaginaSiguiente: boolean;
  };
  
  // Campos legacy mantenidos para compatibilidad
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export type CreateProcesoResponseData = number; // ID del nuevo proceso

export type UpdateProcesoResponseData = boolean;

export type DeleteProcesoResponseData = boolean;

export type GetProcesosActivosResponseData = Proceso[];

export type GetProcesosByCategoriaResponseData = Proceso[];

export type GetProcesoActividadesResponseData = ProcesoActividad[];

export type CreateProcesoActividadResponseData = number; // ID de la nueva actividad

export type UpdateProcesoActividadResponseData = boolean;

export type DeleteProcesoActividadResponseData = boolean;

export interface GetEstadisticasProcesosResponseData {
  totalProcesos: number;
  procesosActivos: number;
  procesosInactivos: number;
  procesosPorCategoria: Array<{
    categoriaId: number;
    categoriaNombre: string;
    cantidad: number;
  }>;
  procesosRecientes: Proceso[];
  actividadesTotales: number;
  tiempoPromedioActividades: number;
}

// ===== TIPOS AUXILIARES =====

export interface ProcesosFilters {
  estado?: number;
  categoriaProceso?: number;
  procesoParentId?: number;
  responsableId?: number;
  tieneGobernanzaPropia?: boolean;
  organizacionId?: number;
}

export interface ProcesosSortOptions {
  orderBy?: 'codigo' | 'nombre' | 'fechaCreacion' | 'fechaActualizacion' | 'estado';
  ascending?: boolean;
}

export interface ProcesosPaginationOptions {
  page?: number;
  pageSize?: number;
}

// ===== BULK IMPORT TYPES =====

export interface BulkImportProcesosRequest {
  organizacionId: number;
  procesos: Array<ProcesoBulkItemDto>;
  ejecutadoPor?: number;
  validarDuplicados?: boolean;
  continuarConErrores?: boolean;
  procesarEnLotes?: boolean;
}

export interface ProcesoBulkItemDto {
  tempId: number;
  padreTempId?: number;
  padreCodigoProceso?: string;
  tipoProcesoId: number;
  codigoProceso: string;
  nombreProceso: string;
  descripcionProceso?: string;
  versionProceso?: string;
  ordenProceso?: number;
  estadoId?: number;
  creadoPor?: number;
}

export interface BulkImportProcesosResponseData {
  organizacionId: number;
  totalProcesosProcesados: number;
  procesosCreados: number;
  resultados: Array<ProcesoBulkResultDto>;
  errores: Array<string>;
  fechaProceso: string;
  mapeoTempIdAProcesoId: Record<number, number>;
}

export interface ProcesoBulkResultDto {
  tempId: number;
  codigoProceso: string;
  nombreProceso: string;
  procesoId?: number;
  padreId?: number;
  nivel: number;
  exitoso: boolean;
  mensajeError?: string;
  rutaJerarquica?: string;
}

export type BulkImportProcesosResponse = ApiResponse<BulkImportProcesosResponseData>;

// ===== RESPONSE TYPES =====

export type GetAllProcesosResponse = ApiResponse<GetAllProcesosResponseData>;
export type GetProcesoByIdResponse = ApiResponse<GetProcesoByIdResponseData>;
export type GetProcesoCompletoResponse = ApiResponse<GetProcesoCompletoResponseData>;
export type GetProcesosPaginatedResponse = ApiResponse<ProcesosPaginatedResponseData>;
export type CreateProcesoResponse = ApiResponse<CreateProcesoResponseData>;
export type UpdateProcesoResponse = ApiResponse<UpdateProcesoResponseData>;
export type DeleteProcesoResponse = ApiResponse<DeleteProcesoResponseData>;
export type GetProcesosActivosResponse = ApiResponse<GetProcesosActivosResponseData>;
export type GetProcesosByCategoriaResponse = ApiResponse<GetProcesosByCategoriaResponseData>;
export type GetProcesoActividadesResponse = ApiResponse<GetProcesoActividadesResponseData>;
export type CreateProcesoActividadResponse = ApiResponse<CreateProcesoActividadResponseData>;
export type UpdateProcesoActividadResponse = ApiResponse<UpdateProcesoActividadResponseData>;
export type DeleteProcesoActividadResponse = ApiResponse<DeleteProcesoActividadResponseData>;
export type GetEstadisticasProcesosResponse = ApiResponse<GetEstadisticasProcesosResponseData>;

// ===== JERARQUÍA =====

export interface JerarquiaItem {
  procesoId: number;
  padreId?: number | null;
  tipoProcesoId: number;
  codigoProceso: string;
  nombreProceso: string;
  descripcionProceso?: string | null;
  versionProceso?: string | null;
  nivel: number;
  rutaJerarquica?: string | null;
  ordenProceso?: number;
  estadoId: number;
  tieneHijos?: boolean;
  nombreTipoProceso?: string;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
}

export interface GetJerarquiaProcesosResponseData {
  jerarquia: JerarquiaItem[];
  totalProcesos: number;
  totalNiveles: number;
}

export type GetJerarquiaProcesosResponse = ApiResponse<GetJerarquiaProcesosResponseData>;