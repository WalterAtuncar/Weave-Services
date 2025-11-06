/**
 * Servicio para gestión de usuarios
 * Implementa todos los endpoints del controlador UsuariosController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { ErrorHandler } from '../utils/errorHandler';
import {
  // Tipos de entidades
  Usuario,
  UsuarioDto,
  
  // Requests
  GetUsuariosRequest,
  GetUsuarioByIdRequest,
  GetUsuarioByUsernameRequest,
  GetUsuarioByPersonaIdRequest,
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  DeleteUsuarioRequest,
  GetUsuariosPaginatedRequest,
  
  // Responses
  GetUsuariosResponseData,
  GetUsuariosDtoResponseData,
  GetUsuarioByIdResponseData,
  GetUsuarioDtoByIdResponseData,
  GetUsuarioByUsernameResponseData,
  GetUsuarioByPersonaIdResponseData,
  CreateUsuarioResponseData,
  UpdateUsuarioResponseData,
  DeleteUsuarioResponseData,
  UsuariosPaginatedResponseData,
  
  // Tipos auxiliares
  UsuarioFilters,
  SortOptions,
  PaginationOptions
} from './types/usuarios.types';

export class UsuariosService extends BaseApiService {
  protected baseEndpoint = '/Usuarios';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los usuarios
   * GET /api/Usuarios
   */
  async getUsuarios(request?: GetUsuariosRequest): Promise<ApiResponse<GetUsuariosResponseData>> {
    try {
      const params = new URLSearchParams();
      
      if (request?.includeDeleted) {
        params.append('includeDeleted', request.includeDeleted.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

      return await this.get<GetUsuariosResponseData>(url);
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener lista de usuarios', false);
      throw error;
    }
  }

  /**
   * Obtiene usuarios con información de persona y posición para el formulario de gobernanza
   * GET /api/Usuarios/con-persona-posicion
   */
  async getUsuariosConPersonaPosicion(organizationId: number, request?: GetUsuariosRequest): Promise<ApiResponse<GetUsuariosConPersonaPosicionResponseData>> {
    try {
      const params = new URLSearchParams();
      params.append('organizationId', organizationId.toString());
      
      if (request?.includeDeleted) {
        params.append('includeDeleted', request.includeDeleted.toString());
      }

      const queryString = params.toString();
      const url = `${this.baseEndpoint}/con-persona-posicion?${queryString}`;

      return await this.get<GetUsuariosConPersonaPosicionResponseData>(url);
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener lista de usuarios con información de persona y posición', false);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios con información extendida (DTO)
   * GET /api/Usuarios (con parámetros específicos para DTO)
   */
  async getUsuariosDto(request?: GetUsuariosRequest): Promise<ApiResponse<GetUsuariosDtoResponseData>> {
    const params = new URLSearchParams();
    params.append('includeExtendedInfo', 'true');
    
    if (request?.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const url = `${this.baseEndpoint}?${params.toString()}`;
    return await this.get<GetUsuariosDtoResponseData>(url);
  }

  /**
   * Obtiene un usuario por ID
   * GET /api/Usuarios/{id}
   */
  async getUsuarioById(request: GetUsuarioByIdRequest): Promise<ApiResponse<GetUsuarioByIdResponseData>> {
    const params = new URLSearchParams();
    
    if (request.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.usuarioId}?${queryString}`
      : `${this.baseEndpoint}/${request.usuarioId}`;

    return await this.get<GetUsuarioByIdResponseData>(url);
  }

  /**
   * Obtiene un usuario por nombre de usuario
   * GET /api/Usuarios/by-username/{nombreUsuario}
   */
  async getUsuarioByUsername(request: GetUsuarioByUsernameRequest): Promise<ApiResponse<GetUsuarioByUsernameResponseData>> {
    const params = new URLSearchParams();
    
    if (request.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/by-username/${encodeURIComponent(request.nombreUsuario)}?${queryString}`
      : `${this.baseEndpoint}/by-username/${encodeURIComponent(request.nombreUsuario)}`;

    return await this.get<GetUsuarioByUsernameResponseData>(url);
  }

  /**
   * Obtiene un usuario por ID de persona
   * GET /api/Usuarios/by-persona/{personaId}
   */
  async getUsuarioByPersonaId(request: GetUsuarioByPersonaIdRequest): Promise<ApiResponse<GetUsuarioByPersonaIdResponseData>> {
    const params = new URLSearchParams();
    
    if (request.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/by-persona/${request.personaId}?${queryString}`
      : `${this.baseEndpoint}/by-persona/${request.personaId}`;

    return await this.get<GetUsuarioByPersonaIdResponseData>(url);
  }

  /**
   * Crea un nuevo usuario
   * POST /api/Usuarios
   */
  async createUsuario(request: CreateUsuarioRequest): Promise<ApiResponse<CreateUsuarioResponseData>> {
    return await this.post<CreateUsuarioResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza un usuario existente
   * PUT /api/Usuarios/{id}
   */
  async updateUsuario(request: UpdateUsuarioRequest): Promise<ApiResponse<UpdateUsuarioResponseData>> {
    const url = `${this.baseEndpoint}/${request.usuarioId}`;
    return await this.put<UpdateUsuarioResponseData>(url, request);
  }

  /**
   * Elimina un usuario
   * DELETE /api/Usuarios/{id}
   */
  async deleteUsuario(request: DeleteUsuarioRequest): Promise<ApiResponse<DeleteUsuarioResponseData>> {
    const params = new URLSearchParams();
    
    if (request.forceDelete) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.usuarioId}?${queryString}`
      : `${this.baseEndpoint}/${request.usuarioId}`;

    return await this.delete<DeleteUsuarioResponseData>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Búsqueda paginada de usuarios con filtros avanzados
   * GET /api/Usuarios/paginated
   */
  async getUsuariosPaginated(request?: GetUsuariosPaginatedRequest): Promise<ApiResponse<UsuariosPaginatedResponseData>> {
    const params = new URLSearchParams();

    // Filtros de usuario
    if (request?.nombreUsuario) params.append('nombreUsuario', request.nombreUsuario);
    if (request?.personaId !== undefined) params.append('personaId', request.personaId.toString());
    if (request?.perfilId !== undefined) params.append('perfilId', request.perfilId.toString());
    if (request?.tipoUsuarioId !== undefined) params.append('tipoUsuarioId', request.tipoUsuarioId.toString());
    if (request?.estado !== undefined) params.append('estado', request.estado.toString());
    if (request?.fechaExpiracionDesde) params.append('fechaExpiracionDesde', request.fechaExpiracionDesde);
    if (request?.fechaExpiracionHasta) params.append('fechaExpiracionHasta', request.fechaExpiracionHasta);
    if (request?.esActivo !== undefined) params.append('esActivo', request.esActivo.toString());
    if (request?.estaExpirado !== undefined) params.append('estaExpirado', request.estaExpirado.toString());
    if (request?.tienePersona !== undefined) params.append('tienePersona', request.tienePersona.toString());
    if (request?.tienePerfil !== undefined) params.append('tienePerfil', request.tienePerfil.toString());
    if (request?.fechaCreacionDesde) params.append('fechaCreacionDesde', request.fechaCreacionDesde);
    if (request?.fechaCreacionHasta) params.append('fechaCreacionHasta', request.fechaCreacionHasta);
    if (request?.fechaActualizacionDesde) params.append('fechaActualizacionDesde', request.fechaActualizacionDesde);
    if (request?.fechaActualizacionHasta) params.append('fechaActualizacionHasta', request.fechaActualizacionHasta);
    if (request?.creadoPor !== undefined) params.append('creadoPor', request.creadoPor.toString());
    if (request?.actualizadoPor !== undefined) params.append('actualizadoPor', request.actualizadoPor.toString());
    if (request?.includeDeleted !== undefined) params.append('includeDeleted', request.includeDeleted.toString());

    // Filtros de persona relacionada
    if (request?.nombresPersona) params.append('nombresPersona', request.nombresPersona);
    if (request?.apellidoPaternoPersona) params.append('apellidoPaternoPersona', request.apellidoPaternoPersona);
    if (request?.apellidoMaternoPersona) params.append('apellidoMaternoPersona', request.apellidoMaternoPersona);
    if (request?.nroDocPersona) params.append('nroDocPersona', request.nroDocPersona);
    if (request?.emailPersonalPersona) params.append('emailPersonalPersona', request.emailPersonalPersona);

    // Filtros de perfil relacionado
    if (request?.nombrePerfil) params.append('nombrePerfil', request.nombrePerfil);

    // Paginación
    if (request?.page !== undefined) params.append('page', request.page.toString());
    if (request?.pageSize !== undefined) params.append('pageSize', request.pageSize.toString());
    if (request?.orderBy) params.append('orderBy', request.orderBy);
    if (request?.ascending !== undefined) params.append('ascending', request.ascending.toString());

    const url = `${this.baseEndpoint}/paginated?${params.toString()}`;
    return await this.get<UsuariosPaginatedResponseData>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca usuarios por término general
   */
  async searchUsuarios(
    searchTerm: string, 
    filters?: UsuarioFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<ApiResponse<UsuariosPaginatedResponseData>> {
    const request: GetUsuariosPaginatedRequest = {
      // Buscar en múltiples campos
      nombreUsuario: searchTerm,
      nombresPersona: searchTerm,
      apellidoPaternoPersona: searchTerm,
      apellidoMaternoPersona: searchTerm,
      nroDocPersona: searchTerm,
      emailPersonalPersona: searchTerm,
      nombrePerfil: searchTerm,
      
      // Aplicar filtros adicionales
      ...filters,
      
      // Aplicar paginación
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 10,
      
      // Aplicar ordenamiento
      orderBy: sort?.orderBy || 'fechaCreacion',
      ascending: sort?.ascending !== undefined ? sort.ascending : false
    };

    return await this.getUsuariosPaginated(request);
  }

  /**
   * Obtiene usuarios por estado
   */
  async getUsuariosByEstado(estado: number): Promise<ApiResponse<GetUsuariosDtoResponseData>> {
    const request: GetUsuariosPaginatedRequest = {
      estado,
      pageSize: 1000 // Obtener todos
    };

    const response = await this.getUsuariosPaginated(request);
    
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
      message: response.message || 'Error al obtener usuarios por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene usuarios por perfil
   */
  async getUsuariosByPerfil(perfilId: number): Promise<ApiResponse<GetUsuariosDtoResponseData>> {
    const request: GetUsuariosPaginatedRequest = {
      perfilId,
      estado: 1, // Solo usuarios activos
      pageSize: 1000 // Obtener todos
    };

    const response = await this.getUsuariosPaginated(request);
    
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
      message: response.message || 'Error al obtener usuarios por perfil',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Verifica si existe un usuario con el nombre de usuario dado
   */
  async existeUsuarioConNombre(nombreUsuario: string): Promise<ApiResponse<boolean>> {
    const request: GetUsuariosPaginatedRequest = {
      nombreUsuario,
      pageSize: 1
    };

    const response = await this.getUsuariosPaginated(request);
    
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
      message: response.message || 'Error al verificar nombre de usuario',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene usuarios por personaId
   */
  async getUsuariosByPersonaId(personaId: number): Promise<ApiResponse<GetUsuariosDtoResponseData>> {
    const request: GetUsuariosPaginatedRequest = {
      personaId,
      pageSize: 1000 // Obtener todos los usuarios de la persona
    };

    const response = await this.getUsuariosPaginated(request);
    
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
      message: response.message || 'Error al obtener usuarios por persona',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene usuarios activos
   */
  async getUsuariosActivos(): Promise<ApiResponse<GetUsuariosDtoResponseData>> {
    return await this.getUsuariosByEstado(1); // Estado ACTIVO = 1
  }

  /**
   * Obtiene usuarios expirados
   */
  async getUsuariosExpirados(): Promise<ApiResponse<GetUsuariosDtoResponseData>> {
    const request: GetUsuariosPaginatedRequest = {
      estaExpirado: true,
      pageSize: 1000 // Obtener todos
    };

    const response = await this.getUsuariosPaginated(request);
    
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
      message: response.message || 'Error al obtener usuarios expirados',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene usuarios próximos a expirar (en los próximos N días)
   */
  async getUsuariosProximosAExpirar(diasAnticipacion: number = 30): Promise<ApiResponse<GetUsuariosDtoResponseData>> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);

    const request: GetUsuariosPaginatedRequest = {
      fechaExpiracionHasta: fechaLimite.toISOString().split('T')[0],
      esActivo: true,
      pageSize: 1000 // Obtener todos
    };

    const response = await this.getUsuariosPaginated(request);
    
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
      message: response.message || 'Error al obtener usuarios próximos a expirar',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }
}

// Instancia singleton del servicio
export const usuariosService = new UsuariosService(); 