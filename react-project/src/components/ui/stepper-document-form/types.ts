import { LucideIcon } from 'lucide-react';
import type { DocumentoVectorial as DocumentoVectorizado } from '../../../services/vectorization/types';

export type FormMode = 'create' | 'edit';

export interface TipoDocumento { id: string; nombre: string }
export interface Proceso { id: string; nombre: string }

// Nueva interfaz: referencia de Carpeta para el paso de Carpetas
export interface CarpetaRef {
  carpetaId: string | number;
  nombreCarpeta: string;
  carpetaPadreId?: string | number | null;
}

export interface DocumentFormData {
  id?: number;
  archivo?: File | null;
  archivoVisualizacion?: File | null;
  titulo: string;
  objetivo?: string;
  tipo?: string; // id de TipoDocumento
  procesoId?: string; // id del proceso seleccionado
  procesosIds?: string[]; // ids de procesos adicionales asociados (1..n)
  estado?: number;
  // Documento vectorizado desde Step1 (estructura de vectorization/types)
  vectorizedDocument?: DocumentoVectorizado | null;
  // Miniatura (PNG) generada en Step 1/3
  miniaturaBase64?: string | null;
  miniaturaMimeType?: string | null;
  miniaturaAncho?: number | null;
  miniaturaAlto?: number | null;
  entidadesRelacionadas?: Record<string, string[]>; // mapa: tipoEntidadId -> [EntidadId]
  // NUEVO: selección de carpeta
  carpetaId?: string | number | null;
  carpetaRuta?: string | null;
  // Gobernanza seleccionada en el paso de gobierno
  gobernanzaId?: number | string | null;
  tieneGobernanzaPropia?: boolean;
}

export interface DocumentFormErrors {
  archivo?: string;
  titulo?: string;
  objetivo?: string;
  tipo?: string;
  procesoId?: string;
  procesosIds?: string;
  general?: string;
  entidadesRelacionadas?: string;
  // NUEVO: errores de carpeta
  carpetaId?: string;
}

export interface StepperDocumentFormProps {
  isOpen: boolean;
  /** Render inline dentro de la página Documentos */
  inline?: boolean;
  mode?: FormMode;
  initialData?: DocumentFormData;
  onClose?: () => void;
  onSubmit: (data: any, saveType: 'draft' | 'approval') => Promise<void> | void;
  onLoadData?: () => Promise<{ tiposDocumento: TipoDocumento[]; procesos: Proceso[]; carpetas?: CarpetaRef[] }>; // NUEVO: carpetas opcionales
  isSubmitting?: boolean;
  /** Callback para reflejar cambios de datos en panel de detalles */
  onFormDataChange?: (data: DocumentFormData) => void;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<DocumentFormErrors>;
}