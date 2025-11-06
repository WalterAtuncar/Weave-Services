/**
 * Servicio para gestión de relaciones Organización-Familia Sistema
 * Implementa todos los endpoints del controlador OrganizacionFamiliaSistemaController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  OrganizacionFamiliaSistema,
  
  // Requests
  GetAllOrganizacionFamiliaSistemaRequest,
  GetOrganizacionFamiliaSistemaByOrganizacionIdRequest,
  GetOrganizacionFamiliaSistemaByFamiliaSistemaIdRequest,
  CreateOrganizacionFamiliaSistemaRequest,
  DeleteOrganizacionFamiliaSistemaRequest,
  
  // Responses
  GetAllOrganizacionFamiliaSistemaResponseData,
  GetOrganizacionFamiliaSistemaByOrganizacionIdResponseData,
  GetOrganizacionFamiliaSistemaByFamiliaSistemaIdResponseData,
  CreateOrganizacionFamiliaSistemaResponseData,
  DeleteOrganizacionFamiliaSistemaResponseData,
  GetFamiliasSistemaAsignadasResponseData,
  GetFamiliasSistemaDisponiblesResponseData,
  
  // Tipos auxiliares
  FamiliaSistemaAsignada,
  FamiliaSistemaDisponible,
  OrganizacionFamiliaSistemaFilters,
  OrganizacionFamiliaSistemaSortOptions
} from './types/organizacion-familia-sistema.types';

import { familiaSistemaService } from './familia-sistema.service';
import { FamiliaSistema } from './types/familia-sistema.types';

export class OrganizacionFamiliaSistemaService extends BaseApiService {
  protected baseEndpoint = '/OrganizacionFamiliaSistema';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todas las relaciones organización-familia sistema
   * GET /api/OrganizacionFamiliaSistema
   */
  async getAllOrganizacionFamiliaSistema(request?: GetAllOrganizacionFamiliaSistemaRequest): Promise<ApiResponse<GetAllOrganizacionFamiliaSistemaResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<GetAllOrganizacionFamiliaSistemaResponseData>(url);
  }

  /**
   * Obtiene relaciones por ID de organización
   * GET /api/OrganizacionFamiliaSistema/organizacion/{organizacionId}
   */
  async getOrganizacionFamiliaSistemaByOrganizacionId(request: GetOrganizacionFamiliaSistemaByOrganizacionIdRequest): Promise<ApiResponse<GetOrganizacionFamiliaSistemaByOrganizacionIdResponseData>> {
    const url = `${this.baseEndpoint}/organizacion/${request.organizacionId}`;
    return await this.get<GetOrganizacionFamiliaSistemaByOrganizacionIdResponseData>(url);
  }

  /**
   * Obtiene relaciones por ID de familia sistema
   * GET /api/OrganizacionFamiliaSistema/familia-sistema/{familiaSistemaId}
   */
  async getOrganizacionFamiliaSistemaByFamiliaSistemaId(request: GetOrganizacionFamiliaSistemaByFamiliaSistemaIdRequest): Promise<ApiResponse<GetOrganizacionFamiliaSistemaByFamiliaSistemaIdResponseData>> {
    const url = `${this.baseEndpoint}/familia-sistema/${request.familiaSistemaId}`;
    return await this.get<GetOrganizacionFamiliaSistemaByFamiliaSistemaIdResponseData>(url);
  }

  /**
   * Crea una nueva relación organización-familia sistema
   * POST /api/OrganizacionFamiliaSistema
   */
  async createOrganizacionFamiliaSistema(request: CreateOrganizacionFamiliaSistemaRequest): Promise<ApiResponse<CreateOrganizacionFamiliaSistemaResponseData>> {
    return await this.post<CreateOrganizacionFamiliaSistemaResponseData>(this.baseEndpoint, request);
  }

  /**
   * Elimina una relación organización-familia sistema
   * DELETE /api/OrganizacionFamiliaSistema/{organizacionId}/{familiaSistemaId}
   */
  async deleteOrganizacionFamiliaSistema(request: DeleteOrganizacionFamiliaSistemaRequest): Promise<ApiResponse<DeleteOrganizacionFamiliaSistemaResponseData>> {
    const url = `${this.baseEndpoint}/${request.organizacionId}/${request.familiaSistemaId}`;
    return await this.delete<DeleteOrganizacionFamiliaSistemaResponseData>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Obtiene familias de sistema asignadas a una organización con información completa
   * Combina datos de OrganizacionFamiliaSistema con FamiliaSistema
   */
  async getFamiliasSistemaAsignadas(organizacionId: number): Promise<ApiResponse<GetFamiliasSistemaAsignadasResponseData>> {
    try {
      // Obtener relaciones de la organización
      const relacionesResponse = await this.getOrganizacionFamiliaSistemaByOrganizacionId({ organizacionId });
      
      if (!relacionesResponse.success || !relacionesResponse.data) {
        return {
          success: false,
          data: [],
          message: relacionesResponse.message || 'Error al obtener familias asignadas',
          errors: relacionesResponse.errors || [],
          statusCode: relacionesResponse.statusCode || 500,
          metadata: relacionesResponse.metadata || ''
        };
      }

      // Obtener todas las familias de sistema para combinar información
      const familiasResponse = await familiaSistemaService.getAllFamiliasSistema();
      
      if (!familiasResponse.success || !familiasResponse.data) {
        return {
          success: false,
          data: [],
          message: 'Error al obtener información de familias de sistema',
          errors: familiasResponse.errors || [],
          statusCode: familiasResponse.statusCode || 500,
          metadata: familiasResponse.metadata || ''
        };
      }

      // Combinar datos
      const familiasAsignadas: FamiliaSistemaAsignada[] = relacionesResponse.data.map(relacion => {
        const familia = familiasResponse.data!.find(f => f.familiaSistemaId === relacion.familiaSistemaId);
        return {
          id: relacion.familiaSistemaId,
          codigo: familia?.familiaSistemaCodigo || '',
          nombre: familia?.familiaSistemaNombre || '',
          descripcion: familia?.familiaSistemaDescripcion,
          fechaAsignacion: relacion.fechaCreacion,
          organizacionId: relacion.organizacionId
        };
      });

      return {
        success: true,
        data: familiasAsignadas,
        message: 'Familias asignadas obtenidas exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'Error interno al obtener familias asignadas',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Obtiene familias de sistema disponibles (no asignadas) para una organización
   * Excluye las familias ya asignadas a la organización
   */
  async getFamiliasSistemaDisponibles(organizacionId: number): Promise<ApiResponse<GetFamiliasSistemaDisponiblesResponseData>> {
    try {
      // Obtener todas las familias de sistema
      const todasFamiliasResponse = await familiaSistemaService.getAllFamiliasSistema();
      
      if (!todasFamiliasResponse.success || !todasFamiliasResponse.data) {
        return {
          success: false,
          data: [],
          message: 'Error al obtener familias de sistema',
          errors: todasFamiliasResponse.errors || [],
          statusCode: todasFamiliasResponse.statusCode || 500,
          metadata: todasFamiliasResponse.metadata || ''
        };
      }

      // Obtener familias ya asignadas
      const familiasAsignadasResponse = await this.getOrganizacionFamiliaSistemaByOrganizacionId({ organizacionId });
      
      const idsAsignados = familiasAsignadasResponse.success && familiasAsignadasResponse.data 
        ? familiasAsignadasResponse.data.map(relacion => relacion.familiaSistemaId)
        : [];

      // Filtrar familias disponibles (no asignadas)
      const familiasDisponibles: FamiliaSistemaDisponible[] = todasFamiliasResponse.data
        .filter(familia => !idsAsignados.includes(familia.familiaSistemaId))
        .map(familia => ({
          id: familia.familiaSistemaId,
          codigo: familia.familiaSistemaCodigo,
          nombre: familia.familiaSistemaNombre,
          descripcion: familia.familiaSistemaDescripcion,
          estado: familia.estado
        }));

      return {
        success: true,
        data: familiasDisponibles,
        message: 'Familias disponibles obtenidas exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'Error interno al obtener familias disponibles',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Verifica si una familia de sistema está asignada a una organización
   */
  async isFamiliaSistemaAsignada(organizacionId: number, familiaSistemaId: number): Promise<boolean> {
    try {
      const response = await this.getOrganizacionFamiliaSistemaByOrganizacionId({ organizacionId });
      
      if (response.success && response.data) {
        return response.data.some(relacion => relacion.familiaSistemaId === familiaSistemaId);
      }
      
      return false;
    } catch (error) {
      console.error('Error al verificar asignación de familia sistema:', error);
      return false;
    }
  }

  /**
   * Busca relaciones por filtros
   */
  async searchOrganizacionFamiliaSistema(
    filters?: OrganizacionFamiliaSistemaFilters,
    sort?: OrganizacionFamiliaSistemaSortOptions
  ): Promise<ApiResponse<GetAllOrganizacionFamiliaSistemaResponseData>> {
    const response = await this.getAllOrganizacionFamiliaSistema();
    
    if (response.success && response.data) {
      let filteredData = response.data;

      // Aplicar filtros
      if (filters?.organizacionId !== undefined) {
        filteredData = filteredData.filter(item => item.organizacionId === filters.organizacionId);
      }
      
      if (filters?.familiaSistemaId !== undefined) {
        filteredData = filteredData.filter(item => item.familiaSistemaId === filters.familiaSistemaId);
      }

      if (filters?.fechaCreacionDesde) {
        filteredData = filteredData.filter(item => 
          new Date(item.fechaCreacion) >= new Date(filters.fechaCreacionDesde!)
        );
      }

      if (filters?.fechaCreacionHasta) {
        filteredData = filteredData.filter(item => 
          new Date(item.fechaCreacion) <= new Date(filters.fechaCreacionHasta!)
        );
      }

      // Aplicar ordenamiento
      if (sort?.orderBy) {
        filteredData.sort((a, b) => {
          const field = sort.orderBy!;
          const aValue = a[field as keyof OrganizacionFamiliaSistema];
          const bValue = b[field as keyof OrganizacionFamiliaSistema];
          
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
}

// Instancia singleton del servicio
export const organizacionFamiliaSistemaService = new OrganizacionFamiliaSistemaService();