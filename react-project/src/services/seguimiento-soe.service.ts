/**
 * Servicio para el seguimiento SOE (Sistema de Ordenamiento Empresarial)
 * Consume el endpoint del backend para obtener información del workflow
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { ErrorHandler } from '../utils/errorHandler';

// =============================================
// TIPOS DE DATOS
// =============================================

export interface PasoWorkflowDto {
  workflowEjecucionId: number;
  numeroPaso: number;
  rolId: number;
  nombreRol: string;
  codigoRol: string; // OWNER, SPONSOR, etc.
  colorRol?: string;
  usuarioId: number;
  nombreUsuario: string;
  emailUsuario: string;
  cargoUsuario: string;
  estadoTarea: number; // 0=Pendiente, 1=EnProceso, 2=Completado, 3=Rechazado
  estadoTareaTexto: string;
  esActivo: boolean;
  fechaInicioTarea: string;
  fechaCompletado?: string;
  observaciones?: string;
  motivoRechazo?: string;
  // Propiedades computadas
  estaPendiente: boolean;
  estaEnProceso: boolean;
  estaCompletado: boolean;
  estaRechazado: boolean;
  esPasoActual: boolean;
  puedeAprobar: boolean;
  puedeRechazar: boolean;
  estaDeshabilitado: boolean;
  diasPendiente: number;
}

export interface SeguimientoSOEDto {
  // Información del Sistema
  sistemaId: number;
  nombreSistema: string;
  codigoSistema?: string;
  funcionPrincipal?: string;
  accionWorkflow: string; // CREAR, ACTUALIZAR, etc.
  estadoGeneral: string; // PENDIENTE, EN_PROCESO, COMPLETADO, etc.
  fechaCreacion: string;

  // Información del Solicitante
  usuarioSolicitanteId: number;
  nombreSolicitante: string;
  rolSolicitante: string;
  emailSolicitante: string;

  // Información del Workflow
  gobernanzaWorkflowId: number;
  gobernanzaId: number;
  estadoWorkflow: number; // 0=Pendiente, 1=EnProceso, 2=Completado, 3=Cancelado
  estadoWorkflowTexto: string;
  progresoPorcentaje: number; // Porcentaje de completitud del workflow

  // Pasos del Workflow
  pasos: PasoWorkflowDto[];

  // Información Adicional
  motivoSolicitud?: string;
  observaciones?: string;
  fechaVencimiento?: string;
  diasPendiente: number; // Días desde que se inició el workflow
  
  // Información de la Tarea Activa
  numeroPasoActivo?: number;
  workflowEjecucionActivoId?: number;
  nombreUsuarioActivo?: string;
  rolActivo?: string;
}

// =============================================
// TIPOS DE RESPUESTA
// =============================================

export interface GetSeguimientoSOEResponse extends ApiResponse<SeguimientoSOEDto> {}

// =============================================
// SERVICIO
// =============================================

class SeguimientoSOEService extends BaseApiService {
  protected baseEndpoint = '/SeguimientoSOE';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  /**
   * Obtiene el seguimiento SOE completo para un sistema específico
   * @param sistemaId - ID del sistema
   * @returns Información completa del seguimiento SOE
   */
  async getSeguimientoSOE(sistemaId: number): Promise<ApiResponse<SeguimientoSOEDto>> {
    try {
      const url = `${this.baseEndpoint}/sistema/${sistemaId}`;
      const response = await this.get<SeguimientoSOEDto>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener seguimiento SOE', false);
      throw error;
    }
  }

  /**
   * Obtiene el seguimiento SOE completo para un dominio específico
   * @param dominioId - ID del dominio
   * @returns Información completa del seguimiento SOE
   */
  async getSeguimientoSOEByDominio(dominioId: number): Promise<ApiResponse<SeguimientoSOEDto>> {
    try {
      const url = `${this.baseEndpoint}/dominio/${dominioId}`;
      const response = await this.get<SeguimientoSOEDto>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener seguimiento SOE para dominio', false);
      throw error;
    }
  }

  /**
   * Obtiene el seguimiento SOE completo para un documento específico
   * @param documentoId - ID del documento
   * @returns Información completa del seguimiento SOE
   */
  async getSeguimientoSOEByDocumento(documentoId: number): Promise<ApiResponse<SeguimientoSOEDto>> {
    try {
      const url = `${this.baseEndpoint}/documento/${documentoId}`;
      const response = await this.get<SeguimientoSOEDto>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener seguimiento SOE para documento', false);
      throw error;
    }
  }

  /**
   * Verifica si un sistema tiene seguimiento SOE disponible
   * @param sistemaId - ID del sistema
   * @returns true si tiene seguimiento disponible
   */
  async tieneSeguimientoSOE(sistemaId: number): Promise<boolean> {
    try {
      const response = await this.getSeguimientoSOE(sistemaId);
      return response.success && response.data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el estado general del workflow para un sistema
   * @param sistemaId - ID del sistema
   * @returns Estado del workflow o null si no existe
   */
  async getEstadoWorkflow(sistemaId: number): Promise<string | null> {
    try {
      const response = await this.getSeguimientoSOE(sistemaId);
      if (response.success && response.data) {
        return response.data.estadoGeneral;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene el progreso del workflow para un sistema
   * @param sistemaId - ID del sistema
   * @returns Porcentaje de progreso o 0 si no existe
   */
  async getProgresoWorkflow(sistemaId: number): Promise<number> {
    try {
      const response = await this.getSeguimientoSOE(sistemaId);
      if (response.success && response.data) {
        return response.data.progresoPorcentaje;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }
}

// =============================================
// INSTANCIA EXPORTADA
// =============================================

export const seguimientoSOEService = new SeguimientoSOEService();
