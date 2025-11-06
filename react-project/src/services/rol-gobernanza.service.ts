/**
 * Servicio para gestión de Roles de Gobernanza
 * Actualizado según el modelo Domain.Entities.Governance.RolGobernanza
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  RolGobernanza,
  EstadoRolGobernanza,
  NivelRolGobernanza,
  
  // Commands
  CreateRolGobernanzaCommand,
  UpdateRolGobernanzaCommand,
  
  // Requests
  GetAllRolesGobernanzaRequest,
  GetRolGobernanzaByIdRequest,
  GetRolGobernanzaByCodigoRequest,
  GetRolesGobernanzaByNivelRequest,
  GetRolesGobernanzaActivosRequest,
  DeleteRolGobernanzaRequest,
  
  // Responses
  GetAllRolesGobernanzaResponseData,
  GetRolGobernanzaByIdResponseData,
  GetRolGobernanzaByCodigoResponseData,
  GetRolesGobernanzaByNivelResponseData,
  CreateRolGobernanzaResponseData,
  UpdateRolGobernanzaResponseData,
  DeleteRolGobernanzaResponseData,
  GetRolesGobernanzaActivosResponseData,
  
  // Tipos response
  GetRolGobernanzaResponse,
  GetRolGobernanzaListResponse,
  CreateRolGobernanzaResponse,
  UpdateRolGobernanzaResponse,
  DeleteRolGobernanzaResponse,
  
  // Tipos auxiliares
  RolGobernanzaFilters,
  RolGobernanzaSortOptions
} from './types/rol-gobernanza.types';

export class RolGobernanzaService extends BaseApiService {
  protected baseEndpoint = '/RolGobernanza';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los roles de gobernanza
   * GET /api/RolGobernanza
   */
  async getAllRolesGobernanza(request?: GetAllRolesGobernanzaRequest): Promise<GetRolGobernanzaListResponse> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<RolGobernanza[]>(url);
  }

  /**
   * Obtiene un rol de gobernanza por ID
   * GET /api/RolGobernanza/{id}
   */
  async getRolGobernanzaById(rolGobernanzaId: number, includeDeleted: boolean = false): Promise<GetRolGobernanzaResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/${rolGobernanzaId}?${queryString}` : `${this.baseEndpoint}/${rolGobernanzaId}`;
    
    return await this.get<RolGobernanza>(url);
  }

  /**
   * Obtiene un rol de gobernanza por código
   * GET /api/RolGobernanza/codigo/{codigo}
   */
  async getRolGobernanzaByCodigo(codigo: string, includeDeleted: boolean = false): Promise<GetRolGobernanzaResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/codigo/${encodeURIComponent(codigo)}?${queryString}`
      : `${this.baseEndpoint}/codigo/${encodeURIComponent(codigo)}`;
    
    return await this.get<RolGobernanza>(url);
  }

  /**
   * Crea un nuevo rol de gobernanza
   * POST /api/RolGobernanza
   */
  async createRolGobernanza(command: CreateRolGobernanzaCommand): Promise<CreateRolGobernanzaResponse> {
    return await this.post<RolGobernanza>(this.baseEndpoint, command);
  }

  /**
   * Actualiza un rol de gobernanza existente
   * PUT /api/RolGobernanza/{id}
   */
  async updateRolGobernanza(command: UpdateRolGobernanzaCommand): Promise<UpdateRolGobernanzaResponse> {
    const url = `${this.baseEndpoint}/${command.rolGobernanzaId}`;
    return await this.put<RolGobernanza>(url, command);
  }

  /**
   * Elimina un rol de gobernanza (soft delete)
   * DELETE /api/RolGobernanza/{id}
   */
  async deleteRolGobernanza(request: DeleteRolGobernanzaRequest): Promise<DeleteRolGobernanzaResponse> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.rolGobernanzaId}?${queryString}`
      : `${this.baseEndpoint}/${request.rolGobernanzaId}`;

    return await this.delete<boolean>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene roles de gobernanza activos
   * GET /api/RolGobernanza/activos
   */
  async getRolesGobernanzaActivos(): Promise<GetRolGobernanzaListResponse> {
    const url = `${this.baseEndpoint}/activos`;
    return await this.get<RolGobernanza[]>(url);
  }

  /**
   * Obtiene roles de gobernanza por nivel
   * GET /api/RolGobernanza/nivel/{nivel}
   */
  async getRolesGobernanzaByNivel(nivel: number, includeDeleted: boolean = false): Promise<GetRolGobernanzaListResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/nivel/${nivel}?${queryString}` : `${this.baseEndpoint}/nivel/${nivel}`;
    
    return await this.get<RolGobernanza[]>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca roles de gobernanza por término
   */
  async searchRolesGobernanza(
    searchTerm: string, 
    filters?: RolGobernanzaFilters,
    sort?: RolGobernanzaSortOptions
  ): Promise<GetRolGobernanzaListResponse> {
    const response = await this.getAllRolesGobernanza({ includeDeleted: filters?.includeDeleted });
    
    if (response.success && response.data) {
      let filteredData = response.data;

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.rolGobernanzaCodigo.toLowerCase().includes(term) ||
          item.rolGobernanzaNombre.toLowerCase().includes(term) ||
          (item.rolGobernanzaDescripcion && item.rolGobernanzaDescripcion.toLowerCase().includes(term))
        );
      }

      // Aplicar filtros adicionales
      if (filters?.estado !== undefined) {
        filteredData = filteredData.filter(item => item.estado === filters.estado);
      }
      
      if (filters?.nivel !== undefined) {
        filteredData = filteredData.filter(item => item.nivel === filters.nivel);
      }

      if (filters?.color) {
        filteredData = filteredData.filter(item => 
          item.color && item.color.toLowerCase().includes(filters.color!.toLowerCase())
        );
      }

      // Aplicar ordenamiento
      if (sort?.orderBy) {
        filteredData.sort((a, b) => {
          const field = sort.orderBy!;
          const aValue = a[field as keyof RolGobernanza];
          const bValue = b[field as keyof RolGobernanza];
          
          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;
          
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
   * Verifica si existe un rol de gobernanza con el código dado
   */
  async existeRolGobernanzaConCodigo(codigo: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getRolGobernanzaByCodigo(codigo, false);
      
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
   * Obtiene roles de gobernanza por estado
   */
  async getRolesGobernanzaByEstado(estado: number): Promise<GetRolGobernanzaListResponse> {
    const response = await this.getAllRolesGobernanza();
    
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
      message: response.message || 'Error al obtener roles de gobernanza por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene todos los niveles únicos de roles de gobernanza
   */
  async getNivelesDisponibles(): Promise<ApiResponse<number[]>> {
    const response = await this.getAllRolesGobernanza();
    
    if (response.success && response.data) {
      const niveles = [...new Set(response.data.map(item => item.nivel))].sort((a, b) => a - b);
      
      return {
        success: true,
        data: niveles,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener niveles disponibles',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene roles de gobernanza agrupados por nivel
   */
  async getRolesGobernanzaAgrupadosPorNivel(): Promise<ApiResponse<Record<number, RolGobernanza[]>>> {
    const response = await this.getAllRolesGobernanza();
    
    if (response.success && response.data) {
      const agrupados = response.data.reduce((acc, rol) => {
        if (!acc[rol.nivel]) {
          acc[rol.nivel] = [];
        }
        acc[rol.nivel].push(rol);
        return acc;
      }, {} as Record<number, RolGobernanza[]>);
      
      return {
        success: true,
        data: agrupados,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: {},
      message: response.message || 'Error al agrupar roles por nivel',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene colores únicos utilizados en los roles
   */
  async getColoresDisponibles(): Promise<ApiResponse<string[]>> {
    const response = await this.getAllRolesGobernanza();
    
    if (response.success && response.data) {
      const colores = [...new Set(
        response.data
          .map(item => item.color)
          .filter(color => color !== null && color !== undefined && color.trim() !== '')
      )].sort();
      
      return {
        success: true,
        data: colores,
        message: 'Colores obtenidos exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener colores disponibles',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene estadísticas de roles de gobernanza
   */
  async getEstadisticasRoles(): Promise<ApiResponse<{
    totalRoles: number;
    rolesActivos: number;
    rolesInactivos: number;
    distribucionPorNivel: Record<number, number>;
    distribucionPorEstado: Record<number, number>;
    coloresUtilizados: number;
    rolesConDescripcion: number;
  }>> {
    const response = await this.getAllRolesGobernanza({ includeDeleted: true });
    
    if (response.success && response.data) {
      const roles = response.data;
      
      const estadisticas = {
        totalRoles: roles.length,
        rolesActivos: roles.filter(r => r.estado === EstadoRolGobernanza.Activo).length,
        rolesInactivos: roles.filter(r => r.estado !== EstadoRolGobernanza.Activo).length,
        distribucionPorNivel: roles.reduce((acc, rol) => {
          acc[rol.nivel] = (acc[rol.nivel] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        distribucionPorEstado: roles.reduce((acc, rol) => {
          acc[rol.estado] = (acc[rol.estado] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        coloresUtilizados: new Set(
          roles.map(r => r.color).filter(color => color)
        ).size,
        rolesConDescripcion: roles.filter(r => r.rolGobernanzaDescripcion).length
      };
      
      return {
        success: true,
        data: estadisticas,
        message: 'Estadísticas obtenidas exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    }

    return {
      success: false,
      data: {
        totalRoles: 0,
        rolesActivos: 0,
        rolesInactivos: 0,
        distribucionPorNivel: {},
        distribucionPorEstado: {},
        coloresUtilizados: 0,
        rolesConDescripcion: 0
      },
      message: response.message || 'Error al obtener estadísticas',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Valida si se puede crear un rol con el código dado
   */
  async validarNuevoRol(command: CreateRolGobernanzaCommand): Promise<ApiResponse<{
    esValido: boolean;
    errores: string[];
    advertencias: string[];
  }>> {
    try {
      const errores: string[] = [];
      const advertencias: string[] = [];

      // Verificar código único
      const codigoExiste = await this.existeRolGobernanzaConCodigo(command.rolGobernanzaCodigo);
      if (codigoExiste.data) {
        errores.push(`Ya existe un rol con el código '${command.rolGobernanzaCodigo}'`);
      }

      // Verificar nivel válido
      if (command.nivel < 1 || command.nivel > 5) {
        errores.push('El nivel debe estar entre 1 y 5');
      }

      // Verificar roles existentes en el mismo nivel
      const rolesEnNivel = await this.getRolesGobernanzaByNivel(command.nivel);
      if (rolesEnNivel.success && rolesEnNivel.data && rolesEnNivel.data.length >= 5) {
        advertencias.push(`Ya existen ${rolesEnNivel.data.length} roles en el nivel ${command.nivel}`);
      }

      // Validaciones de formato
      if (command.rolGobernanzaCodigo.length < 3) {
        errores.push('El código debe tener al menos 3 caracteres');
      }

      if (command.rolGobernanzaNombre.length < 5) {
        errores.push('El nombre debe tener al menos 5 caracteres');
      }

      const esValido = errores.length === 0;

      return {
        success: true,
        data: { esValido, errores, advertencias },
        message: esValido ? 'Validación exitosa' : 'Se encontraron errores de validación',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: { esValido: false, errores: ['Error interno de validación'], advertencias: [] },
        message: 'Error al validar rol',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const rolGobernanzaService = new RolGobernanzaService(); 