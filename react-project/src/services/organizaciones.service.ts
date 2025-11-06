import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { 
  OrganizacionDto,
  CreateOrganizacionCommand,
  UpdateOrganizacionCommand,
  GetOrganizacionesRequest,
  GetOrganizacionRequest,
  CargaMasivaRequest,
  SaveOrganizationalLayoutRequest } from './types/organizaciones.types';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * Servicio para la gestión de Organizaciones
 */
class OrganizacionesService extends BaseApiService {
  private readonly baseUrl = '/Organizaciones';

  constructor() {
    super();
  }

  /**
   * Obtiene todas las organizaciones
   * @param params - Parámetros de la consulta
   * @returns Promise con la respuesta del API
   */
  async getOrganizaciones(params: GetOrganizacionesRequest = {}): Promise<ApiResponse<OrganizacionDto[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.includeDeleted !== undefined) {
        queryParams.append('includeDeleted', params.includeDeleted.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await this.get<OrganizacionDto[]>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'obtener organizaciones', false);
      throw error;
    }
  }

  /**
   * Obtiene una organización por ID
   * @param request - Parámetros de la consulta
   * @returns Promise con la organización encontrada
   */
  async getOrganizacionById(params: GetOrganizacionRequest): Promise<ApiResponse<OrganizacionDto>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.includeDeleted !== undefined) {
        queryParams.append('includeDeleted', params.includeDeleted.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}/${params.id}?${queryParams.toString()}`
        : `${this.baseUrl}/${params.id}`;

      const response = await this.get<OrganizacionDto>(url);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `obtener organización con ID ${params.id}`, false);
      throw error;
    }
  }

  /**
   * Obtiene una organización completa con información relacionada
   * @param id - ID de la organización
   * @returns Promise con la organización completa
   */
  async getOrganizacionCompleta(id: number): Promise<ApiResponse<OrganizacionDto>> {
    try {
      const response = await this.get<OrganizacionDto>(`${this.baseUrl}/${id}/completa`);
      return response;
    } catch (error) {
      await ErrorHandler.handleServiceError(error, `obtener organización completa con ID ${id}`, false);
      throw error;
    }
  }

  /**
   * Obtiene la estructura organizacional completa (organigrama)
   * @param organizationId - ID de la organización
   * @returns Promise con la estructura organizacional completa
   */
  async getEstructuraOrganizacional(organizationId: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.get<any>(`${this.baseUrl}/OrganizationalStructure/${organizationId}`);
      
      return response;
    } catch (error) {
      console.error(`❌ [ESTRUCTURA ORG] Error al obtener estructura organizacional para organización ${organizationId}:`, error);
      await ErrorHandler.handleServiceError(error, `obtener estructura organizacional de la organización ${organizationId}`, false);
      throw error;
    }
  }

  /**
   * Inserta o actualiza el layout organizacional para una organización
   * POST /api/Organizaciones/OrganizationalLayout/{organizationId}
   * @param organizationId - ID de la organización
   * @param payload - Posiciones de nodos y viewport a persistir
   * @returns Promise con resultado booleano
   */
  async saveOrganizationalLayout(organizationId: number, payload: SaveOrganizationalLayoutRequest): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.post<boolean>(`${this.baseUrl}/OrganizationalLayout/${organizationId}`, payload);
      return response;
    } catch (error) {
      console.error(`❌ [LAYOUT ORG] Error al guardar layout para organización ${organizationId}:`, error);
      await ErrorHandler.handleServiceError(error, `guardar layout organizacional de la organización ${organizationId}`, false);
      throw error;
    }
  }

  /**
   * Obtiene el layout organizacional guardado de una organización
   * GET /api/Organizaciones/OrganizationalLayout/{organizationId}
   * @param organizationId - ID de la organización
   * @returns Promise con el layout guardado o null si no existe
   */
  async getOrganizationalLayout(organizationId: number): Promise<ApiResponse<SaveOrganizationalLayoutRequest | null>> {
    try {
      const response = await this.get<SaveOrganizationalLayoutRequest | null>(`${this.baseUrl}/OrganizationalLayout/${organizationId}`);
      return response;
    } catch (error) {
      console.error(`❌ [LAYOUT ORG] Error al obtener layout para organización ${organizationId}:`, error);
      await ErrorHandler.handleServiceError(error, `obtener layout organizacional de la organización ${organizationId}`, false);
      throw error;
    }
  }

  /**
   * Crea una nueva organización
   * @param command - Datos de la nueva organización
   * @returns Promise con el ID de la organización creada
   */
  async createOrganizacion(command: CreateOrganizacionCommand): Promise<ApiResponse<number>> {
    try {
      const response = await this.post<number>(this.baseUrl, command);
      return response;
    } catch (error) {
      console.error('Error al crear organización:', error);
      throw error;
    }
  }

  /**
   * Actualiza una organización existente
   * @param id - ID de la organización a actualizar
   * @param command - Datos actualizados de la organización
   * @returns Promise con resultado de la actualización
   */
  async updateOrganizacion(id: number, command: UpdateOrganizacionCommand): Promise<ApiResponse<boolean>> {
    try {
      // Asegurar que el ID coincida
      command.organizacionId = id;
      
      const response = await this.put<boolean>(`${this.baseUrl}/${id}`, command);
      return response;
    } catch (error) {
      console.error('Error al actualizar organización:', error);
      throw error;
    }
  }

  /**
   * Elimina una organización (soft delete)
   * @param id - ID de la organización a eliminar
   * @returns Promise con resultado de la eliminación
   */
  async deleteOrganizacion(id: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.delete<boolean>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error al eliminar organización:', error);
      throw error;
    }
  }

  /**
   * Obtiene organizaciones de forma paginada con filtros
   * @param params - Parámetros de paginación y filtros
   * @returns Promise con resultado paginado
   */
  async getOrganizacionesPaginated(params: GetOrganizacionesRequest = {}): Promise<ApiResponse<OrganizacionDto[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar todos los parámetros de filtro
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${this.baseUrl}/paginated?${queryParams.toString()}`;
      const response = await this.get<OrganizacionDto[]>(url);
      return response;
    } catch (error) {
      console.error('Error al obtener organizaciones paginadas:', error);
      throw error;
    }
  }

  /**
   * Busca organización por ClientId
   * @param clientId - ClientId a buscar
   * @returns Promise con la organización encontrada
   */
  async getOrganizacionByClientId(clientId: string): Promise<ApiResponse<OrganizacionDto>> {
    try {
      const response = await this.get<OrganizacionDto>(`${this.baseUrl}/by-client/${encodeURIComponent(clientId)}`);
      return response;
    } catch (error) {
      console.error(`Error al buscar organización por ClientId ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Busca organizaciones por código
   * @param codigo - Código a buscar
   * @returns Promise con la organización encontrada
   */
  async getOrganizacionByCodigo(codigo: string): Promise<ApiResponse<OrganizacionDto>> {
    try {
      const response = await this.get<OrganizacionDto>(`${this.baseUrl}/by-codigo/${encodeURIComponent(codigo)}`);
      return response;
    } catch (error) {
      console.error(`Error al buscar organización por código ${codigo}:`, error);
      throw error;
    }
  }

  /**
   * Busca organizaciones por número de documento
   * @param numeroDocumento - Número de documento a buscar
   * @returns Promise con la organización encontrada
   */
  async getOrganizacionByDocumento(numeroDocumento: string): Promise<ApiResponse<OrganizacionDto>> {
    try {
      const response = await this.get<OrganizacionDto>(`${this.baseUrl}/by-documento/${encodeURIComponent(numeroDocumento)}`);
      return response;
    } catch (error) {
      console.error(`Error al buscar organización por documento ${numeroDocumento}:`, error);
      throw error;
    }
  }

  /**
   * Busca organizaciones por dominio
   * @param dominio - Dominio a buscar
   * @returns Promise con las organizaciones encontradas
   */
  async getOrganizacionesByDominio(dominio: string): Promise<ApiResponse<OrganizacionDto[]>> {
    try {
      const response = await this.get<OrganizacionDto[]>(`${this.baseUrl}/by-dominio/${encodeURIComponent(dominio)}`);
      return response;
    } catch (error) {
      console.error(`Error al buscar organizaciones por dominio ${dominio}:`, error);
      throw error;
    }
  }

  /**
   * Busca organización por TenantId
   * @param tenantId - TenantId a buscar
   * @returns Promise con la organización encontrada
   */
  async getOrganizacionByTenantId(tenantId: string): Promise<ApiResponse<OrganizacionDto>> {
    try {
      const response = await this.get<OrganizacionDto>(`${this.baseUrl}/by-tenant/${encodeURIComponent(tenantId)}`);
      return response;
    } catch (error) {
      console.error(`Error al buscar organización por TenantId ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de organizaciones por estado
   * @returns Promise con las estadísticas
   */
  async getEstadisticasPorEstado(): Promise<ApiResponse<{ [key: string]: number }>> {
    try {
      const response = await this.get<{ [key: string]: number }>(`${this.baseUrl}/estadisticas/por-estado`);
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas por estado:', error);
      throw error;
    }
  }

  /**
   * Obtiene organizaciones con suscripciones próximas a vencer
   * @param diasAnticipacion - Días de anticipación para el vencimiento
   * @returns Promise con las organizaciones
   */
  async getOrganizacionesConSuscripcionesPorVencer(diasAnticipacion?: number): Promise<ApiResponse<OrganizacionDto[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (diasAnticipacion !== undefined) {
        queryParams.append('diasAnticipacion', diasAnticipacion.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}/suscripciones-por-vencer?${queryParams.toString()}`
        : `${this.baseUrl}/suscripciones-por-vencer`;

      const response = await this.get<OrganizacionDto[]>(url);
      return response;
    } catch (error) {
      console.error('Error al obtener organizaciones con suscripciones por vencer:', error);
      throw error;
    }
  }

  /**
   * Valida configuración de Active Directory simple
   * @param dominio - Dominio a validar
   * @returns Promise con resultado de validación
   */
  async validarADSimple(dominio: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.get<any>(`${this.baseUrl}/validar-ad-simple/${encodeURIComponent(dominio)}`);
      return response;
    } catch (error) {
      console.error(`Error al validar AD simple para dominio ${dominio}:`, error);
      throw error;
    }
  }

  /**
   * Valida configuración de Active Directory
   * @param dominio - Dominio a validar
   * @returns Promise con resultado de validación
   */
  async validarAD(dominio: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.get<any>(`${this.baseUrl}/validar-ad/${encodeURIComponent(dominio)}`);
      return response;
    } catch (error) {
      console.error(`Error al validar AD para dominio ${dominio}:`, error);
      throw error;
    }
  }

  /**
   * Valida múltiples configuraciones de Active Directory
   * @param request - Request con múltiples dominios
   * @returns Promise con resultado de validación
   */
  async validarADMultiple(request: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post<any>(`${this.baseUrl}/validar-ad-multiple`, request);
      return response;
    } catch (error) {
      console.error('Error al validar múltiples AD:', error);
      throw error;
    }
  }

  // Métodos de conveniencia adicionales

  /**
   * Busca organizaciones por múltiples criterios
   * @param criterios - Objeto con diferentes criterios de búsqueda
   * @returns Promise con organizaciones encontradas
   */
  async buscarOrganizaciones(criterios: {
    razonSocial?: string;
    nombreComercial?: string;
    codigo?: string;
    numeroDocumento?: string;
    email?: string;
    estado?: number;
    includeDeleted?: boolean;
  }): Promise<OrganizacionDto[]> {
    try {
      const response = await this.getOrganizaciones({ 
        includeDeleted: criterios.includeDeleted 
      });
      
      if (response.success && response.data) {
        let organizaciones = response.data;

        // Aplicar filtros
        if (criterios.razonSocial) {
          const razonLower = criterios.razonSocial.toLowerCase();
          organizaciones = organizaciones.filter(org => 
            org.razonSocial?.toLowerCase().includes(razonLower)
          );
        }

        if (criterios.nombreComercial) {
          const nombreLower = criterios.nombreComercial.toLowerCase();
          organizaciones = organizaciones.filter(org => 
            org.nombreComercial?.toLowerCase().includes(nombreLower)
          );
        }

        if (criterios.codigo) {
          const codigoLower = criterios.codigo.toLowerCase();
          organizaciones = organizaciones.filter(org => 
            org.codigo?.toLowerCase().includes(codigoLower)
          );
        }

        if (criterios.numeroDocumento) {
          organizaciones = organizaciones.filter(org => 
            org.numeroDocumento === criterios.numeroDocumento
          );
        }

        if (criterios.email) {
          const emailLower = criterios.email.toLowerCase();
          organizaciones = organizaciones.filter(org => 
            org.email?.toLowerCase().includes(emailLower)
          );
        }

        if (criterios.estado !== undefined) {
          organizaciones = organizaciones.filter(org => 
            org.estado === criterios.estado
          );
        }

        return organizaciones;
      }
      
      return [];
    } catch (error) {
      console.error('Error al buscar organizaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene organizaciones activas únicamente
   * @returns Promise con organizaciones activas
   */
  async getOrganizacionesActivas(): Promise<OrganizacionDto[]> {
    return this.buscarOrganizaciones({ estado: 1, includeDeleted: false });
  }

  /**
   * Verifica si una organización existe por código
   * @param codigo - Código a verificar
   * @returns Promise con boolean indicando si existe
   */
  async existeOrganizacionPorCodigo(codigo: string): Promise<boolean> {
    try {
      const response = await this.getOrganizacionByCodigo(codigo);
      return response.success && !!response.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica si una organización existe por número de documento
   * @param numeroDocumento - Número de documento a verificar
   * @returns Promise con boolean indicando si existe
   */
  async existeOrganizacionPorDocumento(numeroDocumento: string): Promise<boolean> {
    try {
      const response = await this.getOrganizacionByDocumento(numeroDocumento);
      return response.success && !!response.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el resumen de una organización (datos básicos)
   * @param id - ID de la organización
   * @returns Promise con datos básicos de la organización
   */
  async getResumenOrganizacion(id: number): Promise<{
    organizacionId: number;
    razonSocial: string;
    nombreComercial: string | null;
    codigo: string | null;
    numeroDocumento: string | null;
    estado: number;
    estadoTexto: string | null;
    ubicacionCompleta: string | null;
  } | null> {
    try {
      const response = await this.getOrganizacionById({ id });
      
      if (response.success && response.data) {
        const org = response.data;
        return {
          organizacionId: org.organizacionId,
          razonSocial: org.razonSocial || '',
          nombreComercial: org.nombreComercial,
          codigo: org.codigo,
          numeroDocumento: org.numeroDocumento,
          estado: org.estado,
          estadoTexto: org.estadoTexto,
          ubicacionCompleta: org.ubicacionCompleta
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error al obtener resumen de organización ${id}:`, error);
      return null;
    }
  }

  /**
   * Obtiene la estructura organizacional completa adaptada para mostrar en organigrama
   * @param organizationId - ID de la organización
   * @returns Promise con estructura adaptada para organigrama
   */
  async getEstructuraOrganizacionalParaOrganigrama(organizationId: number): Promise<{
    organizacion: any;
    unidades: any[];
    posiciones: any[];
    personas: any[];
    personaPosiciones: any[];
  } | null> {
    try {
      const response = await this.getEstructuraOrganizacional(organizationId);
      
      if (response.success && response.data) {
        const estructura = response.data;
        
        // Transformar datos para el organigrama
        const organigramaData = {
          organizacion: estructura.organizacion,
          unidades: estructura.unidadesOrg || [],
          posiciones: estructura.posiciones || [],
          personas: estructura.personas || [],
          personaPosiciones: estructura.personaPosicion || []
        };
        
        return organigramaData;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error al obtener estructura organizacional para organigrama:`, error);
      return null;
    }
  }

  /**
   * Elimina la estructura organizacional completa de una organización
   * @param organizationId - ID de la organización
   * @param confirmarEliminacionFisica - Si true, elimina físicamente la estructura
   * @param textoConfirmacion - Texto de confirmación para la eliminación
   */
  async deleteEstructuraOrganizacional(
    organizationId: number, 
    confirmarEliminacionFisica: boolean = true, 
    textoConfirmacion: string = 'ELIMINAR_ESTRUCTURA_FISICA'
  ): Promise<ApiResponse<boolean>> {
    try {
      const endpoint = `/OrganizationalStructure/${organizationId}`;
      
      const requestBody = {
        organizacionId: organizationId,
        confirmarEliminacionFisica,
        textoConfirmacion
      };
      
      const response = await this.axiosInstance.delete<ApiResponse<boolean>>(
        `${this.baseUrl}${endpoint}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: requestBody
        }
      );
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Error al eliminar estructura organizacional');
      }
    } catch (error) {
      console.error(`❌ [DELETE ESTRUCTURA] Error al eliminar estructura organizacional:`, error);
      throw error;
    }
  }

  /**
   * Ejecuta una carga masiva de datos organizacionales
   * @param data - Datos de la carga masiva
   */
  async ejecutarCargaMasiva(data: CargaMasivaRequest): Promise<ApiResponse<any>> {
    try {
      const response = await this.post<any>(`${this.baseUrl}/CargaMasiva`, data);
      
      return response;
    } catch (error) {
      console.error('Error en carga masiva:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const organizacionesService = new OrganizacionesService();
export { OrganizacionesService };