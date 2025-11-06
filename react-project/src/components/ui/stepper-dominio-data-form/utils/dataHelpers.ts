import { DominioDataFormData, SubDominioDataDto } from '../types';
import { SubDominioData } from '../../../../models/DominiosData';
// Definir localmente el tipo de guardado para evitar dependencias incorrectas
type SaveType = 'draft' | 'approval';

// Configuración inicial del formulario
export const initializeFormData = (): DominioDataFormData => ({
  // Step 1: Información Básica
  nombreDominio: '',
  codigoDominio: '',
  descripcionDominio: '',
  tipoDominioId: undefined,
  
  // Step 2: Sub-Dominios
  subDominios: [],
  
  // Step 3: Gobernanza
  gobernanzaId: undefined,
  tieneGobernanzaPropia: true,
  
  // Meta información
  organizacionId: 0
});

// Función para mapear SaveType a estado numérico válido según EstadoDominioData
// draft -> BORRADOR (-4), approval -> INICIAR_FLUJO (-3), default -> ACTIVO (1)
const getEstado = (saveType: SaveType): number => {
  switch (saveType) {
    case 'draft':
      return -4; // Borrador
    case 'approval':
      return -3; // Iniciar flujo (enviado a aprobación)
    default:
      return 1; // Activo por defecto
  }
};

// Transformar datos del formulario para envío al servidor
export const transformFormDataForSubmission = (formData: DominioDataFormData, saveType: SaveType) => {
  const estado = getEstado(saveType);

  // Detectar si estamos en actualización basándonos en presencia de ID en los datos transformados
  const rawId = (formData as any)?.id ?? (formData as any)?.dominioDataId ?? (formData as any)?.dominioId;
  const isUpdate = typeof rawId === 'number' && rawId > 0;

  if (isUpdate) {
    // Payload de actualización alineado con UpdateDominioDataRequest del servicio
    const updatePayload = {
      dominioId: rawId,
      organizacionId: formData.organizacionId!,
      codigoDominio: formData.codigoDominio?.trim() || null,
      nombreDominio: formData.nombreDominio?.trim() || "",
      descripcionDominio: formData.descripcionDominio?.trim() || null,
      tipoDominioId: (typeof formData.tipoDominioId === 'number' && formData.tipoDominioId > 0) ? formData.tipoDominioId : 1,
      gobernanzaId: formData.gobernanzaId && formData.gobernanzaId > 0 ? formData.gobernanzaId : null,
      estado,
      actualizadoPor: null
    };
    return updatePayload;
  }

  // Payload de creación alineado con CreateDominioDataRequest del servicio
  const createPayload = {
    organizacionId: formData.organizacionId!,
    codigoDominio: formData.codigoDominio?.trim() || null,
    nombreDominio: formData.nombreDominio?.trim() || "",
    // En creación el backend espera `descripcion` en lugar de `descripcionDominio`
    descripcion: formData.descripcionDominio?.trim() || null,
    tipoDominioId: (typeof formData.tipoDominioId === 'number' && formData.tipoDominioId > 0) ? formData.tipoDominioId : 1,
    gobernanzaId: formData.gobernanzaId && formData.gobernanzaId > 0 ? formData.gobernanzaId : null,
    estado,
    creadoPor: null
  };
  return createPayload;
};

// Helper: valida si un subdominio es válido
const isValidSubDominioCandidate = (subdominio: any): boolean => {
  return subdominio && 
         typeof subdominio === 'object' && 
         (subdominio.nombre || subdominio.codigo || subdominio.descripcion);
};

// Helper: mapea subdominios del backend al tipo del formulario
const mapBackendSubDominioToFormSubDominio = (s: any): SubDominioData => ({
  id: s?.id ?? 0,
  nombre: s?.nombre ?? '',
  codigo: s?.codigo ?? '',
  descripcion: s?.descripcion ?? '',
  dominioId: s?.dominioId ?? undefined,
});

// Convierte los datos del backend al formato del formulario
export const transformBackendDataToFormData = (backend: any): DominioDataFormData => {
  console.log('🔧 [TRANSFORM dataHelpers] Transformando backend data:', backend);
  console.log('🔍 [TRANSFORM dataHelpers] gobernanzaId del backend:', backend?.gobernanzaId, typeof backend?.gobernanzaId);
  
  const result = {
    id: backend?.id ?? backend?.dominioId,
    nombre: backend?.nombre ?? '',
    codigo: backend?.codigo ?? '',
    descripcion: backend?.descripcion ?? '',
    tipoDominioId: backend?.tipoDominioId ?? undefined,
    // Filtrar subdominios válidos y mapearlos
    subdominios: Array.isArray(backend?.subdominios)
      ? backend.subdominios
          .filter(isValidSubDominioCandidate)
          .map((s: any) => mapBackendSubDominioToFormSubDominio(s))
      : [],
    tieneGobernanzaPropia: true, // Siempre true como solicitado
    // Mapear gobernanzaId si viene del backend para modo edición
    gobernanzaId: backend?.gobernanzaId ?? undefined, // Usar ?? para preservar valores como 0
  };
  
  console.log('✅ [TRANSFORM dataHelpers] Resultado de transformación:', result);
  console.log('🔍 [TRANSFORM dataHelpers] gobernanzaId en resultado:', result.gobernanzaId, typeof result.gobernanzaId);
  return result;
};

// Helper: genera un código automático basado en el nombre
export const generateCodeFromName = (name: string): string => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
    .substring(0, 20); // Limitar longitud
};

// Helper: valida si un código es único en una lista de subdominios
export const isCodeUnique = (code: string, subdominios: SubDominioData[], excludeId?: number): boolean => {
  return !subdominios.some(sub => 
    sub.codigo.toUpperCase() === code.toUpperCase() && 
    sub.id !== excludeId
  );
};

// Helper: valida si un nombre es único en una lista de subdominios
export const isNameUnique = (name: string, subdominios: SubDominioData[], excludeId?: number): boolean => {
  return !subdominios.some(sub => 
    sub.nombre.toLowerCase() === name.toLowerCase() && 
    sub.id !== excludeId
  );
};

// Helper: obtiene el siguiente ID disponible para un nuevo subdominio
export const getNextSubDominioId = (subdominios: SubDominioData[]): number => {
  if (!subdominios.length) return 1;
  const maxId = Math.max(...subdominios.map(s => s.id || 0));
  return maxId + 1;
};

// Helper: crea un nuevo subdominio con valores por defecto
export const createNewSubDominio = (subdominios: SubDominioData[]): SubDominioData => ({
  id: getNextSubDominioId(subdominios),
  nombre: '',
  codigo: '',
  descripcion: '',
  dominioId: undefined,
});

// Helper: actualiza un subdominio en la lista
export const updateSubDominioInList = (
  subdominios: SubDominioData[], 
  updatedSubDominio: SubDominioData
): SubDominioData[] => {
  return subdominios.map(sub => 
    sub.id === updatedSubDominio.id ? updatedSubDominio : sub
  );
};

// Helper: elimina un subdominio de la lista
export const removeSubDominioFromList = (
  subdominios: SubDominioData[], 
  subDominioId: number
): SubDominioData[] => {
  return subdominios.filter(sub => sub.id !== subDominioId);
};