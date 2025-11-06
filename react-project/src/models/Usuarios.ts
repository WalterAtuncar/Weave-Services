export interface Usuario {
  usuarioId: number;
  tipoUsuarioId: number;
  personaId: number;
  perfilId: number;
  nombreUsuario: string;
  hashPassword: string;
  fechaExpiracion: string | null;
  nombrePerfil: string;
  descripcionPerfil: string;
  estado: number; // 1 = ACTIVO, 0 = INACTIVO
  creadoPor: number;
  fechaCreacion: string;
  actualizadoPor: number;
  fechaActualizacion: string;
  registroEliminado: boolean;
  version: number;
  passwordExpirado: boolean;
  diasParaExpiracion: number;
  // CAMPOS LEGACY (mantener por compatibilidad)
  esSuperAdmin?: boolean;
  organizacionActual?: number | null;
}

export interface UsuarioFormData {
  tipoUsuarioId?: number;
  personaId: number;
  perfilId: number;
  nombreUsuario: string;
  hashPassword: string;
  fechaExpiracion: string | null;
  estado: number; // 1 = ACTIVO, 0 = INACTIVO
  // Campos del perfil (automáticos desde API)
  nombrePerfil?: string;
  descripcionPerfil?: string;
  // CAMPOS LEGACY (mantener por compatibilidad)
  esSuperAdmin?: boolean;
  organizacionActual?: number | null;
}

export interface UsuariosData {
  usuarios: Usuario[];
}

// Estados de usuario
export const ESTADOS_USUARIO = [
  { value: 1, label: 'ACTIVO' },
  { value: 0, label: 'INACTIVO' }
] as const;

// DEPRECATED: Ya no usar - Los perfiles ahora vienen directamente del API
// con nombrePerfil y descripcionPerfil
export const PERFILES_USUARIO = [
  { value: 1, label: 'Administrador' },
  { value: 2, label: 'Usuario' },
  { value: 3, label: 'Supervisor' },
  { value: 4, label: 'Operador' }
] as const;

// Helper para obtener el nombre del perfil desde el usuario
export const getPerfilName = (usuario: Usuario): string => {
  return usuario.nombrePerfil || 'No especificado';
};

// Helper para obtener la descripción del perfil desde el usuario  
export const getPerfilDescription = (usuario: Usuario): string => {
  return usuario.descripcionPerfil || 'Sin descripción';
}; 