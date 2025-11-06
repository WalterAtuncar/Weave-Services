/**
 * Servicio para gestión de Gobernanza
 * Actualizado según el nuevo modelo Domain.Entities.Governance
 * Implementa endpoints del controlador GobernanzaController con Commands
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  Gobernanza,
  GobernanzaDto,
  EstadoGobernanza,
  
  // Commands
  CreateGobernanzaCommand,
  UpdateGobernanzaCommand,
  AsignarGobernanzaCommand,
  TransferirGobernanzaCommand,
  RevocarGobernanzaCommand,
  
  // Requests
  GetGobernanzaPaginatedRequest,
  GetGobernanzaByFiltersRequest,
  
  // Responses
  CreateGobernanzaResponse,
  UpdateGobernanzaResponse,
  GobernanzaPaginatedResponseData,
  GetGobernanzaResponse,
  GetGobernanzaListResponse,
  GetGobernanzaPaginatedResponse,
  AsignarGobernanzaResponse,
  TransferirGobernanzaResponse,
  RevocarGobernanzaResponse,
  GetTipoGobiernoListResponse,
  GetTipoEntidadListResponse,
  GetRolGobernanzaListResponse
} from './types/gobernanza.types';

// Importar tipos desde archivos separados
import { TipoGobierno } from './types/tipo-gobierno.types';
import { TipoEntidad } from './types/tipo-entidad.types';
import { RolGobernanza } from './types/rol-gobernanza.types';
import { HistorialGobernanza } from './types/historial-gobernanza.types';
import { NotificacionGobernanza } from './types/notificacion-gobernanza.types';

export class GobernanzaService extends BaseApiService {
  protected baseEndpoint = '/Gobernanza';
  private buscarConRolesAbortController: AbortController | null = null;

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES PRINCIPALES (COMMANDS) =====

  /**
   * Crea una nueva gobernanza con sus asignaciones de roles y usuarios
   * POST /api/Gobernanza
   */
  async createGobernanza(command: CreateGobernanzaCommand): Promise<ApiResponse<number>> {
    return await this.post<number>(this.baseEndpoint, command);
  }

  /**
   * Actualiza una gobernanza existente con sus asignaciones de roles y usuarios
   * PUT /api/Gobernanza
   */
  async updateGobernanza(command: UpdateGobernanzaCommand): Promise<ApiResponse<boolean>> {
    return await this.put<boolean>(this.baseEndpoint, command);
  }

  /**
   * Asigna un rol de gobernanza a una entidad
   * POST /api/Gobernanza/asignar
   */
  async asignarGobernanza(command: AsignarGobernanzaCommand): Promise<ApiResponse<number>> {
    const url = `${this.baseEndpoint}/asignar`;
    return await this.post<number>(url, command);
  }

  /**
   * Transfiere una responsabilidad de gobernanza entre usuarios
   * POST /api/Gobernanza/transferir
   */
  async transferirGobernanza(command: TransferirGobernanzaCommand): Promise<ApiResponse<boolean>> {
    const url = `${this.baseEndpoint}/transferir`;
    return await this.post<boolean>(url, command);
  }

  /**
   * Revoca una asignación de gobernanza
   * POST /api/Gobernanza/revocar
   */
  async revocarGobernanza(command: RevocarGobernanzaCommand): Promise<ApiResponse<boolean>> {
    const url = `${this.baseEndpoint}/revocar`;
    return await this.post<boolean>(url, command);
  }

  // ===== CONSULTAS BÁSICAS =====

  /**
   * Obtiene todas las gobernanzas con filtros básicos
   * GET /api/Gobernanza
   */
  async getAllGobernanzas(request?: GetGobernanzaByFiltersRequest): Promise<ApiResponse<Gobernanza[]>> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) params.append('includeDeleted', request.includeDeleted.toString());
    if (request?.tipoGobiernoId !== undefined) params.append('tipoGobiernoId', request.tipoGobiernoId.toString());
    if (request?.tipoEntidadId !== undefined) params.append('tipoEntidadId', request.tipoEntidadId.toString());
    if (request?.entidadId !== undefined) params.append('entidadId', request.entidadId.toString());
    if (request?.organizacionId !== undefined) params.append('organizacionId', request.organizacionId.toString()); // 🔧 Agregado organizacionId
    if (request?.usuarioId !== undefined) params.append('usuarioId', request.usuarioId.toString());
    if (request?.soloProximasAVencer !== undefined) params.append('soloProximasAVencer', request.soloProximasAVencer.toString());
    if (request?.soloVencidas !== undefined) params.append('soloVencidas', request.soloVencidas.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;
    
    return await this.get<Gobernanza[]>(url);
  }

  /**
   * Obtiene una gobernanza por ID
   * GET /api/Gobernanza/ById/{id}
   */
  async getGobernanzaById(gobernanzaId: number): Promise<ApiResponse<GobernanzaDto>> {
    const url = `${this.baseEndpoint}/ById/${gobernanzaId}`;
    return await this.get<GobernanzaDto>(url);
  }

  /**
   * Búsqueda paginada de gobernanzas con filtros avanzados
   * GET /api/Gobernanza/paginated
   */
  async getGobernanzasPaginated(request?: GetGobernanzaPaginatedRequest): Promise<ApiResponse<GobernanzaPaginatedResponseData>> {
    const params = new URLSearchParams();

    if (request?.page !== undefined) params.append('Page', request.page.toString());
    if (request?.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
    if (request?.orderBy) params.append('OrderBy', request.orderBy);
    if (request?.ascending !== undefined) params.append('OrderDescending', (!request.ascending).toString());
    
    // Filtros desde el objeto filters
    if (request?.filters) {
      if (request.filters.organizacionId !== undefined) params.append('OrganizacionId', request.filters.organizacionId.toString());
      if (request.filters.entidadId !== undefined) params.append('EntidadId', request.filters.entidadId.toString());
      if (request.filters.tipoGobiernoId !== undefined) params.append('TipoGobiernoId', request.filters.tipoGobiernoId.toString());
      if (request.filters.tipoEntidadId !== undefined) params.append('TipoEntidadId', request.filters.tipoEntidadId.toString());
      if (request.filters.usuarioId !== undefined) params.append('UsuarioId', request.filters.usuarioId.toString());
      if (request.filters.estado !== undefined) params.append('Estado', request.filters.estado.toString());
      if (request.filters.fechaDesde) params.append('FechaAsignacionDesde', request.filters.fechaDesde);
      if (request.filters.fechaHasta) params.append('FechaAsignacionHasta', request.filters.fechaHasta);
    }
    
    // Propiedades directas del request (para compatibilidad)
    if (request?.includeDeleted !== undefined) params.append('IncludeDeleted', request.includeDeleted.toString());
    if (request?.soloProximasAVencer !== undefined) params.append('SoloProximasAVencer', request.soloProximasAVencer.toString());
    if (request?.soloVencidas !== undefined) params.append('SoloVencidas', request.soloVencidas.toString());
    if (request?.rolGobernanzaId !== undefined) params.append('RolGobernanzaId', request.rolGobernanzaId.toString());
    if (request?.fechaAsignacionDesde) params.append('FechaAsignacionDesde', request.fechaAsignacionDesde);
    if (request?.fechaAsignacionHasta) params.append('FechaAsignacionHasta', request.fechaAsignacionHasta);
    if (request?.fechaVencimientoDesde) params.append('FechaVencimientoDesde', request.fechaVencimientoDesde);
    if (request?.fechaVencimientoHasta) params.append('FechaVencimientoHasta', request.fechaVencimientoHasta);
    if (request?.searchTerm) params.append('SearchTerm', request.searchTerm);

    const url = `${this.baseEndpoint}/paginated?${params.toString()}`;
    return await this.get<GobernanzaPaginatedResponseData>(url);
  }

  // ===== CONSULTAS ESPECIALIZADAS =====

  /**
   * Obtiene gobernanzas por entidad específica
   * GET /api/Gobernanza/entidad/{tipoEntidadId}/{entidadId}
   */
  async getGobernanzasPorEntidad(tipoEntidadId: number, entidadId: number): Promise<ApiResponse<GobernanzaDto[]>> {
    const url = `${this.baseEndpoint}/entidad/${tipoEntidadId}/${entidadId}`;
    return await this.get<GobernanzaDto[]>(url);
  }

  /**
   * Obtiene gobernanzas por usuario específico
   * GET /api/Gobernanza/usuario/{usuarioId}
   */
  async getGobernanzasPorUsuario(usuarioId: number): Promise<ApiResponse<GobernanzaDto[]>> {
    const url = `${this.baseEndpoint}/usuario/${usuarioId}`;
    return await this.get<GobernanzaDto[]>(url);
  }

  /**
   * Obtiene gobernanzas que requieren atención inmediata
   * GET /api/Gobernanza/atencion-requerida
   */
  async getGobernanzasQueRequierenAtencion(usuarioId?: number): Promise<ApiResponse<GobernanzaDto[]>> {
    const params = new URLSearchParams();
    if (usuarioId !== undefined) params.append('usuarioId', usuarioId.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/atencion-requerida?${queryString}` : `${this.baseEndpoint}/atencion-requerida`;
    
    return await this.get<GobernanzaDto[]>(url);
  }

  /**
   * Obtiene estadísticas generales de gobernanza
   * GET /api/Gobernanza/estadisticas
   */
  async getEstadisticasGobernanza(tipoGobiernoId?: number, usuarioId?: number): Promise<ApiResponse<{ [key: string]: number }>> {
    const params = new URLSearchParams();
    if (tipoGobiernoId !== undefined) params.append('tipoGobiernoId', tipoGobiernoId.toString());
    if (usuarioId !== undefined) params.append('usuarioId', usuarioId.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/estadisticas?${queryString}` : `${this.baseEndpoint}/estadisticas`;
    
    return await this.get<{ [key: string]: number }>(url);
  }

  /**
   * Obtiene el dashboard de gobernanza para un usuario
   * GET /api/Gobernanza/dashboard/{usuarioId}
   */
  async getDashboardGobernanza(usuarioId: number): Promise<ApiResponse<any>> {
    const url = `${this.baseEndpoint}/dashboard/${usuarioId}`;
    return await this.get<any>(url);
  }

  // ===== MÉTODOS DE CONSULTA ESPECÍFICOS (MANTENIDOS PARA COMPATIBILIDAD) =====

  /**
   * Obtiene gobernanzas por usuario (método de compatibilidad)
   */
  async getGobernanzaByUsuario(usuarioId: number, includeDeleted: boolean = false): Promise<GetGobernanzaListResponse> {
    const request: GetGobernanzaByFiltersRequest = {
      usuarioId,
      includeDeleted
    };
    const response = await this.getAllGobernanzas(request);
    
    return {
      success: response.success,
      data: response.data || [],
      message: response.message,
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene gobernanzas por entidad (método de compatibilidad)
   */
  async getGobernanzaByEntidad(entidadId: number, tipoEntidadId: number, includeDeleted: boolean = false): Promise<GetGobernanzaListResponse> {
    const request: GetGobernanzaByFiltersRequest = {
      entidadId,
      tipoEntidadId,
      includeDeleted
    };
    const response = await this.getAllGobernanzas(request);
    
    return {
      success: response.success,
      data: response.data || [],
      message: response.message,
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene gobernanzas por tipo de gobierno (método de compatibilidad)
   */
  async getGobernanzaByTipoGobierno(tipoGobiernoId: number, includeDeleted: boolean = false): Promise<GetGobernanzaListResponse> {
    const request: GetGobernanzaByFiltersRequest = {
      tipoGobiernoId,
      includeDeleted
    };
    const response = await this.getAllGobernanzas(request);
    
    return {
      success: response.success,
      data: response.data || [],
      message: response.message,
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene gobernanzas próximas a vencer (método de compatibilidad)
   */
  async getGobernanzasProximasAVencer(includeDeleted: boolean = false): Promise<GetGobernanzaListResponse> {
    const request: GetGobernanzaByFiltersRequest = {
      soloProximasAVencer: true,
      includeDeleted
    };
    const response = await this.getAllGobernanzas(request);
    
    return {
      success: response.success,
      data: response.data || [],
      message: response.message,
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene gobernanzas vencidas (método de compatibilidad)
   */
  async getGobernanzasVencidas(includeDeleted: boolean = false): Promise<GetGobernanzaListResponse> {
    const request: GetGobernanzaByFiltersRequest = {
      soloVencidas: true,
      includeDeleted
    };
    const response = await this.getAllGobernanzas(request);
    
    return {
      success: response.success,
      data: response.data || [],
      message: response.message,
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca gobernanzas por término general con paginación
   */
  async searchGobernanza(searchTerm: string, options?: {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDescending?: boolean;
    filters?: Partial<GetGobernanzaByFiltersRequest>;
  }): Promise<GetGobernanzaPaginatedResponse> {
    const request: GetGobernanzaPaginatedRequest = {
      searchTerm,
      page: options?.page || 1,
      pageSize: options?.pageSize || 10,
      orderBy: options?.orderBy || 'fechaAsignacion',
      orderDescending: options?.orderDescending !== undefined ? options.orderDescending : true,
      ...options?.filters
    };

    const response = await this.getGobernanzasPaginated(request);
    
    return {
      success: response.success,
      data: response.data || { data: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      message: response.message,
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene gobernanzas activas por usuario (método de compatibilidad)
   */
  async getGobernanzasActivasByUsuario(usuarioId: number): Promise<GetGobernanzaListResponse> {
    const request: GetGobernanzaPaginatedRequest = {
      usuarioId,
      estado: EstadoGobernanza.ACTIVO,
      pageSize: 1000 // Obtener todas
    };

    const response = await this.getGobernanzasPaginated(request);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.message,
        errors: response.errors || [],
        statusCode: response.statusCode || 200,
        metadata: response.metadata || ''
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener gobernanzas activas',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Verifica si una entidad específica ya tiene una gobernanza activa
   */
  async tieneGobernanzaActiva(
    entidadId: number,
    tipoEntidadId: number,
    organizacionId?: number
  ): Promise<ApiResponse<{ tieneGobernanza: boolean; gobernanzaExistente?: GobernanzaDto }>> {
    try {
      // Usar endpoint especializado por entidad para asegurar filtrado correcto
      const response = await this.getGobernanzasPorEntidad(tipoEntidadId, entidadId);
      
      if (!response.success) {
        return {
          success: false,
          data: { tieneGobernanza: false },
          message: 'Error al verificar gobernanza existente',
          errors: response.errors || [],
          statusCode: response.statusCode || 500,
          metadata: ''
        };
      }

      const gobernanzasExistentes = response.data || [];
      const gobernanzaActiva = gobernanzasExistentes.find(g => g.estado === EstadoGobernanza.ACTIVO && !g.registroEliminado);

      return {
        success: true,
        data: { 
          tieneGobernanza: !!gobernanzaActiva,
          gobernanzaExistente: gobernanzaActiva
        },
        message: gobernanzaActiva ? 'La entidad ya tiene una gobernanza activa' : 'La entidad no tiene gobernanza activa',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: { tieneGobernanza: false },
        message: 'Error al verificar gobernanza de la entidad',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Verifica si se puede asignar una gobernanza específica
   */
  async puedeAsignarGobernanza(
    entidadId: number, 
    tipoEntidadId: number, 
    rolGobernanzaId: number,
    usuarioId?: number
  ): Promise<ApiResponse<{ puedeAsignar: boolean; razon?: string; gobernanzasConflicto?: GobernanzaDto[] }>> {
    try {
      // Verificar gobernanzas existentes para la entidad
      const existingResponse = await this.getGobernanzaByEntidad(entidadId, tipoEntidadId, false);

      if (!existingResponse.success) {
        return {
          success: false,
          data: { puedeAsignar: false, razon: 'Error al verificar gobernanzas existentes' },
          message: 'Error en validación',
          errors: existingResponse.errors || [],
          statusCode: existingResponse.statusCode || 500,
          metadata: ''
        };
      }

      const gobernanzasExistentes = existingResponse.data || [];
      
      // Verificar conflictos por rol
      const conflictosPorRol = gobernanzasExistentes.filter(g => 
        g.rolGobernanzaId === rolGobernanzaId && 
        g.estado === EstadoGobernanza.ACTIVO
      );

      if (conflictosPorRol.length > 0) {
        return {
          success: true,
          data: { 
            puedeAsignar: false, 
            razon: 'Ya existe una gobernanza activa para este rol en la entidad',
            gobernanzasConflicto: conflictosPorRol
          },
          message: 'Conflicto de roles detectado',
          errors: [],
          statusCode: 200,
          metadata: ''
        };
      }

      // Verificar si el usuario ya tiene esta gobernanza
      if (usuarioId) {
        const conflictosPorUsuario = gobernanzasExistentes.filter(g => 
          g.usuarioId === usuarioId && 
          g.rolGobernanzaId === rolGobernanzaId &&
          g.estado === EstadoGobernanza.ACTIVO
        );

        if (conflictosPorUsuario.length > 0) {
          return {
            success: true,
            data: { 
              puedeAsignar: false, 
              razon: 'El usuario ya tiene este rol asignado en la entidad',
              gobernanzasConflicto: conflictosPorUsuario
            },
            message: 'Usuario ya tiene el rol asignado',
            errors: [],
            statusCode: 200,
            metadata: ''
          };
        }
      }

      return {
        success: true,
        data: { puedeAsignar: true },
        message: 'Se puede asignar la gobernanza',
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

  /**
   * Obtiene resumen de gobernanza por entidad
   */
  async getResumenGobernanzaPorEntidad(entidadId: number, tipoEntidadId: number): Promise<ApiResponse<{
    entidadId: number;
    tipoEntidadId: number;
    totalGobernanzas: number;
    gobernanzasActivas: number;
    gobernanzasSuspendidas: number;
    gobernanzasRevocadas: number;
    gobernanzasVencidas: number;
    distribucionPorRol: Record<number, number>;
    proximasAVencer: GobernanzaDto[];
    gobernanzas: GobernanzaDto[];
  }>> {
    try {
      const gobernanzaResponse = await this.getGobernanzaByEntidad(entidadId, tipoEntidadId, true);

      if (!gobernanzaResponse.success || !gobernanzaResponse.data) {
        return {
          success: false,
          data: {
            entidadId,
            tipoEntidadId,
            totalGobernanzas: 0,
            gobernanzasActivas: 0,
            gobernanzasSuspendidas: 0,
            gobernanzasRevocadas: 0,
            gobernanzasVencidas: 0,
            distribucionPorRol: {},
            proximasAVencer: [],
            gobernanzas: []
          },
          message: 'Error al obtener gobernanzas de la entidad',
          errors: gobernanzaResponse.errors || [],
          statusCode: gobernanzaResponse.statusCode || 500,
          metadata: ''
        };
      }

      const gobernanzas = gobernanzaResponse.data;
      const ahora = new Date();
      
      const activas = gobernanzas.filter(g => g.estado === EstadoGobernanza.ACTIVO);
      const suspendidas = gobernanzas.filter(g => g.estado === EstadoGobernanza.SUSPENDIDO);
      const revocadas = gobernanzas.filter(g => g.estado === EstadoGobernanza.REVOCADO);
      const vencidas = gobernanzas.filter(g => 
        g.fechaVencimiento && new Date(g.fechaVencimiento) < ahora
      );
      
      // Próximas a vencer (30 días)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 30);
      const proximasAVencer = activas.filter(g => 
        g.fechaVencimiento && 
        new Date(g.fechaVencimiento) <= fechaLimite &&
        new Date(g.fechaVencimiento) > ahora
      );

      const resumen = {
        entidadId,
        tipoEntidadId,
        totalGobernanzas: gobernanzas.length,
        gobernanzasActivas: activas.length,
        gobernanzasSuspendidas: suspendidas.length,
        gobernanzasRevocadas: revocadas.length,
        gobernanzasVencidas: vencidas.length,
        distribucionPorRol: activas.reduce((acc, g) => {
          acc[g.rolGobernanzaId] = (acc[g.rolGobernanzaId] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        proximasAVencer,
        gobernanzas
      };

      return {
        success: true,
        data: resumen,
        message: 'Resumen obtenido exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: {
          entidadId,
          tipoEntidadId,
          totalGobernanzas: 0,
          gobernanzasActivas: 0,
          gobernanzasSuspendidas: 0,
          gobernanzasRevocadas: 0,
          gobernanzasVencidas: 0,
          distribucionPorRol: {},
          proximasAVencer: [],
          gobernanzas: []
        },
        message: 'Error al obtener resumen de gobernanza',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Busca gobernanzas con roles asignados usando stored procedure
   * GET /api/Gobernanza/buscar-con-roles
   */
  async buscarGobernanzasConRoles(request: {
    textSearch?: string;
    organizacionId: number;
    tipoEntidadId: number;
    soloActivos?: boolean;
    tipoBusqueda?: string; // "NOMBRE_GOBIERNO" o "OWNER_SPONSOR"
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    
    if (request.textSearch) {
      params.append('textSearch', request.textSearch);
    }
    if (request.organizacionId > 0) {
      params.append('organizacionId', request.organizacionId.toString());
    }
    if (request.tipoEntidadId > 0) {
      params.append('tipoEntidadId', request.tipoEntidadId.toString());
    }
    if (request.soloActivos !== undefined) {
      params.append('soloActivos', request.soloActivos.toString());
    }
    if (request.tipoBusqueda) {
      params.append('tipoBusqueda', request.tipoBusqueda);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/buscar-con-roles?${queryString}` : `${this.baseEndpoint}/buscar-con-roles`;

    // Cancelar la solicitud anterior si aún está en curso
    if (this.buscarConRolesAbortController) {
      try { this.buscarConRolesAbortController.abort(); } catch {}
    }
    // Crear un nuevo AbortController para esta solicitud
    this.buscarConRolesAbortController = new AbortController();

    try {
      const resp = await this.get<any[]>(url, { signal: this.buscarConRolesAbortController.signal });
      return resp;
    } finally {
      // Limpiar el controller al finalizar (éxito o error)
      this.buscarConRolesAbortController = null;
    }
  }
}

// Instancia singleton del servicio
export const gobernanzaService = new GobernanzaService();