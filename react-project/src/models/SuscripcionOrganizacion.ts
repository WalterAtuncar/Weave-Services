export interface SuscripcionOrganizacion {
  suscripcionId: number;
  organizacionId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  limiteUsuarios: number;
  estado: 'ACTIVA' | 'VENCIDA' | 'SUSPENDIDA' | 'CANCELADA';
  esDemo: boolean;
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
}

export interface SuscripcionFormData {
  organizacionId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  limiteUsuarios: number;
  estado: 'ACTIVA' | 'VENCIDA' | 'SUSPENDIDA' | 'CANCELADA';
  esDemo: boolean;
} 