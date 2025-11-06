/**
 * Servicio para gestión de Tipos de Entidad
 * Basado en el modelo Domain.Entities.Governance.TipoEntidad
 * Incluye CRUD completo para tipos de entidad
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  TipoEntidad,
  EstadoTipoEntidad,
  
  // Commands
  CreateTipoEntidadCommand,
  UpdateTipoEntidadCommand,
  
  // Requests
  GetAllTiposEntidadRequest,
  GetTipoEntidadByIdRequest,
  GetTipoEntidadByCodigoRequest,
  DeleteTipoEntidadRequest,
  
  // Responses
  GetAllTiposEntidadResponseData,
  GetTipoEntidadByIdResponseData,
  GetTipoEntidadByCodigoResponseData,
  CreateTipoEntidadResponseData,
  UpdateTipoEntidadResponseData,
  DeleteTipoEntidadResponseData,
  
  // Tipos response
  GetTipoEntidadResponse,
  GetTipoEntidadListResponse,
  CreateTipoEntidadResponse,
  UpdateTipoEntidadResponse,
  DeleteTipoEntidadResponse,
  
  // Tipos auxiliares
  TipoEntidadFilters,
  TipoEntidadSortOptions
} from './types/tipo-entidad.types';

export class TipoEntidadService extends BaseApiService {
  protected baseEndpoint = '/TipoEntidad';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los tipos de entidad
   * GET /api/TipoEntidad
   */
  async getAllTiposEntidad(request?: GetAllTiposEntidadRequest): Promise<GetTipoEntidadListResponse> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<TipoEntidad[]>(url);
  }

  /**
   * Obtiene un tipo de entidad por ID
   * GET /api/TipoEntidad/{id}
   */
  async getTipoEntidadById(tipoEntidadId: number, includeDeleted: boolean = false): Promise<GetTipoEntidadResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/${tipoEntidadId}?${queryString}` : `${this.baseEndpoint}/${tipoEntidadId}`;
    
    return await this.get<TipoEntidad>(url);
  }

  /**
   * Obtiene un tipo de entidad por código
   * GET /api/TipoEntidad/codigo/{codigo}
   */
  async getTipoEntidadByCodigo(codigo: string, includeDeleted: boolean = false): Promise<GetTipoEntidadResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/codigo/${encodeURIComponent(codigo)}?${queryString}`
      : `${this.baseEndpoint}/codigo/${encodeURIComponent(codigo)}`;
    
    return await this.get<TipoEntidad>(url);
  }

  /**
   * Crea un nuevo tipo de entidad
   * POST /api/TipoEntidad
   */
  async createTipoEntidad(command: CreateTipoEntidadCommand): Promise<CreateTipoEntidadResponse> {
    return await this.post<TipoEntidad>(this.baseEndpoint, command);
  }

  /**
   * Actualiza un tipo de entidad existente
   * PUT /api/TipoEntidad/{id}
   */
  async updateTipoEntidad(command: UpdateTipoEntidadCommand): Promise<UpdateTipoEntidadResponse> {
    const url = `${this.baseEndpoint}/${command.tipoEntidadId}`;
    return await this.put<TipoEntidad>(url, command);
  }

  /**
   * Elimina un tipo de entidad (soft delete)
   * DELETE /api/TipoEntidad/{id}
   */
  async deleteTipoEntidad(request: DeleteTipoEntidadRequest): Promise<DeleteTipoEntidadResponse> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.tipoEntidadId}?${queryString}`
      : `${this.baseEndpoint}/${request.tipoEntidadId}`;

    return await this.delete<boolean>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene tipos de entidad activos
   */
  async getTiposEntidadActivos(): Promise<GetTipoEntidadListResponse> {
    const response = await this.getAllTiposEntidad({ includeDeleted: false });
    
    if (response.success && response.data) {
      const activos = response.data.filter(tipo => tipo.estado === EstadoTipoEntidad.Activo);
      
      return {
        ...response,
        data: activos
      };
    }

    return response;
  }

  /**
   * Obtiene tipos de entidad por estado
   */
  async getTiposEntidadByEstado(estado: number): Promise<GetTipoEntidadListResponse> {
    const response = await this.getAllTiposEntidad({ includeDeleted: true });
    
    if (response.success && response.data) {
      const filtrados = response.data.filter(tipo => tipo.estado === estado);
      
      return {
        ...response,
        data: filtrados
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener tipos de entidad por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca tipos de entidad por término
   */
  async searchTiposEntidad(
    searchTerm: string, 
    filters?: TipoEntidadFilters,
    sort?: TipoEntidadSortOptions
  ): Promise<GetTipoEntidadListResponse> {
    const response = await this.getAllTiposEntidad({ includeDeleted: filters?.includeDeleted });
    
    if (response.success && response.data) {
      let filteredData = response.data;

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(tipo => 
          tipo.tipoEntidadCodigo.toLowerCase().includes(term) ||
          tipo.tipoEntidadNombre.toLowerCase().includes(term) ||
          (tipo.tipoEntidadDescripcion && tipo.tipoEntidadDescripcion.toLowerCase().includes(term))
        );
      }

      // Aplicar filtros adicionales
      if (filters?.estado !== undefined) {
        filteredData = filteredData.filter(tipo => tipo.estado === filters.estado);
      }

      // Aplicar ordenamiento
      if (sort?.orderBy) {
        filteredData.sort((a, b) => {
          const field = sort.orderBy!;
          const aValue = a[field as keyof TipoEntidad];
          const bValue = b[field as keyof TipoEntidad];
          
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
   * Verifica si existe un tipo de entidad con el código dado
   */
  async existeTipoEntidadConCodigo(codigo: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getTipoEntidadByCodigo(codigo, false);
      
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
   * Obtiene estadísticas de tipos de entidad
   */
  async getEstadisticasTiposEntidad(): Promise<ApiResponse<{
    totalTipos: number;
    tiposActivos: number;
    tiposInactivos: number;
    distribucionPorEstado: Record<number, number>;
    tiposConDescripcion: number;
    promedioLongitudNombre: number;
    promedioLongitudCodigo: number;
  }>> {
    const response = await this.getAllTiposEntidad({ includeDeleted: true });
    
    if (response.success && response.data) {
      const tipos = response.data;
      
      const estadisticas = {
        totalTipos: tipos.length,
        tiposActivos: tipos.filter(t => t.estado === EstadoTipoEntidad.Activo).length,
        tiposInactivos: tipos.filter(t => t.estado !== EstadoTipoEntidad.Activo).length,
        distribucionPorEstado: tipos.reduce((acc, tipo) => {
          acc[tipo.estado] = (acc[tipo.estado] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        tiposConDescripcion: tipos.filter(t => t.tipoEntidadDescripcion).length,
        promedioLongitudNombre: tipos.length > 0 ? tipos.reduce((sum, t) => sum + t.tipoEntidadNombre.length, 0) / tipos.length : 0,
        promedioLongitudCodigo: tipos.length > 0 ? tipos.reduce((sum, t) => sum + t.tipoEntidadCodigo.length, 0) / tipos.length : 0
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
        totalTipos: 0,
        tiposActivos: 0,
        tiposInactivos: 0,
        distribucionPorEstado: {},
        tiposConDescripcion: 0,
        promedioLongitudNombre: 0,
        promedioLongitudCodigo: 0
      },
      message: response.message || 'Error al obtener estadísticas',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Valida si se puede crear un nuevo tipo de entidad
   */
  async validarNuevoTipoEntidad(command: CreateTipoEntidadCommand): Promise<ApiResponse<{
    esValido: boolean;
    errores: string[];
    advertencias: string[];
  }>> {
    try {
      const errores: string[] = [];
      const advertencias: string[] = [];

      // Validaciones básicas
      if (!command.tipoEntidadCodigo || command.tipoEntidadCodigo.trim().length === 0) {
        errores.push('El código es obligatorio');
      }

      if (command.tipoEntidadCodigo && command.tipoEntidadCodigo.length < 2) {
        errores.push('El código debe tener al menos 2 caracteres');
      }

      if (command.tipoEntidadCodigo && command.tipoEntidadCodigo.length > 20) {
        errores.push('El código no puede exceder 20 caracteres');
      }

      if (!command.tipoEntidadNombre || command.tipoEntidadNombre.trim().length === 0) {
        errores.push('El nombre es obligatorio');
      }

      if (command.tipoEntidadNombre && command.tipoEntidadNombre.length < 3) {
        errores.push('El nombre debe tener al menos 3 caracteres');
      }

      if (command.tipoEntidadNombre && command.tipoEntidadNombre.length > 100) {
        errores.push('El nombre no puede exceder 100 caracteres');
      }

      if (command.tipoEntidadDescripcion && command.tipoEntidadDescripcion.length > 500) {
        errores.push('La descripción no puede exceder 500 caracteres');
      }

      // Verificar código único
      if (command.tipoEntidadCodigo) {
        const codigoExiste = await this.existeTipoEntidadConCodigo(command.tipoEntidadCodigo);
        if (codigoExiste.data) {
          errores.push(`Ya existe un tipo de entidad con el código '${command.tipoEntidadCodigo}'`);
        }
      }

      // Validaciones de formato
      if (command.tipoEntidadCodigo && !/^[A-Z0-9_-]+$/.test(command.tipoEntidadCodigo)) {
        advertencias.push('Se recomienda usar solo letras mayúsculas, números, guiones y guiones bajos en el código');
      }

      // Verificar nombres similares
      const tiposExistentes = await this.getAllTiposEntidad();
      if (tiposExistentes.success && tiposExistentes.data && command.tipoEntidadNombre) {
        const nombresSimilares = tiposExistentes.data.filter(tipo => 
          tipo.tipoEntidadNombre.toLowerCase() === command.tipoEntidadNombre.toLowerCase()
        );

        if (nombresSimilares.length > 0) {
          errores.push(`Ya existe un tipo de entidad con el nombre '${command.tipoEntidadNombre}'`);
        }
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
        message: 'Error al validar tipo de entidad',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Obtiene tipos de entidad más utilizados
   */
  async getTiposEntidadMasUtilizados(limite: number = 5): Promise<ApiResponse<Array<{
    tipoEntidad: TipoEntidad;
    cantidadGobernanzas: number;
    cantidadHistoriales: number;
    totalUsos: number;
  }>>> {
    try {
      const response = await this.getAllTiposEntidad();
      
      if (!response.success || !response.data) {
        return {
          success: false,
          data: [],
          message: 'Error al obtener tipos de entidad',
          errors: response.errors || [],
          statusCode: response.statusCode || 500,
          metadata: ''
        };
      }

      // Aquí normalmente haríamos consultas adicionales para obtener los usos
      // Por ahora retornamos los tipos con datos simulados para demostrar la estructura
      const tiposConUsos = response.data.map(tipo => ({
        tipoEntidad: tipo,
        cantidadGobernanzas: 0, // Se obtendría de la consulta a gobernanzas
        cantidadHistoriales: 0, // Se obtendría de la consulta a historiales
        totalUsos: 0
      }));

      // Ordenar por total de usos y limitar
      const masUtilizados = tiposConUsos
        .sort((a, b) => b.totalUsos - a.totalUsos)
        .slice(0, limite);

      return {
        success: true,
        data: masUtilizados,
        message: 'Tipos de entidad más utilizados obtenidos exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'Error al obtener tipos de entidad más utilizados',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const tipoEntidadService = new TipoEntidadService(); 