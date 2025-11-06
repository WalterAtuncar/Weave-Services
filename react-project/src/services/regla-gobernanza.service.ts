/**
 * Servicio para gestión de Reglas de Gobernanza
 * Actualizado según el modelo Domain.Entities.Governance.ReglaGobernanza
 * Incluye CRUD completo y validaciones de reglas
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  ReglaGobernanza,
  EstadoReglaGobernanza,
  
  // Commands
  CreateReglaGobernanzaCommand,
  UpdateReglaGobernanzaCommand,
  
  // Requests
  GetAllReglasGobernanzaRequest,
  GetReglaGobernanzaByIdRequest,
  GetReglasGobernanzaByRolRequest,
  GetReglasGobernanzaPaginatedRequest,
  DeleteReglaGobernanzaRequest,
  
  // Responses
  GetAllReglasGobernanzaResponseData,
  GetReglaGobernanzaByIdResponseData,
  GetReglasGobernanzaByRolResponseData,
  ReglasGobernanzaPaginatedResponseData,
  CreateReglaGobernanzaResponseData,
  UpdateReglaGobernanzaResponseData,
  DeleteReglaGobernanzaResponseData,
  
  // Tipos response
  GetReglaGobernanzaResponse,
  GetReglaGobernanzaListResponse,
  CreateReglaGobernanzaResponse,
  UpdateReglaGobernanzaResponse,
  DeleteReglaGobernanzaResponse,
  
  // Tipos auxiliares
  ReglasGobernanzaFilters,
  ReglasGobernanzaSortOptions
} from './types/regla-gobernanza.types';

export class ReglaGobernanzaService extends BaseApiService {
  protected baseEndpoint = '/ReglaGobernanza';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todas las reglas de gobernanza
   * GET /api/ReglaGobernanza
   */
  async getAllReglasGobernanza(request?: GetAllReglasGobernanzaRequest): Promise<GetReglaGobernanzaListResponse> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<ReglaGobernanza[]>(url);
  }

  /**
   * Obtiene una regla de gobernanza por ID
   * GET /api/ReglaGobernanza/{id}
   */
  async getReglaGobernanzaById(reglaGobernanzaId: number, includeDeleted: boolean = false): Promise<GetReglaGobernanzaResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/${reglaGobernanzaId}?${queryString}` : `${this.baseEndpoint}/${reglaGobernanzaId}`;
    
    return await this.get<ReglaGobernanza>(url);
  }

  /**
   * Obtiene reglas de gobernanza por rol
   * GET /api/ReglaGobernanza/rol/{rolGobernanzaId}
   */
  async getReglasGobernanzaByRol(rolGobernanzaId: number, includeDeleted: boolean = false): Promise<GetReglaGobernanzaListResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/rol/${rolGobernanzaId}?${queryString}` : `${this.baseEndpoint}/rol/${rolGobernanzaId}`;
    
    return await this.get<ReglaGobernanza[]>(url);
  }

  /**
   * Obtiene reglas de gobernanza paginadas
   * GET /api/ReglaGobernanza/paginated
   */
  async getReglasGobernanzaPaginated(request?: GetReglasGobernanzaPaginatedRequest): Promise<ApiResponse<ReglasGobernanzaPaginatedResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.page !== undefined) {
      params.append('pageNumber', request.page.toString());
    } else {
      params.append('pageNumber', '1');
    }
    
    if (request?.pageSize !== undefined) {
      params.append('pageSize', request.pageSize.toString());
    } else {
      params.append('pageSize', '10');
    }
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    } else {
      params.append('includeDeleted', 'false');
    }
    
    if (request?.orderBy) {
      params.append('orderBy', request.orderBy);
    }
    
    if (request?.orderDescending !== undefined) {
      params.append('orderDescending', request.orderDescending.toString());
    }
    
    if (request?.estado !== undefined) {
      params.append('estado', request.estado.toString());
    }
    
    if (request?.rolGobernanzaId !== undefined) {
      params.append('rolGobernanzaId', request.rolGobernanzaId.toString());
    }
    
    if (request?.esObligatorio !== undefined) {
      params.append('esObligatorio', request.esObligatorio.toString());
    }
    
    if (request?.tieneAlertaVencimiento !== undefined) {
      params.append('tieneAlertaVencimiento', request.tieneAlertaVencimiento.toString());
    }
    
    if (request?.minimoUsuarios !== undefined) {
      params.append('minimoUsuarios', request.minimoUsuarios.toString());
    }
    
    if (request?.maximoUsuarios !== undefined) {
      params.append('maximoUsuarios', request.maximoUsuarios.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseEndpoint}/paginated?${queryString}`;
    
    return await this.get<ReglasGobernanzaPaginatedResponseData>(url);
  }

  /**
   * Crea una nueva regla de gobernanza
   * POST /api/ReglaGobernanza
   */
  async createReglaGobernanza(command: CreateReglaGobernanzaCommand): Promise<CreateReglaGobernanzaResponse> {
    return await this.post<ReglaGobernanza>(this.baseEndpoint, command);
  }

  /**
   * Actualiza una regla de gobernanza existente
   * PUT /api/ReglaGobernanza/{id}
   */
  async updateReglaGobernanza(command: UpdateReglaGobernanzaCommand): Promise<UpdateReglaGobernanzaResponse> {
    const url = `${this.baseEndpoint}/${command.reglaGobernanzaId}`;
    return await this.put<ReglaGobernanza>(url, command);
  }

  /**
   * Elimina una regla de gobernanza (soft delete)
   * DELETE /api/ReglaGobernanza/{id}
   */
  async deleteReglaGobernanza(request: DeleteReglaGobernanzaRequest): Promise<DeleteReglaGobernanzaResponse> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.reglaGobernanzaId}?${queryString}`
      : `${this.baseEndpoint}/${request.reglaGobernanzaId}`;

    return await this.delete<boolean>(url);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene reglas de gobernanza activas
   */
  async getReglasGobernanzaActivas(): Promise<GetReglaGobernanzaListResponse> {
    const response = await this.getAllReglasGobernanza({ includeDeleted: false });
    
    if (response.success && response.data) {
      const activas = response.data.filter(regla => regla.estado === EstadoReglaGobernanza.Activo);
      
      return {
        ...response,
        data: activas
      };
    }

    return response;
  }

  /**
   * Obtiene reglas de gobernanza por estado
   */
  async getReglasGobernanzaByEstado(estado: number): Promise<GetReglaGobernanzaListResponse> {
    const response = await this.getAllReglasGobernanza({ includeDeleted: true });
    
    if (response.success && response.data) {
      const filtradas = response.data.filter(regla => regla.estado === estado);
      
      return {
        ...response,
        data: filtradas
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener reglas por estado',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca reglas de gobernanza por término
   */
  async searchReglasGobernanza(
    searchTerm: string, 
    filters?: ReglasGobernanzaFilters,
    sort?: ReglasGobernanzaSortOptions
  ): Promise<GetReglaGobernanzaListResponse> {
    const response = await this.getAllReglasGobernanza({ includeDeleted: filters?.includeDeleted });
    
    if (response.success && response.data) {
      let filteredData = response.data;

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(regla => {
          // Buscar en campos de texto disponibles en ReglaGobernanza
          const searchableText = [
            regla.rolGobernanzaId?.toString(),
            regla.maximoUsuarios?.toString(),
            regla.minimoUsuarios?.toString(),
            regla.diasAlertaVencimiento?.toString(),
            regla.configuracionJson
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchableText.includes(term);
        });
      }

      // Aplicar filtros adicionales
      if (filters?.estado !== undefined) {
        filteredData = filteredData.filter(regla => regla.estado === filters.estado);
      }
      
      if (filters?.rolGobernanzaId !== undefined) {
        filteredData = filteredData.filter(regla => regla.rolGobernanzaId === filters.rolGobernanzaId);
      }

      if (filters?.esObligatorio !== undefined) {
        filteredData = filteredData.filter(regla => regla.esObligatorio === filters.esObligatorio);
      }

      if (filters?.tieneAlertaVencimiento !== undefined) {
        const tieneAlerta = filters.tieneAlertaVencimiento;
        filteredData = filteredData.filter(regla => 
          tieneAlerta ? (regla.diasAlertaVencimiento && regla.diasAlertaVencimiento > 0) : !regla.diasAlertaVencimiento
        );
      }

      // Aplicar ordenamiento
      if (sort?.orderBy) {
        filteredData.sort((a, b) => {
          const field = sort.orderBy!;
          const aValue = a[field as keyof ReglaGobernanza];
          const bValue = b[field as keyof ReglaGobernanza];
          
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
   * Valida reglas de gobernanza para un rol específico
   */
  async validarReglasParaRol(rolGobernanzaId: number): Promise<ApiResponse<{
    esValido: boolean;
    errores: string[];
    advertencias: string[];
    reglas: ReglaGobernanza[];
  }>> {
    try {
      const response = await this.getReglasGobernanzaByRol(rolGobernanzaId, false);
      
      if (!response.success) {
        return {
          success: false,
          data: { esValido: false, errores: ['Error al obtener reglas del rol'], advertencias: [], reglas: [] },
          message: response.message || 'Error al validar reglas',
          errors: response.errors || [],
          statusCode: response.statusCode || 500,
          metadata: ''
        };
      }

      const reglas = response.data || [];
      const errores: string[] = [];
      const advertencias: string[] = [];

      // Validaciones de consistencia
      reglas.forEach((regla, index) => {
        if (regla.minimoUsuarios > regla.maximoUsuarios) {
          errores.push(`Regla ${index + 1}: El mínimo de usuarios (${regla.minimoUsuarios}) no puede ser mayor al máximo (${regla.maximoUsuarios})`);
        }

        if (regla.minimoUsuarios <= 0) {
          errores.push(`Regla ${index + 1}: El mínimo de usuarios debe ser mayor a 0`);
        }

        if (regla.maximoUsuarios <= 0) {
          errores.push(`Regla ${index + 1}: El máximo de usuarios debe ser mayor a 0`);
        }

        if (regla.diasAlertaVencimiento && regla.diasAlertaVencimiento < 0) {
          errores.push(`Regla ${index + 1}: Los días de alerta no pueden ser negativos`);
        }

        if (regla.diasAlertaVencimiento && regla.diasAlertaVencimiento > 365) {
          advertencias.push(`Regla ${index + 1}: Los días de alerta (${regla.diasAlertaVencimiento}) son muy altos (más de 1 año)`);
        }
      });

      // Validar duplicados
      const configuracionesUnicas = new Set();
      reglas.forEach((regla, index) => {
        const key = `${regla.minimoUsuarios}-${regla.maximoUsuarios}-${regla.esObligatorio}`;
        if (configuracionesUnicas.has(key)) {
          advertencias.push(`Regla ${index + 1}: Configuración duplicada encontrada`);
        }
        configuracionesUnicas.add(key);
      });

      const esValido = errores.length === 0;

      return {
        success: true,
        data: { esValido, errores, advertencias, reglas },
        message: esValido ? 'Validación exitosa' : 'Se encontraron errores de validación',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: { esValido: false, errores: ['Error interno de validación'], advertencias: [], reglas: [] },
        message: 'Error al validar reglas',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Obtiene estadísticas de reglas de gobernanza
   */
  async getEstadisticasReglas(): Promise<ApiResponse<{
    totalReglas: number;
    reglasActivas: number;
    reglasInactivas: number;
    reglasObligatorias: number;
    reglasConAlerta: number;
    distribucionPorRol: Record<number, number>;
    distribucionPorEstado: Record<number, number>;
    promedioMinUsuarios: number;
    promedioMaxUsuarios: number;
    promedioDiasAlerta: number;
  }>> {
    const response = await this.getAllReglasGobernanza({ includeDeleted: true });
    
    if (response.success && response.data) {
      const reglas = response.data;
      
      const reglasConAlerta = reglas.filter(r => r.diasAlertaVencimiento && r.diasAlertaVencimiento > 0);
      const diasAlertaValues = reglasConAlerta.map(r => r.diasAlertaVencimiento!).filter(d => d > 0);
      
      const estadisticas = {
        totalReglas: reglas.length,
        reglasActivas: reglas.filter(r => r.estado === EstadoReglaGobernanza.Activo).length,
        reglasInactivas: reglas.filter(r => r.estado !== EstadoReglaGobernanza.Activo).length,
        reglasObligatorias: reglas.filter(r => r.esObligatorio).length,
        reglasConAlerta: reglasConAlerta.length,
        distribucionPorRol: reglas.reduce((acc, regla) => {
          acc[regla.rolGobernanzaId] = (acc[regla.rolGobernanzaId] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        distribucionPorEstado: reglas.reduce((acc, regla) => {
          acc[regla.estado] = (acc[regla.estado] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        promedioMinUsuarios: reglas.length > 0 ? reglas.reduce((sum, r) => sum + r.minimoUsuarios, 0) / reglas.length : 0,
        promedioMaxUsuarios: reglas.length > 0 ? reglas.reduce((sum, r) => sum + r.maximoUsuarios, 0) / reglas.length : 0,
        promedioDiasAlerta: diasAlertaValues.length > 0 ? diasAlertaValues.reduce((sum, d) => sum + d, 0) / diasAlertaValues.length : 0
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
        totalReglas: 0,
        reglasActivas: 0,
        reglasInactivas: 0,
        reglasObligatorias: 0,
        reglasConAlerta: 0,
        distribucionPorRol: {},
        distribucionPorEstado: {},
        promedioMinUsuarios: 0,
        promedioMaxUsuarios: 0,
        promedioDiasAlerta: 0
      },
      message: response.message || 'Error al obtener estadísticas',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Valida si se puede crear una nueva regla
   */
  async validarNuevaRegla(command: CreateReglaGobernanzaCommand): Promise<ApiResponse<{
    esValido: boolean;
    errores: string[];
    advertencias: string[];
  }>> {
    try {
      const errores: string[] = [];
      const advertencias: string[] = [];

      // Validaciones básicas
      if (command.minimoUsuarios <= 0) {
        errores.push('El mínimo de usuarios debe ser mayor a 0');
      }

      if (command.maximoUsuarios <= 0) {
        errores.push('El máximo de usuarios debe ser mayor a 0');
      }

      if (command.minimoUsuarios > command.maximoUsuarios) {
        errores.push('El mínimo de usuarios no puede ser mayor al máximo');
      }

      if (command.diasAlertaVencimiento && command.diasAlertaVencimiento < 0) {
        errores.push('Los días de alerta no pueden ser negativos');
      }

      if (command.diasAlertaVencimiento && command.diasAlertaVencimiento > 365) {
        advertencias.push('Los días de alerta son muy altos (más de 1 año)');
      }

      // Verificar reglas existentes para el rol
      const reglasExistentes = await this.getReglasGobernanzaByRol(command.rolGobernanzaId);
      
      if (reglasExistentes.success && reglasExistentes.data) {
        const reglasSimilares = reglasExistentes.data.filter(regla => 
          regla.minimoUsuarios === command.minimoUsuarios && 
          regla.maximoUsuarios === command.maximoUsuarios &&
          regla.esObligatorio === command.esObligatorio
        );

        if (reglasSimilares.length > 0) {
          advertencias.push('Ya existe una regla con configuración similar para este rol');
        }

        if (reglasExistentes.data.length >= 5) {
          advertencias.push(`El rol ya tiene ${reglasExistentes.data.length} reglas asociadas`);
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
        message: 'Error al validar regla',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const reglaGobernanzaService = new ReglaGobernanzaService(); 