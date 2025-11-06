// Componente principal
export { default as StepperDominioDataForm } from './StepperDominioDataForm';

// Componentes de pasos
export { default as Step1BasicInfo } from './steps/Step1BasicInfo';
export { default as Step2SubDominios } from './steps/Step2SubDominios';
export { default as Step3Governance } from './steps/Step3Governance';
export { default as Step4Summary } from './steps/Step4Summary';

// Tipos
export type {
  DominioDataFormData,
  DominioDataFormErrors,
  ValidationResult,
  StepperDominioDataFormProps,
  FormMode,
  TipoDominio,
  TipoEntidad,
  GobernanzaRef,
  ReferenceData,
  SubDominioData
} from './types';

// Utilidades de validación
export {
  validateStep1,
  validateStep2,
  validateStep3,
  validateAllSteps,
  isStepComplete,
  validateSubDominio,
  isValidCodeFormat,
  validateFieldLength,
} from './utils/validations';

// Utilidades de datos
export {
  initializeFormData,
  transformFormDataForSubmission,
  transformBackendDataToFormData,
  generateCodeFromName,
  isCodeUnique,
  isNameUnique,
  getNextSubDominioId,
  createNewSubDominio,
  updateSubDominioInList,
  removeSubDominioFromList,
} from './utils/dataHelpers';