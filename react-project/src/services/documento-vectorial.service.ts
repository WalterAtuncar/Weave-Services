/**
 * Servicio para gestión de DocumentoVectorial
 * Implementa los endpoints definidos en DocumentoVectorialController
 */

import { BaseApiService } from './api.service';
import { authService } from './auth.service';
import { ApiResponse } from './types/api.types';
import {
  // Entidades y DTOs
  DocumentoVectorial,
  CreateDocumentoVectorialDto,
  BusquedaVectorialDto,
  ResultadoBusquedaVectorial,
  DocumentoCompletoDto,
  // Requests
  InsertarDocumentoRequest,
  ObtenerDocumentoPorIdRequest,
  ObtenerDocumentoPorDocumentoIdRequest,
  ObtenerDocumentoCompletoPorIdRequest,
  BuscarDocumentosSimilaresRequest,
  ActualizarDocumentoRequest,
  EliminarDocumentoRequest,
  ObtenerDocumentosPaginadosRequest,
  BuscarPorMetadatosRequest,
  VerificarHashRequest,
  ObtenerAgregadoRequest,
  // Responses
  InsertarDocumentoResponseData,
  ObtenerDocumentoPorIdResponseData,
  ObtenerDocumentoPorDocumentoIdResponseData,
  ObtenerDocumentoCompletoPorIdResponseData,
  BuscarDocumentosSimilaresResponseData,
  ActualizarDocumentoResponseData,
  EliminarDocumentoResponseData,
  ObtenerDocumentosPaginadosResponseData,
  VerificarHashResponseData,
  ObtenerAgregadoResponseData
} from './types/documento-vectorial.types';

export class DocumentoVectorialService extends BaseApiService {
  protected baseEndpoint = '/DocumentosVectorialesSQL';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true,
    });
  }

  // ===== CRUD =====

  async insertarDocumento(request: InsertarDocumentoRequest): Promise<ApiResponse<InsertarDocumentoResponseData>> {
    return await this.post<InsertarDocumentoResponseData>(`${this.baseEndpoint}`, request.payload);
  }

  async obtenerDocumentoPorId(request: ObtenerDocumentoPorIdRequest): Promise<ApiResponse<ObtenerDocumentoPorIdResponseData>> {
    return await this.get<ObtenerDocumentoPorIdResponseData>(`${this.baseEndpoint}/${request.id}`);
  }

  async obtenerDocumentoPorDocumentoId(request: ObtenerDocumentoPorDocumentoIdRequest): Promise<ApiResponse<ObtenerDocumentoPorDocumentoIdResponseData>> {
    return await this.get<ObtenerDocumentoPorDocumentoIdResponseData>(`${this.baseEndpoint}/por-documento/${request.documentoId}`);
  }

  async obtenerDocumentoCompletoPorId(request: ObtenerDocumentoCompletoPorIdRequest): Promise<ApiResponse<ObtenerDocumentoCompletoPorIdResponseData>> {
    // Actualizado: el detalle completo se sirve desde SQL
    return await this.get<ObtenerDocumentoCompletoPorIdResponseData>(`${this.baseEndpoint}/sql/${request.documentoId}`);
  }

  /**
   * Fallback SQL: obtiene documento completo desde ruta /sql/{documentoId}
   * Mapea al controlador DocumentoVectorialController.cs [HttpGet("sql/{documentoId:long}")]
   */
  async obtenerDocumentoCompletoSql(request: ObtenerDocumentoCompletoPorIdRequest): Promise<ApiResponse<ObtenerDocumentoCompletoPorIdResponseData>> {
    return await this.get<ObtenerDocumentoCompletoPorIdResponseData>(`${this.baseEndpoint}/sql/${request.documentoId}`);
  }

  // Ligero: obtiene solo base64 principal y miniatura desde SQL
  async obtenerDocumentoBase64Sql(request: import('./types/documento-vectorial.types').ObtenerDocumentoCompletoPorIdRequest): Promise<ApiResponse<import('./types/documento-vectorial.types').ObtenerDocumentoBase64SqlResponseData>> {
    return await this.get<import('./types/documento-vectorial.types').ObtenerDocumentoBase64SqlResponseData>(`${this.baseEndpoint}/sql/${request.documentoId}/base64`);
  }

  async actualizarDocumento(request: ActualizarDocumentoRequest): Promise<ApiResponse<ActualizarDocumentoResponseData>> {
    return await this.put<ActualizarDocumentoResponseData>(`${this.baseEndpoint}/${request.id}`, request.payload);
  }

  /**
   * Actualiza documento compuesto (SQL + Vectorial) por DocumentoId
   * Mapea al endpoint: PUT /api/DocumentoVectorial/compuesto/{documentoId}
   */
  async actualizarDocumentoCompuestoPorDocumentoId(request: import('./types/documento-vectorial.types').ActualizarDocumentoCompuestoRequest): Promise<ApiResponse<import('./types/documento-vectorial.types').ActualizarDocumentoCompuestoResponseData>> {
    return await this.put<import('./types/documento-vectorial.types').ActualizarDocumentoCompuestoResponseData>(
      `${this.baseEndpoint}/compuesto/${request.documentoId}`,
      request.payload
    );
  }

  async eliminarDocumento(request: EliminarDocumentoRequest): Promise<ApiResponse<EliminarDocumentoResponseData>> {
    return await this.delete<EliminarDocumentoResponseData>(`${this.baseEndpoint}/${request.id}`);
  }

  // ===== BÚSQUEDA Y VERIFICACIONES =====

  async buscarDocumentosSimilares(request: BuscarDocumentosSimilaresRequest): Promise<ApiResponse<BuscarDocumentosSimilaresResponseData>> {
    return await this.post<BuscarDocumentosSimilaresResponseData>(`${this.baseEndpoint}/buscar-similares`, request.busqueda);
  }

  async obtenerDocumentosPaginados(request?: ObtenerDocumentosPaginadosRequest): Promise<ApiResponse<ObtenerDocumentosPaginadosResponseData>> {
    const params = new URLSearchParams();
    if (request?.pagina !== undefined) params.append('pagina', String(request.pagina));
    if (request?.tamaño !== undefined) params.append('tamaño', String(request.tamaño));
    const qs = params.toString();
    const url = qs ? `${this.baseEndpoint}/paginado?${qs}` : `${this.baseEndpoint}/paginado`;
    return await this.get<ObtenerDocumentosPaginadosResponseData>(url);
  }

  async buscarPorMetadatos(request: BuscarPorMetadatosRequest): Promise<ApiResponse<DocumentoVectorial[]>> {
    const params = new URLSearchParams();
    if (request.tags && request.tags.length > 0) params.append('tags', request.tags.join(','));
    if (request.departamento) params.append('departamento', request.departamento);
    if (request.tipoDocumento !== undefined) params.append('tipoDocumento', String(request.tipoDocumento));
    if (request.fechaDesde) params.append('fechaDesde', request.fechaDesde);
    if (request.fechaHasta) params.append('fechaHasta', request.fechaHasta);
    const qs = params.toString();
    const url = qs ? `${this.baseEndpoint}/buscar-por-metadatos?${qs}` : `${this.baseEndpoint}/buscar-por-metadatos`;
    return await this.get<DocumentoVectorial[]>(url);
  }

  async verificarHash(request: VerificarHashRequest): Promise<ApiResponse<VerificarHashResponseData>> {
    return await this.get<VerificarHashResponseData>(`${this.baseEndpoint}/verificar-hash/${encodeURIComponent(request.hash)}`);
  }

  async insertarEjemplo(): Promise<ApiResponse<InsertarDocumentoResponseData>> {
    return await this.post<InsertarDocumentoResponseData>(`${this.baseEndpoint}/ejemplo`);
  }

  // ===== AGREGADO (SQL + Vectoriales + Carpetas) =====
  // Preparado: incluye paginado y organizationId desde localStorage
  async obtenerAgregado(request?: ObtenerAgregadoRequest): Promise<ApiResponse<ObtenerAgregadoResponseData>> {
    const params = new URLSearchParams();
    const pagina = request?.pagina ?? 1;
    const tamaño = request?.tamaño ?? 10;
    params.append('pagina', String(pagina));
    params.append('tamaño', String(tamaño));

    const orgId = request?.organizacionId ?? authService.getCurrentOrganization()?.organizacionId;
    if (orgId !== undefined && orgId !== null) {
      params.append('organizacionId', String(orgId));
    }

    const qs = params.toString();
    const url = `${this.baseEndpoint}/agregado${qs ? `?${qs}` : ''}`;
    return await this.get<ObtenerAgregadoResponseData>(url);
  }
}

export const documentoVectorialService = new DocumentoVectorialService();