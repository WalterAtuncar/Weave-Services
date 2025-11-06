export interface PlanSuscripcion {
  planId: number;
  nombrePlan: string;
  descripcion: string;
  limiteUsuarios: number;
  duracionDias: number;
  precio: number;
  tipoPlan: 'DEMO' | 'COMERCIAL' | 'ENTERPRISE';
  activo: boolean;
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
}

export interface PlanFormData {
  nombrePlan: string;
  descripcion: string;
  limiteUsuarios: number;
  duracionDias: number;
  precio: number;
  tipoPlan: 'DEMO' | 'COMERCIAL' | 'ENTERPRISE';
  activo: boolean;
} 