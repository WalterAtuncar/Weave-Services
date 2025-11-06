/**
 * Servicio para gestión de asociaciones GobernanzaEntidad
 * Implementa endpoints del controlador GobernanzaEntidadController
 * Maneja las asociaciones entre gobernanzas y entidades específicas
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { GobernanzaEntidad, CreateGobernanzaEntidadCommand, UpdateGobernanzaEntidadCommand } from './types/gobernanza-entidad.types';

export class GobernanzaEntidadService extends BaseApiService {
  protected baseEndpoint = '/GobernanzaEntidad';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableErrorHandling: true
    });
  }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Crea una nueva asociación entre gobernanza y entidad
   * POST /api/GobernanzaEntidad
   */
  async createAsociacion(command: CreateGobernanzaEntidadCommand): Promise<ApiResponse<number>> {
    return await this.post<number>(this.baseEndpoint, command);
  }

  /**
   * Actualiza una asociación existente
   * PUT /api/GobernanzaEntidad
   */
  async updateAsociacion(command: UpdateGobernanzaEntidadCommand): Promise<ApiResponse<boolean>> {
    return await this.put<boolean>(this.baseEndpoint, command);
  }

  /**
   * Elimina una asociación (soft delete)
   * DELETE /api/GobernanzaEntidad/{id}
   */
  async deleteAsociacion(gobernanzaEntidadId: number): Promise<ApiResponse<boolean>> {
    const url = `${this.baseEndpoint}/${gobernanzaEntidadId}`;
    return await this.delete<boolean>(url);
  }

  /**
   * Obtiene una asociación por su ID
   * GET /api/GobernanzaEntidad/{id}
   */
  async getAsociacionById(gobernanzaEntidadId: number): Promise<ApiResponse<GobernanzaEntidad>> {
    const url = `${this.baseEndpoint}/${gobernanzaEntidadId}`;
    return await this.get<GobernanzaEntidad>(url);
  }

  // ==========================================
  // CONSULTAS ESPECIALIZADAS
  // ==========================================

  /**
   * Obtiene todas las entidades asociadas a una gobernanza
   * GET /api/GobernanzaEntidad/por-gobernanza/{gobernanzaId}
   */
  async getEntidadesByGobernanza(gobernanzaId: number): Promise<ApiResponse<GobernanzaEntidad[]>> {
    const url = `${this.baseEndpoint}/por-gobernanza/${gobernanzaId}`;
    return await this.get<GobernanzaEntidad[]>(url);
  }

  /**
   * Obtiene todas las gobernanzas asociadas a una entidad
   * GET /api/GobernanzaEntidad/por-entidad/{entidadId}
   */
  async getGobernanzasByEntidad(entidadId: number): Promise<ApiResponse<GobernanzaEntidad[]>> {
    const url = `${this.baseEndpoint}/por-entidad/${entidadId}`;
    return await this.get<GobernanzaEntidad[]>(url);
  }

  /**
   * Verifica si existe una asociación activa entre una gobernanza y una entidad
   * GET /api/GobernanzaEntidad/existe-asociacion
   */
  async existeAsociacionActiva(
    gobernanzaId: number, 
    entidadId: number, 
    fechaReferencia?: string
  ): Promise<ApiResponse<boolean>> {
    const params = new URLSearchParams({
      gobernanzaId: gobernanzaId.toString(),
      entidadId: entidadId.toString()
    });
    
    if (fechaReferencia) {
      params.append('fechaReferencia', fechaReferencia);
    }

    const url = `${this.baseEndpoint}/existe-asociacion?${params.toString()}`;
    return await this.get<boolean>(url);
  }

  /**
   * Desactiva una asociación entre una gobernanza y una entidad
   * PUT /api/GobernanzaEntidad/desactivar
   */
  async desactivarAsociacion(
    gobernanzaId: number, 
    entidadId: number, 
    fechaDesasociacion?: string,
    observaciones?: string
  ): Promise<ApiResponse<boolean>> {
    const command = {
      gobernanzaId,
      entidadId,
      fechaDesasociacion: fechaDesasociacion || new Date().toISOString(),
      observaciones
    };

    const url = `${this.baseEndpoint}/desactivar`;
    return await this.put<boolean>(url, command);
  }

  /**
   * Activa una asociación entre una gobernanza y una entidad
   * PUT /api/GobernanzaEntidad/activar
   */
  async activarAsociacion(
    gobernanzaId: number, 
    entidadId: number, 
    fechaAsociacion?: string,
    observaciones?: string
  ): Promise<ApiResponse<boolean>> {
    const command = {
      gobernanzaId,
      entidadId,
      fechaAsociacion: fechaAsociacion || new Date().toISOString(),
      observaciones
    };

    const url = `${this.baseEndpoint}/activar`;
    return await this.put<boolean>(url, command);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Asocia un sistema a una gobernanza específica
   * Método de conveniencia para sistemas
   */
  async asociarSistemaAGobernanza(
    gobernanzaId: number,
    sistemaId: number,
    observaciones?: string
  ): Promise<ApiResponse<number>> {
    const command: CreateGobernanzaEntidadCommand = {
      gobernanzaId,
      entidadId: sistemaId,
      fechaAsociacion: new Date().toISOString(),
      observaciones,
      esActiva: true
    };

    return await this.createAsociacion(command);
  }

  /**
   * Desasocia un sistema de una gobernanza
   * Método de conveniencia para sistemas
   */
  async desasociarSistemaDeGobernanza(
    gobernanzaId: number,
    sistemaId: number,
    observaciones?: string
  ): Promise<ApiResponse<boolean>> {
    return await this.desactivarAsociacion(
      gobernanzaId,
      sistemaId,
      new Date().toISOString(),
      observaciones
    );
  }

  /**
   * Verifica si un sistema tiene una gobernanza asociada
   * Método de conveniencia para sistemas
   */
  async sistemaTieneGobernanza(sistemaId: number): Promise<ApiResponse<boolean>> {
    const response = await this.getGobernanzasByEntidad(sistemaId);
    
    if (response.success && response.data) {
      const asociacionesActivas = response.data.filter(a => a.esActiva && !a.registroEliminado);
      return {
        ...response,
        data: asociacionesActivas.length > 0
      };
    }
    
    return {
      ...response,
      data: false
    };
  }
}

// Instancia singleton del servicio
export const gobernanzaEntidadService = new GobernanzaEntidadService();