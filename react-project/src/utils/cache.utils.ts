/**
 * Utilidades para cache y debounce de llamadas a APIs
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto

  /**
   * Genera una clave única para el cache basada en los parámetros
   */
  private generateKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Obtiene datos del cache si están disponibles y no han expirado
   */
  get<T>(endpoint: string, params: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Almacena datos en el cache
   */
  set<T>(endpoint: string, params: Record<string, any>, data: T, ttl?: number): void {
    const key = this.generateKey(endpoint, params);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  /**
   * Verifica si hay una petición pendiente para los mismos parámetros
   */
  hasPendingRequest(endpoint: string, params: Record<string, any>): boolean {
    const key = this.generateKey(endpoint, params);
    const pending = this.pendingRequests.get(key);
    
    if (!pending) {
      return false;
    }
    
    // Limpiar peticiones pendientes que han estado más de 30 segundos
    if (Date.now() - pending.timestamp > 30000) {
      this.pendingRequests.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Obtiene una petición pendiente si existe
   */
  getPendingRequest<T>(endpoint: string, params: Record<string, any>): Promise<T> | null {
    const key = this.generateKey(endpoint, params);
    const pending = this.pendingRequests.get(key);
    
    if (!pending) {
      return null;
    }
    
    return pending.promise;
  }

  /**
   * Registra una petición pendiente
   */
  setPendingRequest<T>(endpoint: string, params: Record<string, any>, promise: Promise<T>): void {
    const key = this.generateKey(endpoint, params);
    
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });
    
    // Limpiar la petición pendiente cuando se complete
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Limpia el cache completo
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Limpia entradas expiradas del cache
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalida el cache para un endpoint específico
   */
  invalidate(endpoint: string, params?: Record<string, any>): void {
    if (params) {
      const key = this.generateKey(endpoint, params);
      this.cache.delete(key);
    } else {
      // Invalidar todas las entradas que coincidan con el endpoint
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${endpoint}:`)) {
          this.cache.delete(key);
        }
      }
    }
  }
}

// Instancia singleton del cache
export const apiCache = new ApiCache();

// Limpiar cache expirado cada 10 minutos
setInterval(() => {
  apiCache.cleanup();
}, 10 * 60 * 1000);