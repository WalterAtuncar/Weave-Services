/**
 * Servicio para gestión de Gobernanza Workflow
 * Implementa endpoints del controlador GobernanzaWorkflowController
 * Maneja workflows de gobernanza con operaciones CRUD completas
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Entidad principal
  GobernanzaWorkflow,
  GobernanzaWorkflowDto,
  
  // Commands
  CreateGobernanzaWorkflowCommand,
  UpdateGobernanzaWorkflowCommand,
  
  // Filters
  GobernanzaWorkflowFilters,
  
  // Responses
  GobernanzaWorkflowResponse,
  GobernanzaWorkflowListResponse,
  GobernanzaWorkflowDtoResponse,
  GobernanzaWorkflowDtoListResponse,
  CreateGobernanzaWorkflowResponse,
  UpdateGobernanzaWorkflowResponse,
  DeleteGobernanzaWorkflowResponse,
  
  // Tipos auxiliares
  GobernanzaWorkflowAnalytics,
  GobernanzaWorkflowVersionHistory,
  GobernanzaWorkflowExportData,
  GobernanzaWorkflowImportData,
  EstadoGobernanzaWorkflow
} from './types/gobernanza-workflow.types';

export class GobernanzaWorkflowService extends BaseApiService {
  protected baseEndpoint = '/GobernanzaWorkflow';

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
   * Obtiene un workflow por su ID
   * GET /api/GobernanzaWorkflow/{workflowId}
   */
  async getById(workflowId: number, includeDeleted: boolean = false): Promise<GobernanzaWorkflowResponse> {
    try {
      if (!workflowId || workflowId <= 0) {
        throw new Error('ID de workflow debe ser mayor a cero');
      }

      const params = includeDeleted ? { includeDeleted } : {};
      const response = await this.get<ApiResponse<GobernanzaWorkflow>>(`${this.baseEndpoint}/${workflowId}`, { params });
      
      return {
        success: response.success,
        message: response.message || 'Workflow obtenido exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al obtener workflow:', error);
      throw this.handleError(error, 'Error al obtener el workflow');
    }
  }

  /**
   * Crea un nuevo workflow de gobernanza
   * POST /api/GobernanzaWorkflow
   */
  async create(command: CreateGobernanzaWorkflowCommand): Promise<CreateGobernanzaWorkflowResponse> {
    try {
      this.validateCreateCommand(command);

      const response = await this.post<ApiResponse<number>>(this.baseEndpoint, command);
      
      return {
        success: response.success,
        message: response.message || 'Workflow creado exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al crear workflow:', error);
      throw this.handleError(error, 'Error al crear el workflow');
    }
  }

  /**
   * Actualiza un workflow existente
   * PUT /api/GobernanzaWorkflow/{workflowId}
   */
  async update(workflowId: number, command: UpdateGobernanzaWorkflowCommand): Promise<UpdateGobernanzaWorkflowResponse> {
    try {
      if (!workflowId || workflowId <= 0) {
        throw new Error('ID de workflow debe ser mayor a cero');
      }

      this.validateUpdateCommand(command);

      const response = await this.put<ApiResponse<boolean>>(`${this.baseEndpoint}/${workflowId}`, command);
      
      return {
        success: response.success,
        message: response.message || 'Workflow actualizado exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al actualizar workflow:', error);
      throw this.handleError(error, 'Error al actualizar el workflow');
    }
  }

  /**
   * Elimina (lógicamente) un workflow
   * DELETE /api/GobernanzaWorkflow/{workflowId}
   */
  async delete(workflowId: number, eliminadoPor?: number): Promise<DeleteGobernanzaWorkflowResponse> {
    try {
      if (!workflowId || workflowId <= 0) {
        throw new Error('ID de workflow debe ser mayor a cero');
      }

      const params = eliminadoPor ? { eliminadoPor } : {};
      const response = await this.delete<ApiResponse<boolean>>(`${this.baseEndpoint}/${workflowId}`, { params });
      
      return {
        success: response.success,
        message: response.message || 'Workflow eliminado exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('Error al eliminar workflow:', error);
      throw this.handleError(error, 'Error al eliminar el workflow');
    }
  }

  // ================================================================
  // CONSULTAS ESPECIALIZADAS
  // ================================================================

  /**
   * Obtiene workflows por gobernanza específica
   * GET /api/GobernanzaWorkflow/gobernanza/{gobernanzaId}
   */
  async getByGobernanza(
    gobernanzaId: number, 
    includeDeleted: boolean = false, 
    soloActivos: boolean = false
  ): Promise<GobernanzaWorkflowListResponse> {
    try {
      if (!gobernanzaId || gobernanzaId <= 0) {
        throw new Error('ID de gobernanza debe ser mayor a cero');
      }

      const params: any = {};
      if (includeDeleted) params.includeDeleted = includeDeleted;
      if (soloActivos) params.soloActivos = soloActivos;

      const response = await this.get<ApiResponse<GobernanzaWorkflow[]>>(`${this.baseEndpoint}/gobernanza/${gobernanzaId}`, { params });
      
      return {
        success: response.success,
        message: response.message || 'Workflows obtenidos exitosamente',
        data: response.data || []
      };
    } catch (error) {
      console.error('Error al obtener workflows por gobernanza:', error);
      throw this.handleError(error, 'Error al obtener workflows de la gobernanza');
    }
  }

  // ================================================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ================================================================

  /**
   * Busca workflows con filtros específicos
   */
  async search(filters: GobernanzaWorkflowFilters): Promise<GobernanzaWorkflowDtoListResponse> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await this.get<ApiResponse<GobernanzaWorkflowDto[]>>(this.baseEndpoint, { params });
      
      return {
        success: response.success,
        message: response.message || 'Workflows encontrados exitosamente',
        data: response.data || []
      };
    } catch (error) {
      console.error('Error al buscar workflows:', error);
      throw this.handleError(error, 'Error al buscar workflows');
    }
  }

  /**
   * Obtiene workflows activos
   */
  async getActivos(): Promise<GobernanzaWorkflowDtoListResponse> {
    try {
      const filters: GobernanzaWorkflowFilters = {
        estado: EstadoGobernanzaWorkflow.ACTIVO,
        soloActivos: true
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener workflows activos:', error);
      throw this.handleError(error, 'Error al obtener workflows activos');
    }
  }

  /**
   * Obtiene workflows en borrador
   */
  async getBorradores(): Promise<GobernanzaWorkflowDtoListResponse> {
    try {
      const filters: GobernanzaWorkflowFilters = {
        estado: EstadoGobernanzaWorkflow.BORRADOR
      };

      return await this.search(filters);
    } catch (error) {
      console.error('Error al obtener workflows en borrador:', error);
      throw this.handleError(error, 'Error al obtener workflows en borrador');
    }
  }

  // ================================================================
  // MÉTODOS DE GESTIÓN DE ESTADO
  // ================================================================

  /**
   * Activa un workflow
   */
  async activar(workflowId: number, actualizadoPor?: number): Promise<UpdateGobernanzaWorkflowResponse> {
    try {
      const command: UpdateGobernanzaWorkflowCommand = {
        gobernanzaWorkflowId: workflowId,
        gobernanzaId: 0, // Se obtendrá del workflow existente
        diagramaBPMN: '', // Se obtendrá del workflow existente
        estado: EstadoGobernanzaWorkflow.ACTIVO,
        actualizadoPor
      };

      // Primero obtenemos el workflow actual para completar los datos requeridos
      const currentWorkflow = await this.getById(workflowId);
      command.gobernanzaId = currentWorkflow.data.gobernanzaId;
      command.diagramaBPMN = currentWorkflow.data.diagramaBPMN;

      return await this.update(workflowId, command);
    } catch (error) {
      console.error('Error al activar workflow:', error);
      throw this.handleError(error, 'Error al activar el workflow');
    }
  }

  /**
   * Suspende un workflow
   */
  async suspender(workflowId: number, actualizadoPor?: number): Promise<UpdateGobernanzaWorkflowResponse> {
    try {
      const command: UpdateGobernanzaWorkflowCommand = {
        gobernanzaWorkflowId: workflowId,
        gobernanzaId: 0, // Se obtendrá del workflow existente
        diagramaBPMN: '', // Se obtendrá del workflow existente
        estado: EstadoGobernanzaWorkflow.SUSPENDIDO,
        actualizadoPor
      };

      // Primero obtenemos el workflow actual para completar los datos requeridos
      const currentWorkflow = await this.getById(workflowId);
      command.gobernanzaId = currentWorkflow.data.gobernanzaId;
      command.diagramaBPMN = currentWorkflow.data.diagramaBPMN;

      return await this.update(workflowId, command);
    } catch (error) {
      console.error('Error al suspender workflow:', error);
      throw this.handleError(error, 'Error al suspender el workflow');
    }
  }

  // ================================================================
  // MÉTODOS DE VERSIONADO
  // ================================================================

  /**
   * Duplica un workflow para crear una nueva versión
   */
  async duplicar(workflowId: number, command: CreateGobernanzaWorkflowCommand): Promise<CreateGobernanzaWorkflowResponse> {
    try {
      const originalWorkflow = await this.getById(workflowId);
      
      const duplicateCommand: CreateGobernanzaWorkflowCommand = {
        ...command,
        diagramaBPMN: originalWorkflow.data.diagramaBPMN,
        version: (originalWorkflow.data.version || 0) + 1,
        estado: EstadoGobernanzaWorkflow.BORRADOR
      };

      return await this.create(duplicateCommand);
    } catch (error) {
      console.error('Error al duplicar workflow:', error);
      throw this.handleError(error, 'Error al duplicar el workflow');
    }
  }

  // ================================================================
  // MÉTODOS DE ANÁLISIS Y MÉTRICAS
  // ================================================================

  /**
   * Obtiene análiticas de un workflow específico
   */
  async getAnalytics(workflowId: number): Promise<GobernanzaWorkflowAnalytics> {
    try {
      const response = await this.get<ApiResponse<GobernanzaWorkflowAnalytics>>(`${this.baseEndpoint}/${workflowId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener analytics de workflow:', error);
      throw this.handleError(error, 'Error al obtener las analíticas del workflow');
    }
  }

  /**
   * Obtiene historial de versiones de un workflow
   */
  async getVersionHistory(workflowId: number): Promise<GobernanzaWorkflowVersionHistory> {
    try {
      const response = await this.get<ApiResponse<GobernanzaWorkflowVersionHistory>>(`${this.baseEndpoint}/${workflowId}/versions`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de versiones:', error);
      throw this.handleError(error, 'Error al obtener el historial de versiones');
    }
  }

  // ================================================================
  // MÉTODOS DE UTILIDAD Y VALIDACIÓN
  // ================================================================

  /**
   * Valida el comando de creación
   */
  private validateCreateCommand(command: CreateGobernanzaWorkflowCommand): void {
    const errors: string[] = [];

    if (!command.gobernanzaId || command.gobernanzaId <= 0) {
      errors.push('ID de gobernanza es requerido');
    }

    if (!command.diagramaBPMN || command.diagramaBPMN.trim() === '') {
      errors.push('Diagrama BPMN es requerido');
    }

    if (command.version && command.version < 1) {
      errors.push('La versión debe ser mayor a cero');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Valida el comando de actualización
   */
  private validateUpdateCommand(command: UpdateGobernanzaWorkflowCommand): void {
    const errors: string[] = [];

    if (!command.gobernanzaWorkflowId || command.gobernanzaWorkflowId <= 0) {
      errors.push('ID de workflow es requerido');
    }

    if (!command.gobernanzaId || command.gobernanzaId <= 0) {
      errors.push('ID de gobernanza es requerido');
    }

    if (!command.diagramaBPMN || command.diagramaBPMN.trim() === '') {
      errors.push('Diagrama BPMN es requerido');
    }

    if (command.version && command.version < 1) {
      errors.push('La versión debe ser mayor a cero');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Construye parámetros de filtros
   */
  private buildFilterParams(filters: GobernanzaWorkflowFilters): Record<string, any> {
    const params: Record<string, any> = {};

    if (filters.gobernanzaId) params.gobernanzaId = filters.gobernanzaId;
    if (filters.estado !== undefined) params.estado = filters.estado;
    if (filters.version) params.version = filters.version;
    if (filters.fechaCreacionDesde) params.fechaCreacionDesde = filters.fechaCreacionDesde;
    if (filters.fechaCreacionHasta) params.fechaCreacionHasta = filters.fechaCreacionHasta;
    if (filters.fechaActualizacionDesde) params.fechaActualizacionDesde = filters.fechaActualizacionDesde;
    if (filters.fechaActualizacionHasta) params.fechaActualizacionHasta = filters.fechaActualizacionHasta;
    if (filters.creadoPor) params.creadoPor = filters.creadoPor;
    if (filters.actualizadoPor) params.actualizadoPor = filters.actualizadoPor;
    if (filters.includeDeleted !== undefined) params.includeDeleted = filters.includeDeleted;
    if (filters.soloActivos !== undefined) params.soloActivos = filters.soloActivos;

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
export const gobernanzaWorkflowService = new GobernanzaWorkflowService();