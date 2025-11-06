/**
 * Servicio para gestión de asignaciones PersonaPosicion
 * Implementa todos los endpoints del controlador PersonaPosicionController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  PersonaPosicion,
  PersonaPosicionDto,
  
  // Commands
  CreatePersonaPosicionCommand,
  UpdatePersonaPosicionCommand,
  DeletePersonaPosicionCommand,
  
  // Requests
  GetAllPersonaPosicionesRequest,
  GetPersonaPosicionByIdRequest,
  GetPersonaPosicionCompletaRequest,
  GetPosicionesByPersonaRequest,
  GetPersonasByPosicionRequest,
  GetAllPersonaPosicionesPaginatedRequest,
  
  // Responses
  GetAllPersonaPosicionesResponseData,
  GetPersonaPosicionByIdResponseData,
  GetPersonaPosicionCompletaResponseData,
  CreatePersonaPosicionResponseData,
  UpdatePersonaPosicionResponseData,
  DeletePersonaPosicionResponseData,
  GetPosicionesByPersonaResponseData,
  GetPersonasByPosicionResponseData,
  PersonaPosicionesPaginatedResponseData,
  GetAsignacionesActivasResponseData,
  
  // Tipos auxiliares
  PersonaPosicionFilters,
  SortOptions,
  PaginationOptions
} from './types/persona-posicion.types';

export class PersonaPosicionService extends BaseApiService {
  protected baseEndpoint = '/PersonaPosicion';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todas las asignaciones PersonaPosicion
   * GET /api/PersonaPosicion
   */
  async getAllPersonaPosiciones(request?: GetAllPersonaPosicionesRequest): Promise<ApiResponse<GetAllPersonaPosicionesResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request?.onlyActive !== undefined) {
      params.append('onlyActive', request.onlyActive.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<PersonaPosicion[]>(url);
  }

  /**
   * Obtiene una asignación PersonaPosicion por ID compuesto
   * GET /api/PersonaPosicion/{personaId}/{posicionId}
   */
  async getPersonaPosicionById(request: GetPersonaPosicionByIdRequest): Promise<ApiResponse<GetPersonaPosicionByIdResponseData>> {
    const params = new URLSearchParams();
    
    if (request.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.personaId}/${request.posicionId}?${queryString}`
      : `${this.baseEndpoint}/${request.personaId}/${request.posicionId}`;

    return await this.get<PersonaPosicion>(url);
  }

  /**
   * Obtiene información completa de una asignación PersonaPosicion
   * GET /api/PersonaPosicion/{personaId}/{posicionId}/completo
   */
  async getPersonaPosicionCompleta(request: GetPersonaPosicionCompletaRequest): Promise<ApiResponse<GetPersonaPosicionCompletaResponseData>> {
    const url = `${this.baseEndpoint}/${request.personaId}/${request.posicionId}/completo`;
    return await this.get<PersonaPosicionDto>(url);
  }

  /**
   * Crea una nueva asignación PersonaPosicion
   * POST /api/PersonaPosicion
   */
  async createPersonaPosicion(command: CreatePersonaPosicionCommand): Promise<ApiResponse<CreatePersonaPosicionResponseData>> {
    return await this.post<boolean>(this.baseEndpoint, command);
  }

  /**
   * Actualiza una asignación PersonaPosicion existente
   * PUT /api/PersonaPosicion/{personaId}/{posicionId}
   */
  async updatePersonaPosicion(personaId: number, posicionId: number, command: UpdatePersonaPosicionCommand): Promise<ApiResponse<UpdatePersonaPosicionResponseData>> {
    const url = `${this.baseEndpoint}/${personaId}/${posicionId}`;
    return await this.put<boolean>(url, command);
  }

  /**
   * Elimina una asignación PersonaPosicion
   * DELETE /api/PersonaPosicion/{personaId}/{posicionId}
   */
  async deletePersonaPosicion(personaId: number, posicionId: number, options?: {
    forceDelete?: boolean;
    finalizarEnLugarDeEliminar?: boolean;
    motivo?: string;
    fechaFinalizacion?: string;
  }): Promise<ApiResponse<DeletePersonaPosicionResponseData>> {
    const params = new URLSearchParams();
    
    if (options?.forceDelete !== undefined) {
      params.append('forceDelete', options.forceDelete.toString());
    }
    if (options?.finalizarEnLugarDeEliminar !== undefined) {
      params.append('finalizarEnLugarDeEliminar', options.finalizarEnLugarDeEliminar.toString());
    }
    if (options?.motivo) {
      params.append('motivo', options.motivo);
    }
    if (options?.fechaFinalizacion) {
      params.append('fechaFinalizacion', options.fechaFinalizacion);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${personaId}/${posicionId}?${queryString}`
      : `${this.baseEndpoint}/${personaId}/${posicionId}`;

    return await this.delete<boolean>(url);
  }

  // ===== CONSULTAS ESPECÍFICAS =====

  /**
   * Obtiene todas las posiciones asignadas a una persona
   * GET /api/PersonaPosicion/persona/{personaId}
   */
  async getPosicionesByPersona(request: GetPosicionesByPersonaRequest): Promise<ApiResponse<GetPosicionesByPersonaResponseData>> {
    const params = new URLSearchParams();
    
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request.onlyActive !== undefined) {
      params.append('onlyActive', request.onlyActive.toString());
    }
    if (request.includeHistorical !== undefined) {
      params.append('includeHistorical', request.includeHistorical.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/persona/${request.personaId}?${queryString}`
      : `${this.baseEndpoint}/persona/${request.personaId}`;

    return await this.get<PersonaPosicionDto[]>(url);
  }

  /**
   * Obtiene todas las personas asignadas a una posición
   * GET /api/PersonaPosicion/posicion/{posicionId}
   */
  async getPersonasByPosicion(request: GetPersonasByPosicionRequest): Promise<ApiResponse<GetPersonasByPosicionResponseData>> {
    const params = new URLSearchParams();
    
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request.onlyActive !== undefined) {
      params.append('onlyActive', request.onlyActive.toString());
    }
    if (request.includeHistorical !== undefined) {
      params.append('includeHistorical', request.includeHistorical.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/posicion/${request.posicionId}?${queryString}`
      : `${this.baseEndpoint}/posicion/${request.posicionId}`;

    return await this.get<PersonaPosicionDto[]>(url);
  }

  /**
   * Obtiene asignaciones con paginación y filtros avanzados
   * GET /api/PersonaPosicion/paginated
   */
  async getPersonaPosicionesPaginated(request?: GetAllPersonaPosicionesPaginatedRequest): Promise<ApiResponse<PersonaPosicionesPaginatedResponseData>> {
    const params = new URLSearchParams();

    if (request?.page !== undefined) params.append('Page', request.page.toString());
    if (request?.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
    if (request?.orderBy) params.append('OrderBy', request.orderBy);
    if (request?.orderDescending !== undefined) params.append('OrderDescending', request.orderDescending.toString());
    if (request?.includeDeleted !== undefined) params.append('IncludeDeleted', request.includeDeleted.toString());
    if (request?.onlyActive !== undefined) params.append('OnlyActive', request.onlyActive.toString());
    if (request?.estado !== undefined) params.append('Estado', request.estado.toString());
    if (request?.personaId !== undefined) params.append('PersonaId', request.personaId.toString());
    if (request?.posicionId !== undefined) params.append('PosicionId', request.posicionId.toString());
    if (request?.nombrePersona) params.append('NombrePersona', request.nombrePersona);
    if (request?.apellidoPersona) params.append('ApellidoPersona', request.apellidoPersona);
    if (request?.nombrePosicion) params.append('NombrePosicion', request.nombrePosicion);
    if (request?.categoriaPosicion !== undefined) params.append('CategoriaPosicion', request.categoriaPosicion.toString());
    if (request?.unidadOrgId !== undefined) params.append('UnidadOrgId', request.unidadOrgId.toString());
    if (request?.nombreUnidadOrg) params.append('NombreUnidadOrg', request.nombreUnidadOrg);
    if (request?.tipoUnidadOrg !== undefined) params.append('TipoUnidadOrg', request.tipoUnidadOrg.toString());
    if (request?.fechaInicioDesde) params.append('FechaInicioDesde', request.fechaInicioDesde);
    if (request?.fechaInicioHasta) params.append('FechaInicioHasta', request.fechaInicioHasta);
    if (request?.fechaFinDesde) params.append('FechaFinDesde', request.fechaFinDesde);
    if (request?.fechaFinHasta) params.append('FechaFinHasta', request.fechaFinHasta);
    if (request?.esActiva !== undefined) params.append('EsActiva', request.esActiva.toString());
    if (request?.fechaCreacionDesde) params.append('FechaCreacionDesde', request.fechaCreacionDesde);
    if (request?.fechaCreacionHasta) params.append('FechaCreacionHasta', request.fechaCreacionHasta);
    if (request?.fechaActualizacionDesde) params.append('FechaActualizacionDesde', request.fechaActualizacionDesde);
    if (request?.fechaActualizacionHasta) params.append('FechaActualizacionHasta', request.fechaActualizacionHasta);
    if (request?.creadoPor !== undefined) params.append('CreadoPor', request.creadoPor.toString());
    if (request?.actualizadoPor !== undefined) params.append('ActualizadoPor', request.actualizadoPor.toString());
    if (request?.searchTerm) params.append('SearchTerm', request.searchTerm);

    const url = `${this.baseEndpoint}/paginated?${params.toString()}`;
    return await this.get<PersonaPosicionesPaginatedResponseData>(url);
  }

  /**
   * Obtiene solo asignaciones activas (vigentes)
   * GET /api/PersonaPosicion/activas
   */
  async getAsignacionesActivas(): Promise<ApiResponse<GetAsignacionesActivasResponseData>> {
    const url = `${this.baseEndpoint}/activas`;
    return await this.get<PersonaPosicion[]>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca asignaciones por término general con paginación
   */
  async searchPersonaPosiciones(
    searchTerm: string, 
    filters?: PersonaPosicionFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<ApiResponse<PersonaPosicionesPaginatedResponseData>> {
    const request: GetAllPersonaPosicionesPaginatedRequest = {
      searchTerm,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 10,
      orderBy: sort?.orderBy || 'fechaInicio',
      orderDescending: sort?.ascending !== undefined ? !sort.ascending : true,
      ...filters
    };

    return await this.getPersonaPosicionesPaginated(request);
  }

  /**
   * Obtiene asignaciones activas por persona
   */
  async getAsignacionesActivasByPersona(personaId: number): Promise<ApiResponse<PersonaPosicionDto[]>> {
    const request: GetPosicionesByPersonaRequest = {
      personaId,
      onlyActive: true,
      includeHistorical: false
    };

    return await this.getPosicionesByPersona(request);
  }

  /**
   * Obtiene asignaciones activas por posición
   */
  async getAsignacionesActivasByPosicion(posicionId: number): Promise<ApiResponse<PersonaPosicionDto[]>> {
    const request: GetPersonasByPosicionRequest = {
      posicionId,
      onlyActive: true,
      includeHistorical: false
    };

    return await this.getPersonasByPosicion(request);
  }

  /**
   * Verifica si una persona puede ser asignada a una posición
   */
  async puedeAsignarPersonaAPosicion(personaId: number, posicionId: number): Promise<ApiResponse<{ puedeAsignar: boolean; razon?: string; conflictos?: PersonaPosicionDto[] }>> {
    try {
      // Verificar asignaciones activas existentes para la posición
      const asignacionesResponse = await this.getAsignacionesActivasByPosicion(posicionId);

      if (!asignacionesResponse.success) {
        return {
          success: false,
          data: { puedeAsignar: false, razon: 'Error al verificar asignaciones existentes' },
          message: 'Error en validación',
          errors: asignacionesResponse.errors || [],
          statusCode: asignacionesResponse.statusCode || 500,
          metadata: ''
        };
      }

      const asignacionesExistentes = asignacionesResponse.data || [];
      
      // Verificar si la persona ya está asignada a esta posición
      const asignacionExistente = asignacionesExistentes.find(a => a.personaId === personaId);

      if (asignacionExistente) {
        return {
          success: true,
          data: { 
            puedeAsignar: false, 
            razon: 'La persona ya está asignada a esta posición',
            conflictos: [asignacionExistente]
          },
          message: 'Conflicto de asignación detectado',
          errors: [],
          statusCode: 200,
          metadata: ''
        };
      }

      return {
        success: true,
        data: { puedeAsignar: true },
        message: 'Se puede asignar la persona a la posición',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: { puedeAsignar: false, razon: 'Error interno en validación' },
        message: 'Error al verificar posibilidad de asignación',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const personaPosicionService = new PersonaPosicionService(); 