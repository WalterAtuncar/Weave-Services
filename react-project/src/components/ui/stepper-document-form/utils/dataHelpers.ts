import { DocumentFormData } from '../types';
import type { DocumentoVectorial as DocumentoVectorizado } from '../../../../services/vectorization/types';
import type { CreateDocumentoVectorialDto } from '../../../../services/types/documento-vectorial.types';

// Helper: convertir File a base64 (retorna sólo el contenido base64 sin el prefijo data:)
const fileToBase64 = (file: File): Promise<{ base64: string; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const match = dataUrl.match(/^data:[^;]+;base64,(.*)$/);
      resolve({ base64: match ? match[1] : dataUrl, dataUrl });
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// Mapea el documento vectorizado (snake_case) al DTO del backend (camelCase)
const mapVectorizedToCreateDto = (doc?: DocumentoVectorizado | null): CreateDocumentoVectorialDto | null => {
  if (!doc) return null;
  return {
    documentoId: doc.documento_id,
    contenidoTexto: doc.contenido_texto,
    embedding: doc.embedding || [],
    metadata: {
      nombreDocumento: doc.metadata?.nombre_documento || '',
      tipoDocumentoId: doc.metadata?.tipo_documento_id || 0,
      fechaCreacion: doc.metadata?.fecha_creacion || new Date().toISOString(),
      tags: Array.isArray(doc.metadata?.tags) ? doc.metadata.tags : [],
      tamañoArchivo: doc.metadata?.tamaño_archivo || 0,
      extension: doc.metadata?.extension || '',
      departamento: doc.metadata?.departamento ?? null,
    },
    chunks: Array.isArray(doc.chunks)
      ? doc.chunks.map(c => ({
          numeroChunk: c.numero_chunk,
          contenido: c.contenido,
          embeddingChunk: c.embedding_chunk || [],
          posicionInicio: c.posicion_inicio,
          posicionFin: c.posicion_fin,
        }))
      : [],
    modeloEmbedding: doc.modelo_embedding,
    dimensiones: doc.dimensiones,
    hashContenido: doc.hash_contenido,
  };
};

// Construye vista previa en snake_case para Mongo (idéntica al modelo requerido)
const buildMongoPreview = (doc?: DocumentoVectorizado | null, overrides?: { titulo?: string; tipoId?: number }): any | null => {
  if (!doc) return null;
  return {
    // _id lo asigna MongoDB al insertar; aquí no se incluye
    documento_id: doc.documento_id,
    contenido_texto: doc.contenido_texto,
    embedding: Array.isArray(doc.embedding) ? doc.embedding : [],
    metadata: {
      nombre_documento: overrides?.titulo ?? doc.metadata?.nombre_documento ?? '',
      tipo_documento_id: overrides?.tipoId ?? doc.metadata?.tipo_documento_id ?? 0,
      fecha_creacion: doc.metadata?.fecha_creacion ?? new Date().toISOString(),
      tags: Array.isArray(doc.metadata?.tags) ? doc.metadata.tags : [],
      tamaño_archivo: doc.metadata?.tamaño_archivo ?? 0,
      extension: doc.metadata?.extension ?? '',
      departamento: doc.metadata?.departamento ?? 'General'
    },
    chunks: Array.isArray(doc.chunks) ? doc.chunks.map(c => ({
      numero_chunk: c.numero_chunk,
      contenido: c.contenido,
      embedding_chunk: Array.isArray(c.embedding_chunk) ? c.embedding_chunk : [],
      posicion_inicio: c.posicion_inicio,
      posicion_fin: c.posicion_fin
    })) : [],
    modelo_embedding: doc.modelo_embedding,
    dimensiones: doc.dimensiones,
    hash_contenido: doc.hash_contenido,
    fecha_vectorizacion: doc.fecha_vectorizacion,
    version: doc.version,
    estado: doc.estado
  };
};

// Mapeo provisional de tipo (string del formulario) a ID numérico (backend)
const mapTipoDocumentoStringToId = (tipo?: string): number => {
  if (!tipo) return 0;
  const normalized = tipo
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '');
  switch (normalized) {
    case 'manual': return 1;
    case 'politica': return 2; // "política" sin acento
    case 'procedimiento': return 3;
    case 'instructivo': return 4;
    default: return 0;
  }
};

export const initializeFormData = (): DocumentFormData => ({
  archivo: null,
  archivoVisualizacion: null,
  titulo: '',
  objetivo: '',
  tipo: undefined,
  procesoId: undefined,
  procesosIds: [],
  estado: -4, // Borrador por defecto, si aplica similar a sistemas
  vectorizedDocument: null,
  miniaturaBase64: null,
  miniaturaMimeType: null,
  miniaturaAncho: null,
  miniaturaAlto: null,
  entidadesRelacionadas: {},
  // NUEVO: carpeta seleccionada
  carpetaId: null,
  carpetaRuta: null,
});

export const transformFormDataForSubmission = async (data: DocumentFormData, saveType?: 'draft' | 'approval') => {
  // Preparar DTO para API (camelCase)
  const tipoIdFromUI = mapTipoDocumentoStringToId(data.tipo);
  const documentoVectorialDto = mapVectorizedToCreateDto(data.vectorizedDocument);
  // Resolver tipoDocumentoId priorizando el valor proveniente del documento vectorizado (response)
  const resolvedTipoId = (() => {
    const fromVector = documentoVectorialDto?.metadata?.tipoDocumentoId;
    if (typeof fromVector === 'number' && fromVector > 0) return fromVector;
    return tipoIdFromUI;
  })();

  if (documentoVectorialDto) {
    if (data.titulo && data.titulo.trim()) {
      documentoVectorialDto.metadata.nombreDocumento = data.titulo.trim();
    }
    // Solo sobreescribir si UI aporta un id válido y el doc no lo trae
    if ((documentoVectorialDto.metadata.tipoDocumentoId ?? 0) <= 0 && resolvedTipoId > 0) {
      documentoVectorialDto.metadata.tipoDocumentoId = resolvedTipoId;
    }
  }

  // Convertir archivo a base64 para SQL (RutaArchivo)
  let rutaArchivoBase64: string | null = null;
  let nombreArchivoOriginal: string | null = null;
  let tamanoArchivo: number | null = null;
  // Preferimos siempre el archivo original (archivo)
  const originalFile = data.archivo instanceof File ? data.archivo : undefined;
  if (originalFile) {
    try {
      const { base64 } = await fileToBase64(originalFile);
      rutaArchivoBase64 = base64;
      nombreArchivoOriginal = originalFile.name || null;
      tamanoArchivo = typeof originalFile.size === 'number' ? originalFile.size : null;
    } catch (e) {
      console.warn('No se pudo convertir el archivo a base64:', e);
    }
  } else if (data.vectorizedDocument) {
    // Fallback: usar metadata del documento vectorizado
    nombreArchivoOriginal = data.vectorizedDocument.metadata?.nombre_documento ?? null;
    tamanoArchivo = data.vectorizedDocument.metadata?.tamaño_archivo ?? null;
  }

  // Vista previa en snake_case para Mongo
  const documentoVectorialMongo = buildMongoPreview(data.vectorizedDocument, {
    titulo: data.titulo?.trim() || undefined,
    tipoId: resolvedTipoId > 0 ? resolvedTipoId : undefined
  });

  // Determinar estado según saveType: -4 para borrador, -3 para aprobación
  const estado = saveType === 'approval' ? -3 : -4;

  // Construir EntidadesAsociadas agrupadas por tipoEntidadId para el backend
  const entidadesAsociadas: Array<{ TipoEntidadId: number; EntidadesId: number[] }> = [];
  if (data.entidadesRelacionadas && typeof data.entidadesRelacionadas === 'object') {
    Object.entries(data.entidadesRelacionadas).forEach(([tipoId, ids]) => {
      const tipoNum = parseInt(String(tipoId), 10);
      if (isNaN(tipoNum)) return;
      const idsNumericos: number[] = [];
      if (Array.isArray(ids)) {
        ids.forEach(id => {
          const numericId = parseInt(String(id), 10);
          if (!isNaN(numericId)) idsNumericos.push(numericId);
        });
      }
      if (idsNumericos.length > 0) {
        entidadesAsociadas.push({ TipoEntidadId: tipoNum, EntidadesId: idsNumericos });
      }
    });
  }

  return {
    titulo: data.titulo?.trim(),
    objetivo: data.objetivo?.trim(),
    tipo: data.tipo,
    procesoId: data.procesoId,
    procesosIds: Array.isArray(data.procesosIds) ? data.procesosIds : [],
    entidadesRelacionadas: data.entidadesRelacionadas || {},
    hasFile: !!data.archivo,
    documentoVectorialDto,
    documentoVectorialMongo, // sólo vista previa para ver que coincide con el modelo requerido
    // Objeto de negocio (SQL) con los campos exactos requeridos
    documentoDb: {
      NombreDocumento: (data.titulo || '').trim(),
      DescripcionDocumento: (data.objetivo || '').trim(),
      RutaArchivo: rutaArchivoBase64, // base64 puro
      // Usar el tipoDocumentoId proveniente del documento vectorizado si está disponible; fallback al mapeo de UI
      TipoDocumentoId: resolvedTipoId,
      NombreArchivoOriginal: nombreArchivoOriginal,
      TamanoArchivo: tamanoArchivo,
      MiniaturaBase64: data.miniaturaBase64 ?? null,
      MiniaturaMimeType: data.miniaturaMimeType ?? null,
      MiniaturaAncho: data.miniaturaAncho ?? null,
      MiniaturaAlto: data.miniaturaAlto ?? null,
      CarpetaId: data.carpetaId ?? null,
      // PROPIEDADES ADICIONALES PARA LA GESTIÓN
      Estado: estado, // -4 para borrador, -3 para aprobación
      GobiernoId: data.gobernanzaId ? parseInt(String(data.gobernanzaId), 10) : null,
      EntidadesAsociadas: entidadesAsociadas,
    },
  };
};