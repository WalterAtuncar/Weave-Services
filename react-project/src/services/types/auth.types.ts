/**
 * Interfaces para el servicio de autenticación
 */

// Request de login
export interface LoginRequest {
  nombreUsuario: string;
  password: string;
  authAD: boolean;
}

// Usuario del response de autenticación
export interface UsuarioAuth {
  usuarioId: number;
  nombreUsuario: string;
  tipoUsuarioId: number;
  personaId: number;
  perfilId: number;
  fechaExpiracion: string;
  esActivo: boolean;
  nombre: string;
  nombreCompleto: string;
  fotoUrl: string;
}

// Organización del response
export interface OrganizacionLogin {
  organizacionId: number;
  codigo: string;
  razonSocial: string;
  nombreComercial: string;
  numeroDocumento: string;
  direccion: string;
  ubicacionCompleta: string;
}

// Rol de gobernanza del usuario
export interface UsuarioGobernanzaRol {
  gobernanzaRolId: number;
  gobernanzaId: number;
  rolGobernanzaId: number;
  usuarioId: number;
  rolGobernanzaCodigo: string | null;
  rolGobernanzaNombre: string | null;
  rolGobernanzaDescripcion: string | null;
  color: string | null;
  tipoEntidadId: number;
  nombre: string | null; // Nombre de la gobernanza
}

// Menu item del response
export interface MenuItem {
  menuId: number;
  menuPadreId: number | null;
  titulo: string;
  ruta: string | null;
  tipoIcono: string;
  icono: string;
  clase: string;
  esTituloGrupo: boolean;
  badge: string | null;
  badgeClase: string | null;
  menusHijos: MenuItem[];
  tituloMenuPadre: string | null;
}

// Data del response de login
export interface LoginResponseData {
  success: boolean;
  message: string;
  usuario: UsuarioAuth;
  menu: MenuItem[];
  token: string;
  organizacion: OrganizacionLogin | null;
  gobernanzaRol: UsuarioGobernanzaRol | null;
}

// Datos del usuario para localStorage
export interface UserSession {
  usuario: UsuarioAuth;
  token: string;
  menu: MenuItem[];
  organizacion: OrganizacionLogin | null;
  gobernanzaRol: UsuarioGobernanzaRol | null;
}

// ===== TIPOS PARA RECUPERACIÓN DE CONTRASEÑA =====

// Request para solicitar código de recuperación
export interface SolicitarCodigoRequest {
  email: string;
}

// Response data para solicitar código
export interface SolicitarCodigoResponseData {
  message: string;
  emailOriginal: string;
  emailEnviadoA: string;
  codigoExpiraEn: string;
  nota?: string;
}

// Request para validar código
export interface ValidarCodigoRequest {
  email: string;
  codigo: string;
}

// Request para cambiar contraseña
export interface CambiarContrasenaRequest {
  email: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

// ===== TIPOS PARA VALIDACIÓN DE ACTIVE DIRECTORY =====

// Response data para validar configuración AD
export interface ValidarAdResponseData {
  esValida: boolean;
  organizacionId: number;
  razonSocial: string;
  dominio: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  instancia: string;
  callbackPath: string;
  mensaje: string;
  camposConfigurados: string[];
  camposFaltantes: string[];
}

// Metadata para validación AD
export interface ValidarAdMetadata {
  dominio: string;
  tipoValidacion: string;
  fechaValidacion: string;
  endpointPublico: boolean;
  organizacionId: number;
  razonSocial: string;
}

// ===== TIPOS PARA AUTENTICACIÓN FEDERADA CON MSAL =====

// Configuración de MSAL
export interface MsalConfig {
  auth: {
    clientId: string;
    authority: string;
    redirectUri: string;
  };
  cache: {
    cacheLocation: 'localStorage' | 'sessionStorage';
    storeAuthStateInCookie: boolean;
  };
}

// Request para login federado
export interface FederatedLoginRequest {
  scopes: string[];
  dominio: string;
  organizacionId: number;
}

// Response del login federado
export interface FederatedLoginResponse {
  accessToken: string;
  idToken: string;
  account: {
    homeAccountId: string;
    environment: string;
    tenantId: string;
    username: string;
    name: string;
  };
}

// Estado de autenticación federada
export interface FederatedAuthState {
  isConfigured: boolean;
  isAuthenticated: boolean;
  config: ValidarAdResponseData | null;
  msalInstance: any; // PublicClientApplication from @azure/msal-browser
  account: any | null; // AccountInfo from @azure/msal-browser
} 