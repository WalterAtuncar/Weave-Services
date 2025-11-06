import { apiService } from './api.service';
import {
  // Interfaces principales
  Posicion,
  PosicionDto,
  
  // Commands
  CreatePosicionCommand,
  UpdatePosicionCommand,
  DeletePosicionCommand,
  MoverPosicionCommand,
  DuplicarPosicionCommand,
  
  // Parámetros de filtrado
  GetPosicionesParams,
  SearchPosicionesParams,
  GetPosicionesPaginatedParams,
  
  // Tipos de respuesta
  GetPosicionResponse,
  GetPosicionesResponse,
  GetPosicionDtoResponse,
  GetPosicionesDtoResponse,
  GetPosicionesPaginatedResponse,
  CreatePosicionResponse,
  UpdatePosicionResponse,
  DeletePosicionResponse,
  MoverPosicionResponse,
  DuplicarPosicionResponse,
  GetEstadisticasPosicionesResponse,
  ActivarDesactivarPosicionResponse,
  
  // Utilidades
  validarCreatePosicionCommand,
  validarUpdatePosicionCommand
} from './types/posiciones.types';

/**
 * Servicio para gestionar posiciones organizacionales
 * Implementa todos los endpoints del controlador de Posiciones según el Swagger API
 */
class PosicionesService {
  private readonly baseUrl = '/Posiciones';

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtiene una posición por ID
   * GET /api/Posiciones/{id}
   */
  async getPosicion(id: number, includeDeleted = false): Promise<GetPosicionResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');
    
    const url = `${this.baseUrl}/${id}${params.toString() ? '?' + params : ''}`;
    return await apiService.get<GetPosicionResponse>(url);
  }

  /**
   * Obtiene todas las posiciones con filtros opcionales
   * GET /api/Posiciones
   */
  async getPosiciones(params?: GetPosicionesParams): Promise<GetPosicionesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.includeDeleted) searchParams.append('includeDeleted', 'true');
    if (params?.unidadOrgId) searchParams.append('unidadOrgId', params.unidadOrgId.toString());
    if (params?.categoria) searchParams.append('categoria', params.categoria.toString());
    if (params?.soloActivas) searchParams.append('soloActivas', 'true');
    if (params?.soloVacantes) searchParams.append('soloVacantes', 'true');
    if (params?.soloCriticas) searchParams.append('soloCriticas', 'true');
    
    const url = `${this.baseUrl}${searchParams.toString() ? '?' + searchParams : ''}`;
    return await apiService.get<GetPosicionesResponse>(url);
  }

  /**
   * Crea una nueva posición
   * POST /api/Posiciones
   */
  async createPosicion(command: CreatePosicionCommand): Promise<CreatePosicionResponse> {
    // Validar comando antes de enviar
    const validationErrors = validarCreatePosicionCommand(command);
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
    }

    return await apiService.post<CreatePosicionResponse>(this.baseUrl, command);
  }

  /**
   * Actualiza una posición existente
   * PUT /api/Posiciones/{id}
   */
  async updatePosicion(id: number, command: UpdatePosicionCommand): Promise<UpdatePosicionResponse> {
    // Asegurar que el ID coincida
    command.posicionId = id;
    
    // Validar comando antes de enviar
    const validationErrors = validarUpdatePosicionCommand(command);
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
    }

    return await apiService.put<UpdatePosicionResponse>(`${this.baseUrl}/${id}`, command);
  }

  /**
   * Elimina una posición
   * DELETE /api/Posiciones/{id}
   */
  async deletePosicion(id: number, command: DeletePosicionCommand): Promise<DeletePosicionResponse> {
    // Asegurar que el ID coincida
    command.posicionId = id;
    
    // Para DELETE con body, usamos el método delete con config
    return await apiService.delete<DeletePosicionResponse>(`${this.baseUrl}/${id}`, {
      data: command
    });
  }

  // ==========================================
  // OPERACIONES ESPECIALIZADAS
  // ==========================================

  /**
   * Obtiene una posición con información completa
   * GET /api/Posiciones/{id}/completa
   */
  async getPosicionCompleta(id: number): Promise<GetPosicionDtoResponse> {
    return await apiService.get<GetPosicionDtoResponse>(`${this.baseUrl}/${id}/completa`);
  }

  /**
   * Busca posiciones por término de búsqueda
   * GET /api/Posiciones/buscar
   */
  async buscarPosiciones(params: SearchPosicionesParams): Promise<GetPosicionesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params.unidadOrgId) searchParams.append('unidadOrgId', params.unidadOrgId.toString());
    if (params.categoria) searchParams.append('categoria', params.categoria.toString());
    
    const url = `${this.baseUrl}/buscar${searchParams.toString() ? '?' + searchParams : ''}`;
    return await apiService.get<GetPosicionesResponse>(url);
  }

  /**
   * Obtiene posiciones críticas
   * GET /api/Posiciones/criticas
   */
  async getPosicionesCriticas(): Promise<GetPosicionesResponse> {
    return await apiService.get<GetPosicionesResponse>(`${this.baseUrl}/criticas`);
  }

  /**
   * Obtiene posiciones operativas
   * GET /api/Posiciones/operativas
   */
  async getPosicionesOperativas(): Promise<GetPosicionesResponse> {
    return await apiService.get<GetPosicionesResponse>(`${this.baseUrl}/operativas`);
  }

  /**
   * Obtiene posiciones vacantes
   * GET /api/Posiciones/vacantes
   */
  async getPosicionesVacantes(): Promise<GetPosicionesResponse> {
    return await apiService.get<GetPosicionesResponse>(`${this.baseUrl}/vacantes`);
  }

  /**
   * Obtiene estadísticas de posiciones
   * GET /api/Posiciones/estadisticas
   */
  async getEstadisticasPosiciones(): Promise<GetEstadisticasPosicionesResponse> {
    return await apiService.get<GetEstadisticasPosicionesResponse>(`${this.baseUrl}/estadisticas`);
  }

  /**
   * Obtiene posiciones de forma paginada con filtros avanzados
   * GET /api/Posiciones/paginated
   */
  async getPosicionesPaginated(params?: GetPosicionesPaginatedParams): Promise<GetPosicionesPaginatedResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params?.unidadOrgId) searchParams.append('unidadOrgId', params.unidadOrgId.toString());
    if (params?.categoria) searchParams.append('categoria', params.categoria.toString());
    if (params?.soloVacantes) searchParams.append('soloVacantes', 'true');
    if (params?.soloCriticas) searchParams.append('soloCriticas', 'true');
    if (params?.includeDeleted) searchParams.append('includeDeleted', 'true');
    
    const url = `${this.baseUrl}/paginated${searchParams.toString() ? '?' + searchParams : ''}`;
    return await apiService.get<GetPosicionesPaginatedResponse>(url);
  }

  // ==========================================
  // OPERACIONES DE ESTADO
  // ==========================================

  /**
   * Activa una posición
   * PATCH /api/Posiciones/{id}/activar
   */
  async activarPosicion(id: number): Promise<ActivarDesactivarPosicionResponse> {
    return await apiService.patch<ActivarDesactivarPosicionResponse>(`${this.baseUrl}/${id}/activar`, {});
  }

  /**
   * Desactiva una posición
   * PATCH /api/Posiciones/{id}/desactivar
   */
  async desactivarPosicion(id: number): Promise<ActivarDesactivarPosicionResponse> {
    return await apiService.patch<ActivarDesactivarPosicionResponse>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  // ==========================================
  // OPERACIONES AVANZADAS
  // ==========================================

  /**
   * Mueve una posición a otra unidad organizacional
   * PATCH /api/Posiciones/{id}/mover
   */
  async moverPosicion(id: number, command: MoverPosicionCommand): Promise<MoverPosicionResponse> {
    // Asegurar que el ID coincida
    command.posicionId = id;
    
    return await apiService.patch<MoverPosicionResponse>(`${this.baseUrl}/${id}/mover`, command);
  }

  /**
   * Duplica una posición existente
   * POST /api/Posiciones/{id}/duplicar
   */
  async duplicarPosicion(id: number, command: DuplicarPosicionCommand): Promise<DuplicarPosicionResponse> {
    // Asegurar que el ID coincida
    command.posicionOrigenId = id;
    
    return await apiService.post<DuplicarPosicionResponse>(`${this.baseUrl}/${id}/duplicar`, command);
  }

  // ==========================================
  // CREACIÓN ESPECIALIZADA POR TIPO
  // ==========================================

  /**
   * Crea una posición directiva
   * POST /api/Posiciones/directiva
   */
  async createPosicionDirectiva(command: CreatePosicionCommand): Promise<CreatePosicionResponse> {
    // Validar comando antes de enviar
    const validationErrors = validarCreatePosicionCommand(command);
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
    }

    return await apiService.post<CreatePosicionResponse>(`${this.baseUrl}/directiva`, command);
  }

  /**
   * Crea una posición especialista
   * POST /api/Posiciones/especialista
   */
  async createPosicionEspecialista(command: CreatePosicionCommand): Promise<CreatePosicionResponse> {
    // Validar comando antes de enviar
    const validationErrors = validarCreatePosicionCommand(command);
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
    }

    return await apiService.post<CreatePosicionResponse>(`${this.baseUrl}/especialista`, command);
  }

  /**
   * Crea una posición operativa
   * POST /api/Posiciones/operativa
   */
  async createPosicionOperativa(command: CreatePosicionCommand): Promise<CreatePosicionResponse> {
    // Validar comando antes de enviar
    const validationErrors = validarCreatePosicionCommand(command);
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
    }

    return await apiService.post<CreatePosicionResponse>(`${this.baseUrl}/operativa`, command);
  }

  // ==========================================
  // MÉTODOS DE CONVENIENCIA
  // ==========================================

  /**
   * Obtiene posiciones por unidad organizacional
   */
  async getPosicionesByUnidadOrg(unidadOrgId: number, includeDeleted = false): Promise<GetPosicionesResponse> {
    return this.getPosiciones({ unidadOrgId, includeDeleted });
  }

  /**
   * Obtiene posiciones por categoría
   */
  async getPosicionesByCategoria(categoria: number, includeDeleted = false): Promise<GetPosicionesResponse> {
    return this.getPosiciones({ categoria, includeDeleted });
  }

  /**
   * Obtiene solo posiciones activas
   */
  async getPosicionesActivas(): Promise<GetPosicionesResponse> {
    return this.getPosiciones({ soloActivas: true });
  }

  /**
   * Verifica si una posición existe
   */
  async existePosicion(id: number): Promise<boolean> {
    try {
      await this.getPosicion(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el conteo total de posiciones
   */
  async getConteoTotalPosiciones(): Promise<number> {
    try {
      const response = await this.getEstadisticasPosiciones();
      return response.data['total'] || 0;
    } catch (error) {
      console.error('Error al obtener conteo de posiciones:', error);
      return 0;
    }
  }

  /**
   * Busca posiciones por nombre
   */
  async buscarPosicionesPorNombre(nombre: string): Promise<GetPosicionesResponse> {
    return this.buscarPosiciones({ searchTerm: nombre });
  }

  /**
   * Obtiene posiciones con paginación simple
   */
  async getPosicionesPaginadas(page = 1, size = 10): Promise<GetPosicionesPaginatedResponse> {
    return this.getPosicionesPaginated({ pageNumber: page, pageSize: size });
  }

  /**
   * Elimina una posición de forma segura (con validaciones)
   */
  async eliminarPosicionSegura(id: number, motivoEliminacion: string, eliminadoPor?: number): Promise<DeletePosicionResponse> {
    const command: DeletePosicionCommand = {
      posicionId: id,
      forceDelete: false,
      desactivarEnLugarDeEliminar: false,
      reasignarPersonas: true,
      validarDependencias: true,
      notificarPersonasAfectadas: true,
      eliminadoPor,
      motivoEliminacion
    };

    return this.deletePosicion(id, command);
  }

  /**
   * Desactiva una posición en lugar de eliminarla
   */
  async desactivarPosicionSegura(id: number, motivoEliminacion: string, eliminadoPor?: number): Promise<DeletePosicionResponse> {
    const command: DeletePosicionCommand = {
      posicionId: id,
      forceDelete: false,
      desactivarEnLugarDeEliminar: true,
      reasignarPersonas: false,
      validarDependencias: true,
      notificarPersonasAfectadas: true,
      eliminadoPor,
      motivoEliminacion
    };

    return this.deletePosicion(id, command);
  }
}

// Exportar instancia única del servicio
export const posicionesService = new PosicionesService();
export default posicionesService; 