// Modelo para la tabla Posiciones
export interface Posicion {
  posicionId: number;
  unidadesOrgId: number;
  nombre: string;
  categoria: string;
  objetivo: string;
  ordenImpresion: number;
  version: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  creadoPor: number;
  fechaCreacion: string;
  actualizadoPor?: number | null;
  fechaActualizacion?: string | null;
  registroEliminado: boolean;
}

// Modelo para formularios (sin campos de auditoría)
export interface PosicionFormData {
  unidadesOrgId: number;
  nombre: string;
  categoria: string;
  objetivo: string;
  ordenImpresion: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}

// Modelo extendido con información de la unidad organizacional
export interface PosicionConUnidad extends Posicion {
  unidadOrganizacional?: {
    nombre: string;
    nombreCorto: string;
    tipoUnidad: string;
  };
}

// Constantes para categorías de posiciones
export const CATEGORIAS_POSICIONES = [
  { value: 'EJECUTIVO', label: 'Ejecutivo' },
  { value: 'DIRECTIVO', label: 'Directivo' },
  { value: 'GERENCIAL', label: 'Gerencial' },
  { value: 'JEFATURA', label: 'Jefatura' },
  { value: 'SUPERVISION', label: 'Supervisión' },
  { value: 'COORDINACION', label: 'Coordinación' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
  { value: 'ANALISTA', label: 'Analista' },
  { value: 'ASISTENTE', label: 'Asistente' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'OPERATIVO', label: 'Operativo' },
  { value: 'PRACTICANTE', label: 'Practicante' }
] as const;

// Constantes para estados de posiciones
export const ESTADOS_POSICION = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'SUSPENDIDO', label: 'Suspendido' }
] as const; 