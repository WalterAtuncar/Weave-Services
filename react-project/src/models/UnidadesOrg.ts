// Modelo para la tabla UnidadesOrg
export interface UnidadOrganizacional {
  unidadesOrgId: number;
  organizacionId: number;
  unidadPadreId?: number | null;
  tipoUnidad: string;
  nombre: string;
  nombreCorto: string;
  objetivo: string;
  posicionCategoria: string;
  centroCosto: string;
  version: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  creadoPor: number;
  fechaCreacion: string;
  actualizadoPor?: number | null;
  fechaActualizacion?: string | null;
  registroEliminado: boolean;
}

// Modelo para formularios (sin campos de auditoría)
export interface UnidadOrganizacionalFormData {
  organizacionId: number;
  unidadPadreId?: number | null;
  tipoUnidad: string;
  nombre: string;
  nombreCorto: string;
  objetivo: string;
  posicionCategoria: string;
  centroCosto: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}

// Constantes para los tipos de unidad - Alineado con el enum del backend
export const TIPOS_UNIDAD = [
  { value: 1, label: 'Corporativo' },
  { value: 2, label: 'División' },
  { value: 3, label: 'Gerencia' },
  { value: 4, label: 'Sub Gerencia' },
  { value: 5, label: 'Departamento' },
  { value: 6, label: 'Área' },
  { value: 7, label: 'Sección' },
  { value: 8, label: 'Equipo' }
] as const;

// Constantes para categorías de posición
export const CATEGORIAS_POSICION = [
  { value: 'EJECUTIVO', label: 'Ejecutivo' },
  { value: 'DIRECTIVO', label: 'Directivo' },
  { value: 'JEFE', label: 'Jefe' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'COORDINADOR', label: 'Coordinador' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
  { value: 'ANALISTA', label: 'Analista' },
  { value: 'ASISTENTE', label: 'Asistente' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'OPERATIVO', label: 'Operativo' }
] as const;

// Constantes para estados
export const ESTADOS_UNIDAD = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'SUSPENDIDO', label: 'Suspendido' }
] as const; 