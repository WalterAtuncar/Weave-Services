/**
 * Tipos para el formulario de Gobernanza
 * Maneja creación y edición de gobernanzas con múltiples roles y usuarios
 */

import { 
  CreateGobernanzaCommand, 
  UpdateGobernanzaCommand
} from '../../../services/types/gobernanza.types';
import { 
  TipoGobierno 
} from '../../../services/types/tipo-gobierno.types';
import { 
  TipoEntidad 
} from '../../../services/types/tipo-entidad.types';
import { 
  RolGobernanza 
} from '../../../services/types/rol-gobernanza.types';

// =============================================
// INTERFACES PRINCIPALES
// =============================================

export interface GobernanzaFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  initialData?: GobernanzaFormData;
  existingEntidadIds?: number[]; // Lista de entidadId ya existentes para validación local
  source?: 'gobernanza' | 'sistemas' | 'procesos' | 'documentos'; // Identifica desde qué página se llama el formulario
  onClose: () => void;
  onSubmit: (data: CreateGobernanzaCommand | UpdateGobernanzaCommand) => Promise<void>;
  onCancel: () => void;
  onGobernanzaChange?: (gobernanzaId: number) => void; // Callback para notificar cambio de gobernanza seleccionada
}

export interface GobernanzaFormData {
  // Datos de cabecera
  gobernanzaId?: number; // Para modo edición
  tipoGobiernoId: number | '';
  tipoEntidadId: number | '';
  entidadId?: number | ''; // ✅ ACTUALIZADO: Ahora es opcional según el nuevo flujo
  organizacionId?: number | '';
  nombre: string;
  fechaAsignacion: string;
  fechaVencimiento: string;
  observaciones: string;
  // Datos de detalle
  gobernanzaRoles: GobernanzaRolFormItem[];
}

export interface GobernanzaRolFormItem {
  id: string; // ID temporal para el formulario
  gobernanzaRolId?: number; // ✅ ID real de la base de datos (para roles existentes)
  rolGobernanzaId: number | '';
  usuarioId: number | '';
  fechaAsignacion: string;
  ordenEjecucion: number; // Orden de aprobación del rol
  puedeEditar: boolean; // ✅ Nuevo campo: indica si el usuario puede editar la entidad
  estado: number; // ✅ CORREGIDO: Cambiado de estadoActivo: boolean a estado: number para alinearse con GobernanzaRol
  // UI helpers
  isNew: boolean;
  isEditing: boolean;
  hasErrors: boolean;
}

// =============================================
// ESTADOS Y VALIDACIONES
// =============================================

export interface GobernanzaFormState {
  // Datos del formulario
  formData: GobernanzaFormData;
  // Listas de datos
  tiposGobierno: TipoGobierno[];
  tiposEntidad: TipoEntidad[];
  entidades: EntityOption[];
  rolesGobernanza: RolGobernanza[];
  usuarios: UserOption[];
  // Estados de carga
  isLoading: boolean;
  isLoadingEntities: boolean;
  isSubmitting: boolean;
  initialDataLoaded: boolean;
  // Errores
  errors: FormErrors;
  generalError: string | null;
  // UI
  activeTab: 'cabecera' | 'roles';
  expandedRoles: Set<string>;
}

export interface FormErrors {
  // Errores de cabecera
  tipoGobiernoId?: string;
  tipoEntidadId?: string;
  entidadId?: string;
  nombre?: string;
  fechaAsignacion?: string;
  fechaVencimiento?: string;
  observaciones?: string;
  // Errores de detalle
  gobernanzaRoles?: Record<string, RolFormErrors>;
  // Error general
  general?: string;
}

export interface RolFormErrors {
  rolGobernanzaId?: string;
  usuarioId?: string;
  fechaAsignacion?: string;
  duplicate?: string;
}

// =============================================
// OPCIONES Y LISTAS
// =============================================

export interface EntityOption {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'sistema' | 'proceso' | 'documento' | 'otro';
  activo: boolean;
}

export interface UserOption {
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  cargo?: string;
  activo: boolean;
  organizacionId: number;
}

// =============================================
// CONFIGURACIÓN Y VALIDACIONES
// =============================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, formData: GobernanzaFormData) => string | null;
}

export interface ValidationRules {
  tipoGobiernoId: ValidationRule;
  tipoEntidadId: ValidationRule;
  entidadId: ValidationRule;
  nombre: ValidationRule;
  fechaAsignacion: ValidationRule;
  fechaVencimiento: ValidationRule;
  observaciones: ValidationRule;
  gobernanzaRoles: {
    minItems: number;
    maxItems: number;
    rolGobernanzaId: ValidationRule;
    usuarioId: ValidationRule;
    fechaAsignacion: ValidationRule;
  };
}

// =============================================
// HELPERS Y UTILIDADES
// =============================================

export interface FormUtils {
  generateRoleId: () => string;
  validateForm: (data: GobernanzaFormData) => FormErrors;
  validateRole: (role: GobernanzaRolFormItem, allRoles: GobernanzaRolFormItem[]) => RolFormErrors;
  transformToCommand: (data: GobernanzaFormData) => CreateGobernanzaCommand;
  getEntityOptions: (tipoEntidadId: number, sistemas: any[]) => EntityOption[];
  checkRoleDuplicate: (role: GobernanzaRolFormItem, roles: GobernanzaRolFormItem[]) => boolean;
}

// =============================================
// CONSTANTES DE CONFIGURACIÓN
// =============================================

export const FORM_CONFIG = {
  MAX_ROLES: 10,
  MIN_ROLES: 1,
  DEFAULT_ROLE_ESTADO: 1, // ✅ CORREGIDO: Cambiado de true a 1 (ACTIVO)
  ENTITY_TYPES: {
    SISTEMA: 'sistema',
    PROCESO: 'proceso', 
    DOCUMENTO: 'documento',
    OTRO: 'otro'
  },
  DATE_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'yyyy-MM-dd HH:mm:ss'
} as const;

export const EMPTY_FORM_DATA: GobernanzaFormData = {
  tipoGobiernoId: '',
  tipoEntidadId: '',
  entidadId: undefined, // ✅ ACTUALIZADO: Ahora es undefined según el nuevo flujo
  nombre: '',
  fechaAsignacion: new Date().toISOString().split('T')[0],
  fechaVencimiento: '',
  observaciones: '',
  gobernanzaRoles: []
};

export const EMPTY_ROLE_ITEM: Omit<GobernanzaRolFormItem, 'id'> = {
  rolGobernanzaId: '',
  usuarioId: '',
  fechaAsignacion: new Date().toISOString().split('T')[0],
  ordenEjecucion: 0, // Valor por defecto para orden de aprobación
  puedeEditar: false,
  estado: 1, // ✅ CORREGIDO: Cambiado de estadoActivo: true a estado: 1 (ACTIVO)
  isNew: true,
  isEditing: false,
  hasErrors: false
};