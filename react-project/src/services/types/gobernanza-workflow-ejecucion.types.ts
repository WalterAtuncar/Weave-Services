// ================================================================
// TIPOS Y INTERFACES PARA GOBERNANZA WORKFLOW EJECUCION
// ================================================================

import { BaseEntity } from './api.types';

// ================================================================
// ENUMS Y CONSTANTES
// ================================================================

export enum EstadoTareaWorkflow {
  PENDIENTE = 0,
  EN_PROGRESO = 1,
  COMPLETADA = 2,
  CANCELADA = 3,
  SUSPENDIDA = 4
}

export const ESTADO_TAREA_WORKFLOW_LABELS = {
  [EstadoTareaWorkflow.PENDIENTE]: 'Pendiente',
  [EstadoTareaWorkflow.EN_PROGRESO]: 'En Progreso',
  [EstadoTareaWorkflow.COMPLETADA]: 'Completada',
  [EstadoTareaWorkflow.CANCELADA]: 'Cancelada',
  [EstadoTareaWorkflow.SUSPENDIDA]: 'Suspendida'
} as const;

export enum PrioridadTarea {
  BAJA = 1,
  NORMAL = 2,
  ALTA = 3,
  CRITICA = 4
}

export const PRIORIDAD_TAREA_LABELS = {
  [PrioridadTarea.BAJA]: 'Baja',
  [PrioridadTarea.NORMAL]: 'Normal',
  [PrioridadTarea.ALTA]: 'Alta',
  [PrioridadTarea.CRITICA]: 'Crítica'
} as const;

// ================================================================
// ENTIDAD PRINCIPAL
// ================================================================

export interface GobernanzaWorkflowEjecucion extends BaseEntity {
  workflowEjecucionId: number;
  instanciaWorkflowId: number;
  tareaActualId: string;
  usuarioActual: number;
  estadoTarea: EstadoTareaWorkflow;
  fechaInicioTarea: string;
  fechaCompletado?: string;
  observacionesCompletado?: string;
  completadoPor?: number;
  tiempoEstimado?: number; // en minutos
  tiempoReal?: number; // en minutos
  prioridad?: PrioridadTarea;
}

// ================================================================
// DTO ENRIQUECIDO CON JOINS
// ================================================================

export interface GobernanzaWorkflowEjecucionDto extends GobernanzaWorkflowEjecucion {
  // ==========================================
  // DATOS DE INSTANCIA WORKFLOW
  // ==========================================
  instanciaWorkflowNombre?: string;
  instanciaWorkflowEstado?: number;
  diagramaBPMN?: string;

  // ==========================================
  // DATOS DE GOBERNANZA
  // ==========================================
  gobernanzaId?: number;
  gobernanzaNombre?: string;
  tipoGobiernoNombre?: string;
  tipoEntidadNombre?: string;

  // ==========================================
  // DATOS DE USUARIOS
  // ==========================================
  usuarioActualNombre?: string;
  usuarioActualEmail?: string;
  completadoPorNombre?: string;
  completadoPorEmail?: string;

  // ==========================================
  // DATOS DE TAREA
  // ==========================================
  tareaNombre?: string;
  tareaDescripcion?: string;
  tareaTipo?: string;
  tareaConfiguracion?: Record<string, any>;

  // ==========================================
  // PROPIEDADES COMPUTADAS
  // ==========================================
  readonly estadoTareaTexto: string;
  readonly prioridadTexto?: string;
  readonly estaVencida: boolean;
  readonly diasVencimiento?: number;
  readonly porcentajeProgreso: number;
  readonly duracionTexto?: string;
  readonly puedeCompletarse: boolean;
  readonly puedeAsignarse: boolean;
  readonly requiereAtencion: boolean;
}

// ================================================================
// COMANDOS
// ================================================================

export interface CreateGobernanzaWorkflowEjecucionCommand {
  instanciaWorkflowId: number;
  tareaActualId: string;
  usuarioActual: number;
  estadoTarea?: EstadoTareaWorkflow;
  fechaInicioTarea?: string;
  fechaCompletado?: string;
  creadoPor?: number;
}

export interface CompletarTareaCommand {
  workflowEjecucionId: number;
  fechaCompletado?: string;
  observacionesCompletado?: string;
  completadoPor?: number;
}

export interface AsignarTareaCommand {
  workflowEjecucionId: number;
  nuevoUsuarioId: number;
  motivoReasignacion?: string;
  asignadoPor?: number;
}

export interface UpdateTareaCommand {
  workflowEjecucionId: number;
  estadoTarea?: EstadoTareaWorkflow;
  prioridad?: PrioridadTarea;
  tiempoEstimado?: number;
  observaciones?: string;
  actualizadoPor?: number;
}

// ================================================================
// FILTROS PARA CONSULTAS
// ================================================================

export interface GobernanzaWorkflowEjecucionFilters {
  // ==========================================
  // FILTROS DE EJECUCIÓN
  // ==========================================
  instanciaWorkflowId?: number;
  tareaActualId?: string;
  usuarioActual?: number;
  estadoTarea?: EstadoTareaWorkflow;
  prioridad?: PrioridadTarea;
  
  // ==========================================
  // FILTROS DE FECHAS
  // ==========================================
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaCompletadoDesde?: string;
  fechaCompletadoHasta?: string;
  fechaVencimientoDesde?: string;
  fechaVencimientoHasta?: string;

  // ==========================================
  // FILTROS DE GOBERNANZA
  // ==========================================
  gobernanzaId?: number;
  tipoGobiernoId?: number;
  tipoEntidadId?: number;

  // ==========================================
  // FILTROS BOOLEANOS
  // ==========================================
  soloPendientes?: boolean;
  soloEnProgreso?: boolean;
  soloCompletadas?: boolean;
  soloVencidas?: boolean;
  soloAsignadasAMi?: boolean;
  requierenAtencion?: boolean;

  // ==========================================
  // BÚSQUEDA TEXTUAL
  // ==========================================
  searchTerm?: string;
}

// ================================================================
// RESPONSES
// ================================================================

export interface GobernanzaWorkflowEjecucionResponse {
  success: boolean;
  message: string;
  data: GobernanzaWorkflowEjecucion;
}

export interface GobernanzaWorkflowEjecucionListResponse {
  success: boolean;
  message: string;
  data: GobernanzaWorkflowEjecucion[];
}

export interface GobernanzaWorkflowEjecucionDtoResponse {
  success: boolean;
  message: string;
  data: GobernanzaWorkflowEjecucionDto;
}

export interface GobernanzaWorkflowEjecucionDtoListResponse {
  success: boolean;
  message: string;
  data: GobernanzaWorkflowEjecucionDto[];
}

export interface CreateGobernanzaWorkflowEjecucionResponse {
  success: boolean;
  message: string;
  data: number; // ID de la ejecución creada
}

export interface CompletarTareaResponse {
  success: boolean;
  message: string;
  data: boolean;
}

export interface AsignarTareaResponse {
  success: boolean;
  message: string;
  data: boolean;
}

// ================================================================
// TIPOS AUXILIARES PARA UI
// ================================================================

export interface GobernanzaWorkflowEjecucionCardProps {
  ejecucion: GobernanzaWorkflowEjecucionDto;
  onViewDetails?: (ejecucion: GobernanzaWorkflowEjecucionDto) => void;
  onCompletar?: (ejecucion: GobernanzaWorkflowEjecucionDto) => void;
  onAsignar?: (ejecucion: GobernanzaWorkflowEjecucionDto) => void;
  onCancelar?: (ejecucion: GobernanzaWorkflowEjecucionDto) => void;
  showActions?: boolean;
  showUserInfo?: boolean;
}

export interface GobernanzaWorkflowEjecucionTableColumn {
  key: keyof GobernanzaWorkflowEjecucionDto;
  label: string;
  sortable?: boolean;
  width?: number;
  render?: (value: any, ejecucion: GobernanzaWorkflowEjecucionDto) => React.ReactNode;
}

// ================================================================
// TIPOS PARA FORMULARIOS
// ================================================================

export interface GobernanzaWorkflowEjecucionFormData extends Omit<CreateGobernanzaWorkflowEjecucionCommand, 'creadoPor'> {
  // Datos del formulario sin creadoPor (se asigna automáticamente)
}

export interface CompletarTareaFormData extends Omit<CompletarTareaCommand, 'completadoPor'> {
  // Datos del formulario sin completadoPor (se asigna automáticamente)
}

export interface AsignarTareaFormData extends Omit<AsignarTareaCommand, 'asignadoPor'> {
  // Datos del formulario sin asignadoPor (se asigna automáticamente)
}

// ================================================================
// TIPOS PARA VALIDACIÓN
// ================================================================

export interface GobernanzaWorkflowEjecucionValidationErrors {
  instanciaWorkflowId?: string;
  tareaActualId?: string;
  usuarioActual?: string;
  estadoTarea?: string;
  fechaInicioTarea?: string;
  fechaCompletado?: string;
  general?: string;
}

export interface CompletarTareaValidationErrors {
  workflowEjecucionId?: string;
  fechaCompletado?: string;
  observacionesCompletado?: string;
  general?: string;
}

export interface AsignarTareaValidationErrors {
  workflowEjecucionId?: string;
  nuevoUsuarioId?: string;
  motivoReasignacion?: string;
  general?: string;
}

// ================================================================
// TIPOS PARA DASHBOARD Y MÉTRICAS
// ================================================================

export interface TareasPendientesUsuario {
  usuarioId: number;
  usuarioNombre: string;
  totalPendientes: number;
  tareasVencidas: number;
  tareasProximasAVencer: number;
  tiempoPromedioCompletamiento?: number;
  eficiencia?: number; // porcentaje
}

export interface MetricasTareasWorkflow {
  totalTareas: number;
  tareasPendientes: number;
  tareasEnProgreso: number;
  tareasCompletadas: number;
  tareasCanceladas: number;
  tiempoPromedioEjecucion?: number;
  tasaCompletamiento: number;
  usuarioMasActivo?: TareasPendientesUsuario;
  tareaMasComun?: {
    tareaId: string;
    tareaNombre: string;
    cantidadEjecuciones: number;
  };
}

// ================================================================
// TIPOS PARA NOTIFICACIONES
// ================================================================

export interface NotificacionTarea {
  tipo: 'vencimiento' | 'asignacion' | 'completado' | 'cancelado';
  tareaId: number;
  tareaNombre: string;
  usuarioId: number;
  fechaVencimiento?: string;
  prioridad: PrioridadTarea;
  mensaje: string;
  enviado: boolean;
  fechaEnvio?: string;
}

// ================================================================
// TIPOS PARA WORKFLOW ENGINE
// ================================================================

export interface WorkflowContext {
  instanciaId: number;
  variables: Record<string, any>;
  usuarioActual: number;
  fechaInicio: string;
  estado: EstadoTareaWorkflow;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  condition?: string;
  variables?: Record<string, any>;
  requiredRole?: string;
  timeoutMinutes?: number;
}

export interface WorkflowTask {
  id: string;
  name: string;
  type: 'user' | 'service' | 'script' | 'parallel' | 'gateway';
  description?: string;
  assignee?: number;
  candidateUsers?: number[];
  candidateGroups?: string[];
  formKey?: string;
  executionListener?: string;
  dueDate?: string;
  priority?: PrioridadTarea;
  properties?: Record<string, any>;
}

// ================================================================
// TIPOS PARA AUDITORÍA
// ================================================================

export interface TareaAuditLog {
  auditId: number;
  workflowEjecucionId: number;
  accion: 'created' | 'assigned' | 'completed' | 'cancelled' | 'updated';
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  valorAnterior?: any;
  valorNuevo?: any;
  observaciones?: string;
  ipAddress?: string;
  userAgent?: string;
}