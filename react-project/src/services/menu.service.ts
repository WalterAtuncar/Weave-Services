import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { MenuItem } from './types/auth.types';
import { 
  MenuDto,
  GetMenusResponseData,
  GetMenusHierarchyResponseData,
  GetMenuByIdResponseData,
  CreateMenuRequest,
  CreateMenuResponseData,
  UpdateMenuRequest,
  UpdateMenuResponseData,
  DeleteMenuResponseData,
  GetMenusPaginatedRequest,
  MenusPaginatedResponseData,
  MenuType
} from './types/menu.types';

/**
 * Servicio para gestión de menús
 * Implementa todos los endpoints CRUD del controlador Menus
 */
export class MenuService extends BaseApiService {
  private readonly USER_STORAGE_KEY = 'userSession';

  constructor() {
    super();
  }

  // ===== MÉTODOS CRUD PRINCIPALES =====

  /**
   * Obtiene todos los menús
   * GET /api/Menus
   */
  async getMenus(includeDeleted: boolean = false): Promise<ApiResponse<GetMenusResponseData>> {
    try {
      const params = new URLSearchParams();
      if (includeDeleted) {
        params.append('includeDeleted', 'true');
      }

      const response = await this.get<GetMenusResponseData>(
        `/Menus${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener menús:', error);
      
      const userFriendlyError: ApiResponse<GetMenusResponseData> = {
        success: false,
        message: this.getMenuErrorMessage(error, 'obtener menús'),
        data: [] as GetMenusResponseData,
        errors: [this.getMenuErrorMessage(error, 'obtener menús')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene la jerarquía de menús (padres con hijos)
   * GET /api/Menus/hierarchy
   */
  async getMenusHierarchy(includeDeleted: boolean = false, onlyRootMenus: boolean = false): Promise<ApiResponse<GetMenusHierarchyResponseData>> {
    try {
      const params = new URLSearchParams();
      if (includeDeleted) {
        params.append('includeDeleted', 'true');
      }
      if (onlyRootMenus) {
        params.append('onlyRootMenus', 'true');
      }

      const response = await this.get<GetMenusHierarchyResponseData>(
        `/Menus/hierarchy${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener jerarquía de menús:', error);
      
      const userFriendlyError: ApiResponse<GetMenusHierarchyResponseData> = {
        success: false,
        message: this.getMenuErrorMessage(error, 'obtener jerarquía de menús'),
        data: [] as GetMenusHierarchyResponseData,
        errors: [this.getMenuErrorMessage(error, 'obtener jerarquía de menús')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene un menú por ID
   * GET /api/Menus/{id}
   */
  async getMenuById(menuId: number, includeDeleted: boolean = false): Promise<ApiResponse<GetMenuByIdResponseData>> {
    try {
      const params = new URLSearchParams();
      if (includeDeleted) {
        params.append('includeDeleted', 'true');
      }

      const response = await this.get<GetMenuByIdResponseData>(
        `/Menus/${menuId}${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener menú por ID:', error);
      
      const userFriendlyError: ApiResponse<GetMenuByIdResponseData> = {
        success: false,
        message: this.getMenuErrorMessage(error, 'obtener menú'),
        data: null as any,
        errors: [this.getMenuErrorMessage(error, 'obtener menú')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Crea un nuevo menú
   * POST /api/Menus
   */
  async createMenu(request: CreateMenuRequest): Promise<ApiResponse<CreateMenuResponseData>> {
    try {
      const response = await this.post<CreateMenuResponseData>('/Menus', request);
      
      return response;
    } catch (error: any) {
      console.error('Error al crear menú:', error);
      
      const userFriendlyError: ApiResponse<CreateMenuResponseData> = {
        success: false,
        message: this.getMenuErrorMessage(error, 'crear menú'),
        data: 0,
        errors: [this.getMenuErrorMessage(error, 'crear menú')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Actualiza un menú existente
   * PUT /api/Menus/{id}
   */
  async updateMenu(menuId: number, request: UpdateMenuRequest): Promise<ApiResponse<UpdateMenuResponseData>> {
    try {
      // Asegurar que el ID del menú coincida
      const updateRequest = { ...request, menuId };
      
      const response = await this.put<UpdateMenuResponseData>(`/Menus/${menuId}`, updateRequest);
      
      return response;
    } catch (error: any) {
      console.error('Error al actualizar menú:', error);
      
      const userFriendlyError: ApiResponse<UpdateMenuResponseData> = {
        success: false,
        message: this.getMenuErrorMessage(error, 'actualizar menú'),
        data: false,
        errors: [this.getMenuErrorMessage(error, 'actualizar menú')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Elimina un menú (soft delete)
   * DELETE /api/Menus/{id}
   */
  async deleteMenu(menuId: number): Promise<ApiResponse<DeleteMenuResponseData>> {
    try {
      const response = await this.delete<DeleteMenuResponseData>(`/Menus/${menuId}`);
      
      return response;
    } catch (error: any) {
      console.error('Error al eliminar menú:', error);
      
      const userFriendlyError: ApiResponse<DeleteMenuResponseData> = {
        success: false,
        message: this.getMenuErrorMessage(error, 'eliminar menú'),
        data: false,
        errors: [this.getMenuErrorMessage(error, 'eliminar menú')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene menús paginados con filtros
   * GET /api/Menus/paginated
   */
  async getMenusPaginated(request: GetMenusPaginatedRequest): Promise<ApiResponse<MenusPaginatedResponseData>> {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros
      if (request.tituloFilter) params.append('TituloFilter', request.tituloFilter);
      if (request.rutaFilter) params.append('RutaFilter', request.rutaFilter);
      if (request.menuPadreIdFilter !== undefined) params.append('MenuPadreIdFilter', request.menuPadreIdFilter.toString());
      if (request.esTituloGrupoFilter !== undefined) params.append('EsTituloGrupoFilter', request.esTituloGrupoFilter.toString());
      if (request.includeDeleted !== undefined) params.append('IncludeDeleted', request.includeDeleted.toString());
      
      // Agregar paginación
      if (request.page !== undefined) params.append('Page', request.page.toString());
      if (request.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
      if (request.skip !== undefined) params.append('Skip', request.skip.toString());
      if (request.take !== undefined) params.append('Take', request.take.toString());

      const response = await this.get<MenusPaginatedResponseData>(
        `/Menus/paginated?${params.toString()}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al obtener menús paginados:', error);
      
      const userFriendlyError: ApiResponse<MenusPaginatedResponseData> = {
        success: false,
        message: this.getMenuErrorMessage(error, 'obtener menús paginados'),
        data: {
          data: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        },
        errors: [this.getMenuErrorMessage(error, 'obtener menús paginados')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  // ===== MÉTODOS DE COMPATIBILIDAD CON CÓDIGO EXISTENTE =====

  /**
   * Obtiene menús desde localStorage (compatibilidad)
   */
  getMenusFromStorage(): MenuItem[] {
    try {
      const sessionData = localStorage.getItem(this.USER_STORAGE_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session.menu || [];
      }
      return [];
    } catch (error) {
      console.error('Error al obtener menús desde localStorage:', error);
      return [];
    }
  }

  /**
   * Construye jerarquía de menús desde localStorage (compatibilidad)
   */
  getMenusHierarchyFromStorage(): MenuItem[] {
    // Los menús en localStorage ya vienen con jerarquía construida desde el login
    // No necesitamos reconstruir la jerarquía
    return this.getMenusFromStorage();
  }

  /**
   * Obtiene menús por tipo desde localStorage (compatibilidad)
   */
  getMenusByTypeFromStorage(type: MenuType = 'todos'): MenuItem[] {
    const menus = this.getMenusFromStorage();
    
    switch (type) {
      case 'grupos':
        return menus.filter(menu => menu.esTituloGrupo === true);
      case 'navegacion':
        return menus.filter(menu => menu.esTituloGrupo === false);
      case 'todos':
      default:
        return menus;
    }
  }

  /**
   * Verifica si hay menús en localStorage (compatibilidad)
   */
  hasMenusInStorage(): boolean {
    const menus = this.getMenusFromStorage();
    return menus.length > 0;
  }

  /**
   * Obtiene menús con fallback a localStorage (compatibilidad)
   */
  async getMenusWithFallback(includeDeleted: boolean = false): Promise<MenuItem[]> {
    try {
      // Intentar obtener desde API
      const response = await this.getMenus(includeDeleted);
      
      if (response.success && response.data) {
        // Convertir MenuDto a MenuItem para compatibilidad
        return this.convertMenuDtoToMenuItem(response.data);
      }
      
      // Fallback a localStorage
      return this.getMenusFromStorage();
    } catch (error) {
      console.error('Error al obtener menús, usando fallback:', error);
      return this.getMenusFromStorage();
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Construye jerarquía de MenuItem (compatibilidad)
   */
  private buildMenuItemHierarchy(menus: MenuItem[]): MenuItem[] {
    const menuMap = new Map<number, MenuItem>();
    const rootMenus: MenuItem[] = [];

    // Crear mapa de menús
    menus.forEach(menu => {
      menuMap.set(menu.menuId, { ...menu, menusHijos: [] });
    });

    // Construir jerarquía
    menus.forEach(menu => {
      const menuItem = menuMap.get(menu.menuId);
      if (menuItem) {
        if (menu.menuPadreId === null) {
          rootMenus.push(menuItem);
        } else {
          const parent = menuMap.get(menu.menuPadreId);
          if (parent) {
            parent.menusHijos.push(menuItem);
          }
        }
      }
    });

    return rootMenus;
  }

  /**
   * Convierte MenuDto a MenuItem (compatibilidad)
   */
  private convertMenuDtoToMenuItem(menus: MenuDto[]): MenuItem[] {
    return menus.map(menu => ({
      menuId: menu.menuId,
      menuPadreId: menu.menuPadreId,
      titulo: menu.titulo || '',
      ruta: menu.ruta,
      tipoIcono: menu.tipoIcono || '',
      icono: menu.icono || '',
      clase: menu.clase || '',
      esTituloGrupo: menu.esTituloGrupo || false,
      badge: menu.badge,
      badgeClase: menu.badgeClase,
      menusHijos: menu.menusHijos ? this.convertMenuDtoToMenuItem(menu.menusHijos) : [],
      tituloMenuPadre: menu.tituloMenuPadre
    }));
  }

  /**
   * Obtiene mensaje de error específico para operaciones de menú
   */
  private getMenuErrorMessage(error: any, operation: string): string {
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

    // Errores HTTP específicos para menús
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return `Datos inválidos para ${operation}. Verifique la información ingresada.`;
        case 401:
          return `No autorizado para ${operation}.`;
        case 403:
          return `No tiene permisos para ${operation}.`;
        case 404:
          return operation.includes('obtener') ? 'Menú no encontrado.' : `Menú no encontrado para ${operation}.`;
        case 409:
          return `Conflicto al ${operation}. El menú puede estar siendo usado por otro proceso.`;
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
export const menuService = new MenuService(); 