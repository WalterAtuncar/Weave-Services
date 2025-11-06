/**
 * Servicio para gestión de Sub-Dominios de Data
 * Implementa operaciones CRUD específicas para sub-dominios
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  SubDominioData,
  CreateSubDominioDataDto,
  UpdateSubDominioDataDto,
  EstadoDominioData,
  CategoriaSubDominio,
  NivelSensibilidad
} from '../models/DominiosData';

// ===== TIPOS DE REQUEST =====

export interface GetSubDominiosDataRequest {
  dominioId: number;
  includeDeleted?: boolean;
}



export interface CreateSubDominioDataRequest {
  organizacionId: number;
  dominioDataId: number;
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio?: string;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number;
  estado?: number;
  creadoPor?: number;
}

export interface UpdateSubDominioDataRequest {
  subDominioDataId: number;
  dominioDataId: number;
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio?: string;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number;
  estado?: number;
  actualizadoPor?: number;
}

export interface DeleteSubDominioDataRequest {
  subDominioId: number;
  dominioDataId: number;
  motivo?: string;
  forceDelete?: boolean;
  eliminadoPor?: number;
}

// ===== TIPOS DE RESPONSE =====

export type GetSubDominiosDataResponseData = SubDominioData[];

export type CreateSubDominioDataResponseData = number; // ID del nuevo sub-dominio
export type UpdateSubDominioDataResponseData = boolean;
export type DeleteSubDominioDataResponseData = boolean;

/**
 * Servicio para gestión de Sub-Dominios de Data
 */
export class SubDominioDataService extends BaseApiService {
  protected baseEndpoint = '/SubDominioData';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== MÉTODOS CRUD =====

  /**
   * Obtiene todos los sub-dominios de un dominio específico
   */
  async getSubDominiosData(
    request: GetSubDominiosDataRequest
  ): Promise<ApiResponse<GetSubDominiosDataResponseData>> {
    try {
      const params = {
        dominioId: request.dominioId,
        includeDeleted: request.includeDeleted || false
      };

      const response = await this.get<GetSubDominiosDataResponseData>(
        `${this.baseEndpoint}/dominio/${request.dominioId}`,
        { params }
      );

      return response;
    } catch (error) {
      return this.createErrorResponse('Error al obtener sub-dominios', error);
    }
  }



  /**
   * Crea un nuevo sub-dominio
   */
  async createSubDominioData(
    request: CreateSubDominioDataRequest
  ): Promise<ApiResponse<CreateSubDominioDataResponseData>> {
    try {
      const createDto: CreateSubDominioDataDto = {
        organizacionId: request.organizacionId,
        dominioDataId: request.dominioDataId,
        codigoSubDominio: request.codigoSubDominio,
        nombreSubDominio: request.nombreSubDominio,
        descripcionSubDominio: request.descripcionSubDominio,
        tieneGobernanzaPropia: request.tieneGobernanzaPropia,
        gobernanzaId: request.gobernanzaId,
        estado: request.estado,
        creadoPor: request.creadoPor || 0
      };
      const response = await this.post<CreateSubDominioDataResponseData>(
        this.baseEndpoint,
        createDto
      );

      return response;
    } catch (error) {
      return this.createErrorResponse('Error al crear sub-dominio', error);
    }
  }

  /**
   * Actualiza un sub-dominio existente
   */
  async updateSubDominioData(
    request: UpdateSubDominioDataRequest
  ): Promise<ApiResponse<UpdateSubDominioDataResponseData>> {
    try {
      const updateDto: UpdateSubDominioDataDto = {
        subDominioDataId: request.subDominioDataId,
        dominioDataId: request.dominioDataId,
        codigoSubDominio: request.codigoSubDominio,
        nombreSubDominio: request.nombreSubDominio,
        descripcionSubDominio: request.descripcionSubDominio,
        tieneGobernanzaPropia: request.tieneGobernanzaPropia,
        gobernanzaId: request.gobernanzaId,
        estado: request.estado,
        actualizadoPor: request.actualizadoPor || 0
      };
      const response = await this.put<UpdateSubDominioDataResponseData>(
        `${this.baseEndpoint}/${request.subDominioDataId}`,
        updateDto
      );

      return response;
    } catch (error) {
      return this.createErrorResponse('Error al actualizar sub-dominio', error);
    }
  }

  /**
   * Elimina un sub-dominio
   */
  async deleteSubDominioData(
    request: DeleteSubDominioDataRequest
  ): Promise<ApiResponse<DeleteSubDominioDataResponseData>> {
    try {
      const params = {
        dominioDataId: request.dominioDataId,
        ...(request.motivo ? { motivo: request.motivo } : {}),
        ...(typeof request.forceDelete === 'boolean' ? { forceDelete: request.forceDelete } : {}),
        ...(request.eliminadoPor ? { eliminadoPor: request.eliminadoPor } : {})
      };

      const response = await this.delete<DeleteSubDominioDataResponseData>(
        `${this.baseEndpoint}/${request.subDominioId}`,
        { params }
      );

      return response;
    } catch (error) {
      return this.createErrorResponse('Error al eliminar sub-dominio', error);
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Valida los datos de un sub-dominio antes de crear/actualizar
   */
  private validateSubDominioData(data: CreateSubDominioDataDto | UpdateSubDominioDataDto): string[] {
    const errors: string[] = [];

    if (!data.nombreSubDominio?.trim()) {
      errors.push('El nombre del sub-dominio es requerido');
    }

    if (data.nombreSubDominio && data.nombreSubDominio.length > 200) {
      errors.push('El nombre del sub-dominio no puede exceder 200 caracteres');
    }

    if (data.codigoSubDominio && data.codigoSubDominio.length > 50) {
      errors.push('El código del sub-dominio no puede exceder 50 caracteres');
    }

    if (data.descripcionSubDominio && data.descripcionSubDominio.length > 1000) {
      errors.push('La descripción no puede exceder 1000 caracteres');
    }

    if (!data.categoria) {
      errors.push('La categoría es requerida');
    }

    if (!data.nivelSensibilidad) {
      errors.push('El nivel de sensibilidad es requerido');
    }

    return errors;
  }

  /**
   * Simula un delay para testing
   */
  private async simulateDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default SubDominioDataService;