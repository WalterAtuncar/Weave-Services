import { 
  CreateServidorDto, 
  UpdateServidorDto,
  TipoServidor,
  AmbienteServidor,
  EstadoServidor,
  ProveedorCloud
} from '../models/Servidores';

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// =============================================
// VALIDACIONES DE CAMPOS INDIVIDUALES
// =============================================

export const validateNombreServidor = (nombre: string, servidorId?: number): FieldValidationResult => {
  // Validar que no esté vacío
  if (!nombre || nombre.trim().length === 0) {
    return {
      isValid: false,
      error: 'El nombre del servidor es requerido'
    };
  }

  // Validar longitud mínima
  if (nombre.trim().length < 3) {
    return {
      isValid: false,
      error: 'El nombre debe tener al menos 3 caracteres'
    };
  }

  // Validar longitud máxima
  if (nombre.trim().length > 200) {
    return {
      isValid: false,
      error: 'El nombre no puede exceder 200 caracteres'
    };
  }

  return { isValid: true };
};

export const validateCodigoServidor = (codigo: string, servidorId?: number): FieldValidationResult => {
  // Validar que no esté vacío
  if (!codigo || codigo.trim().length === 0) {
    return {
      isValid: false,
      error: 'El código del servidor es requerido'
    };
  }

  // Validar longitud mínima
  if (codigo.trim().length < 3) {
    return {
      isValid: false,
      error: 'El código debe tener al menos 3 caracteres'
    };
  }

  // Validar longitud máxima
  if (codigo.trim().length > 50) {
    return {
      isValid: false,
      error: 'El código no puede exceder 50 caracteres'
    };
  }

  return { isValid: true };
};

export const validateDireccionIP = (ip: string): FieldValidationResult => {
  if (!ip || ip.trim().length === 0) {
    return {
      isValid: false,
      error: 'La dirección IP es requerida'
    };
  }

  if (ip.trim().length > 45) {
    return {
      isValid: false,
      error: 'La dirección IP no puede exceder 45 caracteres'
    };
  }

  return { isValid: true };
};

export const validateSistemaOperativo = (so: string): FieldValidationResult => {
  if (!so || so.trim().length === 0) {
    return {
      isValid: false,
      error: 'El sistema operativo es requerido'
    };
  }

  if (so.trim().length < 3) {
    return {
      isValid: false,
      error: 'El sistema operativo debe tener al menos 3 caracteres'
    };
  }

  if (so.trim().length > 100) {
    return {
      isValid: false,
      error: 'El sistema operativo no puede exceder 100 caracteres'
    };
  }

  return { isValid: true };
};

export const validateTipoServidor = (tipo: TipoServidor): FieldValidationResult => {
  const tiposValidos = Object.values(TipoServidor);
  if (!tiposValidos.includes(tipo)) {
    return {
      isValid: false,
      error: 'Tipo de servidor inválido'
    };
  }
  return { isValid: true };
};

export const validateAmbienteServidor = (ambiente: AmbienteServidor): FieldValidationResult => {
  const ambientesValidos = Object.values(AmbienteServidor);
  if (!ambientesValidos.includes(ambiente)) {
    return {
      isValid: false,
      error: 'Ambiente de servidor inválido'
    };
  }
  return { isValid: true };
};

export const validateEstadoServidor = (estado: EstadoServidor): FieldValidationResult => {
  const estadosValidos = Object.values(EstadoServidor);
  if (!estadosValidos.includes(estado)) {
    return {
      isValid: false,
      error: 'Estado de servidor inválido'
    };
  }
  return { isValid: true };
};

// =============================================
// VALIDACIONES COMPLETAS
// =============================================

export const validateCreateServidor = (data: CreateServidorDto): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones básicas
  const nombreValidation = validateNombreServidor(data.nombreServidor);
  if (!nombreValidation.isValid) {
    errors.push(nombreValidation.error!);
  }

  const codigoValidation = validateCodigoServidor(data.codigoServidor);
  if (!codigoValidation.isValid) {
    errors.push(codigoValidation.error!);
  }

  const ipValidation = validateDireccionIP(data.direccionIP);
  if (!ipValidation.isValid) {
    errors.push(ipValidation.error!);
  }

  const soValidation = validateSistemaOperativo(data.sistemaOperativo);
  if (!soValidation.isValid) {
    errors.push(soValidation.error!);
  }

  const tipoValidation = validateTipoServidor(data.tipoServidor);
  if (!tipoValidation.isValid) {
    errors.push(tipoValidation.error!);
  }

  const ambienteValidation = validateAmbienteServidor(data.ambiente);
  if (!ambienteValidation.isValid) {
    errors.push(ambienteValidation.error!);
  }

  if (data.estado !== undefined) {
    const estadoValidation = validateEstadoServidor(data.estado);
    if (!estadoValidation.isValid) {
      errors.push(estadoValidation.error!);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateUpdateServidor = (data: UpdateServidorDto): ValidationResult => {
  const errors: string[] = [];

  // Validar campos requeridos para update
  if (!data.servidorId) {
    errors.push('El ID del servidor es requerido');
  }

  // Usar la misma validación que create
  const baseValidation = validateCreateServidor(data);
  errors.push(...baseValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings: baseValidation.warnings
  };
};

// =============================================
// UTILIDADES AUXILIARES
// =============================================

export const getSugerenciasConfiguracion = (tipoServidor: TipoServidor, ambiente: AmbienteServidor) => {
  const sugerencias: string[] = [];

  // Sugerencias por tipo
  switch (tipoServidor) {
    case TipoServidor.FISICO:
      sugerencias.push('Considera especificar el modelo exacto del hardware');
      sugerencias.push('Incluye la ubicación física del rack');
      break;
    case TipoServidor.VIRTUAL:
      sugerencias.push('Especifica el host físico donde se ejecuta');
      sugerencias.push('Incluye la información del hipervisor');
      break;
    case TipoServidor.CONTENEDOR:
      sugerencias.push('Especifica el cluster o nodo donde se ejecuta');
      sugerencias.push('Incluye la información del orquestador');
      break;
    case TipoServidor.CLOUD:
      sugerencias.push('Especifica la región y zona de disponibilidad');
      sugerencias.push('Incluye el tipo de instancia');
      break;
  }

  // Sugerencias por ambiente
  switch (ambiente) {
    case AmbienteServidor.PRODUCCION:
      sugerencias.push('Asegúrate de tener un plan de respaldo');
      sugerencias.push('Configura monitoreo y alertas');
      break;
    case AmbienteServidor.DESARROLLO:
      sugerencias.push('Puede tener menores recursos que producción');
      break;
    case AmbienteServidor.PRUEBAS:
      sugerencias.push('Debe replicar el ambiente de producción');
      break;
  }

  return sugerencias;
};

export const getRecomendacionesSeguridad = (tipoServidor: TipoServidor, ambiente: AmbienteServidor) => {
  const recomendaciones: string[] = [];

  if (ambiente === AmbienteServidor.PRODUCCION) {
    recomendaciones.push('Configura autenticación multifactor');
    recomendaciones.push('Implementa cifrado en tránsito y en reposo');
    recomendaciones.push('Configura logs de auditoría');
  }

  if (tipoServidor === TipoServidor.CLOUD) {
    recomendaciones.push('Configura grupos de seguridad restrictivos');
    recomendaciones.push('Usa roles IAM con permisos mínimos');
  }

  return recomendaciones;
}; 