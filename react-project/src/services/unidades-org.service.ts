// ============================================================================
// UNIDADES ORGANIZACIONALES - SERVICE
// ============================================================================
// Servicio para gestionar unidades organizacionales
// Implementa todos los endpoints del API de UnidadesOrg

import { apiService } from './api.service';
import {
  // Tipos principales
  UnidadOrg,
  UnidadOrgDto,
  
  // Comandos
  CreateUnidadOrgCommand,
  UpdateUnidadOrgCommand,
  
  // Requests
  GetUnidadOrgRequest,
  GetUnidadesOrgRequest,
  GetUnidadOrgCompletaRequest,
  GetJerarquiaUnidadRequest,
  GetUnidadesPorOrganizacionRequest,
  GetArbolJerarquicoRequest,
  GetUnidadesRaizRequest,
  GetUnidadesHijasRequest,
  GetUnidadesPaginatedRequest,
  GetUnidadesPorTipoRequest,
  DeleteUnidadOrgRequest,
  
  // Responses
  GetUnidadOrgResponse,
  GetUnidadesOrgResponse,
  GetUnidadOrgDtoResponse,
  GetUnidadesOrgDtoResponse,
  CreateUnidadOrgResponse,
  UpdateUnidadOrgResponse,
  DeleteUnidadOrgResponse,
  UnidadesOrgPaginatedResponse,
  
  // Tipos auxiliares
  UnidadOrgFilters,
  SortOptions,
  PaginationOptions
} from './types/unidades-org.types';

// ============================================================================
// CLASE PRINCIPAL DEL SERVICIO
// ============================================================================

class UnidadesOrgService {
  private readonly baseUrl = '/UnidadesOrg';

  // ==========================================================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================================================

  /**
   * Obtiene una unidad organizacional por ID
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadOrgResponse>
   */
  async getUnidadOrg(request: GetUnidadOrgRequest): Promise<GetUnidadOrgResponse> {
    const params = new URLSearchParams();
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/${request.id}${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<GetUnidadOrgResponse>(url);
  }

  /**
   * Obtiene todas las unidades organizacionales con filtros
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getUnidadesOrg(request: GetUnidadesOrgRequest = {}): Promise<GetUnidadesOrgResponse> {
    const params = new URLSearchParams();
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request.organizacionId !== undefined) {
      params.append('organizacionId', request.organizacionId.toString());
    }
    if (request.tipoUnidad !== undefined) {
      params.append('tipoUnidad', request.tipoUnidad.toString());
    }
    if (request.unidadPadreId !== undefined) {
      params.append('unidadPadreId', request.unidadPadreId.toString());
    }
    if (request.soloUnidadesRaiz !== undefined) {
      params.append('soloUnidadesRaiz', request.soloUnidadesRaiz.toString());
    }
    if (request.soloUnidadesHoja !== undefined) {
      params.append('soloUnidadesHoja', request.soloUnidadesHoja.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<GetUnidadesOrgResponse>(url);
  }

  /**
   * Crea una nueva unidad organizacional
   * @param command - Datos de la unidad a crear
   * @returns Promise<CreateUnidadOrgResponse>
   */
  async createUnidadOrg(command: CreateUnidadOrgCommand): Promise<CreateUnidadOrgResponse> {
    return await apiService.post<CreateUnidadOrgResponse>(this.baseUrl, command);
  }

  /**
   * Actualiza una unidad organizacional existente
   * @param id - ID de la unidad a actualizar
   * @param command - Datos actualizados
   * @returns Promise<UpdateUnidadOrgResponse>
   */
  async updateUnidadOrg(id: number, command: UpdateUnidadOrgCommand): Promise<UpdateUnidadOrgResponse> {
    return await apiService.put<UpdateUnidadOrgResponse>(`${this.baseUrl}/${id}`, command);
  }

  /**
   * Elimina una unidad organizacional
   * @param request - Parámetros de eliminación
   * @returns Promise<DeleteUnidadOrgResponse>
   */
  async deleteUnidadOrg(request: DeleteUnidadOrgRequest): Promise<DeleteUnidadOrgResponse> {
    const params = new URLSearchParams();
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.eliminarUnidadesHijas !== undefined) {
      params.append('eliminarUnidadesHijas', request.eliminarUnidadesHijas.toString());
    }
    if (request.reasignarPosiciones !== undefined) {
      params.append('reasignarPosiciones', request.reasignarPosiciones.toString());
    }
    if (request.nuevaUnidadParaPosiciones !== undefined) {
      params.append('nuevaUnidadParaPosiciones', request.nuevaUnidadParaPosiciones.toString());
    }
    if (request.motivoEliminacion) {
      params.append('motivoEliminacion', request.motivoEliminacion);
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/${request.id}${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.delete<DeleteUnidadOrgResponse>(url);
  }

  // ==========================================================================
  // OPERACIONES ESPECIALIZADAS
  // ==========================================================================

  /**
   * Obtiene una unidad organizacional con información completa
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadOrgDtoResponse>
   */
  async getUnidadOrgCompleta(request: GetUnidadOrgCompletaRequest): Promise<GetUnidadOrgDtoResponse> {
    const url = `${this.baseUrl}/${request.id}/completa`;
    return await apiService.get<GetUnidadOrgDtoResponse>(url);
  }

  /**
   * Obtiene la jerarquía de padres de una unidad organizacional
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getJerarquiaUnidad(request: GetJerarquiaUnidadRequest): Promise<GetUnidadesOrgResponse> {
    const params = new URLSearchParams();
    if (request.incluirUnidadActual !== undefined) {
      params.append('incluirUnidadActual', request.incluirUnidadActual.toString());
    }
    if (request.ordenAscendente !== undefined) {
      params.append('ordenAscendente', request.ordenAscendente.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/${request.unidadId}/jerarquia${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<GetUnidadesOrgResponse>(url);
  }

  /**
   * Obtiene unidades organizacionales por organización
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getUnidadesPorOrganizacion(request: GetUnidadesPorOrganizacionRequest): Promise<GetUnidadesOrgResponse> {
    const params = new URLSearchParams();
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/organizacion/${request.organizacionId}${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<GetUnidadesOrgResponse>(url);
  }

  /**
   * Obtiene el árbol jerárquico de unidades organizacionales
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getArbolJerarquico(request: GetArbolJerarquicoRequest): Promise<GetUnidadesOrgResponse> {
    const params = new URLSearchParams();
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request.maxNiveles !== undefined) {
      params.append('maxNiveles', request.maxNiveles.toString());
    }
    if (request.unidadRaizId !== undefined) {
      params.append('unidadRaizId', request.unidadRaizId.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/organizacion/${request.organizacionId}/arbol${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<GetUnidadesOrgResponse>(url);
  }

  /**
   * Obtiene unidades raíz de una organización
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getUnidadesRaiz(request: GetUnidadesRaizRequest): Promise<GetUnidadesOrgResponse> {
    const params = new URLSearchParams();
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/organizacion/${request.organizacionId}/raiz${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<GetUnidadesOrgResponse>(url);
  }

  /**
   * Obtiene unidades hijas de una unidad padre
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getUnidadesHijas(request: GetUnidadesHijasRequest): Promise<GetUnidadesOrgResponse> {
    const params = new URLSearchParams();
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/padre/${request.unidadPadreId}/hijas${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<GetUnidadesOrgResponse>(url);
  }

  /**
   * Obtiene unidades organizacionales de forma paginada con filtros avanzados
   * @param request - Parámetros de la solicitud
   * @returns Promise<UnidadesOrgPaginatedResponse>
   */
  async getUnidadesPaginated(request: GetUnidadesPaginatedRequest = {}): Promise<UnidadesOrgPaginatedResponse> {
    const params = new URLSearchParams();
    
    // Paginación
    if (request.PageNumber !== undefined) {
      params.append('PageNumber', request.PageNumber.toString());
    }
    if (request.PageSize !== undefined) {
      params.append('PageSize', request.PageSize.toString());
    }
    
    // Filtros
    if (request.SearchTerm) {
      params.append('SearchTerm', request.SearchTerm);
    }
    if (request.OrganizacionId !== undefined) {
      params.append('OrganizacionId', request.OrganizacionId.toString());
    }
    if (request.TipoUnidad !== undefined) {
      params.append('TipoUnidad', request.TipoUnidad.toString());
    }
    if (request.UnidadPadreId !== undefined) {
      params.append('UnidadPadreId', request.UnidadPadreId.toString());
    }
    if (request.CentroCosto) {
      params.append('CentroCosto', request.CentroCosto);
    }
    if (request.IncludeDeleted !== undefined) {
      params.append('IncludeDeleted', request.IncludeDeleted.toString());
    }
    if (request.SoloUnidadesRaiz !== undefined) {
      params.append('SoloUnidadesRaiz', request.SoloUnidadesRaiz.toString());
    }
    if (request.SoloUnidadesHoja !== undefined) {
      params.append('SoloUnidadesHoja', request.SoloUnidadesHoja.toString());
    }
    if (request.SoloUnidadesConPosiciones !== undefined) {
      params.append('SoloUnidadesConPosiciones', request.SoloUnidadesConPosiciones.toString());
    }
    if (request.SoloUnidadesSinPosiciones !== undefined) {
      params.append('SoloUnidadesSinPosiciones', request.SoloUnidadesSinPosiciones.toString());
    }
    
    // Ordenación
    if (request.OrderBy) {
      params.append('OrderBy', request.OrderBy);
    }
    if (request.OrderDescending !== undefined) {
      params.append('OrderDescending', request.OrderDescending.toString());
    }
    
    // Filtros de fecha
    if (request.FechaCreacionDesde) {
      params.append('FechaCreacionDesde', request.FechaCreacionDesde);
    }
    if (request.FechaCreacionHasta) {
      params.append('FechaCreacionHasta', request.FechaCreacionHasta);
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/paginated${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<UnidadesOrgPaginatedResponse>(url);
  }

  /**
   * Obtiene unidades organizacionales por tipo
   * @param request - Parámetros de la solicitud
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getUnidadesPorTipo(request: GetUnidadesPorTipoRequest): Promise<GetUnidadesOrgResponse> {
    const params = new URLSearchParams();
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/tipo/${request.tipoUnidad}${queryString ? `?${queryString}` : ''}`;
    
    return await apiService.get<GetUnidadesOrgResponse>(url);
  }

  // ==========================================================================
  // MÉTODOS DE CONVENIENCIA
  // ==========================================================================

  /**
   * Obtiene todas las unidades organizacionales de una organización (sin filtros)
   * @param organizacionId - ID de la organización
   * @param includeDeleted - Si incluir registros eliminados
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getAllUnidadesByOrganizacion(organizacionId: number, includeDeleted = false): Promise<GetUnidadesOrgResponse> {
    return this.getUnidadesPorOrganizacion({ organizacionId, includeDeleted });
  }

  /**
   * Obtiene todas las unidades raíz de una organización
   * @param organizacionId - ID de la organización
   * @param includeDeleted - Si incluir registros eliminados
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getUnidadesRaizByOrganizacion(organizacionId: number, includeDeleted = false): Promise<GetUnidadesOrgResponse> {
    return this.getUnidadesRaiz({ organizacionId, includeDeleted });
  }

  /**
   * Obtiene todas las unidades hijas de una unidad padre
   * @param unidadPadreId - ID de la unidad padre
   * @param includeDeleted - Si incluir registros eliminados
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getUnidadesHijasByPadre(unidadPadreId: number, includeDeleted = false): Promise<GetUnidadesOrgResponse> {
    return this.getUnidadesHijas({ unidadPadreId, includeDeleted });
  }

  /**
   * Busca unidades organizacionales con filtros específicos
   * @param filters - Filtros de búsqueda
   * @param pagination - Opciones de paginación
   * @param sort - Opciones de ordenación
   * @returns Promise<UnidadesOrgPaginatedResponse>
   */
  async searchUnidadesOrg(
    filters: UnidadOrgFilters = {},
    pagination: PaginationOptions = {},
    sort: SortOptions = {}
  ): Promise<UnidadesOrgPaginatedResponse> {
    const request: GetUnidadesPaginatedRequest = {
      // Paginación
      PageNumber: pagination.pageNumber || 1,
      PageSize: pagination.pageSize || 10,
      
      // Filtros
      SearchTerm: filters.searchTerm,
      OrganizacionId: filters.organizacionId,
      TipoUnidad: filters.tipoUnidad,
      UnidadPadreId: filters.unidadPadreId,
      CentroCosto: filters.centroCosto,
      IncludeDeleted: filters.includeDeleted,
      SoloUnidadesRaiz: filters.soloUnidadesRaiz,
      SoloUnidadesHoja: filters.soloUnidadesHoja,
      SoloUnidadesConPosiciones: filters.soloUnidadesConPosiciones,
      SoloUnidadesSinPosiciones: filters.soloUnidadesSinPosiciones,
      FechaCreacionDesde: filters.fechaCreacionDesde,
      FechaCreacionHasta: filters.fechaCreacionHasta,
      
      // Ordenación
      OrderBy: sort.orderBy,
      OrderDescending: sort.orderDescending
    };

    return this.getUnidadesPaginated(request);
  }

  /**
   * Elimina una unidad organizacional de forma segura (soft delete)
   * @param id - ID de la unidad a eliminar
   * @param motivoEliminacion - Motivo de la eliminación
   * @returns Promise<DeleteUnidadOrgResponse>
   */
  async deleteUnidadOrgSoft(id: number, motivoEliminacion?: string): Promise<DeleteUnidadOrgResponse> {
    return this.deleteUnidadOrg({
      id,
      forceDelete: false,
      motivoEliminacion
    });
  }

  /**
   * Elimina una unidad organizacional de forma permanente (hard delete)
   * @param id - ID de la unidad a eliminar
   * @param motivoEliminacion - Motivo de la eliminación
   * @returns Promise<DeleteUnidadOrgResponse>
   */
  async deleteUnidadOrgHard(id: number, motivoEliminacion?: string): Promise<DeleteUnidadOrgResponse> {
    return this.deleteUnidadOrg({
      id,
      forceDelete: true,
      motivoEliminacion
    });
  }

  /**
   * Verifica si una unidad organizacional existe
   * @param id - ID de la unidad
   * @returns Promise<boolean>
   */
  async existsUnidadOrg(id: number): Promise<boolean> {
    try {
      const response = await this.getUnidadOrg({ id });
      return response.success && response.data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el árbol jerárquico completo de una organización
   * @param organizacionId - ID de la organización
   * @param includeDeleted - Si incluir registros eliminados
   * @returns Promise<GetUnidadesOrgResponse>
   */
  async getArbolCompletoOrganizacion(organizacionId: number, includeDeleted = false): Promise<GetUnidadesOrgResponse> {
    return this.getArbolJerarquico({ organizacionId, includeDeleted });
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const unidadesOrgService = new UnidadesOrgService();
export { UnidadesOrgService };
export default unidadesOrgService; 