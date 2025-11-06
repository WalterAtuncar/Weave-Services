/**
 * Servicio para gestión de Tipos de Sistema
 * Implementa todos los endpoints del controlador TipoSistemaController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  TipoSistema,
  
  // Requests
  GetAllTiposSistemaRequest,
  GetTipoSistemaByIdRequest,
  GetTipoSistemaByCodigoRequest,
  CreateTipoSistemaRequest,
  UpdateTipoSistemaRequest,
  DeleteTipoSistemaRequest,
  
  // Responses
  GetAllTiposSistemaResponseData,
  GetTipoSistemaByIdResponseData,
  GetTipoSistemaByCodigoResponseData,
  CreateTipoSistemaResponseData,
  UpdateTipoSistemaResponseData,
  DeleteTipoSistemaResponseData,
  GetTiposSistemaActivosResponseData,
  
  // Tipos auxiliares
  TipoSistemaFilters,
  TipoSistemaSortOptions
} from './types/tipo-sistema.types';

export class TipoSistemaService extends BaseApiService {
  protected baseEndpoint = '/TipoSistema';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los tipos de sistema
   * GET /api/TipoSistema
   */
  async getAllTiposSistema(request?: GetAllTiposSistemaRequest): Promise<ApiResponse<GetAllTiposSistemaResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<GetAllTiposSistemaResponseData>(url);
  }

  /**
   * Obtiene un tipo de sistema por ID
   * GET /api/TipoSistema/{id}
   */
  async getTipoSistemaById(request: GetTipoSistemaByIdRequest): Promise<ApiResponse<GetTipoSistemaByIdResponseData>> {
    const url = `${this.baseEndpoint}/${request.tipoSistemaId}`;
    return await this.get<GetTipoSistemaByIdResponseData>(url);
  }

  /**
   * Obtiene un tipo de sistema por código
   * GET /api/TipoSistema/codigo/{codigo}
   */
  async getTipoSistemaByCodigo(request: GetTipoSistemaByCodigoRequest): Promise<ApiResponse<GetTipoSistemaByCodigoResponseData>> {
    const url = `${this.baseEndpoint}/codigo/${encodeURIComponent(request.codigo)}`;
    return await this.get<GetTipoSistemaByCodigoResponseData>(url);
  }

  /**
   * Crea un nuevo tipo de sistema
   * POST /api/TipoSistema
   */
  async createTipoSistema(request: CreateTipoSistemaRequest): Promise<ApiResponse<CreateTipoSistemaResponseData>> {
    return await this.post<CreateTipoSistemaResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza un tipo de sistema existente
   * PUT /api/TipoSistema/{id}
   */
  async updateTipoSistema(request: UpdateTipoSistemaRequest): Promise<ApiResponse<UpdateTipoSistemaResponseData>> {
    const url = `${this.baseEndpoint}/${request.tipoSistemaId}`;
    return await this.put<UpdateTipoSistemaResponseData>(url, request);
  }

  /**
   * Elimina un tipo de sistema
   * DELETE /api/TipoSistema/{id}
   */
  async deleteTipoSistema(request: DeleteTipoSistemaRequest): Promise<ApiResponse<DeleteTipoSistemaResponseData>> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.tipoSistemaId}?${queryString}`
      : `${this.baseEndpoint}/${request.tipoSistemaId}`;

    return await this.delete<DeleteTipoSistemaResponseData>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene tipos de sistema activos
   * GET /api/TipoSistema/activos
   */
  async getTiposSistemaActivos(): Promise<ApiResponse<GetTiposSistemaActivosResponseData>> {
    const url = `${this.baseEndpoint}/activos`;
    return await this.get<GetTiposSistemaActivosResponseData>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca tipos de sistema por término
   */
  async searchTiposSistema(
    searchTerm: string, 
    filters?: TipoSistemaFilters,
    sort?: TipoSistemaSortOptions
  ): Promise<ApiResponse<GetAllTiposSistemaResponseData>> {
    const response = await this.getAllTiposSistema();
    
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
          const aValue = a[field as keyof TipoSistema];
          const bValue = b[field as keyof TipoSistema];
          
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
   * Verifica si existe un tipo de sistema con el código dado
   */
  async existeTipoSistemaConCodigo(codigo: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getTipoSistemaByCodigo({ codigo });
      
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
   * Obtiene tipos de sistema por estado
   */
  async getTiposSistemaByEstado(estado: number): Promise<ApiResponse<GetAllTiposSistemaResponseData>> {
    const response = await this.getAllTiposSistema();
    
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
      message: response.message || 'Error al obtener tipos de sistema por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }
}

// Instancia singleton del servicio
export const tipoSistemaService = new TipoSistemaService(); 