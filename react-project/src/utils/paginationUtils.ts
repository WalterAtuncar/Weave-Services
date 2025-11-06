/**
 * Utilitario para procesar respuestas paginadas del backend
 * Maneja diferentes estructuras de respuesta de manera consistente
 */

export interface PaginationResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BackendPaginationData {
  data?: any[];
  items?: any[];
  pagination?: {
    data?: any[];
    totalRecords?: number;
    totalCount?: number;
    page?: number;
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
    hasPrevious?: boolean;
    hasNext?: boolean;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
  };
  totalRecords?: number;
  totalCount?: number;
  page?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

/**
 * Procesa una respuesta paginada del backend y la convierte a un formato estándar
 * @param backendData - Datos del backend con estructura variable
 * @param defaultPage - Página por defecto si no se especifica
 * @param defaultPageSize - Tamaño de página por defecto si no se especifica
 * @returns Objeto con estructura estándar de paginación
 */
export const processPaginatedResponse = <T>(
  backendData: BackendPaginationData,
  defaultPage: number = 1,
  defaultPageSize: number = 10
): PaginationResponse<T> => {
  // Extraer elementos de diferentes ubicaciones posibles
  let items: T[] = [];
  if (Array.isArray(backendData.data)) {
    items = backendData.data;
  } else if (Array.isArray(backendData.items)) {
    items = backendData.items;
  } else if (Array.isArray(backendData)) {
    items = backendData as T[];
  } else if (backendData.pagination && Array.isArray(backendData.pagination.data)) {
    items = (backendData.pagination as any).data;
  }

  // Extraer información de paginación
  const paginationInfo = backendData.pagination || backendData;
  const totalCount = paginationInfo.totalRecords || paginationInfo.totalCount || backendData.totalRecords || backendData.totalCount || items.length;
  const currentPageSize = paginationInfo.pageSize || backendData.pageSize || defaultPageSize;
  const currentPage = paginationInfo.page || paginationInfo.pageNumber || backendData.page || backendData.pageNumber || defaultPage;
  const totalPages = paginationInfo.totalPages || backendData.totalPages || Math.ceil(totalCount / currentPageSize);

  return {
    items: items || [],
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: paginationInfo.hasPrevious || paginationInfo.hasPreviousPage || backendData.hasPreviousPage || currentPage > 1,
    hasNextPage: paginationInfo.hasNext || paginationInfo.hasNextPage || backendData.hasNextPage || currentPage < totalPages
  };
};

/**
 * Crea un estado de paginación vacío como fallback
 * @param pageSize - Tamaño de página por defecto
 * @returns Estado de paginación vacío
 */
export const createEmptyPaginationState = <T>(pageSize: number = 10): PaginationResponse<T> => ({
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false
});

/**
 * Valida si una respuesta paginada tiene datos válidos
 * @param response - Respuesta paginada a validar
 * @returns true si la respuesta es válida
 */
export const isValidPaginatedResponse = <T>(response: PaginationResponse<T>): boolean => {
  return (
    response &&
    Array.isArray(response.items) &&
    typeof response.totalCount === 'number' &&
    typeof response.pageNumber === 'number' &&
    typeof response.pageSize === 'number' &&
    typeof response.totalPages === 'number' &&
    response.pageNumber > 0 &&
    response.pageSize > 0 &&
    response.totalCount >= 0 &&
    response.totalPages >= 0
  );
};

/**
 * EJEMPLO DE USO:
 * 
 * // En lugar de hacer esto manualmente en cada función:
 * const totalCount = backendData.totalRecords || backendData.totalCount || items.length;
 * const currentPageSize = backendData.pageSize || pageSize;
 * // ... más código repetitivo
 * 
 * // Usar el utilitario:
 * const paginatedData = processPaginatedResponse<MiTipoDto>(backendData, page, pageSize);
 * 
 * // Fallback en caso de error:
 * const emptyState = createEmptyPaginationState<MiTipoDto>(pageSize);
 * 
 * // Validación:
 * if (isValidPaginatedResponse(paginatedData)) {
 *   setState(paginatedData);
 * } else {
 *   setState(emptyState);
 * }
 */ 