import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { getApiUrl, environment } from '../environments'
import { ApiResponse } from './types/api.types'
import { HttpInterceptor, HttpInterceptorConfig } from './http.interceptor'

/**
 * Clase abstracta base para servicios API
 * Utiliza HttpInterceptor para manejar autenticación, spinner y logging
 */
export abstract class BaseApiService {
  protected axiosInstance: AxiosInstance
  protected httpInterceptor: HttpInterceptor
  // Evita duplicar llamadas concurrentes al mismo recurso
  private inFlightRequests: Map<string, Promise<ApiResponse<any>>> = new Map()

  constructor(baseURL?: string, interceptorConfig?: HttpInterceptorConfig) {
    // Crear instancia de Axios
    this.axiosInstance = axios.create({
      baseURL: baseURL || getApiUrl(),
      timeout: environment.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Configurar interceptor HTTP
    this.httpInterceptor = new HttpInterceptor(interceptorConfig)
    this.httpInterceptor.setupInterceptors(this.axiosInstance)
  }

  /**
   * Crea un AbortController y devuelve helpers para usar cancelación en llamadas
   */
  public createAbortController() {
    const controller = new AbortController()
    const signal = controller.signal
    return { controller, signal }
  }

  /**
   * Construye una clave estable para deduplicación de requests
   */
  private buildDedupeKey(method: string, endpoint: string, config?: AxiosRequestConfig, data?: any): string {
    const paramsStr = (() => {
      try {
        if (!config?.params) return ''
        // Soporta objetos simples y URLSearchParams
        if (typeof (config as any).params?.toString === 'function') {
          return (config as any).params.toString()
        }
        return JSON.stringify(config.params)
      } catch {
        return ''
      }
    })()

    const dataStr = (() => {
      try {
        if (data === undefined || data === null) return ''
        return typeof data === 'string' ? data : JSON.stringify(data)
      } catch {
        return ''
      }
    })()

    // Permite que el consumidor pase una clave personalizada
    const customKey = (config as any)?.dedupeKey
    const baseKey = `${method}|${endpoint}|${paramsStr}|${dataStr}`
    return customKey ? `${baseKey}|${customKey}` : baseKey
  }

  /**
   * Petición GET
   */
  protected async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const shouldDedupe = (config as any)?.dedupe !== false
    const key = shouldDedupe ? this.buildDedupeKey('GET', endpoint, config) : ''

    if (shouldDedupe && this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)! as Promise<ApiResponse<T>>
    }

    const reqPromise = this.axiosInstance
      .get<ApiResponse<T>>(endpoint, {
        ...(config || {}),
        signal: config?.signal,
      })
      .then(res => res.data)
      .finally(() => {
        if (shouldDedupe) this.inFlightRequests.delete(key)
      })

    if (shouldDedupe) this.inFlightRequests.set(key, reqPromise as Promise<ApiResponse<any>>)
    return reqPromise
  }

  /**
   * Petición GET pública para uso en hooks
   */
  public async getData<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.get<T>(endpoint, config)
  }

  /**
   * Petición POST
   */
  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const shouldDedupe = (config as any)?.dedupe !== false
    const key = shouldDedupe ? this.buildDedupeKey('POST', endpoint, config, data) : ''

    if (shouldDedupe && this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)! as Promise<ApiResponse<T>>
    }

    const reqPromise = this.axiosInstance
      .post<ApiResponse<T>>(endpoint, data, {
        ...(config || {}),
        signal: config?.signal,
      })
      .then(res => res.data)
      .finally(() => {
        if (shouldDedupe) this.inFlightRequests.delete(key)
      })

    if (shouldDedupe) this.inFlightRequests.set(key, reqPromise as Promise<ApiResponse<any>>)
    return reqPromise
  }

  /**
   * Petición PUT
   */
  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const shouldDedupe = (config as any)?.dedupe !== false
    const key = shouldDedupe ? this.buildDedupeKey('PUT', endpoint, config, data) : ''

    if (shouldDedupe && this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)! as Promise<ApiResponse<T>>
    }

    const reqPromise = this.axiosInstance
      .put<ApiResponse<T>>(endpoint, data, {
        ...(config || {}),
        signal: config?.signal,
      })
      .then(res => res.data)
      .finally(() => {
        if (shouldDedupe) this.inFlightRequests.delete(key)
      })

    if (shouldDedupe) this.inFlightRequests.set(key, reqPromise as Promise<ApiResponse<any>>)
    return reqPromise
  }

  /**
   * Petición PATCH
   */
  protected async patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const shouldDedupe = (config as any)?.dedupe !== false
    const key = shouldDedupe ? this.buildDedupeKey('PATCH', endpoint, config, data) : ''

    if (shouldDedupe && this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)! as Promise<ApiResponse<T>>
    }

    const reqPromise = this.axiosInstance
      .patch<ApiResponse<T>>(endpoint, data, {
        ...(config || {}),
        signal: config?.signal,
      })
      .then(res => res.data)
      .finally(() => {
        if (shouldDedupe) this.inFlightRequests.delete(key)
      })

    if (shouldDedupe) this.inFlightRequests.set(key, reqPromise as Promise<ApiResponse<any>>)
    return reqPromise
  }

  /**
   * Petición DELETE
   */
  protected async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const shouldDedupe = (config as any)?.dedupe !== false
    const key = shouldDedupe ? this.buildDedupeKey('DELETE', endpoint, config) : ''

    if (shouldDedupe && this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)! as Promise<ApiResponse<T>>
    }

    const reqPromise = this.axiosInstance
      .delete<ApiResponse<T>>(endpoint, {
        ...(config || {}),
        signal: config?.signal,
      })
      .then(res => res.data)
      .finally(() => {
        if (shouldDedupe) this.inFlightRequests.delete(key)
      })

    if (shouldDedupe) this.inFlightRequests.set(key, reqPromise as Promise<ApiResponse<any>>)
    return reqPromise
  }

  /**
   * Petición HEAD
   */
  protected async head<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const shouldDedupe = (config as any)?.dedupe !== false
    const key = shouldDedupe ? this.buildDedupeKey('HEAD', endpoint, config) : ''

    if (shouldDedupe && this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)! as Promise<ApiResponse<T>>
    }

    const reqPromise = this.axiosInstance
      .head<ApiResponse<T>>(endpoint, {
        ...(config || {}),
        signal: config?.signal,
      })
      .then(res => res.data)
      .finally(() => {
        if (shouldDedupe) this.inFlightRequests.delete(key)
      })

    if (shouldDedupe) this.inFlightRequests.set(key, reqPromise as Promise<ApiResponse<any>>)
    return reqPromise
  }

  /**
   * Petición OPTIONS
   */
  protected async options<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const shouldDedupe = (config as any)?.dedupe !== false
    const key = shouldDedupe ? this.buildDedupeKey('OPTIONS', endpoint, config) : ''

    if (shouldDedupe && this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)! as Promise<ApiResponse<T>>
    }

    const reqPromise = this.axiosInstance
      .options<ApiResponse<T>>(endpoint, {
        ...(config || {}),
        signal: config?.signal,
      })
      .then(res => res.data)
      .finally(() => {
        if (shouldDedupe) this.inFlightRequests.delete(key)
      })

    if (shouldDedupe) this.inFlightRequests.set(key, reqPromise as Promise<ApiResponse<any>>)
    return reqPromise
  }

  /**
   * Configurar token de autenticación (delegado al interceptor)
   */
  protected setAuthToken(token: string): void {
    this.httpInterceptor.setAuthToken(token)
  }

  /**
   * Remover token de autenticación (delegado al interceptor)
   */
  protected removeAuthToken(): void {
    this.httpInterceptor.removeAuthToken()
  }

  /**
   * Configurar header personalizado
   */
  protected setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value
  }

  /**
   * Obtener configuración de la instancia axios
   */
  protected getAxiosConfig() {
    return {
      baseURL: this.axiosInstance.defaults.baseURL,
      timeout: this.axiosInstance.defaults.timeout,
      headers: this.axiosInstance.defaults.headers,
      interceptor: this.httpInterceptor.getConfig(),
    }
  }

  /**
   * Actualizar configuración del interceptor HTTP
   */
  protected updateInterceptorConfig(config: Partial<HttpInterceptorConfig>): void {
    this.httpInterceptor.updateConfig(config)
  }

  /**
   * Obtener número de peticiones activas
   */
  protected getActiveRequestsCount(): number {
    return this.httpInterceptor.getActiveRequestsCount()
  }

  /**
   * Crea respuesta de error con mensaje específico del backend
   * Método protegido para que los servicios hijos puedan usarlo
   */
  protected createErrorResponse(message: string, error?: any): ApiResponse<any> {
    // Extraer mensaje específico del backend si existe
    let backendMessage = message;
    
    if (error) {
      // Si el error tiene response.data.message (respuesta del backend)
      if (error.response?.data?.message) {
        backendMessage = error.response.data.message;
      }
      // Si el error tiene response.data.error
      else if (error.response?.data?.error) {
        backendMessage = error.response.data.error;
      }
      // Si el error tiene response.data como string
      else if (typeof error.response?.data === 'string') {
        backendMessage = error.response.data;
      }
      // Si el error tiene message propio
      else if (error.message) {
        backendMessage = error.message;
      }
    }

    return {
      success: false,
      data: null,
      message: backendMessage,
      error: error?.response?.data || error?.message || error
    };
  }
}

/**
 * Servicio API concreto para uso general
 */
class ApiService extends BaseApiService {
  constructor() {
    super()
  }

  // Métodos públicos que devuelven el tipo directamente
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return super.get<T>(endpoint, config) as Promise<T>
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return super.post<T>(endpoint, data, config) as Promise<T>
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return super.put<T>(endpoint, data, config) as Promise<T>
  }

  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return super.patch<T>(endpoint, data, config) as Promise<T>
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return super.delete<T>(endpoint, config) as Promise<T>
  }

  async head<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return super.head<T>(endpoint, config) as Promise<T>
  }

  async options<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return super.options<T>(endpoint, config) as Promise<T>
  }
}

// Instancia singleton del servicio API
export const apiService = new ApiService()