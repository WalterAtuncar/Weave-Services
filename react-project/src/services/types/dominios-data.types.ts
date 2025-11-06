/**
 * Tipos para el servicio de Dominios de Data
 * Basado en sistemas.types.ts pero adaptado para gestión de dominios y sub-dominios de datos
 */

import { ApiResponse } from './api.types';
import {
  DominioData,
  SubDominioData,
  CreateDominioDataDto,
  UpdateDominioDataDto,
  CreateSubDominioDataDto,
  UpdateSubDominioDataDto,
  EstadoDominioData,
  TipoDominioData,
  CategoriaSubDominio,
  NivelSensibilidad
} from '../../models/DominiosData';

// ===== ENTIDADES EXTENDIDAS =====

export interface DominioDataCompleto extends DominioData {
  dominioParent?: DominioData;
  subDominios?: DominioData[];
  subDominiosData?: SubDominioData[];
  totalSubDominios?: number;
  totalSubDominiosData?: number;
}

// ===== REQUESTS =====

export interface GetAllDominiosDataRequest {
  organizacionId: number;
  includeDeleted?: boolean;
  soloDominiosRaiz?: boolean;
  includeSubDominios?: boolean;
}

export interface GetDominioDataByIdRequest {
  dominioId: number;
}

export interface GetDominioDataCompletoRequest {
  dominioId: number;
}

export interface GetDominiosDataPaginatedRequest {
  // Parámetros básicos de paginación
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
  includeDeleted?: boolean;
  
  // Filtros específicos
  organizacionId: number;
  estado?: EstadoDominioData;
  codigoDominio?: string;
  nombreDominio?: string;
  descripcion?: string;
  searchTerm?: string;
  tipoDominio?: TipoDominioData;
  dominioParentId?: number;
  soloDominiosRaiz?: boolean;
  tieneSubDominios?: boolean;
  tieneSubDominiosData?: boolean;
  soloActivos?: boolean;
  
  // Filtros de fecha
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  
  // Filtros específicos de data governance
  propietarioNegocio?: string;
  stewardData?: string;
  
  // Para compatibilidad con el código existente
  codigo?: string;
  nombre?: string;
  tipo?: TipoDominioData;
}

export interface CreateDominioDataRequest {
  organizacionId: number;
  codigoDominio?: string;
  nombreDominio: string;
  descripcion?: string;
  tipoDominio?: TipoDominioData;
  tipoDominioId?: number;
  dominioParentId?: number;
  estado?: EstadoDominioData;
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  gobernanzaId?: number;
  subDominiosData?: CreateSubDominioDataInDominioRequest[];
}

export interface CreateSubDominioDataInDominioRequest {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaSubDominio;
  nivelSensibilidad: NivelSensibilidad;
  estado?: EstadoDominioData;
  propietarioResponsable?: string;
  custodioData?: string;
}

export interface UpdateDominioDataRequest {
  dominioId: number;
  organizacionId: number;
  codigoDominio?: string;
  nombreDominio: string;
  descripcionDominio?: string;
  tipoDominioId?: number;
  dominioParentId?: number;
  estado?: EstadoDominioData;
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  gobernanzaId?: number;
  actualizadoPor?: number;
}

export interface DeleteDominioDataRequest {
  dominioId: number;
  forceDelete?: boolean;
  motivo?: string;
}

export interface GetDominiosByTipoRequest {
  tipoDominio: TipoDominioData;
}

// ===== REQUESTS PARA SUB-DOMINIOS =====

export interface CreateSubDominioDataRequest {
  dominioId: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaSubDominio;
  nivelSensibilidad: NivelSensibilidad;
  estado?: EstadoDominioData;
  propietarioResponsable?: string;
  custodioData?: string;
  creadoPor?: number;
}

export interface UpdateSubDominioDataRequest {
  subDominioId: number;
  dominioId: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaSubDominio;
  nivelSensibilidad: NivelSensibilidad;
  estado: EstadoDominioData;
  propietarioResponsable?: string;
  custodioData?: string;
  actualizadoPor?: number;
}

export interface DeleteSubDominioDataRequest {
  dominioId: number;
  subDominioId: number;
}

export interface GetSubDominiosDataRequest {
  dominioId: number;
  includeDeleted?: boolean;
}

// ===== RESPONSES =====

export type GetAllDominiosDataResponseData = DominioData[];
export type GetDominioDataByIdResponseData = DominioData;
export type GetDominioDataCompletoResponseData = DominioDataCompleto;
export type CreateDominioDataResponseData = DominioData;
export type UpdateDominioDataResponseData = DominioData;
export type DeleteDominioDataResponseData = boolean;
export type GetDominiosActivosResponseData = DominioData[];
export type GetDominiosByTipoResponseData = DominioData[];

// Responses para sub-dominios
export type GetSubDominiosDataResponseData = SubDominioData[];
export type CreateSubDominioDataResponseData = number; // El backend retorna el ID del nuevo sub-dominio
export type UpdateSubDominioDataResponseData = boolean;
export type DeleteSubDominioDataResponseData = boolean;

// Response paginada
export interface DominiosDataPaginatedResponseData {
  data: DominioData[];
  pagination: {
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

// Estadísticas
export interface EstadisticasDominiosData {
  totalDominios: number;
  dominiosActivos: number;
  dominiosInactivos: number;
  dominiosRaiz: number;
  subDominios: number;
  totalSubDominiosData: number;
  tiposConMasDominios: Array<{
    tipoDominio: TipoDominioData;
    nombreTipo: string;
    totalDominios: number;
  }>;
  dominiosConMasSubDominios: Array<{
    dominioId: number;
    nombreDominio: string;
    totalSubDominios: number;
  }>;
  distribucionPorSensibilidad: Array<{
    nivelSensibilidad: NivelSensibilidad;
    nombreNivel: string;
    totalSubDominios: number;
  }>;
  distribucionPorCategoria: Array<{
    categoria: CategoriaSubDominio;
    nombreCategoria: string;
    totalSubDominios: number;
  }>;
}

export type GetEstadisticasDominiosDataResponseData = EstadisticasDominiosData;

// ===== FILTROS Y OPCIONES =====

export interface DominiosDataFilters {
  tipoDominio?: TipoDominioData;
  dominioParentId?: number;
  estado?: EstadoDominioData;
  propietarioNegocio?: string;
  stewardData?: string;
  soloDominiosRaiz?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  organizacionId?: number;
}

export interface DominiosDataSortOptions {
  orderBy?: 'codigo' | 'nombre' | 'tipo' | 'fechaCreacion' | 'fechaActualizacion';
  ascending?: boolean;
}

export interface DominiosDataPaginationOptions {
  page?: number;
  pageSize?: number;
}

// ===== BULK IMPORT =====

export interface BulkImportSubDominioDataRequest {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaSubDominio;
  nivelSensibilidad: NivelSensibilidad;
  estado: EstadoDominioData;
  propietarioResponsable?: string;
  custodioData?: string;
  creadoPor: number;
}

export interface BulkImportDominioDataRequest {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoDominioData;
  dominioParentId?: number;
  estado: EstadoDominioData;
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  creadoPor: number;
  subDominiosData: BulkImportSubDominioDataRequest[];
}

export interface BulkImportDominiosDataRequest {
  organizacionId: number;
  dominios: BulkImportDominioDataRequest[];
}

export interface BulkImportDominioDataResult {
  codigoDominio: string;
  nombreDominio: string;
  dominioId: number;
  exitoso: boolean;
  mensajeError?: string;
  subDominiosCreados: number;
  erroresSubDominios: string[];
}

export interface BulkImportDominiosDataResponseData {
  organizacionId: number;
  totalDominiosProcesados: number;
  dominiosCreados: number;
  totalSubDominiosProcesados: number;
  subDominiosCreados: number;
  resultados: BulkImportDominioDataResult[];
  errores: string[];
  fechaProceso: string;
}

export type BulkImportDominiosDataResponse = ApiResponse<BulkImportDominiosDataResponseData>;

// ===== TIPOS DE UTILIDAD =====

/**
 * Mapeo de dominio desde API
 */
export const mapDominioDataFromAPI = (apiData: any): DominioData => {
  // Mapear el estado numérico a enum
  let estadoEnum;
  switch(apiData.estado) {
    case -4: estadoEnum = -4; break; // Borrador
    case -3: estadoEnum = -3; break; // IniciarFlujo
    case -2: estadoEnum = -2; break; // Pendiente
    case -1: estadoEnum = -1; break; // Rechazado
    case 0: estadoEnum = 0; break;   // Inactivo
    case 1: estadoEnum = 1; break;   // Activo
    default: estadoEnum = 0;         // Inactivo por defecto
  }
  
  // Mapear el tipo de dominio desde el código
  let tipoEnum;
  switch(apiData.tipoDominioCodigo) {
    case 'FINANCIERO': tipoEnum = 'financiero'; break;
    case 'PERSONAS': tipoEnum = 'personas'; break;
    case 'OPERACIONAL': tipoEnum = 'operacional'; break;
    case 'COMERCIAL': tipoEnum = 'comercial'; break;
    case 'RECURSOS_HUMANOS': tipoEnum = 'recursos_humanos'; break;
    case 'TECNOLOGIA': tipoEnum = 'tecnologia'; break;
    case 'LEGAL_COMPLIANCE': tipoEnum = 'legal_compliance'; break;
    case 'MARKETING': tipoEnum = 'marketing'; break;
    case 'LOGISTICA': tipoEnum = 'logistica'; break;
    case 'CALIDAD': tipoEnum = 'calidad'; break;
    default: tipoEnum = 'operacional';
  }
  
  // Mapear subdominios si existen
  let subDominiosData: SubDominioData[] | undefined;
  if (apiData.subDominios && Array.isArray(apiData.subDominios)) {
    subDominiosData = apiData.subDominios.map((subDominio: any) => {
      // Mapear el estado numérico a enum para subdominios
      let estadoSubDominioEnum;
      switch(subDominio.estado) {
        case -4: estadoSubDominioEnum = -4; break; // Borrador
        case -3: estadoSubDominioEnum = -3; break; // IniciarFlujo
        case -2: estadoSubDominioEnum = -2; break; // Pendiente
        case -1: estadoSubDominioEnum = -1; break; // Rechazado
        case 0: estadoSubDominioEnum = 0; break;   // Inactivo
        case 1: estadoSubDominioEnum = 1; break;   // Activo
        default: estadoSubDominioEnum = 0;         // Inactivo por defecto
      }
      
      return {
        subDominioId: subDominio.subDominioDataId,
        dominioId: subDominio.dominioDataId,
        codigo: subDominio.codigoSubDominio,
        nombre: subDominio.nombreSubDominio,
        descripcion: subDominio.descripcionSubDominio,
        categoria: 'datos_maestros', // Valor por defecto, ajustar según necesidad
        nivelSensibilidad: 'interno', // Valor por defecto, ajustar según necesidad
        estado: estadoSubDominioEnum,
        gobernanzaId: subDominio.gobernanzaId ?? null,
        propietarioResponsable: undefined,
        custodioData: undefined,
        fechaCreacion: subDominio.fechaCreacion,
        fechaActualizacion: subDominio.fechaActualizacion,
        creadoPor: subDominio.creadoPor,
        actualizadoPor: subDominio.actualizadoPor,
        registroEliminado: subDominio.registroEliminado || false,
        tieneGobernanzaPropia: subDominio.tieneGobernanzaPropia === true,
        estadoTexto: subDominio.estadoTexto || estadoSubDominioEnum
      };
    });
  }
  
  return {
    dominioId: apiData.dominioDataId,
    codigo: apiData.codigoDominio,
    nombre: apiData.nombreDominio,
    descripcion: apiData.descripcionDominio,
    tipo: tipoEnum,
    dominioParentId: undefined, // No viene en la respuesta actual
    organizacionId: apiData.organizacionId,
    estado: estadoEnum,
    propietarioNegocio: undefined, // No viene en la respuesta actual
    stewardData: undefined, // No viene en la respuesta actual
    politicasGobierno: undefined, // No viene en la respuesta actual
    gobernanzaId: apiData.gobernanzaId, // ✅ Agregado el mapeo del gobernanzaId
    fechaCreacion: apiData.fechaCreacion,
    fechaActualizacion: apiData.fechaActualizacion || apiData.fechaCreacion,
    creadoPor: apiData.creadoPor || 0,
    actualizadoPor: apiData.actualizadoPor || 0,
    registroEliminado: apiData.registroEliminado || false,
    
    // Campos calculados
    totalSubDominios: apiData.totalSubDominios || (subDominiosData?.length ?? 0),
    dominioParent_Nombre: undefined,
    estadoTexto: apiData.estadoTexto,
    tipoTexto: apiData.tipoDominioNombre,
    subDominiosData: subDominiosData
  };
};

/**
 * Mapeo de dominio hacia API
 */
export const mapDominioDataToAPI = (dominio: CreateDominioDataDto | UpdateDominioDataDto): any => {
  const isUpdate = 'dominioDataId' in (dominio as any);

  const base = {
    codigoDominio: (dominio as any).codigoDominio,
    nombreDominio: (dominio as any).nombreDominio,
    // En creación el backend espera `descripcion`, en actualización espera `descripcionDominio`
    ...(isUpdate
      ? { descripcionDominio: (dominio as any).descripcionDominio }
      : { descripcion: (dominio as any).descripcionDominio }
    ),
    tipoDominioId: (dominio as any).tipoDominioId,
    estado: (dominio as any).estado,
    propietarioNegocio: (dominio as any).propietarioNegocio,
    stewardData: (dominio as any).stewardData,
    politicasGobierno: (dominio as any).politicasGobierno,
    ...((dominio as any).gobernanzaId ? { gobernanzaId: (dominio as any).gobernanzaId } : {})
  };

  const withOrg = ('organizacionId' in (dominio as any)) ? { organizacionId: (dominio as any).organizacionId } : {};
  const withId = ('dominioDataId' in (dominio as any)) ? { dominioId: (dominio as any).dominioDataId } : {};

  return { ...withOrg, ...base, ...withId };
};

/**
 * Mapeo de sub-dominio desde API
 */
export const mapSubDominioDataFromAPI = (apiData: any): SubDominioData => {
  // Mapear el estado numérico a enum para subdominios
  let estadoEnum;
  switch(apiData.estado) {
    case -4: estadoEnum = -4; break; // Borrador
    case -3: estadoEnum = -3; break; // IniciarFlujo
    case -2: estadoEnum = -2; break; // Pendiente
    case -1: estadoEnum = -1; break; // Rechazado
    case 0: estadoEnum = 0; break;   // Inactivo
    case 1: estadoEnum = 1; break;   // Activo
    default: estadoEnum = 0;         // Inactivo por defecto
  }

  return {
    subDominioId: apiData.subDominioId || apiData.id,
    dominioId: apiData.dominioId,
    codigo: apiData.codigo,
    nombre: apiData.nombre,
    descripcion: apiData.descripcion,
    categoria: apiData.categoria,
    nivelSensibilidad: apiData.nivelSensibilidad,
    estado: estadoEnum,
    gobernanzaId: apiData.gobernanzaId ?? null,
    tieneGobernanzaPropia: apiData.tieneGobernanzaPropia === true,
    propietarioResponsable: apiData.propietarioResponsable,
    custodioData: apiData.custodioData,
    fechaCreacion: apiData.fechaCreacion,
    fechaActualizacion: apiData.fechaActualizacion,
    creadoPor: apiData.creadoPor,
    actualizadoPor: apiData.actualizadoPor,
    registroEliminado: apiData.registroEliminado || false,
    estadoTexto: apiData.estadoTexto || estadoEnum
  };
};

/**
 * Mapeo de sub-dominio hacia API
 */
export const mapSubDominioDataToAPI = (subDominio: CreateSubDominioDataDto | UpdateSubDominioDataDto): any => {
  return {
    dominioId: subDominio.dominioId,
    codigo: subDominio.codigo,
    nombre: subDominio.nombre,
    descripcion: subDominio.descripcion,
    categoria: subDominio.categoria,
    nivelSensibilidad: subDominio.nivelSensibilidad,
    estado: subDominio.estado,
    propietarioResponsable: subDominio.propietarioResponsable,
    custodioData: subDominio.custodioData,
    ...(subDominio.gobernanzaId ? { gobernanzaId: subDominio.gobernanzaId } : {}),
    ...(('subDominioId' in subDominio) && { subDominioId: subDominio.subDominioId })
  };
};