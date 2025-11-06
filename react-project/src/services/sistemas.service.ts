/**
 * Servicio para gestión de Sistemas
 * Implementa todos los endpoints del controlador SistemasController
 * Incluye CRUD completo, estadísticas, módulos y filtros avanzados
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { apiCache } from '../utils/cache.utils';
import {
  // Tipos de entidades
  Sistema,
  SistemaCompleto,
  SistemaModulo,
  
  // Requests
  GetAllSistemasRequest,
  GetSistemaByIdRequest,
  GetSistemaCompletoRequest,
  GetSistemasPaginatedRequest,
  CreateSistemaRequest,
  UpdateSistemaRequest,
  DeleteSistemaRequest,
  GetSistemasByFamiliaRequest,
  CreateSistemaModuloRequest,
  UpdateSistemaModuloRequest,
  DeleteSistemaModuloRequest,
  GetSistemaModulosRequest,
  
  // Responses
  GetAllSistemasResponseData,
  GetSistemaByIdResponseData,
  GetSistemaCompletoResponseData,
  SistemasPaginatedResponseData,
  CreateSistemaResponseData,
  UpdateSistemaResponseData,
  DeleteSistemaResponseData,
  GetSistemasActivosResponseData,
  GetSistemasByFamiliaResponseData,
  GetSistemaModulosResponseData,
  CreateSistemaModuloResponseData,
  UpdateSistemaModuloResponseData,
  DeleteSistemaModuloResponseData,
  GetEstadisticasSistemasResponseData,
  
  // Tipos auxiliares
  SistemasFilters,
  SistemasSortOptions,
  SistemasPaginationOptions,
  
  // Bulk Import Types
  BulkImportRequest,
  BulkImportResponse,
  BulkImportResponseData
} from './types/sistemas.types';

export class SistemasService extends BaseApiService {
  protected baseEndpoint = '/Sistemas';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los sistemas
   * GET /api/Sistemas
   */
  async getAllSistemas(request?: GetAllSistemasRequest): Promise<ApiResponse<GetAllSistemasResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request?.organizacionId !== undefined) {
      params.append('organizacionId', request.organizacionId.toString());
    }
    if (request?.soloSistemasRaiz !== undefined) {
      params.append('soloSistemasRaiz', request.soloSistemasRaiz.toString());
    }
    if (request?.soloConGobernanzaPropia !== undefined) {
      params.append('soloConGobernanzaPropia', request.soloConGobernanzaPropia.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<GetAllSistemasResponseData>(url);
  }

  /**
   * Obtiene un sistema por ID
   * GET /api/Sistemas/{id}
   */
  async getSistemaById(request: GetSistemaByIdRequest): Promise<ApiResponse<GetSistemaByIdResponseData>> {
    const url = `${this.baseEndpoint}/${request.sistemaId}`;
    return await this.get<GetSistemaByIdResponseData>(url);
  }

  /**
   * Obtiene información completa de un sistema
   * GET /api/Sistemas/{id}/completo
   */
  async getSistemaCompleto(request: GetSistemaCompletoRequest): Promise<ApiResponse<GetSistemaCompletoResponseData>> {
    const url = `${this.baseEndpoint}/${request.sistemaId}/completo`;
    return await this.get<GetSistemaCompletoResponseData>(url);
  }

  /**
   * Búsqueda paginada de sistemas
   * GET /api/Sistemas/paginated
   */
  async getSistemasPaginated(request?: GetSistemasPaginatedRequest): Promise<ApiResponse<SistemasPaginatedResponseData>> {
    const params = new URLSearchParams();

    // Parámetros básicos de paginación según swagger
    if (request?.page !== undefined) params.append('Page', request.page.toString());
    if (request?.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
    if (request?.orderBy) params.append('OrderBy', request.orderBy);
    if (request?.ascending !== undefined) params.append('OrderDescending', (!request.ascending).toString());
    if (request?.includeDeleted !== undefined) params.append('IncludeDeleted', request.includeDeleted.toString());
    if (request?.organizacionId !== undefined) params.append('OrganizacionId', request.organizacionId.toString());

    // Filtros específicos según swagger
    if (request?.codigo) params.append('CodigoSistema', request.codigo);
    if (request?.nombre) params.append('NombreSistema', request.nombre);
    if (request?.estado !== undefined) params.append('Estado', request.estado.toString());
    if (request?.familiaSistemaId !== undefined) params.append('FamiliaSistemaId', request.familiaSistemaId.toString());
    if (request?.sistemaParentId !== undefined) params.append('SistemaDepende', request.sistemaParentId.toString());
    if (request?.soloSistemasRaiz !== undefined) params.append('SoloSistemasRaiz', request.soloSistemasRaiz.toString());
    
    // Búsqueda general
    if (request?.searchTerm) params.append('SearchTerm', request.searchTerm);

    const url = `${this.baseEndpoint}/paginated?${params.toString()}`;
    return await this.get<SistemasPaginatedResponseData>(url);
  }

  /**
   * Crea un nuevo sistema
   * POST /api/Sistemas
   */
  async createSistema(request: CreateSistemaRequest): Promise<ApiResponse<CreateSistemaResponseData>> {
    return await this.post<CreateSistemaResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza un sistema existente
   * PUT /api/Sistemas/{id}
   */
  async updateSistema(request: UpdateSistemaRequest): Promise<ApiResponse<UpdateSistemaResponseData>> {
    const url = `${this.baseEndpoint}/${request.sistemaId}`;
    return await this.put<UpdateSistemaResponseData>(url, request);
  }

  /**
   * Elimina un sistema
   * DELETE /api/Sistemas/{id}
   */
  async deleteSistema(request: DeleteSistemaRequest): Promise<ApiResponse<DeleteSistemaResponseData>> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.sistemaId}?${queryString}`
      : `${this.baseEndpoint}/${request.sistemaId}`;

    return await this.delete<DeleteSistemaResponseData>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene sistemas activos
   * GET /api/Sistemas/activos
   */
  async getSistemasActivos(): Promise<ApiResponse<GetSistemasActivosResponseData>> {
    const url = `${this.baseEndpoint}/activos`;
    return await this.get<GetSistemasActivosResponseData>(url);
  }

  /**
   * Obtiene sistemas por familia
   * GET /api/Sistemas/familia/{familiaId}
   */
  async getSistemasByFamilia(request: GetSistemasByFamiliaRequest): Promise<ApiResponse<GetSistemasByFamiliaResponseData>> {
    const url = `${this.baseEndpoint}/familia/${request.familiaSistemaId}`;
    return await this.get<GetSistemasByFamiliaResponseData>(url);
  }

  /**
   * Obtiene estadísticas de sistemas
   * GET /api/Sistemas/estadisticas
   */
  async getEstadisticasSistemas(): Promise<ApiResponse<GetEstadisticasSistemasResponseData>> {
    const url = `${this.baseEndpoint}/estadisticas`;
    return await this.get<GetEstadisticasSistemasResponseData>(url);
  }

  // ===== OPERACIONES CRUD DE MÓDULOS =====

  /**
   * Obtiene todos los módulos de un sistema
   * GET /api/Sistemas/{sistemaId}/modulos
   */
  async getSistemaModulos(request: GetSistemaModulosRequest): Promise<ApiResponse<GetSistemaModulosResponseData>> {
    const endpoint = 'getSistemaModulos';
    const params = {
      sistemaId: request.sistemaId,
      includeDeleted: request.includeDeleted || false
    };

    // Verificar si hay datos en cache
    const cachedData = apiCache.get<ApiResponse<GetSistemaModulosResponseData>>(endpoint, params);
    if (cachedData) {
      console.log('🎯 Cache hit para getSistemaModulos:', params);
      return cachedData;
    }

    // Verificar si hay una petición pendiente
    const pendingRequest = apiCache.getPendingRequest<ApiResponse<GetSistemaModulosResponseData>>(endpoint, params);
    if (pendingRequest) {
      console.log('⏳ Reutilizando petición pendiente para getSistemaModulos:', params);
      return pendingRequest;
    }

    // Crear nueva petición
    console.log('🔄 Nueva petición para getSistemaModulos:', params);
    const url = `${this.baseEndpoint}/${request.sistemaId}/modulos`;
    const urlParams = new URLSearchParams();
    
    if (request.includeDeleted !== undefined) {
      urlParams.append('includeDeleted', request.includeDeleted.toString());
    }
    
    const finalUrl = urlParams.toString() ? `${url}?${urlParams.toString()}` : url;
    
    // Crear y registrar la promesa
    const promise = this.get<GetSistemaModulosResponseData>(finalUrl);
    apiCache.setPendingRequest(endpoint, params, promise);

    try {
      const result = await promise;
      
      // Guardar en cache solo si la respuesta es exitosa
      if (result.success) {
        apiCache.set(endpoint, params, result, 2 * 60 * 1000); // Cache por 2 minutos
      }
      
      return result;
    } catch (error) {
      // No cachear errores
      throw error;
    }
  }

  /**
   * Crea un módulo para un sistema
   * POST /api/Sistemas/{sistemaId}/modulos
   */
  async createSistemaModulo(request: CreateSistemaModuloRequest): Promise<ApiResponse<CreateSistemaModuloResponseData>> {
    const url = `${this.baseEndpoint}/${request.sistemaId}/modulos`;
    const result = await this.post<CreateSistemaModuloResponseData>(url, request);
    
    // Invalidar cache de módulos para este sistema
    if (result.success) {
      apiCache.invalidate('getSistemaModulos', { 
        sistemaId: request.sistemaId, 
        includeDeleted: false 
      });
      apiCache.invalidate('getSistemaModulos', { 
        sistemaId: request.sistemaId, 
        includeDeleted: true 
      });
    }
    
    return result;
  }

  /**
   * Actualiza un módulo de sistema existente
   * PUT /api/Sistemas/{sistemaId}/modulos/{moduloId}
   */
  async updateSistemaModulo(request: UpdateSistemaModuloRequest): Promise<ApiResponse<UpdateSistemaModuloResponseData>> {
    const url = `${this.baseEndpoint}/${request.sistemaId}/modulos/${request.sistemaModuloId}`;
    const result = await this.put<UpdateSistemaModuloResponseData>(url, request);
    
    // Invalidar cache de módulos para este sistema
    if (result.success) {
      apiCache.invalidate('getSistemaModulos', { 
        sistemaId: request.sistemaId, 
        includeDeleted: false 
      });
      apiCache.invalidate('getSistemaModulos', { 
        sistemaId: request.sistemaId, 
        includeDeleted: true 
      });
    }
    
    return result;
  }

  /**
   * Elimina un módulo de sistema
   * DELETE /api/Sistemas/{sistemaId}/modulos/{moduloId}
   */
  async deleteSistemaModulo(request: DeleteSistemaModuloRequest): Promise<ApiResponse<DeleteSistemaModuloResponseData>> {
    const url = `${this.baseEndpoint}/${request.sistemaId}/modulos/${request.moduloId}`;
    const result = await this.delete<DeleteSistemaModuloResponseData>(url);
    
    // Invalidar cache de módulos para este sistema
    if (result.success) {
      apiCache.invalidate('getSistemaModulos', { 
        sistemaId: request.sistemaId, 
        includeDeleted: false 
      });
      apiCache.invalidate('getSistemaModulos', { 
        sistemaId: request.sistemaId, 
        includeDeleted: true 
      });
    }
    
    return result;
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca sistemas por término general
   */
  async searchSistemas(
    searchTerm: string, 
    filters?: SistemasFilters,
    pagination?: SistemasPaginationOptions,
    sort?: SistemasSortOptions
  ): Promise<ApiResponse<SistemasPaginatedResponseData>> {
    const request: GetSistemasPaginatedRequest = {
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

    return await this.getSistemasPaginated(request);
  }

  /**
   * Obtiene sistemas por estado
   */
  async getSistemasByEstado(estado: number, organizacionId?: number): Promise<ApiResponse<GetAllSistemasResponseData>> {
    const request: GetAllSistemasRequest = {
      organizacionId,
      includeDeleted: false
    };

    const response = await this.getAllSistemas(request);
    
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
      message: response.message || 'Error al obtener sistemas por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene sistemas raíz (sin sistema padre)
   */
  async getSistemasRaiz(organizacionId?: number): Promise<ApiResponse<GetAllSistemasResponseData>> {
    const request: GetAllSistemasRequest = {
      organizacionId,
      soloSistemasRaiz: true,
      includeDeleted: false
    };

    return await this.getAllSistemas(request);
  }

  /**
   * Obtiene subsistemas de un sistema dado
   */
  async getSubSistemas(sistemaParentId: number): Promise<ApiResponse<GetAllSistemasResponseData>> {
    const request: GetSistemasPaginatedRequest = {
      sistemaParentId,
      estado: 1, // Solo activos
      pageSize: 1000 // Obtener todos
    };

    const response = await this.getSistemasPaginated(request);
    
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
      message: response.message || 'Error al obtener subsistemas',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Verifica si existe un sistema con el código dado
   */
  async existeSistemaConCodigo(codigo: string, organizacionId?: number): Promise<ApiResponse<boolean>> {
    const request: GetSistemasPaginatedRequest = {
      codigo,
      pageSize: 1,
      organizacionId
    };

    const response = await this.getSistemasPaginated(request);
    
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
   * Obtiene sistemas por versión
   */
  async getSistemasByVersion(version: string): Promise<ApiResponse<GetAllSistemasResponseData>> {
    const request: GetSistemasPaginatedRequest = {
      version,
      estado: 1, // Solo activos
      pageSize: 1000 // Obtener todos
    };

    const response = await this.getSistemasPaginated(request);
    
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
      message: response.message || 'Error al obtener sistemas por versión',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene sistemas recientes (últimos creados)
   */
  async getSistemasRecientes(limit: number = 10): Promise<ApiResponse<GetAllSistemasResponseData>> {
    const request: GetSistemasPaginatedRequest = {
      estado: 1, // Solo activos
      pageSize: limit,
      orderBy: 'fechaCreacion',
      ascending: false // Más recientes primero
    };

    const response = await this.getSistemasPaginated(request);
    
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
      message: response.message || 'Error al obtener sistemas recientes',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * ✅ BULK IMPORT: Importación masiva de sistemas con módulos
   * POST /api/Sistemas/bulk
   */
  async bulkImport(request: BulkImportRequest): Promise<BulkImportResponse> {
    const response = await this.post<BulkImportResponseData>(
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
      data: {} as BulkImportResponseData,
      message: response.message || 'Error en la importación masiva',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }
}

// Instancia singleton del servicio
export const sistemasService = new SistemasService();