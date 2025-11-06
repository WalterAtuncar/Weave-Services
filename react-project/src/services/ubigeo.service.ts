import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { 
  UbigeoDto,
  GetUbigeosRequest
} from './types/ubigeo.types';

/**
 * Servicio para la gestión de Ubigeos
 */
class UbigeoService extends BaseApiService {
  private readonly baseUrl = '/Ubigeos';

  constructor() {
    super();
  }

  /**
   * Obtiene la lista de todos los ubigeos
   * @param params - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getUbigeos(params: GetUbigeosRequest = {}): Promise<ApiResponse<UbigeoDto[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros opcionales
      if (params.includeDeleted !== undefined) {
        queryParams.append('includeDeleted', params.includeDeleted.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await this.get<UbigeoDto[]>(url);
      return response;
    } catch (error) {
      console.error('Error al obtener ubigeos:', error);
      throw error;
    }
  }

  /**
   * Obtiene ubigeos filtrados por tipo de nivel
   * @param tipoNivel - Tipo de nivel (País, Departamento, Provincia, Distrito)
   * @param includeDeleted - Incluir elementos eliminados
   * @returns Promise con ubigeos filtrados
   */
  async getUbigeosByTipo(tipoNivel: string, includeDeleted: boolean = false): Promise<UbigeoDto[]> {
    try {
      const response = await this.getUbigeos({ includeDeleted });
      
      if (response.success && response.data) {
        return response.data.filter(ubigeo => ubigeo.tipoNivel === tipoNivel);
      }
      
      return [];
    } catch (error) {
      console.error(`Error al obtener ubigeos por tipo ${tipoNivel}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene solo los países
   * @param includeDeleted - Incluir elementos eliminados
   * @returns Promise con lista de países
   */
  async getPaises(includeDeleted: boolean = false): Promise<UbigeoDto[]> {
    return this.getUbigeosByTipo('País', includeDeleted);
  }

  /**
   * Obtiene solo los departamentos
   * @param includeDeleted - Incluir elementos eliminados
   * @returns Promise con lista de departamentos
   */
  async getDepartamentos(includeDeleted: boolean = false): Promise<UbigeoDto[]> {
    return this.getUbigeosByTipo('Departamento', includeDeleted);
  }

  /**
   * Obtiene solo las provincias
   * @param includeDeleted - Incluir elementos eliminados
   * @returns Promise con lista de provincias
   */
  async getProvincias(includeDeleted: boolean = false): Promise<UbigeoDto[]> {
    return this.getUbigeosByTipo('Provincia', includeDeleted);
  }

  /**
   * Obtiene solo los distritos
   * @param includeDeleted - Incluir elementos eliminados
   * @returns Promise con lista de distritos
   */
  async getDistritos(includeDeleted: boolean = false): Promise<UbigeoDto[]> {
    return this.getUbigeosByTipo('Distrito', includeDeleted);
  }

  /**
   * Obtiene ubigeos hijos de un ubigeo padre específico
   * @param ubigeoPadreId - ID del ubigeo padre
   * @param includeDeleted - Incluir elementos eliminados
   * @returns Promise con ubigeos hijos
   */
  async getUbigeosHijos(ubigeoPadreId: number, includeDeleted: boolean = false): Promise<UbigeoDto[]> {
    try {
      const response = await this.getUbigeos({ includeDeleted });
      
      if (response.success && response.data) {
        return response.data.filter(ubigeo => ubigeo.ubigeoPadreId === ubigeoPadreId);
      }
      
      return [];
    } catch (error) {
      console.error(`Error al obtener ubigeos hijos de ${ubigeoPadreId}:`, error);
      throw error;
    }
  }

  /**
   * Busca ubigeos por nombre
   * @param nombre - Nombre a buscar (parcial)
   * @param includeDeleted - Incluir elementos eliminados
   * @returns Promise con ubigeos que coinciden con el nombre
   */
  async buscarUbigeosPorNombre(nombre: string, includeDeleted: boolean = false): Promise<UbigeoDto[]> {
    try {
      const response = await this.getUbigeos({ includeDeleted });
      
      if (response.success && response.data) {
        const nombreLower = nombre.toLowerCase();
        return response.data.filter(ubigeo => 
          ubigeo.nombre.toLowerCase().includes(nombreLower) ||
          ubigeo.nombreCompleto.toLowerCase().includes(nombreLower) ||
          ubigeo.codigo.toLowerCase().includes(nombreLower)
        );
      }
      
      return [];
    } catch (error) {
      console.error(`Error al buscar ubigeos por nombre "${nombre}":`, error);
      throw error;
    }
  }

  /**
   * Obtiene un ubigeo por su ID
   * @param ubigeoId - ID del ubigeo
   * @param includeDeleted - Incluir elementos eliminados
   * @returns Promise con el ubigeo encontrado o null
   */
  async getUbigeoById(ubigeoId: number, includeDeleted: boolean = false): Promise<UbigeoDto | null> {
    try {
      const response = await this.getUbigeos({ includeDeleted });
      
      if (response.success && response.data) {
        return response.data.find(ubigeo => ubigeo.ubigeoId === ubigeoId) || null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error al obtener ubigeo por ID ${ubigeoId}:`, error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const ubigeoService = new UbigeoService();
export { UbigeoService }; 