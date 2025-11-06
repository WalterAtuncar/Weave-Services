/**
 * Servicio para gestión de Tipos de Acción Workflow
 * Implementa todos los endpoints del controlador TipoAccionWorkflowController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  TipoAccionWorkflow,
  
  // Requests
  GetAllTiposAccionWorkflowRequest,
  GetTipoAccionWorkflowByIdRequest,
  GetTipoAccionWorkflowByCodigoRequest,
  CreateTipoAccionWorkflowRequest,
  UpdateTipoAccionWorkflowRequest,
  DeleteTipoAccionWorkflowRequest,
  
  // Responses
  GetAllTiposAccionWorkflowResponseData,
  GetTipoAccionWorkflowByIdResponseData,
  GetTipoAccionWorkflowByCodigoResponseData,
  CreateTipoAccionWorkflowResponseData,
  UpdateTipoAccionWorkflowResponseData,
  DeleteTipoAccionWorkflowResponseData,
  GetTiposAccionWorkflowActivosResponseData,
  
  // Tipos auxiliares
  TipoAccionWorkflowFilters,
  TipoAccionWorkflowSortOptions
} from './types/tipo-accion-workflow.types';

export class TipoAccionWorkflowService extends BaseApiService {
  protected baseEndpoint = '/TipoAccionWorkflow';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los tipos de acción workflow
   * GET /api/TipoAccionWorkflow
   */
  async getAllTiposAccionWorkflow(request?: GetAllTiposAccionWorkflowRequest): Promise<ApiResponse<GetAllTiposAccionWorkflowResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<GetAllTiposAccionWorkflowResponseData>(url);
  }

  /**
   * Obtiene un tipo de acción workflow por ID
   * GET /api/TipoAccionWorkflow/{id}
   */
  async getTipoAccionWorkflowById(request: GetTipoAccionWorkflowByIdRequest): Promise<ApiResponse<GetTipoAccionWorkflowByIdResponseData>> {
    const url = `${this.baseEndpoint}/${request.tipoAccionWorkflowId}`;
    return await this.get<GetTipoAccionWorkflowByIdResponseData>(url);
  }

  /**
   * Obtiene un tipo de acción workflow por código
   * GET /api/TipoAccionWorkflow/codigo/{codigo}
   */
  async getTipoAccionWorkflowByCodigo(request: GetTipoAccionWorkflowByCodigoRequest): Promise<ApiResponse<GetTipoAccionWorkflowByCodigoResponseData>> {
    const url = `${this.baseEndpoint}/codigo/${encodeURIComponent(request.codigo)}`;
    return await this.get<GetTipoAccionWorkflowByCodigoResponseData>(url);
  }

  /**
   * Crea un nuevo tipo de acción workflow
   * POST /api/TipoAccionWorkflow
   */
  async createTipoAccionWorkflow(request: CreateTipoAccionWorkflowRequest): Promise<ApiResponse<CreateTipoAccionWorkflowResponseData>> {
    return await this.post<CreateTipoAccionWorkflowResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza un tipo de acción workflow existente
   * PUT /api/TipoAccionWorkflow/{id}
   */
  async updateTipoAccionWorkflow(request: UpdateTipoAccionWorkflowRequest): Promise<ApiResponse<UpdateTipoAccionWorkflowResponseData>> {
    const url = `${this.baseEndpoint}/${request.tipoAccionWorkflowId}`;
    return await this.put<UpdateTipoAccionWorkflowResponseData>(url, request);
  }

  /**
   * Elimina un tipo de acción workflow
   * DELETE /api/TipoAccionWorkflow/{id}
   */
  async deleteTipoAccionWorkflow(request: DeleteTipoAccionWorkflowRequest): Promise<ApiResponse<DeleteTipoAccionWorkflowResponseData>> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.tipoAccionWorkflowId}?${queryString}`
      : `${this.baseEndpoint}/${request.tipoAccionWorkflowId}`;

    return await this.delete<DeleteTipoAccionWorkflowResponseData>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene tipos de acción workflow activos
   * GET /api/TipoAccionWorkflow/activos
   */
  async getTiposAccionWorkflowActivos(): Promise<ApiResponse<GetTiposAccionWorkflowActivosResponseData>> {
    const url = `${this.baseEndpoint}/activos`;
    return await this.get<GetTiposAccionWorkflowActivosResponseData>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca tipos de acción workflow por término
   */
  async searchTiposAccionWorkflow(
    searchTerm: string, 
    filters?: TipoAccionWorkflowFilters,
    sort?: TipoAccionWorkflowSortOptions
  ): Promise<ApiResponse<GetAllTiposAccionWorkflowResponseData>> {
    const response = await this.getAllTiposAccionWorkflow();
    
    if (response.success && response.data) {
      let filteredData = response.data;

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.codigo.toLowerCase().includes(term) ||
          item.nombre.toLowerCase().includes(term) ||
          (item.descripcion && item.descripcion.toLowerCase().includes(term))
        );
      }

      // Aplicar filtros adicionales
      if (filters?.estado !== undefined) {
        filteredData = filteredData.filter(item => item.estado === filters.estado);
      }

      // Aplicar ordenamiento
      if (sort?.orderBy) {
        filteredData.sort((a, b) => {
          const field = sort.orderBy!;
          const aValue = a[field as keyof TipoAccionWorkflow];
          const bValue = b[field as keyof TipoAccionWorkflow];
          
          if (aValue < bValue) return sort.ascending ? -1 : 1;
          if (aValue > bValue) return sort.ascending ? 1 : -1;
          return 0;
        });
      }

      return {
        success: true,
        data: filteredData,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return response;
  }

  /**
   * Verifica si existe un tipo de acción workflow con el código dado
   */
  async existeTipoAccionWorkflowConCodigo(codigo: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getTipoAccionWorkflowByCodigo({ codigo });
      
      return {
        success: true,
        data: response.success && !!response.data,
        message: response.success ? 'Código encontrado' : 'Código no encontrado',
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    } catch (error) {
      return {
        success: true,
        data: false,
        message: 'Código no encontrado',
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    }
  }

  /**
   * Obtiene tipos de acción workflow por estado
   */
  async getTiposAccionWorkflowByEstado(estado: number): Promise<ApiResponse<GetAllTiposAccionWorkflowResponseData>> {
    const response = await this.getAllTiposAccionWorkflow();
    
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
      message: response.message || 'Error al obtener tipos de acción workflow por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }
}

// Instancia singleton del servicio
export const tipoAccionWorkflowService = new TipoAccionWorkflowService(); 