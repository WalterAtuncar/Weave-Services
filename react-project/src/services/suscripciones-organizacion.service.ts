// ============================================================================
// SUSCRIPCIONES ORGANIZACIÓN - SERVICE
// ============================================================================
// Servicio para gestionar suscripciones de organizaciones
// Basado en el swagger-api.json actualizado

import { BaseApiService } from './api.service';
import {
  // Interfaces principales
  SuscripcionOrganizacion,
  SuscripcionOrganizacionDto,
  PagedResult,
  
  // Comandos
  CreateSuscripcionOrganizacionCommand,
  UpdateSuscripcionOrganizacionCommand,
  
  // Requests
  GetSuscripcionOrganizacionRequest,
  GetSuscripcionesOrganizacionRequest,
  GetSuscripcionesPaginatedRequest,
  GetSuscripcionesPorOrganizacionRequest,
  GetSuscripcionActivaRequest,
  GetHistorialSuscripcionesRequest,
  GetSuscripcionesPorPlanRequest,
  GetSuscripcionesVigentesRequest,
  GetSuscripcionesPorVencerRequest,
  ExtenderSuscripcionRequest,
  RenovarSuscripcionRequest,
  EliminarSuscripcionRequest,
  
  // Responses
  GetSuscripcionOrganizacionResponse,
  GetSuscripcionOrganizacionDtoResponse,
  GetSuscripcionesOrganizacionResponse,
  GetSuscripcionesOrganizacionDtoResponse,
  CreateSuscripcionOrganizacionResponse,
  UpdateSuscripcionOrganizacionResponse,
  DeleteSuscripcionOrganizacionResponse,
  ExtenderSuscripcionResponse,
  RenovarSuscripcionResponse,
  SuscripcionesOrganizacionPaginatedResponse
} from './types/suscripciones-organizacion.types';

export class SuscripcionesOrganizacionService extends BaseApiService {
  private readonly baseUrl = '/SuscripcionesOrganizacion';

  constructor() {
    super();
  }

  // ============================================================================
  // MÉTODOS PRINCIPALES CRUD
  // ============================================================================

  /**
   * Obtiene todas las suscripciones de organizaciones
   */
  async getSuscripcionesOrganizacion(request: GetSuscripcionesOrganizacionRequest = {}): Promise<GetSuscripcionesOrganizacionResponse> {
    try {
      const params = new URLSearchParams();
      if (request.includeDeleted !== undefined) params.append('includeDeleted', request.includeDeleted.toString());
      if (request.onlyActive !== undefined) params.append('onlyActive', request.onlyActive.toString());
      if (request.onlyDemo !== undefined) params.append('onlyDemo', request.onlyDemo.toString());
      if (request.onlyCommercial !== undefined) params.append('onlyCommercial', request.onlyCommercial.toString());
      if (request.organizacionId !== undefined) params.append('organizacionId', request.organizacionId.toString());
      if (request.planId !== undefined) params.append('planId', request.planId.toString());

      const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await this.get<SuscripcionOrganizacion[]>(url);

      return {
        success: response.success,
        message: response.message,
        data: response.data || [],
        errors: response.errors
      };
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripciones',
        data: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene una suscripción por ID
   */
  async getSuscripcionOrganizacionById(request: GetSuscripcionOrganizacionRequest): Promise<GetSuscripcionOrganizacionResponse> {
    try {
      const params = new URLSearchParams();
      if (request.includeDeleted !== undefined) params.append('includeDeleted', request.includeDeleted.toString());

      const url = `${this.baseUrl}/${request.suscripcionId}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await this.get<SuscripcionOrganizacion>(url);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripción',
        data: null,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene una suscripción con información completa
   */
  async getSuscripcionCompleta(suscripcionId: number): Promise<GetSuscripcionOrganizacionDtoResponse> {
    try {
      const url = `${this.baseUrl}/${suscripcionId}/completa`;

      const response = await this.get<SuscripcionOrganizacionDto>(url);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripción completa',
        data: null,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Crea una nueva suscripción
   */
  async createSuscripcionOrganizacion(command: CreateSuscripcionOrganizacionCommand): Promise<CreateSuscripcionOrganizacionResponse> {
    try {
      const response = await this.post<number>(this.baseUrl, command);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      
      // Extraer el mensaje de error específico del backend
      let errorMessage = 'Error al crear suscripción';
      let errorDetails: string[] = [];
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data) {
          // Si hay mensaje específico del backend
          if (axiosError.response.data.message) {
            errorMessage = axiosError.response.data.message;
          }
          // Si hay errores específicos
          if (axiosError.response.data.errors && Array.isArray(axiosError.response.data.errors)) {
            errorDetails = axiosError.response.data.errors;
          }
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        data: null,
        errors: errorDetails.length > 0 ? errorDetails : [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Actualiza una suscripción existente
   */
  async updateSuscripcionOrganizacion(suscripcionId: number, command: UpdateSuscripcionOrganizacionCommand): Promise<UpdateSuscripcionOrganizacionResponse> {
    try {
      const response = await this.put<boolean>(`${this.baseUrl}/${suscripcionId}`, command);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      
      // Extraer el mensaje de error específico del backend
      let errorMessage = 'Error al actualizar suscripción';
      let errorDetails: string[] = [];
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data) {
          // Si hay mensaje específico del backend
          if (axiosError.response.data.message) {
            errorMessage = axiosError.response.data.message;
          }
          // Si hay errores específicos
          if (axiosError.response.data.errors && Array.isArray(axiosError.response.data.errors)) {
            errorDetails = axiosError.response.data.errors;
          }
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        data: false,
        errors: errorDetails.length > 0 ? errorDetails : [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Elimina una suscripción
   */
  async deleteSuscripcionOrganizacion(request: EliminarSuscripcionRequest): Promise<DeleteSuscripcionOrganizacionResponse> {
    try {
      const params = new URLSearchParams();
      if (request.forceDelete !== undefined) params.append('forceDelete', request.forceDelete.toString());
      if (request.motivoEliminacion) params.append('motivoEliminacion', request.motivoEliminacion);

      const url = `${this.baseUrl}/${request.id}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await this.delete<boolean>(url);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      
      // Extraer el mensaje de error específico del backend
      let errorMessage = 'Error al eliminar suscripción';
      let errorDetails: string[] = [];
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data) {
          // Si hay mensaje específico del backend
          if (axiosError.response.data.message) {
            errorMessage = axiosError.response.data.message;
          }
          // Si hay errores específicos
          if (axiosError.response.data.errors && Array.isArray(axiosError.response.data.errors)) {
            errorDetails = axiosError.response.data.errors;
          }
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        data: false,
        errors: errorDetails.length > 0 ? errorDetails : [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  // ============================================================================
  // MÉTODOS ESPECIALIZADOS
  // ============================================================================

  /**
   * Obtiene suscripciones comerciales
   */
  async getSuscripcionesComerciales(): Promise<GetSuscripcionesOrganizacionResponse> {
    try {
      const url = `${this.baseUrl}/comerciales`;

      const response = await this.get<SuscripcionOrganizacion[]>(url);

      return {
        success: response.success,
        message: response.message,
        data: response.data || [],
        errors: response.errors
      };
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripciones comerciales',
        data: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene suscripciones demo
   */
  async getSuscripcionesDemo(): Promise<GetSuscripcionesOrganizacionResponse> {
    try {
      const url = `${this.baseUrl}/demo`;

      const response = await this.get<SuscripcionOrganizacion[]>(url);

      return {
        success: response.success,
        message: response.message,
        data: response.data || [],
        errors: response.errors
      };
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripciones demo',
        data: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene suscripciones por organización
   */
  async getSuscripcionesPorOrganizacion(request: GetSuscripcionesPorOrganizacionRequest): Promise<GetSuscripcionesOrganizacionResponse> {
    try {
      const params = new URLSearchParams();
      if (request.includeDeleted !== undefined) params.append('includeDeleted', request.includeDeleted.toString());

      const url = `${this.baseUrl}/organizacion/${request.organizacionId}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await this.get<SuscripcionOrganizacion[]>(url);

      return {
        success: response.success,
        message: response.message,
        data: response.data || [],
        errors: response.errors
      };
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripciones por organización',
        data: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene la suscripción activa de una organización (sin eliminadas lógicamente)
   */
  async getSuscripcionActiva(request: GetSuscripcionActivaRequest): Promise<GetSuscripcionOrganizacionDtoResponse> {
    try {
      const url = `${this.baseUrl}/organizacion/${request.organizacionId}/activa`;

      const response = await this.get<SuscripcionOrganizacionDto>(url);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripción activa',
        data: null,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene el historial completo de suscripciones de una organización
   */
  async getHistorialSuscripciones(request: GetHistorialSuscripcionesRequest): Promise<GetSuscripcionesOrganizacionDtoResponse> {
    try {
      const url = `${this.baseUrl}/organizacion/${request.organizacionId}/historial`;

      const response = await this.get<SuscripcionOrganizacionDto[]>(url);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener historial de suscripciones',
        data: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene suscripciones por plan
   */
  async getSuscripcionesPorPlan(request: GetSuscripcionesPorPlanRequest): Promise<GetSuscripcionesOrganizacionResponse> {
    try {
      const params = new URLSearchParams();
      if (request.includeDeleted !== undefined) params.append('includeDeleted', request.includeDeleted.toString());

      const url = `${this.baseUrl}/plan/${request.planId}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await this.get<SuscripcionOrganizacion[]>(url);

      return {
        success: response.success,
        message: response.message,
        data: response.data || [],
        errors: response.errors
      };
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripciones por plan',
        data: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene suscripciones vigentes
   */
  async getSuscripcionesVigentes(request: GetSuscripcionesVigentesRequest = {}): Promise<GetSuscripcionesOrganizacionResponse> {
    try {
      const url = `${this.baseUrl}/vigentes`;

      const response = await this.get<SuscripcionOrganizacion[]>(url);

      return {
        success: response.success,
        message: response.message,
        data: response.data || [],
        errors: response.errors
      };
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripciones vigentes',
        data: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene suscripciones próximas a vencer
   */
  async getSuscripcionesPorVencer(request: GetSuscripcionesPorVencerRequest = {}): Promise<SuscripcionesOrganizacionPaginatedResponse> {
    try {
      const params = new URLSearchParams();
      if (request.diasAnticipacion !== undefined) params.append('diasAnticipacion', request.diasAnticipacion.toString());

      const url = `${this.baseUrl}/por-vencer${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await this.get<PagedResult<SuscripcionOrganizacionDto>>(url);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripciones por vencer',
        data: null,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene suscripciones de forma paginada
   */
  async getSuscripcionesPaginated(request: GetSuscripcionesPaginatedRequest = {}): Promise<SuscripcionesOrganizacionPaginatedResponse> {
    try {
      const params = new URLSearchParams();
      
      // Agregar todos los parámetros de paginación y filtro
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `${this.baseUrl}/paginated?${params.toString()}`;

      const response = await this.get<PagedResult<SuscripcionOrganizacionDto>>(url);

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al obtener suscripciones paginadas',
        data: null,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Extiende una suscripción existente
   */
  async extenderSuscripcion(request: ExtenderSuscripcionRequest): Promise<ExtenderSuscripcionResponse> {
    try {
      const params = new URLSearchParams();
      if (request.diasExtension !== undefined) params.append('diasExtension', request.diasExtension.toString());
      if (request.motivoOperacion !== undefined) params.append('motivoOperacion', request.motivoOperacion);

      const url = `${this.baseUrl}/${request.id}/extender${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await this.patch<boolean>(url, {});

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al extender suscripción',
        data: false,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Renueva una suscripción existente
   */
  async renovarSuscripcion(request: RenovarSuscripcionRequest): Promise<RenovarSuscripcionResponse> {
    try {
      const params = new URLSearchParams();
      if (request.nuevoPlanId !== undefined) params.append('nuevoPlanId', request.nuevoPlanId.toString());
      if (request.motivoOperacion !== undefined) params.append('motivoOperacion', request.motivoOperacion);

      const url = `${this.baseUrl}/${request.id}/renovar${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await this.patch<boolean>(url, {});

      return response;
    } catch (error) {
      console.error('❌ [SUSCRIPCIONES-ORG] Error:', error);
      return {
        success: false,
        message: 'Error al renovar suscripción',
        data: false,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

export const suscripcionesOrganizacionService = new SuscripcionesOrganizacionService(); 