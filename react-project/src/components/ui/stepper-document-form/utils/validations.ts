import { DocumentFormData, ValidationResult } from '../types';

export const validateStep1 = (data: DocumentFormData): ValidationResult => {
  const errors: any = {};
  if (!data.archivo) errors.archivo = 'Debes seleccionar un archivo PDF, DOCX, PPT/PPTX o Excel';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateStep2 = (data: DocumentFormData): ValidationResult => {
  const errors: any = {};
  if (!data.titulo || !data.titulo.trim()) errors.titulo = 'El título es obligatorio';
  if (!data.tipo) errors.tipo = 'Debes seleccionar un tipo de documento';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateStep3 = (data: DocumentFormData): ValidationResult => {
  const errors: any = {};
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateAllSteps = (data: DocumentFormData) => ({
  step1: validateStep1(data),
  step2: validateStep2(data),
  step3: validateStep3(data),
  overall: validateStep1(data).isValid && validateStep2(data).isValid && validateStep3(data).isValid,
});

export const isStepComplete = (step: number, data: DocumentFormData) => {
  switch (step) {
    case 1: return validateStep1(data).isValid;
    case 2: return validateStep2(data).isValid;
    case 3: return validateStep3(data).isValid;
    default: return false;
  }
};