/**
 * Servicio para acciones de workflow de gobernanza
 * Maneja aprobaciones y rechazos de tareas en el flujo de trabajo
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';

// =============================================
// TIPOS DE DATOS
// =============================================

export interface AprobarWorkflowRequest {
  workflowEjecucionId: number;
  observaciones?: string;
  // Información adicional para completar el flujo
  sistemaId?: number;
  nombreSistema?: string;
  accionWorkflow?: string;
  usuarioSolicitanteId?: number;
  emailSolicitante?: string;
  nombreSolicitante?: string;
  gobernanzaWorkflowId?: number;
}

export interface RechazarWorkflowRequest {
  workflowEjecucionId: number;
  motivoRechazo: string;
  // Información adicional para completar el flujo
  sistemaId?: number;
  nombreSistema?: string;
  accionWorkflow?: string;
  usuarioSolicitanteId?: number;
  emailSolicitante?: string;
  nombreSolicitante?: string;
  gobernanzaWorkflowId?: number;
}

export interface WorkflowActionResponse {
  success: boolean;
  message: string;
  data: boolean;
}

// =============================================
// SERVICIO
// =============================================

class GobernanzaWorkflowActionsService extends BaseApiService {
  private readonly baseUrl = '/GobernanzaWorkflow';

  /**
   * Aprueba una tarea del workflow y avanza al siguiente paso
   * @param request - Datos de la aprobación
   * @returns Resultado de la operación
   */
  async aprobarTarea(request: AprobarWorkflowRequest): Promise<WorkflowActionResponse> {
    try {
      const response = await this.post<ApiResponse<boolean>>(`${this.baseUrl}/aprobar`, request);
      
      return {
        success: response.success,
        message: response.message || 'Tarea aprobada exitosamente',
        data: response.data || false
      };
    } catch (error) {
      console.error('Error al aprobar tarea:', error);
      throw this.handleError(error, 'Error al aprobar la tarea');
    }
  }

  /**
   * Rechaza una tarea del workflow y cancela el proceso
   * @param request - Datos del rechazo
   * @returns Resultado de la operación
   */
  async rechazarTarea(request: RechazarWorkflowRequest): Promise<WorkflowActionResponse> {
    try {
      const response = await this.post<ApiResponse<boolean>>(`${this.baseUrl}/rechazar`, request);
      
      return {
        success: response.success,
        message: response.message || 'Tarea rechazada exitosamente',
        data: response.data || false
      };
    } catch (error) {
      console.error('Error al rechazar tarea:', error);
      throw this.handleError(error, 'Error al rechazar la tarea');
    }
  }
}

// =============================================
// INSTANCIA EXPORTADA
// =============================================

export const gobernanzaWorkflowActionsService = new GobernanzaWorkflowActionsService();
