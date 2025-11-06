import { DominioDataDto, SubDominioDataDto, DominioData as LegacyDominioData, SubDominioData as LegacySubDominioData } from '../../../models/DominiosData';
import { DominioDataFormData } from './types';

/**
 * Helper para transformar un objeto DominioDataDto de la base de datos
 * a la estructura esperada por el formulario DominioDataFormData
 */
export const transformDominioToFormData = (
  dominio: DominioDataDto,
  organizacionId: number
): DominioDataFormData => {
  console.log('🔧 [TRANSFORM] Transformando dominio DTO:', dominio);
  console.log('🔍 [TRANSFORM] gobernanzaId del backend:', dominio.gobernanzaId, typeof dominio.gobernanzaId);
  
  const result = {
    // @ts-ignore: permitimos id adicional aunque no esté en la interfaz
    id: dominio.dominioDataId, // ✅ Mapear el ID correctamente
    codigoDominio: dominio.codigoDominio || '',
    nombreDominio: dominio.nombreDominio || '',
    descripcionDominio: dominio.descripcionDominio || '',
    tipoDominioId: dominio.tipoDominioId || 0, // ✅ Usar tipoDominioId que es lo que espera Step1
    gobernanzaId: dominio.gobernanzaId ?? undefined, // Usar ?? en lugar de || para preservar 0
    tieneGobernanzaPropia: true, // Siempre true como solicitado
    subDominios: dominio.subDominios?.map(transformSubDominioToFormData) || [],
    organizacionId: organizacionId
  } as DominioDataFormData & { id?: number };
  
  console.log('✅ [TRANSFORM] Resultado de transformación DTO -> Form:', result);
  console.log('🔍 [TRANSFORM] gobernanzaId en resultado:', result.gobernanzaId, typeof result.gobernanzaId);
  return result;
};

/**
 * Helper para transformar un SubDominioDataDto de la base de datos
 * a la estructura esperada por el formulario
 */
export const transformSubDominioToFormData = (
  subDominio: SubDominioDataDto
): any => {
  return {
    subDominioId: subDominio.subDominioDataId,
    codigoSubDominio: subDominio.codigoSubDominio || '',
    nombreSubDominio: subDominio.nombreSubDominio || '',
    descripcionSubDominio: subDominio.descripcionSubDominio || '',
    tieneGobernanzaPropia: subDominio.tieneGobernanzaPropia || false,
    gobernanzaId: subDominio.gobernanzaId || undefined,
    estado: subDominio.estado
  };
};

/**
 * Helpers para formato legacy (modelo usado en la grilla)
 */
const isLegacyDominioData = (obj: any): obj is LegacyDominioData => {
  return obj && typeof obj === 'object' && 'dominioId' in obj && 'codigo' in obj && 'nombre' in obj;
};

const isFormDataShape = (obj: any): obj is DominioDataFormData => {
  return obj && typeof obj === 'object' && 'codigoDominio' in obj && 'nombreDominio' in obj;
};

const transformLegacySubDominioToFormData = (
  sub: LegacySubDominioData
) => {
  return {
    subDominioId: (sub as any).subDominioId,
    codigoSubDominio: (sub as any).codigo || '',
    nombreSubDominio: (sub as any).nombre || '',
    descripcionSubDominio: (sub as any).descripcion || '',
    tieneGobernanzaPropia: !!(sub as any).tieneGobernanzaPropia,
    gobernanzaId: (sub as any).gobernanzaId ?? undefined,
    // El modelo legacy podría usar enums string; por seguridad, usar 1 si no es número
    estado: typeof (sub as any).estado === 'number' ? (sub as any).estado : 1
  };
};

export const transformLegacyDominioToFormData = (
  dominio: LegacyDominioData,
  organizacionId: number
): DominioDataFormData => {
  console.log('🔧 [TRANSFORM] Transformando dominio LEGACY:', dominio);
  const rawTipoId = (dominio as any).tipoDominioId;
  const tipoDominioId = typeof rawTipoId === 'number'
    ? rawTipoId
    : (typeof rawTipoId === 'string' && rawTipoId.trim() !== '' && !isNaN(Number(rawTipoId))
        ? Number(rawTipoId)
        : 0); // fallback si solo existe "tipo" (enum string)

  const legacySubs: any[] = (dominio as any).subDominiosData || (dominio as any).subDominios || [];

  const result = {
    // @ts-ignore: permitimos id adicional aunque no esté en la interfaz
    id: (dominio as any).dominioId,
    codigoDominio: (dominio as any).codigo || '',
    nombreDominio: (dominio as any).nombre || '',
    descripcionDominio: (dominio as any).descripcion || '',
    tipoDominioId,
    gobernanzaId: (dominio as any).gobernanzaId ?? undefined,
    tieneGobernanzaPropia: true, // Siempre true como solicitado
    subDominios: Array.isArray(legacySubs)
      ? legacySubs.map((s) =>
          // Detectar si ya es DTO o legacy
          'codigoSubDominio' in (s || {}) ? s : transformLegacySubDominioToFormData(s as LegacySubDominioData)
        )
      : [],
    organizacionId: (dominio as any).organizacionId || organizacionId || 1
  } as DominioDataFormData & { id?: number };

  console.log('✅ [TRANSFORM] Resultado LEGACY -> Form:', result);
  return result;
};

/**
 * Helper para verificar si un objeto tiene la estructura de DominioDataDto
 */
export const isDominioDataDto = (obj: any): obj is DominioDataDto => {
  return obj && 
    typeof obj === 'object' &&
    'dominioDataId' in obj &&
    // Permitir variantes de nombre para mayor robustez
    ('codigoDominio' in obj || 'codigo' in obj) &&
    ('nombreDominio' in obj || 'nombre' in obj);
};

/**
 * Helper para transformar cualquier objeto dominio a la estructura del formulario
 * Detecta automáticamente si es DominioDataDto, el modelo legacy, o si ya está en formato de formulario
 */
export const ensureFormDataStructure = (
  data: DominioDataDto | DominioDataFormData | LegacyDominioData | any,
  organizacionId?: number
): DominioDataFormData => {
  console.log('🔧 [TRANSFORMATION] ensureFormDataStructure llamado con:', {
    data,
    organizacionId,
    isDto: isDominioDataDto(data),
    isLegacy: isLegacyDominioData(data),
    isForm: isFormDataShape(data)
  });

  // Si es DTO del backend
  if (isDominioDataDto(data) && 'codigoDominio' in data && 'nombreDominio' in data) {
    console.log('🔄 [TRANSFORMATION] Detectado DominioDataDto, transformando...');
    const transformed = transformDominioToFormData(data as DominioDataDto, organizacionId || (data as any).organizacionId || 1);
    console.log('✅ [TRANSFORMATION] Transformación completada (DTO):', transformed);
    return transformed;
  }

  // Si es modelo legacy (viene de la grilla)
  if (isLegacyDominioData(data)) {
    console.log('🔄 [TRANSFORMATION] Detectado LegacyDominioData, transformando...');
    const transformed = transformLegacyDominioToFormData(data as LegacyDominioData, organizacionId || (data as any).organizacionId || 1);
    console.log('✅ [TRANSFORMATION] Transformación completada (LEGACY):', transformed);
    return transformed;
  }

  // Si aparentemente ya es FormData, solo asegurar organizacionId
  if (isFormDataShape(data)) {
    console.log('📝 [TRANSFORMATION] Ya es FormData, asegurando organizacionId...');
    const result = {
      ...(data as DominioDataFormData),
      organizacionId: organizacionId || (data as any).organizacionId || 1
    };
    console.log('✅ [TRANSFORMATION] FormData con organizacionId asegurado:', result);
    return result;
  }

  // Fallback robusto: mapear campos comunes
  console.warn('⚠️ [TRANSFORMATION] Formato de datos no reconocido, aplicando mapeo de fallback');
  console.log('🔍 [TRANSFORMATION] Datos de entrada para fallback:', data);
  console.log('🔍 [TRANSFORMATION] gobernanzaId en datos de entrada:', (data as any).gobernanzaId, typeof (data as any).gobernanzaId);
  
  const result = {
    // @ts-ignore
    id: (data as any).dominioDataId || (data as any).dominioId,
    codigoDominio: (data as any).codigoDominio || (data as any).codigo || '',
    nombreDominio: (data as any).nombreDominio || (data as any).nombre || '',
    descripcionDominio: (data as any).descripcionDominio || (data as any).descripcion || '',
    tipoDominioId: (() => {
      const raw = (data as any).tipoDominioId;
      if (typeof raw === 'number') return raw;
      if (typeof raw === 'string' && raw.trim() !== '' && !isNaN(Number(raw))) return Number(raw);
      return 0;
    })(),
    gobernanzaId: (data as any).gobernanzaId ?? undefined,
    tieneGobernanzaPropia: true, // Siempre true como solicitado
    subDominios: Array.isArray((data as any).subDominios)
      ? (data as any).subDominios
      : Array.isArray((data as any).subDominiosData)
      ? (data as any).subDominiosData.map((s: any) => transformLegacySubDominioToFormData(s))
      : [],
    organizacionId: organizacionId || (data as any).organizacionId || 1
  } as DominioDataFormData & { id?: number };
  
  console.log('✅ [TRANSFORMATION] Resultado Fallback -> Form:', result);
  console.log('🔍 [TRANSFORMATION] gobernanzaId en resultado fallback:', result.gobernanzaId, typeof result.gobernanzaId);
  return result;
};