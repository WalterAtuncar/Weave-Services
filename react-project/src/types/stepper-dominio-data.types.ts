/**
 * Tipos TypeScript para el Stepper de Dominios de Data
 * Basado en la estructura del StepperSystemForm y los modelos existentes de DominiosData
 */

import {
  DominioData,
  CreateDominioDataFormDto,
  UpdateDominioDataFormDto,
  CreateSubDominioDataDto,
  UpdateSubDominioDataDto,
  EstadoDominioData,
  TipoDominioData,
  CategoriaSubDominio,
  NivelSensibilidad,
  TipoDominio
} from '../models/DominiosData';
import { Gobernanza } from '../services/types/gobernanza.types';

// ===== ENUMS PARA EL STEPPER =====

/**
 * Pasos del stepper de dominios de data
 */
export enum StepperDominioDataStep {
  BASIC_INFO = 1,
  SUB_DOMINIOS = 2,
  GOVERNANCE = 3,
  SUMMARY = 4
}

/**
 * Tipos de guardado disponibles
 */
export enum SaveType {
  DRAFT = 'draft',           // Guardar como borrador
  SUBMIT_APPROVAL = 'submit' // Enviar a aprobación
}

/**
 * Modos de operación del stepper
 */
export enum StepperMode {
  CREATE = 'create',
  EDIT = 'edit'
}

// ===== INTERFACES PARA DATOS DEL FORMULARIO =====

/**
 * Datos del paso 1: Información básica del dominio
 */
export interface Step1BasicInfoData {
  codigoDominio: string;
  nombreDominio: string;
  descripcionDominio: string;
  tipoDominioId: number;
  nivel: number;
  propietarioNegocio: string;
  stewardData: string;
  politicasGobierno: string;
}

/**
 * Datos de un subdominio en el paso 2
 */
export interface SubDominioFormData {
  // Para edición
  subDominioDataId?: number;
  
  // Datos del subdominio
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio: string;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number;
  
  // Estado temporal para el formulario
  isNew?: boolean;
  isDeleted?: boolean;
  hasChanges?: boolean;
}

/**
 * Datos del paso 2: Subdominios
 */
export interface Step2SubDominiosData {
  subDominios: SubDominioFormData[];
}

/**
 * Datos del paso 3: Gobernanza
 */
export interface Step3GovernanceData {
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number;
  gobernanzaSeleccionada?: Gobernanza;
}

/**
 * Datos del paso 4: Resumen y guardado
 */
export interface Step4SummaryData {
  saveType: SaveType;
  comentarios?: string;
}

/**
 * Datos completos del formulario del stepper
 */
export interface StepperDominioDataFormData {
  // Información básica
  basicInfo: Step1BasicInfoData;
  
  // Subdominios
  subDominios: Step2SubDominiosData;
  
  // Gobernanza
  governance: Step3GovernanceData;
  
  // Resumen
  summary: Step4SummaryData;
  
  // Metadatos
  organizacionId: number;
  mode: StepperMode;
  dominioId?: number; // Para modo edición
  version?: number;   // Para modo edición
}

// ===== INTERFACES PARA VALIDACIÓN =====

/**
 * Errores de validación para cada paso
 */
export interface StepValidationErrors {
  [key: string]: string | undefined;
}

/**
 * Estado de validación de todos los pasos
 */
export interface StepperValidationState {
  [StepperDominioDataStep.BASIC_INFO]: {
    isValid: boolean;
    errors: StepValidationErrors;
  };
  [StepperDominioDataStep.SUB_DOMINIOS]: {
    isValid: boolean;
    errors: StepValidationErrors;
  };
  [StepperDominioDataStep.GOVERNANCE]: {
    isValid: boolean;
    errors: StepValidationErrors;
  };
  [StepperDominioDataStep.SUMMARY]: {
    isValid: boolean;
    errors: StepValidationErrors;
  };
}

// ===== INTERFACES PARA CONFIGURACIÓN DE PASOS =====

/**
 * Configuración de un paso del stepper
 */
export interface StepConfig {
  step: StepperDominioDataStep;
  title: string;
  description: string;
  isOptional?: boolean;
  canSkip?: boolean;
  requiresValidation?: boolean;
}

/**
 * Configuración completa del stepper
 */
export interface StepperConfig {
  steps: StepConfig[];
  allowNavigationWithErrors?: boolean;
  showProgressBar?: boolean;
  showStepNumbers?: boolean;
}

// ===== INTERFACES PARA PROPS DE COMPONENTES =====

/**
 * Props del componente principal StepperDominioDataForm
 */
export interface StepperDominioDataFormProps {
  /** Dominio a editar (null para crear nuevo) */
  dominio?: DominioData | null;
  
  /** ID de la organización */
  organizacionId: number;
  
  /** Función llamada al completar el stepper */
  onComplete: (data: StepperDominioDataFormData, saveType: SaveType) => Promise<void>;
  
  /** Función llamada al cancelar */
  onCancel: () => void;
  
  /** Estado de loading durante el guardado */
  isLoading?: boolean;
  
  /** Desactivar todo el stepper */
  disabled?: boolean;
  
  /** Configuración personalizada del stepper */
  config?: Partial<StepperConfig>;
  
  /** Paso inicial (por defecto 1) */
  initialStep?: StepperDominioDataStep;
  
  /** Mostrar botones de navegación */
  showNavigation?: boolean;
  
  /** Permitir navegación libre entre pasos */
  allowFreeNavigation?: boolean;
}

/**
 * Props base para componentes de pasos
 */
export interface BaseStepProps {
  /** Datos del formulario */
  formData: StepperDominioDataFormData;
  
  /** Función para actualizar datos */
  onDataChange: (data: Partial<StepperDominioDataFormData>) => void;
  
  /** Errores de validación */
  errors: StepValidationErrors;
  
  /** Estado de loading */
  isLoading?: boolean;
  
  /** Desactivar el paso */
  disabled?: boolean;
  
  /** ID de la organización */
  organizacionId: number;
}

/**
 * Props específicas para Step1BasicInfo
 */
export interface Step1BasicInfoProps extends BaseStepProps {
  /** Lista de tipos de dominio disponibles */
  tiposDominio: TipoDominio[];
  
  /** Función para cargar tipos de dominio */
  onLoadTiposDominio?: () => Promise<void>;
}

/**
 * Props específicas para Step2SubDominios
 */
export interface Step2SubDominiosProps extends BaseStepProps {
  /** Función para agregar subdominio */
  onAddSubDominio: () => void;
  
  /** Función para eliminar subdominio */
  onRemoveSubDominio: (index: number) => void;
  
  /** Función para actualizar subdominio */
  onUpdateSubDominio: (index: number, data: Partial<SubDominioFormData>) => void;
}

/**
 * Props específicas para Step3Governance
 */
export interface Step3GovernanceProps extends BaseStepProps {
  /** Lista de gobernanzas disponibles */
  gobernanzas: Gobernanza[];
  
  /** Función para cargar gobernanzas */
  onLoadGobernanzas?: () => Promise<void>;
  
  /** Función para buscar gobernanzas */
  onSearchGobernanzas?: (searchTerm: string) => Promise<void>;
}

/**
 * Props específicas para Step4Summary
 */
export interface Step4SummaryProps extends BaseStepProps {
  /** Función para guardar como borrador */
  onSaveDraft: () => Promise<void>;
  
  /** Función para enviar a aprobación */
  onSubmitApproval: () => Promise<void>;
  
  /** Mostrar preview de los datos */
  showPreview?: boolean;
}

// ===== INTERFACES PARA DATOS DE REFERENCIA =====

/**
 * Datos de referencia necesarios para el stepper
 */
export interface StepperReferenceData {
  tiposDominio: TipoDominio[];
  gobernanzas: Gobernanza[];
  isLoadingTipos: boolean;
  isLoadingGobernanzas: boolean;
  errorTipos?: string;
  errorGobernanzas?: string;
}

// ===== INTERFACES PARA NAVEGACIÓN =====

/**
 * Estado de navegación del stepper
 */
export interface StepperNavigationState {
  currentStep: StepperDominioDataStep;
  completedSteps: StepperDominioDataStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  canFinish: boolean;
}

/**
 * Acciones de navegación disponibles
 */
export interface StepperNavigationActions {
  goToStep: (step: StepperDominioDataStep) => void;
  goNext: () => void;
  goPrevious: () => void;
  finish: (saveType: SaveType) => Promise<void>;
  cancel: () => void;
}

// ===== INTERFACES PARA HOOKS =====

/**
 * Return type del hook useStepperDominioData
 */
export interface UseStepperDominioDataReturn {
  // Estado del formulario
  formData: StepperDominioDataFormData;
  setFormData: (data: StepperDominioDataFormData) => void;
  updateFormData: (data: Partial<StepperDominioDataFormData>) => void;
  
  // Navegación
  navigation: StepperNavigationState;
  navigationActions: StepperNavigationActions;
  
  // Validación
  validation: StepperValidationState;
  validateStep: (step: StepperDominioDataStep) => boolean;
  validateAllSteps: () => boolean;
  
  // Datos de referencia
  referenceData: StepperReferenceData;
  loadReferenceData: () => Promise<void>;
  
  // Estado general
  isLoading: boolean;
  error?: string;
  
  // Utilidades
  resetForm: () => void;
  initializeFromDominio: (dominio: DominioData) => void;
  canNavigateToStep: (step: StepperDominioDataStep) => boolean;
}

// ===== TIPOS DE UTILIDAD =====

/**
 * Tipo para funciones de validación de pasos
 */
export type StepValidator = (data: StepperDominioDataFormData) => StepValidationErrors;

/**
 * Tipo para funciones de transformación de datos
 */
export type DataTransformer<T> = (data: StepperDominioDataFormData) => T;

/**
 * Tipo para el payload final de creación
 */
export type CreateDominioPayload = CreateDominioDataFormDto & {
  subDominios: CreateSubDominioDataDto[];
  saveType: SaveType;
};

/**
 * Tipo para el payload final de actualización
 */
export type UpdateDominioPayload = UpdateDominioDataFormDto & {
  subDominios: {
    create: CreateSubDominioDataDto[];
    update: UpdateSubDominioDataDto[];
    delete: number[];
  };
  saveType: SaveType;
};

// ===== CONSTANTES =====

/**
 * Configuración por defecto del stepper
 */
export const DEFAULT_STEPPER_CONFIG: StepperConfig = {
  steps: [
    {
      step: StepperDominioDataStep.BASIC_INFO,
      title: 'Información Básica',
      description: 'Datos principales del dominio',
      requiresValidation: true
    },
    {
      step: StepperDominioDataStep.SUB_DOMINIOS,
      title: 'Subdominios',
      description: 'Gestión de subdominios',
      isOptional: true
    },
    {
      step: StepperDominioDataStep.GOVERNANCE,
      title: 'Gobernanza',
      description: 'Configuración de gobierno',
      isOptional: true
    },
    {
      step: StepperDominioDataStep.SUMMARY,
      title: 'Resumen',
      description: 'Revisión y guardado',
      requiresValidation: true
    }
  ],
  allowNavigationWithErrors: false,
  showProgressBar: true,
  showStepNumbers: true
};

/**
 * Datos iniciales del formulario
 */
export const INITIAL_FORM_DATA: StepperDominioDataFormData = {
  basicInfo: {
    codigoDominio: '',
    nombreDominio: '',
    descripcionDominio: '',
    tipoDominioId: 0,
    nivel: 1,
    propietarioNegocio: '',
    stewardData: '',
    politicasGobierno: ''
  },
  subDominios: {
    subDominios: []
  },
  governance: {
    tieneGobernanzaPropia: false
  },
  summary: {
    saveType: SaveType.DRAFT
  },
  organizacionId: 0,
  mode: StepperMode.CREATE
};