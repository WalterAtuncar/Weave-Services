// ============================================================================
// Servicio de PlanesSuscripcion - API de Gestión de Planes de Suscripción
// ============================================================================

import { BaseApiService } from './api.service';
import { environment } from '../environments';
import {
  PlanSuscripcion,
  PlanSuscripcionDto,
  GetPlanesSuscripcionRequest,
  GetPlanesSuscripcionResponse,
  GetPlanesSuscripcionDtoResponse,
  GetPlanSuscripcionRequest,
  GetPlanSuscripcionResponse,
  GetPlanCompletoRequest,
  GetPlanesActivosRequest,
  GetPlanesGratuitosRequest,
  GetPlanesPopularesRequest,
  GetPlanesPorTipoRequest,
  PlanesSuscripcionPaginatedRequest,
  PlanesSuscripcionPaginatedResponse,
  CreatePlanSuscripcionCommand,
  CreatePlanSuscripcionResponse,
  UpdatePlanSuscripcionCommand,
  UpdatePlanSuscripcionResponse,
  DeletePlanSuscripcionRequest,
  DeletePlanSuscripcionResponse,
  ActivarPlanResponse,
  DesactivarPlanResponse
} from './types/planes-suscripcion.types';

/**
 * Servicio para la gestión de Planes de Suscripción
 */
export class PlanesSuscripcionService extends BaseApiService {
  private readonly baseUrl = '/PlanesSuscripcion';

  constructor() {
    super();
  }

  /**
   * Obtiene todos los planes de suscripción
   * @param request - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getPlanesSuscripcion(request: GetPlanesSuscripcionRequest = {}): Promise<GetPlanesSuscripcionResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (request.includeDeleted !== undefined) {
        queryParams.append('includeDeleted', request.includeDeleted.toString());
      }
      
      if (request.onlyActive !== undefined) {
        queryParams.append('onlyActive', request.onlyActive.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await this.get<PlanSuscripcion[]>(url);
      
      return {
        success: response.success,
        message: response.message || 'Planes obtenidos exitosamente',
        data: response.data || [],
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Obtiene un plan de suscripción por ID
   * @param request - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getPlanSuscripcion(request: GetPlanSuscripcionRequest): Promise<GetPlanSuscripcionResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (request.includeDeleted !== undefined) {
        queryParams.append('includeDeleted', request.includeDeleted.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}/${request.planId}?${queryParams.toString()}`
        : `${this.baseUrl}/${request.planId}`;

      const response = await this.get<PlanSuscripcionDto>(url);
      
      return {
        success: response.success,
        message: response.message || 'Plan obtenido exitosamente',
        data: response.data || null,
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Obtiene información completa de un plan de suscripción
   * @param request - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getPlanCompleto(request: GetPlanCompletoRequest): Promise<GetPlanSuscripcionResponse> {
    try {
      const response = await this.get<PlanSuscripcionDto>(`${this.baseUrl}/${request.planId}/completo`);
      
      return {
        success: response.success,
        message: response.message || 'Plan completo obtenido exitosamente',
        data: response.data || null,
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Obtiene solo los planes activos
   * @param request - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getPlanesActivos(request: GetPlanesActivosRequest = {}): Promise<GetPlanesSuscripcionResponse> {
    try {
      const response = await this.get<PlanSuscripcion[]>(`${this.baseUrl}/activos`);
      
      return {
        success: response.success,
        message: response.message || 'Planes activos obtenidos exitosamente',
        data: response.data || [],
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Obtiene planes gratuitos
   * @param request - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getPlanesGratuitos(request: GetPlanesGratuitosRequest = {}): Promise<GetPlanesSuscripcionDtoResponse> {
    try {
      const response = await this.get<PlanSuscripcionDto[]>(`${this.baseUrl}/gratuitos`);
      
      return {
        success: response.success,
        message: response.message || 'Planes gratuitos obtenidos exitosamente',
        data: response.data || [],
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Obtiene planes populares (con más suscripciones activas)
   * @param request - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getPlanesPopulares(request: GetPlanesPopularesRequest = {}): Promise<GetPlanesSuscripcionDtoResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (request.top !== undefined) {
        queryParams.append('top', request.top.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}/populares?${queryParams.toString()}`
        : `${this.baseUrl}/populares`;

      const response = await this.get<PlanSuscripcionDto[]>(url);
      
      return {
        success: response.success,
        message: response.message || 'Planes populares obtenidos exitosamente',
        data: response.data || [],
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Obtiene planes por tipo
   * @param request - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getPlanesPorTipo(request: GetPlanesPorTipoRequest): Promise<GetPlanesSuscripcionDtoResponse> {
    try {
      const response = await this.get<PlanSuscripcionDto[]>(`${this.baseUrl}/tipo/${request.tipoPlan}`);
      
      return {
        success: response.success,
        message: response.message || 'Planes por tipo obtenidos exitosamente',
        data: response.data || [],
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Obtiene planes de suscripción con paginación y filtros avanzados
   * @param request - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getPlanesPaginated(request: PlanesSuscripcionPaginatedRequest = {}): Promise<PlanesSuscripcionPaginatedResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Parámetros de paginación
      if (request.Page !== undefined) {
        queryParams.append('Page', request.Page.toString());
      }
      if (request.PageSize !== undefined) {
        queryParams.append('PageSize', request.PageSize.toString());
      }
      if (request.OrderBy !== undefined) {
        queryParams.append('OrderBy', request.OrderBy);
      }
      if (request.OrderDescending !== undefined) {
        queryParams.append('OrderDescending', request.OrderDescending.toString());
      }
      if (request.IncludeDeleted !== undefined) {
        queryParams.append('IncludeDeleted', request.IncludeDeleted.toString());
      }
      
      // Filtros específicos
      if (request.OnlyActive !== undefined) {
        queryParams.append('OnlyActive', request.OnlyActive.toString());
      }
      if (request.Estado !== undefined) {
        queryParams.append('Estado', request.Estado.toString());
      }
      if (request.PlanId !== undefined) {
        queryParams.append('PlanId', request.PlanId.toString());
      }
      if (request.NombrePlan !== undefined) {
        queryParams.append('NombrePlan', request.NombrePlan);
      }
      if (request.TipoPlan !== undefined) {
        queryParams.append('TipoPlan', request.TipoPlan);
      }
      if (request.Activo !== undefined) {
        queryParams.append('Activo', request.Activo.toString());
      }
      if (request.PrecioMinimo !== undefined) {
        queryParams.append('PrecioMinimo', request.PrecioMinimo.toString());
      }
      if (request.PrecioMaximo !== undefined) {
        queryParams.append('PrecioMaximo', request.PrecioMaximo.toString());
      }
      if (request.EsPlanGratuito !== undefined) {
        queryParams.append('EsPlanGratuito', request.EsPlanGratuito.toString());
      }
      if (request.LimiteUsuariosMinimo !== undefined) {
        queryParams.append('LimiteUsuariosMinimo', request.LimiteUsuariosMinimo.toString());
      }
      if (request.LimiteUsuariosMaximo !== undefined) {
        queryParams.append('LimiteUsuariosMaximo', request.LimiteUsuariosMaximo.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}/paginated?${queryParams.toString()}`
        : `${this.baseUrl}/paginated`;

      const response = await this.get<any>(url);
      
      return {
        success: response.success,
        message: response.message || 'Planes paginados obtenidos exitosamente',
        data: response.data || null,
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Crea un nuevo plan de suscripción
   * @param command - Datos del nuevo plan
   * @returns Promise con la respuesta del API
   */
  async createPlanSuscripcion(command: CreatePlanSuscripcionCommand): Promise<CreatePlanSuscripcionResponse> {
    try {

      
      const response = await this.post<boolean>(this.baseUrl, command);
      

      
      return {
        success: response.success,
        message: response.message || 'Plan creado exitosamente',
        data: response.data || false,
        errors: response.errors || []
      };
    } catch (error) {
      console.error('❌ Error al crear el plan:', error);
      
      // Extraer el mensaje de error específico del backend
      let errorMessage = 'Error al crear el plan';
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
   * Actualiza un plan de suscripción existente
   * @param planId - ID del plan a actualizar
   * @param command - Datos actualizados del plan
   * @returns Promise con la respuesta del API
   */
  async updatePlanSuscripcion(planId: number, command: UpdatePlanSuscripcionCommand): Promise<UpdatePlanSuscripcionResponse> {
    try {

      
      const response = await this.put<boolean>(`${this.baseUrl}/${planId}`, command);
      

      
      return {
        success: response.success,
        message: response.message || 'Plan actualizado exitosamente',
        data: response.data || false,
        errors: response.errors || []
      };
    } catch (error) {

      
      // Extraer el mensaje de error específico del backend
      let errorMessage = 'Error al actualizar el plan';
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
   * Elimina un plan de suscripción
   * @param request - Parámetros de eliminación
   * @returns Promise con la respuesta del API
   */
  async deletePlanSuscripcion(request: DeletePlanSuscripcionRequest): Promise<DeletePlanSuscripcionResponse> {
    try {

      
      const queryParams = new URLSearchParams();
      
      if (request.forceDelete !== undefined) {
        queryParams.append('forceDelete', request.forceDelete.toString());
      }
      
      if (request.desactivarEnLugarDeEliminar !== undefined) {
        queryParams.append('desactivarEnLugarDeEliminar', request.desactivarEnLugarDeEliminar.toString());
      }
      
      if (request.migrarSuscripcionesExistentes !== undefined) {
        queryParams.append('migrarSuscripcionesExistentes', request.migrarSuscripcionesExistentes.toString());
      }
      
      if (request.planIdDestino !== undefined) {
        queryParams.append('planIdDestino', request.planIdDestino.toString());
      }
      
      if (request.motivo !== undefined) {
        queryParams.append('motivo', request.motivo);
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}/${request.planId}?${queryParams.toString()}`
        : `${this.baseUrl}/${request.planId}`;

      const response = await this.delete<boolean>(url);
      

      
      return {
        success: response.success,
        message: response.message || 'Plan eliminado exitosamente',
        data: response.data || false,
        errors: response.errors || []
      };
    } catch (error) {

      
      // Extraer el mensaje de error específico del backend
      let errorMessage = 'Error al eliminar el plan';
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
   * Activa un plan de suscripción
   * @param planId - ID del plan a activar
   * @returns Promise con la respuesta del API
   */
  async activarPlan(planId: number): Promise<ActivarPlanResponse> {
    try {

      
      const response = await this.patch<boolean>(`${this.baseUrl}/${planId}/activar`, {});
      

      
      return {
        success: response.success,
        message: response.message || 'Plan activado exitosamente',
        data: response.data || false,
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }

  /**
   * Desactiva un plan de suscripción
   * @param planId - ID del plan a desactivar
   * @returns Promise con la respuesta del API
   */
  async desactivarPlan(planId: number): Promise<DesactivarPlanResponse> {
    try {

      
      const response = await this.patch<boolean>(`${this.baseUrl}/${planId}/desactivar`, {});
      

      
      return {
        success: response.success,
        message: response.message || 'Plan desactivado exitosamente',
        data: response.data || false,
        errors: response.errors || []
      };
    } catch (error) {

      
      throw error;
    }
  }
}

// Exportar instancia singleton
export const planesSuscripcionService = new PlanesSuscripcionService();