// ================================================================
// TIPOS Y INTERFACES PARA GOBERNANZA INSTANCIA WORKFLOW
// ================================================================

import { BaseEntity, PaginatedRequest } from './api.types';
import { PagedResult } from './common.types';

// ================================================================
// ENUMS Y CONSTANTES
// ================================================================

export enum EstadoInstanciaWorkflow {
  PENDIENTE = 0,
  EN_PROGRESO = 1,
  COMPLETADO = 2,
  CANCELADO = 3
}

export const ESTADO_INSTANCIA_WORKFLOW_LABELS = {
  [EstadoInstanciaWorkflow.PENDIENTE]: 'Pendiente',
  [EstadoInstanciaWorkflow.EN_PROGRESO]: 'En Progreso',
  [EstadoInstanciaWorkflow.COMPLETADO]: 'Completado',
  [EstadoInstanciaWorkflow.CANCELADO]: 'Cancelado'
} as const;

// ================================================================
// ENTIDAD PRINCIPAL
// ================================================================

export interface GobernanzaInstanciaWorkflow extends BaseEntity {
  instanciaWorkflowId: number;
  gobernanzaWorkflowId: number;
  gobernanzaId?: number;
  diagramaBPMN?: string;
  estadoInstancia: EstadoInstanciaWorkflow;
  fechaInicio: string;
  fechaFinalizacion?: string;
  iniciadoPor: number;
}

// ================================================================
// DTO ENRIQUECIDO CON JOINS
// ================================================================

export interface GobernanzaInstanciaWorkflowEnrichedDto extends BaseEntity {
  // ==========================================
  // DATOS DE INSTANCIA WORKFLOW
  // ==========================================
  instanciaWorkflowId: number;
  gobernanzaWorkflowId: number;
  gobernanzaId?: number;
  diagramaBPMN?: string;
  estadoInstancia: EstadoInstanciaWorkflow;
  fechaInicio: string;
  fechaFinalizacion?: string;
  iniciadoPor: number;

  // ==========================================
  // DATOS DE GOBERNANZA (LEFT JOIN)
  // ==========================================
  gobernanzaNombre?: string;
  gobernanzaFechaAsignacion?: string;
  gobernanzaFechaVencimiento?: string;
  gobernanzaObservaciones?: string;
  gobernanzaEstado?: number;
  gobernanzaEntidadId?: number;

  // ==========================================
  // DATOS DE TIPO GOBIERNO (INNER JOIN)
  // ==========================================
  tipoGobiernoId?: number;
  tipoGobiernoNombre?: string;
  tipoGobiernoDescripcion?: string;

  // ==========================================
  // DATOS DE TIPO ENTIDAD (INNER JOIN)
  // ==========================================
  tipoEntidadId?: number;
  tipoEntidadNombre?: string;
  tipoEntidadDescripcion?: string;

  // ==========================================
  // DATOS DE USUARIO INICIADOR
  // ==========================================
  iniciadoPorNombre?: string;
  iniciadoPorEmail?: string;

  // ==========================================
  // PROPIEDADES COMPUTADAS (READ-ONLY)
  // ==========================================
  readonly estadoInstanciaTexto?: string;
  readonly gobernanzaEstadoTexto?: string;
  readonly tieneGobernanza: boolean;
  readonly tieneDiagramaWorkflow: boolean;
  readonly estaCompletado: boolean;
  readonly estaEnProgreso: boolean;
  readonly estaCancelado: boolean;
  readonly gobernanzaEstaVencida?: boolean;
  readonly gobernanzaProximaAVencer?: boolean;
  readonly duracionEjecucion?: string;
  readonly descripcionCompleta?: string;
  readonly estadoGeneralTexto?: string;
}

// ================================================================
// COMANDOS
// ================================================================

export interface CreateGobernanzaInstanciaWorkflowCommand {
  gobernanzaWorkflowId: number;
  gobernanzaId: number;
  diagramaBPMN: string;
  estadoInstancia?: EstadoInstanciaWorkflow;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  iniciadoPor: number;
  creadoPor?: number;
}

export interface FinalizarInstanciaWorkflowCommand {
  instanciaWorkflowId: number;
  estadoFinal?: EstadoInstanciaWorkflow;
  fechaFinalizacion?: string;
  observacionesFinalizacion?: string;
  actualizadoPor?: number;
}

// ================================================================
// FILTROS PARA CONSULTAS PAGINADAS
// ================================================================

export interface GobernanzaInstanciaWorkflowFilters {
  // ==========================================
  // FILTROS DE INSTANCIA
  // ==========================================
  estadoInstancia?: EstadoInstanciaWorkflow;
  gobernanzaWorkflowId?: number;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinalizacionDesde?: string;
  fechaFinalizacionHasta?: string;
  iniciadoPor?: number;

  // ==========================================
  // FILTROS DE GOBERNANZA
  // ==========================================
  gobernanzaId?: number;
  tipoGobiernoId?: number;
  tipoEntidadId?: number;
  entidadId?: number;
  gobernanzaEstado?: number;

  // ==========================================
  // FILTROS BOOLEANOS
  // ==========================================
  soloSinGobernanza?: boolean;
  soloConGobernanza?: boolean;
  soloCompletadas?: boolean;
  soloEnProgreso?: boolean;
  soloGobernanzasVencidas?: boolean;
  soloGobernanzasProximasAVencer?: boolean;
  requierenAtencion?: boolean;

  // ==========================================
  // BÚSQUEDA TEXTUAL
  // ==========================================
  searchTerm?: string;
}

// ================================================================
// REQUEST PAGINADO
// ================================================================

export interface GetGobernanzaInstanciaWorkflowPaginatedRequest extends PaginatedRequest {
  // Hereda de PaginatedRequest: page, pageSize, orderBy, orderDescending
  
  // Filtros específicos
  estadoInstancia?: EstadoInstanciaWorkflow;
  gobernanzaWorkflowId?: number;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinalizacionDesde?: string;
  fechaFinalizacionHasta?: string;
  iniciadoPor?: number;
  gobernanzaId?: number;
  tipoGobiernoId?: number;
  tipoEntidadId?: number;
  entidadId?: number;
  gobernanzaEstado?: number;
  soloSinGobernanza?: boolean;
  soloConGobernanza?: boolean;
  soloCompletadas?: boolean;
  soloEnProgreso?: boolean;
  soloGobernanzasVencidas?: boolean;
  soloGobernanzasProximasAVencer?: boolean;
  requierenAtencion?: boolean;
  searchTerm?: string;
}

// ================================================================
// RESPONSES
// ================================================================

export interface GobernanzaInstanciaWorkflowResponse {
  success: boolean;
  message: string;
  data: GobernanzaInstanciaWorkflow;
}

export interface GobernanzaInstanciaWorkflowListResponse {
  success: boolean;
  message: string;
  data: GobernanzaInstanciaWorkflow[];
}

export interface GobernanzaInstanciaWorkflowEnrichedResponse {
  success: boolean;
  message: string;
  data: GobernanzaInstanciaWorkflowEnrichedDto;
}

export interface GobernanzaInstanciaWorkflowEnrichedListResponse {
  success: boolean;
  message: string;
  data: GobernanzaInstanciaWorkflowEnrichedDto[];
}

export interface GobernanzaInstanciaWorkflowPaginatedResponse {
  success: boolean;
  message: string;
  data: PagedResult<GobernanzaInstanciaWorkflowEnrichedDto>;
}

export interface CreateGobernanzaInstanciaWorkflowResponse {
  success: boolean;
  message: string;
  data: number; // ID de la instancia creada
}

export interface FinalizarInstanciaWorkflowResponse {
  success: boolean;
  message: string;
  data: boolean;
}

// ================================================================
// TIPOS AUXILIARES PARA UI
// ================================================================

export interface GobernanzaInstanciaWorkflowCardProps {
  instancia: GobernanzaInstanciaWorkflowEnrichedDto;
  onViewDetails?: (instancia: GobernanzaInstanciaWorkflowEnrichedDto) => void;
  onEdit?: (instancia: GobernanzaInstanciaWorkflowEnrichedDto) => void;
  onFinalizar?: (instancia: GobernanzaInstanciaWorkflowEnrichedDto) => void;
  showActions?: boolean;
}

export interface GobernanzaInstanciaWorkflowTableColumn {
  key: keyof GobernanzaInstanciaWorkflowEnrichedDto;
  label: string;
  sortable?: boolean;
  width?: number;
  render?: (value: any, instancia: GobernanzaInstanciaWorkflowEnrichedDto) => React.ReactNode;
}

// ================================================================
// TIPOS PARA FORMULARIOS
// ================================================================

export interface GobernanzaInstanciaWorkflowFormData extends Omit<CreateGobernanzaInstanciaWorkflowCommand, 'creadoPor'> {
  // Datos del formulario sin creadoPor (se asigna automáticamente)
}

export interface FinalizarInstanciaWorkflowFormData extends Omit<FinalizarInstanciaWorkflowCommand, 'actualizadoPor'> {
  // Datos del formulario sin actualizadoPor (se asigna automáticamente)
}

// ================================================================
// TIPOS PARA VALIDACIÓN
// ================================================================

export interface GobernanzaInstanciaWorkflowValidationErrors {
  gobernanzaWorkflowId?: string;
  gobernanzaId?: string;
  diagramaBPMN?: string;
  iniciadoPor?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  general?: string;
}

export interface FinalizarInstanciaWorkflowValidationErrors {
  instanciaWorkflowId?: string;
  estadoFinal?: string;
  fechaFinalizacion?: string;
  observacionesFinalizacion?: string;
  general?: string;
}