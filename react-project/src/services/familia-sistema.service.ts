/**
 * Servicio para gestión de Familias de Sistema
 * Implementa todos los endpoints del controlador FamiliaSistemaController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  FamiliaSistema,
  
  // Requests
  GetAllFamiliasSistemaRequest,
  GetFamiliaSistemaByIdRequest,
  CreateFamiliaSistemaRequest,
  UpdateFamiliaSistemaRequest,
  DeleteFamiliaSistemaRequest,
  
  // Responses
  GetAllFamiliasSistemaResponseData,
  GetFamiliaSistemaByIdResponseData,
  CreateFamiliaSistemaResponseData,
  UpdateFamiliaSistemaResponseData,
  DeleteFamiliaSistemaResponseData,
  GetFamiliasSistemaActivasResponseData,
  
  // Tipos auxiliares
  FamiliaSistemaFilters,
  FamiliaSistemaSortOptions
} from './types/familia-sistema.types';

export class FamiliaSistemaService extends BaseApiService {
  protected baseEndpoint = '/FamiliaSistema';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todas las familias de sistema
   * GET /api/FamiliaSistema
   */
  async getAllFamiliasSistema(request?: GetAllFamiliasSistemaRequest & { organizationId?: number }): Promise<ApiResponse<GetAllFamiliasSistemaResponseData>> {
    const params = new URLSearchParams();
    
    // Agregar organizationId si se proporciona (opcional para mantener compatibilidad)
    if (request?.organizationId !== undefined) {
      params.append('organizationId', request.organizationId.toString());
    }
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<GetAllFamiliasSistemaResponseData>(url);
  }

  /**
   * Obtiene una familia de sistema por ID
   * GET /api/FamiliaSistema/{id}
   */
  async getFamiliaSistemaById(request: GetFamiliaSistemaByIdRequest): Promise<ApiResponse<GetFamiliaSistemaByIdResponseData>> {
    const url = `${this.baseEndpoint}/${request.familiaSistemaId}`;
    return await this.get<GetFamiliaSistemaByIdResponseData>(url);
  }

  /**
   * Crea una nueva familia de sistema
   * POST /api/FamiliaSistema
   */
  async createFamiliaSistema(request: CreateFamiliaSistemaRequest): Promise<ApiResponse<CreateFamiliaSistemaResponseData>> {
    return await this.post<CreateFamiliaSistemaResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza una familia de sistema existente
   * PUT /api/FamiliaSistema/{id}
   */
  async updateFamiliaSistema(request: UpdateFamiliaSistemaRequest): Promise<ApiResponse<UpdateFamiliaSistemaResponseData>> {
    const url = `${this.baseEndpoint}/${request.familiaSistemaId}`;
    return await this.put<UpdateFamiliaSistemaResponseData>(url, request);
  }

  /**
   * Elimina una familia de sistema
   * DELETE /api/FamiliaSistema/{id}
   */
  async deleteFamiliaSistema(request: DeleteFamiliaSistemaRequest): Promise<ApiResponse<DeleteFamiliaSistemaResponseData>> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.familiaSistemaId}?${queryString}`
      : `${this.baseEndpoint}/${request.familiaSistemaId}`;

    return await this.delete<DeleteFamiliaSistemaResponseData>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca familias de sistema por término
   */
  async searchFamiliasSistema(
    searchTerm: string, 
    filters?: FamiliaSistemaFilters,
    sort?: FamiliaSistemaSortOptions
  ): Promise<ApiResponse<GetAllFamiliasSistemaResponseData>> {
    const response = await this.getAllFamiliasSistema();
    
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
          const aValue = a[field as keyof FamiliaSistema];
          const bValue = b[field as keyof FamiliaSistema];
          
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
   * Verifica si existe una familia de sistema con el código dado
   */
  async existeFamiliaSistemaConCodigo(codigo: string): Promise<ApiResponse<boolean>> {
    const response = await this.getAllFamiliasSistema();
    
    if (response.success && response.data) {
      const found = response.data.some(item => item.codigo === codigo);
      
      return {
        success: true,
        data: found,
        message: found ? 'Código encontrado' : 'Código no encontrado',
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    }

    return {
      success: false,
      data: false,
      message: 'Error al verificar código',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: ''
    };
  }

  /**
   * Obtiene familias de sistema por estado
   */
  async getFamiliasSistemaByEstado(estado: number): Promise<ApiResponse<GetAllFamiliasSistemaResponseData>> {
    const response = await this.getAllFamiliasSistema();
    
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
      message: response.message || 'Error al obtener familias de sistema por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene familias de sistema activas para selects/dropdowns
   * GET /api/FamiliaSistema/activas
   */
  async getFamiliasSistemaActivas(): Promise<ApiResponse<GetFamiliasSistemaActivasResponseData>> {
    const url = `${this.baseEndpoint}/activas`;
    return await this.get<GetFamiliasSistemaActivasResponseData>(url);
  }

  /**
   * Obtiene familias de sistema activas filtradas por organización
   * GET /api/FamiliaSistema/activas?organizationId={organizationId}
   */
  async getFamiliasSistemaActivasByOrganizacion(organizationId: number): Promise<ApiResponse<GetFamiliasSistemaActivasResponseData>> {
    const params = new URLSearchParams();
    params.append('organizationId', organizationId.toString());
    
    const url = `${this.baseEndpoint}/activas?${params.toString()}`;
    return await this.get<GetFamiliasSistemaActivasResponseData>(url);
  }

  /**
   * Obtiene familias de sistema activas (alternativa usando filtro)
   */
  async getFamiliasSistemaActivasPorEstado(): Promise<ApiResponse<GetAllFamiliasSistemaResponseData>> {
    return await this.getFamiliasSistemaByEstado(1);
  }
}

// Instancia singleton del servicio
export const familiaSistemaService = new FamiliaSistemaService();