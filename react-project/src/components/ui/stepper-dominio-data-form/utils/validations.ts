import { DominioDataFormData, DominioDataFormErrors, ValidationResult, SubDominioDataDto, FormMode } from '../types';

/**
 * Valida el paso 1: Información básica del dominio
 */
export const validateStep1 = (data: DominioDataFormData): ValidationResult => {
  const errors: DominioDataFormErrors = {};

  // Validar nombre del dominio
  if (!data.nombreDominio || data.nombreDominio.trim().length === 0) {
    errors.nombreDominio = 'El nombre del dominio es obligatorio';
  } else if (data.nombreDominio.trim().length < 3) {
    errors.nombreDominio = 'El nombre debe tener al menos 3 caracteres';
  }

  // Validar código del dominio (solo requerido, sin mínimo ni patrón)
  if (!data.codigoDominio || data.codigoDominio.trim().length === 0) {
    errors.codigoDominio = 'El código del dominio es obligatorio';
  }

  // Validar tipo de dominio
  if (!data.tipoDominioId || data.tipoDominioId <= 0) {
    errors.tipoDominioId = 'Debe seleccionar un tipo de dominio';
  }

  // Validar descripción (OPCIONAL): solo validar longitud si hay contenido
  if (
    data.descripcionDominio &&
    data.descripcionDominio.trim().length > 0 &&
    data.descripcionDominio.trim().length < 10
  ) {
    errors.descripcionDominio = 'La descripción debe tener al menos 10 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    overall: Object.keys(errors).length === 0
  };
};

/**
 * Valida el paso 2: Subdominios
 */
export const validateStep2 = (data: DominioDataFormData): ValidationResult => {
  const errors: DominioDataFormErrors = {};

  // Los subdominios son opcionales, por lo que si no hay ninguno, es válido
  if (data.subDominios && data.subDominios.length > 0) {
    // Validar cada subdominio
    data.subDominios.forEach((subdominio, index) => {
      const subErrors = validateSubDominio(subdominio, data.subDominios, index);
      if (Object.keys(subErrors).length > 0) {
        errors[`subdominio_${index}`] = 'Subdominio con errores de validación';
      }
    });

    // Validar unicidad de nombres
    const nombres = data.subDominios.map(s => s.nombreSubDominio.toLowerCase());
    const nombresDuplicados = nombres.filter((nombre, index) => nombres.indexOf(nombre) !== index);
    if (nombresDuplicados.length > 0) {
      errors.subDominios = 'Hay nombres de subdominios duplicados';
    }

    // Validar unicidad de códigos
    const codigos = data.subDominios.map(s => s.codigoSubDominio.toLowerCase());
    const codigosDuplicados = codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index);
    if (codigosDuplicados.length > 0) {
      errors.subDominios = 'Hay códigos de subdominios duplicados';
    }
  }

  // El paso 2 siempre es válido ya que los subdominios son opcionales
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    overall: Object.keys(errors).length === 0
  };
};

/**
 * Valida el paso 3: Gobernanza
 */
export const validateStep3 = (data: DominioDataFormData): ValidationResult => {
  const errors: DominioDataFormErrors = {};

  // Si tiene gobernanza propia, debe tener un ID de gobernanza válido
  if (data.tieneGobernanzaPropia && (!data.gobernanzaId || data.gobernanzaId <= 0)) {
    errors.gobernanzaId = 'Debe seleccionar una gobernanza';
  }

  // Si no tiene gobernanza propia, es válido (heredará de la organización)
  // El paso 3 es válido si:
  // 1. No tiene gobernanza propia (heredará de la organización), O
  // 2. Tiene gobernanza propia Y tiene un gobernanzaId válido
  const isValid = !data.tieneGobernanzaPropia || (data.tieneGobernanzaPropia && data.gobernanzaId && data.gobernanzaId > 0);

  return {
    isValid,
    errors,
    overall: isValid
  };
};

/**
 * Valida todos los pasos del formulario
 */
export const validateAllSteps = (
  data: DominioDataFormData,
  options?: { mode?: FormMode; hasGovernanceStep?: boolean }
) => {
  const includeGovernance =
    typeof options?.hasGovernanceStep === 'boolean'
      ? options!.hasGovernanceStep
      : options?.mode === FormMode.EDIT;

  const step1 = validateStep1(data);
  const step2 = validateStep2(data);
  const step3 = includeGovernance
    ? validateStep3(data)
    : ({ isValid: true, errors: {}, overall: true } as ValidationResult);

  return {
    step1: step1.isValid,
    step2: step2.isValid,
    step3: step3.isValid,
    overall: step1.isValid && step2.isValid && (includeGovernance ? step3.isValid : true)
  };
};

/**
 * Verifica si un paso está completo
 */
export const isStepComplete = (step: number, data: DominioDataFormData): boolean => {
  switch (step) {
    case 1:
      return validateStep1(data).isValid;
    case 2:
      return validateStep2(data).isValid;
    case 3:
      return validateStep3(data).isValid;
    default:
      return false;
  }
};

/**
 * Valida un subdominio individual
 */
export const validateSubDominio = (
  subdominio: SubDominioDataDto,
  allSubdominios: SubDominioDataDto[],
  currentIndex?: number
): DominioDataFormErrors => {
  const errors: DominioDataFormErrors = {};

  // Validar nombre
  if (!subdominio.nombreSubDominio || subdominio.nombreSubDominio.trim().length === 0) {
    errors.nombreSubDominio = 'El nombre es obligatorio';
  } else if (subdominio.nombreSubDominio.trim().length < 3) {
    errors.nombreSubDominio = 'El nombre debe tener al menos 3 caracteres';
  }

  // Validar código (solo requerido, sin mínimo ni patrón)
  if (!subdominio.codigoSubDominio || subdominio.codigoSubDominio.trim().length === 0) {
    errors.codigoSubDominio = 'El código es obligatorio';
  }

  // Validar descripción
  if (!subdominio.descripcionSubDominio || subdominio.descripcionSubDominio.trim().length === 0) {
    errors.descripcionSubDominio = 'La descripción es obligatoria';
  } else if (subdominio.descripcionSubDominio.trim().length < 10) {
    errors.descripcionSubDominio = 'La descripción debe tener al menos 10 caracteres';
  }

  return errors;
};

/**
 * Valida el formato de un código
 */
export const isValidCodeFormat = (code: string): boolean => {
  // Código flexible: letras, números, espacios, guiones y guiones bajos (mínimo 2)
  const codeRegex = /^[A-Za-z0-9 _-]{2,}$/;
  return codeRegex.test(code);
};

/**
 * Valida la longitud de un campo
 */
export const validateFieldLength = (
  value: string,
  minLength: number,
  maxLength?: number,
  fieldName?: string
): string | undefined => {
  if (!value || value.trim().length === 0) {
    return `${fieldName || 'El campo'} es obligatorio`;
  }

  if (value.trim().length < minLength) {
    return `${fieldName || 'El campo'} debe tener al menos ${minLength} caracteres`;
  }

  if (maxLength && value.trim().length > maxLength) {
    return `${fieldName || 'El campo'} no puede tener más de ${maxLength} caracteres`;
  }

  return undefined;
};