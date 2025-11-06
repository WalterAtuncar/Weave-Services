// ==========================================
// ENUMS
// ==========================================

// ===== ENUMS ESPECÍFICOS DE POSICIONES =====
export enum CategoriaPosicion {
  Directivo = 1,
  Gerencial = 2,
  Jefatura = 3,
  Supervisorio = 4,
  Analista = 5,
  Especialista = 6,
  Tecnico = 7,
  Operativo = 8,
  Practicante = 9
}

export enum EstadoPosicion {
  Inactivo = 0,
  Activo = 1,
  Suspendido = 2,
  Eliminado = 3
}

// ==========================================
// INTERFACES PRINCIPALES
// ==========================================

export interface Posicion {
  // Campos de auditoría base
  version: number;
  estado: number;
  creadoPor?: number;
  fechaCreacion: string;
  actualizadoPor?: number;
  fechaActualizacion?: string;
  registroEliminado: boolean;

  // Campos específicos de Posicion
  posicionId: number;
  unidadesOrgId: number;
  nombre: string;
  categoria?: number;
  objetivo?: string;
  ordenImpresion?: number;

  // Relaciones
  unidadOrganizacional?: any; // UnidadOrg
  personaPosiciones?: any[]; // PersonaPosicion[]

  // Campos calculados
  categoriaTexto?: string;
}

export interface PosicionDto {
  // Información básica de la posición
  posicionId: number;
  unidadesOrgId: number;
  nombre?: string;
  categoria?: number;
  objetivo?: string;
  ordenImpresion?: number;
  categoriaTexto?: string;

  // Información de la unidad organizacional
  nombreUnidadOrg?: string;
  nombreCortoUnidadOrg?: string;
  tipoUnidadOrg?: number;
  tipoUnidadOrgTexto?: string;
  centroCostoUnidadOrg?: string;
  
  // Información de la organización
  organizacionId?: number;
  codigoOrganizacion?: string;
  razonSocialOrganizacion?: string;
  nombreComercialOrganizacion?: string;
  
  // Jerarquía
  unidadPadreId?: number;
  nombreUnidadPadre?: string;
  rutaJerarquica?: string;
  jerarquiaNombres?: string[];

  // Estadísticas de personas
  cantidadPersonasAsignadas: number;
  cantidadPersonasActivas: number;
  cantidadPersonasInactivas: number;
  cantidadHistorialAsignaciones: number;

  // Estados y flags
  estaVacante: boolean;
  estaOcupada: boolean;
  tieneMultiplesPersonas: boolean;
  requiereAtencion: boolean;

  // Fechas importantes
  fechaUltimaAsignacion?: string;
  fechaUltimaDesasignacion?: string;
  fechaProximoVencimiento?: string;
  diasHastaVencimiento?: number;

  // Auditoría
  fechaCreacion: string;
  fechaModificacion?: string;
  creadoPor?: number;
  modificadoPor?: number;
  estado: number;
  registroEliminado: boolean;
  fechaEliminacion?: string;
  eliminadoPor?: number;

  // Clasificaciones
  esPosicionCritica: boolean;
  esPosicionDirectiva: boolean;
  esPosicionOperativa: boolean;

  // Permisos
  puedeEliminar: boolean;
  puedeMover: boolean;
  motivoNoEliminar?: string;

  // Métricas
  porcentajeOcupacion?: number;
}

// ==========================================
// COMMANDS
// ==========================================

export interface CreatePosicionCommand {
  unidadesOrgId: number;
  nombre: string;
  categoria?: number;
  objetivo?: string;
  ordenImpresion?: number;
  activarInmediatamente: boolean;
  validarNombreUnico: boolean;
  asignarOrdenAutomatico: boolean;
  notificarCreacion: boolean;
  creadoPor?: number;
  observaciones?: string;
  
  // Campos calculados de solo lectura
  readonly esPosicionCritica: boolean;
  readonly esPosicionOperativa: boolean;
  readonly requiereAprobacion: boolean;
}

export interface UpdatePosicionCommand {
  posicionId: number;
  nombre?: string;
  categoria?: number;
  objetivo?: string;
  ordenImpresion?: number;
  unidadesOrgId?: number;
  
  // Flags de actualización
  actualizarNombre: boolean;
  actualizarCategoria: boolean;
  actualizarObjetivo: boolean;
  actualizarOrdenImpresion: boolean;
  actualizarUnidadOrg: boolean;
  validarNombreUnico: boolean;
  validarJerarquia: boolean;
  
  // Auditoría
  actualizadoPor?: number;
  motivoActualizacion?: string;
  observaciones?: string;
}

export interface DeletePosicionCommand {
  posicionId: number;
  forceDelete: boolean;
  desactivarEnLugarDeEliminar: boolean;
  reasignarPersonas: boolean;
  validarDependencias: boolean;
  nuevaPosicionId?: number;
  notificarPersonasAfectadas: boolean;
  eliminadoPor?: number;
  motivoEliminacion?: string;
  observaciones?: string;
}

export interface MoverPosicionCommand {
  posicionId: number;
  nuevaUnidadOrgId: number;
  movidoPor?: number;
  motivoMovimiento?: string;
  observaciones?: string;
  validarJerarquia: boolean;
  notificarPersonasAsignadas: boolean;
}

export interface DuplicarPosicionCommand {
  posicionOrigenId: number;
  nuevoNombre: string;
  nuevaUnidadOrgId?: number;
  nuevaCategoria?: number;
  nuevoObjetivo?: string;
  nuevoOrdenImpresion?: number;
  creadoPor?: number;
  observaciones?: string;
  activarInmediatamente: boolean;
}

// ==========================================
// FILTROS Y PARÁMETROS
// ==========================================

export interface GetPosicionesParams {
  includeDeleted?: boolean;
  unidadOrgId?: number;
  categoria?: number;
  soloActivas?: boolean;
  soloVacantes?: boolean;
  soloCriticas?: boolean;
}

export interface SearchPosicionesParams {
  searchTerm?: string;
  unidadOrgId?: number;
  categoria?: number;
}

export interface GetPosicionesPaginatedParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  unidadOrgId?: number;
  categoria?: number;
  soloVacantes?: boolean;
  soloCriticas?: boolean;
  includeDeleted?: boolean;
}

// ==========================================
// TIPOS DE RESPUESTA
// ==========================================

export interface GetPosicionResponse {
  success: boolean;
  message?: string;
  data: Posicion;
}

export interface GetPosicionesResponse {
  success: boolean;
  message?: string;
  data: Posicion[];
}

export interface GetPosicionDtoResponse {
  success: boolean;
  message?: string;
  data: PosicionDto;
}

export interface GetPosicionesDtoResponse {
  success: boolean;
  message?: string;
  data: PosicionDto[];
}

export interface GetPosicionesPaginatedResponse {
  success: boolean;
  message?: string;
  data: {
    data: PosicionDto[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  };
}

export interface CreatePosicionResponse {
  success: boolean;
  message?: string;
  data: number; // ID de la posición creada
}

export interface UpdatePosicionResponse {
  success: boolean;
  message?: string;
  data: boolean;
}

export interface DeletePosicionResponse {
  success: boolean;
  message?: string;
  data: boolean;
}

export interface MoverPosicionResponse {
  success: boolean;
  message?: string;
  data: boolean;
}

export interface DuplicarPosicionResponse {
  success: boolean;
  message?: string;
  data: number; // ID de la nueva posición duplicada
}

export interface GetEstadisticasPosicionesResponse {
  success: boolean;
  message?: string;
  data: Record<string, number>;
}

export interface ActivarDesactivarPosicionResponse {
  success: boolean;
  message?: string;
  data: boolean;
}

// ==========================================
// CONSTANTES ÚTILES
// ==========================================

export const CATEGORIAS_POSICION = [
  { value: CategoriaPosicion.Directiva, label: 'Directiva' },
  { value: CategoriaPosicion.Gerencial, label: 'Gerencial' },
  { value: CategoriaPosicion.Jefatura, label: 'Jefatura' },
  { value: CategoriaPosicion.Coordinacion, label: 'Coordinación' },
  { value: CategoriaPosicion.Especialista, label: 'Especialista' },
  { value: CategoriaPosicion.Tecnico, label: 'Técnico' },
  { value: CategoriaPosicion.Operativo, label: 'Operativo' },
  { value: CategoriaPosicion.Apoyo, label: 'Apoyo' },
  { value: CategoriaPosicion.Externo, label: 'Externo' }
];

export const ESTADOS_POSICION = [
  { value: EstadoPosicion.Inactivo, label: 'Inactivo' },
  { value: EstadoPosicion.Activo, label: 'Activo' },
  { value: EstadoPosicion.Suspendido, label: 'Suspendido' },
  { value: EstadoPosicion.Eliminado, label: 'Eliminado' }
];

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export type PosicionStatus = 'vacante' | 'ocupada' | 'multiple' | 'critica';

export interface PosicionSummary {
  posicionId: number;
  nombre: string;
  categoria: number;
  categoriaTexto: string;
  nombreUnidadOrg: string;
  estaVacante: boolean;
  esPosicionCritica: boolean;
  cantidadPersonasAsignadas: number;
}

export interface PosicionFiltros {
  unidadOrgId?: number;
  categoria?: number;
  estado?: EstadoPosicion;
  esCritica?: boolean;
  estaVacante?: boolean;
  searchTerm?: string;
}

// ==========================================
// HELPERS DE VALIDACIÓN
// ==========================================

export const validarCreatePosicionCommand = (command: CreatePosicionCommand): string[] => {
  const errors: string[] = [];
  
  if (!command.unidadesOrgId || command.unidadesOrgId <= 0) {
    errors.push('La unidad organizacional es requerida');
  }
  
  if (!command.nombre || command.nombre.trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }
  
  if (command.nombre && command.nombre.length > 200) {
    errors.push('El nombre no puede exceder 200 caracteres');
  }
  
  if (command.categoria && (command.categoria < 1 || command.categoria > 9)) {
    errors.push('La categoría debe estar entre 1 y 9');
  }
  
  if (command.objetivo && command.objetivo.length > 1000) {
    errors.push('El objetivo no puede exceder 1000 caracteres');
  }
  
  if (command.ordenImpresion && (command.ordenImpresion < 1 || command.ordenImpresion > 999)) {
    errors.push('El orden de impresión debe estar entre 1 y 999');
  }
  
  return errors;
};

export const validarUpdatePosicionCommand = (command: UpdatePosicionCommand): string[] => {
  const errors: string[] = [];
  
  if (!command.posicionId || command.posicionId <= 0) {
    errors.push('El ID de la posición es requerido');
  }
  
  if (command.nombre && (command.nombre.trim().length < 3 || command.nombre.length > 200)) {
    errors.push('El nombre debe tener entre 3 y 200 caracteres');
  }
  
  if (command.categoria && (command.categoria < 1 || command.categoria > 9)) {
    errors.push('La categoría debe estar entre 1 y 9');
  }
  
  if (command.objetivo && command.objetivo.length > 1000) {
    errors.push('El objetivo no puede exceder 1000 caracteres');
  }
  
  if (command.ordenImpresion && (command.ordenImpresion < 1 || command.ordenImpresion > 999)) {
    errors.push('El orden de impresión debe estar entre 1 y 999');
  }
  
  return errors;
}; 