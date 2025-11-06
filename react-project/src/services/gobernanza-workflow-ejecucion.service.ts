/**
 * Servicio para gestión de Gobernanza Workflow Ejecucion
 * Implementa endpoints del controlador GobernanzaWorkflowEjecucionController
 * Maneja ejecuciones de tareas en workflows de gobernanza
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Entidad principal
  GobernanzaWorkflowEjecucion,
  GobernanzaWorkflowEjecucionDto,
  
  // Commands
  CreateGobernanzaWorkflowEjecucionCommand,
  CompletarTareaCommand,
  AsignarTareaCommand,
  UpdateTareaCommand,
  
  // Filters
  GobernanzaWorkflowEjecucionFilters,
  
  // Responses
  GobernanzaWorkflowEjecucionResponse,
  GobernanzaWorkflowEjecucionListResponse,
  GobernanzaWorkflowEjecucionDtoResponse,
  GobernanzaWorkflowEjecucionDtoListResponse,
  CreateGobernanzaWorkflowEjecucionResponse,
  CompletarTareaResponse,
  AsignarTareaResponse,
  
  // Tipos auxiliares
  TareasPendientesUsuario,
  MetricasTareasWorkflow,
  NotificacionTarea,
  EstadoTareaWorkflow
} from './types/gobernanza-workflow-ejecucion.types';

export class GobernanzaWorkflowEjecucionService extends BaseApiService {
  protected baseEndpoint = '/GobernanzaWorkflowEjecucion';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableErrorHandling: true
    });
  }

  // ================================================================
  // MÉTODOS CRUD BÁSICOS
  // ================================================================

  /**
   * Obtiene una ejecución por su ID
   * GET /api/GobernanzaWorkflowEjecucion/{ejecucionId}
   */
  async getById(ejecucionId: number): Promise<GobernanzaWorkflowEjecucionResponse> {
    try {
      if (!ejecucionId || ejecucionId <= 0) {
        throw new Error('ID de ejecución debe ser mayor a cero');
      }

      const response = await this.get<ApiResponse<GobernanzaWorkflowEjecucion>>(`${this.baseEndpoint}/${ejecucionId}`);
      
      return {
        success: response.success,
        message: response.message || 'Ejecución obtenida exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al obtener ejecución:', error);
      throw this.handleError(error, 'Error al obtener la ejecución');
    }
  }

  /**
   * Crea una nueva ejecución de tarea
   * POST /api/GobernanzaWorkflowEjecucion
   */
  async create(command: CreateGobernanzaWorkflowEjecucionCommand): Promise<CreateGobernanzaWorkflowEjecucionResponse> {
    try {
      this.validateCreateCommand(command);

      const response = await this.post<ApiResponse<number>>(this.baseEndpoint, command);
      
      return {
        success: response.success,
        message: response.message || 'Ejecución de tarea creada exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al crear ejecución de tarea:', error);
      throw this.handleError(error, 'Error al crear la ejecución de tarea');
    }
  }

  // ================================================================
  // MÉTODOS DE GESTIÓN DE TAREAS
  // ================================================================

  /**
   * Completa una tarea específica
   * POST /api/GobernanzaWorkflowEjecucion/{ejecucionId}/completar
   */
  async completarTarea(ejecucionId: number, command: CompletarTareaCommand): Promise<CompletarTareaResponse> {
    try {
      if (!ejecucionId || ejecucionId <= 0) {
        throw new Error('ID de ejecución debe ser mayor a cero');
      }

      this.validateCompletarTareaCommand(command);

      const response = await this.post<ApiResponse<boolean>>(`${this.baseEndpoint}/${ejecucionId}/completar`, command);
      
      return {
        success: response.success,
        message: response.message || 'Tarea completada exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al completar tarea:', error);
      throw this.handleError(error, 'Error al completar la tarea');
    }
  }

  /**
   * Asigna una tarea a un usuario específico
   * POST /api/GobernanzaWorkflowEjecucion/{ejecucionId}/asignar/{usuarioId}
   */
  async asignarTarea(ejecucionId: number, usuarioId: number): Promise<AsignarTareaResponse> {
    try {
      if (!ejecucionId || ejecucionId <= 0) {
        throw new Error('ID de ejecución debe ser mayor a cero');
      }

      if (!usuarioId || usuarioId <= 0) {
        throw new Error('ID de usuario debe ser mayor a cero');
      }

      const response = await this.post<ApiResponse<boolean>>(`${this.baseEndpoint}/${ejecucionId}/asignar/${usuarioId}`);
      
      return {
        success: response.success,
        message: response.message || 'Tarea asignada exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al asignar tarea:', error);
      throw this.handleError(error, 'Error al asignar la tarea');
    }
  }

  // ================================================================
  // CONSULTAS ESPECIALIZADAS
  // ================================================================

  /**
   * Obtiene ejecuciones por instancia de workflow
   * GET /api/GobernanzaWorkflowEjecucion/instancia/{instanciaId}
   */
  async getByInstancia(instanciaId: number): Promise<GobernanzaWorkflowEjecucionListResponse> {
    try {
      if (!instanciaId || instanciaId <= 0) {
        throw new Error('ID de instancia debe ser mayor a cero');
      }

      const response = await this.get<ApiResponse<GobernanzaWorkflowEjecucion[]>>(`${this.baseEndpoint}/instancia/${instanciaId}`);
      
      return {
        success: response.success,
        message: response.message || 'Ejecuciones obtenidas exitosamente',
        data: response.data || []
      };
    } catch (error) {
      console.error('Error al obtener ejecuciones por instancia:', error);
      throw this.handleError(error, 'Error al obtener las ejecuciones de la instancia');
    }
  }

  /**
   * Obtiene tareas pendientes de un usuario
   * GET /api/GobernanzaWorkflowEjecucion/usuario/{usuarioId}/pendientes
   */
  async getTareasPendientesUsuario(usuarioId: number): Promise<GobernanzaWorkflowEjecucionListResponse> {
    try {
      if (!usuarioId || usuarioId <= 0) {
        throw new Error('ID de usuario debe ser mayor a cero');
      }

      const response = await this.get<ApiResponse<GobernanzaWorkflowEjecucion[]>>(`${this.baseEndpoint}/usuario/${usuarioId}/pendientes`);
      
      return {
        success: response.success,
        message: response.message || 'Tareas pendientes obtenidas exitosamente',
        data: response.data || []
      };
    } catch (error) {
      console.error('Error al obtener tareas pendientes:', error);
      throw this.handleError(error, 'Error al obtener las tareas pendientes del usuario');
    }
  }

  // ================================================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ================================================================

  /**
   * Busca ejecuciones con filtros específicos
   */
  async search(filters: GobernanzaWorkflowEjecucionFilters): Promise<GobernanzaWorkflowEjecucionDtoListResponse> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await this.get<ApiResponse<GobernanzaWorkflowEjecucionDto[]>>(this.baseEndpoint, { params });
      
      return {
        success: response.success,
        message: response.message || 'Ejecuciones encontradas exitosamente',
        data: response.data || []
      };
    } catch (error) {
      console.error('Error al buscar ejecuciones:', error);
      throw this.handleError(error, 'Error al buscar ejecuciones');
    }
  }

  /**
   * Obtiene todas las tareas pendientes del sistema
   */
  async getTareasPendientes(): Promise<GobernanzaWorkflowEjecucionDtoListResponse> {
    try {
      const filters: GobernanzaWorkflowEjecucionFilters = {
        soloPendientes: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener tareas pendientes:', error);
      throw this.handleError(error, 'Error al obtener tareas pendientes');
    }
  }

  /**
   * Obtiene tareas en progreso
   */
  async getTareasEnProgreso(): Promise<GobernanzaWorkflowEjecucionDtoListResponse> {
    try {
      const filters: GobernanzaWorkflowEjecucionFilters = {
        soloEnProgreso: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener tareas en progreso:', error);
      throw this.handleError(error, 'Error al obtener tareas en progreso');
    }
  }

  /**
   * Obtiene tareas vencidas
   */
  async getTareasVencidas(): Promise<GobernanzaWorkflowEjecucionDtoListResponse> {
    try {
      const filters: GobernanzaWorkflowEjecucionFilters = {
        soloVencidas: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener tareas vencidas:', error);
      throw this.handleError(error, 'Error al obtener tareas vencidas');
    }
  }

  /**
   * Obtiene tareas que requieren atención inmediata
   */
  async getTareasRequierenAtencion(): Promise<GobernanzaWorkflowEjecucionDtoListResponse> {
    try {
      const filters: GobernanzaWorkflowEjecucionFilters = {
        requierenAtencion: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener tareas que requieren atención:', error);
      throw this.handleError(error, 'Error al obtener tareas que requieren atención');
    }
  }

  /**
   * Obtiene mis tareas asignadas
   */
  async getMisTareas(usuarioId: number): Promise<GobernanzaWorkflowEjecucionDtoListResponse> {
    try {
      const filters: GobernanzaWorkflowEjecucionFilters = {
        usuarioActual: usuarioId,
        soloAsignadasAMi: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener mis tareas:', error);
      throw this.handleError(error, 'Error al obtener mis tareas');
    }
  }

  // ================================================================
  // MÉTODOS DE DASHBOARD Y MÉTRICAS
  // ================================================================

  /**
   * Obtiene resumen de tareas pendientes por usuario
   */
  async getResumenTareasPorUsuario(): Promise<TareasPendientesUsuario[]> {
    try {
      const response = await this.get<ApiResponse<TareasPendientesUsuario[]>>(`${this.baseEndpoint}/dashboard/usuarios-pendientes`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener resumen de tareas por usuario:', error);
      throw this.handleError(error, 'Error al obtener resumen de tareas por usuario');
    }
  }

  /**
   * Obtiene métricas generales de tareas de workflow
   */
  async getMetricasGenerales(): Promise<MetricasTareasWorkflow> {
    try {
      const response = await this.get<ApiResponse<MetricasTareasWorkflow>>(`${this.baseEndpoint}/dashboard/metricas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener métricas generales:', error);
      throw this.handleError(error, 'Error al obtener métricas generales');
    }
  }

  // ================================================================
  // MÉTODOS DE NOTIFICACIONES
  // ================================================================

  /**
   * Obtiene notificaciones de tareas para un usuario
   */
  async getNotificaciones(usuarioId: number): Promise<NotificacionTarea[]> {
    try {
      const response = await this.get<ApiResponse<NotificacionTarea[]>>(`${this.baseEndpoint}/notificaciones/${usuarioId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw this.handleError(error, 'Error al obtener notificaciones');
    }
  }

  /**
   * Marca una notificación como leída
   */
  async marcarNotificacionLeida(notificacionId: number): Promise<boolean> {
    try {
      const response = await this.post<ApiResponse<boolean>>(`${this.baseEndpoint}/notificaciones/${notificacionId}/leida`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw this.handleError(error, 'Error al marcar notificación como leída');
    }
  }

  // ================================================================
  // MÉTODOS DE UTILIDAD Y VALIDACIÓN
  // ================================================================

  /**
   * Valida el comando de creación
   */
  private validateCreateCommand(command: CreateGobernanzaWorkflowEjecucionCommand): void {
    const errors: string[] = [];

    if (!command.instanciaWorkflowId || command.instanciaWorkflowId <= 0) {
      errors.push('ID de instancia de workflow es requerido');
    }

    if (!command.tareaActualId || command.tareaActualId.trim() === '') {
      errors.push('ID de tarea actual es requerido');
    }

    if (command.tareaActualId && command.tareaActualId.length > 50) {
      errors.push('ID de tarea actual no puede exceder 50 caracteres');
    }

    if (!command.usuarioActual || command.usuarioActual <= 0) {
      errors.push('Usuario actual es requerido');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Valida el comando de completar tarea
   */
  private validateCompletarTareaCommand(command: CompletarTareaCommand): void {
    const errors: string[] = [];

    if (!command.workflowEjecucionId || command.workflowEjecucionId <= 0) {
      errors.push('ID de ejecución de workflow es requerido');
    }

    if (command.observacionesCompletado && command.observacionesCompletado.length > 500) {
      errors.push('Las observaciones no pueden exceder 500 caracteres');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Construye parámetros de filtros
   */
  private buildFilterParams(filters: GobernanzaWorkflowEjecucionFilters): Record<string, any> {
    const params: Record<string, any> = {};

    // Filtros de ejecución
    if (filters.instanciaWorkflowId) params.instanciaWorkflowId = filters.instanciaWorkflowId;
    if (filters.tareaActualId) params.tareaActualId = filters.tareaActualId;
    if (filters.usuarioActual) params.usuarioActual = filters.usuarioActual;
    if (filters.estadoTarea !== undefined) params.estadoTarea = filters.estadoTarea;
    if (filters.prioridad !== undefined) params.prioridad = filters.prioridad;

    // Filtros de fechas
    if (filters.fechaInicioDesde) params.fechaInicioDesde = filters.fechaInicioDesde;
    if (filters.fechaInicioHasta) params.fechaInicioHasta = filters.fechaInicioHasta;
    if (filters.fechaCompletadoDesde) params.fechaCompletadoDesde = filters.fechaCompletadoDesde;
    if (filters.fechaCompletadoHasta) params.fechaCompletadoHasta = filters.fechaCompletadoHasta;
    if (filters.fechaVencimientoDesde) params.fechaVencimientoDesde = filters.fechaVencimientoDesde;
    if (filters.fechaVencimientoHasta) params.fechaVencimientoHasta = filters.fechaVencimientoHasta;

    // Filtros de gobernanza
    if (filters.gobernanzaId) params.gobernanzaId = filters.gobernanzaId;
    if (filters.tipoGobiernoId) params.tipoGobiernoId = filters.tipoGobiernoId;
    if (filters.tipoEntidadId) params.tipoEntidadId = filters.tipoEntidadId;

    // Filtros booleanos
    if (filters.soloPendientes !== undefined) params.soloPendientes = filters.soloPendientes;
    if (filters.soloEnProgreso !== undefined) params.soloEnProgreso = filters.soloEnProgreso;
    if (filters.soloCompletadas !== undefined) params.soloCompletadas = filters.soloCompletadas;
    if (filters.soloVencidas !== undefined) params.soloVencidas = filters.soloVencidas;
    if (filters.soloAsignadasAMi !== undefined) params.soloAsignadasAMi = filters.soloAsignadasAMi;
    if (filters.requierenAtencion !== undefined) params.requierenAtencion = filters.requierenAtencion;

    // Búsqueda textual
    if (filters.searchTerm) params.searchTerm = filters.searchTerm;

    return params;
  }

  /**
   * Maneja errores de manera consistente
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error(defaultMessage);
  }
}

// Instancia singleton del servicio
export const gobernanzaWorkflowEjecucionService = new GobernanzaWorkflowEjecucionService();