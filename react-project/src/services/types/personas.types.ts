/**
 * Interfaces para el servicio de personas
 * Basado en el swagger API del backend
 */

// ===== ENTIDADES PRINCIPALES =====

// Persona básica (entidad del dominio)
export interface Persona {
  personaId: number;
  tipoDoc: number | null;
  nroDoc: string | null;
  codEmpleado: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  nombres: string;
  fotoUrl: string | null;
  estadoLaboral: number;
  fechaNacimiento: string | null;
  fechaIngreso: string | null;
  emailPersonal: string | null;
  celular: string | null;
  direccion: string | null;
  ubigeo: string | null;
  organizacionId: number | null; // NUEVO: Agregado según swagger
  sedeId: number | null; // NUEVO: ID de la sede a la que pertenece la persona (nullable)
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
}

// PersonaDto con información extendida
export interface PersonaDto {
  personaId: number;
  tipoDoc: number | null;
  nroDoc: string | null;
  codEmpleado: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  nombres: string;
  fotoUrl: string | null;
  estadoLaboral: number;
  fechaNacimiento: string | null;
  fechaIngreso: string | null;
  emailPersonal: string | null;
  celular: string | null;
  direccion: string | null;
  ubigeo: string | null;
  organizacionId: number | null; // NUEVO: Agregado según swagger
  sedeId: number | null; // NUEVO: ID de la sede a la que pertenece la persona (nullable)
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string | null;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  version: number;
  nombreUsuarioCreador: string | null;
  nombreUsuarioActualizador: string | null;
  nombreCompleto: string | null;
  edad: number | null;
  tipoDocTexto: string | null;
  estadoLaboralTexto: string | null;
  totalUsuarios: number;
  usuariosActivos: number;
  totalPosiciones: number;
  posicionesActivas: number;
  usuarioActivo: number;
  antiguedadEnDias: number | null;
  antiguedadEnAnios: number | null;
  tieneDocumento: boolean;
  tieneEmail: boolean;
  tieneCelular: boolean;
  tieneFoto: boolean;
  esMayorDeEdad: boolean;
  tieneUsuarios: boolean;
  tienePosiciones: boolean;
  usuarios: UsuarioDto[] | null;
  personaPosiciones: PersonaPosicionSimpleDto[] | null;
}

// DTOs relacionados (simplificados)
export interface UsuarioDto {
  usuarioId: number;
  nombreUsuario: string;
  personaId: number | null;
}

export interface PersonaPosicionSimpleDto {
  personaId: number;
  posicionId: number;
  nombreCompletoPersona: string | null;
  nombrePosicion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  esActiva: boolean;
  estadoPosicion: string | null;
  diasEnPosicion: number;
}

// ===== COMMANDS (REQUESTS) =====

// Crear persona
export interface CreatePersonaCommand {
  tipoDoc: number | null;
  nroDoc: string | null;
  codEmpleado: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  nombres: string;
  fotoUrl: string | null;
  estadoLaboral: number;
  fechaNacimiento: string | null;
  fechaIngreso: string | null;
  emailPersonal: string | null;
  celular: string | null;
  direccion: string | null;
  ubigeo: string | null;
  organizacionId: number | null; // NUEVO: Agregado según swagger
  sedeId: number | null; // NUEVO: ID de la sede a la que pertenece la persona (nullable)
}

// Actualizar persona
export interface UpdatePersonaCommand {
  personaId: number;
  tipoDoc: number | null;
  nroDoc: string | null;
  codEmpleado: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  nombres: string;
  fotoUrl: string | null;
  estadoLaboral: number;
  fechaNacimiento: string | null;
  fechaIngreso: string | null;
  emailPersonal: string | null;
  celular: string | null;
  direccion: string | null;
  ubigeo: string | null;
  organizacionId: number | null; // NUEVO: Agregado según swagger
  sedeId: number | null; // NUEVO: ID de la sede a la que pertenece la persona (nullable)
}

// Crear persona con usuario (nuevo modelo)
export interface CreatePersonaConUsuarioCommand {
  // Datos del usuario (SIN organizacionId - ya no es parte de Usuario)
  crearUsuario: boolean; // 🔧 CAMBIADO: Ahora es un booleano que indica si crear usuario
  nombreUsuario: string;
  password: string;
  tipoUsuarioId: number;
  perfilId: number;
  fechaExpiracion: string | null;
  estadoUsuario: number; // 1 = ACTIVO, 0 = INACTIVO
  
  // Datos de la persona (CON organizacionId - ahora es parte de Persona)
  tipoDoc: number | null;
  nroDoc: string;
  codEmpleado: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  fotoUrl: string;
  estadoLaboral: number;
  fechaNacimiento: string | null;
  fechaIngreso: string | null;
  emailPersonal: string;
  celular: string;
  direccion: string;
  ubigeo: string;
  organizacionId: number | null; // MOVIDO: Ahora es parte de Persona, se toma del localStorage
  sedeId: number | null; // NUEVO: ID de la sede a la que pertenece la persona (nullable)
  
  // 🔧 NUEVO: Flag para indicar si la persona debe tener usuario
  esUsuario: boolean;
}

// Actualizar persona con usuario (nuevo modelo)
export interface UpdatePersonaConUsuarioCommand {
  // Datos del usuario (SIN organizacionId - ya no es parte de Usuario)
  actualizarUsuario: boolean; // 🔧 CAMBIADO: Ahora es un booleano que indica si actualizar usuario
  usuarioId: number;
  nombreUsuario: string;
  password: string;
  tipoUsuarioId: number;
  perfilId: number;
  fechaExpiracion: string | null;
  estadoUsuario: number; // 1 = ACTIVO, 0 = INACTIVO
  
  // Datos de la persona (CON organizacionId - ahora es parte de Persona)
  personaId: number;
  tipoDoc: number | null;
  nroDoc: string;
  codEmpleado: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  fotoUrl: string;
  estadoLaboral: number;
  fechaNacimiento: string | null;
  fechaIngreso: string | null;
  emailPersonal: string;
  celular: string;
  direccion: string;
  ubigeo: string;
  organizacionId: number | null; // MOVIDO: Ahora es parte de Persona, se toma del localStorage
  sedeId: number | null; // NUEVO: ID de la sede a la que pertenece la persona (nullable)
  
  // 🔧 NUEVO: Flag para indicar si la persona debe tener usuario
  esUsuario: boolean;
}

// ===== REQUESTS =====

export interface GetPersonasRequest {
  includeDeleted?: boolean;
}

export interface GetPersonaByIdRequest {
  personaId: number;
  includeDeleted?: boolean;
}

export interface GetPersonaCompletoRequest {
  personaId: number;
}

export interface CreatePersonaRequest extends CreatePersonaCommand {}

export interface UpdatePersonaRequest extends UpdatePersonaCommand {}

export interface CreatePersonaConUsuarioRequest extends CreatePersonaConUsuarioCommand {}

export interface UpdatePersonaConUsuarioRequest extends UpdatePersonaConUsuarioCommand {}

export interface DeletePersonaRequest {
  personaId: number;
  forceDelete?: boolean;
  motivo?: string;
}

// Request para búsqueda paginada
export interface GetPersonasPaginatedRequest {
  // 🔧 NUEVO: Búsqueda genérica que busca en múltiples campos
  searchTerm?: string; // Busca en nombres, apellidos, nroDoc, email, codEmpleado
  
  // Filtros de persona específicos
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nroDoc?: string;
  codEmpleado?: string;
  emailPersonal?: string;
  celular?: string;
  tipoDoc?: number;
  estadoLaboral?: number;
  estado?: number;
  fechaNacimientoDesde?: string;
  fechaNacimientoHasta?: string;
  fechaIngresoDesde?: string;
  fechaIngresoHasta?: string;
  edadDesde?: number;
  edadHasta?: number;
  tieneUsuarios?: boolean;
  tienePosiciones?: boolean;
  tieneDocumento?: boolean;
  tieneEmail?: boolean;
  tieneCelular?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  includeDeleted?: boolean;
  organizacionId?: number; // Filtro por organización
  perfilId?: number; // Filtro por perfil - AGREGADO según endpoint de API
  
  // Paginación
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
}

// ===== RESPONSES =====

export type GetPersonasResponseData = Persona[];
export type GetPersonasDtoResponseData = PersonaDto[];
export type GetPersonaByIdResponseData = Persona;
export type GetPersonaDtoByIdResponseData = PersonaDto;
export type GetPersonaCompletoResponseData = PersonaDto;
export type CreatePersonaResponseData = number; // ID de la persona creada
export type UpdatePersonaResponseData = boolean;
export type CreatePersonaConUsuarioResponseData = number; // ID de la persona creada
export type UpdatePersonaConUsuarioResponseData = boolean;
export type DeletePersonaResponseData = boolean;
export type GetPersonasActivasResponseData = Persona[];
export type GetEstadisticasPersonasResponseData = { [key: string]: number };

// Response paginado
export interface PersonasPaginatedResponseData {
  data: PersonaDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===== TIPOS AUXILIARES =====

// Filtros para búsqueda de personas
export interface PersonaFilters {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nroDoc?: string;
  codEmpleado?: string;
  emailPersonal?: string;
  celular?: string;
  tipoDoc?: number;
  estadoLaboral?: number;
  estado?: number;
  fechaNacimientoDesde?: string;
  fechaNacimientoHasta?: string;
  fechaIngresoDesde?: string;
  fechaIngresoHasta?: string;
  edadDesde?: number;
  edadHasta?: number;
  tieneUsuarios?: boolean;
  tienePosiciones?: boolean;
  tieneDocumento?: boolean;
  tieneEmail?: boolean;
  tieneCelular?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  includeDeleted?: boolean;
  organizacionId?: number; // Filtro por organización
  perfilId?: number; // Filtro por perfil - AGREGADO según endpoint de API
}

// SortOptions y PaginationOptions movidos a common.types.ts para evitar duplicaciones

// Estados de persona
export enum PersonaEstado {
  INACTIVO = 0,
  ACTIVO = 1
}

// TipoDocumento y EstadoLaboral movidos a common.types.ts para evitar duplicaciones

// Tipos de estadísticas
export interface PersonaEstadisticas {
  total: number;
  activos: number;
  inactivos: number;
  conUsuarios: number;
  sinUsuarios: number;
  conPosiciones: number;
  sinPosiciones: number;
  porEdad: { [key: string]: number };
  porEstadoLaboral: { [key: string]: number };
}