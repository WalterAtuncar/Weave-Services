// ============================================================================
// WORKFLOW - MOCKS
// ============================================================================
// Datos mock para el sistema de workflow integrado con gobernanza
// Incluye casos reales como renovación de licencia SAP

import {
  DefinicionFlujWorkflow,
  InstanciaWorkflow,
  PasoDefinicionWorkflow,
  PasoInstanciaWorkflow,
  ConfiguracionAprobador,
  TriggerWorkflow,
  HistorialWorkflow,
  NotificacionWorkflow,
  AprobacionWorkflow,
  EstadoInstanciaWorkflow,
  TipoPasoWorkflow,
  TipoAccionWorkflow,
  TipoEntidadWorkflow,
  TipoTriggerWorkflow,
  PrioridadWorkflow,
  EstadoPasoWorkflow,
  ResumenWorkflow,
  GobernanzaWorkflow,
  ConfiguracionWorkflow
} from '../models/Workflow';

// ============================================================================
// DEFINICIONES DE FLUJO (TEMPLATES)
// ============================================================================

export const definicionesFlujWorkflowMocks: DefinicionFlujWorkflow[] = [
  {
    definicionFlujoId: 1,
    codigo: 'RENOV_LIC_SISTEMA',
    nombre: 'Renovación de Licencia de Sistema',
    descripcion: 'Flujo para la renovación de licencias de sistemas críticos como SAP, Oracle, etc.',
    version: '2.1.0',
    tipoEntidad: TipoEntidadWorkflow.SISTEMA,
    tipoAccion: TipoAccionWorkflow.RENOVACION,
    categoria: 'Licenciamiento',
    tags: ['licencia', 'renovacion', 'sistema', 'critico'],
    esActivo: true,
    requiereGobernanza: true,
    permiteCancelacion: true,
    tiempoMaximoHoras: 720, // 30 días
    fechaCreacion: '2024-01-15T10:00:00Z',
    fechaModificacion: '2024-01-20T15:30:00Z',
    creadoPor: 'admin@empresa.com',
    modificadoPor: 'workflow.admin@empresa.com',
    pasos: [], // Se llenarán después
    triggers: [], // Se llenarán después
    configuraciones: []
  },
  {
    definicionFlujoId: 2,
    codigo: 'TRANSF_PROPIETARIO',
    nombre: 'Transferencia de Propietario',
    descripcion: 'Flujo para transferir la propiedad de sistemas entre usuarios',
    version: '1.8.0',
    tipoEntidad: TipoEntidadWorkflow.SISTEMA,
    tipoAccion: TipoAccionWorkflow.TRANSFERENCIA,
    categoria: 'Gobernanza',
    tags: ['transferencia', 'propietario', 'gobernanza'],
    esActivo: true,
    requiereGobernanza: true,
    permiteCancelacion: true,
    tiempoMaximoHoras: 168, // 7 días
    fechaCreacion: '2024-01-10T09:00:00Z',
    fechaModificacion: '2024-01-18T11:00:00Z',
    creadoPor: 'admin@empresa.com',
    modificadoPor: 'governance.admin@empresa.com',
    pasos: [],
    triggers: [],
    configuraciones: []
  },
  {
    definicionFlujoId: 3,
    codigo: 'REV_PROCESO_ANUAL',
    nombre: 'Revisión Anual de Proceso',
    descripcion: 'Flujo para la revisión anual obligatoria de procesos de negocio',
    version: '1.5.0',
    tipoEntidad: TipoEntidadWorkflow.PROCESO,
    tipoAccion: TipoAccionWorkflow.REVISION,
    categoria: 'Calidad',
    tags: ['revision', 'anual', 'proceso', 'calidad'],
    esActivo: true,
    requiereGobernanza: true,
    permiteCancelacion: false,
    tiempoMaximoHoras: 336, // 14 días
    fechaCreacion: '2024-01-05T08:00:00Z',
    fechaModificacion: '2024-01-15T16:45:00Z',
    creadoPor: 'quality@empresa.com',
    modificadoPor: 'process.owner@empresa.com',
    pasos: [],
    triggers: [],
    configuraciones: []
  }
];

// ============================================================================
// PASOS DE DEFINICIÓN DE FLUJO
// ============================================================================

export const pasosDefinicionWorkflowMocks: PasoDefinicionWorkflow[] = [
  // PASOS PARA RENOVACIÓN DE LICENCIA DE SISTEMA
  {
    pasoDefinicionId: 1,
    definicionFlujoId: 1,
    codigo: 'NOTIF_INICIAL',
    nombre: 'Notificación Inicial',
    descripcion: 'Notificar al propietario del sistema sobre el vencimiento próximo de la licencia',
    orden: 1,
    tipo: TipoPasoWorkflow.NOTIFICACION,
    esObligatorio: true,
    permiteSalto: false,
    tiempoLimiteHoras: 24,
    tiempoAlertaHoras: 12,
    requiereTodos: false,
    condicionEntrada: '{"diasParaVencimiento": "<=30"}',
    condicionSalida: '{"notificacionEnviada": true}',
    configuracion: {
      tipoNotificacion: 'EMAIL_PRIORITARIO',
      incluirDetallesLicencia: true,
      copiarSupervisor: true
    },
    aprobadores: [],
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    pasoDefinicionId: 2,
    definicionFlujoId: 1,
    codigo: 'EVAL_NECESIDAD',
    nombre: 'Evaluación de Necesidad',
    descripcion: 'El propietario evalúa si es necesario renovar la licencia',
    orden: 2,
    tipo: TipoPasoWorkflow.APROBACION,
    esObligatorio: true,
    permiteSalto: false,
    tiempoLimiteHoras: 72,
    tiempoAlertaHoras: 48,
    requiereTodos: false,
    condicionEntrada: '{"notificacionEnviada": true}',
    condicionSalida: '{"evaluacionCompleta": true, "decision": ["RENOVAR", "NO_RENOVAR"]}',
    configuracion: {
      requiereJustificacion: true,
      opcionesDecision: ['RENOVAR', 'NO_RENOVAR', 'EVALUAR_ALTERNATIVAS'],
      documentosRequeridos: ['analisis_uso', 'justificacion_tecnica']
    },
    aprobadores: [],
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    pasoDefinicionId: 3,
    definicionFlujoId: 1,
    codigo: 'APROB_TECNICA',
    nombre: 'Aprobación Técnica',
    descripcion: 'Revisión técnica de la necesidad de renovación por el área de TI',
    orden: 3,
    tipo: TipoPasoWorkflow.APROBACION,
    esObligatorio: true,
    permiteSalto: false,
    tiempoLimiteHoras: 96,
    tiempoAlertaHoras: 72,
    requiereTodos: false,
    condicionEntrada: '{"decision": "RENOVAR"}',
    condicionSalida: '{"aprobacionTecnica": ["APROBADO", "RECHAZADO"]}',
    configuracion: {
      requiereAnalisisTecnico: true,
      validarCompatibilidad: true,
      evaluarAlternativas: true
    },
    aprobadores: [],
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    pasoDefinicionId: 4,
    definicionFlujoId: 1,
    codigo: 'APROB_PRESUPUESTAL',
    nombre: 'Aprobación Presupuestal',
    descripcion: 'Aprobación del presupuesto para la renovación de la licencia',
    orden: 4,
    tipo: TipoPasoWorkflow.APROBACION_SECUENCIAL,
    esObligatorio: true,
    permiteSalto: false,
    tiempoLimiteHoras: 120,
    tiempoAlertaHoras: 96,
    requiereTodos: true,
    condicionEntrada: '{"aprobacionTecnica": "APROBADO"}',
    condicionSalida: '{"aprobacionPresupuestal": "APROBADO"}',
    configuracion: {
      requiereCotizaciones: true,
      minimoTresCotizaciones: true,
      montoMaximoSinAprobacion: 50000,
      requiereJustificacionCosto: true
    },
    aprobadores: [],
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    pasoDefinicionId: 5,
    definicionFlujoId: 1,
    codigo: 'PROC_COMPRA',
    nombre: 'Proceso de Compra',
    descripcion: 'Gestión del proceso de compra y contratación',
    orden: 5,
    tipo: TipoPasoWorkflow.EJECUCION,
    esObligatorio: true,
    permiteSalto: false,
    tiempoLimiteHoras: 240,
    tiempoAlertaHoras: 168,
    requiereTodos: false,
    condicionEntrada: '{"aprobacionPresupuestal": "APROBADO"}',
    condicionSalida: '{"contratoFirmado": true, "licenciaActivada": true}',
    configuracion: {
      requiereContratoFormal: true,
      validarTerminos: true,
      actualizarInventario: true,
      notificarStakeholders: true
    },
    aprobadores: [],
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  }
];

// ============================================================================
// CONFIGURACIÓN DE APROBADORES
// ============================================================================

export const configuracionAprobadoresMocks: ConfiguracionAprobador[] = [
  // Aprobadores para evaluación de necesidad (paso 2)
  {
    configuracionAprobadorId: 1,
    pasoDefinicionId: 2,
    tipoAprobador: 'ROL_GOBERNANZA',
    rolGobernanzaId: 1, // OWNER
    orden: 1,
    esOpcional: false,
    puedeDelegar: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  // Aprobadores para aprobación técnica (paso 3)
  {
    configuracionAprobadorId: 2,
    pasoDefinicionId: 3,
    tipoAprobador: 'ROL_GOBERNANZA',
    rolGobernanzaId: 3, // TECHNICAL_LEAD
    orden: 1,
    esOpcional: false,
    puedeDelegar: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    configuracionAprobadorId: 3,
    pasoDefinicionId: 3,
    tipoAprobador: 'USUARIO_ESPECIFICO',
    usuarioId: 5, // CTO
    orden: 2,
    esOpcional: true,
    puedeDelegar: false,
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  // Aprobadores para aprobación presupuestal (paso 4)
  {
    configuracionAprobadorId: 4,
    pasoDefinicionId: 4,
    tipoAprobador: 'ROL_GOBERNANZA',
    rolGobernanzaId: 2, // SUPERVISOR
    orden: 1,
    esOpcional: false,
    puedeDelegar: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    configuracionAprobadorId: 5,
    pasoDefinicionId: 4,
    tipoAprobador: 'USUARIO_ESPECIFICO',
    usuarioId: 7, // CFO
    orden: 2,
    esOpcional: false,
    puedeDelegar: false,
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  }
];

// ============================================================================
// TRIGGERS DE WORKFLOW
// ============================================================================

export const triggersWorkflowMocks: TriggerWorkflow[] = [
  {
    triggerWorkflowId: 1,
    definicionFlujoId: 1,
    tipo: TipoTriggerWorkflow.EVENTO_VENCIMIENTO,
    evento: 'LICENCIA_VENCE_30_DIAS',
    condicion: '{"entidad.tipo": "SISTEMA", "entidad.metadatos.fechaVencimientoLicencia": "<=30_DAYS"}',
    configuracion: {
      diasAnticipacion: 30,
      verificarDiariamente: true,
      horaEjecucion: '08:00',
      activarSoloLaborales: true
    },
    esActivo: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    triggerWorkflowId: 2,
    definicionFlujoId: 1,
    tipo: TipoTriggerWorkflow.EVENTO_VENCIMIENTO,
    evento: 'LICENCIA_VENCE_7_DIAS',
    condicion: '{"entidad.tipo": "SISTEMA", "entidad.metadatos.fechaVencimientoLicencia": "<=7_DAYS"}',
    configuracion: {
      diasAnticipacion: 7,
      verificarDiariamente: true,
      horaEjecucion: '08:00',
      prioridadUrgente: true
    },
    esActivo: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  }
];

// ============================================================================
// INSTANCIAS DE WORKFLOW ACTIVAS
// ============================================================================

export const instanciasWorkflowMocks: InstanciaWorkflow[] = [
  // Caso SAP - Renovación de licencia en proceso
  {
    instanciaWorkflowId: 1,
    definicionFlujoId: 1,
    codigo: 'WF-2024-0001',
    nombre: 'Renovación Licencia ERP SAP',
    descripcion: 'Renovación de licencia del sistema ERP SAP que vence el 31/03/2024',
    entidadTipo: TipoEntidadWorkflow.SISTEMA,
    entidadId: 1001,
    entidadNombre: 'ERP SAP',
    estado: EstadoInstanciaWorkflow.EN_PROCESO,
    prioridad: PrioridadWorkflow.ALTA,
    progreso: 60,
    fechaInicio: '2024-01-25T08:00:00Z',
    fechaFinProgramada: '2024-03-25T17:00:00Z',
    tiempoTranscurridoMinutos: 4320, // 3 días
    iniciadoPor: 999, // Sistema automático
    asignadoA: 3, // Juan Pérez (Propietario SAP)
    contexto: {
      sistemaId: 1001,
      sistemaVersion: 'S/4HANA 2023',
      licenciaActual: 'Enterprise 500 users',
      fechaVencimiento: '2024-03-31',
      costoEstimado: 125000,
      moneda: 'USD',
      proveedor: 'SAP AG',
      contactoProveedor: 'sales@sap.com',
      tipoRenovacion: 'STANDARD'
    },
    fechaCreacion: '2024-01-25T08:00:00Z',
    fechaModificacion: '2024-01-28T14:30:00Z',
    pasos: [],
    historial: [],
    notificaciones: []
  },
  // Caso Oracle DB - Esperando aprobación presupuestal
  {
    instanciaWorkflowId: 2,
    definicionFlujoId: 1,
    codigo: 'WF-2024-0002',
    nombre: 'Renovación Licencia Oracle Database',
    descripcion: 'Renovación de licencia de Oracle Database Enterprise Edition',
    entidadTipo: TipoEntidadWorkflow.SISTEMA,
    entidadId: 1002,
    entidadNombre: 'Oracle Database',
    estado: EstadoInstanciaWorkflow.PENDIENTE_APROBACION,
    prioridad: PrioridadWorkflow.CRITICA,
    progreso: 75,
    fechaInicio: '2024-01-20T09:30:00Z',
    fechaFinProgramada: '2024-03-15T17:00:00Z',
    tiempoTranscurridoMinutos: 11520, // 8 días
    iniciadoPor: 999,
    asignadoA: 7, // CFO para aprobación presupuestal
    contexto: {
      sistemaId: 1002,
      sistemaVersion: '19c Enterprise Edition',
      licenciaActual: 'Enterprise Edition 4 cores',
      fechaVencimiento: '2024-03-15',
      costoEstimado: 85000,
      moneda: 'USD',
      proveedor: 'Oracle Corporation',
      contactoProveedor: 'enterprise-sales@oracle.com'
    },
    fechaCreacion: '2024-01-20T09:30:00Z',
    fechaModificacion: '2024-01-28T16:45:00Z',
    pasos: [],
    historial: [],
    notificaciones: []
  },
  // Caso Microsoft Office - Completado
  {
    instanciaWorkflowId: 3,
    definicionFlujoId: 1,
    codigo: 'WF-2024-0003',
    nombre: 'Renovación Microsoft Office 365',
    descripcion: 'Renovación exitosa de suscripción Microsoft Office 365 Enterprise',
    entidadTipo: TipoEntidadWorkflow.SISTEMA,
    entidadId: 1003,
    entidadNombre: 'Microsoft Office 365',
    estado: EstadoInstanciaWorkflow.COMPLETADO,
    prioridad: PrioridadWorkflow.NORMAL,
    progreso: 100,
    fechaInicio: '2024-01-10T10:00:00Z',
    fechaFinProgramada: '2024-02-10T17:00:00Z',
    fechaFinReal: '2024-01-24T15:30:00Z',
    tiempoTranscurridoMinutos: 20250, // 14 días
    iniciadoPor: 999,
    resultado: 'Renovación completada exitosamente. Nueva licencia activa hasta 2025-01-31.',
    observaciones: 'Proceso completado sin inconvenientes. Se actualizó el inventario de licencias.',
    contexto: {
      sistemaId: 1003,
      sistemaVersion: 'Office 365 E3',
      licenciaActual: 'E3 250 users',
      fechaVencimiento: '2024-01-31',
      costoFinal: 18750,
      moneda: 'USD',
      proveedor: 'Microsoft Corporation'
    },
    fechaCreacion: '2024-01-10T10:00:00Z',
    fechaModificacion: '2024-01-24T15:30:00Z',
    pasos: [],
    historial: [],
    notificaciones: []
  }
];

// ============================================================================
// PASOS DE INSTANCIA
// ============================================================================

export const pasosInstanciaWorkflowMocks: PasoInstanciaWorkflow[] = [
  // PASOS PARA INSTANCIA SAP (WF-2024-0001)
  {
    pasoInstanciaId: 1,
    instanciaWorkflowId: 1,
    pasoDefinicionId: 1,
    estado: EstadoPasoWorkflow.COMPLETADO,
    orden: 1,
    fechaInicio: '2024-01-25T08:00:00Z',
    fechaFin: '2024-01-25T08:15:00Z',
    procesadoPor: 999, // Sistema automático
    resultado: 'Notificación enviada exitosamente a juan.perez@empresa.com',
    contexto: {
      destinatarios: ['juan.perez@empresa.com', 'maria.gonzalez@empresa.com'],
      tipoNotificacion: 'EMAIL_PRIORITARIO',
      asunto: 'URGENTE: Renovación requerida para ERP SAP'
    },
    fechaCreacion: '2024-01-25T08:00:00Z',
    fechaModificacion: '2024-01-25T08:15:00Z',
    aprobaciones: []
  },
  {
    pasoInstanciaId: 2,
    instanciaWorkflowId: 1,
    pasoDefinicionId: 2,
    estado: EstadoPasoWorkflow.COMPLETADO,
    orden: 2,
    fechaInicio: '2024-01-25T08:15:00Z',
    fechaFin: '2024-01-26T14:30:00Z',
    asignadoA: 3, // Juan Pérez
    procesadoPor: 3,
    resultado: 'Aprobado para renovación',
    comentarios: 'El sistema es crítico para operaciones. Recomiendo renovar por 3 años para obtener descuento.',
    decision: 'RENOVAR',
    contexto: {
      documentosSubidos: ['analisis_uso_sap_2024.pdf', 'justificacion_tecnica.docx'],
      tiempoAnalisis: 30,
      recomendaciones: ['Renovar por 3 años', 'Evaluar módulos adicionales', 'Considerar migración a cloud']
    },
    fechaCreacion: '2024-01-25T08:15:00Z',
    fechaModificacion: '2024-01-26T14:30:00Z',
    aprobaciones: []
  },
  {
    pasoInstanciaId: 3,
    instanciaWorkflowId: 1,
    pasoDefinicionId: 3,
    estado: EstadoPasoWorkflow.COMPLETADO,
    orden: 3,
    fechaInicio: '2024-01-26T14:30:00Z',
    fechaFin: '2024-01-27T16:45:00Z',
    asignadoA: 4, // Technical Lead
    procesadoPor: 4,
    resultado: 'Aprobación técnica otorgada',
    comentarios: 'Revisión técnica completa. Sistema compatible con infraestructura actual.',
    decision: 'APROBADO',
    contexto: {
      analisisTecnico: 'COMPLETADO',
      compatibilidadValidada: true,
      riesgosIdentificados: [],
      recomendacionesTecnicas: ['Mantener versión actual', 'Planificar migración a S/4HANA Cloud en 2025']
    },
    fechaCreacion: '2024-01-26T14:30:00Z',
    fechaModificacion: '2024-01-27T16:45:00Z',
    aprobaciones: []
  },
  {
    pasoInstanciaId: 4,
    instanciaWorkflowId: 1,
    pasoDefinicionId: 4,
    estado: EstadoPasoWorkflow.EN_PROCESO,
    orden: 4,
    fechaInicio: '2024-01-27T16:45:00Z',
    tiempoLimite: '2024-02-01T16:45:00Z',
    asignadoA: 2, // Supervisor
    contexto: {
      cotizacionesRecibidas: 2,
      cotizacionesRequeridas: 3,
      montoEstimado: 125000,
      estadoCotizaciones: 'EN_PROCESO'
    },
    fechaCreacion: '2024-01-27T16:45:00Z',
    fechaModificacion: '2024-01-28T14:30:00Z',
    aprobaciones: []
  }
];

// ============================================================================
// APROBACIONES
// ============================================================================

export const aprobacionesWorkflowMocks: AprobacionWorkflow[] = [
  {
    aprobacionWorkflowId: 1,
    pasoInstanciaId: 2,
    configuracionAprobadorId: 1,
    usuarioId: 3,
    usuarioNombre: 'Juan Pérez',
    usuarioEmail: 'juan.perez@empresa.com',
    decision: 'APROBADO',
    comentarios: 'El sistema es crítico para operaciones. Recomiendo renovar por 3 años.',
    fechaDecision: '2024-01-26T14:30:00Z',
    fechaCreacion: '2024-01-25T08:15:00Z',
    fechaModificacion: '2024-01-26T14:30:00Z'
  },
  {
    aprobacionWorkflowId: 2,
    pasoInstanciaId: 3,
    configuracionAprobadorId: 2,
    usuarioId: 4,
    usuarioNombre: 'Carlos Mendoza',
    usuarioEmail: 'carlos.mendoza@empresa.com',
    decision: 'APROBADO',
    comentarios: 'Aprobación técnica otorgada. Sin restricciones técnicas.',
    fechaDecision: '2024-01-27T16:45:00Z',
    fechaCreacion: '2024-01-26T14:30:00Z',
    fechaModificacion: '2024-01-27T16:45:00Z'
  }
];

// ============================================================================
// HISTORIAL DE WORKFLOW
// ============================================================================

export const historialWorkflowMocks: HistorialWorkflow[] = [
  {
    historialWorkflowId: 1,
    instanciaWorkflowId: 1,
    evento: 'WORKFLOW_INICIADO',
    descripcion: 'Workflow iniciado automáticamente por trigger de vencimiento',
    estadoNuevo: EstadoInstanciaWorkflow.INICIADO,
    detalles: {
      trigger: 'LICENCIA_VENCE_30_DIAS',
      sistemaAfectado: 'ERP SAP',
      fechaVencimiento: '2024-03-31'
    },
    usuarioNombre: 'Sistema',
    fechaCreacion: '2024-01-25T08:00:00Z'
  },
  {
    historialWorkflowId: 2,
    instanciaWorkflowId: 1,
    evento: 'PASO_COMPLETADO',
    descripcion: 'Notificación inicial enviada correctamente',
    detalles: {
      pasoCompletado: 'NOTIF_INICIAL',
      destinatarios: 2,
      tiempoEjecucion: '15 minutos'
    },
    usuarioNombre: 'Sistema',
    fechaCreacion: '2024-01-25T08:15:00Z'
  },
  {
    historialWorkflowId: 3,
    instanciaWorkflowId: 1,
    evento: 'DECISION_TOMADA',
    descripcion: 'Propietario aprobó la renovación de licencia',
    estadoAnterior: EstadoInstanciaWorkflow.INICIADO,
    estadoNuevo: EstadoInstanciaWorkflow.EN_PROCESO,
    detalles: {
      paso: 'EVAL_NECESIDAD',
      decision: 'RENOVAR',
      justificacion: 'Sistema crítico para operaciones'
    },
    usuarioId: 3,
    usuarioNombre: 'Juan Pérez',
    fechaCreacion: '2024-01-26T14:30:00Z'
  },
  {
    historialWorkflowId: 4,
    instanciaWorkflowId: 1,
    evento: 'APROBACION_TECNICA',
    descripcion: 'Aprobación técnica otorgada por TI',
    detalles: {
      paso: 'APROB_TECNICA',
      aprobadoPor: 'Carlos Mendoza',
      validacionesCompletadas: ['compatibilidad', 'seguridad', 'infraestructura']
    },
    usuarioId: 4,
    usuarioNombre: 'Carlos Mendoza',
    fechaCreacion: '2024-01-27T16:45:00Z'
  }
];

// ============================================================================
// NOTIFICACIONES
// ============================================================================

export const notificacionesWorkflowMocks: NotificacionWorkflow[] = [
  {
    notificacionWorkflowId: 1,
    instanciaWorkflowId: 1,
    tipo: 'WARNING',
    titulo: 'Licencia SAP próxima a vencer',
    mensaje: 'La licencia del sistema ERP SAP vencerá en 30 días (31/03/2024). Se ha iniciado el proceso de renovación.',
    usuarioId: 3,
    usuarioEmail: 'juan.perez@empresa.com',
    enviada: true,
    fechaEnvio: '2024-01-25T08:00:00Z',
    leida: true,
    fechaLectura: '2024-01-25T09:15:00Z',
    canalEnvio: 'EMAIL',
    esRecordatorio: false,
    fechaCreacion: '2024-01-25T08:00:00Z'
  },
  {
    notificacionWorkflowId: 2,
    instanciaWorkflowId: 1,
    tipo: 'INFO',
    titulo: 'Acción requerida: Evaluación de renovación SAP',
    mensaje: 'Se requiere su evaluación para determinar si es necesario renovar la licencia del sistema ERP SAP.',
    usuarioId: 3,
    usuarioEmail: 'juan.perez@empresa.com',
    enviada: true,
    fechaEnvio: '2024-01-25T08:15:00Z',
    leida: true,
    fechaLectura: '2024-01-25T10:30:00Z',
    canalEnvio: 'EMAIL',
    esRecordatorio: false,
    fechaCreacion: '2024-01-25T08:15:00Z'
  },
  {
    notificacionWorkflowId: 3,
    instanciaWorkflowId: 1,
    tipo: 'SUCCESS',
    titulo: 'Evaluación completada - SAP',
    mensaje: 'Juan Pérez ha completado la evaluación de necesidad para la renovación de SAP. Decision: RENOVAR',
    usuarioId: 4,
    usuarioEmail: 'carlos.mendoza@empresa.com',
    enviada: true,
    fechaEnvio: '2024-01-26T14:30:00Z',
    leida: true,
    fechaLectura: '2024-01-26T15:45:00Z',
    canalEnvio: 'EMAIL',
    esRecordatorio: false,
    fechaCreacion: '2024-01-26T14:30:00Z'
  },
  {
    notificacionWorkflowId: 4,
    instanciaWorkflowId: 1,
    tipo: 'REMINDER',
    titulo: 'Recordatorio: Aprobación presupuestal pendiente - SAP',
    mensaje: 'Recordatorio: La aprobación presupuestal para la renovación de SAP está pendiente desde hace 24 horas.',
    usuarioId: 2,
    usuarioEmail: 'maria.gonzalez@empresa.com',
    enviada: true,
    fechaEnvio: '2024-01-28T16:45:00Z',
    leida: false,
    canalEnvio: 'EMAIL',
    esRecordatorio: true,
    fechaCreacion: '2024-01-28T16:45:00Z'
  }
];

// ============================================================================
// CONFIGURACIONES
// ============================================================================

export const configuracionesWorkflowMocks: ConfiguracionWorkflow[] = [
  {
    configuracionWorkflowId: 1,
    definicionFlujoId: 1,
    clave: 'DIAS_ALERTA_VENCIMIENTO',
    valor: '30',
    tipo: 'NUMBER',
    descripcion: 'Días de anticipación para alertar sobre vencimiento de licencias',
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    configuracionWorkflowId: 2,
    definicionFlujoId: 1,
    clave: 'MONTO_APROBACION_AUTOMATICA',
    valor: '10000',
    tipo: 'NUMBER',
    descripcion: 'Monto máximo para aprobación automática sin supervisión adicional',
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  },
  {
    configuracionWorkflowId: 3,
    definicionFlujoId: 1,
    clave: 'ESCALAMIENTO_AUTOMATICO',
    valor: 'true',
    tipo: 'BOOLEAN',
    descripcion: 'Activar escalamiento automático por timeouts',
    fechaCreacion: '2024-01-15T10:00:00Z',
    creadoPor: 'workflow.admin@empresa.com'
  }
];

// ============================================================================
// RESUMEN Y MÉTRICAS
// ============================================================================

export const resumenWorkflowMock: ResumenWorkflow = {
  totalInstancias: 15,
  enProceso: 5,
  pendientesAprobacion: 3,
  escalados: 1,
  completados: 8,
  rechazados: 1,
  cancelados: 0,
  conErrores: 1
};

export const gobernanzaWorkflowMocks: GobernanzaWorkflow[] = [
  {
    entidadId: 1001,
    entidadTipo: TipoEntidadWorkflow.SISTEMA,
    propietario: {
      usuarioId: 3,
      nombre: 'Juan Pérez',
      email: 'juan.perez@empresa.com'
    },
    supervisor: {
      usuarioId: 2,
      nombre: 'María González',
      email: 'maria.gonzalez@empresa.com'
    },
    responsables: [
      {
        usuarioId: 3,
        nombre: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        rolGobernanzaId: 1,
        rolNombre: 'Propietario'
      },
      {
        usuarioId: 4,
        nombre: 'Carlos Mendoza',
        email: 'carlos.mendoza@empresa.com',
        rolGobernanzaId: 3,
        rolNombre: 'Líder Técnico'
      }
    ]
  }
];

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

export const getDefinicionFlujo = (definicionFlujoId: number): DefinicionFlujWorkflow | undefined => {
  return definicionesFlujWorkflowMocks.find(d => d.definicionFlujoId === definicionFlujoId);
};

export const getInstanciasActivas = (): InstanciaWorkflow[] => {
  return instanciasWorkflowMocks.filter(i => 
    [EstadoInstanciaWorkflow.INICIADO, EstadoInstanciaWorkflow.EN_PROCESO, EstadoInstanciaWorkflow.PENDIENTE_APROBACION].includes(i.estado)
  );
};

export const getInstanciaWorkflow = (instanciaWorkflowId: number): InstanciaWorkflow | undefined => {
  return instanciasWorkflowMocks.find(i => i.instanciaWorkflowId === instanciaWorkflowId);
};

export const getPasosPorInstancia = (instanciaWorkflowId: number): PasoInstanciaWorkflow[] => {
  return pasosInstanciaWorkflowMocks.filter(p => p.instanciaWorkflowId === instanciaWorkflowId);
};

export const getHistorialPorInstancia = (instanciaWorkflowId: number): HistorialWorkflow[] => {
  return historialWorkflowMocks.filter(h => h.instanciaWorkflowId === instanciaWorkflowId);
};

export const getNotificacionesPorInstancia = (instanciaWorkflowId: number): NotificacionWorkflow[] => {
  return notificacionesWorkflowMocks.filter(n => n.instanciaWorkflowId === instanciaWorkflowId);
};

export const simularInicioWorkflow = (entidadId: number, entidadTipo: TipoEntidadWorkflow, tipoAccion: TipoAccionWorkflow): InstanciaWorkflow => {
  const proximoId = Math.max(...instanciasWorkflowMocks.map(i => i.instanciaWorkflowId)) + 1;
  const definicion = definicionesFlujWorkflowMocks.find(d => d.tipoEntidad === entidadTipo && d.tipoAccion === tipoAccion);
  
  if (!definicion) {
    throw new Error(`No se encontró definición de flujo para ${entidadTipo} - ${tipoAccion}`);
  }

  const nuevaInstancia: InstanciaWorkflow = {
    instanciaWorkflowId: proximoId,
    definicionFlujoId: definicion.definicionFlujoId,
    codigo: `WF-2024-${proximoId.toString().padStart(4, '0')}`,
    nombre: `${definicion.nombre} - Entidad ${entidadId}`,
    descripcion: `Instancia automática de ${definicion.descripcion}`,
    entidadTipo,
    entidadId,
    entidadNombre: `Entidad ${entidadId}`,
    estado: EstadoInstanciaWorkflow.INICIADO,
    prioridad: PrioridadWorkflow.NORMAL,
    progreso: 0,
    fechaInicio: new Date().toISOString(),
    tiempoTranscurridoMinutos: 0,
    iniciadoPor: 999, // Sistema
    contexto: {
      entidadId,
      entidadTipo,
      fechaInicio: new Date().toISOString()
    },
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
    pasos: [],
    historial: [],
    notificaciones: []
  };

  return nuevaInstancia;
}; 