import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { 
  Perfil,
  GetPerfilesResponseData,
  GetPerfilesDtoResponseData,
  GetPerfilDtoByIdResponseData,
  CreatePerfilRequest,
  CreatePerfilResponseData,
  UpdatePerfilRequest,
  UpdatePerfilResponseData,
  DeletePerfilResponseData,
  BuscarPerfilesResponseData,
  GetPerfilPorNombreResponseData,
  GetEstadisticasPerfilesResponseData,
  GetPerfilesPaginatedRequest,
  PerfilesPaginatedResponseData,
  GetPerfilesActivosResponseData,
  GetPerfilesSinMenusResponseData,
  GetPerfilesSinUsuariosResponseData} from './types/perfil.types';

/**
 * Servicio para gestión de perfiles
 * Implementa todos los endpoints CRUD del controlador Perfiles
 */
export class PerfilService extends BaseApiService {

  constructor() {
    super();
  }

  // ===== MÉTODOS CRUD PRINCIPALES =====

  /**
   * Obtiene todos los perfiles
   * GET /api/Perfiles
   */
  async getPerfiles(includeDeleted: boolean = false): Promise<ApiResponse<GetPerfilesDtoResponseData>> {
    try {
      const params = new URLSearchParams();
      if (includeDeleted) {
        params.append('includeDeleted', 'true');
      }

      const response = await this.get<GetPerfilesDtoResponseData>(
        `/Perfiles${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener perfiles:', error);
      
      const userFriendlyError: ApiResponse<GetPerfilesDtoResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfiles'),
        data: [] as GetPerfilesDtoResponseData,
        errors: [this.getPerfilErrorMessage(error, 'obtener perfiles')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene un perfil por ID
   * GET /api/Perfiles/{id}
   */
  async getPerfilById(perfilId: number, includeDeleted: boolean = false): Promise<ApiResponse<GetPerfilDtoByIdResponseData>> {
    try {
      const params = new URLSearchParams();
      if (includeDeleted) {
        params.append('includeDeleted', 'true');
      }

      const response = await this.get<GetPerfilDtoByIdResponseData>(
        `/Perfiles/${perfilId}${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener perfil por ID:', error);
      
      const userFriendlyError: ApiResponse<GetPerfilDtoByIdResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfil'),
        data: null as any,
        errors: [this.getPerfilErrorMessage(error, 'obtener perfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene información completa de un perfil por ID
   * GET /api/Perfiles/{id}/completo
   */
  async getPerfilCompleto(perfilId: number): Promise<ApiResponse<GetPerfilDtoByIdResponseData>> {
    try {
      const response = await this.get<GetPerfilDtoByIdResponseData>(`/Perfiles/${perfilId}/completo`);
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener perfil completo:', error);
      
      const userFriendlyError: ApiResponse<GetPerfilDtoByIdResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfil completo'),
        data: null as any,
        errors: [this.getPerfilErrorMessage(error, 'obtener perfil completo')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Crea un nuevo perfil
   * POST /api/Perfiles
   */
  async createPerfil(request: CreatePerfilRequest): Promise<ApiResponse<CreatePerfilResponseData>> {
    try {
      const response = await this.post<CreatePerfilResponseData>('/Perfiles', request);
      
      return response;
    } catch (error: any) {
      console.error('Error al crear perfil:', error);
      
      const userFriendlyError: ApiResponse<CreatePerfilResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'crear perfil'),
        data: 0,
        errors: [this.getPerfilErrorMessage(error, 'crear perfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Actualiza un perfil existente
   * PUT /api/Perfiles/{id}
   */
  async updatePerfil(perfilId: number, request: UpdatePerfilRequest): Promise<ApiResponse<UpdatePerfilResponseData>> {
    try {
      // Asegurar que el ID del perfil coincida
      const updateRequest = { ...request, perfilId };
      
      const response = await this.put<UpdatePerfilResponseData>(`/Perfiles/${perfilId}`, updateRequest);
      
      return response;
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      
      const userFriendlyError: ApiResponse<UpdatePerfilResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'actualizar perfil'),
        data: false,
        errors: [this.getPerfilErrorMessage(error, 'actualizar perfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Elimina un perfil (soft delete)
   * DELETE /api/Perfiles/{id}
   */
  async deletePerfil(perfilId: number): Promise<ApiResponse<DeletePerfilResponseData>> {
    try {
      const response = await this.delete<DeletePerfilResponseData>(`/Perfiles/${perfilId}`);
      
      return response;
    } catch (error: any) {
      console.error('Error al eliminar perfil:', error);
      
      const userFriendlyError: ApiResponse<DeletePerfilResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'eliminar perfil'),
        data: false,
        errors: [this.getPerfilErrorMessage(error, 'eliminar perfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  // ===== MÉTODOS DE BÚSQUEDA Y FILTRADO =====

  /**
   * Obtiene solo perfiles activos
   * GET /api/Perfiles/activos
   */
  async getPerfilesActivos(): Promise<ApiResponse<GetPerfilesActivosResponseData>> {
    try {
      const response = await this.get<GetPerfilesActivosResponseData>('/Perfiles/activos');
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener perfiles activos:', error);
      
      const userFriendlyError: ApiResponse<GetPerfilesActivosResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfiles activos'),
        data: [] as GetPerfilesActivosResponseData,
        errors: [this.getPerfilErrorMessage(error, 'obtener perfiles activos')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Busca perfiles por nombre parcial
   * GET /api/Perfiles/buscar/{nombre}
   */
  async buscarPerfilesPorNombre(nombre: string): Promise<ApiResponse<BuscarPerfilesResponseData>> {
    try {
      const response = await this.get<BuscarPerfilesResponseData>(`/Perfiles/buscar/${encodeURIComponent(nombre)}`);
      
      return response;
    } catch (error: any) {
      console.error('Error al buscar perfiles por nombre:', error);
      
      const userFriendlyError: ApiResponse<BuscarPerfilesResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'buscar perfiles'),
        data: [] as BuscarPerfilesResponseData,
        errors: [this.getPerfilErrorMessage(error, 'buscar perfiles')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene un perfil por su nombre
   * GET /api/Perfiles/by-nombre/{nombre}
   */
  async getPerfilPorNombre(nombre: string): Promise<ApiResponse<GetPerfilPorNombreResponseData>> {
    try {
      const response = await this.get<GetPerfilPorNombreResponseData>(`/Perfiles/by-nombre/${encodeURIComponent(nombre)}`);
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener perfil por nombre:', error);
      
      const userFriendlyError: ApiResponse<GetPerfilPorNombreResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfil por nombre'),
        data: null as any,
        errors: [this.getPerfilErrorMessage(error, 'obtener perfil por nombre')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene perfiles sin menús asignados
   * GET /api/Perfiles/sin-menus
   */
  async getPerfilesSinMenus(): Promise<ApiResponse<GetPerfilesSinMenusResponseData>> {
    try {
      const response = await this.get<GetPerfilesSinMenusResponseData>('/Perfiles/sin-menus');
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener perfiles sin menús:', error);
      
      const userFriendlyError: ApiResponse<GetPerfilesSinMenusResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfiles sin menús'),
        data: [] as GetPerfilesSinMenusResponseData,
        errors: [this.getPerfilErrorMessage(error, 'obtener perfiles sin menús')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene perfiles sin usuarios asignados
   * GET /api/Perfiles/sin-usuarios
   */
  async getPerfilesSinUsuarios(): Promise<ApiResponse<GetPerfilesSinUsuariosResponseData>> {
    try {
      const response = await this.get<GetPerfilesSinUsuariosResponseData>('/Perfiles/sin-usuarios');
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener perfiles sin usuarios:', error);
      
      const userFriendlyError: ApiResponse<GetPerfilesSinUsuariosResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfiles sin usuarios'),
        data: [] as GetPerfilesSinUsuariosResponseData,
        errors: [this.getPerfilErrorMessage(error, 'obtener perfiles sin usuarios')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  // ===== MÉTODOS DE ESTADÍSTICAS Y PAGINACIÓN =====

  /**
   * Obtiene estadísticas generales de perfiles
   * GET /api/Perfiles/estadisticas
   */
  async getEstadisticasPerfiles(): Promise<ApiResponse<GetEstadisticasPerfilesResponseData>> {
    try {
      const response = await this.get<GetEstadisticasPerfilesResponseData>('/Perfiles/estadisticas');
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener estadísticas de perfiles:', error);
      
      const userFriendlyError: ApiResponse<GetEstadisticasPerfilesResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener estadísticas'),
        data: {} as GetEstadisticasPerfilesResponseData,
        errors: [this.getPerfilErrorMessage(error, 'obtener estadísticas')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene perfiles con paginación y filtros avanzados
   * GET /api/Perfiles/paginated
   */
  async getPerfilesPaginated(request: GetPerfilesPaginatedRequest): Promise<ApiResponse<PerfilesPaginatedResponseData>> {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros
      if (request.nombrePerfil) params.append('NombrePerfil', request.nombrePerfil);
      if (request.descripcion) params.append('Descripcion', request.descripcion);
      if (request.estado !== undefined) params.append('Estado', request.estado.toString());
      if (request.tieneUsuarios !== undefined) params.append('TieneUsuarios', request.tieneUsuarios.toString());
      if (request.tieneMenus !== undefined) params.append('TieneMenus', request.tieneMenus.toString());
      if (request.fechaCreacionDesde) params.append('FechaCreacionDesde', request.fechaCreacionDesde);
      if (request.fechaCreacionHasta) params.append('FechaCreacionHasta', request.fechaCreacionHasta);
      if (request.fechaActualizacionDesde) params.append('FechaActualizacionDesde', request.fechaActualizacionDesde);
      if (request.fechaActualizacionHasta) params.append('FechaActualizacionHasta', request.fechaActualizacionHasta);
      if (request.creadoPor !== undefined) params.append('CreadoPor', request.creadoPor.toString());
      if (request.actualizadoPor !== undefined) params.append('ActualizadoPor', request.actualizadoPor.toString());
      if (request.includeDeleted !== undefined) params.append('IncludeDeleted', request.includeDeleted.toString());
      if (request.orderBy) params.append('OrderBy', request.orderBy);
      if (request.ascending !== undefined) params.append('Ascending', request.ascending.toString());
      
      // Agregar paginación
      if (request.page !== undefined) params.append('Page', request.page.toString());
      if (request.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
      if (request.skip !== undefined) params.append('Skip', request.skip.toString());
      if (request.take !== undefined) params.append('Take', request.take.toString());

      const response = await this.get<PerfilesPaginatedResponseData>(
        `/Perfiles/paginated?${params.toString()}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener perfiles paginados:', error);
      
      const userFriendlyError: ApiResponse<PerfilesPaginatedResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfiles paginados'),
        data: {
          data: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        },
        errors: [this.getPerfilErrorMessage(error, 'obtener perfiles paginados')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  // ===== MÉTODOS DE COMPATIBILIDAD =====

  /**
   * Método de compatibilidad para obtener perfiles básicos
   * Mantiene compatibilidad con código existente
   */
  async getPerfilesBasicos(includeDeleted: boolean = false): Promise<ApiResponse<GetPerfilesResponseData>> {
    try {
      const response = await this.getPerfiles(includeDeleted);
      
      if (response.success && response.data) {
        // Convertir PerfilDto a Perfil básico
        const perfilesBasicos: Perfil[] = response.data.map(perfil => ({
          perfilId: perfil.perfilId,
          nombrePerfil: perfil.nombrePerfil,
          descripcion: perfil.descripcion || undefined,
          registroEliminado: perfil.registroEliminado,
          estado: perfil.estado
        }));

        return {
          ...response,
          data: perfilesBasicos
        };
      }

      return {
        ...response,
        data: [] as GetPerfilesResponseData
      };
    } catch (error: any) {
      console.error('Error al obtener perfiles básicos:', error);
      
      const userFriendlyError: ApiResponse<GetPerfilesResponseData> = {
        success: false,
        message: this.getPerfilErrorMessage(error, 'obtener perfiles básicos'),
        data: [] as GetPerfilesResponseData,
        errors: [this.getPerfilErrorMessage(error, 'obtener perfiles básicos')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Obtiene mensaje de error específico para operaciones de perfil
   */
  private getPerfilErrorMessage(error: any, operation: string): string {
    // Si el error tiene un mensaje personalizado del interceptor
    if (error.userMessage) {
      return error.userMessage;
    }

    // Errores de red/CORS
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return 'Error de conexión. Verifique su conexión a internet.';
    }

    // CORS o servidor no disponible
    if (error.response?.status === 0 || !error.response) {
      return 'No se pudo conectar con el servidor. Contacte al administrador.';
    }

    // Error del servidor con mensaje específico
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Errores HTTP específicos para perfiles
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return `Datos inválidos para ${operation}. Verifique la información ingresada.`;
        case 401:
          return `No autorizado para ${operation}.`;
        case 403:
          return `No tiene permisos para ${operation}.`;
        case 404:
          return operation.includes('obtener') ? 'Perfil no encontrado.' : `Perfil no encontrado para ${operation}.`;
        case 409:
          return `Conflicto al ${operation}. El perfil puede estar siendo usado por otro proceso.`;
        case 422:
          return `Error de validación al ${operation}. Verifique los datos ingresados.`;
        case 500:
          return `Error interno del servidor al ${operation}. Intente más tarde.`;
        case 502:
        case 503:
          return `Servicio no disponible para ${operation}. Intente más tarde.`;
        default:
          return `Error al ${operation} (${error.response.status}). Intente nuevamente.`;
      }
    }

    // Error genérico
    return `Error inesperado al ${operation}. Intente nuevamente.`;
  }
}

// Exportar instancia singleton
export const perfilService = new PerfilService(); 