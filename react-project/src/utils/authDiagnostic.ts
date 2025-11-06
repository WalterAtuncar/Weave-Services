/**
 * Utilidad para diagnosticar problemas de autenticación
 * Ayuda a identificar por qué los endpoints están devolviendo 401
 */

export class AuthDiagnostic {
  /**
   * Verifica el estado completo de autenticación
   */
  static checkAuthState(): void {
    console.group('🔍 DIAGNÓSTICO DE AUTENTICACIÓN');
    
    // 1. Verificar token en localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Decodificar JWT para verificar expiración
      try {
        const payload = this.decodeJWT(token);
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < now;
      } catch (error) {
      }
    }
    
    // 2. Verificar sesión de usuario
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const session = JSON.parse(userSession);
      } catch (error) {
      }
    }
    
    // 3. Verificar configuración del interceptor
    console.groupEnd();
  }
  
  /**
   * Decodifica un JWT sin verificar la firma
   */
  private static decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }
  
  /**
   * Fuerza un refresh del token si es posible
   */
  static async refreshAuthState(): Promise<void> {
    // Importar dinámicamente para evitar dependencias circulares
    const { authService } = await import('../services/auth.service');
    
    try {
      const isAuthenticated = authService.isAuthenticated();
      if (!isAuthenticated) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
    }
  }
  
  /**
   * Prueba una petición a un endpoint específico
   */
  static async testEndpoint(url: string): Promise<void> {
    console.group(`🧪 PRUEBA DE ENDPOINT: ${url}`);
    
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 401) {
      }
      
      const responseText = await response.text();
    } catch (error) {
      console.error('❌ Error en la petición:', error);
    }
    
    console.groupEnd();
  }
}

// Hacer disponible globalmente para debugging
(window as any).AuthDiagnostic = AuthDiagnostic;

// Auto-ejecutar diagnóstico en desarrollo
if (process.env.NODE_ENV === 'development') {
}