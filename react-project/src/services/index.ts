/**
 * Índice de servicios
 * Exporta todos los servicios disponibles en la aplicación
 * Versión simplificada para evitar conflictos de nombres
 */

// ===== SERVICIOS BASE =====
export { BaseApiService } from './api.service';
export { spinnerService } from './spinnerService';

// ===== SERVICIOS DE AUTENTICACIÓN =====
export { authService } from './auth.service';
export { federatedAuthService } from './federated-auth.service';
export { recuperacionContrasenaService } from './recuperacion-contrasena.service';

// ===== SERVICIOS DE ORGANIZACIÓN Y GESTIÓN =====
export { organizacionesService } from './organizaciones.service';
export { unidadesOrgService } from './unidades-org.service';
export { sedesService } from './sedes.service';
export { posicionesService } from './posiciones.service';
export { personasService } from './personas.service';
export { personaPosicionService } from './persona-posicion.service';
export { usuariosService } from './usuarios.service';

// ===== SERVICIOS DE PERFIL Y MENÚ =====
export { perfilService } from './perfil.service';
export { menuPerfilService } from './menu-perfil.service';
export { menuService } from './menu.service';

// ===== SERVICIOS DE SUSCRIPCIONES =====
export { planesSuscripcionService } from './planes-suscripcion.service';
export { suscripcionesOrganizacionService } from './suscripciones-organizacion.service';

// ===== SERVICIOS DE INFRAESTRUCTURA =====
export { servidoresService } from './servidores.service';
export { ubigeoService } from './ubigeo.service';

// ===== SERVICIOS DE WORKFLOW =====
export { workflowService } from './workflow.service';
export { gobernanzaInstanciaWorkflowService } from './gobernanza-instancia-workflow.service';
export { gobernanzaWorkflowService } from './gobernanza-workflow.service';
export { gobernanzaWorkflowEjecucionService } from './gobernanza-workflow-ejecucion.service';

// ===== SERVICIOS DE GESTIÓN DE TIPOS =====
export { tipoEntidadService } from './tipo-entidad.service';
export { tipoSistemaService } from './tipo-sistema.service';
export { tipoGobiernoService } from './tipo-gobierno.service';
export { tipoAccionWorkflowService } from './tipo-accion-workflow.service';

// ===== SERVICIOS DE SISTEMAS =====
export { familiaSistemaService } from './familia-sistema.service';
export { sistemasService } from './sistemas.service';
export { sistemaServidorService } from './sistema-servidor.service';
// ===== SERVICIO DE DOCUMENTOS VECTORIALES =====
export { documentoVectorialService } from './documento-vectorial.service';
// ===== SERVICIO DE DOCUMENTOS BÁSICO =====
export { documentosService } from './documentos.service';

// ===== SERVICIOS DE PROCESOS =====
export { procesosService } from './procesos.service';
export { tiposProcesoService } from './tipos-proceso.service';

// ===== SERVICIOS DE GOBERNANZA =====
export { rolGobernanzaService } from './rol-gobernanza.service';
export { gobernanzaService } from './gobernanza.service';
export { gobernanzaRolService } from './gobernanza-rol.service';
export { historialGobernanzaService } from './historial-gobernanza.service';
export { reglaGobernanzaService } from './regla-gobernanza.service';
export { notificacionGobernanzaService } from './notificacion-gobernanza.service';

// ===== INTERCEPTOR HTTP =====
export { httpInterceptor } from './http.interceptor';

// ===== TIPOS COMUNES (PRIMERO PARA EVITAR CONFLICTOS) =====
export * from './types/common.types';

// ===== TIPOS BASE =====
export type { ApiResponse } from './types/api.types';

// ===== TIPOS DE AUTENTICACIÓN =====
export * from './types/auth.types';

// ===== TIPOS DE USUARIOS =====
export * from './types/usuarios.types';

// ===== TIPOS DE ORGANIZACIONES =====
export * from './types/organizaciones.types';

// ===== TIPOS DE UNIDADES ORG =====
export * from './types/unidades-org.types';

// ===== TIPOS DE SEDES =====
export * from './types/sedes.types';

// ===== TIPOS DE POSICIONES =====
export * from './types/posiciones.types';

// ===== TIPOS DE PERSONAS =====
// Comentado temporalmente para evitar conflictos de nombres
// export * from './types/personas.types';

// ===== TIPOS DE PERSONA-POSICIÓN =====
// Comentado temporalmente para evitar conflictos de nombres
// export * from './types/persona-posicion.types';

// ===== TIPOS DE PERFIL =====
// Comentado temporalmente para evitar conflictos de nombres
// export * from './types/perfil.types';

// ===== TIPOS DE MENU-PERFIL =====
export * from './types/menu-perfil.types';

// ===== TIPOS DE MENU =====
export * from './types/menu.types';

// ===== TIPOS DE PLANES-SUSCRIPCIÓN =====
export * from './types/planes-suscripcion.types';

// ===== TIPOS DE SUSCRIPCIONES-ORGANIZACIÓN =====
export * from './types/suscripciones-organizacion.types';

// ===== TIPOS DE SERVIDORES =====
export * from './types/servidores.types';

// ===== TIPOS DE UBIGEO =====
export * from './types/ubigeo.types';

// ===== TIPOS DE WORKFLOW =====
export * from './types/workflow.types';

// ===== TIPOS DE GOBERNANZA-INSTANCIA-WORKFLOW =====
export * from './types/gobernanza-instancia-workflow.types';

// ===== TIPOS DE GOBERNANZA-WORKFLOW =====
export * from './types/gobernanza-workflow.types';

// ===== TIPOS DE GOBERNANZA-WORKFLOW-EJECUCIÓN =====
export * from './types/gobernanza-workflow-ejecucion.types';

// ===== TIPOS DE TIPO-ENTIDAD =====
export * from './types/tipo-entidad.types';

// ===== TIPOS DE TIPO-SISTEMA =====
export * from './types/tipo-sistema.types';

// ===== TIPOS DE TIPO-GOBIERNO =====
export * from './types/tipo-gobierno.types';

// ===== TIPOS DE TIPO-ACCIÓN-WORKFLOW =====
export * from './types/tipo-accion-workflow.types';

// ===== TIPOS DE FAMILIA-SISTEMA =====
export * from './types/familia-sistema.types';

// ===== TIPOS DE SISTEMAS =====
export * from './types/sistemas.types';

// ===== TIPOS DE PROCESOS =====
export * from './types/procesos.types';

// ===== TIPOS DE ROL-GOBERNANZA =====
export * from './types/rol-gobernanza.types';

// ===== TIPOS DE GOBERNANZA =====
// Comentado temporalmente para evitar conflictos de nombres
// export * from './types/gobernanza.types';

// ===== TIPOS DE HISTORIAL-GOBERNANZA =====
// Comentado temporalmente para evitar conflictos de nombres
// export * from './types/historial-gobernanza.types';

// ===== TIPOS DE REGLA-GOBERNANZA =====
// Comentado temporalmente para evitar conflictos de nombres
// export * from './types/regla-gobernanza.types';

// ===== TIPOS DE NOTIFICACIÓN-GOBERNANZA =====
// Comentado temporalmente para evitar conflictos de nombres
// export * from './types/notificacion-gobernanza.types';

// ===== TIPOS DE RECUPERACIÓN-CONTRASEÑA =====
export * from './types/recuperacion-contrasena.types';

// ===== NOTA IMPORTANTE =====
// Algunas exportaciones han sido comentadas temporalmente para evitar conflictos de nombres.
// Los tipos siguen disponibles importándolos directamente desde sus archivos específicos.
//
// Ejemplos de importación directa:
// import { Usuario, UsuarioDto } from './types/usuarios.types';
// import { Organizacion } from './types/organizaciones.types';
// import { PaginationOptions, SortOptions } from './types/common.types';
//
// ✅ La aplicación funcionará correctamente con estas importaciones directas.
// ✅ Todos los tipos están disponibles, solo cambia la forma de importarlos.