/**
 * Servicio para gestión de Procesos
 * Implementa todos los endpoints del controlador ProcesosController
 * Incluye CRUD completo, estadísticas, actividades y filtros avanzados
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  Proceso,
  ProcesoCompleto,
  ProcesoActividad,
  
  // Requests
  GetAllProcesosRequest,
  GetProcesoByIdRequest,
  GetProcesoCompletoRequest,
  GetProcesosPaginatedRequest,
  CreateProcesoRequest,
  UpdateProcesoRequest,
  DeleteProcesoRequest,
  GetProcesosByCategoriaRequest,
  CreateProcesoActividadRequest,
  UpdateProcesoActividadRequest,
  DeleteProcesoActividadRequest,
  GetProcesoActividadesRequest,
  
  // Responses
  GetAllProcesosResponseData,
  GetProcesoByIdResponseData,
  GetProcesoCompletoResponseData,
  ProcesosPaginatedResponseData,
  CreateProcesoResponseData,
  UpdateProcesoResponseData,
  DeleteProcesoResponseData,
  GetProcesosActivosResponseData,
  GetProcesosByCategoriaResponseData,
  GetProcesoActividadesResponseData,
  CreateProcesoActividadResponseData,
  UpdateProcesoActividadResponseData,
  DeleteProcesoActividadResponseData,
  GetEstadisticasProcesosResponseData,
  // Jerarquía
  GetJerarquiaProcesosResponseData,
  
  // Tipos auxiliares
  ProcesosFilters,
  ProcesosSortOptions,
  ProcesosPaginationOptions,
  
  // Bulk Import Types
  BulkImportProcesosRequest,
  BulkImportProcesosResponse,
  BulkImportProcesosResponseData
} from './types/procesos.types';

export class ProcesosService extends BaseApiService {
  protected baseEndpoint = '/Procesos';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los procesos
   * GET /api/Procesos
   */
  async getAllProcesos(request?: GetAllProcesosRequest): Promise<ApiResponse<GetAllProcesosResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request?.organizacionId !== undefined) {
      params.append('organizacionId', request.organizacionId.toString());
    }
    if (request?.soloProcesosRaiz !== undefined) {
      params.append('soloProcesosRaiz', request.soloProcesosRaiz.toString());
    }
    if (request?.soloConGobernanzaPropia !== undefined) {
      params.append('soloConGobernanzaPropia', request.soloConGobernanzaPropia.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<GetAllProcesosResponseData>(url);
  }

  /**
   * Obtiene un proceso por ID
   * GET /api/Procesos/{id}
   */
  async getProcesoById(request: GetProcesoByIdRequest): Promise<ApiResponse<GetProcesoByIdResponseData>> {
    const url = `${this.baseEndpoint}/${request.procesoId}`;
    return await this.get<GetProcesoByIdResponseData>(url);
  }

  /**
   * Obtiene información completa de un proceso
   * GET /api/Procesos/{id}/completo
   */
  async getProcesoCompleto(request: GetProcesoCompletoRequest): Promise<ApiResponse<GetProcesoCompletoResponseData>> {
    const url = `${this.baseEndpoint}/${request.procesoId}/completo`;
    return await this.get<GetProcesoCompletoResponseData>(url);
  }

  /**
   * Búsqueda paginada de procesos
   * GET /api/Procesos/paginated
   */
  async getProcesosPaginated(request?: GetProcesosPaginatedRequest): Promise<ApiResponse<ProcesosPaginatedResponseData>> {
    const params = new URLSearchParams();

    // Parámetros básicos de paginación - actualizados para coincidir con el backend
    if (request?.page !== undefined) params.append('pagina', request.page.toString());
    if (request?.pageSize !== undefined) params.append('tamaño', request.pageSize.toString());
    if (request?.organizacionId !== undefined) params.append('organizacionId', request.organizacionId.toString());

    // Filtros específicos - actualizados para coincidir con el backend
    if (request?.tipoProcesoId !== undefined) params.append('tipoProcesoId', request.tipoProcesoId.toString());
    if (request?.estado !== undefined) params.append('estadoId', request.estado.toString());
    if (request?.codigo) params.append('codigoProceso', request.codigo);
    if (request?.nombre) params.append('nombreProceso', request.nombre);
    
    // Búsqueda general
    if (request?.searchTerm) params.append('terminoBusqueda', request.searchTerm);

    // Ordenamiento - actualizados para coincidir con el backend
    if (request?.orderBy) params.append('ordenarPor', request.orderBy);
    if (request?.ascending !== undefined) params.append('ordenDescendente', (!request.ascending).toString());

    const url = `${this.baseEndpoint}/paginated?${params.toString()}`;
    // Debug: verificar URL y parámetros construidos
    console.log('[Procesos][Service] GET URL:', url);
    return await this.get<ProcesosPaginatedResponseData>(url);
  }

  /**
   * Crea un nuevo proceso
   * POST /api/Procesos
   */
  async createProceso(request: CreateProcesoRequest): Promise<ApiResponse<CreateProcesoResponseData>> {
    return await this.post<CreateProcesoResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza un proceso existente
   * PUT /api/Procesos/{id}
   */
  async updateProceso(request: UpdateProcesoRequest): Promise<ApiResponse<UpdateProcesoResponseData>> {
    const url = `${this.baseEndpoint}/${request.procesoId}`;
    return await this.put<UpdateProcesoResponseData>(url, request);
  }

  /**
   * Elimina un proceso
   * DELETE /api/Procesos/{id}
   */
  async deleteProceso(request: DeleteProcesoRequest): Promise<ApiResponse<DeleteProcesoResponseData>> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.procesoId}?${queryString}`
      : `${this.baseEndpoint}/${request.procesoId}`;

    return await this.delete<DeleteProcesoResponseData>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene la jerarquía de procesos por organización
   * GET /api/Procesos/jerarquia?organizacionId={organizationId}
   */
  async getJerarquiaProcesos(request: { organizacionId: number }): Promise<ApiResponse<GetJerarquiaProcesosResponseData>> {
    const url = `${this.baseEndpoint}/jerarquia?organizacionId=${request.organizacionId}`;
    return await this.get<GetJerarquiaProcesosResponseData>(url);
  }

  /**
   * Obtiene procesos activos
   * GET /api/Procesos/activos
   */
  async getProcesosActivos(): Promise<ApiResponse<GetProcesosActivosResponseData>> {
    const url = `${this.baseEndpoint}/activos`;
    return await this.get<GetProcesosActivosResponseData>(url);
  }

  /**
   * Obtiene procesos por categoría
   * GET /api/Procesos/categoria/{categoriaId}
   */
  async getProcesosByCategoria(request: GetProcesosByCategoriaRequest): Promise<ApiResponse<GetProcesosByCategoriaResponseData>> {
    const url = `${this.baseEndpoint}/categoria/${request.categoriaProcesoId}`;
    return await this.get<GetProcesosByCategoriaResponseData>(url);
  }

  /**
   * Obtiene estadísticas de procesos
   * GET /api/Procesos/estadisticas
   */
  async getEstadisticasProcesos(): Promise<ApiResponse<GetEstadisticasProcesosResponseData>> {
    const url = `${this.baseEndpoint}/estadisticas`;
    return await this.get<GetEstadisticasProcesosResponseData>(url);
  }

  // ===== OPERACIONES CRUD DE ACTIVIDADES =====

  /**
   * Obtiene todas las actividades de un proceso
   * GET /api/Procesos/{procesoId}/actividades
   */
  async getProcesoActividades(request: GetProcesoActividadesRequest): Promise<ApiResponse<GetProcesoActividadesResponseData>> {
    const url = `${this.baseEndpoint}/${request.procesoId}/actividades`;
    const params = new URLSearchParams();
    
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    
    const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;
    return await this.get<GetProcesoActividadesResponseData>(finalUrl);
  }

  /**
   * Crea una actividad para un proceso
   * POST /api/Procesos/{procesoId}/actividades
   */
  async createProcesoActividad(request: CreateProcesoActividadRequest): Promise<ApiResponse<CreateProcesoActividadResponseData>> {
    const url = `${this.baseEndpoint}/${request.procesoId}/actividades`;
    return await this.post<CreateProcesoActividadResponseData>(url, request);
  }

  /**
   * Actualiza una actividad de proceso existente
   * PUT /api/Procesos/{procesoId}/actividades/{actividadId}
   */
  async updateProcesoActividad(request: UpdateProcesoActividadRequest): Promise<ApiResponse<UpdateProcesoActividadResponseData>> {
    const url = `${this.baseEndpoint}/${request.procesoId}/actividades/${request.procesoActividadId}`;
    return await this.put<UpdateProcesoActividadResponseData>(url, request);
  }

  /**
   * Elimina una actividad de proceso
   * DELETE /api/Procesos/{procesoId}/actividades/{actividadId}
   */
  async deleteProcesoActividad(request: DeleteProcesoActividadRequest): Promise<ApiResponse<DeleteProcesoActividadResponseData>> {
    const url = `${this.baseEndpoint}/${request.procesoId}/actividades/${request.actividadId}`;
    return await this.delete<DeleteProcesoActividadResponseData>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca procesos por término general
   */
  async searchProcesos(
    searchTerm: string, 
    filters?: ProcesosFilters,
    pagination?: ProcesosPaginationOptions,
    sort?: ProcesosSortOptions
  ): Promise<ApiResponse<ProcesosPaginatedResponseData>> {
    const request: GetProcesosPaginatedRequest = {
      // Buscar en múltiples campos
      codigo: searchTerm,
      nombre: searchTerm,
      
      // Aplicar filtros adicionales
      ...filters,
      
      // Aplicar paginación
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 10,
      
      // Aplicar ordenamiento
      orderBy: sort?.orderBy || 'fechaCreacion',
      ascending: sort?.ascending !== undefined ? sort.ascending : false
    };

    return await this.getProcesosPaginated(request);
  }

  /**
   * Obtiene procesos por estado
   */
  async getProcesosByEstado(estado: number, organizacionId?: number): Promise<ApiResponse<GetAllProcesosResponseData>> {
    const request: GetAllProcesosRequest = {
      organizacionId,
      includeDeleted: false
    };

    const response = await this.getAllProcesos(request);
    
    if (response.success && response.data) {
      const filteredData = response.data.filter(item => item.estado === estado);
      
      return {
        success: true,
        data: filteredData,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener procesos por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene procesos raíz (sin proceso padre)
   */
  async getProcesosRaiz(organizacionId?: number): Promise<ApiResponse<GetAllProcesosResponseData>> {
    const request: GetAllProcesosRequest = {
      organizacionId,
      soloProcesosRaiz: true,
      includeDeleted: false
    };

    return await this.getAllProcesos(request);
  }

  /**
   * Obtiene subprocesos de un proceso dado
   */
  async getSubProcesos(procesoParentId: number): Promise<ApiResponse<GetAllProcesosResponseData>> {
    const request: GetProcesosPaginatedRequest = {
      procesoParentId,
      estado: 1, // Solo activos
      pageSize: 1000 // Obtener todos
    };

    const response = await this.getProcesosPaginated(request);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener subprocesos',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Verifica si existe un proceso con el código dado
   */
  async existeProcesoConCodigo(codigo: string, organizacionId?: number): Promise<ApiResponse<boolean>> {
    const request: GetProcesosPaginatedRequest = {
      codigo,
      pageSize: 1,
      organizacionId
    };

    const response = await this.getProcesosPaginated(request);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.totalCount > 0,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: false,
      message: response.message || 'Error al verificar código',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene procesos por versión
   */
  async getProcesosByVersion(version: string): Promise<ApiResponse<GetAllProcesosResponseData>> {
    const request: GetProcesosPaginatedRequest = {
      version,
      estado: 1, // Solo activos
      pageSize: 1000 // Obtener todos
    };

    const response = await this.getProcesosPaginated(request);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener procesos por versión',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene procesos recientes (últimos creados)
   */
  async getProcesosRecientes(limit: number = 10): Promise<ApiResponse<GetAllProcesosResponseData>> {
    const request: GetProcesosPaginatedRequest = {
      estado: 1, // Solo activos
      pageSize: limit,
      orderBy: 'fechaCreacion',
      ascending: false // Más recientes primero
    };

    const response = await this.getProcesosPaginated(request);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener procesos recientes',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * ✅ BULK IMPORT: Importación masiva de procesos con actividades
   * POST /api/Procesos/bulk
   */
  async bulkImport(request: BulkImportProcesosRequest): Promise<BulkImportProcesosResponse> {
    const response = await this.post<BulkImportProcesosResponseData>(
      `${this.baseEndpoint}/bulk`,
      request
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: {} as BulkImportProcesosResponseData,
      message: response.message || 'Error en la importación masiva',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }
}

// Instancia singleton del servicio
export const procesosService = new ProcesosService();