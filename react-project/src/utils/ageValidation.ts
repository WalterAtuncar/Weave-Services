/**
 * Utilidades para validación de edad y fechas de nacimiento
 */

/**
 * Calcula la edad en años a partir de una fecha de nacimiento
 */
export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  // Verificar que la fecha sea válida
  if (isNaN(birth.getTime())) {
    return 0;
  }
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Si aún no ha cumplido años este año
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Valida si la persona tiene al menos la edad mínima requerida
 */
export const validateMinimumAge = (birthDate: string, minimumAge: number = 18): boolean => {
  if (!birthDate) return false;
  
  const age = calculateAge(birthDate);
  return age >= minimumAge;
};

/**
 * Obtiene un mensaje de error personalizado para validación de edad
 */
export const getAgeValidationMessage = (birthDate: string, minimumAge: number = 18): string => {
  if (!birthDate) {
    return 'La fecha de nacimiento es obligatoria';
  }
  
  const age = calculateAge(birthDate);
  
  if (age === 0) {
    return 'Ingrese una fecha de nacimiento válida';
  }
  
  if (age < minimumAge) {
    return `La edad mínima requerida es ${minimumAge} años. Edad actual: ${age} años`;
  }
  
  return '';
};

/**
 * Valida que la fecha de nacimiento no sea futura
 */
export const validateBirthDateNotFuture = (birthDate: string): boolean => {
  if (!birthDate) return false;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  // Verificar que la fecha sea válida
  if (isNaN(birth.getTime())) {
    return false;
  }
  
  return birth <= today;
};

/**
 * Obtiene la fecha máxima permitida para cumplir con la edad mínima
 */
export const getMaxBirthDate = (minimumAge: number = 18): string => {
  const today = new Date();
  const maxBirthYear = today.getFullYear() - minimumAge;
  const maxBirthDate = new Date(maxBirthYear, today.getMonth(), today.getDate());
  
  // Formato YYYY-MM-DD para input type="date"
  return maxBirthDate.toISOString().split('T')[0];
};

/**
 * Validación completa de fecha de nacimiento
 */
export const validateBirthDate = (birthDate: string, minimumAge: number = 18): {
  isValid: boolean;
  errorMessage: string;
  age: number;
} => {
  if (!birthDate) {
    return {
      isValid: false,
      errorMessage: 'La fecha de nacimiento es obligatoria',
      age: 0
    };
  }
  
  if (!validateBirthDateNotFuture(birthDate)) {
    return {
      isValid: false,
      errorMessage: 'La fecha de nacimiento no puede ser futura',
      age: 0
    };
  }
  
  const age = calculateAge(birthDate);
  const isValidAge = age >= minimumAge;
  
  return {
    isValid: isValidAge,
    errorMessage: isValidAge ? '' : `La edad mínima requerida es ${minimumAge} años. Edad actual: ${age} años`,
    age
  };
};