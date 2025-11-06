/**
 * Interfaz genérica para las respuestas del backend
 * Mapea la estructura estándar de respuesta del API C#
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  statusCode: number;
  metadata: string;
}

/**
 * Tipo para respuestas exitosas con datos tipados
 */
export type ApiSuccessResponse<T> = ApiResponse<T> & {
  success: true;
};

/**
 * Tipo para respuestas con error
 */
export type ApiErrorResponse = ApiResponse<null> & {
  success: false;
  errors: string[];
};

/**
 * Tipo utilitario para extraer el tipo de datos de una respuesta API
 */
export type ApiResponseData<T> = T extends ApiResponse<infer U> ? U : never; 