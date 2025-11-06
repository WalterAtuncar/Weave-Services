import { SystemFormData, SystemFormErrors, ValidationResult } from '../types';

export const validateStep1 = (formData: SystemFormData): ValidationResult => {
  const errors: Partial<SystemFormErrors> = {};

  if (!formData.nombreSistema?.trim()) errors.nombreSistema = 'El nombre es requerido';
  if (!formData.codigoSistema?.trim()) errors.codigoSistema = 'El código es requerido';
  // funcionPrincipal es opcional, no se valida como requerido
  if (!formData.tipoSistema || formData.tipoSistema <= 0) errors.tipoSistema = 'Seleccione un tipo de sistema';
  if (!formData.familiaSistema || formData.familiaSistema <= 0) errors.familiaSistema = 'Seleccione una familia de sistema';

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateStep2 = (formData: SystemFormData): ValidationResult => {
  const errors: Partial<SystemFormErrors> = {};
  // En el modelo mínimo, estos campos son opcionales. Se puede agregar reglas si se requiere.
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateStep3 = (formData: SystemFormData): ValidationResult => {
  const errors: Partial<SystemFormErrors> = {};

  // Validación de módulos (opcional, pero si hay módulos deben ser válidos)
  if (formData.modulos && formData.modulos.length > 0) {
    const invalidModules = formData.modulos.filter(module => 
      !module?.nombre?.trim() || !module?.version?.trim()
    );
    
    if (invalidModules.length > 0) {
      errors.modulos = 'Todos los módulos deben tener nombre y versión';
    }
    
    // Verificar nombres únicos (ignorando vacíos/undefined)
    const moduleNames = formData.modulos
      .map(m => (m?.nombre ? m.nombre.toLowerCase().trim() : ''))
      .filter(name => !!name);
    const duplicateNames = moduleNames.filter((name, index) => moduleNames.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      errors.modulos = 'Los nombres de los módulos deben ser únicos';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateStep4 = (formData: SystemFormData): ValidationResult => {
  const errors: Partial<SystemFormErrors> = {};

  // Como tieneGobernanzaPropia siempre es true, no se requiere validación adicional
  // La gobernanza será siempre propia del sistema

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateAllSteps = (formData: SystemFormData) => {
  const step1 = validateStep1(formData);
  const step2 = validateStep2(formData);
  const step3 = validateStep3(formData);
  const step4 = validateStep4(formData);
  const overall = step1.isValid && step2.isValid && step3.isValid && step4.isValid;
  return { step1, step2, step3, step4, overall };
};

export const isStepComplete = (stepNumber: number, formData: SystemFormData): boolean => {
  switch (stepNumber) {
    case 1: return validateStep1(formData).isValid;
    case 2: return validateStep2(formData).isValid;
    case 3: return validateStep3(formData).isValid;
    case 4: return validateStep4(formData).isValid;
    default: return validateAllSteps(formData).overall;
  }
};