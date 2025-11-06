// ============================================================================
// WORKFLOW - MODELS
// ============================================================================
// Modelos TypeScript para el sistema de workflow integrado con gobernanza
// Diseño Senior para manejar workflows complejos con aprobaciones

// ============================================================================
// ENUMS
// ============================================================================

export enum EstadoInstanciaWorkflow {
  INICIADO = 'INICIADO',
  EN_PROCESO = 'EN_PROCESO',
  PENDIENTE_APROBACION = 'PENDIENTE_APROBACION',
  ESPERANDO_RESPUESTA = 'ESPERANDO_RESPUESTA',
  ESCALADO = 'ESCALADO',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  PAUSADO = 'PAUSADO',
  CANCELADO = 'CANCELADO',
  COMPLETADO = 'COMPLETADO',
  ERROR = 'ERROR'
}

export enum TipoPasoWorkflow {
  NOTIFICACION = 'NOTIFICACION',
  VALIDACION = 'VALIDACION',
  APROBACION = 'APROBACION',
  APROBACION_PARALELA = 'APROBACION_PARALELA',
  APROBACION_SECUENCIAL = 'APROBACION_SECUENCIAL',
  EJECUCION = 'EJECUCION',
  DECISION = 'DECISION',
  ESPERA = 'ESPERA',
  SCRIPT = 'SCRIPT'
}

export enum TipoFlujoWorkflow {
  SECUENCIAL = 'SECUENCIAL',
  PARALELO = 'PARALELO'
}

export enum TipoAccionWorkflow {
  ASIGNACION = 'ASIGNACION',
  TRANSFERENCIA = 'TRANSFERENCIA',
  REVOCACION = 'REVOCACION',
  RENOVACION = 'RENOVACION',
  SUSPENSION = 'SUSPENSION',
  REACTIVACION = 'REACTIVACION',
  AUDITORIA = 'AUDITORIA',
  REVISION = 'REVISION'
}

export enum TipoEntidadWorkflow {
  SISTEMA = 'SISTEMA',
  PROCESO = 'PROCESO',
  DOCUMENTO = 'DOCUMENTO',
  POLITICA = 'POLITICA',
  INDICADOR = 'INDICADOR',
  RIESGO = 'RIESGO',
  AUDITORIA = 'AUDITORIA',
  PROYECTO = 'PROYECTO'
}

export enum TipoTriggerWorkflow {
  MANUAL = 'MANUAL',
  EVENTO_VENCIMIENTO = 'EVENTO_VENCIMIENTO',
  CAMBIO_ESTADO = 'CAMBIO_ESTADO',
  PROGRAMADO = 'PROGRAMADO',
  WEBHOOK = 'WEBHOOK',
  CONDICION_NEGOCIO = 'CONDICION_NEGOCIO'
}

export enum PrioridadWorkflow {
  BAJA = 'BAJA',
  NORMAL = 'NORMAL',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
  URGENTE = 'URGENTE'
}

export enum EstadoPasoWorkflow {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  OMITIDO = 'OMITIDO',
  ERROR = 'ERROR',
  TIMEOUT = 'TIMEOUT'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

// Definición de Flujo de Trabajo (Template)
export interface DefinicionFlujWorkflow {
  definicionFlujoId: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  version: string;
  tipoEntidad: TipoEntidadWorkflow;
  tipoAccion: TipoAccionWorkflow;
  categoria: string;
  tags: string[];
  
  // Configuración
  esActivo: boolean;
  requiereGobernanza: boolean;
  permiteCancelacion: boolean;
  tiempoMaximoHoras: number;
  tipoFlujo: TipoFlujoWorkflow;
  
  // Metadatos
  fechaCreacion: string;
  fechaModificacion: string;
  creadoPor: string;
  modificadoPor: string;
  
  // Relaciones
  pasos: PasoDefinicionWorkflow[];
  triggers: TriggerWorkflow[];
  configuraciones: ConfiguracionWorkflow[];
}

// Paso dentro de la definición del flujo
export interface PasoDefinicionWorkflow {
  pasoDefinicionId: number;
  definicionFlujoId: number;
  
  // Identificación
  codigo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  
  // Configuración
  tipo: TipoPasoWorkflow;
  esObligatorio: boolean;
  permiteSalto: boolean;
  
  // Tiempo
  tiempoLimiteHoras: number;
  tiempoAlertaHoras: number;
  
  // Aprobadores
  aprobadores: ConfiguracionAprobador[];
  requiereTodos: boolean; // true = todos deben aprobar, false = solo uno
  
  // Condiciones
  condicionEntrada: string; // JSON con condiciones
  condicionSalida: string; // JSON con condiciones
  
  // Scripts
  scriptPreEjecucion?: string;
  scriptPostEjecucion?: string;
  
  // Configuración específica
  configuracion: any; // JSON libre para configuraciones específicas del paso
  
  // Metadatos
  fechaCreacion: string;
  creadoPor: string;
}

// Configuración de aprobadores para un paso
export interface ConfiguracionAprobador {
  configuracionAprobadorId: number;
  pasoDefinicionId: number;
  
  // Tipo de aprobador
  tipoAprobador: 'ROL_GOBERNANZA' | 'USUARIO_ESPECIFICO' | 'GRUPO' | 'DINAMICO';
  
  // Identificación
  rolGobernanzaId?: number;
  usuarioId?: number;
  grupoId?: number;
  expresionDinamica?: string; // Para resolver aprobadores dinámicamente
  
  // Configuración
  orden: number;
  esOpcional: boolean;
  puedeDelegar: boolean;
  
  // Metadatos
  fechaCreacion: string;
  creadoPor: string;
}

// Trigger que activa un workflow
export interface TriggerWorkflow {
  triggerWorkflowId: number;
  definicionFlujoId: number;
  
  // Configuración del trigger
  tipo: TipoTriggerWorkflow;
  evento: string;
  condicion: string; // JSON con condiciones
  
  // Configuración específica
  configuracion: any; // JSON libre
  
  // Estado
  esActivo: boolean;
  
  // Metadatos
  fechaCreacion: string;
  creadoPor: string;
}

// ============================================================================
// INSTANCIAS DE WORKFLOW (Ejecución Real)
// ============================================================================

// Instancia de ejecución de un workflow
export interface InstanciaWorkflow {
  instanciaWorkflowId: number;
  definicionFlujoId: number;
  
  // Identificación
  codigo: string; // Código único de la instancia
  nombre: string;
  descripcion: string;
  
  // Entidad relacionada
  entidadTipo: TipoEntidadWorkflow;
  entidadId: number;
  entidadNombre: string;
  
  // Estado
  estado: EstadoInstanciaWorkflow;
  prioridad: PrioridadWorkflow;
  progreso: number; // 0-100
  tipoFlujo: TipoFlujoWorkflow;
  esFlujoParalelo: boolean;
  
  // Tiempo
  fechaInicio: string;
  fechaFinProgramada?: string;
  fechaFinReal?: string;
  tiempoTranscurridoMinutos: number;
  
  // Usuarios
  iniciadoPor: number;
  asignadoA?: number;
  
  // Resultado
  resultado?: string;
  observaciones?: string;
  
  // Contexto
  contexto: any; // JSON con datos del contexto de ejecución
  
  // Metadatos
  fechaCreacion: string;
  fechaModificacion: string;
  
  // Relaciones
  pasos: PasoInstanciaWorkflow[];
  historial: HistorialWorkflow[];
  notificaciones: NotificacionWorkflow[];
}

// Paso en ejecución de una instancia
export interface PasoInstanciaWorkflow {
  pasoInstanciaId: number;
  instanciaWorkflowId: number;
  pasoDefinicionId: number;
  
  // Estado
  estado: EstadoPasoWorkflow;
  orden: number;
  
  // Tiempo
  fechaInicio?: string;
  fechaFin?: string;
  tiempoLimite?: string;
  
  // Asignación
  asignadoA?: number;
  procesadoPor?: number;
  
  // Resultado
  resultado?: string;
  comentarios?: string;
  decision?: string; // Para pasos de decisión
  
  // Contexto específico del paso
  contexto: any; // JSON
  
  // Metadatos
  fechaCreacion: string;
  fechaModificacion: string;
  
  // Relaciones
  aprobaciones: AprobacionWorkflow[];
}

// Aprobación específica dentro de un paso
export interface AprobacionWorkflow {
  aprobacionWorkflowId: number;
  pasoInstanciaId: number;
  configuracionAprobadorId: number;
  
  // Usuario que aprueba
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail: string;
  
  // Decisión
  decision: 'APROBADO' | 'RECHAZADO' | 'DELEGADO' | 'PENDIENTE';
  comentarios?: string;
  fechaDecision?: string;
  
  // Delegación
  delegadoA?: number;
  fechaDelegacion?: string;
  motivoDelegacion?: string;
  
  // Metadatos
  fechaCreacion: string;
  fechaModificacion: string;
}

// Historial de cambios en el workflow
export interface HistorialWorkflow {
  historialWorkflowId: number;
  instanciaWorkflowId: number;
  
  // Evento
  evento: string;
  descripcion: string;
  estadoAnterior?: EstadoInstanciaWorkflow;
  estadoNuevo?: EstadoInstanciaWorkflow;
  
  // Contexto
  detalles: any; // JSON con detalles del evento
  
  // Usuario
  usuarioId?: number;
  usuarioNombre?: string;
  
  // Metadatos
  fechaCreacion: string;
}

// Notificaciones del workflow
export interface NotificacionWorkflow {
  notificacionWorkflowId: number;
  instanciaWorkflowId: number;
  
  // Contenido
  tipo: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'REMINDER';
  titulo: string;
  mensaje: string;
  
  // Destinatario
  usuarioId: number;
  usuarioEmail: string;
  
  // Estado
  enviada: boolean;
  fechaEnvio?: string;
  leida: boolean;
  fechaLectura?: string;
  
  // Configuración
  canalEnvio: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  esRecordatorio: boolean;
  
  // Metadatos
  fechaCreacion: string;
}

// ============================================================================
// CONFIGURACIONES ADICIONALES
// ============================================================================

// Configuración específica de workflows
export interface ConfiguracionWorkflow {
  configuracionWorkflowId: number;
  definicionFlujoId: number;
  
  // Clave-valor
  clave: string;
  valor: string;
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  descripcion: string;
  
  // Metadatos
  fechaCreacion: string;
  creadoPor: string;
}

// Métricas y reportes
export interface MetricaWorkflow {
  metricaWorkflowId: number;
  definicionFlujoId?: number;
  instanciaWorkflowId?: number;
  
  // Métrica
  nombre: string;
  valor: number;
  unidad: string;
  fecha: string;
  
  // Contexto
  contexto: any; // JSON
  
  // Metadatos
  fechaCreacion: string;
}

// ============================================================================
// DTOs PARA OPERACIONES
// ============================================================================

// DTO para crear una nueva instancia de workflow
export interface CreateInstanciaWorkflowDto {
  definicionFlujoId: number;
  entidadTipo: TipoEntidadWorkflow;
  entidadId: number;
  entidadNombre: string;
  prioridad?: PrioridadWorkflow;
  contexto?: any;
  observaciones?: string;
}

// DTO para actualizar una instancia
export interface UpdateInstanciaWorkflowDto {
  estado?: EstadoInstanciaWorkflow;
  prioridad?: PrioridadWorkflow;
  asignadoA?: number;
  observaciones?: string;
  resultado?: string;
}

// DTO para procesar un paso
export interface ProcesarPasoWorkflowDto {
  decision: 'APROBAR' | 'RECHAZAR' | 'DELEGAR';
  comentarios?: string;
  delegadoA?: number;
  motivoDelegacion?: string;
}

// ============================================================================
// GRUPOS DE WORKFLOW PARALELO
// ============================================================================

// Grupo de usuarios para workflow paralelo
export interface GrupoWorkflowParalelo {
  workflowGrupoId: number;
  gobernanzaWorkflowId: number;
  ordenEjecucion: number;
  nombreGrupo: string;
  descripcionGrupo?: string;
  totalUsuarios: number;
  esActivo: boolean;
  esCompletado: boolean;
  esRechazado: boolean;
  fechaCreacion: string;
  fechaActivacion?: string;
  fechaCompletado?: string;
  fechaRechazo?: string;
  
  // Propiedades computadas
  estadoTexto: string;
  estadoColor: string;
  estadoIcono: string;
  puedeSerActivado: boolean;
  resumenGrupo: string;
  
  // Ejecuciones del grupo
  ejecuciones: EjecucionGrupoWorkflow[];
  ejecucionesCompletadas: number;
  ejecucionesPendientes: number;
  porcentajeCompletado: number;
}

// Ejecución específica dentro de un grupo
export interface EjecucionGrupoWorkflow {
  workflowEjecucionId: number;
  workflowGrupoId: number;
  usuarioId: number;
  usuarioNombre: string;
  estado: EstadoPasoWorkflow;
  fechaInicio: string;
  fechaCompletado?: string;
  comentarios?: string;
  decision?: 'APROBAR' | 'RECHAZAR';
}

// ============================================================================
// TIPOS UTILITARIOS
// ============================================================================

// Resumen de estado de workflow
export interface ResumenWorkflow {
  totalInstancias: number;
  enProceso: number;
  pendientesAprobacion: number;
  escalados: number;
  completados: number;
  rechazados: number;
  cancelados: number;
  conErrores: number;
  flujoParalelo: number;
  flujoSecuencial: number;
}

// Información de gobernanza asociada
export interface GobernanzaWorkflow {
  entidadId: number;
  entidadTipo: TipoEntidadWorkflow;
  propietario?: {
    usuarioId: number;
    nombre: string;
    email: string;
  };
  supervisor?: {
    usuarioId: number;
    nombre: string;
    email: string;
  };
  responsables: Array<{
    usuarioId: number;
    nombre: string;
    email: string;
    rolGobernanzaId: number;
    rolNombre: string;
  }>;
}

// Contexto completo para ejecutar un workflow
export interface ContextoEjecucionWorkflow {
  instancia: InstanciaWorkflow;
  definicion: DefinicionFlujWorkflow;
  gobernanza: GobernanzaWorkflow;
  entidad: any;
  variables: Record<string, any>;
}