import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { ErrorHandler } from '../utils/errorHandler';
import {
  Carpeta,
  CarpetaArbolItem,
  CreateCarpetaCommand,
  UpdateCarpetaCommand,
  GetCarpetasRequest,
  GetArbolCarpetasRequest,
} from './types/documentos-carpetas.types';

class DocumentosCarpetasService extends BaseApiService {
  private readonly baseEndpoint = '/DocumentosCarpetas';

  constructor() {
    super();
  }

  async getCarpetas(params: GetCarpetasRequest = {}): Promise<ApiResponse<Carpeta[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.organizacionId !== undefined && params.organizacionId !== null) {
        queryParams.append('organizacionId', String(params.organizacionId));
      }
      if (params.includeDeleted !== undefined) {
        queryParams.append('includeDeleted', String(params.includeDeleted));
      }
      const url = queryParams.toString() ? `${this.baseEndpoint}?${queryParams.toString()}` : this.baseEndpoint;
      const response = await this.get<Carpeta[]>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener carpetas', false);
      throw error;
    }
  }

  async createCarpeta(command: CreateCarpetaCommand): Promise<ApiResponse<number>> {
    try {
      const response = await this.post<number>(this.baseEndpoint, command);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'crear carpeta');
      throw error;
    }
  }

  async updateCarpeta(id: number, command: UpdateCarpetaCommand): Promise<ApiResponse<boolean>> {
    try {
      command.carpetaId = id;
      const response = await this.put<boolean>(`${this.baseEndpoint}/${id}`, command);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'actualizar carpeta');
      throw error;
    }
  }

  async deleteCarpeta(id: number, hardDelete: boolean = false): Promise<ApiResponse<boolean>> {
    try {
      const url = `${this.baseEndpoint}/${id}?hardDelete=${hardDelete}`;
      const response = await this.delete<boolean>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'eliminar carpeta', false);
      throw error;
    }
  }

  async restoreCarpeta(id: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.post<boolean>(`${this.baseEndpoint}/${id}/restore`);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'restaurar carpeta');
      throw error;
    }
  }

  async moveCarpeta(id: number, nuevoPadreId: number | null): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.patch<boolean>(`${this.baseEndpoint}/${id}/move`, nuevoPadreId);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'mover carpeta');
      throw error;
    }
  }

  async getArbol(params: GetArbolCarpetasRequest): Promise<ApiResponse<CarpetaArbolItem[]>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('organizacionId', String(params.organizacionId));
      if (params.includeDeleted !== undefined) {
        queryParams.append('includeDeleted', String(params.includeDeleted));
      }
      const url = `${this.baseEndpoint}/arbol?${queryParams.toString()}`;
      const response = await this.get<CarpetaArbolItem[]>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener árbol de carpetas', false);
      throw error;
    }
  }
}

export const documentosCarpetasService = new DocumentosCarpetasService();
export { DocumentosCarpetasService };