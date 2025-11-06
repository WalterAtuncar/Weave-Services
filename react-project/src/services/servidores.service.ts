/**
 * Servicio para gestión de Servidores
 * Implementa todos los endpoints del controlador ServidoresController
 * Incluye CRUD completo, estadísticas, filtros avanzados y gestión de sistemas alojados
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  Servidor,
  ServidorDto,
  ServidorSimpleDto,
  SistemaEnServidorDto,
  
  // Requests
  GetAllServidoresRequest,
  GetServidorByIdRequest,
  GetServidorCompletoRequest,
  GetServidoresActivosRequest,
  GetServidoresPaginatedRequest,
  GetEstadisticasServidoresRequest,
  GetServidoresByTipoRequest,
  GetServidoresByAmbienteRequest,
  CreateServidorRequest,
  UpdateServidorRequest,
  DeleteServidorRequest,
  
  // Responses
  GetAllServidoresResponseData,
  GetServidorByIdResponseData,
  GetServidorCompletoResponseData,
  GetServidoresActivosResponseData,
  ServidoresPaginatedResponseData,
  EstadisticasServidoresResponseData,
  GetServidoresByTipoResponseData,
  GetServidoresByAmbienteResponseData,
  CreateServidorResponseData,
  UpdateServidorResponseData,
  DeleteServidorResponseData,
  
  // Tipos auxiliares
  ServidoresFilters,
  ServidoresSortOptions,
  ServidoresPaginationOptions,
  TipoServidor,
  AmbienteServidor,
  EstadoServidor
} from './types/servidores.types';

export class ServidoresService extends BaseApiService {
  protected baseEndpoint = '/Servidores';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todos los servidores
   * GET /api/Servidores
   */
  async getAllServidores(request: GetAllServidoresRequest): Promise<ApiResponse<GetAllServidoresResponseData>> {
    const params = new URLSearchParams();
    
    // organizationId es requerido
    params.append('organizationId', request.organizationId.toString());
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request?.tipo !== undefined) {
      params.append('tipo', request.tipo.toString());
    }
    if (request?.ambiente !== undefined) {
      params.append('ambiente', request.ambiente.toString());
    }
    if (request?.estado !== undefined) {
      params.append('estado', request.estado.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseEndpoint}?${queryString}`;

    return await this.get<GetAllServidoresResponseData>(url);
  }

  /**
   * Obtiene un servidor por ID
   * GET /api/Servidores/{id}
   */
  async getServidorById(request: GetServidorByIdRequest): Promise<ApiResponse<GetServidorByIdResponseData>> {
    const params = new URLSearchParams();
    
    // ✅ SWAGGER: organizationId es requerido en query string
    params.append('organizationId', request.organizationId.toString());
    
    // ✅ SWAGGER: includeDeleted es opcional, por defecto false
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    } else {
      params.append('includeDeleted', 'false');
    }

    const queryString = params.toString();
    const url = `${this.baseEndpoint}/${request.servidorId}?${queryString}`;

    return await this.get<GetServidorByIdResponseData>(url);
  }

  /**
   * Obtiene información completa de un servidor con sistemas alojados
   * GET /api/Servidores/{id}/completo
   */
  async getServidorCompleto(request: GetServidorCompletoRequest): Promise<ApiResponse<GetServidorCompletoResponseData>> {
    const params = new URLSearchParams();
    
    if (request.incluirSistemas !== undefined) {
      params.append('incluirSistemas', request.incluirSistemas.toString());
    }
    if (request.soloSistemasActivos !== undefined) {
      params.append('soloSistemasActivos', request.soloSistemasActivos.toString());
    }
    if (request.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.servidorId}/completo?${queryString}`
      : `${this.baseEndpoint}/${request.servidorId}/completo`;

    return await this.get<GetServidorCompletoResponseData>(url);
  }



  /**
   * Obtiene servidores activos
   * GET /api/Servidores/activos
   */
  async getServidoresActivos(request?: GetServidoresActivosRequest): Promise<ApiResponse<GetServidoresActivosResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.tipo !== undefined) {
      params.append('tipo', request.tipo.toString());
    }
    if (request?.ambiente !== undefined) {
      params.append('ambiente', request.ambiente.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/activos?${queryString}`
      : `${this.baseEndpoint}/activos`;

    return await this.get<GetServidoresActivosResponseData>(url);
  }

  /**
   * Búsqueda paginada de servidores con filtros avanzados
   * GET /api/Servidores/paginated
   */
  async getServidoresPaginated(request: GetServidoresPaginatedRequest): Promise<ApiResponse<ServidoresPaginatedResponseData>> {
    const params = new URLSearchParams();
    
    // OrganizationId es requerido según swagger
    params.append('OrganizationId', request.organizationId.toString());
    
    // Paginación
    if (request?.page !== undefined) {
      params.append('Page', request.page.toString());
    }
    if (request?.pageSize !== undefined) {
      params.append('PageSize', request.pageSize.toString());
    }
    if (request?.orderBy) {
      params.append('OrderBy', request.orderBy);
    }
    if (request?.orderDescending !== undefined) {
      params.append('OrderDescending', request.orderDescending.toString());
    }

    // Filtros básicos
    if (request?.includeDeleted !== undefined) {
      params.append('IncludeDeleted', request.includeDeleted.toString());
    }
    if (request?.estado !== undefined) {
      params.append('Estado', request.estado.toString());
    }

    // Filtros de información del servidor
    if (request?.codigo) {
      params.append('Codigo', request.codigo);
    }
    if (request?.nombre) {
      params.append('Nombre', request.nombre);
    }
    if (request?.sistemaOperativo) {
      params.append('SistemaOperativo', request.sistemaOperativo);
    }
    if (request?.ip) {
      params.append('IP', request.ip);
    }
    if (request?.searchTerm) {
      params.append('SearchTerm', request.searchTerm);
    }

    // Filtros por tipos y ambiente
    if (request?.tipo !== undefined) {
      params.append('Tipo', request.tipo.toString());
    }
    if (request?.ambiente !== undefined) {
      params.append('Ambiente', request.ambiente.toString());
    }

    // Filtros booleanos
    if (request?.soloActivos !== undefined) {
      params.append('soloActivos', request.soloActivos.toString());
    }
    if (request?.soloVirtuales !== undefined) {
      params.append('soloVirtuales', request.soloVirtuales.toString());
    }
    if (request?.soloFisicos !== undefined) {
      params.append('soloFisicos', request.soloFisicos.toString());
    }
    if (request?.soloProduccion !== undefined) {
      params.append('soloProduccion', request.soloProduccion.toString());
    }
    if (request?.soloDesarrollo !== undefined) {
      params.append('soloDesarrollo', request.soloDesarrollo.toString());
    }
    if (request?.tieneSistemas !== undefined) {
      params.append('tieneSistemas', request.tieneSistemas.toString());
    }
    if (request?.sinSistemas !== undefined) {
      params.append('sinSistemas', request.sinSistemas.toString());
    }

    // Filtros por fechas
    if (request?.fechaCreacionDesde) {
      params.append('fechaCreacionDesde', request.fechaCreacionDesde);
    }
    if (request?.fechaCreacionHasta) {
      params.append('fechaCreacionHasta', request.fechaCreacionHasta);
    }
    if (request?.fechaActualizacionDesde) {
      params.append('fechaActualizacionDesde', request.fechaActualizacionDesde);
    }
    if (request?.fechaActualizacionHasta) {
      params.append('fechaActualizacionHasta', request.fechaActualizacionHasta);
    }

    // Filtros por rangos de IP
    if (request?.ipRangoInicio) {
      params.append('ipRangoInicio', request.ipRangoInicio);
    }
    if (request?.ipRangoFin) {
      params.append('ipRangoFin', request.ipRangoFin);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/paginated?${queryString}`
      : `${this.baseEndpoint}/paginated`;

    return await this.get<ServidoresPaginatedResponseData>(url);
  }

  /**
   * Obtiene estadísticas de servidores
   * GET /api/Servidores/estadisticas
   */
  async getEstadisticasServidores(request?: GetEstadisticasServidoresRequest): Promise<ApiResponse<EstadisticasServidoresResponseData>> {
    const params = new URLSearchParams();
    
    if (request?.tipo !== undefined) {
      params.append('tipo', request.tipo.toString());
    }
    if (request?.ambiente !== undefined) {
      params.append('ambiente', request.ambiente.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/estadisticas?${queryString}`
      : `${this.baseEndpoint}/estadisticas`;

    return await this.get<EstadisticasServidoresResponseData>(url);
  }

  /**
   * Obtiene servidores por tipo específico
   * GET /api/Servidores/tipo/{tipo}
   */
  async getServidoresByTipo(request: GetServidoresByTipoRequest): Promise<ApiResponse<GetServidoresByTipoResponseData>> {
    const params = new URLSearchParams();
    
    if (request.ambiente !== undefined) {
      params.append('ambiente', request.ambiente.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/tipo/${request.tipo}?${queryString}`
      : `${this.baseEndpoint}/tipo/${request.tipo}`;

    return await this.get<GetServidoresByTipoResponseData>(url);
  }

  /**
   * Obtiene servidores por ambiente específico
   * GET /api/Servidores/ambiente/{ambiente}
   */
  async getServidoresByAmbiente(request: GetServidoresByAmbienteRequest): Promise<ApiResponse<GetServidoresByAmbienteResponseData>> {
    const params = new URLSearchParams();
    
    if (request.tipo !== undefined) {
      params.append('tipo', request.tipo.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/ambiente/${request.ambiente}?${queryString}`
      : `${this.baseEndpoint}/ambiente/${request.ambiente}`;

    return await this.get<GetServidoresByAmbienteResponseData>(url);
  }

  /**
   * Crea un nuevo servidor
   * POST /api/Servidores
   */
  async createServidor(request: CreateServidorRequest): Promise<ApiResponse<CreateServidorResponseData>> {
    return await this.post<CreateServidorResponseData>(this.baseEndpoint, request);
  }

  /**
   * Actualiza un servidor existente
   * PUT /api/Servidores/{id}
   */
  async updateServidor(request: UpdateServidorRequest): Promise<ApiResponse<UpdateServidorResponseData>> {
    const url = `${this.baseEndpoint}/${request.id}`;
    return await this.put<UpdateServidorResponseData>(url, request);
  }

  /**
   * Elimina un servidor
   * DELETE /api/Servidores/{id}
   */
  async deleteServidor(request: DeleteServidorRequest): Promise<ApiResponse<DeleteServidorResponseData>> {
    const params = new URLSearchParams();
    
    // ✅ REQUERIDO: Agregar organizationId
    params.append('organizationId', request.organizationId.toString());
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.reasignarSistemas !== undefined) {
      params.append('reasignarSistemas', request.reasignarSistemas.toString());
    }
    if (request.servidorDestinoId !== undefined) {
      params.append('servidorDestinoId', request.servidorDestinoId.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }
    if (request.eliminadoPor !== undefined) {
      params.append('eliminadoPor', request.eliminadoPor.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseEndpoint}/${request.servidorId}?${queryString}`;

    return await this.delete<DeleteServidorResponseData>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Construye filtros para la búsqueda paginada
   */
  buildFilters(filters: ServidoresFilters): GetServidoresPaginatedRequest {
    return {
      includeDeleted: filters.includeDeleted,
      estado: filters.estado,
      codigo: filters.codigo,
      nombre: filters.nombre,
      sistemaOperativo: filters.sistemaOperativo,
      ip: filters.ip,
      searchTerm: filters.searchTerm,
      tipo: filters.tipo,
      ambiente: filters.ambiente,
      soloActivos: filters.soloActivos,
      soloVirtuales: filters.soloVirtuales,
      soloFisicos: filters.soloFisicos,
      soloProduccion: filters.soloProduccion,
      soloDesarrollo: filters.soloDesarrollo,
      tieneSistemas: filters.tieneSistemas,
      sinSistemas: filters.sinSistemas,
      fechaCreacionDesde: filters.fechaCreacionDesde,
      fechaCreacionHasta: filters.fechaCreacionHasta,
      fechaActualizacionDesde: filters.fechaActualizacionDesde,
      fechaActualizacionHasta: filters.fechaActualizacionHasta,
      ipRangoInicio: filters.ipRangoInicio,
      ipRangoFin: filters.ipRangoFin
    };
  }

  /**
   * Construye opciones de paginación
   */
  buildPaginationOptions(options: ServidoresPaginationOptions): Partial<GetServidoresPaginatedRequest> {
    return {
      page: options.page,
      pageSize: options.pageSize
    };
  }

  /**
   * Construye opciones de ordenamiento
   */
  buildSortOptions(options: ServidoresSortOptions): Partial<GetServidoresPaginatedRequest> {
    return {
      orderBy: options.field,
      orderDescending: options.direction === 'desc'
    };
  }

  /**
   * Obtiene el texto para un tipo de servidor
   */
  getTipoTexto(tipo: number): string {
    switch (tipo) {
      case TipoServidor.Virtual:
        return 'Virtual';
      case TipoServidor.Fisico:
        return 'Físico';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Obtiene el texto para un ambiente de servidor
   */
  getAmbienteTexto(ambiente: number): string {
    switch (ambiente) {
      case AmbienteServidor.Desarrollo:
        return 'Desarrollo';
      case AmbienteServidor.Produccion:
        return 'Producción';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Obtiene el texto para un estado de servidor
   */
  getEstadoTexto(estado: number): string {
    switch (estado) {
      case EstadoServidor.Activo:
        return 'Activo';
      case EstadoServidor.Inactivo:
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Valida si una dirección IP tiene formato válido
   */
  isValidIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  /**
   * Valida si un código de servidor tiene formato válido
   */
  isValidCode(codigo: string): boolean {
    const codeRegex = /^[A-Z0-9\-]+$/;
    return codeRegex.test(codigo);
  }
}

// Instancia singleton del servicio
export const servidoresService = new ServidoresService(); 