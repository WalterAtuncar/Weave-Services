import { AlertService } from '../components/ui/alerts/AlertService';

/**
 * Interfaz para errores estructurados
 */
export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
  operation?: string;
}

/**
 * Clase para manejo centralizado de errores
 */
export class ErrorHandler {
  /**
   * Maneja errores de servicios y muestra alertas apropiadas
   * @param error - Error capturado
   * @param operation - Descripción de la operación que falló
   * @param showAlert - Si debe mostrar una alerta al usuario (default: true)
   * @returns Información estructurada del error
   */
  static async handleServiceError(
    error: any, 
    operation: string, 
    showAlert: boolean = true
  ): Promise<ErrorInfo> {
    const errorInfo = this.extractErrorInfo(error, operation);
    
    // Log detallado para debugging
    console.error(`❌ [ERROR] ${operation}:`, {
      message: errorInfo.message,
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      details: errorInfo.details,
      originalError: error
    });

    // Mostrar alerta al usuario si está habilitado
    if (showAlert) {
      await AlertService.error(errorInfo.message, {
        title: `Error en ${operation}`
      });
    }

    return errorInfo;
  }

  /**
   * Extrae información estructurada del error
   */
  private static extractErrorInfo(error: any, operation: string): ErrorInfo {
    // Si el error tiene un mensaje personalizado del interceptor
    if (error.userMessage) {
      return {
        message: error.userMessage,
        code: error.code,
        statusCode: error.response?.status,
        details: error.response?.data,
        operation
      };
    }

    // Errores de red/CORS
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return {
        message: 'Error de conexión. Verifique su conexión a internet.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
        details: error.message,
        operation
      };
    }

    // Timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'Tiempo de espera agotado. Intente nuevamente.',
        code: 'TIMEOUT_ERROR',
        statusCode: 0,
        details: error.message,
        operation
      };
    }

    // CORS o servidor no disponible
    if (error.response?.status === 0 || !error.response) {
      return {
        message: 'No se pudo conectar con el servidor. Contacte al administrador.',
        code: 'SERVER_UNAVAILABLE',
        statusCode: 0,
        details: error.message,
        operation
      };
    }

    // Error del servidor con mensaje específico
    if (error.response?.data?.message) {
      return {
        message: error.response.data.message,
        code: error.response.data.code || 'SERVER_ERROR',
        statusCode: error.response.status,
        details: error.response.data,
        operation
      };
    }

    // Error del servidor con errores múltiples - usar el primer error
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const errorMessage = error.response.data.errors[0] || 'Error de validación';
      return {
        message: errorMessage,
        code: 'VALIDATION_ERROR',
        statusCode: error.response.status,
        details: error.response.data,
        operation
      };
    }

    // Errores HTTP estándar
    if (error.response?.status) {
      return {
        message: this.getHttpErrorMessage(error.response.status, operation),
        code: `HTTP_${error.response.status}`,
        statusCode: error.response.status,
        details: error.response.data,
        operation
      };
    }

    // Error genérico
    return {
      message: `Error inesperado en ${operation}. Intente nuevamente.`,
      code: 'UNKNOWN_ERROR',
      statusCode: 0,
      details: error.message || error,
      operation
    };
  }

  /**
   * Obtiene mensaje de error basado en código HTTP
   */
  private static getHttpErrorMessage(statusCode: number, operation: string): string {
    switch (statusCode) {
      case 400:
        return `Datos inválidos para ${operation}. Verifique la información ingresada.`;
      case 401:
        return `No autorizado para ${operation}. Inicie sesión nuevamente.`;
      case 403:
        return `No tiene permisos para ${operation}.`;
      case 404:
        return operation.includes('obtener') || operation.includes('cargar') 
          ? 'Registro no encontrado.' 
          : `Registro no encontrado para ${operation}.`;
      case 409:
        return `Conflicto al ${operation}. El registro puede estar siendo usado por otro proceso.`;
      case 422:
        return `Error de validación al ${operation}. Verifique los datos ingresados.`;
      case 429:
        return `Demasiadas solicitudes. Espere unos momentos antes de ${operation} nuevamente.`;
      case 500:
        return `Error interno del servidor al ${operation}. Intente más tarde.`;
      case 502:
      case 503:
        return `Servicio no disponible para ${operation}. Intente más tarde.`;
      case 504:
        return `Tiempo de espera agotado al ${operation}. Intente nuevamente.`;
      default:
        return `Error del servidor (${statusCode}) al ${operation}. Intente nuevamente.`;
    }
  }



  /**
   * Maneja errores específicos de validación
   */
  static async handleValidationError(
    errors: string[] | string, 
    operation: string, 
    showAlert: boolean = true
  ): Promise<void> {
    const errorMessage = Array.isArray(errors) 
      ? errors.join('; ') 
      : errors;

    console.error(`❌ [VALIDATION] ${operation}:`, errorMessage);

    if (showAlert) {
      await AlertService.error(errorMessage, {
        title: `Error de validación en ${operation}`
      });
    }
  }

  /**
   * Maneja errores de autenticación
   */
  static async handleAuthError(
    error: any, 
    operation: string, 
    showAlert: boolean = true
  ): Promise<void> {
    const errorInfo = this.extractErrorInfo(error, operation);
    
    console.error(`❌ [AUTH] ${operation}:`, errorInfo);

    if (showAlert) {
      let message = errorInfo.message;
      
      // Mensajes específicos para autenticación
      if (errorInfo.statusCode === 401) {
        message = 'Credenciales inválidas. Verifique su usuario y contraseña.';
      } else if (errorInfo.statusCode === 403) {
        message = 'No tiene permisos para acceder al sistema.';
      }

      await AlertService.error(message, {
        title: 'Error de autenticación'
      });
    }
  }

  /**
   * Maneja errores de conexión/red
   */
  static async handleNetworkError(
    error: any, 
    operation: string, 
    showAlert: boolean = true
  ): Promise<void> {
    console.error(`❌ [NETWORK] ${operation}:`, error);

    if (showAlert) {
      await AlertService.error(
        'Error de conexión. Verifique su conexión a internet.',
        {
          title: 'Error de conexión'
        }
      );
    }
  }

  /**
   * Crea un error personalizado para operaciones simuladas/mock
   */
  static createMockError(operation: string, message?: string): ErrorInfo {
    return {
      message: message || `Simulando error en ${operation}`,
      code: 'MOCK_ERROR',
      statusCode: 500,
      details: { mock: true },
      operation
    };
  }

  /**
   * Valida si el error es de un tipo específico
   */
  static isNetworkError(error: any): boolean {
    return error.code === 'ERR_NETWORK' || 
           error.message?.includes('Network Error') ||
           error.response?.status === 0;
  }

  static isTimeoutError(error: any): boolean {
    return error.code === 'ECONNABORTED' || 
           error.message?.includes('timeout');
  }

  static isAuthError(error: any): boolean {
    return error.response?.status === 401 || 
           error.response?.status === 403;
  }

  static isValidationError(error: any): boolean {
    return error.response?.status === 400 || 
           error.response?.status === 422;
  }

  static isServerError(error: any): boolean {
    return error.response?.status >= 500;
  }
}

/**
 * Hook para manejo de errores en componentes React
 */
export const useErrorHandler = () => {
  const handleError = async (error: any, operation: string, showAlert: boolean = true) => {
    return await ErrorHandler.handleServiceError(error, operation, showAlert);
  };

  const handleValidationError = async (errors: string[] | string, operation: string, showAlert: boolean = true) => {
    return await ErrorHandler.handleValidationError(errors, operation, showAlert);
  };

  const handleAuthError = async (error: any, operation: string, showAlert: boolean = true) => {
    return await ErrorHandler.handleAuthError(error, operation, showAlert);
  };

  const handleNetworkError = async (error: any, operation: string, showAlert: boolean = true) => {
    return await ErrorHandler.handleNetworkError(error, operation, showAlert);
  };

  return {
    handleError,
    handleValidationError,
    handleAuthError,
    handleNetworkError
  };
};