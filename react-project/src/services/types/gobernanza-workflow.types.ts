// ================================================================
// TIPOS Y INTERFACES PARA GOBERNANZA WORKFLOW
// ================================================================

import { BaseEntity } from './api.types';

// ================================================================
// ENUMS Y CONSTANTES
// ================================================================

export enum EstadoGobernanzaWorkflow {
  INACTIVO = 0,
  ACTIVO = 1,
  BORRADOR = 2,
  SUSPENDIDO = 3
}

export const ESTADO_GOBERNANZA_WORKFLOW_LABELS = {
  [EstadoGobernanzaWorkflow.INACTIVO]: 'Inactivo',
  [EstadoGobernanzaWorkflow.ACTIVO]: 'Activo',
  [EstadoGobernanzaWorkflow.BORRADOR]: 'Borrador',
  [EstadoGobernanzaWorkflow.SUSPENDIDO]: 'Suspendido'
} as const;

// ================================================================
// ENTIDAD PRINCIPAL
// ================================================================

export interface GobernanzaWorkflow extends BaseEntity {
  gobernanzaWorkflowId: number;
  gobernanzaId: number;
  diagramaBPMN: string;
  version: number;
  estado: EstadoGobernanzaWorkflow;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

// ================================================================
// COMANDOS
// ================================================================

export interface CreateGobernanzaWorkflowCommand {
  gobernanzaId: number;
  diagramaBPMN: string;
  version?: number;
  estado?: EstadoGobernanzaWorkflow;
  creadoPor?: number;
}

export interface UpdateGobernanzaWorkflowCommand {
  gobernanzaWorkflowId: number;
  gobernanzaId: number;
  diagramaBPMN: string;
  version?: number;
  estado?: EstadoGobernanzaWorkflow;
  actualizadoPor?: number;
}

// ================================================================
// FILTROS PARA CONSULTAS
// ================================================================

export interface GobernanzaWorkflowFilters {
  gobernanzaId?: number;
  estado?: EstadoGobernanzaWorkflow;
  version?: number;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaActualizacionDesde?: string;
  fechaActualizacionHasta?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  includeDeleted?: boolean;
  soloActivos?: boolean;
}

// ================================================================
// DTO EXTENDIDO PARA LISTADOS
// ================================================================

export interface GobernanzaWorkflowDto extends GobernanzaWorkflow {
  // ==========================================
  // DATOS ADICIONALES PARA LISTADOS
  // ==========================================
  gobernanzaNombre?: string;
  tipoGobiernoNombre?: string;
  tipoEntidadNombre?: string;
  creadoPorNombre?: string;
  actualizadoPorNombre?: string;
  
  // ==========================================
  // PROPIEDADES COMPUTADAS
  // ==========================================
  readonly estadoTexto: string;
  readonly esVersionActiva: boolean;
  readonly tieneDiagrama: boolean;
  readonly puedeEditarse: boolean;
  readonly puedeEliminarse: boolean;
  readonly cantidadInstancias?: number;
  readonly ultimaEjecucion?: string;
}

// ================================================================
// RESPONSES
// ================================================================

export interface GobernanzaWorkflowResponse {
  success: boolean;
  message: string;
  data: GobernanzaWorkflow;
}

export interface GobernanzaWorkflowListResponse {
  success: boolean;
  message: string;
  data: GobernanzaWorkflow[];
}

export interface GobernanzaWorkflowDtoResponse {
  success: boolean;
  message: string;
  data: GobernanzaWorkflowDto;
}

export interface GobernanzaWorkflowDtoListResponse {
  success: boolean;
  message: string;
  data: GobernanzaWorkflowDto[];
}

export interface CreateGobernanzaWorkflowResponse {
  success: boolean;
  message: string;
  data: number; // ID del workflow creado
}

export interface UpdateGobernanzaWorkflowResponse {
  success: boolean;
  message: string;
  data: boolean;
}

export interface DeleteGobernanzaWorkflowResponse {
  success: boolean;
  message: string;
  data: boolean;
}

// ================================================================
// TIPOS AUXILIARES PARA UI
// ================================================================

export interface GobernanzaWorkflowCardProps {
  workflow: GobernanzaWorkflowDto;
  onViewDetails?: (workflow: GobernanzaWorkflowDto) => void;
  onEdit?: (workflow: GobernanzaWorkflowDto) => void;
  onDelete?: (workflow: GobernanzaWorkflowDto) => void;
  onDuplicate?: (workflow: GobernanzaWorkflowDto) => void;
  onActivate?: (workflow: GobernanzaWorkflowDto) => void;
  onSuspend?: (workflow: GobernanzaWorkflowDto) => void;
  showActions?: boolean;
}

export interface GobernanzaWorkflowTableColumn {
  key: keyof GobernanzaWorkflowDto;
  label: string;
  sortable?: boolean;
  width?: number;
  render?: (value: any, workflow: GobernanzaWorkflowDto) => React.ReactNode;
}

// ================================================================
// TIPOS PARA FORMULARIOS
// ================================================================

export interface GobernanzaWorkflowFormData extends Omit<CreateGobernanzaWorkflowCommand, 'creadoPor'> {
  // Datos del formulario sin creadoPor (se asigna automáticamente)
}

export interface UpdateGobernanzaWorkflowFormData extends Omit<UpdateGobernanzaWorkflowCommand, 'actualizadoPor'> {
  // Datos del formulario sin actualizadoPor (se asigna automáticamente)
}

// ================================================================
// TIPOS PARA VALIDACIÓN
// ================================================================

export interface GobernanzaWorkflowValidationErrors {
  gobernanzaId?: string;
  diagramaBPMN?: string;
  version?: string;
  estado?: string;
  general?: string;
}

export interface UpdateGobernanzaWorkflowValidationErrors extends GobernanzaWorkflowValidationErrors {
  gobernanzaWorkflowId?: string;
}

// ================================================================
// TIPOS PARA BPMN DIAGRAM EDITOR
// ================================================================

export interface BPMNDiagramConfig {
  elementId: string;
  xml?: string;
  readOnly?: boolean;
  onDiagramChange?: (xml: string) => void;
  onElementClick?: (element: any) => void;
  onValidation?: (errors: BPMNValidationError[]) => void;
}

export interface BPMNValidationError {
  elementId: string;
  type: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
}

export interface BPMNElement {
  id: string;
  type: string;
  name?: string;
  documentation?: string;
  properties?: Record<string, any>;
}

// ================================================================
// TIPOS PARA VERSIONADO
// ================================================================

export interface GobernanzaWorkflowVersion {
  version: number;
  fechaCreacion: string;
  creadoPor: number;
  creadoPorNombre?: string;
  estado: EstadoGobernanzaWorkflow;
  comentarios?: string;
  esVersionActual: boolean;
  cambiosPrincipales?: string[];
}

export interface GobernanzaWorkflowVersionHistory {
  workflowId: number;
  versions: GobernanzaWorkflowVersion[];
  versionActual: number;
  totalVersiones: number;
}

// ================================================================
// TIPOS PARA ANÁLISIS Y MÉTRICAS
// ================================================================

export interface GobernanzaWorkflowAnalytics {
  workflowId: number;
  totalInstancias: number;
  instanciasCompletadas: number;
  instanciasEnProgreso: number;
  instanciasCanceladas: number;
  tiempoPromedioEjecucion?: number; // en minutos
  tasaCompletamiento: number; // porcentaje
  ultimaEjecucion?: string;
  primeraEjecucion?: string;
  usuarioMasActivo?: {
    usuarioId: number;
    usuarioNombre: string;
    cantidadEjecuciones: number;
  };
}

// ================================================================
// TIPOS PARA IMPORTACIÓN/EXPORTACIÓN
// ================================================================

export interface GobernanzaWorkflowExportData {
  workflow: GobernanzaWorkflow;
  diagramaBPMN: string;
  metadata: {
    exportedAt: string;
    exportedBy: number;
    version: string;
    includeHistory: boolean;
  };
  history?: GobernanzaWorkflowVersion[];
}

export interface GobernanzaWorkflowImportData {
  diagramaBPMN: string;
  gobernanzaId: number;
  preserveVersion?: boolean;
  overwriteExisting?: boolean;
  metadata?: {
    originalWorkflowId?: number;
    importNotes?: string;
  };
}