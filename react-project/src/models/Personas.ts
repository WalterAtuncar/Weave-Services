export interface Persona {
  personaId: number; // bigint - PK
  tipoDoc: string; // varchar(10) - DNI, CE, etc.
  nroDoc: string; // varchar(30) - Número de documento
  codEmpleado: string; // varchar(30) - Código único del empleado
  apellidoPaterno: string; // varchar(100)
  apellidoMaterno: string; // varchar(100) 
  nombres: string; // varchar(150)
  fotoUrl: string | null; // varchar(300) - URL de la foto
  estadoLaboral: number; // int - Estado laboral (FK a tabla EstadosLaborales)
  fechaNacimiento: string | null; // date - Puede ser null
  fechaIngreso: string; // date - Fecha de ingreso obligatoria
  emailPersonal: string; // varchar(200)
  celular: string | null; // varchar(50) - Puede ser null
  direccion: string | null; // varchar(MAX) - Puede ser null
  ubigeo: string | null; // varchar(20) - Código de ubigeo, puede ser null
  version: string;
  estado: 'ACTIVO' | 'INACTIVO';
  creadoPor: string;
  fechaCreacion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
  registroEliminado: boolean;
}

export interface PersonaFormData {
  tipoDoc: string; // varchar(10) - Requerido
  nroDoc: string; // varchar(30) - Requerido
  codEmpleado: string; // varchar(30) - Requerido
  apellidoPaterno: string; // varchar(100) - Requerido
  apellidoMaterno: string; // varchar(100) - Requerido
  nombres: string; // varchar(150) - Requerido
  fotoUrl: string | null; // varchar(300) - Opcional
  estadoLaboral: number; // int - Requerido, FK a EstadosLaborales
  fechaNacimiento: string; // date - Opcional (puede ser vacío)
  fechaIngreso: string; // date - Requerido
  emailPersonal: string; // varchar(200) - Requerido
  celular: string; // varchar(50) - Opcional
  direccion: string; // varchar(MAX) - Opcional
  ubigeo: string; // varchar(20) - Opcional
  organizacionId: number | null; // NUEVO: ID de la organización a la que pertenece la persona
  sedeId: number | null; // NUEVO: ID de la sede a la que pertenece la persona (nullable)
  estado: 'ACTIVO' | 'INACTIVO'; // Para el formulario, por defecto ACTIVO
}

// Opciones para los tipos de documento
export const TIPOS_DOCUMENTO = [
  { value: 'DNI', label: 'DNI - Doc. Nac. Identidad' },
  { value: 'CE', label: 'CE - Carné de Extranjería' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'RUC', label: 'RUC - Reg. Único Contribuyente' }
] as const;

// Estados laborales (deberían venir de la base de datos, pero por ahora hardcodeamos)
export const ESTADOS_LABORALES = [
  { value: 1, label: 'ACTIVO' },
  { value: 2, label: 'INACTIVO' },
  { value: 3, label: 'VACACIONES' },
  { value: 4, label: 'LICENCIA' },
  { value: 5, label: 'CESADO' }
] as const;

export interface PersonasData {
  personas: Persona[];
} 