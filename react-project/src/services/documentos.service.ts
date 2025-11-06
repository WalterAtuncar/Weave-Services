/**
 * Servicio para gestión básica de Documentos
 * Implementa los endpoints definidos en DocumentosController (CRUD básico)
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { Documento } from '../models/Documento';

// Tipos para el servicio básico de documentos
export interface UpdateDocumentoRequest {
  id: number;
  payload: UpdateDocumentoPayload;
}

export interface UpdateDocumentoPayload {
  tipoDocumentoId?: number;
  nombreDocumento?: string;
  nombreArchivoOriginal?: string;
  rutaArchivo?: string;
  carpetaId?: number;
  tamanoArchivo?: number;
  descripcion?: string;
  estado?: number;
  gobernanzaId?: number;
}

export interface GetDocumentoByIdRequest {
  id: number;
}

export interface DeleteDocumentoRequest {
  documentoId: number;
  organizacionId: number;
  nombreDocumento?: string;
  descripcion?: string;
  carpetaId?: number;
  estado: number;
  esEliminacion: boolean;
  registroEliminadoSolicitado: boolean;
  gobernanzaId?: number | null;
}

export class DocumentosService extends BaseApiService {
  protected baseEndpoint = '/Documentos';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true,
    });
  }

  // ===== CRUD BÁSICO =====

  /**
   * Actualizar un documento existente
   */
  async actualizarDocumento(request: UpdateDocumentoRequest): Promise<ApiResponse<boolean>> {
    return await this.put<boolean>(`${this.baseEndpoint}/${request.id}`, request.payload);
  }

  /**
   * Obtener un documento por su ID
   */
  async obtenerDocumentoPorId(request: GetDocumentoByIdRequest): Promise<ApiResponse<Documento>> {
    return await this.get<Documento>(`${this.baseEndpoint}/${request.id}`);
  }

  /**
   * Eliminar un documento por su ID
   */
  async eliminarDocumento(request: DeleteDocumentoRequest): Promise<ApiResponse<boolean>> {
    // Usar PUT para eliminación lógica a través del UpdateDocumentoCommand
    const updateRequest = {
      documentoId: request.documentoId,
      organizacionId: request.organizacionId,
      nombreDocumento: request.nombreDocumento,
      descripcion: request.descripcion,
      carpetaId: request.carpetaId,
      estado: -3, // IniciarFlujo para workflow de eliminación
      esEliminacion: true,
      registroEliminadoSolicitado: true,
      // Enviar GobernanzaId para iniciar workflow y sincronizar relación
      gobernanzaId: request.gobernanzaId ?? undefined
    };

    return await this.put<boolean>(`${this.baseEndpoint}/${request.documentoId}`, updateRequest);
  }
}

export const documentosService = new DocumentosService();