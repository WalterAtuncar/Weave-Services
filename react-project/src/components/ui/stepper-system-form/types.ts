import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// ===== INTERFACES PARA DATOS DEL FORMULARIO (ALINEADAS CON SystemForm.tsx) =====
export interface SystemModuleData {
  id: number;
  nombre: string;
  descripcion?: string;
  version?: string;
  activo: boolean;
  orden?: number;
  sistemaId: number;
}

export interface SystemFormData {
  id?: number; // ID del sistema (para edición)
  nombreSistema: string;
  codigoSistema: string;
  funcionPrincipal: string;
  tipoSistema: number; // ID
  familiaSistema: number; // ID
  sistemaDepende?: number; // ID del sistema padre (opcional)
  estado: number; // EstadoSistema enum value
  servidorIds: number[]; // IDs de servidores
  modulos?: SystemModuleData[]; // Módulos del sistema
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number; // ID de gobernanza cuando no es propia
}

export interface SystemFormErrors {
  nombreSistema?: string;
  codigoSistema?: string;
  funcionPrincipal?: string;
  tipoSistema?: string;
  familiaSistema?: string;
  sistemaDepende?: string;
  servidorIds?: string;
  modulos?: string;
  gobernanzaId?: string;
  general?: string;
}

// ===== INTERFACES PARA STEPPER =====
export type FormMode = 'create' | 'edit';

export interface StepperSystemFormProps {
  isOpen: boolean;
  mode?: FormMode;
  initialData?: SystemFormData;
  // Cierra el stepper (se usa en el contenedor Stepper)
  onClose?: () => void;
  // Submit final del formulario stepper
  onSubmit: (data: SystemFormData) => Promise<void> | void;
  // Carga de datos de referencia (tipos de sistema, sistemas, servidores, etc.)
  onLoadData?: () => Promise<ReferenceData>;
  isSubmitting?: boolean;
}

export interface StepConfigLite {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<SystemFormErrors>;
}

// ===== DATOS DE REFERENCIA MÍNIMOS =====
export interface TipoSistema { id: number; nombre: string; descripcion?: string }
export interface FamiliaSistema { id: number; nombre: string; descripcion?: string }
export interface Sistema { id: number; nombre: string; codigo?: string }
export interface Servidor { id: number; nombre: string }
export interface GobernanzaRef { id: number; nombre: string }

export interface ReferenceData {
  tiposSistema: TipoSistema[];
  familiasSistema?: FamiliaSistema[];
  sistemas: Sistema[];
  servidores: Servidor[];
  gobernanzas?: GobernanzaRef[];
}

// ===== INTERFACES PARA PROPS DE STEPS =====
export interface Step1Props {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  onErrorChange: (errors: Partial<SystemFormErrors>) => void;
}

export interface Step2Props {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  onErrorChange: (errors: Partial<SystemFormErrors>) => void;
}

export interface Step3Props {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  onErrorChange: (errors: Partial<SystemFormErrors>) => void;
}

export interface Step4Props {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  onErrorChange: (errors: Partial<SystemFormErrors>) => void;
}

export interface Step5Props {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  onErrorChange: (errors: Partial<SystemFormErrors>) => void;
}