import { DominioData } from '../../../models/DominiosData';

// ===== INTERFACES PARA PROPS =====

/**
 * Props del componente principal StepperDominioDataForm
 */
export interface StepperDominioDataFormProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  
  /** Modo del formulario */
  mode?: FormMode;
  
  /** Datos iniciales del formulario */
  initialData?: DominioDataFormData;
  
  /** ID de la organización */
  organizacionId: number;
  
  /** Función llamada al cerrar */
  onClose: () => void;
  
  /** Función llamada al enviar */
  onSubmit: (data: any, saveType: 'draft' | 'approval') => Promise<void>;
  
  /** Función para cargar datos */
  onLoadData?: () => Promise<void>;
  
  /** Estado de envío */
  isSubmitting?: boolean;
  
  /** Dominio a editar (para modo edición) */
  editingDominio?: any | null;
}

// ===== ENUMS =====

export enum FormMode {
  CREATE = 'create',
  EDIT = 'edit'
}

// ===== INTERFACES PARA DATOS =====

export interface DominioDataFormData {
  codigoDominio: string;
  nombreDominio: string;
  descripcionDominio: string;
  tipoDominioId: number;
  gobernanzaId?: number;
  tieneGobernanzaPropia?: boolean;
  subDominios: SubDominioDataDto[];
  organizacionId: number;
}

export interface DominioDataFormErrors {
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: DominioDataFormErrors;
}

export interface TipoDominioData {
  tipoDominioId: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface SubDominioDataDto {
  subDominioDataId?: number;
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio: string;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number;
}

export interface GobernanzaRef {
  gobernanzaId: number;
  nombre: string;
  descripcion?: string;
}