/**
 * Servicio para gestión de Bandeja de Tareas
 * Implementa el endpoint GET /api/GobernanzaWorkflow/bandeja-tareas/{usuarioId}
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';

// Tipos para la bandeja de tareas
export interface BandejaTareasDto {
  // Información de la ejecución
  workflowEjecucionId: number;
  gobernanzaWorkflowId: number;
  workflowGrupoId?: number;
  rolActualId: number;
  usuarioActualId: number;
  rolSiguienteId?: number;
  usuarioSiguienteId?: number;
  estadoTarea: number;
  esActivo: boolean;
  fechaInicioTarea: string;
  fechaCompletado?: string;

  // Información del workflow
  gobernanzaId: number;
  entidadId: number;
  accionWork?: string;
  estadoWorkflow: number;

  // Información relacionada
  gobernanzaNombre?: string;
  rolActualNombre?: string;
  usuarioActualNombre?: string;
  rolSiguienteNombre?: string;
  usuarioSiguienteNombre?: string;
  tipoEntidadNombre?: string;
  tipoGobiernoNombre?: string;

  // Propiedades computadas
  estadoTareaTexto: string;
  estadoWorkflowTexto: string;
  estaCompletada: boolean;
  estaPendiente: boolean;
  estaEnProceso: boolean;
  estaRechazada: boolean;
  diasDesdeLaAsignacion?: number;
  diasParaCompletar?: number;
  tieneSiguientePaso: boolean;
  descripcionFlujo: string;
  resumenTarea: string;
}

export interface BandejaTareasFilters {
  incluirPendientes?: boolean;
  incluirEnProceso?: boolean;
  incluirCompletadas?: boolean;
  incluirRechazadas?: boolean;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaCompletadoDesde?: string;
  fechaCompletadoHasta?: string;
  accionWorkflow?: string;
  gobernanzaId?: number;
  workflowGrupoId?: number;
  limitePendientes?: number;
  limiteCompletadas?: number;
  ordenarPor?: string;
  ordenDescendente?: boolean;
}

export type BandejaTareasResponse = ApiResponse<BandejaTareasDto[]>;

class BandejaTareasService extends BaseApiService {
  private readonly baseUrl = '/GobernanzaWorkflow';

  /**
   * Obtiene la bandeja de tareas de un usuario específico
   */
  async getBandejaTareasUsuario(
    usuarioId: number,
    filters?: BandejaTareasFilters
  ): Promise<BandejaTareasResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.incluirPendientes !== undefined) {
          params.append('incluirPendientes', filters.incluirPendientes.toString());
        }
        if (filters.incluirEnProceso !== undefined) {
          params.append('incluirEnProceso', filters.incluirEnProceso.toString());
        }
        if (filters.incluirCompletadas !== undefined) {
          params.append('incluirCompletadas', filters.incluirCompletadas.toString());
        }
        if (filters.incluirRechazadas !== undefined) {
          params.append('incluirRechazadas', filters.incluirRechazadas.toString());
        }
        if (filters.fechaInicioDesde) {
          params.append('fechaInicioDesde', filters.fechaInicioDesde);
        }
        if (filters.fechaInicioHasta) {
          params.append('fechaInicioHasta', filters.fechaInicioHasta);
        }
        if (filters.fechaCompletadoDesde) {
          params.append('fechaCompletadoDesde', filters.fechaCompletadoDesde);
        }
        if (filters.fechaCompletadoHasta) {
          params.append('fechaCompletadoHasta', filters.fechaCompletadoHasta);
        }
        if (filters.accionWorkflow) {
          params.append('accionWorkflow', filters.accionWorkflow);
        }
        if (filters.gobernanzaId) {
          params.append('gobernanzaId', filters.gobernanzaId.toString());
        }
        if (filters.workflowGrupoId) {
          params.append('workflowGrupoId', filters.workflowGrupoId.toString());
        }
        if (filters.limitePendientes) {
          params.append('limitePendientes', filters.limitePendientes.toString());
        }
        if (filters.limiteCompletadas) {
          params.append('limiteCompletadas', filters.limiteCompletadas.toString());
        }
        if (filters.ordenarPor) {
          params.append('ordenarPor', filters.ordenarPor);
        }
        if (filters.ordenDescendente !== undefined) {
          params.append('ordenDescendente', filters.ordenDescendente.toString());
        }
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/bandeja-tareas/${usuarioId}${queryString ? `?${queryString}` : ''}`;
      
      return await this.get<BandejaTareasDto[]>(url);
    } catch (error) {
      console.error('Error al obtener bandeja de tareas:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de la bandeja de tareas
   */
  getEstadisticasBandeja(tareas: BandejaTareasDto[]) {
    return {
      total: tareas.length,
      pendientes: tareas.filter(t => t.estaPendiente).length,
      enProceso: tareas.filter(t => t.estaEnProceso).length,
      completadas: tareas.filter(t => t.estaCompletada).length,
      rechazadas: tareas.filter(t => t.estaRechazada).length,
      vencidas: tareas.filter(t => t.diasDesdeLaAsignacion && t.diasDesdeLaAsignacion > 30 && !t.estaCompletada).length
    };
  }
}

export const bandejaTareasService = new BandejaTareasService();