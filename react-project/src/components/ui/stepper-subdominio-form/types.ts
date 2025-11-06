/**
 * Tipos TypeScript para el Stepper de Subdominios
 * Basado en la estructura del StepperDominioDataForm
 */

import { ReactNode } from 'react';
import { SubDominioData, EstadoDominioData } from '../../../models/DominiosData';
import { GobernanzaRef } from '../stepper-dominio-data-form/types';

// ===== ENUMS =====

/**
 * Modos de operación del formulario
 */
export enum FormMode {
  CREATE = 'create',
  EDIT = 'edit'
}

/**
 * Pasos del stepper de subdominios
 */
export enum StepperSubDominioStep {
  LISTA_SUBDOMINIOS = 1,
  FORMULARIO_SUBDOMINIO = 2,
  GOVERNANCE = 3,
  SUMMARY = 4
}

// ===== INTERFACES PRINCIPALES =====

/**
 * Datos del formulario de subdominio
 */
export interface SubDominioFormData {
  /** ID del subdominio (para edición) */
  subDominioId?: number;
  /** ID del dominio padre */
  dominioId: number;
  /** Código del subdominio */
  codigoSubDominio: string;
  /** Nombre del subdominio */
  nombreSubDominio: string;
  /** Descripción del subdominio */
  descripcionSubDominio?: string;
  /** Estado del subdominio */
  estado: EstadoDominioData;
  /** ID de la organización */
  organizacionId: number;
  /** Referencia de gobernanza */
  gobernanzaRef?: GobernanzaRef;
  /** ID de gobernanza */
  gobernanzaId?: number;
  /** Indica si tiene gobernanza propia */
  tieneGobernanzaPropia?: boolean;
  /** Usuario que crea/actualiza */
  creadoPor?: number;
  actualizadoPor?: number;
  /** Fechas de auditoría */
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

/**
 * Errores de validación del formulario
 */
export interface SubDominioFormErrors {
  codigoSubDominio?: string;
  nombreSubDominio?: string;
  descripcionSubDominio?: string;
  gobernanzaId?: string;
  general?: string;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: SubDominioFormErrors;
  overall: boolean;
}

/**
 * Props del componente principal StepperSubDominioForm
 */
export interface StepperSubDominioFormProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Función llamada al completar exitosamente */
  onSuccess?: (subdominio: SubDominioFormData, saveType: 'draft' | 'approval') => void;
  /** Función llamada si hay error */
  onError?: (error: string) => void;
  /** Modo del formulario */
  mode: FormMode;
  /** Datos iniciales del subdominio (para edición) */
  initialData?: Partial<SubDominioFormData>;
  /** ID del dominio padre */
  dominioId: number;
  /** ID de la organización */
  organizacionId: number;
  /** Lista de subdominios existentes */
  existingSubDominios?: SubDominioData[];
  /** Título personalizado del modal */
  title?: string;
  /** Configuración personalizada del stepper */
  config?: Partial<StepperConfig>;
  /** Paso inicial (por defecto 1) */
  initialStep?: StepperSubDominioStep;
  /** Mostrar botones de navegación */
  showNavigation?: boolean;
  /** Permitir navegación libre entre pasos */
  allowFreeNavigation?: boolean;
}

/**
 * Configuración del stepper
 */
export interface StepperConfig {
  /** Mostrar indicadores de progreso */
  showProgress: boolean;
  /** Permitir navegación hacia atrás */
  allowBackNavigation: boolean;
  /** Validar pasos automáticamente */
  autoValidate: boolean;
  /** Mostrar resumen al final */
  showSummary: boolean;
}

// ===== PROPS DE PASOS =====

/**
 * Props base para componentes de pasos
 */
export interface BaseStepProps {
  /** Datos del formulario */
  formData: SubDominioFormData;
  /** Función para actualizar datos */
  onDataChange: (data: Partial<SubDominioFormData>) => void;
  /** Errores de validación */
  errors: SubDominioFormErrors;
  /** Estado de loading */
  isLoading?: boolean;
  /** Desactivar el paso */
  disabled?: boolean;
  /** ID de la organización */
  organizacionId: number;
}

/**
 * Props específicas para Step1 - Lista de Subdominios
 */
export interface Step1ListaSubDominiosProps extends BaseStepProps {
  /** Lista de subdominios existentes */
  subDominios: SubDominioData[];
  /** Función para crear nuevo subdominio */
  onNewSubDominio: () => void;
  /** Función para editar subdominio */
  onEditSubDominio: (subdominio: SubDominioData) => void;
  /** Función para eliminar subdominio */
  onDeleteSubDominio: (subdominio: SubDominioData) => void;
  /** Estado de carga de subdominios */
  loadingSubDominios?: boolean;
}

/**
 * Props específicas para Step2 - Formulario de Subdominio
 */
export interface Step2FormularioSubDominioProps extends BaseStepProps {
  /** Modo del formulario */
  mode: FormMode;
  /** Subdominio en edición */
  editingSubDominio?: SubDominioData | null;
}

/**
 * Props específicas para Step3 - Governance
 */
export interface Step3GovernanceProps extends BaseStepProps {
  /** Función para cargar gobernanzas */
  onLoadGobernanzas?: () => Promise<void>;
}

/**
 * Props específicas para Step4 - Summary
 */
export interface Step4SummaryProps extends BaseStepProps {
  /** Función para enviar formulario */
  onSubmit: (saveType: 'draft' | 'approval') => Promise<void>;
  /** Estado de envío */
  isSubmitting?: boolean;
  /** Resultado de validación general */
  validationResults: ValidationResult;
  /** Modo del formulario */
  mode: FormMode;
}

// ===== TIPOS DE DATOS =====

/**
 * Request para crear subdominio
 */
export interface CreateSubDominioRequest {
  dominioId: number;
  organizacionId: number;
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio?: string;
  estado: EstadoDominioData;
  gobernanzaId?: number;
  tieneGobernanzaPropia?: boolean;
  creadoPor: number;
}

/**
 * Request para actualizar subdominio
 */
export interface UpdateSubDominioRequest {
  subDominioId: number;
  dominioId: number;
  organizacionId: number;
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio?: string;
  estado: EstadoDominioData;
  gobernanzaId?: number;
  tieneGobernanzaPropia?: boolean;
  actualizadoPor: number;
}

/**
 * Datos de referencia necesarios para el formulario
 */
export interface ReferenceData {
  /** Lista de gobernanzas disponibles */
  gobernanzas: GobernanzaRef[];
  /** Indica si los datos están cargando */
  loading: boolean;
  /** Error en la carga de datos */
  error?: string;
}

// ===== TIPOS DE UTILIDAD =====

/**
 * Tipo para los tipos de guardado
 */
export type SaveType = 'draft' | 'approval';

/**
 * Tipo para los estados de validación de pasos
 */
export type StepValidationState = {
  [key in StepperSubDominioStep]: boolean;
};

/**
 * Tipo para los datos de transformación
 */
export interface TransformationData {
  formData: SubDominioFormData;
  saveType: SaveType;
  mode: FormMode;
}