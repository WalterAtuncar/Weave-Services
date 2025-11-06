import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { 
  LoginRequest, 
  LoginResponseData, 
  UsuarioAuth, 
  MenuItem, 
  UserSession,
  OrganizacionLogin,
  SolicitarCodigoRequest,
  SolicitarCodigoResponseData,
  ValidarCodigoRequest,
  CambiarContrasenaRequest,
  ValidarAdResponseData,
  UsuarioGobernanzaRol
} from './types/auth.types';
import { HttpInterceptorConfig } from './http.interceptor';

/**
 * Servicio de autenticación
 * Maneja login, logout y gestión de sesión con validación automática
 */
export class AuthService extends BaseApiService {
  private readonly USER_STORAGE_KEY = 'userSession';
  private readonly TOKEN_STORAGE_KEY = 'authToken';
  private readonly LAST_ACTIVITY_KEY = 'lastActivity';
  private readonly SESSION_ID_KEY = 'sessionId';
  private readonly SESSION_START_KEY = 'sessionStart';
  private tokenCheckInterval: NodeJS.Timeout | null = null;
  private inactivityCheckInterval: NodeJS.Timeout | null = null;
  private readonly TOKEN_CHECK_INTERVAL = 60000; // 1 minuto
  private readonly TOKEN_WARNING_THRESHOLD = 300; // 5 minutos antes de expirar
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inactividad
  private readonly INACTIVITY_WARNING_TIME = 5 * 60 * 1000; // 5 minutos antes de logout por inactividad
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas máximo de sesión
  private currentSessionId: string | null = null;

  constructor() {
    // Configuración especial para AuthService: sin token automático pero con spinner
    const config: HttpInterceptorConfig = {
      enableAuth: false, // No agregar token automáticamente (bypass)
      enableSpinner: true, // Mantener spinner
      enableLogging: true,
      tokenStorageKey: 'authToken',
      spinnerText: 'Autenticando...'
    };
    
    super(undefined, config);
    
    // 🔒 SEGURIDAD EMPRESARIAL: Configurar detección de cierre de navegador
    this.setupBrowserCloseDetection();
    
    // 🔒 SEGURIDAD EMPRESARIAL: Configurar listeners de actividad
    this.setupActivityTracking();
    
    // Iniciar monitoreo si ya hay una sesión válida
    this.initializeAuthState();
  }

  /**
   * 🔒 MEJORADO: Inicializar estado de autenticación con validaciones de seguridad empresarial
   */
  private initializeAuthState(): void {

    
    // 🔒 VALIDACIÓN 1: Verificar si la sesión es de la misma instancia del navegador
    if (!this.isValidBrowserSession()) {

      this.forceLogout(true, 'browser_session');
      return;
    }
    
    // 🔒 VALIDACIÓN 2: Verificar tiempo máximo de sesión (8 horas)
    if (!this.isSessionWithinTimeLimit()) {

      this.forceLogout(true, 'session_timeout');
      return;
    }
    
    // 🔒 VALIDACIÓN 3: Verificar inactividad
    if (!this.isSessionActive()) {

      this.forceLogout(true, 'inactivity');
      return;
    }
    
    // 🔒 VALIDACIÓN 4: Verificar autenticación tradicional
    if (this.isAuthenticated()) {

      this.updateLastActivity();
      this.startTokenMonitoring();
      this.startInactivityMonitoring();
      
      // Habilitar autenticación para futuras peticiones
      this.updateInterceptorConfig({ enableAuth: true });
    } else {

      this.forceLogout(false);
    }
  }

  /**
   * Realiza el login del usuario
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
    try {
      const response = await this.post<LoginResponseData>('/Auth/login', credentials);
      
      // Si el login es exitoso, guardar datos en localStorage
      if (response.success && response.data) {
        await this.saveUserSession(response.data);
        
        // 🆕 Iniciar monitoreo automático de token
        this.startTokenMonitoring();
      }
      
      return response;
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Crear un error más específico para mostrar al usuario
      const userFriendlyError: ApiResponse<LoginResponseData> = {
        success: false,
        message: this.getErrorMessage(error),
        data: null as any,
        errors: [this.getErrorMessage(error)],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene un mensaje de error amigable para el usuario
   */
  private getErrorMessage(error: any): string {
    // Si el error tiene un mensaje personalizado del interceptor
    if (error.userMessage) {
      return error.userMessage;
    }

    // Errores de red/CORS
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return 'Error de conexión. Verifique su conexión a internet.';
    }

    // Timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Tiempo de espera agotado. Intente nuevamente.';
    }

    // CORS o servidor no disponible
    if (error.response?.status === 0 || !error.response) {
      return 'No se pudo conectar con el servidor. Contacte al administrador.';
    }

    // Error del servidor con mensaje específico
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Errores HTTP estándar
    if (error.response?.status) {
      switch (error.response.status) {
        case 401:
          return 'Credenciales inválidas. Verifique su usuario y contraseña.';
        case 403:
          return 'No tiene permisos para acceder al sistema.';
        case 404:
          return 'Servicio no encontrado. Contacte al administrador.';
        case 500:
          return 'Error interno del servidor. Intente más tarde.';
        case 502:
        case 503:
          return 'Servidor no disponible. Intente más tarde.';
        default:
          return `Error del servidor (${error.response.status}). Intente nuevamente.`;
      }
    }

    // Error genérico
    return 'Error inesperado. Intente nuevamente.';
  }

  /**
   * 🔧 MEJORADO: Cierra la sesión del usuario con limpieza completa
   */
  async logout(): Promise<void> {
    try {
      // Detener monitoreo de token
      this.stopTokenMonitoring();
      
      // Limpiar localStorage
      this.clearUserSession();
      
      // Remover token del interceptor
      this.removeAuthToken();
      
      // Deshabilitar autenticación en el interceptor
      this.updateInterceptorConfig({ enableAuth: false });
      
      // Limpiar estado de autenticación federada si existe
      const { federatedAuthService } = await import('./federated-auth.service');
      federatedAuthService.cleanup();
      
      // Aquí podrías hacer una llamada al backend para invalidar el token
      // await this.post('/Auth/logout', {});
      
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar datos locales aunque falle la llamada al backend
      this.forceLogout(false);
    }
  }

  /**
   * 🔧 MEJORADO: Verifica si el usuario está autenticado con validación robusta
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const userSession = this.getUserSession();
    
    // Si no hay token o sesión, no está autenticado
    if (!token || !userSession) {
      if (token || userSession) {
        // Datos inconsistentes - limpiar todo
        this.forceLogout(false);
      }
      return false;
    }

    // Verificar si el token no ha expirado
    if (!this.isTokenValid(token)) {
      // Token expirado - forzar logout
      this.forceLogout(true);
      return false;
    }

    return true;
  }

  /**
   * Obtiene la sesión del usuario actual
   */
  getUserSession(): UserSession | null {
    try {
      const sessionData = localStorage.getItem(this.USER_STORAGE_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error al obtener sesión del usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): UsuarioAuth | null {
    const session = this.getUserSession();
    return session?.usuario || null;
  }

  /**
   * Obtiene el menú del usuario actual
   */
  getUserMenu(): MenuItem[] {
    const session = this.getUserSession();
    return session?.menu || [];
  }



  /**
   * Obtiene la organización actual del usuario
   */
  getCurrentOrganization(): OrganizacionLogin | null {
    const session = this.getUserSession();
    return session?.organizacion || null;
  }

  /**
   * Obtener el rol de gobernanza del usuario actual
   */
  getCurrentGobernanzaRol(): UsuarioGobernanzaRol | null {
    const session = this.getUserSession();
    return session?.gobernanzaRol || null;
  }

  /**
   * Obtiene el nombre del usuario actual
   */
  getCurrentUserName(): string | null {
    const user = this.getCurrentUser();
    return user?.nombre || null;
  }

  /**
   * Obtiene el nombre completo del usuario actual
   */
  getCurrentUserFullName(): string | null {
    const user = this.getCurrentUser();
    return user?.nombreCompleto || null;
  }

  /**
   * Obtiene la foto URL del usuario actual
   */
  getCurrentUserPhotoUrl(): string | null {
    const user = this.getCurrentUser();
    return user?.fotoUrl || null;
  }

  /**
   * Obtiene la información de visualización del usuario (nombre y foto)
   */
  getCurrentUserDisplayInfo(): { name: string; fullName: string; photoUrl: string | null } | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    return {
      name: user.nombre || user.nombreUsuario,
      fullName: user.nombreCompleto || user.nombreUsuario,
      photoUrl: user.fotoUrl && user.fotoUrl.trim() !== '' ? user.fotoUrl : null
    };
  }

  /**
   * Obtiene el token almacenado
   */
  getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  /**
   * 🔧 MEJORADO: Guarda la sesión del usuario en localStorage con configuración completa
   */
  private async saveUserSession(loginData: LoginResponseData): Promise<void> {
    try {

      
      const userSession: UserSession = {
        usuario: loginData.usuario,
        token: loginData.token,
        menu: loginData.menu,
        organizacion: loginData.organizacion || null, // Asegurar que sea null si no existe
        gobernanzaRol: loginData.gobernanzaRol || null // Incluir el rol de gobernanza
      };

      // Validar que el token sea válido antes de guardar
      if (!this.isTokenValid(loginData.token)) {
        throw new Error('Token recibido inválido o expirado');
      }

      // Guardar sesión completa
      const sessionJson = JSON.stringify(userSession);
      localStorage.setItem(this.USER_STORAGE_KEY, sessionJson);
      
      // Guardar token por separado para el interceptor
      localStorage.setItem(this.TOKEN_STORAGE_KEY, loginData.token);
      
      // 🔒 SEGURIDAD: Inicializar nueva sesión empresarial
      this.initializeNewSession();
      
      // Actualizar el interceptor para que use el token en futuras peticiones
      this.updateInterceptorConfig({ enableAuth: true });
      

      
    } catch (error) {
      console.error('Error al guardar sesión del usuario:', error);
      throw new Error('No se pudo guardar la sesión del usuario');
    }
  }

  /**
   * 🔒 MEJORADO: Limpia la sesión del usuario con datos de seguridad empresarial
   */
  private clearUserSession(): void {
    try {
      // Eliminar claves específicas
      localStorage.removeItem(this.USER_STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      
      // 🔒 SEGURIDAD: Limpiar datos de seguridad empresarial
      this.clearSecuritySessionData();
      
      // Deshabilitar autenticación en el interceptor
      this.updateInterceptorConfig({ enableAuth: false });
      
    } catch (error) {
      console.error('Error al limpiar sesión del usuario:', error);
    }
  }

  /**
   * Verifica si el token JWT es válido (no expirado)
   */
  private isTokenValid(token: string): boolean {
    try {
      // Decodificar el payload del JWT (sin verificar firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Verificar si el token no ha expirado
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error al validar token:', error);
      return false;
    }
  }

  /**
   * Refresca el token (si el backend lo soporta)
   */
  async refreshToken(): Promise<boolean> {
    try {
      // Implementar cuando el backend tenga endpoint de refresh
      // const response = await this.post<LoginResponseData>('/Auth/refresh', {});
      // if (response.success) {
      //   await this.saveUserSession(response.data);
      //   return true;
      // }
      return false;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  }

  // ===== MÉTODOS PARA RECUPERACIÓN DE CONTRASEÑA =====

  /**
   * Solicita un código de recuperación de contraseña
   */
  async solicitarCodigoRecuperacion(request: SolicitarCodigoRequest): Promise<ApiResponse<SolicitarCodigoResponseData>> {
    try {
      const response = await this.post<SolicitarCodigoResponseData>(
        '/RecuperacionContrasena/solicitar-codigo', 
        request
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al solicitar código de recuperación:', error);
      
      const userFriendlyError: ApiResponse<SolicitarCodigoResponseData> = {
        success: false,
        message: this.getRecoveryErrorMessage(error, 'envío de código'),
        data: null as any,
        errors: [this.getRecoveryErrorMessage(error, 'envío de código')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Valida el código de recuperación
   */
  async validarCodigoRecuperacion(request: ValidarCodigoRequest): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.post<boolean>(
        '/RecuperacionContrasena/validar-codigo-email', 
        request
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al validar código:', error);
      
      const userFriendlyError: ApiResponse<boolean> = {
        success: false,
        message: this.getRecoveryErrorMessage(error, 'validación de código'),
        data: false,
        errors: [this.getRecoveryErrorMessage(error, 'validación de código')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Cambia la contraseña usando el código validado
   */
  async cambiarContrasena(request: CambiarContrasenaRequest): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.post<boolean>(
        '/RecuperacionContrasena/cambiar-contrasena', 
        request
      );
      
      return response;
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      
      const userFriendlyError: ApiResponse<boolean> = {
        success: false,
        message: this.getRecoveryErrorMessage(error, 'cambio de contraseña'),
        data: false,
        errors: [this.getRecoveryErrorMessage(error, 'cambio de contraseña')],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene un mensaje de error específico para recuperación de contraseña
   */
  private getRecoveryErrorMessage(error: any, operation: string): string {
    // Si el error tiene un mensaje personalizado del interceptor
    if (error.userMessage) {
      return error.userMessage;
    }

    // 🔧 FIX: Manejo específico para correo no existente
    if (error.response?.status === 404) {
      if (operation === 'envío de código') {
        return 'El correo electrónico no existe en nuestro sistema. Verifique el correo ingresado.';
      }
      return 'Recurso no encontrado. Verifique la información proporcionada.';
    }

    // Errores de red/CORS
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return 'Error de conexión. Verifique su conexión a internet.';
    }

    // CORS o servidor no disponible
    if (error.response?.status === 0 || !error.response) {
      return 'No se pudo conectar con el servidor. Contacte al administrador.';
    }

    // Errores HTTP específicos
    switch (error.response?.status) {
      case 400:
        return `Error en la solicitud de ${operation}. Verifique los datos ingresados.`;
      case 401:
        return 'No autorizado. Su sesión ha expirado.';
      case 403:
        return 'Acceso denegado. No tiene permisos para realizar esta operación.';
      case 500:
        return 'Error interno del servidor. Contacte al administrador.';
      case 502:
      case 503:
      case 504:
        return 'Servicio temporalmente no disponible. Intente más tarde.';
      default:
        // Intentar extraer mensaje del response
        if (error.response?.data?.message) {
          return error.response.data.message;
        }
        if (error.response?.data?.error) {
          return error.response.data.error;
        }
        return `Error inesperado durante ${operation}. Intente nuevamente.`;
    }
  }

  // ===== MÉTODOS PARA VALIDACIÓN DE ACTIVE DIRECTORY =====

  /**
   * Valida la configuración de Active Directory para un dominio específico
   */
  async validarConfiguracionAd(dominio: string): Promise<ApiResponse<ValidarAdResponseData>> {
    try {
      // Validar parámetro de entrada
      if (!dominio || dominio.trim() === '') {
        return {
          success: false,
          message: 'El dominio es requerido',
          data: null as any,
          errors: ['El dominio no puede estar vacío'],
          statusCode: 400,
          metadata: ''
        };
      }

      // Limpiar el dominio de espacios y caracteres especiales
      const dominioLimpio = dominio.trim();

      const response = await this.get<ValidarAdResponseData>(`/Auth/validar-ad-simple/${encodeURIComponent(dominioLimpio)}`);
      
      return response;
    } catch (error: any) {
      console.error('Error al validar configuración AD:', error);
      
      const userFriendlyError: ApiResponse<ValidarAdResponseData> = {
        success: false,
        message: this.getAdValidationErrorMessage(error),
        data: null as any,
        errors: [this.getAdValidationErrorMessage(error)],
        statusCode: error.response?.status || 0,
        metadata: ''
      };
      
      return userFriendlyError;
    }
  }

  /**
   * Obtiene un mensaje de error específico para validación de AD
   */
  private getAdValidationErrorMessage(error: any): string {
    // Si el error tiene un mensaje personalizado del interceptor
    if (error.userMessage) {
      return error.userMessage;
    }

    // Errores de red/CORS
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return 'Error de conexión. Verifique su conexión a internet.';
    }

    // CORS o servidor no disponible
    if (error.response?.status === 0 || !error.response) {
      return 'No se pudo conectar con el servidor. Contacte al administrador.';
    }

    // Error del servidor con mensaje específico
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Errores HTTP específicos para validación AD
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Dominio inválido. Verifique el formato del dominio ingresado.';
        case 401:
          return 'No autorizado para validar configuración de AD.';
        case 403:
          return 'No tiene permisos para validar configuración de AD.';
        case 404:
          return 'Servicio de validación AD no encontrado.';
        case 422:
          return 'El dominio ingresado no es válido o no existe.';
        case 500:
          return 'Error en el servidor de AD. Contacte al administrador.';
        case 502:
        case 503:
          return 'Servicio de AD no disponible. Intente más tarde.';
        case 504:
          return 'Tiempo de espera agotado al conectar con AD. Intente nuevamente.';
        default:
          return `Error al validar configuración AD (${error.response.status}). Intente nuevamente.`;
      }
    }

    // Error genérico
    return 'Error inesperado al validar configuración AD. Intente nuevamente.';
  }

  // ===== MÉTODOS DE MONITOREO DE TOKEN =====

  /**
   * Inicia el monitoreo de la expiración del token
   */
  private startTokenMonitoring(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }

    this.tokenCheckInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, this.TOKEN_CHECK_INTERVAL);
  }

  /**
   * Detiene el monitoreo de la expiración del token
   */
  private stopTokenMonitoring(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  /**
   * Verifica si el token está próximo a expirar y realiza un logout forzado si es necesario
   */
  private checkTokenExpiration(): void {
    const token = this.getStoredToken();
    if (!token) {
      this.stopTokenMonitoring();
      this.forceLogout(true); // Emitir evento de logout
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expTime = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expTime - currentTime;

    if (timeUntilExpiry < this.TOKEN_WARNING_THRESHOLD) {
      console.warn(`Token expirará en ${timeUntilExpiry} segundos. Forzando logout.`);
      this.forceLogout(true); // Emitir evento de logout
    }
  }

  /**
   * 🔒 MEJORADO: Forza el logout del usuario con razones específicas de seguridad
   */
  private forceLogout(emitEvent: boolean, reason: string = 'token_expired'): void {

    
    this.clearUserSession();
    this.removeAuthToken();
    this.stopTokenMonitoring();
    
    // Deshabilitar autenticación en el interceptor
    this.updateInterceptorConfig({ enableAuth: false });

    if (emitEvent) {

      // Emitir evento para que el AuthGuard y otros componentes sepan
      window.dispatchEvent(new CustomEvent('auth:forceLogout', {
        detail: { 
          reason,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }

  // ====================================================================
  // 🔒 MÉTODOS DE SEGURIDAD EMPRESARIAL
  // ====================================================================

  /**
   * 🔒 SEGURIDAD: Configura la detección de cierre del navegador
   */
  private setupBrowserCloseDetection(): void {
    // Generar ID único para esta sesión/instancia del navegador
    this.currentSessionId = this.generateSessionId();
    localStorage.setItem(this.SESSION_ID_KEY, this.currentSessionId);
    
    // Listener para detectar cierre de navegador
    window.addEventListener('beforeunload', () => {

      // En lugar de marcar como cerrada inmediatamente, marcamos el timestamp
      this.markSessionForValidation();
    });

    // Listener para detectar refresh de página (mantener sesión)
    window.addEventListener('pagehide', (event) => {
      if (event.persisted) {
        // Página se está guardando en caché (back/forward)

      } else {
        // Página se está cerrando - marcar para validación posterior

        this.markSessionForValidation();
      }
    });

    // Listener para detectar cuando la página se carga nuevamente (refresh)
    window.addEventListener('load', () => {

      this.handlePageLoad();
    });
  }

  /**
   * 🔒 SEGURIDAD: Configura el seguimiento de actividad del usuario
   */
  private setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      this.updateLastActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });
  }

  /**
   * 🔒 SEGURIDAD: Verifica si la sesión es de la misma instancia del navegador
   */
  private isValidBrowserSession(): boolean {
    const storedSessionId = localStorage.getItem(this.SESSION_ID_KEY);
    const sessionValidationTimestamp = localStorage.getItem('sessionValidationTimestamp');
    
    // Si no hay ID de sesión almacenado, es una nueva instancia
    if (!storedSessionId) {
      return false;
    }
    
    // Si hay un timestamp de validación, verificar si está dentro del período de gracia
    if (sessionValidationTimestamp) {
      const validationTime = parseInt(sessionValidationTimestamp);
      const currentTime = Date.now();
      const timeDifference = currentTime - validationTime;
      const GRACE_PERIOD = 5000; // 5 segundos de gracia para refresh
      
      if (timeDifference <= GRACE_PERIOD) {

        // Limpiar el timestamp de validación ya que la sesión es válida
        localStorage.removeItem('sessionValidationTimestamp');
        return true;
      } else {

        return false;
      }
    }
    
    // Si es la misma instancia del navegador, es válida
    return storedSessionId === this.currentSessionId;
  }

  /**
   * 🔒 SEGURIDAD: Verifica si la sesión está dentro del tiempo límite (8 horas)
   */
  private isSessionWithinTimeLimit(): boolean {
    const sessionStart = localStorage.getItem(this.SESSION_START_KEY);
    
    if (!sessionStart) {
      return false;
    }
    
    const startTime = parseInt(sessionStart);
    const currentTime = Date.now();
    const sessionDuration = currentTime - startTime;
    
    return sessionDuration < this.SESSION_TIMEOUT;
  }

  /**
   * 🔒 SEGURIDAD: Verifica si la sesión está activa (no más de 30 min de inactividad)
   */
  private isSessionActive(): boolean {
    const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
    
    if (!lastActivity) {
      return false;
    }
    
    const lastActivityTime = parseInt(lastActivity);
    const currentTime = Date.now();
    const inactivityDuration = currentTime - lastActivityTime;
    
    return inactivityDuration < this.INACTIVITY_TIMEOUT;
  }

  /**
   * 🔒 SEGURIDAD: Actualiza el timestamp de última actividad
   */
  private updateLastActivity(): void {
    localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
  }

  /**
   * 🔒 SEGURIDAD: Inicia el monitoreo de inactividad con advertencias
   */
  private startInactivityMonitoring(): void {
    if (this.inactivityCheckInterval) {
      clearInterval(this.inactivityCheckInterval);
    }
    
    this.inactivityCheckInterval = setInterval(() => {
      const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
      
      if (!lastActivity) {
        this.forceLogout(true);
        return;
      }
      
      const lastActivityTime = parseInt(lastActivity);
      const currentTime = Date.now();
      const inactivityDuration = currentTime - lastActivityTime;
      
      // Verificar si debe mostrar advertencia (5 minutos antes del logout)
      const timeUntilLogout = this.INACTIVITY_TIMEOUT - inactivityDuration;
      
      if (timeUntilLogout <= this.INACTIVITY_WARNING_TIME && timeUntilLogout > 0) {
        // Emitir evento de advertencia
        window.dispatchEvent(new CustomEvent('auth:inactivityWarning', {
          detail: { 
            timeRemaining: timeUntilLogout,
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      // Verificar si debe hacer logout por inactividad
      if (!this.isSessionActive()) {

        
        // Emitir evento específico de logout por inactividad
        window.dispatchEvent(new CustomEvent('auth:forceLogout', {
          detail: { 
            reason: 'inactivity',
            timestamp: new Date().toISOString()
          }
        }));
        
        this.forceLogout(false); // false para no emitir evento duplicado
      }
    }, 60000); // Verificar cada minuto
  }

  /**
   * 🔒 SEGURIDAD: Detiene el monitoreo de inactividad
   */
  private stopInactivityMonitoring(): void {
    if (this.inactivityCheckInterval) {
      clearInterval(this.inactivityCheckInterval);
      this.inactivityCheckInterval = null;
    }
  }

  /**
   * 🔒 SEGURIDAD: Genera un ID único para la sesión del navegador
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 🔒 SEGURIDAD: Marca la sesión para validación posterior (en lugar de cerrarla inmediatamente)
   */
  private markSessionForValidation(): void {
    const currentTime = Date.now().toString();
    localStorage.setItem('sessionValidationTimestamp', currentTime);
  }

  /**
   * 🔒 SEGURIDAD: Maneja la carga de la página para determinar si es refresh o nueva instancia
   */
  private handlePageLoad(): void {
    const sessionValidationTimestamp = localStorage.getItem('sessionValidationTimestamp');
    
    if (sessionValidationTimestamp) {
      const validationTime = parseInt(sessionValidationTimestamp);
      const currentTime = Date.now();
      const timeDifference = currentTime - validationTime;
      const GRACE_PERIOD = 5000; // 5 segundos de gracia
      
      if (timeDifference <= GRACE_PERIOD) {

        // Es un refresh, mantener la sesión
        localStorage.removeItem('sessionValidationTimestamp');
        // Actualizar la actividad para resetear el timer de inactividad
        this.updateLastActivity();
      } else {

        // Es una nueva instancia después del cierre, marcar como cerrada
        this.markSessionAsClosed();
      }
    }
  }

  /**
   * 🔒 SEGURIDAD: Marca la sesión como cerrada definitivamente
   */
  private markSessionAsClosed(): void {
    localStorage.setItem('sessionClosed', 'true');
    localStorage.removeItem('sessionValidationTimestamp');
  }

  /**
   * 🔒 SEGURIDAD: Inicializa una nueva sesión con timestamps de seguridad
   */
  private initializeNewSession(): void {
    const now = Date.now().toString();
    localStorage.setItem(this.SESSION_START_KEY, now);
    localStorage.setItem(this.LAST_ACTIVITY_KEY, now);
    localStorage.removeItem('sessionClosed');
    localStorage.removeItem('sessionValidationTimestamp');
    
    // Generar nuevo ID de sesión
    this.currentSessionId = this.generateSessionId();
    localStorage.setItem(this.SESSION_ID_KEY, this.currentSessionId);
  }

  /**
   * 🔒 SEGURIDAD: Limpia todos los datos de sesión de seguridad
   */
  private clearSecuritySessionData(): void {
    localStorage.removeItem(this.LAST_ACTIVITY_KEY);
    localStorage.removeItem(this.SESSION_ID_KEY);
    localStorage.removeItem(this.SESSION_START_KEY);
    localStorage.removeItem('sessionClosed');
    localStorage.removeItem('sessionValidationTimestamp');
    this.stopInactivityMonitoring();
  }
}

// Exportar instancia singleton
export const authService = new AuthService();