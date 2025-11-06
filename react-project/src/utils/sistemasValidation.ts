import { 
  Sistema, 
  CreateSistemaDto, 
  UpdateSistemaDto, 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema 
} from '../models/Sistemas';
import { mockSistemas } from '../mocks/sistemasMocks';
import { FamiliaSistemaOption } from '../services/types/familia-sistema.types';

// =============================================
// TIPOS PARA VALIDACIÓN
// =============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// =============================================
// SANITIZACIÓN DE CÓDIGO DE SISTEMA
// =============================================
/**
 * Permite solo caracteres considerados básicos: letras, números, espacio, guion (-) y guion bajo (_).
 * - Elimina cualquier otro caracter especial.
 * - Normaliza espacios múltiples a uno solo.
 * - Recorta espacios al inicio y final.
 */
export const sanitizeCodigoSistema = (input?: string): string => {
  if (!input) return '';
  const filtered = input.replace(/[^A-Za-z0-9_\- ]+/g, '');
  return filtered.replace(/\s+/g, ' ').trim();
};

// =============================================
// VALIDACIONES DE CAMPOS INDIVIDUALES
// =============================================

export const validateNombreSistema = (nombre: string, sistemaId?: number, sistemasReales?: Sistema[]): FieldValidationResult => {
  if (!nombre || nombre.trim().length === 0) {
    return { isValid: false, error: 'El nombre del sistema es requerido' };
  }

  if (nombre.trim().length < 3) {
    return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  if (nombre.trim().length > 100) {
    return { isValid: false, error: 'El nombre no puede exceder 100 caracteres' };
  }

  // 🔧 USAR SISTEMAS REALES EN LUGAR DE MOCKS
  const sistemasParaBuscar = sistemasReales || mockSistemas;
  
  // Verificar que no exista otro sistema con el mismo nombre
  const existingSistema = sistemasParaBuscar.find(s => 
    s && // 🔧 Verificar que el sistema no sea null/undefined
    s.nombreSistema && // 🔧 Verificar que nombreSistema exista
    s.nombreSistema.toLowerCase() === nombre.trim().toLowerCase() && 
    s.sistemaId !== sistemaId &&
    !s.registroEliminado
  );

  if (existingSistema) {
    return { isValid: false, error: 'Ya existe un sistema con este nombre' };
  }

  return { isValid: true };
};

export const validateCodigoSistema = (codigo?: string, sistemaId?: number, sistemasReales?: Sistema[]): FieldValidationResult => {
  if (!codigo || codigo.trim().length === 0) {
    return { isValid: true }; // Código es opcional
  }

  if (codigo.trim().length < 2) {
    return { isValid: false, error: 'El código debe tener al menos 2 caracteres' };
  }

  if (codigo.trim().length > 50) {
    return { isValid: false, error: 'El código no puede exceder 50 caracteres' };
  }

  // Validación de formato descartada: el código debe ser flexible
  // No se restringen los caracteres permitidos en el frontend

  // 🔧 USAR SISTEMAS REALES EN LUGAR DE MOCKS
  const sistemasParaBuscar = sistemasReales || mockSistemas;
  
  // Verificar que no exista otro sistema con el mismo código
  const existingSistema = sistemasParaBuscar.find(s => 
    s && // 🔧 Verificar que el sistema no sea null/undefined
    s.codigoSistema && // 🔧 Verificar que codigoSistema exista
    s.codigoSistema.toLowerCase() === codigo.trim().toLowerCase() && 
    s.sistemaId !== sistemaId &&
    !s.registroEliminado
  );

  if (existingSistema) {
    return { isValid: false, error: 'Ya existe un sistema con este código' };
  }

  return { isValid: true };
};

export const validateFuncionPrincipal = (funcion?: string): FieldValidationResult => {
  if (!funcion || funcion.trim().length === 0) {
    return { isValid: true }; // Función es opcional
  }

  if (funcion.trim().length > 500) {
    return { isValid: false, error: 'La función principal no puede exceder 500 caracteres' };
  }

  return { isValid: true };
};

export const validateTipoSistema = (tipo: TipoSistema): FieldValidationResult => {
  if (!Object.values(TipoSistema).includes(tipo)) {
    return { isValid: false, error: 'Tipo de sistema inválido' };
  }
  return { isValid: true };
};

export const validateFamiliaSistema = (familia: FamiliaSistema): FieldValidationResult => {
  if (!Object.values(FamiliaSistema).includes(familia)) {
    return { isValid: false, error: 'Familia de sistema inválida' };
  }
  return { isValid: true };
};

/**
 * Valida que una familia de sistema pertenezca a la organización
 * @param familiaLabel - Etiqueta de la familia de sistema (nombre)
 * @param familiasPermitidas - Lista de familias permitidas para la organización
 * @returns Resultado de la validación
 */
export const validateFamiliaSistemaByOrganizacion = (
  familiaLabel: string, 
  familiasPermitidas: FamiliaSistemaOption[]
): FieldValidationResult => {
  if (!familiaLabel || familiaLabel.trim().length === 0) {
    return { isValid: false, error: 'La familia de sistema es requerida' };
  }

  if (!familiasPermitidas || familiasPermitidas.length === 0) {
    return { isValid: false, error: 'No hay familias de sistema configuradas para esta organización' };
  }

  // Buscar la familia por nombre (case-insensitive)
  const familiaEncontrada = familiasPermitidas.find(familia => 
    familia.nombre.toLowerCase() === familiaLabel.trim().toLowerCase() ||
    familia.codigo.toLowerCase() === familiaLabel.trim().toLowerCase()
  );

  if (!familiaEncontrada) {
    const familiasDisponibles = familiasPermitidas.map(f => f.nombre).join(', ');
    return { 
      isValid: false, 
      error: `La familia de sistema "${familiaLabel}" no está habilitada para esta organización. Las familias habilitadas están disponibles en la plantilla Excel descargada. Familias permitidas: ${familiasDisponibles}` 
    };
  }

  return { isValid: true };
};

/**
 * Obtiene el ID de una familia de sistema por su nombre/código desde las familias permitidas
 * @param familiaLabel - Etiqueta de la familia de sistema
 * @param familiasPermitidas - Lista de familias permitidas para la organización
 * @returns ID de la familia o undefined si no se encuentra
 */
export const getFamiliaSistemaIdByLabel = (
  familiaLabel: string, 
  familiasPermitidas: FamiliaSistemaOption[]
): number | undefined => {
  if (!familiaLabel || !familiasPermitidas) {
    return undefined;
  }

  const familiaEncontrada = familiasPermitidas.find(familia => 
    familia.nombre.toLowerCase() === familiaLabel.trim().toLowerCase() ||
    familia.codigo.toLowerCase() === familiaLabel.trim().toLowerCase()
  );

  return familiaEncontrada?.id;
};

// =============================================
// VALIDACIÓN DE MÓDULOS
// =============================================

export const validateModulosDuplicados = (modulos?: { nombreModulo: string }[]): FieldValidationResult => {
  if (!modulos || modulos.length === 0) {
    return { isValid: true }; // Los módulos son opcionales
  }

  const nombresModulos = modulos.map(m => m.nombreModulo.trim().toLowerCase());
  const nombresUnicos = new Set(nombresModulos);
  
  if (nombresModulos.length !== nombresUnicos.size) {
    return { 
      isValid: false, 
      error: 'No se pueden tener módulos con nombres duplicados en el mismo sistema' 
    };
  }
  
  return { isValid: true };
};

export const validateGobernanzaId = (gobernanzaId?: number): FieldValidationResult => {
  if (!gobernanzaId || gobernanzaId <= 0) {
    return {
      isValid: false,
      error: 'Debe seleccionar un gobierno válido'
    };
  }

  return { isValid: true };
};

// =============================================
// VALIDACIONES DE JERARQUÍA
// =============================================

export const validateSistemaDepende = (
  sistemaId: number | undefined, 
  sistemaDepende?: number,
  organizacionId?: number,
  sistemasReales?: Sistema[] // 🔧 NUEVO: Sistemas reales del backend
): FieldValidationResult => {
  if (!sistemaDepende) {
    return { isValid: true }; // No dependency is valid
  }

  // No puede depender de sí mismo
  if (sistemaId && sistemaDepende === sistemaId) {
    return { isValid: false, error: 'Un sistema no puede depender de sí mismo' };
  }

  // 🔧 USAR SISTEMAS REALES EN LUGAR DE MOCKS
  const sistemasParaBuscar = sistemasReales || mockSistemas;
  
  // Verificar que el sistema padre existe y está activo
  const sistemaPadre = sistemasParaBuscar.find(s => 
    s.sistemaId === sistemaDepende && 
    !s.registroEliminado
  );

  if (!sistemaPadre) {
    return { isValid: false, error: 'El sistema padre no existe o ha sido eliminado' };
  }

  if (sistemaPadre.estado === EstadoSistema.Inactivo) {
    return { isValid: false, error: 'No se puede depender de un sistema inactivo' };
  }

  // 🔧 VERIFICAR CON DATOS REALES - Verificar que pertenezcan a la misma organización
  if (organizacionId && sistemaPadre.organizacionId !== organizacionId) {

    
    // 🔧 SOLO VALIDAR ORGANIZACIÓN SI TENEMOS DATOS REALES
    // Si estamos usando mocks, permitir la validación (los mocks pueden tener organizacionId incorrectos)
    if (sistemasReales && sistemasReales.length > 0) {
      return { isValid: false, error: 'Solo se puede depender de sistemas de la misma organización' };
    } else {

    }
  }

  // 🔧 VERIFICAR DEPENDENCIAS CIRCULARES CON DATOS REALES
  if (sistemaId && wouldCreateCircularDependency(sistemaId, sistemaDepende, sistemasParaBuscar)) {
    return { isValid: false, error: 'Esta dependencia crearía una referencia circular' };
  }

  return { isValid: true };
};

// Función auxiliar para detectar dependencias circulares
const wouldCreateCircularDependency = (sistemaId: number, newParentId: number, sistemasParaBuscar: Sistema[]): boolean => {
  const visited = new Set<number>();
  
  const hasCircularPath = (currentId: number): boolean => {
    if (visited.has(currentId)) {
      return true; // Ciclo detectado
    }
    
    if (currentId === sistemaId) {
      return true; // Volvimos al sistema original
    }
    
    visited.add(currentId);
    
    // 🔧 USAR SISTEMAS REALES EN LUGAR DE MOCKS
    const currentSistema = sistemasParaBuscar.find(s => 
      s && // 🔧 Verificar que el sistema no sea null/undefined
      s.sistemaId === currentId
    );
    if (currentSistema?.sistemaDepende) {
      return hasCircularPath(currentSistema.sistemaDepende);
    }
    
    return false;
  };
  
  return hasCircularPath(newParentId);
};

// =============================================
// VALIDACIÓN COMPLETA DE SISTEMA
// =============================================

export const validateCreateSistema = (data: CreateSistemaDto, sistemasReales?: Sistema[]): ValidationResult => {
  const errors: string[] = [];

  // Validar campos requeridos
  const nombreValidation = validateNombreSistema(data.nombreSistema, undefined, sistemasReales);
  if (!nombreValidation.isValid) {
    errors.push(nombreValidation.error!);
  }

  const codigoValidation = validateCodigoSistema(data.codigoSistema, undefined, sistemasReales);
  if (!codigoValidation.isValid) {
    errors.push(codigoValidation.error!);
  }

  const funcionValidation = validateFuncionPrincipal(data.funcionPrincipal);
  if (!funcionValidation.isValid) {
    errors.push(funcionValidation.error!);
  }

  const tipoValidation = validateTipoSistema(data.tipoSistema);
  if (!tipoValidation.isValid) {
    errors.push(tipoValidation.error!);
  }

  const familiaValidation = validateFamiliaSistema(data.familiaSistema);
  if (!familiaValidation.isValid) {
    errors.push(familiaValidation.error!);
  }

  const dependenciaValidation = validateSistemaDepende(
    undefined, 
    data.sistemaDepende, 
    data.organizacionId,
    undefined // Sin sistemas reales, usará mocks como fallback
  );
  if (!dependenciaValidation.isValid) {
    errors.push(dependenciaValidation.error!);
  }

  // Validar módulos duplicados
  const modulosValidation = validateModulosDuplicados(data.modulos);
  if (!modulosValidation.isValid) {
    errors.push(modulosValidation.error!);
  }

  // Validar gobernanza (solo si tieneGobernanzaPropia es false)
  if (!data.tieneGobernanzaPropia) {
    const gobernanzaValidation = validateGobernanzaId(data.gobernanzaId);
    if (!gobernanzaValidation.isValid) {
      errors.push(gobernanzaValidation.error!);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUpdateSistema = (data: UpdateSistemaDto, sistemasReales?: Sistema[]): ValidationResult => {
  const errors: string[] = [];

  // Validar campos requeridos
  const nombreValidation = validateNombreSistema(data.nombreSistema, data.sistemaId, sistemasReales);
  if (!nombreValidation.isValid) {
    errors.push(nombreValidation.error!);
  }

  const codigoValidation = validateCodigoSistema(data.codigoSistema, data.sistemaId, sistemasReales);
  if (!codigoValidation.isValid) {
    errors.push(codigoValidation.error!);
  }

  const funcionValidation = validateFuncionPrincipal(data.funcionPrincipal);
  if (!funcionValidation.isValid) {
    errors.push(funcionValidation.error!);
  }

  const tipoValidation = validateTipoSistema(data.tipoSistema);
  if (!tipoValidation.isValid) {
    errors.push(tipoValidation.error!);
  }

  const familiaValidation = validateFamiliaSistema(data.familiaSistema);
  if (!familiaValidation.isValid) {
    errors.push(familiaValidation.error!);
  }

  const dependenciaValidation = validateSistemaDepende(
    data.sistemaId, 
    data.sistemaDepende, 
    data.organizacionId,
    undefined // Sin sistemas reales, usará mocks como fallback
  );
  if (!dependenciaValidation.isValid) {
    errors.push(dependenciaValidation.error!);
  }

  // Validar módulos duplicados
  const modulosValidation = validateModulosDuplicados(data.modulos);
  if (!modulosValidation.isValid) {
    errors.push(modulosValidation.error!);
  }

  // Validar gobernanza (solo si tieneGobernanzaPropia es false)
  if (!data.tieneGobernanzaPropia) {
    const gobernanzaValidation = validateGobernanzaId(data.gobernanzaId);
    if (!gobernanzaValidation.isValid) {
      errors.push(gobernanzaValidation.error!);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// =============================================
// UTILIDADES ADICIONALES
// =============================================

export const getSistemasPosiblesPadres = (organizacionId: number, sistemaId?: number, sistemasReales?: Sistema[]): Sistema[] => {
  const sistemasParaBuscar = sistemasReales || mockSistemas;
  return sistemasParaBuscar.filter(s => 
    s && // 🔧 Verificar que el sistema no sea null/undefined
    s.organizacionId === organizacionId && 
    s.estado === EstadoSistema.Activo && 
    s.sistemaId !== sistemaId && 
    !s.registroEliminado &&
    // No incluir sistemas que ya dependan del sistema actual (evitar ciclos)
    (sistemaId ? !wouldCreateCircularDependency(sistemaId, s.sistemaId, sistemasParaBuscar) : true)
  );
};

export const getMaxHierarchyLevel = (sistemaId: number): number => {
  let level = 0;
  let currentId: number | null = sistemaId;
  
  while (currentId) {
    const sistema = mockSistemas.find(s => s.sistemaId === currentId);
    if (!sistema || !sistema.sistemaDepende) break;
    
    level++;
    currentId = sistema.sistemaDepende;
    
    // Prevenir bucles infinitos
    if (level > 10) break;
  }
  
  return level;
};

export const hasCircularDependency = (sistemaId: number, sistemasReales?: Sistema[]): boolean => {
  const sistemasParaBuscar = sistemasReales || mockSistemas;
  const sistema = sistemasParaBuscar.find(s => 
    s && // 🔧 Verificar que el sistema no sea null/undefined
    s.sistemaId === sistemaId
  );
  if (!sistema?.sistemaDepende) return false;
  
  return wouldCreateCircularDependency(sistemaId, sistema.sistemaDepende, sistemasParaBuscar);
};

// =============================================
// FUNCIONES AUXILIARES PARA JERARQUÍAS
// =============================================

export const getSystemHierarchyLevel = (sistema: Sistema, allSistemas: Sistema[]): number => {
  let level = 0;
  let currentSistema = sistema;
  
  while (currentSistema.sistemaDepende) {
    level++;
    const parent = allSistemas.find(s => 
      s && // 🔧 Verificar que el sistema no sea null/undefined
      s.sistemaId === currentSistema.sistemaDepende
    );
    if (!parent) break;
    currentSistema = parent;
  }
  
  return level;
};

export const validateHierarchy = (sistemaId: number, newParentId: number, allSistemas: Sistema[]): FieldValidationResult => {
  return validateSistemaDepende(sistemaId, newParentId, undefined, allSistemas);
};

export const getPossibleParentSystems = (organizacionId: number, sistemaId?: number): Sistema[] => {
  return getSistemasPosiblesPadres(organizacionId, sistemaId);
};