/**
 * Servicio para gestión de personas
 * Implementa todos los endpoints del controlador PersonasController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  Persona,
  PersonaDto,
  
  // Requests
  GetPersonasRequest,
  GetPersonaByIdRequest,
  GetPersonaCompletoRequest,
  CreatePersonaRequest,
  UpdatePersonaRequest,
  CreatePersonaConUsuarioRequest,
  UpdatePersonaConUsuarioRequest,
  DeletePersonaRequest,
  GetPersonasPaginatedRequest,
  
  // Responses
  GetPersonasResponseData,
  GetPersonasDtoResponseData,
  GetPersonaByIdResponseData,
  GetPersonaDtoByIdResponseData,
  GetPersonaCompletoResponseData,
  CreatePersonaResponseData,
  UpdatePersonaResponseData,
  CreatePersonaConUsuarioResponseData,
  UpdatePersonaConUsuarioResponseData,
  DeletePersonaResponseData,
  GetPersonasActivasResponseData,
  GetEstadisticasPersonasResponseData,
  PersonasPaginatedResponseData,
  
  // Tipos auxiliares
  PersonaFilters,
  SortOptions,
  PaginationOptions
} from './types/personas.types';

export class PersonasService extends BaseApiService {
  protected baseEndpoint = '/Personas';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todas las personas
   * GET /api/Personas
   */
  async getPersonas(request?: GetPersonasRequest): Promise<ApiResponse<GetPersonasResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<GetPersonasResponseData>(url);
  }

  /**
   * Obtiene todas las personas con información extendida (DTO)
   * GET /api/Personas (con parámetros específicos para DTO)
   */
  async getPersonasDto(request?: GetPersonasRequest): Promise<ApiResponse<GetPersonasDtoResponseData>> {
    const params = new URLSearchParams();
    params.append('includeExtendedInfo', 'true');
    
    if (request?.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const url = `${this.baseEndpoint}?${params.toString()}`;
    return await this.get<GetPersonasDtoResponseData>(url);
  }

  /**
   * Obtiene una persona por ID
   * GET /api/Personas/{id}
   */
  async getPersonaById(request: GetPersonaByIdRequest): Promise<ApiResponse<GetPersonaByIdResponseData>> {
    const params = new URLSearchParams();
    
    if (request.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.personaId}?${queryString}`
      : `${this.baseEndpoint}/${request.personaId}`;

    return await this.get<GetPersonaByIdResponseData>(url);
  }

  /**
   * Obtiene información completa de una persona (DTO extendido)
   * GET /api/Personas/{id}/completo
   */
  async getPersonaCompleto(request: GetPersonaCompletoRequest): Promise<ApiResponse<GetPersonaCompletoResponseData>> {
    const url = `${this.baseEndpoint}/${request.personaId}/completo`;
    return await this.get<GetPersonaCompletoResponseData>(url);
  }

  /**
   * Crea una nueva persona
   * POST /api/Personas
   */
  async createPersona(request: CreatePersonaRequest): Promise<ApiResponse<CreatePersonaResponseData>> {
    return await this.post<CreatePersonaResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza una persona existente
   * PUT /api/Personas/{id}
   */
  async updatePersona(request: UpdatePersonaRequest): Promise<ApiResponse<UpdatePersonaResponseData>> {
    const url = `${this.baseEndpoint}/${request.personaId}`;
    return await this.put<UpdatePersonaResponseData>(url, request);
  }

  /**
   * Crea una nueva persona con usuario
   * POST /api/Personas (con datos de usuario incluidos)
   */
  async createPersonaConUsuario(request: CreatePersonaConUsuarioRequest): Promise<ApiResponse<CreatePersonaConUsuarioResponseData>> {
    return await this.post<CreatePersonaConUsuarioResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza una persona existente con usuario
   * PUT /api/Personas/{id} (con datos de usuario incluidos)
   */
  async updatePersonaConUsuario(request: UpdatePersonaConUsuarioRequest): Promise<ApiResponse<UpdatePersonaConUsuarioResponseData>> {
    const url = `${this.baseEndpoint}/${request.personaId}`;
    return await this.put<UpdatePersonaConUsuarioResponseData>(url, request);
  }

  /**
   * Elimina una persona
   * DELETE /api/Personas/{id}
   */
  async deletePersona(request: DeletePersonaRequest): Promise<ApiResponse<DeletePersonaResponseData>> {
    const params = new URLSearchParams();
    
    if (request.forceDelete) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.personaId}?${queryString}`
      : `${this.baseEndpoint}/${request.personaId}`;

    return await this.delete<DeletePersonaResponseData>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene personas activas
   * GET /api/Personas/activos
   */
  async getPersonasActivas(): Promise<ApiResponse<GetPersonasActivasResponseData>> {
    const url = `${this.baseEndpoint}/activos`;
    return await this.get<GetPersonasActivasResponseData>(url);
  }

  /**
   * Obtiene estadísticas de personas
   * GET /api/Personas/estadisticas
   */
  async getEstadisticasPersonas(): Promise<ApiResponse<GetEstadisticasPersonasResponseData>> {
    const url = `${this.baseEndpoint}/estadisticas`;
    return await this.get<GetEstadisticasPersonasResponseData>(url);
  }

  /**
   * Búsqueda paginada de personas con filtros avanzados
   * GET /api/Personas/paginated
   */
  async getPersonasPaginated(request?: GetPersonasPaginatedRequest): Promise<ApiResponse<PersonasPaginatedResponseData>> {
    const params = new URLSearchParams();

    // 🔧 NUEVO: Búsqueda genérica (prioridad sobre filtros específicos)
    if (request?.searchTerm) params.append('searchTerm', request.searchTerm);

    // Filtros de persona específicos
    if (request?.nombres) params.append('nombres', request.nombres);
    if (request?.apellidoPaterno) params.append('apellidoPaterno', request.apellidoPaterno);
    if (request?.apellidoMaterno) params.append('apellidoMaterno', request.apellidoMaterno);
    if (request?.nroDoc) params.append('nroDoc', request.nroDoc);
    if (request?.codEmpleado) params.append('codEmpleado', request.codEmpleado);
    if (request?.emailPersonal) params.append('emailPersonal', request.emailPersonal);
    if (request?.celular) params.append('celular', request.celular);
    if (request?.tipoDoc !== undefined) params.append('tipoDoc', request.tipoDoc.toString());
    if (request?.estadoLaboral !== undefined) params.append('estadoLaboral', request.estadoLaboral.toString());
    if (request?.estado !== undefined) params.append('estado', request.estado.toString());
    if (request?.fechaNacimientoDesde) params.append('fechaNacimientoDesde', request.fechaNacimientoDesde);
    if (request?.fechaNacimientoHasta) params.append('fechaNacimientoHasta', request.fechaNacimientoHasta);
    if (request?.fechaIngresoDesde) params.append('fechaIngresoDesde', request.fechaIngresoDesde);
    if (request?.fechaIngresoHasta) params.append('fechaIngresoHasta', request.fechaIngresoHasta);
    if (request?.edadDesde !== undefined) params.append('edadDesde', request.edadDesde.toString());
    if (request?.edadHasta !== undefined) params.append('edadHasta', request.edadHasta.toString());
    if (request?.tieneUsuarios !== undefined) params.append('tieneUsuarios', request.tieneUsuarios.toString());
    if (request?.tienePosiciones !== undefined) params.append('tienePosiciones', request.tienePosiciones.toString());
    if (request?.tieneDocumento !== undefined) params.append('tieneDocumento', request.tieneDocumento.toString());
    if (request?.tieneEmail !== undefined) params.append('tieneEmail', request.tieneEmail.toString());
    if (request?.tieneCelular !== undefined) params.append('tieneCelular', request.tieneCelular.toString());
    if (request?.fechaCreacionDesde) params.append('fechaCreacionDesde', request.fechaCreacionDesde);
    if (request?.fechaCreacionHasta) params.append('fechaCreacionHasta', request.fechaCreacionHasta);
    if (request?.fechaActualizacionDesde) params.append('fechaActualizacionDesde', request.fechaActualizacionDesde);
    if (request?.fechaActualizacionHasta) params.append('fechaActualizacionHasta', request.fechaActualizacionHasta);
    if (request?.creadoPor !== undefined) params.append('creadoPor', request.creadoPor.toString());
    if (request?.actualizadoPor !== undefined) params.append('actualizadoPor', request.actualizadoPor.toString());
    if (request?.includeDeleted !== undefined) params.append('includeDeleted', request.includeDeleted.toString());
    if (request?.organizacionId !== undefined) params.append('organizacionId', request.organizacionId.toString());
    if (request?.perfilId !== undefined) params.append('perfilId', request.perfilId.toString());

    // Paginación
    if (request?.page !== undefined) params.append('page', request.page.toString());
    if (request?.pageSize !== undefined) params.append('pageSize', request.pageSize.toString());
    if (request?.orderBy) params.append('orderBy', request.orderBy);
    if (request?.ascending !== undefined) params.append('ascending', request.ascending.toString());

    const url = `${this.baseEndpoint}/paginated?${params.toString()}`;
    return await this.get<PersonasPaginatedResponseData>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca personas por término general
   */
  async searchPersonas(
    searchTerm: string, 
    filters?: PersonaFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<ApiResponse<PersonasPaginatedResponseData>> {
    const request: GetPersonasPaginatedRequest = {
      // Buscar en múltiples campos
      nombres: searchTerm,
      apellidoPaterno: searchTerm,
      apellidoMaterno: searchTerm,
      nroDoc: searchTerm,
      codEmpleado: searchTerm,
      emailPersonal: searchTerm,
      
      // Aplicar filtros adicionales (incluye organizacionId si está presente)
      ...filters,
      
      // Aplicar paginación
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 10,
      
      // Aplicar ordenamiento
      orderBy: sort?.orderBy || 'fechaCreacion',
      ascending: sort?.ascending !== undefined ? sort.ascending : false
    };

    return await this.getPersonasPaginated(request);
  }

  /**
   * Obtiene personas por estado laboral
   */
  async getPersonasByEstadoLaboral(estadoLaboral: number, organizacionId?: number): Promise<ApiResponse<GetPersonasDtoResponseData>> {
    const request: GetPersonasPaginatedRequest = {
      estadoLaboral,
      pageSize: 1000, // Obtener todas
      organizacionId // Filtrar por organización si se proporciona
    };

    const response = await this.getPersonasPaginated(request);
    
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
      message: response.message || 'Error al obtener personas por estado laboral',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene personas por perfil
   */
  async getPersonasByPerfil(perfilId: number): Promise<ApiResponse<GetPersonasDtoResponseData>> {
    const request: GetPersonasPaginatedRequest = {
      perfilId,
      estado: 1, // Solo personas activas
      pageSize: 1000 // Obtener todas
    };

    const response = await this.getPersonasPaginated(request);
    
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
      message: response.message || 'Error al obtener personas por perfil',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Verifica si existe una persona con el documento dado
   */
  async existePersonaConDocumento(tipoDoc: number, nroDoc: string, organizacionId?: number): Promise<ApiResponse<boolean>> {
    const request: GetPersonasPaginatedRequest = {
      tipoDoc,
      nroDoc,
      pageSize: 1,
      organizacionId // Verificar solo dentro de la organización si se proporciona
    };

    const response = await this.getPersonasPaginated(request);
    
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
      message: response.message || 'Error al verificar documento',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Verifica si existe una persona con el código de empleado dado
   */
  async existePersonaConCodigo(codEmpleado: string, organizacionId?: number): Promise<ApiResponse<boolean>> {
    const request: GetPersonasPaginatedRequest = {
      codEmpleado,
      pageSize: 1,
      organizacionId // Verificar solo dentro de la organización si se proporciona
    };

    const response = await this.getPersonasPaginated(request);
    
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
      message: response.message || 'Error al verificar código de empleado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }
}

// Instancia singleton del servicio
export const personasService = new PersonasService(); 