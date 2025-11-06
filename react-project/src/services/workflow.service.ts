/**
 * Servicio para gestión de Workflows
 * Implementa todos los endpoints del controlador WorkflowController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  EjecucionFlujo,
  EjecucionFlujoCompleta,
  TareaWorkflow,
  AprobacionWorkflow,
  EstadoEjecucion,
  EstadoTarea,
  EstadoAprobacion,
  PrioridadEjecucion,
  
  // Requests
  GetAllEjecucionesFlujoRequest,
  GetEjecucionFlujoByIdRequest,
  GetEjecucionFlujoCompletaRequest,
  GetEjecucionesFlujosPaginatedRequest,
  IniciarEjecucionFlujoRequest,
  UpdateEjecucionFlujoRequest,
  FinalizarEjecucionFlujoRequest,
  GetTareasByEjecucionRequest,
  CreateTareaWorkflowRequest,
  CompletarTareaRequest,
  GetAprobacionesByEjecucionRequest,
  CreateAprobacionWorkflowRequest,
  ResponderAprobacionRequest,
  
  // Responses
  GetAllEjecucionesFlujoResponseData,
  GetEjecucionFlujoByIdResponseData,
  GetEjecucionFlujoCompletaResponseData,
  EjecucionesFlujosPaginatedResponseData,
  IniciarEjecucionFlujoResponseData,
  UpdateEjecucionFlujoResponseData,
  FinalizarEjecucionFlujoResponseData,
  GetTareasByEjecucionResponseData,
  CreateTareaWorkflowResponseData,
  CompletarTareaResponseData,
  GetAprobacionesByEjecucionResponseData,
  CreateAprobacionWorkflowResponseData,
  ResponderAprobacionResponseData,
  GetEstadisticasWorkflowResponseData,
  
  // Tipos auxiliares
  WorkflowFilters,
  WorkflowSortOptions,
  WorkflowPaginationOptions
} from './types/workflow.types';

export class WorkflowService extends BaseApiService {
  protected baseEndpoint = '/Workflow';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD EJECUCIONES DE FLUJO =====

  /**
   * Obtiene todas las ejecuciones de flujo
   * GET /api/Workflow/ejecuciones
   */
  async getAllEjecucionesFlujo(request?: GetAllEjecucionesFlujoRequest): Promise<ApiResponse<GetAllEjecucionesFlujoResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.soloActivos !== undefined) {
      params.append('soloActivos', request.soloActivos.toString());
    }
    if (request?.estado !== undefined) {
      params.append('estado', request.estado.toString());
    }
    if (request?.usuarioInicioId !== undefined) {
      params.append('usuarioInicioId', request.usuarioInicioId.toString());
    }
    if (request?.fechaInicioDesde) {
      params.append('fechaInicioDesde', request.fechaInicioDesde);
    }
    if (request?.fechaInicioHasta) {
      params.append('fechaInicioHasta', request.fechaInicioHasta);
    }
    if (request?.prioridad !== undefined) {
      params.append('prioridad', request.prioridad.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/ejecuciones?${queryString}` : `${this.baseEndpoint}/ejecuciones`;

    return await this.get<GetAllEjecucionesFlujoResponseData>(url);
  }

  /**
   * Obtiene una ejecución de flujo por ID
   * GET /api/Workflow/ejecuciones/{id}
   */
  async getEjecucionFlujoById(request: GetEjecucionFlujoByIdRequest): Promise<ApiResponse<GetEjecucionFlujoByIdResponseData>> {
    const url = `${this.baseEndpoint}/ejecuciones/${request.ejecucionFlujoId}`;
    return await this.get<GetEjecucionFlujoByIdResponseData>(url);
  }

  /**
   * Obtiene información completa de una ejecución de flujo
   * GET /api/Workflow/ejecuciones/{id}/completa
   */
  async getEjecucionFlujoCompleta(request: GetEjecucionFlujoCompletaRequest): Promise<ApiResponse<GetEjecucionFlujoCompletaResponseData>> {
    const url = `${this.baseEndpoint}/ejecuciones/${request.ejecucionFlujoId}/completa`;
    return await this.get<GetEjecucionFlujoCompletaResponseData>(url);
  }

  /**
   * Búsqueda paginada de ejecuciones de flujo
   * GET /api/Workflow/ejecuciones/paginadas
   */
  async getEjecucionesFlujosPaginated(request?: GetEjecucionesFlujosPaginatedRequest): Promise<ApiResponse<EjecucionesFlujosPaginatedResponseData>> {
    const params = new URLSearchParams();

    if (request?.nombreFlujo) params.append('nombreFlujo', request.nombreFlujo);
    if (request?.estado !== undefined) params.append('estado', request.estado.toString());
    if (request?.usuarioInicioId !== undefined) params.append('usuarioInicioId', request.usuarioInicioId.toString());
    if (request?.entidadRelacionadaId !== undefined) params.append('entidadRelacionadaId', request.entidadRelacionadaId.toString());
    if (request?.tipoEntidadRelacionada) params.append('tipoEntidadRelacionada', request.tipoEntidadRelacionada);
    if (request?.prioridad !== undefined) params.append('prioridad', request.prioridad.toString());
    if (request?.fechaInicioDesde) params.append('fechaInicioDesde', request.fechaInicioDesde);
    if (request?.fechaInicioHasta) params.append('fechaInicioHasta', request.fechaInicioHasta);
    if (request?.fechaFinDesde) params.append('fechaFinDesde', request.fechaFinDesde);
    if (request?.fechaFinHasta) params.append('fechaFinHasta', request.fechaFinHasta);
    if (request?.soloActivos !== undefined) params.append('soloActivos', request.soloActivos.toString());
    if (request?.page !== undefined) params.append('page', request.page.toString());
    if (request?.pageSize !== undefined) params.append('pageSize', request.pageSize.toString());
    if (request?.orderBy) params.append('orderBy', request.orderBy);
    if (request?.ascending !== undefined) params.append('ascending', request.ascending.toString());

    const url = `${this.baseEndpoint}/ejecuciones/paginadas?${params.toString()}`;
    return await this.get<EjecucionesFlujosPaginatedResponseData>(url);
  }

  /**
   * Inicia una nueva ejecución de flujo
   * POST /api/Workflow/ejecuciones/iniciar
   */
  async iniciarEjecucionFlujo(request: IniciarEjecucionFlujoRequest): Promise<ApiResponse<IniciarEjecucionFlujoResponseData>> {
    const url = `${this.baseEndpoint}/ejecuciones/iniciar`;
    return await this.post<IniciarEjecucionFlujoResponseData>(url, request);
  }

  /**
   * Actualiza una ejecución de flujo existente
   * PUT /api/Workflow/ejecuciones/{id}
   */
  async updateEjecucionFlujo(request: UpdateEjecucionFlujoRequest): Promise<ApiResponse<UpdateEjecucionFlujoResponseData>> {
    const url = `${this.baseEndpoint}/ejecuciones/${request.ejecucionFlujoId}`;
    return await this.put<UpdateEjecucionFlujoResponseData>(url, request);
  }

  /**
   * Finaliza una ejecución de flujo
   * POST /api/Workflow/ejecuciones/{id}/finalizar
   */
  async finalizarEjecucionFlujo(request: FinalizarEjecucionFlujoRequest): Promise<ApiResponse<FinalizarEjecucionFlujoResponseData>> {
    const url = `${this.baseEndpoint}/ejecuciones/${request.ejecucionFlujoId}/finalizar`;
    return await this.post<FinalizarEjecucionFlujoResponseData>(url, request);
  }

  // ===== OPERACIONES DE TAREAS =====

  /**
   * Obtiene tareas por ejecución de flujo
   * GET /api/Workflow/ejecuciones/{ejecucionId}/tareas
   */
  async getTareasByEjecucion(request: GetTareasByEjecucionRequest): Promise<ApiResponse<GetTareasByEjecucionResponseData>> {
    const url = `${this.baseEndpoint}/ejecuciones/${request.ejecucionFlujoId}/tareas`;
    return await this.get<GetTareasByEjecucionResponseData>(url);
  }

  /**
   * Crea una nueva tarea de workflow
   * POST /api/Workflow/tareas
   */
  async createTareaWorkflow(request: CreateTareaWorkflowRequest): Promise<ApiResponse<CreateTareaWorkflowResponseData>> {
    const url = `${this.baseEndpoint}/tareas`;
    return await this.post<CreateTareaWorkflowResponseData>(url, request);
  }

  /**
   * Completa una tarea de workflow
   * POST /api/Workflow/tareas/{id}/completar
   */
  async completarTarea(request: CompletarTareaRequest): Promise<ApiResponse<CompletarTareaResponseData>> {
    const url = `${this.baseEndpoint}/tareas/${request.tareaId}/completar`;
    return await this.post<CompletarTareaResponseData>(url, request);
  }

  // ===== OPERACIONES DE APROBACIONES =====

  /**
   * Obtiene aprobaciones por ejecución de flujo
   * GET /api/Workflow/ejecuciones/{ejecucionId}/aprobaciones
   */
  async getAprobacionesByEjecucion(request: GetAprobacionesByEjecucionRequest): Promise<ApiResponse<GetAprobacionesByEjecucionResponseData>> {
    const url = `${this.baseEndpoint}/ejecuciones/${request.ejecucionFlujoId}/aprobaciones`;
    return await this.get<GetAprobacionesByEjecucionResponseData>(url);
  }

  /**
   * Crea una nueva aprobación de workflow
   * POST /api/Workflow/aprobaciones
   */
  async createAprobacionWorkflow(request: CreateAprobacionWorkflowRequest): Promise<ApiResponse<CreateAprobacionWorkflowResponseData>> {
    const url = `${this.baseEndpoint}/aprobaciones`;
    return await this.post<CreateAprobacionWorkflowResponseData>(url, request);
  }

  /**
   * Responde a una aprobación de workflow
   * POST /api/Workflow/aprobaciones/{id}/responder
   */
  async responderAprobacion(request: ResponderAprobacionRequest): Promise<ApiResponse<ResponderAprobacionResponseData>> {
    const url = `${this.baseEndpoint}/aprobaciones/${request.aprobacionId}/responder`;
    return await this.post<ResponderAprobacionResponseData>(url, request);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca ejecuciones de flujo por término general
   */
  async searchEjecucionesFlujo(
    searchTerm: string, 
    filters?: WorkflowFilters,
    pagination?: WorkflowPaginationOptions,
    sort?: WorkflowSortOptions
  ): Promise<ApiResponse<EjecucionesFlujosPaginatedResponseData>> {
    const request: GetEjecucionesFlujosPaginatedRequest = {
      nombreFlujo: searchTerm,
      
      // Aplicar filtros adicionales
      ...filters,
      
      // Aplicar paginación
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 10,
      
      // Aplicar ordenamiento
      orderBy: sort?.orderBy || 'fechaInicio',
      ascending: sort?.ascending !== undefined ? sort.ascending : false
    };

    return await this.getEjecucionesFlujosPaginated(request);
  }

  /**
   * Obtiene ejecuciones por estado
   */
  async getEjecucionesByEstado(estado: EstadoEjecucion): Promise<ApiResponse<GetAllEjecucionesFlujoResponseData>> {
    const request: GetAllEjecucionesFlujoRequest = {
      estado,
      soloActivos: true
    };

    return await this.getAllEjecucionesFlujo(request);
  }

  /**
   * Obtiene ejecuciones por usuario iniciador
   */
  async getEjecucionesByUsuario(usuarioInicioId: number): Promise<ApiResponse<GetAllEjecucionesFlujoResponseData>> {
    const request: GetAllEjecucionesFlujoRequest = {
      usuarioInicioId,
      soloActivos: true
    };

    return await this.getAllEjecucionesFlujo(request);
  }

  /**
   * Obtiene ejecuciones por prioridad
   */
  async getEjecucionesByPrioridad(prioridad: PrioridadEjecucion): Promise<ApiResponse<GetAllEjecucionesFlujoResponseData>> {
    const request: GetAllEjecucionesFlujoRequest = {
      prioridad,
      soloActivos: true
    };

    return await this.getAllEjecucionesFlujo(request);
  }

  /**
   * Obtiene tareas pendientes de una ejecución
   */
  async getTareasPendientes(ejecucionFlujoId: number): Promise<ApiResponse<TareaWorkflow[]>> {
    const response = await this.getTareasByEjecucion({ ejecucionFlujoId });
    
    if (response.success && response.data) {
      const tareasPendientes = response.data.filter(tarea => tarea.estado === EstadoTarea.Pendiente);
      
      return {
        success: true,
        data: tareasPendientes,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener tareas pendientes',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene aprobaciones pendientes de una ejecución
   */
  async getAprobacionesPendientes(ejecucionFlujoId: number): Promise<ApiResponse<AprobacionWorkflow[]>> {
    const response = await this.getAprobacionesByEjecucion({ ejecucionFlujoId });
    
    if (response.success && response.data) {
      const aprobacionesPendientes = response.data.filter(aprobacion => aprobacion.estado === EstadoAprobacion.Pendiente);
      
      return {
        success: true,
        data: aprobacionesPendientes,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener aprobaciones pendientes',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Verifica si una ejecución puede ser finalizada
   */
  async puedeFinalizarEjecucion(ejecucionFlujoId: number): Promise<ApiResponse<boolean>> {
    try {
      const [tareasResponse, aprobacionesResponse] = await Promise.all([
        this.getTareasByEjecucion({ ejecucionFlujoId }),
        this.getAprobacionesByEjecucion({ ejecucionFlujoId })
      ]);

      if (!tareasResponse.success || !aprobacionesResponse.success) {
        return {
          success: false,
          data: false,
          message: 'Error al verificar el estado de la ejecución',
          errors: [...(tareasResponse.errors || []), ...(aprobacionesResponse.errors || [])],
          statusCode: 500,
          metadata: ''
        };
      }

      const tareas = tareasResponse.data || [];
      const aprobaciones = aprobacionesResponse.data || [];

      // Verificar que todas las tareas obligatorias estén completadas
      const tareasObligatoriasPendientes = tareas.filter(t => 
        t.esObligatoria && t.estado !== EstadoTarea.Completada
      );

      // Verificar que todas las aprobaciones requeridas estén aprobadas
      const aprobacionesPendientes = aprobaciones.filter(a => 
        a.estado === EstadoAprobacion.Pendiente
      );

      const puedeFinalizarse = tareasObligatoriasPendientes.length === 0 && aprobacionesPendientes.length === 0;

      return {
        success: true,
        data: puedeFinalizarse,
        message: puedeFinalizarse 
          ? 'La ejecución puede ser finalizada'
          : 'La ejecución tiene tareas o aprobaciones pendientes',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: false,
        message: 'Error al verificar si la ejecución puede ser finalizada',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const workflowService = new WorkflowService(); 