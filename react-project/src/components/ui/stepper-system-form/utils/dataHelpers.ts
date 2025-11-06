import { SystemFormData, SystemModuleData } from '../types';
import { EstadoSistema } from '../../../../models/Sistemas';

// Inicializa los datos del formulario con el modelo minimalista
export const initializeFormData = (): SystemFormData => ({
  nombreSistema: '',
  codigoSistema: '',
  funcionPrincipal: '',
  tipoSistema: 0,
  familiaSistema: 0,
  sistemaDepende: undefined,
  estado: 1,
  servidorIds: [],
  modulos: [],
  tieneGobernanzaPropia: false,
  gobernanzaId: undefined,
});

// Convierte los datos del formulario al formato esperado por el backend (minimal)
export const transformFormDataForSubmission = (formData: SystemFormData) => ({
  nombreSistema: formData.nombreSistema.trim(),
  codigoSistema: formData.codigoSistema.trim().toUpperCase(),
  funcionPrincipal: formData.funcionPrincipal.trim(),
  tipoSistema: formData.tipoSistema,
  familiaSistema: formData.familiaSistema,
  sistemaDepende: formData.sistemaDepende ?? null,
  estado: formData.estado,
  servidorIds: formData.servidorIds,
  modulos: formData.modulos || [],
  tieneGobernanzaPropia: formData.tieneGobernanzaPropia,
  // 🔧 CORRECCIÓN: Siempre enviar gobernanzaId si está presente, sin condicionarlo por tieneGobernanzaPropia
  // En sistemas, tieneGobernanzaPropia indica si el sistema TIENE gobierno propio (no si usa uno externo)
  // Por tanto, cuando se selecciona un gobierno, se debe enviar su ID independientemente del flag
  gobernanzaId: formData.gobernanzaId ?? null,
});

// Helper: mapea módulos del backend (SistemaModulo) al tipo del Stepper (SystemModuleData)
const mapBackendModuloToFormModulo = (m: any, fallbackSistemaId?: number): SystemModuleData => ({
  id: m?.sistemaModuloId ?? m?.id ?? 0,
  nombre: m?.nombreModulo ?? m?.nombre ?? '',
  descripcion: m?.funcionModulo ?? m?.descripcion ?? '',
  version: String(m?.version ?? '1'),
  activo: typeof m?.activo === 'boolean' ? m.activo : (m?.estado === EstadoSistema.Activo),
  orden: m?.orden,
  sistemaId: m?.sistemaId ?? fallbackSistemaId,
});

// Detecta si un elemento de módulos contiene datos reales o es un placeholder vacío
const isValidModuloCandidate = (m: any): boolean => {
  if (!m || typeof m !== 'object') return false;
  const hasId = typeof m.sistemaModuloId === 'number' || typeof m.id === 'number';
  const nombre = (m.nombreModulo ?? m.nombre ?? '').toString().trim();
  return hasId || nombre.length > 0; // solo considerar módulos con id o con nombre
};

// Convierte los datos del backend al formato del formulario (minimal)
export const transformBackendDataToFormData = (backend: any): SystemFormData => ({
  id: backend?.id ?? backend?.sistemaId,
  nombreSistema: backend?.nombreSistema ?? '',
  codigoSistema: backend?.codigoSistema ?? '',
  funcionPrincipal: backend?.funcionPrincipal ?? '',
  tipoSistema: backend?.tipoSistema ?? 0,
  familiaSistema: backend?.familiaSistema ?? 0,
  sistemaDepende: backend?.sistemaDepende ?? undefined,
  estado: backend?.estado ?? 1,
  servidorIds: Array.isArray(backend?.servidorIds) ? backend.servidorIds : [],
  // Importante: si vienen placeholders (p.ej. objetos vacíos), filtrarlos para que el Step cargue desde backend
  modulos: Array.isArray(backend?.modulos)
    ? backend.modulos
        .filter(isValidModuloCandidate)
        .map((m: any) => mapBackendModuloToFormModulo(m, backend?.sistemaId ?? backend?.id))
    : [],
  tieneGobernanzaPropia: !!backend?.tieneGobernanzaPropia,
  // Antes: gobernanzaId se anulaba cuando tieneGobernanzaPropia era true.
  // Corrección: siempre mapear gobernanzaId si viene del backend para que Step 4 pueda precargarlo en modo edición.
  gobernanzaId: backend?.gobernanzaId ?? undefined,
});