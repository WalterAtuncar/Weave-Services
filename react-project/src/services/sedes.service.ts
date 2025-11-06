import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { 
  Sede,
  SedeDto,
  CreateSedeCommand,
  UpdateSedeCommand,
  GetSedesRequest,
  GetSedeRequest,
  GetSedeCompletaRequest,
  GetSedesPorOrganizacionRequest,
  GetSedesPaginatedRequest,
  SearchSedesRequest,
  GetSedesPorUbicacionRequest,
  DeleteSedeRequest,
  GetSedesResponse,
  GetSedeResponse,
  GetSedeCompletaResponse,
  CreateSedeResponse,
  UpdateSedeResponse,
  DeleteSedeResponse,
  GetSedesPaginatedResponse,
  PagedResult
} from './types/sedes.types';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * Servicio para la gestión de Sedes
 */
class SedesService extends BaseApiService {
  private readonly baseUrl = '/Sedes';

  constructor() {
    super();
  }

  /**
   * Obtiene todas las sedes con filtros opcionales
   * @param params - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getSedes(params: GetSedesRequest = {}): Promise<ApiResponse<Sede[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.organizacionId !== undefined) {
        queryParams.append('organizacionId', params.organizacionId.toString());
      }
      
      if (params.ubigeo !== undefined) {
        queryParams.append('ubigeo', params.ubigeo);
      }
      
      if (params.searchTerm !== undefined) {
        queryParams.append('searchTerm', params.searchTerm);
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await this.get<Sede[]>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener sedes', false);
      throw error;
    }
  }

  /**
   * Obtiene una sede por ID
   * @param params - Parámetros de la consulta
   * @returns Promise con la sede encontrada
   */
  async getSedeById(params: GetSedeRequest): Promise<ApiResponse<Sede>> {
    try {
      const response = await this.get<Sede>(`${this.baseUrl}/${params.id}`);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `obtener sede con ID ${params.id}`, false);
      throw error;
    }
  }

  /**
   * Obtiene una sede completa con información adicional
   * @param params - Parámetros de la consulta
   * @returns Promise con la sede completa
   */
  async getSedeCompleta(params: GetSedeCompletaRequest): Promise<ApiResponse<SedeDto>> {
    try {
      const response = await this.get<SedeDto>(`${this.baseUrl}/${params.id}/completa`);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `obtener sede completa con ID ${params.id}`, false);
      throw error;
    }
  }

  /**
   * Obtiene sedes por organización
   * @param params - Parámetros de la consulta
   * @returns Promise con las sedes de la organización
   */
  async getSedesPorOrganizacion(params: GetSedesPorOrganizacionRequest): Promise<ApiResponse<Sede[]>> {
    try {
      const response = await this.get<Sede[]>(`${this.baseUrl}/organizacion/${params.organizacionId}`);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `obtener sedes de la organización ${params.organizacionId}`, false);
      throw error;
    }
  }

  /**
   * Obtiene sedes de forma paginada con filtros avanzados
   * @param params - Parámetros de la consulta paginada
   * @returns Promise con el resultado paginado
   */
  async getSedesPaginated(params: GetSedesPaginatedRequest = {}): Promise<ApiResponse<PagedResult<SedeDto>>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.PageNumber !== undefined) {
        queryParams.append('PageNumber', params.PageNumber.toString());
      }
      
      if (params.PageSize !== undefined) {
        queryParams.append('PageSize', params.PageSize.toString());
      }
      
      if (params.SearchTerm !== undefined) {
        queryParams.append('SearchTerm', params.SearchTerm);
      }
      
      if (params.OrganizacionId !== undefined) {
        queryParams.append('OrganizacionId', params.OrganizacionId.toString());
      }
      
      if (params.Ubigeo !== undefined) {
        queryParams.append('Ubigeo', params.Ubigeo);
      }
      
      if (params.Nombre !== undefined) {
        queryParams.append('Nombre', params.Nombre);
      }
      
      if (params.Descripcion !== undefined) {
        queryParams.append('Descripcion', params.Descripcion);
      }
      
      if (params.NombreDepartamento !== undefined) {
        queryParams.append('NombreDepartamento', params.NombreDepartamento);
      }
      
      if (params.NombreProvincia !== undefined) {
        queryParams.append('NombreProvincia', params.NombreProvincia);
      }
      
      if (params.NombreDistrito !== undefined) {
        queryParams.append('NombreDistrito', params.NombreDistrito);
      }
      
      if (params.TieneUnidadesOrg !== undefined) {
        queryParams.append('TieneUnidadesOrg', params.TieneUnidadesOrg.toString());
      }
      
      if (params.TienePosiciones !== undefined) {
        queryParams.append('TienePosiciones', params.TienePosiciones.toString());
      }
      
      if (params.TienePersonas !== undefined) {
        queryParams.append('TienePersonas', params.TienePersonas.toString());
      }
      
      if (params.OrderBy !== undefined) {
        queryParams.append('OrderBy', params.OrderBy);
      }
      
      if (params.OrderDescending !== undefined) {
        queryParams.append('OrderDescending', params.OrderDescending.toString());
      }

      const url = `${this.baseUrl}/paginated?${queryParams.toString()}`;
      
      const response = await this.get<PagedResult<SedeDto>>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener sedes paginadas', false);
      throw error;
    }
  }

  /**
   * Busca sedes por término de búsqueda
   * @param params - Parámetros de búsqueda
   * @returns Promise con las sedes encontradas
   */
  async searchSedes(params: SearchSedesRequest): Promise<ApiResponse<Sede[]>> {
    try {
      const response = await this.get<Sede[]>(`${this.baseUrl}/search/${encodeURIComponent(params.searchTerm)}`);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `buscar sedes con término "${params.searchTerm}"`, false);
      throw error;
    }
  }

  /**
   * Obtiene sedes por ubicación (ubigeo)
   * @param params - Parámetros de búsqueda por ubicación
   * @returns Promise con las sedes de la ubicación
   */
  async getSedesPorUbicacion(params: GetSedesPorUbicacionRequest): Promise<ApiResponse<Sede[]>> {
    try {
      const response = await this.get<Sede[]>(`${this.baseUrl}/ubicacion/${encodeURIComponent(params.ubigeo)}`);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `obtener sedes por ubicación "${params.ubigeo}"`, false);
      throw error;
    }
  }

  /**
   * Crea una nueva sede
   * @param command - Datos de la sede a crear
   * @returns Promise con el ID de la sede creada
   */
  async createSede(command: CreateSedeCommand): Promise<ApiResponse<number>> {
    try {
      const response = await this.post<number>(this.baseUrl, command);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'crear nueva sede', true);
      throw error;
    }
  }

  /**
   * Actualiza una sede existente
   * @param id - ID de la sede a actualizar
   * @param command - Datos actualizados de la sede
   * @returns Promise con resultado de la actualización
   */
  async updateSede(id: number, command: UpdateSedeCommand): Promise<ApiResponse<boolean>> {
    try {
      // Asegurar que el ID coincida
      command.sedeId = id;
      
      const response = await this.put<boolean>(`${this.baseUrl}/${id}`, command);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `actualizar sede con ID ${id}`, true);
      throw error;
    }
  }

  /**
   * Elimina una sede
   * @param params - Parámetros de eliminación
   * @returns Promise con resultado de la eliminación
   */
  async deleteSede(params: DeleteSedeRequest): Promise<ApiResponse<boolean>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.reasignarUnidades !== undefined) {
        queryParams.append('reasignarUnidades', params.reasignarUnidades.toString());
      }
      
      if (params.nuevaSedeParaUnidades !== undefined) {
        queryParams.append('nuevaSedeParaUnidades', params.nuevaSedeParaUnidades.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}/${params.id}?${queryParams.toString()}`
        : `${this.baseUrl}/${params.id}`;

      const response = await this.delete<boolean>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `eliminar sede con ID ${params.id}`, true);
      throw error;
    }
  }

  /**
   * Verifica si existe una sede con el nombre dado en una organización
   * @param nombre - Nombre de la sede
   * @param organizacionId - ID de la organización
   * @param sedeIdExcluir - ID de sede a excluir de la validación (opcional)
   * @returns Promise con true si existe, false si no
   */
  async existeSedeConNombre(nombre: string, organizacionId: number, sedeIdExcluir?: number): Promise<boolean> {
    try {
      const params: GetSedesRequest = {
        organizacionId,
        searchTerm: nombre
      };
      
      const response = await this.getSedes(params);
      
      if (!response.success || !response.data) {
        return false;
      }
      
      return response.data.some(sede => 
        sede.nombre?.toLowerCase() === nombre.toLowerCase() && 
        sede.organizacionId === organizacionId &&
        (sedeIdExcluir === undefined || sede.sedeId !== sedeIdExcluir)
      );
    } catch (error) {
      console.error('Error al verificar existencia de sede:', error);
      return false;
    }
  }

  /**
   * Obtiene las sedes activas de una organización
   * @param organizacionId - ID de la organización
   * @returns Promise con las sedes activas
   */
  async getSedesActivasPorOrganizacion(organizacionId: number): Promise<Sede[]> {
    try {
      const response = await this.getSedesPorOrganizacion({ organizacionId });
      
      if (!response.success || !response.data) {
        return [];
      }
      
      // Filtrar solo las sedes activas (asumiendo que no hay campo de estado explícito)
      return response.data.filter(sede => sede.nombre && sede.nombre.trim() !== '');
    } catch (error) {
      console.error('Error al obtener sedes activas:', error);
      return [];
    }
  }

  /**
   * Obtiene un resumen de la sede con información básica
   * @param id - ID de la sede
   * @returns Promise con el resumen de la sede
   */
  async getResumenSede(id: number): Promise<{
    sedeId: number;
    nombre: string | null;
    descripcion: string | null;
    organizacionId: number | null;
    razonSocialOrganizacion: string | null;
    ubicacionCompleta: string | null;
    cantidadUnidadesOrg: number;
    cantidadPosiciones: number;
    cantidadPersonas: number;
  } | null> {
    try {
      const response = await this.getSedeCompleta({ id });
      
      if (!response.success || !response.data) {
        return null;
      }
      
      const sede = response.data;
      
      return {
        sedeId: sede.sedeId,
        nombre: sede.nombre,
        descripcion: sede.descripcion,
        organizacionId: sede.organizacionId,
        razonSocialOrganizacion: sede.razonSocialOrganizacion,
        ubicacionCompleta: sede.ubicacionCompleta,
        cantidadUnidadesOrg: sede.cantidadUnidadesOrg,
        cantidadPosiciones: sede.cantidadPosiciones,
        cantidadPersonas: sede.cantidadPersonas
      };
    } catch (error) {
      console.error(`Error al obtener resumen de sede ${id}:`, error);
      return null;
    }
  }
}

// Exportar una instancia singleton del servicio
export const sedesService = new SedesService();
export default sedesService;