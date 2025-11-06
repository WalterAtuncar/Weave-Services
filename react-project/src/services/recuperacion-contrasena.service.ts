/**
 * Servicio para gestión de recuperación de contraseñas
 * Implementa todos los endpoints del controlador RecuperacionContrasenaController
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Commands
  SolicitarCodigoRecuperacionCommand,
  ValidarCodigoRecuperacionPorEmailCommand,
  CambiarContrasenaCommand,
  CreateRecuperacionContrasenaCommand,
  ValidarCodigoRecuperacionCommand,
  
  // Requests
  GetRecuperacionesPaginatedRequest,
  
  // Responses
  SolicitarCodigoRecuperacionResponseData,
  ValidarCodigoRecuperacionPorEmailResponseData,
  CambiarContrasenaResponseData,
  CreateRecuperacionContrasenaResponseData,
  ValidarCodigoRecuperacionResponseData,
  GetRecuperacionesPaginatedResponseData,
  HealthCheckResponseData,
  TestEmailConnectionResponseData
} from './types/recuperacion-contrasena.types';

export class RecuperacionContrasenaService extends BaseApiService {
  protected baseEndpoint = '/RecuperacionContrasena';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== FLUJO DE RECUPERACIÓN DE CONTRASEÑA (3 PASOS) =====

  /**
   * PASO 1: Solicita un código de recuperación por email
   * POST /api/RecuperacionContrasena/solicitar-codigo
   */
  async solicitarCodigo(command: SolicitarCodigoRecuperacionCommand): Promise<ApiResponse<SolicitarCodigoRecuperacionResponseData>> {
    const url = `${this.baseEndpoint}/solicitar-codigo`;
    return await this.post<any>(url, command);
  }

  /**
   * PASO 2: Valida el código de recuperación usando email
   * POST /api/RecuperacionContrasena/validar-codigo-email
   */
  async validarCodigoPorEmail(command: ValidarCodigoRecuperacionPorEmailCommand): Promise<ApiResponse<ValidarCodigoRecuperacionPorEmailResponseData>> {
    const url = `${this.baseEndpoint}/validar-codigo-email`;
    return await this.post<boolean>(url, command);
  }

  /**
   * PASO 3: Cambia la contraseña usando email
   * POST /api/RecuperacionContrasena/cambiar-contrasena
   */
  async cambiarContrasena(command: CambiarContrasenaCommand): Promise<ApiResponse<CambiarContrasenaResponseData>> {
    const url = `${this.baseEndpoint}/cambiar-contrasena`;
    return await this.post<boolean>(url, command);
  }

  // ===== OPERACIONES CRUD =====

  /**
   * Crea una nueva recuperación de contraseña
   * POST /api/RecuperacionContrasena
   */
  async createRecuperacion(command: CreateRecuperacionContrasenaCommand): Promise<ApiResponse<CreateRecuperacionContrasenaResponseData>> {
    return await this.post<number>(this.baseEndpoint, command);
  }

  /**
   * Valida un código de recuperación
   * POST /api/RecuperacionContrasena/validar-codigo
   */
  async validarCodigo(command: ValidarCodigoRecuperacionCommand): Promise<ApiResponse<ValidarCodigoRecuperacionResponseData>> {
    const url = `${this.baseEndpoint}/validar-codigo`;
    return await this.post<any>(url, command);
  }

  /**
   * Obtiene recuperaciones paginadas
   * GET /api/RecuperacionContrasena
   */
  async getRecuperaciones(request?: GetRecuperacionesPaginatedRequest): Promise<ApiResponse<GetRecuperacionesPaginatedResponseData>> {
    const params = new URLSearchParams();

    if (request?.page !== undefined) params.append('Page', request.page.toString());
    if (request?.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
    if (request?.orderBy) params.append('OrderBy', request.orderBy);
    if (request?.orderDescending !== undefined) params.append('OrderDescending', request.orderDescending.toString());
    if (request?.includeDeleted !== undefined) params.append('IncludeDeleted', request.includeDeleted.toString());
    if (request?.estado !== undefined) params.append('Estado', request.estado.toString());
    if (request?.email) params.append('Email', request.email);
    if (request?.codigo) params.append('Codigo', request.codigo);
    if (request?.fechaCreacionDesde) params.append('FechaCreacionDesde', request.fechaCreacionDesde);
    if (request?.fechaCreacionHasta) params.append('FechaCreacionHasta', request.fechaCreacionHasta);
    if (request?.fechaExpiracionDesde) params.append('FechaExpiracionDesde', request.fechaExpiracionDesde);
    if (request?.fechaExpiracionHasta) params.append('FechaExpiracionHasta', request.fechaExpiracionHasta);
    if (request?.fechaUsoDesde) params.append('FechaUsoDesde', request.fechaUsoDesde);
    if (request?.fechaUsoHasta) params.append('FechaUsoHasta', request.fechaUsoHasta);
    if (request?.esValido !== undefined) params.append('EsValido', request.esValido.toString());
    if (request?.esExpirado !== undefined) params.append('EsExpirado', request.esExpirado.toString());
    if (request?.searchTerm) params.append('SearchTerm', request.searchTerm);

    const url = `${this.baseEndpoint}?${params.toString()}`;
    return await this.get<any>(url);
  }

  // ===== ENDPOINTS DE UTILIDAD =====

  /**
   * Obtiene el estado de la API
   * GET /api/RecuperacionContrasena/health
   */
  async healthCheck(): Promise<ApiResponse<HealthCheckResponseData>> {
    const url = `${this.baseEndpoint}/health`;
    return await this.get<any>(url);
  }

  /**
   * TEMPORAL: Prueba la conexión con el servidor de email
   * GET /api/RecuperacionContrasena/test-email
   */
  async testEmailConnection(): Promise<ApiResponse<TestEmailConnectionResponseData>> {
    const url = `${this.baseEndpoint}/test-email`;
    return await this.get<any>(url);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Flujo completo de recuperación de contraseña
   */
  async recuperarContrasenaCompleto(email: string, nuevaContrasena: string): Promise<ApiResponse<{
    solicitudExitosa: boolean;
    validacionExitosa: boolean;
    cambioExitoso: boolean;
    mensajes: string[];
  }>> {
    const mensajes: string[] = [];
    let solicitudExitosa = false;
    let validacionExitosa = false;
    let cambioExitoso = false;

    try {
      // PASO 1: Solicitar código
      const solicitudResponse = await this.solicitarCodigo({ email });
      if (solicitudResponse.success) {
        solicitudExitosa = true;
        mensajes.push('Código de recuperación enviado exitosamente');
      } else {
        mensajes.push(`Error al solicitar código: ${solicitudResponse.message}`);
        return {
          success: false,
          data: { solicitudExitosa, validacionExitosa, cambioExitoso, mensajes },
          message: 'Error en el flujo de recuperación',
          errors: solicitudResponse.errors || [],
          statusCode: solicitudResponse.statusCode || 500,
          metadata: ''
        };
      }

      // PASO 2: Validar código (simulado - en un flujo real necesitarías el código)
      // Nota: En un flujo real, el usuario debería ingresar el código recibido por email
      const validacionResponse = await this.validarCodigoPorEmail({ 
        email, 
        codigo: 'CODIGO_TEMPORAL' // En un flujo real, esto vendría del usuario
      });
      
      if (validacionResponse.success) {
        validacionExitosa = true;
        mensajes.push('Código validado exitosamente');
      } else {
        mensajes.push(`Error al validar código: ${validacionResponse.message}`);
        return {
          success: false,
          data: { solicitudExitosa, validacionExitosa, cambioExitoso, mensajes },
          message: 'Error en validación de código',
          errors: validacionResponse.errors || [],
          statusCode: validacionResponse.statusCode || 500,
          metadata: ''
        };
      }

      // PASO 3: Cambiar contraseña
      const cambioResponse = await this.cambiarContrasena({ 
        email, 
        nuevaContrasena 
      });
      
      if (cambioResponse.success) {
        cambioExitoso = true;
        mensajes.push('Contraseña cambiada exitosamente');
      } else {
        mensajes.push(`Error al cambiar contraseña: ${cambioResponse.message}`);
        return {
          success: false,
          data: { solicitudExitosa, validacionExitosa, cambioExitoso, mensajes },
          message: 'Error al cambiar contraseña',
          errors: cambioResponse.errors || [],
          statusCode: cambioResponse.statusCode || 500,
          metadata: ''
        };
      }

      return {
        success: true,
        data: { solicitudExitosa, validacionExitosa, cambioExitoso, mensajes },
        message: 'Recuperación de contraseña completada exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: { solicitudExitosa, validacionExitosa, cambioExitoso, mensajes },
        message: 'Error en el flujo de recuperación',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Verifica si el servicio de recuperación está disponible
   */
  async verificarDisponibilidad(): Promise<ApiResponse<{
    servicioDisponible: boolean;
    emailDisponible: boolean;
    detalles: string[];
  }>> {
    const detalles: string[] = [];
    let servicioDisponible = false;
    let emailDisponible = false;

    try {
      // Verificar health check
      const healthResponse = await this.healthCheck();
      if (healthResponse.success) {
        servicioDisponible = true;
        detalles.push('Servicio de recuperación disponible');
      } else {
        detalles.push(`Servicio no disponible: ${healthResponse.message}`);
      }

      // Verificar conexión de email
      const emailResponse = await this.testEmailConnection();
      if (emailResponse.success) {
        emailDisponible = true;
        detalles.push('Servicio de email disponible');
      } else {
        detalles.push(`Email no disponible: ${emailResponse.message}`);
      }

      return {
        success: true,
        data: { servicioDisponible, emailDisponible, detalles },
        message: 'Verificación completada',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: { servicioDisponible, emailDisponible, detalles },
        message: 'Error al verificar disponibilidad',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const recuperacionContrasenaService = new RecuperacionContrasenaService(); 