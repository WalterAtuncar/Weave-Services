import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { environment } from '@env'
import { spinnerService } from './spinnerService'
import { ApiResponse } from './types/api.types'

/**
 * Configuración del interceptor HTTP
 */
export interface HttpInterceptorConfig {
  enableAuth?: boolean;
  enableSpinner?: boolean;
  enableLogging?: boolean;
  tokenStorageKey?: string;
  spinnerText?: string;
  // Nuevo: reintentos automáticos
  retryEnabled?: boolean;
  maxRetries?: number; // número máximo de reintentos
  retryDelayBaseMs?: number; // base de backoff exponencial
  retryOnStatus?: number[]; // códigos de estado a reintentar
}

/**
 * Clase para manejar interceptores HTTP de manera centralizada
 */
export class HttpInterceptor {
  private activeRequests = 0
  private config: Required<HttpInterceptorConfig>
  // Guardar instancia para poder repetir requests
  private axiosInstance?: AxiosInstance
  // 🔒 Evita múltiples redirecciones simultáneas al login cuando ocurren varios 401 en paralelo
  private static isRedirectingToLogin = false

  constructor(config: HttpInterceptorConfig = {}) {
    this.config = {
      enableAuth: config.enableAuth !== false, // Por defecto true
      enableSpinner: config.enableSpinner !== false, // Por defecto true
      enableLogging: config.enableLogging ?? environment.enableLogging,
      tokenStorageKey: config.tokenStorageKey || 'authToken',
      spinnerText: config.spinnerText || 'Cargando...',
      retryEnabled: config.retryEnabled ?? true,
      maxRetries: config.maxRetries ?? 2,
      retryDelayBaseMs: config.retryDelayBaseMs ?? 500,
      retryOnStatus: config.retryOnStatus ?? [429, 502, 503, 504]
    }
  }

  /**
   * Configura los interceptores en una instancia de Axios
   */
  setupInterceptors(axiosInstance: AxiosInstance): void {
    this.axiosInstance = axiosInstance

    // Interceptor de Request
    axiosInstance.interceptors.request.use(
      (config) => this.handleRequest(config),
      (error) => this.handleRequestError(error)
    )

    // Interceptor de Response
    axiosInstance.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleResponseError(error)
    )
  }

  /**
   * Maneja las peticiones salientes
   */
  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Incrementar contador de peticiones activas
    this.activeRequests++

    // Mostrar spinner si está habilitado
    if (this.config.enableSpinner) {
      spinnerService.show(this.config.spinnerText)
    }

    // Agregar token de autenticación si está disponible
    if (this.config.enableAuth) {
      const token = this.getStoredToken()
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Logging de peticiones
    if (this.config.enableLogging) {
      // Logging disabled for production
    }

    return config
  }

  /**
   * Maneja errores en las peticiones
   */
  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    this.decrementActiveRequests()

    if (this.config.enableLogging) {
      console.error('[HTTP Request Error]', error)
    }

    return Promise.reject(error)
  }

  /**
   * Maneja las respuestas del servidor
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    this.decrementActiveRequests()

    // Validar ApiResponse si los datos tienen la estructura esperada
    if (this.isApiResponse(response.data)) {
      this.validateApiResponse(response.data, response.config.url)
    }

    if (this.config.enableLogging) {

    }

    return response
  }

  /** Determina si debe reintentarse una solicitud */
  private shouldRetry(error: AxiosError & { config: any }): boolean {
    if (!this.config.retryEnabled || !this.axiosInstance) return false

    const status = error.response?.status
    const isNetwork = error.code === 'ERR_NETWORK' || (error.message || '').includes('Network Error')
    const isTimeout = error.code === 'ECONNABORTED' || (error.message || '').includes('timeout')
    // Evitar reintentos cuando el navegador indica recursos insuficientes
    const isInsufficientResources = (error.code === 'ERR_INSUFFICIENT_RESOURCES') || (error.message || '').includes('ERR_INSUFFICIENT_RESOURCES')

    if (isInsufficientResources) return false

    if (isNetwork || isTimeout) return true
    if (status && this.config.retryOnStatus.includes(status)) return true

    return false
  }

  /** Espera asincrónica */
  private delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
  }

  /**
   * Maneja errores en las respuestas
   */
  private async handleResponseError(error: AxiosError & { config: any }): Promise<any> {
    this.decrementActiveRequests()

    // Crear un error mejorado con información más específica
    const enhancedError = { ...error } as any

    // Extraer payload del backend si existe
    const respData: any = error?.response?.data
    if (respData) {
      // Adjuntar datos crudos del backend para quien los necesite
      enhancedError.response = enhancedError.response || {}
      enhancedError.response.data = respData

      if (Array.isArray(respData?.errors) && respData.errors.length > 0) {
        enhancedError.message = respData.errors[0]
        enhancedError.userMessage = respData.errors[0]
        enhancedError.errors = respData.errors
      } else if (typeof respData?.message === 'string' && respData.message) {
        enhancedError.message = respData.message
        enhancedError.userMessage = respData.message
      }
    }

    // Manejar diferentes tipos de errores
    if (error.code === 'ERR_NETWORK' || (error.message || '').includes('Network Error')) {
      // Error de red/CORS
      enhancedError.message = enhancedError.message || 'Error de conexión con el servidor. Verifique su conexión a internet o contacte al administrador.'
      enhancedError.userMessage = enhancedError.userMessage || 'Error de conexión. Intente nuevamente.'
    } else if (error.code === 'ECONNABORTED' || (error.message || '').includes('timeout')) {
      // Error de timeout
      enhancedError.message = enhancedError.message || 'Tiempo de espera agotado. El servidor tardó demasiado en responder.'
      enhancedError.userMessage = enhancedError.userMessage || 'Tiempo de espera agotado. Intente nuevamente.'
    } else if (error.response?.status === 0) {
      // Error de CORS o servidor no disponible
      enhancedError.message = enhancedError.message || 'No se pudo conectar con el servidor. Posible error de CORS.'
      enhancedError.userMessage = enhancedError.userMessage || 'Error de conexión con el servidor.'
    }

    // Reintentos automáticos para 5xx/timeout/network
    const originalConfig = error.config || ({} as any)
    originalConfig.__retryCount = originalConfig.__retryCount || 0

    if (this.shouldRetry(error) && originalConfig.__retryCount < this.config.maxRetries) {
      originalConfig.__retryCount += 1

      const backoff = this.config.retryDelayBaseMs * Math.pow(2, originalConfig.__retryCount - 1)
      const jitter = Math.floor(Math.random() * 150)
      const delayMs = backoff + jitter

      if (this.config.enableLogging) {
        console.warn(`[HTTP Retry] Intento ${originalConfig.__retryCount}/${this.config.maxRetries} en ${delayMs}ms`, {
          url: originalConfig.url,
          method: originalConfig.method,
          status: error.response?.status,
        })
      }

      await this.delay(delayMs)
      // Al reintentar, evitamos duplicar spinner; el request interceptor lo maneja
      return this.axiosInstance!.request(originalConfig as InternalAxiosRequestConfig)
    }

    // Manejar errores de autenticación
    if (error.response?.status === 401 && this.config.enableAuth) {
      this.handleUnauthorized()
    }

    // Log de errores de respuesta
    if (error.response && this.isApiResponse(error.response.data)) {
      const apiResponse = error.response.data as ApiResponse<null>
      // Puedes utilizar apiResponse para detalles de errores del backend
    } else if (!error.response) {
      // Error de red, CORS, etc.
    }

    if (this.config.enableLogging) {
      console.error('[HTTP Response Error]', {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        message: enhancedError.message || error.message,
        data: error.response?.data
      })
    }

    return Promise.reject(enhancedError)
  }

  /**
   * Decrementa el contador de peticiones activas y oculta spinner si es necesario
   */
  private decrementActiveRequests(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1)

    // Ocultar spinner solo cuando no hay peticiones activas
    if (this.activeRequests === 0 && this.config.enableSpinner) {
      spinnerService.hide()
    }
  }

  /**
   * Obtiene el token almacenado en localStorage
   */
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.config.tokenStorageKey)
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn('No se pudo acceder al localStorage:', error)
      }
      return null
    }
  }

  /**
   * Maneja casos de no autorización (401)
   */
  private handleUnauthorized(): void {
    if (this.config.enableLogging) {
      console.warn('Token expirado o inválido. Limpiando autenticación local y redirigiendo al login.')
    }

    // Limpiar token del localStorage
    try {
      localStorage.removeItem(this.config.tokenStorageKey)
      // También limpiar posibles claves de sesión para evitar estados inconsistentes
      try { localStorage.removeItem('userSession') } catch {}
      try { localStorage.removeItem('lastActivity') } catch {}
      try { localStorage.removeItem('sessionId') } catch {}
      try { localStorage.removeItem('sessionStart') } catch {}
    } catch (error) {
      console.warn('No se pudo limpiar el localStorage:', error)
    }

    // Evitar múltiples redirecciones en paralelo
    if (HttpInterceptor.isRedirectingToLogin) {
      return
    }
    HttpInterceptor.isRedirectingToLogin = true

    // Redirigir al login sólo si no estamos ya allí
    const currentPath = window.location.pathname || ''
    if (currentPath !== '/login') {
      try {
        // Usar replace para evitar volver a la página protegida tras el back
        window.location.replace('/login')
      } catch (e) {
        // Fallback
        window.location.href = '/login'
      }
    } else {
      // Si ya estamos en /login, permitir futuras redirecciones si fuera necesario
      HttpInterceptor.isRedirectingToLogin = false
    }

    // También podríamos emitir un evento si otros componentes necesitan reaccionar
    // window.dispatchEvent(new CustomEvent('auth:logout'))
  }

  /**
   * Verifica si el objeto tiene estructura de ApiResponse
   */
  private isApiResponse(data: any): data is ApiResponse<any> {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.success === 'boolean' &&
      typeof data.message === 'string' &&
      Array.isArray(data.errors) &&
      typeof data.statusCode === 'number'
    )
  }

  private validateApiResponse(apiResponse: ApiResponse<any>, url?: string): void {
    // Espacio para validaciones adicionales si se requiere
  }

  /**
   * Configuración pública
   */
  public setAuthToken(token: string): void {
    try {
      localStorage.setItem(this.config.tokenStorageKey, token)
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn('No se pudo almacenar el token:', error)
      }
    }
  }

  public removeAuthToken(): void {
    try {
      localStorage.removeItem(this.config.tokenStorageKey)
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn('No se pudo eliminar el token:', error)
      }
    }
  }

  public updateConfig(newConfig: Partial<HttpInterceptorConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public getConfig(): HttpInterceptorConfig {
    return this.config
  }

  public getActiveRequestsCount(): number {
    return this.activeRequests
  }
}

export const httpInterceptor = new HttpInterceptor()