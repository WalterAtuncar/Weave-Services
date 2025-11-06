import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Search, Plus, FileText, Download, BarChart3, Settings, Grid, List, PlusCircle, Clock, Star, User, FolderOpen, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { PageHeader } from '../../ui/page-header';
import { Modal } from '../../ui/modal/Modal';
import { DocumentViewToggle, type DocumentViewMode } from '../../ui/document-view-toggle';
import StepperDocumentForm from '../../ui/stepper-document-form/StepperDocumentForm';
import InlineDetailsSidebar from '../../ui/stepper-document-form/InlineDetailsSidebar';
import { DocumentCard } from '../../ui/document-card/DocumentCard';
import styles from './Documentos.module.css';
import { DocumentList } from '../../ui/document-view/DocumentList';
import { DocumentTile } from '../../ui/document-view/DocumentTile';
import type { Documento as DocumentoDrive } from '../../ui/document-view/types';
import { DocumentDetailPanel } from '../../ui/document-view/DocumentDetailPanel';
import DocumentHierarchyTree from '../../ui/document-view/DocumentHierarchyTree';
// Eliminamos el visor especializado y usaremos un visor simple embebido
 import { MenuCard, MenuGrid } from '../../ui/menu-card';
import { CardActionButton } from '../../ui/menu-card';
import { SelectorItemsModal } from '../../ui/menu-card/selector-items/SelectorItemsModal';
import { CRUDConfirmationModal } from '../../ui/crud-confirmation-modal/CRUDConfirmationModal';
import { SimpleCRUDConfirmationModal } from '../../ui/crud-confirmation-modal/SimpleCRUDConfirmationModal';
import type { GridColumn } from '../../ui/grid/Grid';
import type { DocumentFormData } from '../../ui/stepper-document-form/types';
import { AlertService } from '../../ui/alerts';
import { documentoVectorialService, documentosService } from '../../../services';
import type { ObtenerAgregadoResponseData, DocumentoSql, DocumentoVectorial as DocumentoVectorialCamel } from '../../../services/types/documento-vectorial.types';
import type { DocumentoVectorial as DocumentoVectorizado } from '../../../services/vectorization/types';
import { ErrorHandler } from '../../../utils/errorHandler';
import { useAuth } from '../../../hooks/useAuth';
import { documentosCarpetasService } from '../../../services/documentos-carpetas.service';
import { AnimatePresence, motion } from 'framer-motion';

import { environment } from '../../../environments';
import { ApprovalTracker } from '../../ui/approval-tracker/ApprovalTracker';

// Tipo básico para documentos
export type Documento = {
  id: number;
  titulo: string;
  categoria: string;
  propietario: string;
  fecha: string; // ISO string
  tipo: 'manual' | 'politica' | 'procedimiento' | 'instructivo';
  estado: 'nuevo' | 'reciente' | 'favorito' | 'participo';
  icono?: string;
  gobernanzaId?: number | null;
};

// Mocks con datos más completos
const documentosBase: Documento[] = [
  { id: 1, titulo: 'Manual de calidad.pdf', categoria: 'Manuales', propietario: 'Of. Calidad', fecha: '2024-12-10', tipo: 'manual', estado: 'reciente', icono: '📄' },
  { id: 2, titulo: 'Manual de Procedimientos', categoria: 'Manuales', propietario: 'Equipo Producto', fecha: '2025-01-15', tipo: 'manual', estado: 'favorito', icono: '📋' },
  { id: 3, titulo: 'DOCUMENTO directriz...', categoria: 'Directrices', propietario: 'PMO', fecha: '2025-03-02', tipo: 'procedimiento', estado: 'nuevo', icono: '📊' },
  { id: 4, titulo: 'Política de Seguridad', categoria: 'Políticas', propietario: 'Seguridad', fecha: '2025-05-28', tipo: 'politica', estado: 'participo', icono: '🔒' },
  { id: 5, titulo: 'Instructivo de Backup', categoria: 'Instructivos', propietario: 'IT', fecha: '2024-11-20', tipo: 'instructivo', estado: 'reciente', icono: '💾' },
  { id: 6, titulo: 'Manual de Usuario v2.1', categoria: 'Manuales', propietario: 'UX Team', fecha: '2024-10-15', tipo: 'manual', estado: 'favorito', icono: '📖' },
];

type TabType = 'todos' | 'nuevo' | 'recientes' | 'favoritos' | 'participo';

export interface DocumentosProps {
  className?: string;
}

export const Documentos: React.FC<DocumentosProps> = ({ className = '' }) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [documentViewMode, setDocumentViewMode] = useState<DocumentViewMode>('list');
  const [search, setSearch] = useState('');
  const [isDocStepperOpen, setIsDocStepperOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoDrive | null>(null);
  // Selección para la vista jerárquica con visor embebido
  const [hierarchySelectedDoc, setHierarchySelectedDoc] = useState<DocumentoDrive | null>(null);
  const [hierarchyViewerSrc, setHierarchyViewerSrc] = useState<string | null>(null);
  const [hierarchyViewerMime, setHierarchyViewerMime] = useState<string | null>(null);
  const [hierarchyViewerLoading, setHierarchyViewerLoading] = useState<boolean>(false);
  const hierarchyBlobUrlRef = useRef<string | null>(null);
  // Vista inicial tipo menú
  const [showMenu, setShowMenu] = useState<boolean>(true);
  // Gestor de carpetas
  const [showFoldersManager, setShowFoldersManager] = useState<boolean>(false);
  // Dataset editable para selector y eliminaciones
  const [docsState, setDocsState] = useState<DocumentoDrive[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [carpetasState, setCarpetasState] = useState<Array<{ carpetaId: number; nombreCarpeta: string; carpetaPadreId?: number | null }>>([]);
  // Vectoriales del agregado para hidratar edición sin reconsultar
  const [vectorialesAgregados, setVectorialesAgregados] = useState<DocumentoVectorialCamel[]>([]);
  // Contexto de acción para guiar al usuario en el listado
  const [actionContext, setActionContext] = useState<'edit' | 'delete' | 'download' | null>(null);
  // Selector modal y modo de acción
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  const [selectorMode, setSelectorMode] = useState<'edit' | 'delete' | 'download' | null>(null);
  // Stepper: modo dinámico y datos iniciales
  const [stepperMode, setStepperMode] = useState<'create' | 'edit'>('create');
  const [stepperInitialData, setStepperInitialData] = useState<DocumentFormData | undefined>(undefined);
  const [currentFormData, setCurrentFormData] = useState<DocumentFormData | undefined>(undefined);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  // Layout dividido: referencias y estado para hacer el Stepper resizable cuando Detalles está abierto
  const splitRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [leftWidthPx, setLeftWidthPx] = useState<number | undefined>(undefined);

  // Estados para modales de confirmación CRUD
  const [showCRUDModal, setShowCRUDModal] = useState<boolean>(false);
  const [crudOperation, setCrudOperation] = useState<'CREAR' | 'EDITAR' | 'ELIMINAR'>('EDITAR');
  const [selectedDocForCRUD, setSelectedDocForCRUD] = useState<DocumentoDrive | null>(null);
  const [pendingCRUDData, setPendingCRUDData] = useState<any>(null);

  // Constantes de layout para una UX profesional
  const RESIZER_WIDTH = 8; // ancho del handle
  const DETAILS_WIDTH_DEFAULT = 320; // ancho del panel de detalles
  const LEFT_MIN = 480; // ancho mínimo del Stepper
  const RIGHT_MIN = 280; // ancho mínimo del panel de detalles

  // Al abrir Detalles, calcular un ancho inicial cómodo para el Stepper
  useEffect(() => {
    if (detailsOpen) {
      const rect = splitRef.current?.getBoundingClientRect();
      const total = rect?.width || 0;
      // Reservar espacio para detalles y el resizer
      const initialLeft = Math.max(LEFT_MIN, total - DETAILS_WIDTH_DEFAULT - RESIZER_WIDTH);
      setLeftWidthPx(initialLeft);
    } else {
      // Al cerrar, el Stepper vuelve a ocupar el 100%
      setLeftWidthPx(undefined);
      setIsResizing(false);
    }
  }, [detailsOpen]);

  // Gestos de redimensionamiento horizontal
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing || !splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const total = rect.width;
      const relativeX = e.clientX - rect.left; // posición del cursor relativa al contenedor
      // Limitar para respetar mínimos de ambos paneles
      const maxLeft = total - RIGHT_MIN - RESIZER_WIDTH;
      const clamped = Math.max(LEFT_MIN, Math.min(relativeX, maxLeft));
      setLeftWidthPx(clamped);
    };
    const onMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  // Filtrado por pestaña y búsqueda
  const documentos = useMemo(() => {
    let filtered = docsState;
     if (activeTab !== 'todos') {
       const estadoFilter = activeTab === 'recientes' ? 'reciente'
         : activeTab === 'favoritos' ? 'favorito'
         : activeTab; // 'nuevo' | 'participo'
       filtered = filtered.filter(d => d.estado === (estadoFilter as any));
     }
     const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(d =>
        d.titulo.toLowerCase().includes(q) || d.categoria.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [activeTab, search, docsState]);

  // Función para manejar eliminación de documentos
  const onDelete = (documento: DocumentoDrive) => {
    // Bloquear si el documento está en workflow (-2)
    if (documento.estadoNumero === -2) {
      AlertService.error('No se puede eliminar: estado: en proceso de aprobación');
      return;
    }
    const hasGobernanza = documento.gobernanzaId != null && Number(documento.gobernanzaId) > 0;
    if (!hasGobernanza) {
      AlertService.warning('No se puede eliminar: el documento no tiene gobernanza asociada');
      return;
    }
    setSelectedDocForCRUD(documento);
    setCrudOperation('ELIMINAR');
    setPendingCRUDData(null);
    setShowCRUDModal(true);
    setActionContext(null);
  };

  // Mapper: convierte DocumentoVectorial camelCase (servicio) a snake_case (FormData)
  const mapVectorialCamelToSnake = (src?: DocumentoVectorialCamel | null): DocumentoVectorizado | null => {
    if (!src) return null;
    return {
      documento_id: src.documentoId,
      contenido_texto: src.contenidoTexto,
      embedding: Array.isArray(src.embedding) ? src.embedding : [],
      metadata: {
        nombre_documento: src.metadata?.nombreDocumento || '',
        tipo_documento_id: src.metadata?.tipoDocumentoId || 0,
        fecha_creacion: src.metadata?.fechaCreacion || new Date().toISOString(),
        tags: Array.isArray(src.metadata?.tags) ? src.metadata!.tags : [],
        tamaño_archivo: src.metadata?.tamañoArchivo || 0,
        extension: src.metadata?.extension || '',
        departamento: (src.metadata?.departamento ?? undefined) as any,
      },
      chunks: Array.isArray(src.chunks)
        ? src.chunks.map(c => ({
            numero_chunk: c.numeroChunk,
            contenido: c.contenido,
            embedding_chunk: Array.isArray(c.embeddingChunk) ? c.embeddingChunk : [],
            posicion_inicio: c.posicionInicio,
            posicion_fin: c.posicionFin,
          }))
        : [],
      modelo_embedding: src.modeloEmbedding,
      dimensiones: src.dimensiones,
      hash_contenido: src.hashContenido,
      fecha_vectorizacion: src.fechaVectorizacion || new Date().toISOString(),
      version: (src.version ?? 1) as any,
      estado: (src.estado as any) || 'activo',
    };
  };

  // Helper: abrir Stepper en edición hidratando vectorizedDocument
  const openStepperForEdit = async (doc: DocumentoDrive) => {
    const initial = mapDocToFormData(doc);
    try {
      // Primero intentar hidratar desde la lista agregada ya cargada
      let camel: DocumentoVectorialCamel | null = null;
      const localMatch = vectorialesAgregados.find(v => Number(v.documentoId) === Number(doc.id));
      if (localMatch) {
        console.log('[Edit] Hidratar vectorial desde agregado por documentoId:', { documentoId: doc.id, nombreDocumento: localMatch?.metadata?.nombreDocumento });
        camel = localMatch;
      } else {
        console.log('[Edit] Vectorial no encontrado en agregado. Evitar /por-documento; hidratar base64 desde SQL:', doc.id);
        // Fallback nuevo: obtener contenido base64 ligero desde SQL para la visualización
        try {
          const respB64 = await documentoVectorialService.obtenerDocumentoBase64Sql({ documentoId: Number(doc.id) });
          const b64 = (respB64 as any)?.data;
          if (b64 && (b64.contenidoBase64 || b64.miniaturaBase64)) {
            // Establecer archivo y miniatura si no estaban presentes
            const mime = (doc as any).mimeType || 'application/pdf';
            const file = base64ToFile(b64.contenidoBase64 || null, mime, doc.titulo || `documento_${doc.id}.pdf`);
            if (file) {
              initial.archivo = file;
              initial.archivoVisualizacion = file;
            }
            if (!initial.miniaturaBase64 && b64.miniaturaBase64) {
              initial.miniaturaBase64 = b64.miniaturaBase64;
              initial.miniaturaMimeType = 'image/png';
              initial.miniaturaAncho = null;
              initial.miniaturaAlto = null;
            }
          }
        } catch (e) {
          console.warn('[Edit] No se pudo hidratar base64 desde SQL para documentoId:', doc.id, e);
        }
        // Importante: NO consultar /por-documento/{id}. Si no hay vectorial en memoria, continuar sin él.
        camel = null;
      }
      const snake = mapVectorialCamelToSnake(camel);
      if (snake) {
        initial.vectorizedDocument = snake;
      }
    } catch (error) {
      // No bloquear la edición si falla la carga de vectorial
      await ErrorHandler.handleServiceError(error, 'Cargar documento vectorial', false);
    }
    setStepperMode('edit');
    setStepperInitialData(initial);
    setIsDocStepperOpen(true);
    setShowMenu(false);
  };

  // Función para manejar edición desde vistas DocumentTile/DocumentList
  const onEditDrive = async (doc: DocumentoDrive) => {
    if (doc.estadoNumero === -2) {
      AlertService.error('No se puede editar: estado: en proceso de aprobación');
      return;
    }
    await openStepperForEdit(doc);
    setActionContext(null);
  };

  // Función para manejar gobierno desde menú contextual (abre edición)
  const onGovernanceDrive = async (doc: DocumentoDrive) => {
    // Abrir modal de seguimiento de aprobación (SOE) asociado al documento
    setSelectedDocForApproval(doc);
    setApprovalTrackingModalOpen(true);
  };

  // Renderizar tarjeta de documento
  const renderDocumentCard = (doc: Documento) => {
    return (
      <DocumentCard
        key={doc.id}
        documento={doc}
        onEdit={async (documento) => {
          // Convertir Documento a DocumentoDrive para compatibilidad
          const docDrive: DocumentoDrive = {
            id: documento.id,
            titulo: documento.titulo,
            categoria: documento.categoria,
            tipo: documento.tipo || '',
            propietario: documento.propietario || '',
            fechaCreacion: documento.fechaCreacion,
            fechaModificacion: documento.fechaModificacion,
            estado: documento.estado,
            extension: documento.extension || '',
            mimeType: documento.mimeType,
            contenidoBase64: documento.contenidoBase64,
            fileUrl: documento.fileUrl,
            rutaArchivo: documento.rutaArchivo
          };
          await openStepperForEdit(docDrive);
        }}
        onDelete={(documento) => {
          // Convertir Documento a DocumentoDrive para compatibilidad
          const docDrive: DocumentoDrive = {
            id: documento.id,
            titulo: documento.titulo,
            categoria: documento.categoria,
            tipo: documento.tipo || '',
            propietario: documento.propietario || '',
            fechaCreacion: documento.fechaCreacion,
            fechaModificacion: documento.fechaModificacion,
            estado: documento.estado,
            extension: documento.extension || '',
            mimeType: documento.mimeType,
            contenidoBase64: documento.contenidoBase64,
            fileUrl: documento.fileUrl,
            rutaArchivo: documento.rutaArchivo
          };
          
          setSelectedDocForCRUD(docDrive);
          setCrudOperation('ELIMINAR');
          setPendingCRUDData(null);
          setShowCRUDModal(true);
        }}
        onView={(documento) => console.log('View:', documento)}
        onDownload={(documento) => console.log('Download:', documento)}
        onShare={(documento) => console.log('Share:', documento)}
      />
    );
  };

  // Pestañas de navegación con iconos representativos
  const tabs = [
    { id: 'nuevo' as TabType, label: 'Nuevo', icon: PlusCircle },
    { id: 'recientes' as TabType, label: 'Recientes', icon: Clock },
    { id: 'favoritos' as TabType, label: 'Favoritos', icon: Star },
    { id: 'participo' as TabType, label: 'Participo', icon: User },
    { id: 'todos' as TabType, label: 'Todos', icon: FolderOpen },
  ];

  // ====== Helpers y handlers ======
  // Convierte base64 (sin prefijo data:) en File
  const base64ToFile = (base64?: string | null, mime?: string | null, name?: string | null): File | null => {
    try {
      if (!base64 || !mime) return null;
      const byteChars = atob(base64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const bytes = new Uint8Array(byteNums);
      const blob = new Blob([bytes], { type: mime || 'application/octet-stream' });
      const safeName = (name && name.trim()) || `documento.${(mime || '').split('/')[1] || 'bin'}`;
      return new File([blob], safeName, { type: mime || 'application/octet-stream' });
    } catch (e) {
      console.warn('No se pudo convertir base64 a File:', e);
      return null;
    }
  };

  const mapDocToFormData = (doc: DocumentoDrive): DocumentFormData => {
    // Prioriza contenidoBase64/mimeType del documento agregado
    const fileFromBase64 = base64ToFile(doc.contenidoBase64 || null, doc.mimeType || null, doc.titulo);
    // Extraer miniatura desde miniaturaUrl si no viene miniaturaBase64
    const thumbParsed = parseBase64FromRutaArchivo((doc as any).miniaturaUrl || undefined, undefined);

    // Preselección de entidades relacionadas desde agregado SQL
    const entidadesAsociadasArr: any[] = Array.isArray((doc as any).entidadesAsociadas)
      ? (doc as any).entidadesAsociadas
      : Array.isArray((doc as any).EntidadesAsociadas)
        ? (doc as any).EntidadesAsociadas
        : [];
    const entidadesRelacionadas: Record<string, number[]> = {};
    for (const grp of entidadesAsociadasArr) {
      const tipoId = grp?.tipoEntidadId ?? grp?.TipoEntidadId;
      const ids = Array.isArray(grp?.entidadesId) ? grp.entidadesId : Array.isArray(grp?.EntidadesId) ? grp.EntidadesId : [];
      if (tipoId != null) {
        entidadesRelacionadas[String(tipoId)] = ids.filter((n: any) => typeof n === 'number');
      }
    }

    return {
      id: doc.id,
      titulo: doc.titulo,
      tipo: doc.tipo,
      // Descripción/objetivo proveniente del documento (SQL)
      objetivo: (doc as any).descripcionDocumento ?? undefined,
      // Estado numérico del backend (workflow, etc.)
      estado: (doc as any).estadoNumero ?? undefined,
      archivo: fileFromBase64 || null,
      archivoVisualizacion: fileFromBase64 || null,
      // Miniatura si existe en el documento agregado
      miniaturaBase64: (doc as any).miniaturaBase64 ?? thumbParsed.base64 ?? null,
      miniaturaMimeType: doc.miniaturaMimeType ?? thumbParsed.mime ?? null,
      miniaturaAncho: doc.miniaturaAncho || null,
      miniaturaAlto: doc.miniaturaAlto || null,
      // Carpeta asociada (si se dispone) para pasar validación de Step 1
      carpetaId: (doc as any).carpetaId ?? null,
      carpetaRuta: undefined,
      // Gobernanza para preselección en Step 5
      gobernanzaId: (doc as any).gobernanzaId ?? null,
      tieneGobernanzaPropia: false,
      entidadesRelacionadas,
    } as DocumentFormData;
  };

  // Helpers para organización y usuario
  const getOrganizationId = (): number => {
    if (organizationInfo?.id && organizationInfo.id > 0) {
      return organizationInfo.id;
    }
    try {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const orgId = session?.organizacion?.organizacionId;
        if (orgId && Number(orgId) > 0) {
          return Number(orgId);
        }
      }
    } catch (error) {
      console.error('Error al obtener organizacionId del localStorage:', error);
    }
    return 1; // Fallback por defecto
  };

  const getUserId = (): number => {
    try {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return Number(session?.usuario?.usuarioId) || 1;
      }
      return 1;
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return 1;
    }
  };

  // ====== Helpers para mapeo de documentos agregados ======
  const getExtension = (nombre?: string, ruta?: string): string | undefined => {
    const base = (nombre || '') || (ruta ? String(ruta).split('/').pop() || '' : '');
    if (!base) return undefined;
    const idx = base.lastIndexOf('.');
    if (idx === -1) return undefined;
    return base.substring(idx + 1).toLowerCase();
  };

  // Heurística: detectar extensión desde la firma del contenido base64
  const guessExtFromBase64 = (rawBase64?: string | null): string | undefined => {
    if (!rawBase64) return undefined;
    const t = rawBase64.trim();
    if (!t) return undefined;
    if (t.startsWith('data:')) return undefined; // ya hay MIME, se resuelve por otra vía
    const prefix = t.slice(0, 16);
    // PDF: "%PDF" -> base64 comienza con "JVBER"
    if (/^JVBER/i.test(prefix)) return 'pdf';
    // DOCX/ZIP (PK): muchas veces comienza con "UEsDB"
    if (/^UEsDB/i.test(prefix)) return 'docx';
    // DOC (OLE Compound): suelen verse prefijos tipo "0M8R4KGx" en base64
    if (/^0M8R4KGx/i.test(prefix)) return 'doc';
    return undefined;
  };

  const getExtFromMime = (mime?: string | null): string | undefined => {
    if (!mime) return undefined;
    const m = mime.toLowerCase();
    if (m.includes('pdf')) return 'pdf';
    if (m.includes('wordprocessingml')) return 'docx';
    if (m.includes('msword')) return 'doc';
    if (m.includes('png')) return 'png';
    if (m.includes('jpeg')) return 'jpg';
    if (m.includes('svg')) return 'svg';
    return undefined;
  };

  const toDataUrl = (mime?: string | null, base64?: string | null): string | undefined => {
    if (!mime || !base64) return undefined;
    return `data:${mime};base64,${base64}`;
  };  // Resolver rutas HTTP/relativas hacia el origen del API
  const apiOrigin = (() => {
    try { return new URL(environment.apiUrl).origin; } catch { return ''; }
  })();
  const resolveHttpUrl = (ruta?: string | null): string | undefined => {
    if (!ruta) return undefined;
    const t = ruta.trim();
    if (!t) return undefined;
    if (t.startsWith('data:') || isLikelyRawBase64(t)) return undefined;
    if (t.startsWith('http://') || t.startsWith('https://')) return t;
    if (apiOrigin) {
      if (t.startsWith('/')) return `${apiOrigin}${t}`;
      return `${apiOrigin}/${t}`;
    }
    return t;
  };

  // Mapear extensión a MIME básico (suficiente para visor y descarga)
  const getMimeFromExt = (ext?: string | null): string | undefined => {
    const e = (ext || '').toLowerCase();
    if (!e) return undefined;
    if (e === 'pdf') return 'application/pdf';
    if (e === 'png') return 'image/png';
    if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
    if (e === 'gif') return 'image/gif';
    if (e === 'webp') return 'image/webp';
    if (e === 'svg') return 'image/svg+xml';
    if (e === 'txt') return 'text/plain';
    if (e === 'csv') return 'text/csv';
    if (e === 'doc') return 'application/msword';
    if (e === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (e === 'xls') return 'application/vnd.ms-excel';
    if (e === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return undefined;
  };

  const isLikelyRawBase64 = (s?: string | null): boolean => {
    if (!s) return false;
    const t = s.trim();
    // Excluir URLs convencionales
    if (t.startsWith('http') || t.includes('://') || t.startsWith('/')) return false;
    // Permitir sólo caracteres base64 y que la longitud parezca válida
    const re = /^[A-Za-z0-9+/=\r\n]+$/;
    return re.test(t) && t.length >= 64 && (t.length % 4 === 0);
  };

  // Extrae base64/mime/dataURL desde rutaArchivo si esa propiedad trae el contenido
  const parseBase64FromRutaArchivo = (ruta?: string | null, ext?: string | null): { base64?: string; mime?: string; dataUrl?: string } => {
    if (!ruta) return {};
    if (ruta.startsWith('data:')) {
      const match = ruta.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        return { mime: match[1], base64: match[2], dataUrl: ruta };
      }
      return { dataUrl: ruta };
    }
    if (isLikelyRawBase64(ruta)) {
      const mime = getMimeFromExt(ext || undefined);
      const dataUrl = mime ? `data:${mime};base64,${ruta}` : undefined;
      return { base64: ruta, mime, dataUrl };
    }
    return {};
  };

  const computeEstado = (fechaIso?: string | null): 'reciente' | 'normal' => {
    try {
      if (!fechaIso) return 'normal';
      const d = new Date(fechaIso);
      const now = new Date();
      const diffDays = Math.abs((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 60 ? 'reciente' : 'normal';
    } catch {
      return 'normal';
    }
  };

  const carpetaNombreById = (carpetas: Array<{ carpetaId: number; nombreCarpeta: string }>): Map<number, string> => {
    const map = new Map<number, string>();
    for (const c of carpetas) {
      if (typeof c.carpetaId === 'number' && c.nombreCarpeta) {
        map.set(c.carpetaId, c.nombreCarpeta);
      }
    }
    return map;
  };

  const mapSqlToDriveDoc = (sqlDoc: DocumentoSql | any, carpetasMap: Map<number, string>): DocumentoDrive => {
    // Tolerar PascalCase del backend
    const documentoId = sqlDoc.documentoId ?? sqlDoc.DocumentoId;
    const nombreDocumento = sqlDoc.nombreDocumento ?? sqlDoc.NombreDocumento;
    const nombreArchivoOriginal = sqlDoc.nombreArchivoOriginal ?? sqlDoc.NombreArchivoOriginal ?? '';
    const rutaArchivo = sqlDoc.rutaArchivo ?? sqlDoc.RutaArchivo ?? '';
    const carpetaId = sqlDoc.carpetaId ?? sqlDoc.CarpetaId ?? null;
    const tamanoArchivo = sqlDoc.tamanoArchivo ?? sqlDoc.TamanoArchivo ?? undefined;
    const miniaturaBase64 = sqlDoc.miniaturaBase64 ?? sqlDoc.MiniaturaBase64 ?? undefined;
    const miniaturaMimeType = sqlDoc.miniaturaMimeType ?? sqlDoc.MiniaturaMimeType ?? undefined;
    const miniaturaAncho = sqlDoc.miniaturaAncho ?? sqlDoc.MiniaturaAncho ?? undefined;
    const miniaturaAlto = sqlDoc.miniaturaAlto ?? sqlDoc.MiniaturaAlto ?? undefined;
    const contenidoBase64 = sqlDoc.contenidoBase64 ?? sqlDoc.ContenidoBase64 ?? undefined;
    const mimeType = sqlDoc.mimeType ?? sqlDoc.MimeType ?? undefined;
    // Descripción del documento (tolerar diferentes convenciones del backend)
    const descripcionDocumento = sqlDoc.descripcionDocumento ?? sqlDoc.DescripcionDocumento ?? undefined;
    // Estado numérico del backend (para validaciones de workflow)
    const estadoNumero = sqlDoc.estado ?? sqlDoc.Estado ?? null;
    // Gobernanza puede venir con diferentes nombres desde el backend
    const gobernanzaId = sqlDoc.gobernanzaId ?? sqlDoc.GobernanzaId ?? sqlDoc.GobiernoId ?? null;
    const fechaCreacion = sqlDoc.fechaCreacion ?? sqlDoc.FechaCreacion ?? null;
    const fechaModificacion = sqlDoc.fechaModificacion ?? sqlDoc.FechaModificacion ?? null;
    const creadoPor = sqlDoc.creadoPor ?? sqlDoc.CreadoPor ?? null;

    const fecha = fechaModificacion || fechaCreacion || new Date().toISOString();
    const categoria = carpetasMap.get(carpetaId) || 'General';
    const propietario = creadoPor != null ? `Usuario ${creadoPor}` : 'Desconocido';
    // Detectar extensión de forma robusta (nombre -> MIME -> firma base64)
    let ext = getExtension(nombreArchivoOriginal, rutaArchivo);
    if (!ext) {
      const extFromMime = getExtFromMime(mimeType);
      if (extFromMime) ext = extFromMime;
    }
    if (!ext && isLikelyRawBase64(rutaArchivo)) {
      const guessed = guessExtFromBase64(rutaArchivo);
      if (guessed) ext = guessed;
    }

    // Si aún no se pudo establecer, no forzar 'doc': dejar undefined
    const miniaturaUrl = toDataUrl(miniaturaMimeType || undefined, miniaturaBase64 || undefined);
    const estado = computeEstado(fechaModificacion || fechaCreacion);
    const sugeridoMotivo = `Modificado · ${new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    // Preferir contenido base64 directo; derivar desde rutaArchivo si viniera en data URL o raw
    const parsedFromRuta = parseBase64FromRutaArchivo(rutaArchivo, ext);
    const effectiveMime = mimeType || parsedFromRuta.mime || getMimeFromExt(ext) || undefined;
    const effectiveBase64 = contenidoBase64 || parsedFromRuta.base64 || undefined;
    const httpUrl = resolveHttpUrl(rutaArchivo);
    const effectiveFileUrl = parsedFromRuta.dataUrl || httpUrl || undefined;

    // Entidades asociadas (agrupadas por tipo) provenientes del agregado
    const entidadesAsociadas = Array.isArray(sqlDoc.entidadesAsociadas)
      ? sqlDoc.entidadesAsociadas
      : Array.isArray(sqlDoc.EntidadesAsociadas)
        ? sqlDoc.EntidadesAsociadas.map((e: any) => ({
            tipoEntidadId: e?.TipoEntidadId,
            entidadesId: Array.isArray(e?.EntidadesId) ? e.EntidadesId : []
          }))
        : [];

    return {
      id: documentoId,
      titulo: nombreDocumento || nombreArchivoOriginal,
      categoria,
      propietario,
      fecha,
      tipo: 'otro',
      estado,
      gobernanzaId,
      descripcionDocumento,
      estadoNumero,
      ubicacion: categoria,
      sugeridoMotivo,
      ultimaApertura: undefined,
      miniaturaUrl,
      miniaturaAncho,
      miniaturaAlto,
      miniaturaMimeType,
      extension: ext,
      fileUrl: effectiveFileUrl,
      sizeBytes: tamanoArchivo,
      contenidoBase64: effectiveBase64,
      mimeType: effectiveMime,
      carpetaId: carpetaId,
      entidadesAsociadas,
    };
  };

  const loadDocumentosAgregados = async (pagina = 1, tamaño = 24) => {
    try {
      setIsLoadingDocs(true);
      const resp = await documentoVectorialService.obtenerAgregado({ pagina, tamaño });
      if (!resp.success || !resp.data) {
        setDocsState([]);
        return;
      }
      const data: any = resp.data as any; // tolerar claves diferentes del backend
      // Tolerar PascalCase en contenedor de carpetas del agregado
      const carpetasRaw = Array.isArray(data.carpetas)
        ? data.carpetas
        : Array.isArray(data.Carpetas)
          ? data.Carpetas
          : [];
      const carpetas = carpetasRaw
        .map((c: any) => ({
          carpetaId: c?.carpetaId ?? c?.CarpetaId ?? c?.Id,
          nombreCarpeta: c?.nombreCarpeta ?? c?.NombreCarpeta ?? c?.name,
          carpetaPadreId: c?.carpetaPadreId ?? c?.CarpetaPadreId ?? null,
        }))
        .filter((c: any) => typeof c.carpetaId === 'number' && !!c.nombreCarpeta);
      setCarpetasState(carpetas as any);
      const carpetasMap = carpetaNombreById(carpetas);
      // Backend puede devolver 'sql', 'documentos' o 'Documentos' como contenedor paginado
      const sqlContainer = data?.sql
        ?? data?.documentos
        ?? data?.Documentos
        ?? data?.documentosSql
        ?? data?.DocumentosSql
        ?? null;
      const sqlDocs = Array.isArray(sqlContainer?.data)
        ? sqlContainer.data
        : Array.isArray(sqlContainer?.Data)
          ? sqlContainer.Data
          : [];
      // Log: solo la lista de documentos SQL del agregado
      console.log('[Agregado] Documentos SQL:', sqlDocs);
      // Log: primer documento vectorial del agregado (si existe)
      const vectoriales = Array.isArray(data?.vectoriales)
        ? data.vectoriales
        : Array.isArray(data?.Vectoriales)
          ? data.Vectoriales
          : [];
      if (vectoriales.length > 0) {
        console.log('[Agregado] Primer documento vectorial:', vectoriales[0]);
      } else {
        console.log('[Agregado] No hay documentos vectoriales en la respuesta');
      }
      // Guardar vectoriales del agregado para hidratar el Stepper en edición
      setVectorialesAgregados(vectoriales as DocumentoVectorialCamel[]);
      const mapped = sqlDocs.map((s) => mapSqlToDriveDoc(s, carpetasMap));
      setDocsState(mapped);
    } catch (error) {
      setDocsState([]);
      await ErrorHandler.handleServiceError(error, 'Cargar documentos agregados', false);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Cargar datos agregados cuando se entra al listado desde el menú
  useEffect(() => {
    if (!showMenu) {
      loadDocumentosAgregados(1, 24);
    }
  }, [showMenu]);

  const returnToMenuCard = () => {
    setShowMenu(true);
    setIsDocStepperOpen(false);
    setSelectorOpen(false);
    setSelectedDoc(null);
    setShowFoldersManager(false);
  };
  const handleVolverAlMenuCard = () => returnToMenuCard();

  const openSelector = (mode: 'edit' | 'delete' | 'download') => {
    // Usamos la vista de listado en pantalla con contexto de acción
    setActionContext(mode);
    setDocumentViewMode('list');
    setShowMenu(false);
  };

  const selectorColumns: GridColumn<DocumentoDrive>[] = [
    { id: 'titulo', header: 'Nombre', accessor: 'titulo', width: '30%', sortable: true },
    { id: 'categoria', header: 'Categoría', accessor: 'categoria', width: '20%', align: 'center', sortable: true },
    { id: 'tipo', header: 'Tipo', accessor: 'tipo', width: '15%', align: 'center', sortable: true },
    { id: 'propietario', header: 'Propietario', accessor: 'propietario', width: '20%', align: 'center', sortable: true },
  ];

  const handleSelectorSelect = async (doc: DocumentoDrive) => {
    if (!selectorMode) return;
    if (selectorMode === 'edit') {
      // Bloquear edición si hay workflow en ejecución (-2)
      if (doc.estadoNumero === -2) {
        AlertService.error('No se puede editar: estado: en proceso de aprobación');
        return;
      }
      // Abrir directamente el Stepper en modo edición, hidratando vectorizedDocument
      await openStepperForEdit(doc);
      setSelectorOpen(false);
    } else if (selectorMode === 'delete') {
      // Bloquear eliminación si hay workflow en ejecución (-2)
      if (doc.estadoNumero === -2) {
        AlertService.error('No se puede eliminar: estado: en proceso de aprobación');
        return;
      }
      // Validar gobernanza antes de permitir eliminación
      const hasGobernanza = doc.gobernanzaId != null && Number(doc.gobernanzaId) > 0;
      if (!hasGobernanza) {
        AlertService.warning('No se puede eliminar: el documento no tiene gobernanza asociada');
        return;
      }
      // Usar el modal de confirmación CRUD para eliminación
      setSelectedDocForCRUD(doc);
      setCrudOperation('ELIMINAR');
      setPendingCRUDData(null);
      setShowCRUDModal(true);
      setSelectorOpen(false);
    } else if (selectorMode === 'download') {
      setSelectorOpen(false);
      AlertService.success(`Descarga iniciada: ${doc.titulo}`);
      // Aquí integrar descarga real cuando esté disponible
    }
  };

  // ====== Handlers para modales de confirmación CRUD ======
  const handleCRUDConfirmation = async (action: 'BORRADOR' | 'NOTIFICAR') => {
    if (!selectedDocForCRUD) return;

    setShowCRUDModal(false);

    try {
      if (crudOperation === 'EDITAR') {
        // Lógica de edición
        if (pendingCRUDData) {
          setStepperMode('edit');
          setStepperInitialData(pendingCRUDData);
          setIsDocStepperOpen(true);
          setShowMenu(false);
        }
        AlertService.success(`Documento "${selectedDocForCRUD.titulo}" preparado para edición`);
      } else if (crudOperation === 'ELIMINAR') {
        // Lógica de eliminación usando documentosService con UPDATE
        const loadingToastId = AlertService.loading('Eliminando documento...');
        
        try {
          // Llamar al servicio de eliminación usando PUT con parámetros de eliminación lógica
          const response = await documentosService.eliminarDocumento({
            documentoId: selectedDocForCRUD.id,
            organizacionId: organizationInfo.id || 1, // Usar organizacionId del usuario actual
            nombreDocumento: selectedDocForCRUD.titulo,
            descripcion: selectedDocForCRUD.descripcionDocumento || '',
            carpetaId: undefined, // No especificar carpeta
            estado: -3, // IniciarFlujo para workflow de eliminación
            esEliminacion: true,
            registroEliminadoSolicitado: true,
            gobernanzaId: selectedDocForCRUD.gobernanzaId ?? undefined
          });

          if (response.success) {
            // Actualizar el estado local
            setDocsState(prev => prev.filter(d => d.id !== selectedDocForCRUD.id));
            
            AlertService.updateLoading(
              loadingToastId,
              'success',
              `Workflow de eliminación iniciado correctamente para "${selectedDocForCRUD.titulo}"`,
              3000
            );
            returnToMenuCard();
          } else {
            AlertService.updateLoading(
              loadingToastId,
              'error',
              response.message || 'Error al eliminar el documento',
              5000
            );
          }
        } catch (error) {
          AlertService.updateLoading(
            loadingToastId,
            'error',
            'Error inesperado al eliminar el documento',
            5000
          );
          await ErrorHandler.handleServiceError(error, 'Eliminar Documento');
        }
      }
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'Operación CRUD');
    } finally {
      // Limpiar estados
      setSelectedDocForCRUD(null);
      setPendingCRUDData(null);
    }
  };

  const handleCRUDCancel = () => {
    setShowCRUDModal(false);
    setSelectedDocForCRUD(null);
    setPendingCRUDData(null);
  };

  // ====== Visor modal (base64) ======
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<DocumentoDrive | null>(null);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  // ====== Modal de Seguimiento de Aprobación (SOE) ======
  const [approvalTrackingModalOpen, setApprovalTrackingModalOpen] = useState<boolean>(false);
  const [selectedDocForApproval, setSelectedDocForApproval] = useState<DocumentoDrive | null>(null);
  const handleApprovalActionForDoc = (entityId: number, accion: 'APROBAR' | 'RECHAZAR', comentarios?: string) => {
    const titulo = selectedDocForApproval?.titulo || 'Documento';
    AlertService.info(`Acción "${accion}" registrada para ${titulo} (Entidad #${entityId}).`);
  };

  const buildDataUrl = (mime?: string, base64?: string): string | null => {
    if (!mime || !base64) return null;
    return `data:${mime};base64,${base64}`;
  };

  const handleOpenViewer = (doc: DocumentoDrive) => {
    // 1) Preferir contenido base64 directo
    let src: string | null = buildDataUrl(doc.mimeType, doc.contenidoBase64);
    let mime: string | undefined = doc.mimeType || undefined;
    // 2) Fallback: usar fileUrl si viene como data URL, base64 puro o HTTP/relativo
    if (!src && doc.fileUrl) {
      const f = doc.fileUrl;
      if (f.startsWith('data:')) {
        src = f;
        if (!mime) {
          const m = f.match(/^data:([^;]+);base64,/);
          if (m) mime = m[1];
        }
      } else if (isLikelyRawBase64(f)) {
        const guessed = mime || getMimeFromExt(doc.extension) || 'application/octet-stream';
        mime = guessed;
        src = `data:${guessed};base64,${f}`;
      } else {
        const resolvedUrl = resolveHttpUrl(f) || f;
        src = resolvedUrl;
        mime = mime || getMimeFromExt(doc.extension) || undefined;
      }
    }

    // Asegurar mimeType para el visor
    const viewerDocResolved = { ...doc, mimeType: mime || doc.mimeType };
    setViewerDoc(viewerDocResolved);
    setViewerSrc(src);
    setViewerOpen(true);
  };

  const handleDownloadBase64 = (doc: DocumentoDrive) => {
    // Intentar obtener base64 desde el objeto o desde rutaArchivo si viene allí
    let b64 = doc.contenidoBase64 || null;
    let mime = doc.mimeType || null;
    if (!b64 && doc.fileUrl) {
      if (doc.fileUrl.startsWith('data:')) {
        const match = doc.fileUrl.match(/^data:([^;]+);base64,(.*)$/);
        if (match) { mime = mime || match[1]; b64 = match[2]; }
      } else if (isLikelyRawBase64(doc.fileUrl)) {
        b64 = doc.fileUrl;
        mime = mime || getMimeFromExt(doc.extension) || 'application/octet-stream';
      }
    }
    if (!b64) {
      AlertService.warning('No hay contenido base64 para descargar');
      return;
    }
    try {
      const resolvedMime = mime || 'application/octet-stream';
      const byteCharacters = atob(b64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: resolvedMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = (doc.extension || (resolvedMime.includes('pdf') ? 'pdf' : resolvedMime.split('/')[1] || 'bin')).toLowerCase();
      const filename = `${doc.titulo}.${ext}`.replace(/\s+/g, '-');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 250);
      AlertService.success(`Descarga iniciada: ${doc.titulo}`);
      setActionContext(null);
    } catch (e) {
      console.error('Error al descargar base64', e);
      AlertService.error('No se pudo descargar el archivo base64');
    }
  };

  // ====== Visor simple embebido para la vista jerárquica (resuelve base64 por documentoId) ======
  useEffect(() => {
    const doc = hierarchySelectedDoc;
    // Resetear estado al cambiar la selección
    setHierarchyViewerSrc(null);
    setHierarchyViewerMime(null);
    setHierarchyViewerLoading(!!doc);
    if (!doc) {
      // Liberar blob previo si existiera
      if (hierarchyBlobUrlRef.current) {
        URL.revokeObjectURL(hierarchyBlobUrlRef.current);
        hierarchyBlobUrlRef.current = null;
      }
      return;
    }
    console.log('[ViewerEffect] start', { id: doc.id, titulo: doc.titulo, hasBase64: !!doc.contenidoBase64, fileUrl: doc.fileUrl, mime: doc.mimeType, ext: doc.extension });

    // 1) Preferir contenido base64 ya presente
    let src = buildDataUrl(doc.mimeType || undefined, doc.contenidoBase64 || undefined);
    let mime = doc.mimeType || undefined;
    let sourceKind: 'base64' | 'dataUrl' | 'rawBase64' | 'http' | 'none' = 'none';
    if (src) {
      sourceKind = 'base64';
    }

    // 2) Fallback: derivar desde fileUrl si viniera como data URL, base64 puro o HTTP/relativa
    if (!src && doc.fileUrl) {
      const f = doc.fileUrl;
      if (f.startsWith('data:')) {
        src = f;
        sourceKind = 'dataUrl';
        if (!mime) {
          const m = f.match(/^data:([^;]+);base64,/);
          if (m) mime = m[1];
        }
      } else if (isLikelyRawBase64(f)) {
        const guessed = mime || getMimeFromExt(doc.extension) || 'application/octet-stream';
        mime = guessed;
        src = `data:${guessed};base64,${f}`;
        sourceKind = 'rawBase64';
      } else {
        const resolvedUrl = resolveHttpUrl(f) || f;
        src = resolvedUrl;
        mime = mime || getMimeFromExt(doc.extension) || undefined;
        sourceKind = 'http';
      }
    }

    if (src) {
      console.log('[ViewerEffect] resolved src', { id: doc.id, sourceKind, mime, isDataUrl: src.startsWith('data:'), preview: src.length > 64 ? src.slice(0, 64) + '...' : src });
      // Para PDFs, algunos navegadores muestran en blanco los data URLs.
      // Convertimos base64 a Blob y usamos object URL para mayor compatibilidad.
      if ((mime || '').includes('pdf')) {
        try {
          const b64 = doc.contenidoBase64 || (src.startsWith('data:') ? (src.split(',')[1] || '') : '');
          if (b64) {
            const byteCharacters = atob(b64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime || 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            // Revocar anterior si existía
            if (hierarchyBlobUrlRef.current) URL.revokeObjectURL(hierarchyBlobUrlRef.current);
            hierarchyBlobUrlRef.current = blobUrl;
            src = blobUrl;
          }
        } catch (err) {
          console.warn('[ViewerEffect] blob conversion failed', err);
        }
      }
      setHierarchyViewerSrc(src);
      setHierarchyViewerMime(mime || null);
      setHierarchyViewerLoading(false);
    } else {
      setHierarchyViewerLoading(false);
      console.log('[ViewerEffect] no src resolved', { id: doc.id, fileUrl: doc.fileUrl, hasBase64: !!doc.contenidoBase64 });
    }
    return () => {
      if (hierarchyBlobUrlRef.current) {
        URL.revokeObjectURL(hierarchyBlobUrlRef.current);
        hierarchyBlobUrlRef.current = null;
      }
    };
  }, [hierarchySelectedDoc]);

  return (
    <>
      <div className={styles.documentosContainer} style={{ backgroundColor: colors.background }}>
      {/* Encabezado restaurado usando PageHeader */}
      <PageHeader
        title="Gestión de Documentos"
        description={showMenu ? 'Elige una acción para comenzar' : 'Explora y administra tus documentos'}
        actions={[
          !showMenu ? {
            label: 'Volver al menú',
            icon: 'ArrowLeft',
            variant: 'outline',
            onClick: handleVolverAlMenuCard
          } : undefined
        ].filter(Boolean) as any}
      />

      {/* Contenido principal */}
      <div className="px-6 pb-6">
        <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <CardContent className="p-4">
            {showMenu && (
              <MenuGrid title="Gestión de Documentos" titleIconName="FolderOpen" columns={4}>
                <MenuCard
                  title="Navegar documentos"
                  description="Elige la vista y entra al listado"
                  icon={<FolderOpen />}
                  actions={[
                    { label: 'Vista Cards', icon: <Grid size={16} />, variant: 'primary', onClick: () => { setDocumentViewMode('thumbnails'); setShowMenu(false); } },
                    { label: 'Vista Lista', icon: <List size={16} />, onClick: () => { setDocumentViewMode('list'); setShowMenu(false); } },
                  ]}
                />
                <MenuCard
                  title="Crear documento"
                  description="Abre el asistente para cargar un PDF"
                  icon={<Plus />}
                  expandable={false}
                  onCardClick={() => { setStepperMode('create'); setStepperInitialData(undefined); setIsDocStepperOpen(true); setShowMenu(false); }}
                />
                <MenuCard
                  title="Editar documento"
                  description="Selecciona un documento y edita sus datos"
                  icon={<Edit />}
                  expandable={false}
                  onCardClick={() => openSelector('edit')}
                />
                <MenuCard
                  title="Eliminar documento"
                  description="Selecciona y elimina un documento"
                  icon={<Trash2 />}
                  expandable={false}
                  onCardClick={() => openSelector('delete')}
                />
                <MenuCard
                  title="Descargar documento"
                  description="Selecciona un documento para descargar"
                  icon={<Download />}
                  expandable={false}
                  onCardClick={() => openSelector('download')}
                />
              </MenuGrid>
            )}
            {!showMenu ? (
              showFoldersManager ? (
                <CarpetasManager onBack={() => { setShowFoldersManager(false); setShowMenu(true); }} />
              ) : (
              <>
            {/* Stepper + Detalles en layout dividido con resizer y animación */}
            <div
              ref={splitRef}
              className={styles.stepperWithSidebar}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: detailsOpen ? 0 : 0,
                marginBottom: 8
              }}
            >
              {/* Panel izquierdo (Stepper) - resizable cuando Detalles está abierto */}
              <div
                style={{
                  flex: detailsOpen ? `0 0 ${leftWidthPx ? `${leftWidthPx}px` : 'auto'}` : '1 1 auto',
                  minWidth: detailsOpen ? LEFT_MIN : 0,
                  transition: 'flex-basis 240ms ease',
                  position: 'relative'
                }}
              >
                <StepperDocumentForm
                  isOpen={isDocStepperOpen}
                  onClose={() => setIsDocStepperOpen(false)}
                  mode={stepperMode}
                  initialData={stepperInitialData}
                  onSubmit={async (payload, saveType) => {
                  try {
                    // Logs solicitados: mostrar lo que se enviará a SQL Server y a Mongo
                    console.log('[Gestión de Documentos] SaveType:', saveType);
                    console.log('[Gestión de Documentos] Payload completo a enviar:', payload);
                    console.log('[Gestión de Documentos] SQL Server payload (documentoDb):', payload?.documentoDb);
                    console.log('[Gestión de Documentos] Mongo payload DTO (camelCase):', payload?.documentoVectorialDto);
                    console.log('[Gestión de Documentos] Mongo payload preview (snake_case):', payload?.documentoVectorialMongo);

                    const dto = payload?.documentoVectorialDto;
                    if (!dto) {
                      AlertService.warning('Primero debes vectorizar el documento (Paso 1)');
                      return;
                    }
                    // Construir payload compuesto: SQL (documentoDb) + Vectorial (sin documentoId)
                    const documentoDbCam = payload?.documentoDb ? {
                      tipoDocumentoId: payload.documentoDb.TipoDocumentoId,
                      nombreDocumento: payload.documentoDb.NombreDocumento,
                      nombreArchivoOriginal: payload.documentoDb.NombreArchivoOriginal,
                      rutaArchivo: payload.documentoDb.RutaArchivo,
                      carpetaId: payload.documentoDb.CarpetaId,
                      tamanoArchivo: payload.documentoDb.TamanoArchivo,
                      descripcionDocumento: payload.documentoDb.DescripcionDocumento,
                      miniaturaBase64: payload.documentoDb.MiniaturaBase64,
                      miniaturaMimeType: payload.documentoDb.MiniaturaMimeType,
                      miniaturaAncho: payload.documentoDb.MiniaturaAncho,
                      miniaturaAlto: payload.documentoDb.MiniaturaAlto,
                      // Campos adicionales requeridos
                      estado: payload.documentoDb.Estado,
                      gobiernoId: payload.documentoDb.GobiernoId,
                      entidadesAsociadas: Array.isArray(payload.documentoDb.EntidadesAsociadas)
                        ? payload.documentoDb.EntidadesAsociadas.map((e: any) => ({
                            tipoEntidadId: e?.TipoEntidadId,
                            entidadesId: Array.isArray(e?.EntidadesId) ? e.EntidadesId : []
                          }))
                        : []
                    } : undefined;

                    const { documentoId: _omit, ...vectorialSinId } = dto;

                    const compuestoPayload = {
                      documentoDb: documentoDbCam!,
                      vectorial: vectorialSinId,
                    };

                    console.log('[Gestión de Documentos] Payload compuesto FINAL a enviar:', compuestoPayload);

                    // Elegir endpoint según modo del Stepper
                    let response;
                    if (stepperMode === 'edit') {
                      const documentoId = Number(stepperInitialData?.id ?? currentFormData?.id ?? dto?.documentoId);
                      if (!Number.isFinite(documentoId) || documentoId <= 0) {
                        AlertService.error('No se pudo determinar el DocumentoId para la actualización');
                        return;
                      }
                      response = await documentoVectorialService.actualizarDocumentoCompuestoPorDocumentoId({
                        documentoId,
                        payload: compuestoPayload,
                      });
                    } else {
                      response = await documentoVectorialService.insertarDocumento({
                        payload: compuestoPayload,
                      });
                    }
                    if (response.success) {
                      if (saveType === 'draft') {
                        AlertService.success('Documento guardado como borrador con éxito');
                      } else {
                        AlertService.success('Documento enviado a aprobación con éxito');
                      }
                      setIsDocStepperOpen(false);
                      returnToMenuCard();
                    } else {
                      await ErrorHandler.handleServiceError(new Error(response.message || 'Error en inserción'), 'Guardar Documento Vectorial');
                    }
                  } catch (error) {
                    await ErrorHandler.handleServiceError(error, 'Guardar Documento Vectorial');
                  }
                }}
                onLoadData={async () => {
                  try {
                    const organizacionId = getOrganizationId();
                    const userId = getUserId();
                    const resp = await documentosCarpetasService.getCarpetas({ organizacionId, includeDeleted: false });
                    const carpetasRaw = resp?.success && Array.isArray(resp.data) ? resp.data : [];

                    // Filtrar privadas: solo mostrar si creadoPor == userId
                    const carpetasFiltradas = carpetasRaw.filter((c: any) => {
                      const esPrivada = c?.carpetaPrivada === true || c?.carpetaPrivada === 'true';
                      if (!esPrivada) return true;
                      const creadoPor = c?.creadoPor ?? c?.CreadoPor ?? c?.creado_por ?? null;
                      if (creadoPor === null || creadoPor === undefined) return false;
                      const creadoNum = Number(creadoPor);
                      return Number.isFinite(creadoNum) && creadoNum === userId;
                    });

                    // Mapear al objeto esperado por el árbol
                    const carpetas = carpetasFiltradas
                      .map((c: any) => ({
                        carpetaId: c?.carpetaId ?? c?.CarpetaId ?? c?.Id,
                        nombreCarpeta: c?.nombreCarpeta ?? c?.NombreCarpeta ?? c?.name,
                        carpetaPadreId: c?.carpetaPadreId ?? c?.CarpetaPadreId ?? null,
                      }))
                      .filter((x: any) => x?.carpetaId !== undefined && x?.nombreCarpeta);

                    return ({
                      tiposDocumento: [
                        { id: 'manual', nombre: 'Manual' },
                        { id: 'politica', nombre: 'Política' },
                        { id: 'procedimiento', nombre: 'Procedimiento' },
                        { id: 'instructivo', nombre: 'Instructivo' },
                      ],
                      procesos: [
                        { id: 'ventas/cotizacion/cotizacion-digital', nombre: 'Ventas / Cotización / Cotización digital' },
                      ],
                      carpetas
                    });
                  } catch (error) {
                    await ErrorHandler.handleServiceError(error, 'Cargar carpetas de documentos', false);
                    return ({
                      tiposDocumento: [
                        { id: 'manual', nombre: 'Manual' },
                        { id: 'politica', nombre: 'Política' },
                        { id: 'procedimiento', nombre: 'Procedimiento' },
                        { id: 'instructivo', nombre: 'Instructivo' },
                      ],
                      procesos: [
                        { id: 'ventas/cotizacion/cotizacion-digital', nombre: 'Ventas / Cotización / Cotización digital' },
                      ],
                      carpetas: []
                    });
                  }
                }}
                inline
                onFormDataChange={(d) => setCurrentFormData(d)}
                />

                {/* Botón flotante "Detalles" sólo visible cuando el Stepper está abierto y el panel está cerrado */}
                {isDocStepperOpen && !detailsOpen && (
                  <InlineDetailsSidebar
                    data={currentFormData}
                    open={false}
                    onToggle={() => setDetailsOpen(true)}
                  />
                )}
              </div>

              {/* Resizer entre Stepper y Detalles */}
              {detailsOpen && (
                <div
                  onMouseDown={() => setIsResizing(true)}
                  style={{
                    width: RESIZER_WIDTH,
                    cursor: 'col-resize',
                    background: 'transparent',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: 2,
                        height: '60%',
                        borderRadius: 2,
                        background: colors.border
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Panel derecho (Detalles) con animación de expand/collapse */}
              <AnimatePresence initial={false}>
                {detailsOpen && (
                  <motion.div
                    key="doc-details-pane"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: DETAILS_WIDTH_DEFAULT, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden', borderLeft: '1px solid transparent', background: colors.surface }}
                  >
                    <InlineDetailsSidebar
                      data={currentFormData}
                      open={true}
                      onToggle={() => setDetailsOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar de detalles (legacy) - eliminado, ahora forma parte del split layout */}

            {/* Cuando el Stepper está abierto, ocultar grids y filtros */}
            {!isDocStepperOpen && (
              <>
            {/* Contenido principal con header y tabs horizontales restaurados */}
            <div className="flex-1">
              <div className={styles.tabsContainer}>
                <div className={styles.tabsHeaderRow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  {/* Grupo izquierdo: acción "Nuevo" y grupo de filtros separados */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Acción: Nuevo */}
                    <div className={styles.tabsContent} style={{ display: 'flex', gap: 8 }}>
                      {tabs.filter(t => t.id === 'nuevo').map((tab) => (
                        <Button
                          key={tab.id}
                          variant="primary"
                          onClick={() => {
                            // "Nuevo" abre el Stepper en modo creación
                            setActiveTab(tab.id);
                            setStepperMode('create');
                            setStepperInitialData(undefined);
                            setIsDocStepperOpen(true);
                            setShowMenu(false);
                          }}
                        >
                          <tab.icon size={16} />
                          {tab.label}
                        </Button>
                      ))}
                    </div>

                    {/* Filtros: Recientes, Favoritos, Participo, Todos */}
                    <div className={styles.tabsContent} style={{ display: 'flex', gap: 8 }}>
                      {tabs.filter(t => t.id !== 'nuevo').map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={styles.tabButton}
                          style={{
                            borderColor: colors.border,
                            backgroundColor: activeTab === tab.id ? colors.primary : 'transparent',
                            color: activeTab === tab.id ? '#ffffff' : colors.text
                          }}
                        >
                          <tab.icon size={16} />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle de vista a la derecha */}
                  <DocumentViewToggle
                    currentView={documentViewMode}
                    onViewChange={setDocumentViewMode}
                  />
                </div>
                {actionContext && (
                  <div className="mb-3 p-3 rounded border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                    <span style={{ color: colors.text }}>
                      {actionContext === 'edit'
                        ? 'Selecciona un documento del listado y usa Editar.'
                        : actionContext === 'delete'
                          ? 'Selecciona un documento del listado y usa Eliminar.'
                          : 'Selecciona un documento del listado y usa Descargar.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Contenido de documentos */}
              {documentos.length > 0 ? (
                <div>
                  {documentViewMode === 'thumbnails' ? (
                    <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}>
                      {documentos.map((doc) => (
                        <DocumentTile
                          key={doc.id}
                          doc={doc}
                          onOpen={handleOpenViewer}
                          onDownload={handleDownloadBase64}
                          onGovernance={onGovernanceDrive}
                          onEdit={onEditDrive}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  ) : documentViewMode === 'list' ? (
                    <DocumentList
                      docs={documentos}
                      onOpen={handleOpenViewer}
                      onDownload={handleDownloadBase64}
                      onGovernance={onGovernanceDrive}
                      onEdit={onEditDrive}
                      onDelete={onDelete}
                    />
                  ) : documentViewMode === 'hierarchy' ? (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                      {/* Panel izquierdo: árbol (25%) */}
                      <div style={{ flex: '0 0 30%', minWidth: 320, borderRight: `1px solid ${colors.border}` }}>
                        <DocumentHierarchyTree
                          folders={carpetasState}
                          docs={documentos}
                          onOpen={(doc) => {
                            console.log('[Hierarchy] click doc', { id: doc.id, titulo: doc.titulo, hasBase64: !!doc.contenidoBase64, fileUrl: doc.fileUrl, mime: doc.mimeType });
                            setHierarchySelectedDoc(doc);
                          }}
                          height={520}
                          showLeafActions={false}
                        />
                      </div>
                      {/* Panel derecho: visor (75%) */}
                      <div style={{ flex: '1 1 75%', paddingLeft: 12 }}>
                        {hierarchySelectedDoc ? (
                          <div className={styles.stepContent}>
                            <div className={styles.stepBody}>
                              {hierarchyViewerLoading ? (
                                <p>Cargando contenido...</p>
                              ) : hierarchyViewerSrc ? (
                                hierarchyViewerMime?.includes('pdf') ? (
                                  <iframe src={hierarchyViewerSrc} title="Visor PDF" style={{ width: '100%', height: '80vh', border: 'none' }} />
                                ) : hierarchyViewerMime?.startsWith('image/') ? (
                                  <img src={hierarchyViewerSrc} alt={hierarchySelectedDoc.titulo} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                                ) : (
                                  <div>
                                    <p>Tipo no renderizable en navegador: {hierarchyViewerMime || 'desconocido'}</p>
                                    <div className="mt-2">
                                      <Button variant="primary" onClick={() => hierarchySelectedDoc && handleDownloadBase64(hierarchySelectedDoc)}>
                                        <Download size={16} /> Descargar
                                      </Button>
                                    </div>
                                  </div>
                                )
                              ) : (
                                <p>No hay contenido para mostrar.</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className={styles.emptyState}>
                            <FileText size={52} />
                            <h3>Selecciona un documento del árbol</h3>
                            <p>Haz clic en un documento para visualizar su contenido.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}>
                      {documentos.map(renderDocumentCard)}
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <FileText size={52} />
                  <h3>No hay documentos encontrados</h3>
                  <p>Usa la barra de búsqueda o crea uno nuevo.</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="primary" onClick={() => { setStepperMode('create'); setStepperInitialData(undefined); setIsDocStepperOpen(true); setShowMenu(false); }}>
                      <Plus size={16} />
                      Nuevo documento
                    </Button>
                    <Button variant="outline" onClick={() => setShowMenu(true)}>
                      <ArrowLeft size={16} />
                      Volver al menú
                    </Button>
                  </div>
                </div>
              )}
            </div>
              </>
            )}

            {/* Aside: sólo Detalles y selector (se descarta el panel de Filtros) */}
            {!isDocStepperOpen && (
            <div className={styles.sidebar}>
              <DocumentDetailPanel
                documento={selectedDoc}
                onClose={() => setSelectedDoc(null)}
              />

              <SelectorItemsModal
                open={selectorOpen}
                columns={selectorColumns}
                items={docsState}
                onCancel={() => setSelectorOpen(false)}
                onConfirm={handleSelectorSelect}
                title={selectorMode === 'edit' ? 'Editar documento' : selectorMode === 'delete' ? 'Eliminar documento' : 'Descargar documento'}
             />
              {/* Visor modal de documento en base64 */}
              <Modal
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                title={viewerDoc ? `Visor: ${viewerDoc.titulo}` : 'Visor de documento'}
                size="xl"
                hideFooter
              >
                {viewerSrc ? (
                  viewerDoc?.mimeType?.includes('pdf') ? (
                    <iframe src={viewerSrc} title="Visor PDF" style={{ width: '100%', height: '80vh', border: 'none' }} />
                  ) : viewerDoc?.mimeType?.startsWith('image/') ? (
                    <img src={viewerSrc} alt={viewerDoc?.titulo} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                  ) : (
                    <div>
                      <p>Tipo no renderizable en navegador: {viewerDoc?.mimeType || 'desconocido'}</p>
                      <div className="mt-2">
                        <Button variant="primary" onClick={() => viewerDoc && handleDownloadBase64(viewerDoc)}>
                          <Download size={16} /> Descargar
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <p>No hay contenido para mostrar.</p>
                )}
              </Modal>
              
              {/* Modal de Seguimiento de Aprobación (SOE) para Documentos */}
              <Modal
                isOpen={approvalTrackingModalOpen}
                onClose={() => {
                  setApprovalTrackingModalOpen(false);
                  setSelectedDocForApproval(null);
                }}
                title={`Seguimiento de Aprobación - ${selectedDocForApproval?.titulo || 'Documento'}`}
                size="l"
                hideFooter={true}
                className="approval-tracking-modal"
              >
                {selectedDocForApproval ? (
                  <ApprovalTracker
                    documentoId={selectedDocForApproval.id}
                    showDetailed={true}
                    onApprovalAction={handleApprovalActionForDoc}
                  />
                ) : null}
              </Modal>
            </div>
            )}
             </>
            )) : null}
           </CardContent>
        </Card>

        {/* Modales de confirmación CRUD */}
        <CRUDConfirmationModal
          isOpen={showCRUDModal}
          tipoOperacion={crudOperation}
          entidadNombre={selectedDocForCRUD?.titulo || 'documento'}
          entidadTipo="DOCUMENTO"
          datosEntidad={selectedDocForCRUD}
          onClose={handleCRUDCancel}
          onConfirm={handleCRUDConfirmation}
          onCancel={handleCRUDCancel}
          hasGobernanzaId={Boolean((selectedDocForCRUD as any)?.gobernanzaId && Number((selectedDocForCRUD as any)?.gobernanzaId) > 0)}
        />
      </div>
    </div>
    </>
  );
};

export default Documentos;
