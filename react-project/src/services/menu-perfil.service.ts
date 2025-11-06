import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { 
  MenuPerfilDto,
  MenuPerfil,
  GetMenuPerfilesRequest,
  GetMenuPerfilesResponseData,
  GetMenuPerfilByIdRequest,
  GetMenuPerfilByIdResponseData,
  CreateMenuPerfilRequest,
  CreateMenuPerfilResponseData,
  UpdateMenuPerfilRequest,
  UpdateMenuPerfilResponseData,
  DeleteMenuPerfilRequest,
  DeleteMenuPerfilResponseData,
  GetMenuPerfilesPorMenuRequest,
  GetMenuPerfilesPorMenuResponseData,
  GetMenuPerfilesPorPerfilRequest,
  GetMenuPerfilesPorPerfilResponseData,
  AsignarMenusAPerfilRequest,
  AsignarMenusAPerfilResponseData,
  GetMenuPerfilesPaginatedRequest,
  MenuPerfilesPaginatedResponseData,
  TipoAcceso,
  AccesoInfo
} from './types/menu-perfil.types';

/**
 * Servicio para gestión de relaciones MenuPerfil
 * Implementa solo los endpoints necesarios para el componente Roles
 */
export class MenuPerfilService extends BaseApiService {
  
  constructor() {
    super();
  }

  // ===== MÉTODOS CRUD BÁSICOS =====

  /**
   * Obtiene todas las relaciones MenuPerfil
   */
  async getMenuPerfiles(includeDeleted: boolean = false): Promise<ApiResponse<GetMenuPerfilesResponseData>> {
    try {
      const response = await this.get<GetMenuPerfilesResponseData>('/MenuPerfiles');
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener MenuPerfiles:', error);
      
      const userFriendlyError: ApiResponse<GetMenuPerfilesResponseData> = {
        success: false,
        message: this.getMenuPerfilErrorMessage(error, 'obtener relaciones MenuPerfil'),
        data: [],
        errors: [this.getMenuPerfilErrorMessage(error, 'obtener relaciones MenuPerfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene una relación MenuPerfil por ID
   */
  async getMenuPerfilById(menuPerfilId: number, includeDeleted: boolean = false): Promise<ApiResponse<GetMenuPerfilByIdResponseData>> {
    try {
      if (!menuPerfilId || menuPerfilId <= 0) {
        return {
          success: false,
          message: 'ID de MenuPerfil inválido',
          data: {} as MenuPerfilDto,
          errors: ['ID de MenuPerfil inválido'],
          statusCode: 400,
          metadata: ''
        };
      }

      const response = await this.get<GetMenuPerfilByIdResponseData>(`/MenuPerfiles/${menuPerfilId}`);
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener MenuPerfil por ID:', error);
      
      const userFriendlyError: ApiResponse<GetMenuPerfilByIdResponseData> = {
        success: false,
        message: this.getMenuPerfilErrorMessage(error, 'obtener relación MenuPerfil'),
        data: {} as MenuPerfilDto,
        errors: [this.getMenuPerfilErrorMessage(error, 'obtener relación MenuPerfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Crea una nueva relación MenuPerfil
   */
  async createMenuPerfil(request: CreateMenuPerfilRequest): Promise<ApiResponse<CreateMenuPerfilResponseData>> {
    try {
      if (!request.menuId || !request.perfilId) {
        return {
          success: false,
          message: 'MenuId y PerfilId son requeridos',
          data: {} as MenuPerfilDto,
          errors: ['MenuId y PerfilId son requeridos'],
          statusCode: 400,
          metadata: ''
        };
      }

      const response = await this.post<CreateMenuPerfilResponseData>('/MenuPerfiles', request);
      
      return response;
    } catch (error: any) {
      console.error('Error al crear MenuPerfil:', error);
      
      const userFriendlyError: ApiResponse<CreateMenuPerfilResponseData> = {
        success: false,
        message: this.getMenuPerfilErrorMessage(error, 'crear relación MenuPerfil'),
        data: {} as MenuPerfilDto,
        errors: [this.getMenuPerfilErrorMessage(error, 'crear relación MenuPerfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Actualiza una relación MenuPerfil existente
   */
  async updateMenuPerfil(menuPerfilId: number, request: UpdateMenuPerfilRequest): Promise<ApiResponse<UpdateMenuPerfilResponseData>> {
    try {
      if (!menuPerfilId || menuPerfilId <= 0) {
        return {
          success: false,
          message: 'ID de MenuPerfil inválido',
          data: {} as MenuPerfilDto,
          errors: ['ID de MenuPerfil inválido'],
          statusCode: 400,
          metadata: ''
        };
      }

      const response = await this.put<UpdateMenuPerfilResponseData>(`/MenuPerfiles/${menuPerfilId}`, request);
      
      return response;
    } catch (error: any) {
      console.error('Error al actualizar MenuPerfil:', error);
      
      const userFriendlyError: ApiResponse<UpdateMenuPerfilResponseData> = {
        success: false,
        message: this.getMenuPerfilErrorMessage(error, 'actualizar relación MenuPerfil'),
        data: {} as MenuPerfilDto,
        errors: [this.getMenuPerfilErrorMessage(error, 'actualizar relación MenuPerfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Elimina una relación MenuPerfil (DELETE físico)
   */
  async deleteMenuPerfil(menuPerfilId: number): Promise<ApiResponse<DeleteMenuPerfilResponseData>> {
    try {
      if (!menuPerfilId || menuPerfilId <= 0) {
        return {
          success: false,
          message: 'ID de MenuPerfil inválido',
          data: { success: false, message: 'ID inválido' },
          errors: ['ID de MenuPerfil inválido'],
          statusCode: 400,
          metadata: ''
        };
      }

      await this.delete(`/MenuPerfiles/${menuPerfilId}`);

      return {
        success: true,
        message: 'Relación MenuPerfil eliminada correctamente',
        data: { success: true, message: 'Eliminado correctamente' },
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    } catch (error: any) {
      console.error('Error al eliminar MenuPerfil:', error);
      
      const userFriendlyError: ApiResponse<DeleteMenuPerfilResponseData> = {
        success: false,
        message: this.getMenuPerfilErrorMessage(error, 'eliminar relación MenuPerfil'),
        data: { success: false, message: 'Error al eliminar' },
        errors: [this.getMenuPerfilErrorMessage(error, 'eliminar relación MenuPerfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS PARA EL COMPONENTE ROLES =====

  /**
   * Obtiene todos los menús asignados a un perfil específico
   */
  async getMenusPorPerfil(perfilId: number): Promise<ApiResponse<GetMenuPerfilesPorPerfilResponseData>> {
    try {
      if (!perfilId || perfilId <= 0) {
        return {
          success: false,
          message: 'ID de perfil inválido',
          data: [],
          errors: ['ID de perfil inválido'],
          statusCode: 400,
          metadata: ''
        };
      }

      const response = await this.get<GetMenuPerfilesPorPerfilResponseData>(`/MenuPerfiles/perfil/${perfilId}/menus`);
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener menús por perfil:', error);
      
      const userFriendlyError: ApiResponse<GetMenuPerfilesPorPerfilResponseData> = {
        success: false,
        message: this.getMenuPerfilErrorMessage(error, 'obtener menús del perfil'),
        data: [],
        errors: [this.getMenuPerfilErrorMessage(error, 'obtener menús del perfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Asigna múltiples menús a un perfil (usado para drag & drop y asignación masiva)
   */
  async asignarMenusAPerfil(perfilId: number, request: AsignarMenusAPerfilRequest): Promise<ApiResponse<AsignarMenusAPerfilResponseData>> {
    try {
      if (!perfilId || perfilId <= 0) {
        return {
          success: false,
          message: 'ID de perfil inválido',
          data: { success: false, message: 'ID inválido', menuPerfilesCreados: [] },
          errors: ['ID de perfil inválido'],
          statusCode: 400,
          metadata: ''
        };
      }

      if (!request.menuIds || request.menuIds.length === 0) {
        return {
          success: false,
          message: 'Debe especificar al menos un menú',
          data: { success: false, message: 'Sin menús especificados', menuPerfilesCreados: [] },
          errors: ['Debe especificar al menos un menú'],
          statusCode: 400,
          metadata: ''
        };
      }

      const response = await this.post<AsignarMenusAPerfilResponseData>(`/MenuPerfiles/perfil/${perfilId}/asignar-menus`, request);
      
      return response;
    } catch (error: any) {
      console.error('Error al asignar menús a perfil:', error);
      
      const userFriendlyError: ApiResponse<AsignarMenusAPerfilResponseData> = {
        success: false,
        message: this.getMenuPerfilErrorMessage(error, 'asignar menús al perfil'),
        data: { success: false, message: 'Error en asignación', menuPerfilesCreados: [] },
        errors: [this.getMenuPerfilErrorMessage(error, 'asignar menús al perfil')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  // ===== MÉTODOS AUXILIARES PARA EL COMPONENTE =====

  /**
   * Obtiene información de tipos de acceso
   */
  getTiposAcceso(): AccesoInfo[] {
    return [
      {
        id: TipoAcceso.LECTURA,
        nombre: 'Lectura',
        descripcion: 'Solo lectura, sin permisos de modificación',
        color: '#f59e0b'
      },
      {
        id: TipoAcceso.RESTRINGIDO,
        nombre: 'Restringido',
        descripcion: 'Acceso restringido con limitaciones específicas',
        color: '#ef4444'
      },
      {
        id: TipoAcceso.CONTROL_TOTAL,
        nombre: 'Control Total',
        descripcion: 'Control total con permisos de lectura, escritura y eliminación',
        color: '#10b981'
      }
    ];
  }

  /**
   * Obtiene el color asociado a un tipo de acceso
   */
  getColorAcceso(accesoId: number): string {
    // 🎯 Manejar menús padre con accesoId = -1
    if (accesoId === -1) {
      return '#6b7280'; // Color gris para menús padre
    }
    
    const tipos = this.getTiposAcceso();
    const tipo = tipos.find(t => t.id === accesoId);
    return tipo?.color || '#6b7280';
  }

  /**
   * Obtiene el nombre de un tipo de acceso
   */
  getNombreAcceso(accesoId: number): string {
    // 🎯 Manejar menús padre con accesoId = -1
    if (accesoId === -1) {
      return 'Menú Padre';
    }
    
    const tipos = this.getTiposAcceso();
    const tipo = tipos.find(t => t.id === accesoId);
    return tipo?.nombre || 'Sin acceso';
  }

  // ===== MÉTODOS DE COMPATIBILIDAD CON CÓDIGO EXISTENTE =====

  /**
   * Convierte MenuPerfilDto a MenuPerfil para compatibilidad
   */
  convertMenuPerfilDtoToMenuPerfil(menuPerfilesDto: MenuPerfilDto[]): MenuPerfil[] {
    return menuPerfilesDto.map(dto => ({
      menuPerfilId: dto.menuPerfilId,
      menuId: dto.menuId,
      perfilId: dto.perfilId,
      accesoId: dto.accesoId || 1
    }));
  }

  /**
   * Convierte MenuPerfil a MenuPerfilDto
   */
  convertMenuPerfilToMenuPerfilDto(menuPerfiles: MenuPerfil[]): MenuPerfilDto[] {
    return menuPerfiles.map(mp => ({
      menuPerfilId: mp.menuPerfilId,
      menuId: mp.menuId,
      perfilId: mp.perfilId,
      accesoId: mp.accesoId,
      tituloMenu: null,
      rutaMenu: null,
      iconoMenu: null,
      esTituloGrupo: null,
      nombrePerfil: null,
      descripcionPerfil: null,
      tipoAcceso: this.getNombreAcceso(mp.accesoId),
      tipoAccesoCorto: this.getNombreAcceso(mp.accesoId).substring(0, 3),
      menuCompleto: null,
      perfilCompleto: null
    }));
  }

  // ===== MÉTODO AUXILIAR PARA MANEJO DE ERRORES =====

  /**
   * Obtiene mensaje de error específico para operaciones de MenuPerfil
   */
  private getMenuPerfilErrorMessage(error: any, operation: string): string {
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

    // Errores HTTP específicos para MenuPerfil
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return `Datos inválidos para ${operation}. Verifique la información ingresada.`;
        case 401:
          return `No autorizado para ${operation}.`;
        case 403:
          return `No tiene permisos para ${operation}.`;
        case 404:
          return operation.includes('obtener') ? 'Relación MenuPerfil no encontrada.' : `Relación no encontrada para ${operation}.`;
        case 409:
          return `Conflicto al ${operation}. La relación puede estar siendo usada por otro proceso.`;
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
export const menuPerfilService = new MenuPerfilService(); 