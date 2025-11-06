/**
 * Utilidades para validación de documentos de identidad según su tipo
 */

export interface DocumentValidationRules {
  pattern: string;      // RegExp pattern para validación
  maxLength: number;    // Máximo número de caracteres
  inputMode: 'numeric' | 'text';  // Tipo de teclado en móviles
  placeholder: string;  // Texto de ejemplo
  errorMessage: string; // Mensaje de error personalizado
  description: string;  // Descripción del formato
}

/**
 * Obtiene las reglas de validación para un tipo de documento específico
 */
export const getDocumentValidationRules = (tipoDoc: string): DocumentValidationRules => {
  switch (tipoDoc.toUpperCase()) {
    case 'DNI':
      return {
        pattern: '^[0-9]{8}$',
        maxLength: 8,
        inputMode: 'numeric',
        placeholder: '12345678',
        errorMessage: 'El DNI debe tener exactamente 8 dígitos',
        description: '8 dígitos numéricos'
      };

    case 'RUC':
      return {
        pattern: '^[0-9]{11}$',
        maxLength: 11,
        inputMode: 'numeric',
        placeholder: '20123456789',
        errorMessage: 'El RUC debe tener exactamente 11 dígitos',
        description: '11 dígitos numéricos'
      };

    case 'CE':
      return {
        pattern: '^[A-Z0-9]{12}$',
        maxLength: 12,
        inputMode: 'text',
        placeholder: 'ABC123456789',
        errorMessage: 'El Carné de Extranjería debe tener exactamente 12 caracteres alfanuméricos',
        description: '12 caracteres alfanuméricos'
      };

    case 'PASSPORT':
      return {
        pattern: '^[A-Z0-9]{6,9}$',
        maxLength: 9,
        inputMode: 'text',
        placeholder: 'ABC123456',
        errorMessage: 'El Pasaporte debe tener 6-9 caracteres alfanuméricos en mayúsculas',
        description: '6-9 caracteres alfanuméricos'
      };

    default:
      // Validación genérica para tipos no reconocidos
      return {
        pattern: '^[A-Z0-9]{1,20}$',
        maxLength: 20,
        inputMode: 'text',
        placeholder: 'Número de documento',
        errorMessage: 'Formato de documento no válido',
        description: 'Hasta 20 caracteres alfanuméricos'
      };
  }
};

/**
 * Valida si un número de documento es válido según su tipo
 */
export const validateDocumentNumber = (nroDoc: string, tipoDoc: string): boolean => {
  if (!nroDoc || !tipoDoc) {
    return false;
  }

  const rules = getDocumentValidationRules(tipoDoc);
  const regex = new RegExp(rules.pattern);
  
  return regex.test(nroDoc.trim());
};

/**
 * Formatea un número de documento según su tipo (ej: agregar guiones, espacios)
 */
export const formatDocumentNumber = (nroDoc: string, tipoDoc: string): string => {
  if (!nroDoc) return '';
  
  const cleanNumber = nroDoc.replace(/\D/g, ''); // Remover no-dígitos para tipos numéricos
  
  switch (tipoDoc.toUpperCase()) {
    case 'DNI':
      // DNI: formato 12345678
      return cleanNumber.slice(0, 8);
      
    case 'RUC':
      // RUC: formato 12345678901
      return cleanNumber.slice(0, 11);
      
    case 'CE':
      // CE: formato alfanumérico de 12 caracteres
      return nroDoc.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
      
    case 'PASSPORT':
      // Pasaporte: mantener alfanumérico en mayúsculas
      return nroDoc.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
      
    default:
      return nroDoc.slice(0, 20);
  }
};

/**
 * Obtiene un mensaje de ayuda con el formato esperado para el tipo de documento
 */
export const getDocumentFormatHelp = (tipoDoc: string): string => {
  const rules = getDocumentValidationRules(tipoDoc);
  return `Formato requerido: ${rules.description}`;
};

/**
 * Intenta adaptar un número de documento existente a un nuevo tipo de documento
 * Retorna el documento adaptado o null si no es posible
 */
export const adaptDocumentToNewType = (currentDoc: string, newType: string): string | null => {
  if (!currentDoc || !newType) return null;
  
  // Primero intentar formatear para el nuevo tipo
  const formatted = formatDocumentNumber(currentDoc, newType);
  
  // Verificar si el resultado formateado es válido
  if (validateDocumentNumber(formatted, newType)) {
    return formatted;
  }
  
  // Si no es válido, retornar null para indicar que no se puede adaptar
  return null;
};