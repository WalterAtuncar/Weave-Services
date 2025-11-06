// Tipos comunes compartidos entre diferentes servicios
// Evita duplicación de interfaces comunes

// ===== PAGINACIÓN Y ORDENAMIENTO =====
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface SortOptions {
  orderBy?: string;
  ascending?: boolean;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatorMetadata {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===== TIPOS DE DOCUMENTO =====
// TipoDocumento temporalmente removido para evitar conflictos

// ===== ESTADOS LABORALES =====
export enum EstadoLaboral {
  ACTIVO = 1,
  INACTIVO = 2,
  VACACIONES = 3,
  LICENCIA = 4,
  CESADO = 5
}

// ===== CATEGORÍAS DE POSICIÓN =====
// CategoriaPosicion movido a posiciones.types.ts para evitar duplicaciones