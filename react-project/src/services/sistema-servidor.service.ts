import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';

export interface SistemaServidor {
  id: number;
  sistemaId: number;
  servidorId: number;
}

export type GetSistemaServidoresBySistemaResponseData = SistemaServidor[];

export class SistemaServidorService extends BaseApiService {
  protected baseEndpoint = '/SistemaServidor';

  /**
   * Obtiene todos los servidores asociados a un sistema
   * GET /api/SistemaServidor/sistema/{sistemaId}
   */
  async getServidoresBySistema(sistemaId: number): Promise<ApiResponse<GetSistemaServidoresBySistemaResponseData>> {
    try {
      const url = `${this.baseEndpoint}/sistema/${sistemaId}`;
      return await this.get<GetSistemaServidoresBySistemaResponseData>(url);
    } catch (error) {
      await this.handleServiceError(error, 'obtener servidores del sistema', false);
      throw error;
    }
  }
}

export const sistemaServidorService = new SistemaServidorService(); 