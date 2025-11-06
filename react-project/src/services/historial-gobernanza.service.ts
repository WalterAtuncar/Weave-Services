/**
 * Servicio para gestión de historial de gobernanza
 * Implementa todos los endpoints del controlador HistorialGobernanzaController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  HistorialGobernanza,
  HistorialGobernanzaCompleta,
  
  // Commands
  CreateHistorialGobernanzaCommand,
  UpdateHistorialGobernanzaCommand,
  
  // Requests
  GetAllHistorialGobernanzaRequest,
  GetHistorialGobernanzaByIdRequest,
  GetHistorialPaginatedRequest,
  
  // Responses
  GetAllHistorialGobernanzaResponseData,
  GetHistorialGobernanzaByIdResponseData,
  CreateHistorialGobernanzaResponseData,
  UpdateHistorialGobernanzaResponseData,
  DeleteHistorialGobernanzaResponseData,
  HistorialGobernanzaPaginatedResponseData,
  
  // Tipos auxiliares
  HistorialGobernanzaFilters,
  HistorialGobernanzaSortOptions,
  HistorialGobernanzaPaginationOptions
} from './types/historial-gobernanza.types';

export class HistorialGobernanzaService extends BaseApiService {
  protected baseEndpoint = '/HistorialGobernanza';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Crear un nuevo registro de historial de gobernanza
   * POST /api/HistorialGobernanza
   */
  async createHistorialGobernanza(command: CreateHistorialGobernanzaCommand): Promise<ApiResponse<number>> {
    return await this.post<number>(this.baseEndpoint, command);
  }

  /**
   * Obtener un registro de historial de gobernanza por ID
   * GET /api/HistorialGobernanza/{historialGobernanzaId}
   */
  async getHistorialGobernanzaById(request: GetHistorialGobernanzaByIdRequest): Promise<ApiResponse<GetHistorialGobernanzaByIdResponseData>> {
    const params = new URLSearchParams();
    
    if (request.includeDeleted) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.historialGobernanzaId}?${queryString}`
      : `${this.baseEndpoint}/${request.historialGobernanzaId}`;

    return await this.get<HistorialGobernanza>(url);
  }

  /**
   * Obtener todos los registros de historial de gobernanza
   * GET /api/HistorialGobernanza
   */
  async getAllHistorialGobernanza(request?: GetAllHistorialGobernanzaRequest): Promise<ApiResponse<GetAllHistorialGobernanzaResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<HistorialGobernanza[]>(url);
  }

  /**
   * Obtener historial de gobernanza paginado
   * GET /api/HistorialGobernanza/paginated
   */
  async getHistorialGobernanzaPaginated(request?: GetHistorialPaginatedRequest): Promise<ApiResponse<HistorialGobernanzaPaginatedResponseData>> {
    const params = new URLSearchParams();

    if (request?.page !== undefined) params.append('Page', request.page.toString());
    if (request?.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
    if (request?.includeDeleted !== undefined) params.append('IncludeDeleted', request.includeDeleted.toString());
    if (request?.orderBy) params.append('OrderBy', request.orderBy);
    if (request?.orderDescending !== undefined) params.append('Ascending', (!request.orderDescending).toString());

    const url = `${this.baseEndpoint}/paginated?${params.toString()}`;
    return await this.get<HistorialGobernanzaPaginatedResponseData>(url);
  }

  /**
   * Actualizar un registro de historial de gobernanza existente
   * PUT /api/HistorialGobernanza/{historialGobernanzaId}
   */
  async updateHistorialGobernanza(historialGobernanzaId: number, command: UpdateHistorialGobernanzaCommand): Promise<ApiResponse<UpdateHistorialGobernanzaResponseData>> {
    const url = `${this.baseEndpoint}/${historialGobernanzaId}`;
    return await this.put<boolean>(url, command);
  }

  /**
   * Eliminar un registro de historial de gobernanza (soft delete)
   * DELETE /api/HistorialGobernanza/{historialGobernanzaId}
   */
  async deleteHistorialGobernanza(historialGobernanzaId: number): Promise<ApiResponse<DeleteHistorialGobernanzaResponseData>> {
    const url = `${this.baseEndpoint}/${historialGobernanzaId}`;
    return await this.delete<boolean>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Buscar historial por filtros con paginación
   */
  async searchHistorialGobernanza(
    filters?: HistorialGobernanzaFilters,
    pagination?: HistorialGobernanzaPaginationOptions,
    sort?: HistorialGobernanzaSortOptions
  ): Promise<ApiResponse<HistorialGobernanzaPaginatedResponseData>> {
    const request: GetHistorialPaginatedRequest = {
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 10,
      orderBy: sort?.field || 'fechaInicio',
      orderDescending: sort?.direction === 'desc',
      includeDeleted: filters?.includeDeleted,
      ...filters
    };

    return await this.getHistorialGobernanzaPaginated(request);
  }

  /**
   * Obtener historial por gobernanza
   */
  async getHistorialByGobernanza(gobernanzaId: number, includeDeleted: boolean = false): Promise<ApiResponse<HistorialGobernanza[]>> {
    const request: GetAllHistorialGobernanzaRequest = {
      includeDeleted,
      gobernanzaId
    };

    const response = await this.getAllHistorialGobernanza(request);
    
    if (response.success && response.data) {
      // Filtrar por gobernanzaId si es necesario
      const filteredData = response.data.filter(h => h.gobernanzaId === gobernanzaId);
      return {
        ...response,
        data: filteredData
      };
    }

    return response;
  }

  /**
   * Obtener historial por usuario
   */
  async getHistorialByUsuario(usuarioId: number, includeDeleted: boolean = false): Promise<ApiResponse<HistorialGobernanza[]>> {
    const request: GetAllHistorialGobernanzaRequest = {
      includeDeleted,
      usuarioId
    };

    const response = await this.getAllHistorialGobernanza(request);
    
    if (response.success && response.data) {
      // Filtrar por usuarioId (como usuario anterior o nuevo)
      const filteredData = response.data.filter(h => 
        h.usuarioAnterior === usuarioId || h.usuarioNuevo === usuarioId
      );
      return {
        ...response,
        data: filteredData
      };
    }

    return response;
  }

  /**
   * Obtener historial activo por gobernanza
   */
  async getHistorialActivoByGobernanza(gobernanzaId: number): Promise<ApiResponse<HistorialGobernanza[]>> {
    const request: GetAllHistorialGobernanzaRequest = {
      includeDeleted: false,
      gobernanzaId
    };

    const response = await this.getAllHistorialGobernanza(request);
    
    if (response.success && response.data) {
      // Filtrar por gobernanzaId y solo movimientos activos
      const filteredData = response.data.filter(h => 
        h.gobernanzaId === gobernanzaId && 
        h.esMovimientoActivo === true
      );
      return {
        ...response,
        data: filteredData
      };
    }

    return response;
  }

  /**
   * Obtener historial por tipo de movimiento
   */
  async getHistorialByTipoMovimiento(tipoMovimiento: string, includeDeleted: boolean = false): Promise<ApiResponse<HistorialGobernanza[]>> {
    const request: GetAllHistorialGobernanzaRequest = {
      includeDeleted,
      tipoMovimiento
    };

    const response = await this.getAllHistorialGobernanza(request);
    
    if (response.success && response.data) {
      // Filtrar por tipo de movimiento
      const filteredData = response.data.filter(h => h.tipoMovimiento === tipoMovimiento);
      return {
        ...response,
        data: filteredData
      };
    }

    return response;
  }

  /**
   * Obtener estadísticas del historial
   */
  async getEstadisticasHistorial(): Promise<ApiResponse<{
    totalMovimientos: number;
    movimientosActivos: number;
    movimientosFinalizados: number;
    movimientosPorTipo: Array<{
      tipoMovimiento: string;
      total: number;
      activos: number;
      finalizados: number;
    }>;
    ultimoMovimiento?: HistorialGobernanza;
  }>> {
    try {
      const response = await this.getAllHistorialGobernanza({ includeDeleted: false });

      if (!response.success || !response.data) {
        return {
          success: false,
          data: {
            totalMovimientos: 0,
            movimientosActivos: 0,
            movimientosFinalizados: 0,
            movimientosPorTipo: []
          },
          message: 'Error al obtener estadísticas',
          errors: response.errors || [],
          statusCode: response.statusCode || 500,
          metadata: ''
        };
      }

      const historial = response.data;
      const activos = historial.filter(h => h.esMovimientoActivo === true);
      const finalizados = historial.filter(h => h.esMovimientoActivo === false);

      // Agrupar por tipo de movimiento
      const movimientosPorTipo = historial.reduce((acc, h) => {
        const tipo = h.tipoMovimiento;
        const existing = acc.find(item => item.tipoMovimiento === tipo);
        
        if (existing) {
          existing.total++;
          if (h.esMovimientoActivo) existing.activos++;
          else existing.finalizados++;
        } else {
          acc.push({
            tipoMovimiento: tipo,
            total: 1,
            activos: h.esMovimientoActivo ? 1 : 0,
            finalizados: h.esMovimientoActivo ? 0 : 1
          });
        }
        
        return acc;
      }, [] as Array<{ tipoMovimiento: string; total: number; activos: number; finalizados: number; }>);

      // Obtener el último movimiento
      const ultimoMovimiento = historial.length > 0 
        ? historial.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())[0]
        : undefined;

      const estadisticas = {
        totalMovimientos: historial.length,
        movimientosActivos: activos.length,
        movimientosFinalizados: finalizados.length,
        movimientosPorTipo,
        ultimoMovimiento
      };

      return {
        success: true,
        data: estadisticas,
        message: 'Estadísticas obtenidas exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: {
          totalMovimientos: 0,
          movimientosActivos: 0,
          movimientosFinalizados: 0,
          movimientosPorTipo: []
        },
        message: 'Error al calcular estadísticas',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const historialGobernanzaService = new HistorialGobernanzaService(); 