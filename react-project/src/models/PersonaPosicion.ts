// Modelo para la tabla PersonaPosicion
export interface PersonaPosicion {
  personaId: number;
  posicionId: number;
  fechaInicio: string;
  fechaFin?: string | null;
  estado: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO' | 'SUSPENDIDO';
  version: number;
  creadoPor: number;
  fechaCreacion: string;
  actualizadoPor?: number | null;
  fechaActualizacion?: string | null;
  registroEliminado: boolean;
}

// Modelo para formularios (sin campos de auditoría)
export interface PersonaPosicionFormData {
  personaId: number;
  posicionId: number;
  fechaInicio: string;
  fechaFin?: string | null;
  estado: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO' | 'SUSPENDIDO';
}

// Modelo extendido con información de persona y posición
export interface PersonaPosicionDetallada extends PersonaPosicion {
  persona?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nroDoc: string;
    tipoDoc: string;
    emailPersonal: string;
    codEmpleado: string;
  };
  posicion?: {
    nombre: string;
    categoria: string;
    objetivo: string;
  };
  unidadOrganizacional?: {
    nombre: string;
    nombreCorto: string;
    tipoUnidad: string;
  };
}

// Constantes para estados de asignación persona-posición
export const ESTADOS_PERSONA_POSICION = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'SUSPENDIDO', label: 'Suspendido' }
] as const;

// Tipo para el estado de asignación
export type EstadoPersonaPosicion = typeof ESTADOS_PERSONA_POSICION[number]['value']; 