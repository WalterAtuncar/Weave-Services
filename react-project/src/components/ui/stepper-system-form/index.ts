// Componente principal
export { default as StepperSystemForm } from './StepperSystemForm';

// Componentes de pasos
export { default as Step1BasicInfo } from './steps/Step1BasicInfo';
export { default as Step2HierarchyServers } from './steps/Step2HierarchyServers';
export { default as Step3Modules } from './steps/Step3Modules';
export { default as Step4Governance } from './steps/Step4Governance';
export { default as Step5Summary } from './steps/Step5Summary';

// Tipos (mínimos)
export type {
  SystemFormData,
  SystemFormErrors,
  ValidationResult,
  StepperSystemFormProps,
  FormMode,
  TipoSistema,
  FamiliaSistema,
  Sistema,
  Servidor,
  GobernanzaRef,
  ReferenceData
} from './types';

// Utilidades de validación
export {
  validateStep1,
  validateStep2,
  validateStep3,
  validateAllSteps,
  isStepComplete,
} from './utils/validations';

// Utilidades de datos
export {
  initializeFormData,
  transformFormDataForSubmission,
  transformBackendDataToFormData,
} from './utils/dataHelpers';