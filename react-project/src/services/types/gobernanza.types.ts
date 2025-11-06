/**
 * Tipos para el servicio de Gobernanza
 * Actualizado según el nuevo modelo de datos del Domain.Entities.Governance
 */

import { ApiResponse } from './api.types';

// ==========================================
// ENUMS Y CONSTANTES
// ==========================================

export enum EstadoGobernanza {
  INACTIVO = 0,
  ACTIVO = 1,
  SUSPENDIDO = 2,
  REVOCADO = 3
}

export const ESTADO_GOBERNANZA_LABELS = {
  [EstadoGobernanza.INACTIVO]: 'Inactivo',
  [EstadoGobernanza.ACTIVO]: 'Activo',
  [EstadoGobernanza.SUSPENDIDO]: 'Suspendido',
  [EstadoGobernanza.REVOCADO]: 'Revocado'
} as const;

// ==========================================
// TIPOS EXISTENTES
// ==========================================

export interface Gobernanza {
  gobernanzaId: number;
  tipoGobiernoId: number;
  tipoEntidadId: number;
  entidadId: number;
  organizacionId?: number;
  nombre?: string;
  fechaAsignacion: string;
  fechaVencimiento?: string;
  observaciones?: string;
  // Campos base de entidad
  version: number;
  estado: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
  // Relaciones
  tipoGobierno?: any;
  tipoEntidad?: any;
  gobernanzaRoles?: GobernanzaRol[];
  historialGobernanzas?: any[];
}

// ✅ NUEVA ENTIDAD: Tabla de unión entre Gobernanza y Roles/Usuarios
export interface GobernanzaRol {
  gobernanzaRolId: number
  gobernanzaId: number;
  rolGobernanzaId: number;
  usuarioId: number;
  fechaAsignacion: string;
  ordenEjecucion: number; // Orden de aprobación del rol
  puedeEditar: boolean; // Indica si puede editar la entidad
  estado: number; // ✅ CAMBIADO: Ahora es int, no boolean
  // Campos de auditoría específicos (NO heredan de BaseEntity)
  version: number;
  creadoPor: string; // ✅ CAMBIADO: Ahora es string, no number
  fechaCreacion: string;
  actualizadoPor?: string; // ✅ CAMBIADO: Ahora es string, no number
  fechaActualizacion?: string;
  registroEliminado: boolean;
  // Relaciones opcionales
  gobernanza?: Gobernanza;
  rolGobernanza?: any; // RolGobernanza del sistema
  usuario?: any; // Usuario del sistema
  // Propiedades calculadas
  estadoTexto?: string;
  diasDesdeLaAsignacion?: number;
}

export interface GobernanzaDto {
  gobernanzaId: number;
  tipoGobiernoId: number;
  tipoEntidadId: number;
  entidadId: number;
  organizacionId?: number;
  nombre?: string;
  fechaAsignacion: string;
  fechaVencimiento?: string;
  observaciones?: string;
  // Campos base de entidad
  version: number;
  estado: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;
  // Propiedades calculadas
  diasParaVencimiento?: number;
  usuarioId?: number;
  usuarioNombre?: string;
  usuarioEmail?: string;
  // Propiedades enriquecidas desde el backend
  nombreEntidad?: string;
  nombreEmpresa?: string;
}

// ==========================================
// NUEVOS TIPOS PARA EL ENDPOINT DE GOBERNANZA POR TIPO DE ENTIDAD
// ==========================================

/**
 * DTO de respuesta para la información completa de gobernanza por tipo de entidad
 */
export interface GobernanzaByTipoEntidadResultDto {
  // Información del tipo de entidad
  tipoEntidadId: number;
  tipoEntidadCodigo: string;
  tipoEntidadNombre: string;
  tipoEntidadDescripcion?: string;

  // Información de la gobernanza
  gobernanzaId?: number;
  nombreGobernanza?: string;
  fechaAsignacion?: string;
  fechaVencimiento?: string;
  observaciones?: string;
  estadoGobernanza: string;

  // Roles y usuarios asignados
  rolesGobernanza: RolGobernanzaConUsuariosDto[];

  // Propiedades calculadas
  totalUsuariosAsignados: number;
  tieneGobernanzaConfigurada: boolean;
  fechaCreacionGobernanza?: string;
  creadoPorGobernanza?: string;
}

/**
 * DTO para rol de gobernanza con usuarios asignados
 */
export interface RolGobernanzaConUsuariosDto {
  rolGobernanzaId: number;
  rolGobernanzaCodigo: string;
  rolGobernanzaNombre: string;
  rolGobernanzaDescripcion?: string;
  nivel: number;
  color?: string;
  estadoRol: string;

  // Usuarios asignados a este rol
  usuariosAsignados: UsuarioGobernanzaDto[];

  // Propiedades calculadas
  totalUsuariosEnRol: number;
  usuariosActivos: number;
}

/**
 * DTO para usuario asignado en gobernanza
 * ✅ CORREGIDO: Ahora coincide exactamente con el backend
 */
export interface UsuarioGobernanzaDto {
  usuarioId: number;
  nombreUsuario: string;
  
  // Información de la persona
  personaId?: number;
  nombreCompleto: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  emailPersonal?: string;
  celular?: string;
  nroDoc?: string;
  codEmpleado?: string;
  estadoLaboral: number;
  estadoLaboralTexto: string;

  // Información de la posición actual
  posicionId?: number;
  nombrePosicion?: string;
  descripcionPosicion?: string;
  categoriaPosicion?: number;
  categoriaPosicionTexto?: string;

  // Información de la unidad organizacional
  unidadOrgId?: number;
  nombreUnidadOrg?: string;
  descripcionUnidadOrg?: string;
  tipoUnidadOrg?: number;
  codigoUnidadOrg?: string;

  // Información de la organización
  organizacionId?: number;
  nombreOrganizacion?: string;
  codigoOrganizacion?: string;

  // Información de la sede
  sedeId?: number;
  nombreSede?: string;
  descripcionSede?: string;

  // Información de la asignación en gobernanza
  gobernanzaRolId: number;
  fechaAsignacion: string;
  ordenEjecucion: number; // Orden de ejecución del usuario en el rol
  puedeEditar: boolean; // Indica si puede editar la entidad
  estado: string;
  creadoPor?: string;
  fechaCreacion: string;

  // Propiedades calculadas
  nombreCompletoConPosicion: string;
  informacionCompleta: string;
  diasDesdeAsignacion: number;
  esAsignacionVigente: boolean;
}

// ==========================================
// COMMANDS PARA OPERACIONES CRUD
// ==========================================

export interface CreateGobernanzaCommand {
  tipoGobiernoId: number;
  tipoEntidadId: number;
  entidadId: number;
  organizacionId?: number;
  nombre?: string;
  fechaAsignacion: string;
  fechaVencimiento?: string;
  observaciones?: string;
  tipoFlujo?: string; // Tipo de flujo del workflow: SECUENCIAL o PARALELO
  gobernanzaRoles: GobernanzaRolDto[];
  creadoPor?: number;
}

export interface GobernanzaRolDto {
  gobernanzaRolId?: number;
  rolGobernanzaId: number;
  usuarioId: number;
  fechaAsignacion: Date;
  ordenEjecucion?: number; // Orden de aprobación del rol (opcional con valor por defecto 0)
  puedeEditar?: boolean; // Indica si puede editar la entidad (opcional con valor por defecto false)
  estadoActivo?: number;
  estado?: number;
}

export interface UpdateGobernanzaCommand {
  gobernanzaId: number;
  tipoGobiernoId?: number;
  tipoEntidadId?: number;
  entidadId?: number;
  organizacionId?: number;
  nombre?: string;
  fechaAsignacion?: string;
  fechaVencimiento?: string;
  observaciones?: string;
  tipoFlujo?: string; // Tipo de flujo del workflow: SECUENCIAL o PARALELO
  gobernanzaRoles?: GobernanzaRolDto[];
  actualizadoPor?: number;
}

export interface AsignarGobernanzaCommand {
  tipoGobiernoId: number;
  tipoEntidadId: number;
  entidadId: number;
  organizacionId?: number;
  rolGobernanzaId: number;
  usuarioId: number;
  fechaAsignacion: string;
  fechaVencimiento?: string;
  observaciones?: string;
  validarReglas?: boolean;
  permitirDuplicados?: boolean;
  notificarAsignacion?: boolean;
  crearHistorial?: boolean;
  creadoPor?: number;
  // Propiedad calculada
  duracionEnDias?: number;
}

export interface RevocarGobernanzaCommand {
  gobernanzaId: number;
  fechaRevocacion: string;
  motivoRevocacion: string;
  observacionesRevocacion?: string;
  esRevocacionDefinitiva?: boolean;
  notificarUsuario?: boolean;
  crearHistorial?: boolean;
  validarObligatoriedadRol?: boolean;
  revocadoPor?: number;
}

export interface TransferirGobernanzaCommand {
  gobernanzaId: number;
  usuarioDestinoId: number;
  fechaTransferencia: string;
  motivoTransferencia: string;
  observacionesTransferencia?: string;
  notificarUsuarioOrigen?: boolean;
  notificarUsuarioDestino?: boolean;
  crearHistorial?: boolean;
  transferidoPor?: number;
}

// ==========================================
// REQUESTS PARA CONSULTAS
// ==========================================

export interface GetGobernanzaPaginatedRequest {
  page: number;
  pageSize: number;
  orderBy?: string;
  ascending?: boolean;
  filters?: GobernanzaFilters;
}

export interface GetGobernanzaByFiltersRequest {
  tipoGobiernoId?: number;
  tipoEntidadId?: number;
  entidadId?: number;
  organizacionId?: number; // 🔧 Agregado para filtrar por organización
  usuarioId?: number;
  includeDeleted?: boolean;
  soloProximasAVencer?: boolean;
  soloVencidas?: boolean;
}

export interface GobernanzaFilters {
  tipoGobiernoId?: number;
  tipoEntidadId?: number;
  entidadId?: number;
  organizacionId?: number;
  usuarioId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: number;
}

// ==========================================
// RESPONSES
// ==========================================

export interface CreateGobernanzaResponse {
  gobernanzaId: number;
  message: string;
}

export interface UpdateGobernanzaResponse {
  success: boolean;
  message: string;
}

export interface GobernanzaPaginatedResponseData {
  items: GobernanzaDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface GetGobernanzaResponse {
  success: boolean;
  data: GobernanzaDto;
  message: string;
  errors?: string[];
  statusCode?: number;
  metadata?: string;
}

export interface GetGobernanzaListResponse {
  success: boolean;
  data: GobernanzaDto[];
  message: string;
  errors?: string[];
  statusCode?: number;
  metadata?: string;
}

export interface GetGobernanzaPaginatedResponse {
  success: boolean;
  data: GobernanzaPaginatedResponseData;
  message: string;
  errors?: string[];
  statusCode?: number;
  metadata?: string;
}

export interface AsignarGobernanzaResponse {
  gobernanzaRolId: number;
  message: string;
}

export interface TransferirGobernanzaResponse {
  success: boolean;
  message: string;
}

export interface RevocarGobernanzaResponse {
  success: boolean;
  message: string;
}

export interface GetTipoGobiernoListResponse {
  success: boolean;
  data: any[];
  message: string;
  errors?: string[];
  statusCode?: number;
  metadata?: string;
}

export interface GetTipoEntidadListResponse {
  success: boolean;
  data: any[];
  message: string;
  errors?: string[];
  statusCode?: number;
  metadata?: string;
}

export interface GetRolGobernanzaListResponse {
  success: boolean;
  data: any[];
  message: string;
  errors?: string[];
  statusCode?: number;
  metadata?: string;
}