/**
 * Interfaces para el servicio de menús
 * Basado en el swagger API del backend
 */

// ===== ENTIDADES PRINCIPALES =====

// Menu DTO del backend
export interface MenuDto {
  menuId: number;
  menuPadreId: number | null;
  titulo: string;
  ruta: string | null;
  tipoIcono: string | null;
  icono: string | null;
  clase: string | null;
  esTituloGrupo: boolean | null;
  badge: string | null;
  badgeClase: string | null;
  menusHijos: MenuDto[];
  tituloMenuPadre: string | null;
}

// Menu para compatibilidad con código existente
export interface Menu {
  menuId: number;
  menuPadreId: number | null;
  titulo: string;
  ruta: string | null;
  tipoIcono: string;
  icono: string;
  clase: string;
  esTituloGrupo: boolean;
  badge: string | null;
  badgeClase: string | null;
  menusHijos: Menu[];
  tituloMenuPadre: string | null;
}

// ===== REQUESTS =====

// Request para obtener menús
export interface GetMenusRequest {
  includeDeleted?: boolean;
}

// Request para obtener jerarquía de menús
export interface GetMenusHierarchyRequest {
  includeDeleted?: boolean;
  onlyRootMenus?: boolean;
}

// Request para obtener menú por ID
export interface GetMenuByIdRequest {
  menuId: number;
}

// Request para crear menú
export interface CreateMenuRequest {
  menuPadreId?: number | null;
  titulo: string;
  ruta?: string | null;
  tipoIcono?: string | null;
  icono?: string | null;
  clase?: string | null;
  esTituloGrupo?: boolean | null;
  badge?: string | null;
  badgeClase?: string | null;
}

// Request para actualizar menú
export interface UpdateMenuRequest {
  menuId: number;
  menuPadreId?: number | null;
  titulo: string;
  ruta?: string | null;
  tipoIcono?: string | null;
  icono?: string | null;
  clase?: string | null;
  esTituloGrupo?: boolean | null;
  badge?: string | null;
  badgeClase?: string | null;
}

// Request para eliminar menú
export interface DeleteMenuRequest {
  menuId: number;
}

// Request para menús paginados
export interface GetMenusPaginatedRequest {
  tituloFilter?: string;
  rutaFilter?: string;
  menuPadreIdFilter?: number;
  esTituloGrupoFilter?: boolean;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

// ===== RESPONSES =====

// Response para obtener menús
export type GetMenusResponseData = MenuDto[];

// Response para obtener jerarquía de menús
export type GetMenusHierarchyResponseData = MenuDto[];

// Response para obtener menú por ID
export type GetMenuByIdResponseData = MenuDto;

// Response para crear menú
export type CreateMenuResponseData = number; // ID del menú creado

// Response para actualizar menú
export type UpdateMenuResponseData = boolean;

// Response para eliminar menú
export type DeleteMenuResponseData = boolean;

// Response para menús paginados
export interface MenusPaginatedResponseData {
  data: MenuDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===== TIPOS AUXILIARES =====

// Filtros para búsqueda de menús
export interface MenuFilters {
  titulo?: string;
  ruta?: string;
  menuPadreId?: number;
  esTituloGrupo?: boolean;
  includeDeleted?: boolean;
}

// PaginationOptions movido a common.types.ts para evitar duplicaciones

// Tipos para construcción de jerarquía
export interface MenuHierarchyOptions {
  includeDeleted?: boolean;
  onlyRootMenus?: boolean;
}

// Tipos de menú
export type MenuType = 'grupos' | 'navegacion' | 'todos'; 