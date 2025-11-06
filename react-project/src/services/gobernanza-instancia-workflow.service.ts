/**
 * Servicio para gestión de Gobernanza Instancia Workflow
 * Implementa endpoints del controlador GobernanzaInstanciaWorkflowController
 * Maneja instancias de workflow de gobernanza con información enriquecida
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Entidad principal
  GobernanzaInstanciaWorkflow,
  GobernanzaInstanciaWorkflowEnrichedDto,
  
  // Commands
  CreateGobernanzaInstanciaWorkflowCommand,
  FinalizarInstanciaWorkflowCommand,
  
  // Requests y Filters
  GetGobernanzaInstanciaWorkflowPaginatedRequest,
  GobernanzaInstanciaWorkflowFilters,
  
  // Responses
  GobernanzaInstanciaWorkflowResponse,
  GobernanzaInstanciaWorkflowListResponse,
  GobernanzaInstanciaWorkflowEnrichedResponse,
  GobernanzaInstanciaWorkflowEnrichedListResponse,
  GobernanzaInstanciaWorkflowPaginatedResponse,
  CreateGobernanzaInstanciaWorkflowResponse,
  FinalizarInstanciaWorkflowResponse
} from './types/gobernanza-instancia-workflow.types';

export class GobernanzaInstanciaWorkflowService extends BaseApiService {
  protected baseEndpoint = '/GobernanzaInstanciaWorkflow';

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
   * Obtiene una instancia de workflow por su ID
   * GET /api/GobernanzaInstanciaWorkflow/{instanciaId}
   */
  async getById(instanciaId: number): Promise<GobernanzaInstanciaWorkflowResponse> {
    try {
      if (!instanciaId || instanciaId <= 0) {
        throw new Error('ID de instancia debe ser mayor a cero');
      }

      const response = await this.get<ApiResponse<GobernanzaInstanciaWorkflow>>(`${this.baseEndpoint}/${instanciaId}`);
      
      return {
        success: response.success,
        message: response.message || 'Instancia obtenida exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al obtener instancia de workflow:', error);
      throw this.handleError(error, 'Error al obtener la instancia de workflow');
    }
  }

  /**
   * Crea una nueva instancia de workflow
   * POST /api/GobernanzaInstanciaWorkflow
   */
  async create(command: CreateGobernanzaInstanciaWorkflowCommand): Promise<CreateGobernanzaInstanciaWorkflowResponse> {
    try {
      this.validateCreateCommand(command);

      const response = await this.post<ApiResponse<number>>(this.baseEndpoint, command);
      
      return {
        success: response.success,
        message: response.message || 'Instancia de workflow creada exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al crear instancia de workflow:', error);
      throw this.handleError(error, 'Error al crear la instancia de workflow');
    }
  }

  /**
   * Finaliza una instancia de workflow
   * POST /api/GobernanzaInstanciaWorkflow/{instanciaId}/finalizar
   */
  async finalizar(instanciaId: number, command: FinalizarInstanciaWorkflowCommand): Promise<FinalizarInstanciaWorkflowResponse> {
    try {
      if (!instanciaId || instanciaId <= 0) {
        throw new Error('ID de instancia debe ser mayor a cero');
      }

      this.validateFinalizarCommand(command);

      const response = await this.post<ApiResponse<boolean>>(`${this.baseEndpoint}/${instanciaId}/finalizar`, command);
      
      return {
        success: response.success,
        message: response.message || 'Instancia de workflow finalizada exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al finalizar instancia de workflow:', error);
      throw this.handleError(error, 'Error al finalizar la instancia de workflow');
    }
  }

  // ================================================================
  // CONSULTAS ESPECIALIZADAS
  // ================================================================

  /**
   * Obtiene instancias por workflow específico
   * GET /api/GobernanzaInstanciaWorkflow/workflow/{workflowId}
   */
  async getByWorkflow(workflowId: number): Promise<GobernanzaInstanciaWorkflowListResponse> {
    try {
      if (!workflowId || workflowId <= 0) {
        throw new Error('ID de workflow debe ser mayor a cero');
      }

      const response = await this.get<ApiResponse<GobernanzaInstanciaWorkflow[]>>(`${this.baseEndpoint}/workflow/${workflowId}`);
      
      return {
        success: response.success,
        message: response.message || 'Instancias obtenidas exitosamente',
        data: response.data || []
      };
    } catch (error) {
      console.error('Error al obtener instancias por workflow:', error);
      throw this.handleError(error, 'Error al obtener las instancias del workflow');
    }
  }

  /**
   * Obtiene instancias paginadas con información enriquecida
   * GET /api/GobernanzaInstanciaWorkflow/paginated
   */
  async getPaginated(request: GetGobernanzaInstanciaWorkflowPaginatedRequest): Promise<GobernanzaInstanciaWorkflowPaginatedResponse> {
    try {
      this.validatePaginatedRequest(request);

      const params = this.buildPaginatedParams(request);
      const response = await this.get<ApiResponse<any>>(`${this.baseEndpoint}/paginated`, { params });
      
      return {
        success: response.success,
        message: response.message || 'Instancias paginadas obtenidas exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al obtener instancias paginadas:', error);
      throw this.handleError(error, 'Error al obtener las instancias paginadas');
    }
  }

  // ================================================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ================================================================

  /**
   * Busca instancias con filtros específicos
   */
  async search(filters: GobernanzaInstanciaWorkflowFilters): Promise<GobernanzaInstanciaWorkflowEnrichedListResponse> {
    try {
      const paginatedRequest: GetGobernanzaInstanciaWorkflowPaginatedRequest = {
        page: 1,
        pageSize: 100,
        ...filters
      };

      const response = await this.getPaginated(paginatedRequest);
      
      return {
        success: response.success,
        message: response.message,
        data: response.data.items
      };
    } catch (error) {
      console.error('Error al buscar instancias:', error);
      throw this.handleError(error, 'Error al buscar instancias');
    }
  }

  /**
   * Obtiene instancias que requieren atención
   */
  async getRequierenAtencion(): Promise<GobernanzaInstanciaWorkflowEnrichedListResponse> {
    try {
      const filters: GobernanzaInstanciaWorkflowFilters = {
        requierenAtencion: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener instancias que requieren atención:', error);
      throw this.handleError(error, 'Error al obtener instancias que requieren atención');
    }
  }

  /**
   * Obtiene instancias sin gobernanza asignada
   */
  async getSinGobernanza(): Promise<GobernanzaInstanciaWorkflowEnrichedListResponse> {
    try {
      const filters: GobernanzaInstanciaWorkflowFilters = {
        soloSinGobernanza: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener instancias sin gobernanza:', error);
      throw this.handleError(error, 'Error al obtener instancias sin gobernanza');
    }
  }

  /**
   * Obtiene instancias con gobernanzas vencidas
   */
  async getGobernanzasVencidas(): Promise<GobernanzaInstanciaWorkflowEnrichedListResponse> {
    try {
      const filters: GobernanzaInstanciaWorkflowFilters = {
        soloGobernanzasVencidas: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener instancias con gobernanzas vencidas:', error);
      throw this.handleError(error, 'Error al obtener instancias con gobernanzas vencidas');
    }
  }

  // ================================================================
  // MÉTODOS DE UTILIDAD Y VALIDACIÓN
  // ================================================================

  /**
   * Valida el comando de creación
   */
  private validateCreateCommand(command: CreateGobernanzaInstanciaWorkflowCommand): void {
    const errors: string[] = [];

    if (!command.gobernanzaWorkflowId || command.gobernanzaWorkflowId <= 0) {
      errors.push('ID de workflow de gobernanza es requerido');
    }

    if (!command.gobernanzaId || command.gobernanzaId <= 0) {
      errors.push('ID de gobernanza es requerido');
    }

    if (!command.diagramaBPMN || command.diagramaBPMN.trim() === '') {
      errors.push('Diagrama BPMN es requerido');
    }

    if (!command.iniciadoPor || command.iniciadoPor <= 0) {
      errors.push('Usuario iniciador es requerido');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Valida el comando de finalización
   */
  private validateFinalizarCommand(command: FinalizarInstanciaWorkflowCommand): void {
    const errors: string[] = [];

    if (!command.instanciaWorkflowId || command.instanciaWorkflowId <= 0) {
      errors.push('ID de instancia de workflow es requerido');
    }

    if (command.observacionesFinalizacion && command.observacionesFinalizacion.length > 500) {
      errors.push('Las observaciones no pueden exceder 500 caracteres');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Valida la request paginada
   */
  private validatePaginatedRequest(request: GetGobernanzaInstanciaWorkflowPaginatedRequest): void {
    const errors: string[] = [];

    if (request.page && request.page < 1) {
      errors.push('El número de página debe ser mayor a cero');
    }

    if (request.pageSize && (request.pageSize < 1 || request.pageSize > 100)) {
      errors.push('El tamaño de página debe estar entre 1 y 100');
    }

    if (request.searchTerm && request.searchTerm.length > 100) {
      errors.push('El término de búsqueda no puede exceder 100 caracteres');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Construye parámetros para consulta paginada
   */
  private buildPaginatedParams(request: GetGobernanzaInstanciaWorkflowPaginatedRequest): Record<string, any> {
    const params: Record<string, any> = {};

    // Parámetros de paginación
    if (request.page) params.Page = request.page;
    if (request.pageSize) params.PageSize = request.pageSize;
    if (request.orderBy) params.OrderBy = request.orderBy;
    if (request.orderDescending !== undefined) params.OrderDescending = request.orderDescending;

    // Filtros de instancia
    if (request.estadoInstancia !== undefined) params.EstadoInstancia = request.estadoInstancia;
    if (request.gobernanzaWorkflowId) params.GobernanzaWorkflowId = request.gobernanzaWorkflowId;
    if (request.fechaInicioDesde) params.FechaInicioDesde = request.fechaInicioDesde;
    if (request.fechaInicioHasta) params.FechaInicioHasta = request.fechaInicioHasta;
    if (request.fechaFinalizacionDesde) params.FechaFinalizacionDesde = request.fechaFinalizacionDesde;
    if (request.fechaFinalizacionHasta) params.FechaFinalizacionHasta = request.fechaFinalizacionHasta;
    if (request.iniciadoPor) params.IniciadoPor = request.iniciadoPor;

    // Filtros de gobernanza
    if (request.gobernanzaId) params.GobernanzaId = request.gobernanzaId;
    if (request.tipoGobiernoId) params.TipoGobiernoId = request.tipoGobiernoId;
    if (request.tipoEntidadId) params.TipoEntidadId = request.tipoEntidadId;
    if (request.entidadId) params.EntidadId = request.entidadId;
    if (request.gobernanzaEstado !== undefined) params.GobernanzaEstado = request.gobernanzaEstado;

    // Filtros booleanos
    if (request.soloSinGobernanza !== undefined) params.SoloSinGobernanza = request.soloSinGobernanza;
    if (request.soloConGobernanza !== undefined) params.SoloConGobernanza = request.soloConGobernanza;
    if (request.soloCompletadas !== undefined) params.SoloCompletadas = request.soloCompletadas;
    if (request.soloEnProgreso !== undefined) params.SoloEnProgreso = request.soloEnProgreso;
    if (request.soloGobernanzasVencidas !== undefined) params.SoloGobernanzasVencidas = request.soloGobernanzasVencidas;
    if (request.soloGobernanzasProximasAVencer !== undefined) params.SoloGobernanzasProximasAVencer = request.soloGobernanzasProximasAVencer;
    if (request.requierenAtencion !== undefined) params.RequierenAtencion = request.requierenAtencion;

    // Búsqueda textual
    if (request.searchTerm) params.SearchTerm = request.searchTerm;

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
export const gobernanzaInstanciaWorkflowService = new GobernanzaInstanciaWorkflowService();