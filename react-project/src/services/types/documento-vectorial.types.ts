/**
 * Tipos para el servicio de DocumentoVectorial
 * Mapean los modelos y DTOs del backend (ASP.NET) usando camelCase
 */

import { ApiResponse } from './api.types';

// ===== ENTIDADES BASE =====

export interface MetadataDocumento {
  nombreDocumento: string;
  tipoDocumentoId: number;
  fechaCreacion: string; // ISO string
  tags: string[];
  tamañoArchivo: number;
  extension: string;
  departamento?: string | null;
}

export interface ChunkDocumento {
  numeroChunk: number;
  contenido: string;
  embeddingChunk: number[];
  posicionInicio: number;
  posicionFin: number;
}

export interface DocumentoVectorial {
  id?: string | null;
  documentoId: number;
  contenidoTexto: string;
  embedding: number[];
  metadata: MetadataDocumento;
  chunks: ChunkDocumento[];
  modeloEmbedding: string;
  dimensiones: number;
  hashContenido: string;
  fechaVectorizacion?: string; // ISO string
  version?: number;
  estado?: string;
}

// ===== DTOs =====

export interface CreateDocumentoVectorialDto {
  documentoId: number;
  contenidoTexto: string;
  embedding: number[];
  metadata: MetadataDocumento;
  chunks: ChunkDocumento[];
  modeloEmbedding: string;
  dimensiones: number;
  hashContenido: string;
}

// Nuevo: DTO para SQL (camelCase)
export interface CreateDocumentoDbDto {
  tipoDocumentoId: number;
  nombreDocumento: string;
  nombreArchivoOriginal: string;
  rutaArchivo: string;
  carpetaId: number; // requerido por backend
  tamanoArchivo?: number | null;
  descripcionDocumento?: string | null;
  // Nuevos campos de miniatura
  miniaturaBase64?: string | null;
  miniaturaMimeType?: string | null;
  miniaturaAncho?: number | null;
  miniaturaAlto?: number | null;
  // Campos adicionales de gestión
  estado: number;
  gobiernoId?: number | null;
  entidadesAsociadas?: { tipoEntidadId: number; entidadesId: number[] }[];
}

// Nuevo: DTO vectorial sin DocumentoId
export interface CreateDocumentoVectorialSinIdDto {
  contenidoTexto: string;
  embedding: number[];
  metadata: MetadataDocumento;
  chunks: ChunkDocumento[];
  modeloEmbedding: string;
  dimensiones: number;
  hashContenido: string;
}

export interface BusquedaVectorialDto {
  queryEmbedding: number[];
  limite?: number; // default 10
  umbralSimilitud?: number; // default 0.7
  filtroTags?: string[] | null;
  filtroDepartamento?: string | null;
  filtroTipoDocumento?: number | null;
}

export interface ResultadoBusquedaVectorial {
  documento: DocumentoVectorial;
  puntuacionSimilitud: number;
  chunksRelevantes?: ChunkDocumento[] | null;
}

// ===== REQUESTS =====

// Nuevo: Payload compuesto para InsertarDocumento
export interface InsertarDocumentoCompuestoPayload {
  documentoDb: CreateDocumentoDbDto;
  vectorial: CreateDocumentoVectorialSinIdDto;
}

export interface InsertarDocumentoRequest {
  payload: InsertarDocumentoCompuestoPayload;
}

export interface ObtenerDocumentoPorIdRequest {
  id: string;
}

export interface ObtenerDocumentoPorDocumentoIdRequest {
  documentoId: number;
}

export interface BuscarDocumentosSimilaresRequest {
  busqueda: BusquedaVectorialDto;
}

export interface ActualizarDocumentoRequest {
  id: string;
  payload: CreateDocumentoVectorialDto;
}

// Nuevo: Payload y request para actualización compuesta por DocumentoId
export interface ActualizarDocumentoCompuestoPayload {
  documentoDb: CreateDocumentoDbDto;
  vectorial: CreateDocumentoVectorialSinIdDto;
}

export interface ActualizarDocumentoCompuestoRequest {
  documentoId: number;
  payload: ActualizarDocumentoCompuestoPayload;
}

export interface EliminarDocumentoRequest {
  id: string;
}

export interface ObtenerDocumentosPaginadosRequest {
  pagina?: number; // default 1
  tamaño?: number; // default 10
}

export interface BuscarPorMetadatosRequest {
  tags?: string[];
  departamento?: string;
  tipoDocumento?: number;
  fechaDesde?: string; // ISO string
  fechaHasta?: string; // ISO string
}

export interface VerificarHashRequest {
  hash: string;
}

export interface ObtenerDocumentoCompletoPorIdRequest {
  documentoId: number;
}

// ===== RESPONSES =====

export interface DocumentoCompletoDto {
  documentoId: number;
  tipoDocumentoId: number;
  nombreDocumento: string;
  nombreArchivoOriginal: string;
  rutaArchivo: string;
  tamanoArchivo?: number | null;
  descripcionDocumento?: string | null;
  organizacionId: number;
  carpetaId: number;
  miniaturaBase64?: string | null;
  miniaturaMimeType?: string | null;
  miniaturaAncho?: number | null;
  miniaturaAlto?: number | null;
  estado?: number | null;
  gobiernoId?: number | null;
  fechaCreacion?: string | null;
  fechaModificacion?: string | null;
  usuarioCreacion?: string | null;
  usuarioModificacion?: string | null;
  contenidoBase64: string;
  mimeType: string;
}

export interface InsertarDocumentoResponseData {
  documentoVectorial: DocumentoVectorial;
  documentoIdSql: number;
}
// La respuesta de actualización compuesta tiene la misma forma que la de inserción compuesta
export type ActualizarDocumentoCompuestoResponseData = InsertarDocumentoResponseData;
export type ObtenerDocumentoPorIdResponseData = DocumentoVectorial | null;
export type ObtenerDocumentoPorDocumentoIdResponseData = DocumentoVectorial | null;
export type ObtenerDocumentoCompletoPorIdResponseData = DocumentoCompletoDto | null;
// Respuesta ligera para base64 desde SQL
export interface ObtenerDocumentoBase64SqlResponseData {
  contenidoBase64: string;
  miniaturaBase64: string | null;
}
export type BuscarDocumentosSimilaresResponseData = ResultadoBusquedaVectorial[];
export type ActualizarDocumentoResponseData = DocumentoVectorial | null;
export type EliminarDocumentoResponseData = boolean;

export interface ObtenerDocumentosPaginadosResponseData {
  documentos: DocumentoVectorial[];
  paginacion: {
    pagina_actual: number;
    tamaño_pagina: number;
    total_documentos: number;
    total_paginas: number;
  };
}

export interface VerificarHashResponseData {
  existe: boolean;
  hash: string;
}

// ===== AGREGADO (SQL + Vectoriales + Carpetas) =====

// Documento SQL (campos principales)
export interface DocumentoSql {
  documentoId: number;
  tipoDocumentoId: number;
  nombreDocumento: string;
  nombreArchivoOriginal: string;
  rutaArchivo: string;
  tamanoArchivo?: number | null;
  descripcionDocumento?: string | null;
  organizacionId: number;
  carpetaId: number;
  miniaturaBase64?: string | null;
  miniaturaMimeType?: string | null;
  miniaturaAncho?: number | null;
  miniaturaAlto?: number | null;
  // Contenido del archivo para ver/descargar directamente desde la grilla
  contenidoBase64?: string | null;
  mimeType?: string | null;
  estado?: number | null;
  fechaCreacion?: string | null; // ISO
  fechaModificacion?: string | null; // ISO
  creadoPor?: number | null;
  modificadoPor?: number | null;
  eliminado?: boolean | null;
  // Nuevo: id de gobernanza asociado (puede venir en PascalCase)
  gobernanzaId?: number | null;
  GobiernoId?: number | null; // tolerancia por backend histórico
  // Nuevo: entidades asociadas agrupadas por tipo
  entidadesAsociadas?: { tipoEntidadId: number; entidadesId: number[] }[];
}

// Metadatos de paginación del backend (camelCase)
export interface PaginationInfo {
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Contenedor paginado del backend (data + pagination)
export interface SqlPagedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

// DTO de respuesta agregada
export interface DocumentosAgregadosDto {
  sql: SqlPagedResult<DocumentoSql>;
  vectoriales: DocumentoVectorial[];
  carpetas: import('./documentos-carpetas.types').Carpeta[];
}

// Request/Response para el agregado
export interface ObtenerAgregadoRequest {
  pagina?: number; // default 1
  tamaño?: number; // default 10
  organizacionId?: number; // si no viene, se toma de localStorage
}
export type ObtenerAgregadoResponseData = DocumentosAgregadosDto;