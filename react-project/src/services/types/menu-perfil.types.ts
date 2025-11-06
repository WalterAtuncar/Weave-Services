// ===== TIPOS BASE =====

export interface MenuPerfilDto {
  menuPerfilId: number;
  menuId: number;
  perfilId: number;
  accesoId: number | null;
  tituloMenu: string | null;
  rutaMenu: string | null;
  iconoMenu: string | null;
  esTituloGrupo: boolean | null;
  nombrePerfil: string | null;
  descripcionPerfil: string | null;
  tipoAcceso: string | null;
  tipoAccesoCorto: string | null;
  menuCompleto: string | null;
  perfilCompleto: string | null;
}

// ===== COMANDOS PARA CRUD =====

export interface CreateMenuPerfilCommand {
  menuId: number;
  perfilId: number;
  accesoId?: number | null;
}

export interface UpdateMenuPerfilCommand {
  menuPerfilId: number;
  menuId: number;
  perfilId: number;
  accesoId?: number | null;
}

export interface AsignarMenusAPerfilCommand {
  perfilId: number;
  menuIds: number[] | null;
  accesoId: number;
  reemplazarExistentes: boolean;
}

// ===== REQUESTS Y RESPONSES =====

export interface GetMenuPerfilesRequest {
  includeDeleted?: boolean;
}

export type GetMenuPerfilesResponseData = MenuPerfilDto[];

export interface GetMenuPerfilByIdRequest {
  menuPerfilId: number;
  includeDeleted?: boolean;
}

export type GetMenuPerfilByIdResponseData = MenuPerfilDto;

export interface CreateMenuPerfilRequest extends CreateMenuPerfilCommand {}

export type CreateMenuPerfilResponseData = MenuPerfilDto;

export interface UpdateMenuPerfilRequest extends UpdateMenuPerfilCommand {}

export type UpdateMenuPerfilResponseData = MenuPerfilDto;

export interface DeleteMenuPerfilRequest {
  menuPerfilId: number;
}

export interface DeleteMenuPerfilResponseData {
  success: boolean;
  message: string;
}

// ===== REQUESTS ESPECÍFICOS =====

export interface GetMenuPerfilesPorMenuRequest {
  menuId: number;
}

export type GetMenuPerfilesPorMenuResponseData = MenuPerfilDto[];

export interface GetMenuPerfilesPorPerfilRequest {
  perfilId: number;
}

export type GetMenuPerfilesPorPerfilResponseData = MenuPerfilDto[];

export interface AsignarMenusAPerfilRequest extends AsignarMenusAPerfilCommand {}

export interface AsignarMenusAPerfilResponseData {
  success: boolean;
  message: string;
  menuPerfilesCreados: MenuPerfilDto[];
}

// ===== PAGINACIÓN =====

export interface GetMenuPerfilesPaginatedRequest {
  menuIdFilter?: number;
  perfilIdFilter?: number;
  accesoIdFilter?: number;
  page?: number;
  pageSize?: number;
}

export interface MenuPerfilesPaginatedResponseData {
  data: MenuPerfilDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===== TIPOS DE ACCESO =====

export enum TipoAcceso {
  LECTURA = 1,
  RESTRINGIDO = 2,
  CONTROL_TOTAL = 3
}

export interface AccesoInfo {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
}

// ===== TIPOS AUXILIARES =====

export interface MenuPerfilFilters {
  menuId?: number;
  perfilId?: number;
  accesoId?: number;
}

// PaginationOptions movido a common.types.ts para evitar duplicaciones

// ===== TIPOS DE COMPATIBILIDAD CON CÓDIGO EXISTENTE =====

// Interfaz compatible con el modelo existente
export interface MenuPerfil {
  menuPerfilId: number;
  menuId: number;
  perfilId: number;
  accesoId: number;
}

// Para conversión de datos
export interface MenuPerfilConversionData {
  menuPerfiles: MenuPerfil[];
} 