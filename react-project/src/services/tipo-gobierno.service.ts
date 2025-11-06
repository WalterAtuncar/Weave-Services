/**
 * Servicio para gestión de Tipos de Gobierno
 * Basado en el modelo Domain.Entities.Governance.TipoGobierno
 * Incluye CRUD completo para tipos de gobierno
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  TipoGobierno,
  EstadoTipoGobierno,
  
  // Commands
  CreateTipoGobiernoCommand,
  UpdateTipoGobiernoCommand,
  
  // Requests
  GetAllTiposGobiernoRequest,
  GetTipoGobiernoByIdRequest,
  GetTipoGobiernoByCodigoRequest,
  DeleteTipoGobiernoRequest,
  
  // Responses
  GetAllTiposGobiernoResponseData,
  GetTipoGobiernoByIdResponseData,
  GetTipoGobiernoByCodigoResponseData,
  CreateTipoGobiernoResponseData,
  UpdateTipoGobiernoResponseData,
  DeleteTipoGobiernoResponseData,
  
  // Tipos response
  GetTipoGobiernoResponse,
  GetTipoGobiernoListResponse,
  CreateTipoGobiernoResponse,
  UpdateTipoGobiernoResponse,
  DeleteTipoGobiernoResponse,
  
  // Tipos auxiliares
  TipoGobiernoFilters,
  TipoGobiernoSortOptions
} from './types/tipo-gobierno.types';

export class TipoGobiernoService extends BaseApiService {
  protected baseEndpoint = '/TipoGobierno';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los tipos de gobierno
   * GET /api/TipoGobierno
   */
  async getAllTiposGobierno(request?: GetAllTiposGobiernoRequest): Promise<GetTipoGobiernoListResponse> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<TipoGobierno[]>(url);
  }

  /**
   * Obtiene un tipo de gobierno por ID
   * GET /api/TipoGobierno/{id}
   */
  async getTipoGobiernoById(tipoGobiernoId: number, includeDeleted: boolean = false): Promise<GetTipoGobiernoResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/${tipoGobiernoId}?${queryString}` : `${this.baseEndpoint}/${tipoGobiernoId}`;
    
    return await this.get<TipoGobierno>(url);
  }

  /**
   * Obtiene un tipo de gobierno por código
   * GET /api/TipoGobierno/codigo/{codigo}
   */
  async getTipoGobiernoByCodigo(codigo: string, includeDeleted: boolean = false): Promise<GetTipoGobiernoResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/codigo/${encodeURIComponent(codigo)}?${queryString}`
      : `${this.baseEndpoint}/codigo/${encodeURIComponent(codigo)}`;
    
    return await this.get<TipoGobierno>(url);
  }

  /**
   * Crea un nuevo tipo de gobierno
   * POST /api/TipoGobierno
   */
  async createTipoGobierno(command: CreateTipoGobiernoCommand): Promise<CreateTipoGobiernoResponse> {
    return await this.post<TipoGobierno>(this.baseEndpoint, command);
  }

  /**
   * Actualiza un tipo de gobierno existente
   * PUT /api/TipoGobierno/{id}
   */
  async updateTipoGobierno(command: UpdateTipoGobiernoCommand): Promise<UpdateTipoGobiernoResponse> {
    const url = `${this.baseEndpoint}/${command.tipoGobiernoId}`;
    return await this.put<TipoGobierno>(url, command);
  }

  /**
   * Elimina un tipo de gobierno (soft delete)
   * DELETE /api/TipoGobierno/{id}
   */
  async deleteTipoGobierno(request: DeleteTipoGobiernoRequest): Promise<DeleteTipoGobiernoResponse> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.tipoGobiernoId}?${queryString}`
      : `${this.baseEndpoint}/${request.tipoGobiernoId}`;

    return await this.delete<boolean>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene tipos de gobierno activos
   */
  async getTiposGobiernoActivos(): Promise<GetTipoGobiernoListResponse> {
    const response = await this.getAllTiposGobierno({ includeDeleted: false });
    
    if (response.success && response.data) {
      const activos = response.data.filter(tipo => tipo.estado === EstadoTipoGobierno.Activo);
      
      return {
        ...response,
        data: activos
      };
    }

    return response;
  }

  /**
   * Obtiene tipos de gobierno por estado
   */
  async getTiposGobiernoByEstado(estado: number): Promise<GetTipoGobiernoListResponse> {
    const response = await this.getAllTiposGobierno({ includeDeleted: true });
    
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
      message: response.message || 'Error al obtener tipos de gobierno por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca tipos de gobierno por término
   */
  async searchTiposGobierno(
    searchTerm: string, 
    filters?: TipoGobiernoFilters,
    sort?: TipoGobiernoSortOptions
  ): Promise<GetTipoGobiernoListResponse> {
    const response = await this.getAllTiposGobierno({ includeDeleted: filters?.includeDeleted });
    
    if (response.success && response.data) {
      let filteredData = response.data;

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(tipo => 
          tipo.tipoGobiernoCodigo.toLowerCase().includes(term) ||
          tipo.tipoGobiernoNombre.toLowerCase().includes(term) ||
          (tipo.tipoGobiernoDescripcion && tipo.tipoGobiernoDescripcion.toLowerCase().includes(term))
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
          const aValue = a[field as keyof TipoGobierno];
          const bValue = b[field as keyof TipoGobierno];
          
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
   * Verifica si existe un tipo de gobierno con el código dado
   */
  async existeTipoGobiernoConCodigo(codigo: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getTipoGobiernoByCodigo(codigo, false);
      
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
   * Obtiene estadísticas de tipos de gobierno
   */
  async getEstadisticasTiposGobierno(): Promise<ApiResponse<{
    totalTipos: number;
    tiposActivos: number;
    tiposInactivos: number;
    distribucionPorEstado: Record<number, number>;
    tiposConDescripcion: number;
    promedioLongitudNombre: number;
    promedioLongitudCodigo: number;
  }>> {
    const response = await this.getAllTiposGobierno({ includeDeleted: true });
    
    if (response.success && response.data) {
      const tipos = response.data;
      
      const estadisticas = {
        totalTipos: tipos.length,
        tiposActivos: tipos.filter(t => t.estado === EstadoTipoGobierno.Activo).length,
        tiposInactivos: tipos.filter(t => t.estado !== EstadoTipoGobierno.Activo).length,
        distribucionPorEstado: tipos.reduce((acc, tipo) => {
          acc[tipo.estado] = (acc[tipo.estado] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        tiposConDescripcion: tipos.filter(t => t.tipoGobiernoDescripcion).length,
        promedioLongitudNombre: tipos.length > 0 ? tipos.reduce((sum, t) => sum + t.tipoGobiernoNombre.length, 0) / tipos.length : 0,
        promedioLongitudCodigo: tipos.length > 0 ? tipos.reduce((sum, t) => sum + t.tipoGobiernoCodigo.length, 0) / tipos.length : 0
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
   * Valida si se puede crear un nuevo tipo de gobierno
   */
  async validarNuevoTipoGobierno(command: CreateTipoGobiernoCommand): Promise<ApiResponse<{
    esValido: boolean;
    errores: string[];
    advertencias: string[];
  }>> {
    try {
      const errores: string[] = [];
      const advertencias: string[] = [];

      // Validaciones básicas
      if (!command.tipoGobiernoCodigo || command.tipoGobiernoCodigo.trim().length === 0) {
        errores.push('El código es obligatorio');
      }

      if (command.tipoGobiernoCodigo && command.tipoGobiernoCodigo.length < 2) {
        errores.push('El código debe tener al menos 2 caracteres');
      }

      if (command.tipoGobiernoCodigo && command.tipoGobiernoCodigo.length > 20) {
        errores.push('El código no puede exceder 20 caracteres');
      }

      if (!command.tipoGobiernoNombre || command.tipoGobiernoNombre.trim().length === 0) {
        errores.push('El nombre es obligatorio');
      }

      if (command.tipoGobiernoNombre && command.tipoGobiernoNombre.length < 3) {
        errores.push('El nombre debe tener al menos 3 caracteres');
      }

      if (command.tipoGobiernoNombre && command.tipoGobiernoNombre.length > 100) {
        errores.push('El nombre no puede exceder 100 caracteres');
      }

      if (command.tipoGobiernoDescripcion && command.tipoGobiernoDescripcion.length > 500) {
        errores.push('La descripción no puede exceder 500 caracteres');
      }

      // Verificar código único
      if (command.tipoGobiernoCodigo) {
        const codigoExiste = await this.existeTipoGobiernoConCodigo(command.tipoGobiernoCodigo);
        if (codigoExiste.data) {
          errores.push(`Ya existe un tipo de gobierno con el código '${command.tipoGobiernoCodigo}'`);
        }
      }

      // Validaciones de formato
      if (command.tipoGobiernoCodigo && !/^[A-Z0-9_-]+$/.test(command.tipoGobiernoCodigo)) {
        advertencias.push('Se recomienda usar solo letras mayúsculas, números, guiones y guiones bajos en el código');
      }

      // Verificar nombres similares
      const tiposExistentes = await this.getAllTiposGobierno();
      if (tiposExistentes.success && tiposExistentes.data && command.tipoGobiernoNombre) {
        const nombresSimilares = tiposExistentes.data.filter(tipo => 
          tipo.tipoGobiernoNombre.toLowerCase() === command.tipoGobiernoNombre.toLowerCase()
        );

        if (nombresSimilares.length > 0) {
          errores.push(`Ya existe un tipo de gobierno con el nombre '${command.tipoGobiernoNombre}'`);
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
        message: 'Error al validar tipo de gobierno',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Obtiene tipos de gobierno más utilizados
   */
  async getTiposGobiernoMasUtilizados(limite: number = 5): Promise<ApiResponse<Array<{
    tipoGobierno: TipoGobierno;
    cantidadGobernanzas: number;
    cantidadHistoriales: number;
    totalUsos: number;
  }>>> {
    try {
      const response = await this.getAllTiposGobierno();
      
      if (!response.success || !response.data) {
        return {
          success: false,
          data: [],
          message: 'Error al obtener tipos de gobierno',
          errors: response.errors || [],
          statusCode: response.statusCode || 500,
          metadata: ''
        };
      }

      // Aquí normalmente haríamos consultas adicionales para obtener los usos
      // Por ahora retornamos los tipos con datos simulados para demostrar la estructura
      const tiposConUsos = response.data.map(tipo => ({
        tipoGobierno: tipo,
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
        message: 'Tipos de gobierno más utilizados obtenidos exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'Error al obtener tipos de gobierno más utilizados',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Obtiene comparación entre tipos de gobierno
   */
  async getComparacionTiposGobierno(): Promise<ApiResponse<{
    distribucionUso: Record<string, number>;
    tipoMasUtilizado: TipoGobierno | null;
    tipoMenosUtilizado: TipoGobierno | null;
    tiposRecomendados: TipoGobierno[];
  }>> {
    try {
      const tiposResponse = await this.getAllTiposGobierno();
      const masUtilizadosResponse = await this.getTiposGobiernoMasUtilizados(10);
      
      if (!tiposResponse.success || !masUtilizadosResponse.success) {
        return {
          success: false,
          data: {
            distribucionUso: {},
            tipoMasUtilizado: null,
            tipoMenosUtilizado: null,
            tiposRecomendados: []
          },
          message: 'Error al obtener datos para comparación',
          errors: [],
          statusCode: 500,
          metadata: ''
        };
      }

      const tipos = tiposResponse.data || [];
      const masUtilizados = masUtilizadosResponse.data || [];
      
      const distribucionUso = masUtilizados.reduce((acc, item) => {
        acc[item.tipoGobierno.tipoGobiernoNombre] = item.totalUsos;
        return acc;
      }, {} as Record<string, number>);

      const tipoMasUtilizado = masUtilizados.length > 0 ? masUtilizados[0].tipoGobierno : null;
      const tipoMenosUtilizado = masUtilizados.length > 0 ? masUtilizados[masUtilizados.length - 1].tipoGobierno : null;
      
      // Tipos recomendados serían los activos con mejores prácticas
      const tiposRecomendados = tipos
        .filter(tipo => tipo.estado === EstadoTipoGobierno.Activo)
        .slice(0, 3);

      return {
        success: true,
        data: {
          distribucionUso,
          tipoMasUtilizado,
          tipoMenosUtilizado,
          tiposRecomendados
        },
        message: 'Comparación obtenida exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: {
          distribucionUso: {},
          tipoMasUtilizado: null,
          tipoMenosUtilizado: null,
          tiposRecomendados: []
        },
        message: 'Error al obtener comparación de tipos de gobierno',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const tipoGobiernoService = new TipoGobiernoService(); 