/**
 * Servicio para gestión de Asignaciones GobernanzaRol
 * Maneja las asignaciones individuales de roles a gobernanzas
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { GobernanzaRol, GobernanzaByTipoEntidadResultDto } from './types/gobernanza.types';

export class GobernanzaRolService extends BaseApiService {
  private readonly baseUrl = '/GobernanzaRol';

  // ==========================================
  // MÉTODOS EXISTENTES
  // ==========================================

  async getGobernanzaRolesByGobernanzaId(
    gobernanzaId: number,
    includeDeleted: boolean = false,
    soloActivos: boolean = false
  ): Promise<ApiResponse<GobernanzaRol[]>> {
    try {
      const params = new URLSearchParams({
        includeDeleted: includeDeleted.toString(),
        soloActivos: soloActivos.toString()
      });

      const response = await this.get<GobernanzaRol[]>(
        `${this.baseUrl}/gobernanza/${gobernanzaId}?${params}`
      );
      return response;
    } catch (error) {
      throw new Error(`Error al obtener roles de gobernanza por gobernanza ID: ${error}`);
    }
  }

  async createGobernanzaRol(data: any): Promise<ApiResponse<GobernanzaRol>> {
    try {
      const response = await this.post<GobernanzaRol>(this.baseUrl, data);
      return response;
    } catch (error) {
      throw new Error(`Error al crear rol de gobernanza: ${error}`);
    }
  }

  async updateGobernanzaRol(id: number, data: any): Promise<ApiResponse<GobernanzaRol>> {
    try {
      const response = await this.put<GobernanzaRol>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      throw new Error(`Error al actualizar rol de gobernanza: ${error}`);
    }
  }

  async deleteGobernanzaRol(id: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.delete<boolean>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      throw new Error(`Error al eliminar rol de gobernanza: ${error}`);
    }
  }

  // ==========================================
  // NUEVO MÉTODO PARA GOBERNANZA POR TIPO DE ENTIDAD
  // ==========================================

  /**
   * Obtiene la información completa de gobernanza para un tipo de entidad específico
   * Incluye roles, usuarios asignados con nombres completos y posiciones
   * @param tipoEntidadId ID del tipo de entidad (ej: 1 = Sistemas)
   * @returns Información completa de gobernanza SOE
   */
  async getGobernanzaByTipoEntidad(tipoEntidadId: number): Promise<ApiResponse<GobernanzaByTipoEntidadResultDto>> {
    try {
      const response = await this.get<GobernanzaByTipoEntidadResultDto>(`${this.baseUrl}/entidad/${tipoEntidadId}`);
      return response;
    } catch (error) {
      throw new Error(`Error al obtener información de gobernanza por tipo de entidad: ${error}`);
    }
  }

  /**
   * ✅ NUEVO: Agregar ejecutor a la gobernanza
   */
  async agregarEjecutor(gobernanzaId: number, rolGobernanzaId: number, usuarioId: number, fechaAsignacion: string): Promise<ApiResponse<number>> {
    try {
      const data = {
        gobernanzaId,
        rolGobernanzaId,
        usuarioId,
        fechaAsignacion,
        estado: 1,
        creadoPor: 1 // TODO: Obtener del contexto de usuario
      };

      const response = await this.post<number>(this.baseUrl, data);
      return response;
    } catch (error) {
      throw new Error(`Error al agregar ejecutor: ${error}`);
    }
  }

  /**
   * ✅ NUEVO: Actualizar fecha de asignación de un usuario
   */
  async actualizarFechaAsignacion(gobernanzaRolId: number, fechaAsignacion: string): Promise<ApiResponse<boolean>> {
    try {
      const data = {
        fechaAsignacion,
        actualizadoPor: 1 // TODO: Obtener del contexto de usuario
      };

      const response = await this.put<boolean>(`${this.baseUrl}/${gobernanzaRolId}`, data);
      return response;
    } catch (error) {
      throw new Error(`Error al actualizar fecha de asignación: ${error}`);
    }
  }

  /**
   * ✅ NUEVO: Actualizar asignación completa de un usuario (rol, usuario, fecha)
   */
  async actualizarAsignacionCompleta(
    gobernanzaRolId: number, 
    rolGobernanzaId: number, 
    usuarioId: number, 
    fechaAsignacion: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const data = {
        gobernanzaRolId, // ✅ INCLUIR EL ID EN EL BODY PARA QUE PASE LA VALIDACIÓN
        rolGobernanzaId,
        usuarioId,
        fechaAsignacion,
        actualizadoPor: 1 // TODO: Obtener del contexto de usuario
      };

      const response = await this.put<boolean>(`${this.baseUrl}/${gobernanzaRolId}`, data);
      return response;
    } catch (error) {
      throw new Error(`Error al actualizar asignación completa: ${error}`);
    }
  }

  /**
   * ✅ NUEVO: Remover usuario de un rol de gobernanza
   */
  async removerUsuario(gobernanzaRolId: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.delete<boolean>(`${this.baseUrl}/${gobernanzaRolId}`);
      return response;
    } catch (error) {
      throw new Error(`Error al remover usuario: ${error}`);
    }
  }
}

export const gobernanzaRolService = new GobernanzaRolService(); 