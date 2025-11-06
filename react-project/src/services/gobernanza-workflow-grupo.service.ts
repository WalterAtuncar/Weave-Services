import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../types/api.types';

// Interfaces para el servicio de grupos de workflow
export interface GobernanzaWorkflowGrupo {
  workflowGrupoId: number;
  gobernanzaWorkflowId: number;
  ordenEjecucion: number;
  totalUsuarios: number;
  usuariosCompletados: number;
  estadoGrupo: number; // 0=Pendiente, 1=Activo, 2=Completado, 3=Rechazado
  esActivo: boolean;
  fechaInicio?: string;
  fechaCompletado?: string;
  version: number;
  estado: number;
  creadoPor: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
}

export interface ResumenGrupoDto {
  grupoId: number;
  workflowId: number;
  ordenGrupo: number;
  estaActivo: boolean;
  estaCompleto: boolean;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  totalEjecuciones: number;
  ejecucionesCompletadas: number;
  ejecucionesPendientes: number;
  ejecucionesEnProceso: number;
  ejecucionesRechazadas: number;
  porcentajeCompletado: number;
  usuariosCompletados: number;
  totalUsuarios: number;
  estadoDescripcion: string;
  puedeAvanzar: boolean;
}

export interface GobernanzaWorkflowEjecucion {
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
}

export type GrupoWorkflowResponse = ApiResponse<GobernanzaWorkflowGrupo>;
export type GruposWorkflowResponse = ApiResponse<GobernanzaWorkflowGrupo[]>;
export type ResumenGrupoResponse = ApiResponse<ResumenGrupoDto>;
export type EjecucionesGrupoResponse = ApiResponse<GobernanzaWorkflowEjecucion[]>;
export type FinalizarGrupoResponse = ApiResponse<{ mensaje: string }>;

class GobernanzaWorkflowGrupoService extends BaseApiService {
  private readonly baseUrl = '/GobernanzaWorkflowGrupo';

  /**
   * Obtiene un grupo de workflow por su ID
   */
  async getGrupoById(grupoId: number): Promise<GrupoWorkflowResponse> {
    try {
      return await this.get<GobernanzaWorkflowGrupo>(`${this.baseUrl}/${grupoId}`);
    } catch (error) {
      console.error('Error al obtener grupo por ID:', error);
      throw error;
    }
  }

  /**
   * Obtiene el grupo activo de un workflow específico
   */
  async getGrupoActivoByWorkflowId(workflowId: number): Promise<GrupoWorkflowResponse> {
    try {
      return await this.get<GobernanzaWorkflowGrupo>(`${this.baseUrl}/activo/workflow/${workflowId}`);
    } catch (error) {
      console.error('Error al obtener grupo activo:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los grupos de un workflow específico
   */
  async getGruposByWorkflowId(workflowId: number): Promise<GruposWorkflowResponse> {
    try {
      return await this.get<GobernanzaWorkflowGrupo[]>(`${this.baseUrl}/workflow/${workflowId}`);
    } catch (error) {
      console.error('Error al obtener grupos por workflow:', error);
      throw error;
    }
  }

  /**
   * Obtiene las ejecuciones de un grupo específico
   */
  async getEjecucionesByGrupoId(grupoId: number): Promise<EjecucionesGrupoResponse> {
    try {
      return await this.get<GobernanzaWorkflowEjecucion[]>(`${this.baseUrl}/${grupoId}/ejecuciones`);
    } catch (error) {
      console.error('Error al obtener ejecuciones del grupo:', error);
      throw error;
    }
  }

  /**
   * Finaliza un grupo de workflow cuando todas sus ejecuciones están completas
   */
  async finalizarGrupo(grupoId: number): Promise<FinalizarGrupoResponse> {
    try {
      return await this.post<{ mensaje: string }>(`${this.baseUrl}/${grupoId}/finalizar`, {});
    } catch (error) {
      console.error('Error al finalizar grupo:', error);
      throw error;
    }
  }

  /**
   * Obtiene el resumen de estado de un grupo
   */
  async getResumenGrupo(grupoId: number): Promise<ResumenGrupoResponse> {
    try {
      return await this.get<ResumenGrupoDto>(`${this.baseUrl}/${grupoId}/resumen`);
    } catch (error) {
      console.error('Error al obtener resumen del grupo:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de un grupo de workflow
   */
  getEstadisticasGrupo(grupo: GobernanzaWorkflowGrupo) {
    const porcentajeCompletado = grupo.totalUsuarios > 0 
      ? (grupo.usuariosCompletados / grupo.totalUsuarios) * 100 
      : 0;

    return {
      grupoId: grupo.workflowGrupoId,
      ordenEjecucion: grupo.ordenEjecucion,
      totalUsuarios: grupo.totalUsuarios,
      usuariosCompletados: grupo.usuariosCompletados,
      usuariosPendientes: grupo.totalUsuarios - grupo.usuariosCompletados,
      porcentajeCompletado: Math.round(porcentajeCompletado * 100) / 100,
      estaActivo: grupo.esActivo,
      estadoDescripcion: this.getEstadoDescripcion(grupo.estadoGrupo),
      puedeAvanzar: grupo.usuariosCompletados === grupo.totalUsuarios && grupo.estadoGrupo !== 2
    };
  }

  /**
   * Convierte el código de estado a descripción legible
   */
  private getEstadoDescripcion(estadoGrupo: number): string {
    switch (estadoGrupo) {
      case 0: return 'Pendiente';
      case 1: return 'Activo';
      case 2: return 'Completado';
      case 3: return 'Rechazado';
      default: return 'Desconocido';
    }
  }

  /**
   * Verifica si un grupo puede ser finalizado
   */
  puedeFinalizarGrupo(grupo: GobernanzaWorkflowGrupo): boolean {
    return grupo.esActivo && 
           grupo.usuariosCompletados === grupo.totalUsuarios && 
           grupo.estadoGrupo === 1; // Activo
  }
}

export const gobernanzaWorkflowGrupoService = new GobernanzaWorkflowGrupoService();