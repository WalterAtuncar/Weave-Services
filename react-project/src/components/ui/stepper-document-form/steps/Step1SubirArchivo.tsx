import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle, CheckCircle, Loader2, FileText, Download, FolderTree } from 'lucide-react';
import styles from '../../stepper-system-form/StepperSystemForm.module.css';
import { DocumentFormData, DocumentFormErrors, CarpetaRef } from '../types';
import { DocumentProcessorService } from '../../../../services/vectorization';
import { Button } from '../../button/button';
import { AlertService } from '../../alerts';
import { documentoVectorialService } from '../../../../services';
import type { BusquedaVectorialDto, ResultadoBusquedaVectorial } from '../../../../services/types/documento-vectorial.types';
import * as pdfjsLib from 'pdfjs-dist';
import { FoldersTree } from '../../folders/FoldersTree';

interface Props {
  formData: DocumentFormData;
  errors: DocumentFormErrors;
  onDataChange: (data: Partial<DocumentFormData>) => void;
  onErrorChange: (errors: Partial<DocumentFormErrors>) => void;
  carpetas?: CarpetaRef[];
}

let __pdfjsWorker: Worker | null = null;
function ensurePdfjsWorker() {
  // Igual que en el visor: intentamos módulo worker y proveemos fallback para hosting.
  try {
    if (__pdfjsWorker) return;
    try {
      __pdfjsWorker = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), { type: 'module' });
      (pdfjsLib.GlobalWorkerOptions as any).workerPort = __pdfjsWorker;
      return;
    } catch (moduleErr) {
      try {
        const workerSrcUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
        (pdfjsLib.GlobalWorkerOptions as any).workerSrc = workerSrcUrl;
        (pdfjsLib.GlobalWorkerOptions as any).disableWorker = false;
        __pdfjsWorker = null;
        return;
      } catch (classicErr) {
        console.warn('Fallback a workerSrc clásico falló:', classicErr);
      }
    }
  } catch (e) {
    console.warn('No se pudo inicializar el worker de PDFJS:', e);
  }
  try {
    (pdfjsLib.GlobalWorkerOptions as any).disableWorker = true;
  } catch {}
}

// Helper: convierte contenido base64 (sin prefijo data:) en File
function base64ToFile(base64?: string | null, mime?: string | null, name?: string | null): File | null {
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
}

async function createThumbnailFromPdfFile(pdfFile: File): Promise<{ base64: string; mime: string; width: number; height: number }> {
  try {
    ensurePdfjsWorker();
    const data = await pdfFile.arrayBuffer();
    const loadingTask = (pdfjsLib as any).getDocument({ data, useSystemFonts: true });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const targetWidth = 256;
    const scale = targetWidth / viewport.width;
    const targetHeight = Math.max(1, Math.floor(viewport.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width * scale);
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto de canvas');
    await page.render({ canvasContext: ctx, viewport: page.getViewport({ scale }) }).promise;
    const dataUrl = canvas.toDataURL('image/png');
    const match = dataUrl.match(/^data:image\/png;base64,(.*)$/);
    return { base64: match ? match[1] : dataUrl, mime: 'image/png', width: canvas.width, height: canvas.height };
  } catch (e) {
    console.warn('Fallo al generar miniatura de PDF, usando placeholder:', e);
    return await createPlaceholderThumbnail(pdfFile);
  }
}

async function createPlaceholderThumbnail(file: File): Promise<{ base64: string; mime: string; width: number; height: number }> {
  const width = 256;
  const height = 180;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  // Fondo
  ctx.fillStyle = '#F4F5F7';
  ctx.fillRect(0, 0, width, height);
  // Borde
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  // Título
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 16px system-ui, -apple-system, Segoe UI, Roboto';
  const ext = (file.name.split('.').pop() || '').toUpperCase();
  const label = ext ? `.${ext}` : 'Documento';
  ctx.textAlign = 'center';
  ctx.fillText(label, Math.floor(width / 2), 40);
  // Nombre (recortado)
  ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto';
  const name = file.name.length > 28 ? file.name.slice(0, 25) + '…' : file.name;
  ctx.fillText(name, Math.floor(width / 2), 70);
  // Icono simple
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 3;
  ctx.strokeRect(70, 90, width - 140, 70);
  ctx.beginPath();
  ctx.moveTo(80, 100);
  ctx.lineTo(width - 80, 100);
  ctx.stroke();
  const dataUrl = canvas.toDataURL('image/png');
  const match = dataUrl.match(/^data:image\/png;base64,(.*)$/);
  return { base64: match ? match[1] : dataUrl, mime: 'image/png', width, height };
}

// Tipo para mostrar documentos similares enriquecidos
type SimilarDocDisplay = {
  documentoId: number | string;
  nombre: string;
  similitud: number;
  thumbBase64: string | null;
  thumbMime?: string | null;
  width?: number | null;
  height?: number | null;
  downloadPath?: string | null;
  // Nuevos campos del endpoint SQL
  contenidoBase64?: string | null;
  mimeType?: string | null;
};

const Step1SubirArchivo: React.FC<Props> = ({ formData, errors, onDataChange, onErrorChange, carpetas = [] }) => {
  // Bloqueo temporal: ocultar UI de búsqueda de similares mientras se resuelve Mongo
const SIMILAR_SEARCH_UI_ENABLED = true;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [vectorizationComplete, setVectorizationComplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [similarResults, setSimilarResults] = useState<ResultadoBusquedaVectorial[]>([]);
  const [similarDetails, setSimilarDetails] = useState<SimilarDocDisplay[]>([]);
  const [isFetchingSimilarDetails, setIsFetchingSimilarDetails] = useState(false);
  const [isHydratingFromSql, setIsHydratingFromSql] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const isPdfFile = (file: File) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

  const handleClearFile = () => {
    try {
      // Limpiar input file
      if (inputRef.current) inputRef.current.value = '';

      // Reiniciar estados locales
      setValidationMessage(null);
      setVectorizationComplete(false);
      setIsVectorizing(false);
      setIsSearching(false);
      setSimilarResults([]);
      setSimilarDetails([]);
      setIsFetchingSimilarDetails(false);

      // Limpiar errores del formulario
      onErrorChange({ archivo: undefined });

      // Limpiar formData relacionado al upload y vectorización/base64
      onDataChange({
        archivo: null,
        archivoVisualizacion: null,
        vectorizedDocument: null,
        miniaturaBase64: null,
        miniaturaMimeType: null,
        miniaturaAncho: null,
        miniaturaAlto: null,
      });
    } catch (e) {
      console.error('Error al limpiar el archivo:', e);
    }
  };

  // Edición: si viene un documento existente (formData.id) y no hay archivo/miniatura en Step1,
  // hidratar contenido usando el endpoint ligero SQL /sql/{documentoId}/base64
  useEffect(() => {
    const docId = typeof formData?.id === 'number' ? formData.id : null;
    if (!docId || docId <= 0) return;
    // Si ya hay archivo de visualización o miniatura, no re-hidratar
    if (formData.archivoVisualizacion || formData.miniaturaBase64) return;
    let mounted = true;
    (async () => {
      try {
        setIsHydratingFromSql(true);
        const resp = await documentoVectorialService.obtenerDocumentoBase64Sql({ documentoId: docId });
        const data = (resp as any)?.data;
        if (!mounted || !data) return;
        const file = base64ToFile(data.contenidoBase64 || null, data.mimeType || 'application/pdf', formData.titulo || `documento_${docId}.pdf`);
        onDataChange({
          archivo: file || null,
          archivoVisualizacion: file || null,
          miniaturaBase64: data.miniaturaBase64 ?? null,
          miniaturaMimeType: (data.miniaturaBase64 ? 'image/png' : null),
          miniaturaAncho: null,
          miniaturaAlto: null,
        });
      } catch (e) {
        console.warn('No se pudo hidratar base64 desde SQL para edición:', e);
      } finally {
        setIsHydratingFromSql(false);
      }
    })();
    return () => { mounted = false; };
  }, [formData.id]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Reset states
    setValidationMessage(null);
    setVectorizationComplete(false);
    
    if (!file) {
      onErrorChange({ archivo: undefined });
      onDataChange({ archivo: file, archivoVisualizacion: null, vectorizedDocument: null, miniaturaBase64: null, miniaturaMimeType: null, miniaturaAncho: null, miniaturaAlto: null });
      return;
    }
    // Validación: SOLO PDF
    if (!isPdfFile(file)) {
      const msg = 'Solo se permite subir archivos PDF (.pdf)';
      onErrorChange({ archivo: msg });
      setValidationMessage(null);
      return;
    }

    // Archivo PDF válido: guardamos y procesamos
    onErrorChange({ archivo: undefined });
    onDataChange({ archivo: file });

    try {
      setIsVectorizing(true);

      // Visualización y miniatura directamente del PDF
      onDataChange({ archivoVisualizacion: file });
      const thumb = await createThumbnailFromPdfFile(file);
      onDataChange({ miniaturaBase64: thumb.base64, miniaturaMimeType: thumb.mime, miniaturaAncho: thumb.width, miniaturaAlto: thumb.height });

      setValidationMessage('Procesando y vectorizando documento...');
      const documentProcessor = DocumentProcessorService.getInstance();
      const vectorizedDocument = await documentProcessor.procesarDocumentoCompleto(
        file,
        {
          nombre_documento: file.name,
          tipo_documento_id: 1,
          tags: ['pdf', 'documento'],
          tamaño_archivo: file.size,
          extension: 'pdf',
          departamento: 'General'
        },
        (progress) => {
          setValidationMessage(`${progress.message} (${progress.progress}%)`);
        }
      );

      console.log('📄 DOCUMENTO VECTORIZADO:', vectorizedDocument);
      setVectorizationComplete(true);
      setValidationMessage('✓ Documento vectorizado correctamente');
      onDataChange({ vectorizedDocument });

    } catch (error) {
      console.error('Error al procesar documento:', error);
      setValidationMessage('Error al procesar el documento');
      onDataChange({ archivoVisualizacion: null, vectorizedDocument: null });
    } finally {
      setIsVectorizing(false);
    }
  };

  const handleBuscarSimilares = async () => {
    try {
      if (!formData.vectorizedDocument) {
        AlertService.warning('Primero vectoriza el documento antes de buscar similares.');
        return;
      }

      setIsSearching(true);
      const loadingId = AlertService.loading('Buscando documentos similares...');

      const { embedding, metadata } = formData.vectorizedDocument;
      const tipoDocNumber = formData.tipo ? Number(formData.tipo) : null;

      const busqueda: BusquedaVectorialDto = {
        queryEmbedding: embedding,
        limite: 5,
        umbralSimilitud: 0.85,
        filtroTags: Array.isArray(metadata.tags) && metadata.tags.length > 0 ? metadata.tags : null,
        filtroDepartamento: metadata.departamento || null,
        filtroTipoDocumento: tipoDocNumber ?? null,
      };

      const rawResponse = await documentoVectorialService.buscarDocumentosSimilares({ busqueda });

      // Normaliza cualquier forma de respuesta (ApiResponse envolviendo data, array directo o objeto único)
      const normalizeResponse = (resp: any): { data: ResultadoBusquedaVectorial[]; message?: string } => {
        if (resp && typeof resp === 'object' && typeof resp.success === 'boolean') {
          const rawData = (resp as any).data;
          const list = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
          return { data: list, message: resp.message };
        }
        const list = Array.isArray(resp) ? resp : resp ? [resp] : [];
        return { data: list, message: undefined };
      };

      const { data: resultados } = normalizeResponse(rawResponse);
      const count = resultados.length;

      AlertService.updateLoading(
        loadingId,
        'success',
        count > 0 ? `Búsqueda completada: ${count} similares` : 'Sin documentos similares'
      );

      // Aviso no bloqueante si existe un documento idéntico (similitud 1)
      if (resultados.some(r => r.puntuacionSimilitud === 1)) {
        AlertService.warning('Existe un documento igual (similitud 1.0).');
      }

      console.log('🔎 Resultados de búsqueda vectorial:', resultados);
      setSimilarResults(resultados);
      fetchSimilarDetails(resultados);
    } catch (error) {
      console.error('Error buscando documentos similares:', error);
      AlertService.error(error instanceof Error ? error.message : 'Error desconocido al buscar similares');
    } finally {
      setIsSearching(false);
    }
  };

  // Cargar detalles de cada documento similar (get by id desde SQL Server)
  const fetchSimilarDetails = async (resultados: ResultadoBusquedaVectorial[]) => {
    setIsFetchingSimilarDetails(true);
    try {
      const details = await Promise.all(resultados.map(async (r) => {
        const docId = (r as any)?.documento?.documentoId ?? (r as any)?.documentoId ?? (r as any)?.documento?.id;
        let detalle: any = null;
        let base64Ligero: { contenidoBase64?: string | null; miniaturaBase64?: string | null } | null = null;
        try {
          if (docId != null) {
            // Usar el nuevo endpoint ligero para obtener base64
            const respB64 = await documentoVectorialService.obtenerDocumentoBase64Sql({ documentoId: docId });
            base64Ligero = respB64?.data ?? null;
          }
        } catch (e) {
          console.warn('No se pudo obtener base64 por documentoId desde SQL', docId, e);
        }

        const nombre = detalle?.nombreDocumento
          || (r as any)?.documento?.metadata?.nombreDocumento
          || (r as any)?.documento?.nombre
          || `Documento #${docId ?? ''}`;

        const thumbBase64 = base64Ligero?.miniaturaBase64 ?? detalle?.miniaturaBase64 ?? (r as any)?.documento?.miniaturaBase64 ?? null;
        const thumbMime = detalle?.miniaturaMimeType ?? (r as any)?.documento?.miniaturaMimeType ?? 'image/png';
        const width = detalle?.miniaturaAncho ?? (r as any)?.documento?.miniaturaAncho ?? 128;
        const height = detalle?.miniaturaAlto ?? (r as any)?.documento?.miniaturaAlto ?? 128;
        // Ahora tenemos el contenido Base64 directamente desde SQL
        const downloadPath = detalle?.rutaArchivo ?? (r as any)?.documento?.rutaArchivo ?? null;

        return {
          documentoId: docId,
          nombre,
          similitud: r.puntuacionSimilitud,
          thumbBase64,
          thumbMime,
          width,
          height,
          downloadPath,
          // Nuevos campos del endpoint SQL
          contenidoBase64: base64Ligero?.contenidoBase64 ?? detalle?.contenidoBase64 ?? null,
          mimeType: detalle?.mimeType ?? null,
        } as SimilarDocDisplay;
      }));

      setSimilarDetails(details);
    } catch (e) {
      console.error('Error obteniendo detalles de documentos similares', e);
      AlertService.error('No se pudo cargar detalles de documentos similares');
    } finally {
      setIsFetchingSimilarDetails(false);
    }
  };

  const resolveDownloadUrl = (path: string) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    // Asumimos que el backend sirve rutas absolutas o relativas válidas.
    return path;
  };

  const handleDownloadSimilar = (doc: SimilarDocDisplay) => {
    // Priorizar el contenido Base64 del nuevo endpoint SQL
    if (doc.contenidoBase64) {
      try {
        // Crear un blob desde el Base64
        const byteCharacters = atob(doc.contenidoBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: doc.mimeType || 'application/octet-stream' });
        
        // Crear URL temporal y descargar
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nombre || `documento_${doc.documentoId}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        AlertService.success('Descarga iniciada correctamente');
        return;
      } catch (e) {
        console.error('Error al procesar contenido Base64', e);
        AlertService.error('Error al procesar el archivo para descarga');
        return;
      }
    }

    // Fallback al método anterior si no hay contenido Base64
    if (!doc.downloadPath) {
      AlertService.warning('No hay contenido disponible para descargar.');
      return;
    }
    try {
      const url = resolveDownloadUrl(doc.downloadPath);
      if (!url) {
        AlertService.error('Ruta de descarga inválida.');
        return;
      }
      window.open(url, '_blank');
    } catch (e) {
      console.error('Error al iniciar descarga', e);
      AlertService.error('No se pudo iniciar la descarga.');
    }
  };

  const resolvePath = (node: any): string => {
    try {
      const names: string[] = [];
      let curr: any = node;
      while (curr) {
        const nm = curr.data?.nombreCarpeta ?? curr.data?.NombreCarpeta ?? curr.name;
        if (nm) names.unshift(String(nm));
        curr = curr.parent;
      }
      return names.join('/');
    } catch {
      return String(node?.name || node?.data?.nombreCarpeta || '');
    }
  };

  const handleSelectCarpeta = (id: string | number | null, ruta?: string) => {
    onDataChange({ carpetaId: id, carpetaRuta: ruta ?? null });
    if (errors?.carpetaId) onErrorChange({ carpetaId: undefined });
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepContainer}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}><UploadCloud size={20} /></div>
          <div>
            <h3 className={styles.stepTitle}>Subir Archivo</h3>
            <p className={styles.stepDescription}>Solo se permite subir archivos PDF (.pdf)</p>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            <div className={styles.fullWidth}>
              <div style={{
                border: '1px dashed var(--color-border, #d1d5db)',
                borderRadius: 12,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12
              }}>
                <UploadCloud size={28} />
                <p style={{ margin: 0 }}>Arrastra y suelta tu archivo aquí</p>
                <button className={styles.fieldSelect} onClick={handlePick}>
                  Seleccionar archivo
                </button>
                
                <input 
                  ref={inputRef} 
                  type="file" 
                  hidden 
                  accept="application/pdf,.pdf" 
                  onChange={handleChange}
                />
                
                {formData.archivo && (
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button
                      variant="destructive"
                      size="m"
                      iconName="XCircle"
                      iconPosition="left"
                      onClick={handleClearFile}
                      disabled={isVectorizing}
                      aria-label="Limpiar archivo cargado"
                    >
                      Limpiar archivo
                    </Button>
                    {SIMILAR_SEARCH_UI_ENABLED && (
                      <Button
                        variant="action"
                        size="m"
                        iconName="Search"
                        iconPosition="left"
                        onClick={handleBuscarSimilares}
                        loading={isSearching}
                        disabled={isVectorizing || !vectorizationComplete}
                        aria-label="Buscar documentos similares"
                      >
                        Buscar similares
                      </Button>
                    )}
                  </div>
                )}

                {/* Resumen persistente del archivo cargado */}
                {formData.archivo && (
                  <div style={{
                    marginTop: 12,
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--color-border, #e5e7eb)',
                    background: 'var(--color-background-secondary, #f8fafc)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <File size={18} style={{ color: 'var(--color-primary, #3b82f6)' }} />
                      <span style={{ fontWeight: 600 }}>{formData.archivo.name}</span>
                      <span style={{ color: '#6B7280' }}>
                        ({(formData.archivo.size / 1024 / 1024).toFixed(2)} MB · {formData.archivo.type || 'application/octet-stream'})
                      </span>
                      {vectorizationComplete ? (
                        <span style={{ color: 'var(--color-success-dark, #065f46)' }}>✓ Documento vectorizado correctamente</span>
                      ) : (
                        isVectorizing ? (
                          <span style={{ color: 'var(--color-info-dark, #1e40af)' }}>Procesando y vectorizando documento...</span>
                        ) : (
                          <span style={{ color: 'var(--color-success-dark, #065f46)' }}>✓ Archivo cargado</span>
                        )
                      )}
                    </div>
                  </div>
                )}
                
                {/* Sección: Documentos similares */}
                {similarDetails.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div className={styles.stepHeader}>
                      <div className={styles.stepIcon}><FileText size={20} /></div>
                      <div>
                        <h4 className={styles.stepTitle}>Documentos similares encontrados ({similarDetails.length})</h4>
                        <p className={styles.stepDescription}>Se muestran miniatura, nombre y opción de descarga</p>
                      </div>
                    </div>
                
                    {isFetchingSimilarDetails && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
                        <Loader2 size={16} className="spin" />
                        <span>Cargando detalles...</span>
                      </div>
                    )}
                
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                      {similarDetails.map((d) => {
                        const dataUrl = d.thumbBase64 ? `data:${d.thumbMime || 'image/png'};base64,${d.thumbBase64}` : null;
                        return (
                          <div key={`${d.documentoId}-${d.nombre}`} style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRadius: 8, height: 140 }}>
                              {dataUrl ? (
                                <img src={dataUrl} alt={d.nombre} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                              ) : (
                                <FileText size={48} />
                              )}
                            </div>
                            <div style={{ fontWeight: 600 }}>{d.nombre}</div>
                            <div style={{ color: '#6B7280' }}>Similitud: {(d.similitud * 100).toFixed(1)}%</div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                variant={d.contenidoBase64 || d.downloadPath ? 'secondary' : 'ghost'}
                                size="s"
                                iconName="Download"
                                iconPosition="left"
                                onClick={() => handleDownloadSimilar(d)}
                                disabled={!d.contenidoBase64 && !d.downloadPath}
                                aria-label="Descargar documento similar"
                              >
                                Descargar
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {errors.archivo && <p className={styles.fieldError}>{errors.archivo}</p>}
                
                {validationMessage && !errors.archivo && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    color: 'var(--color-success, #10b981)',
                    fontSize: '0.875rem'
                  }}>
                    <CheckCircle size={16} />
                    <span>{validationMessage}</span>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* Selección de carpeta (solo selección, sin gestión) */}
      <div className={styles.formSection}>
        <div className={styles.formGrid}>
          <div className={styles.fullWidth}>
            <div className={styles.stepHeader}>
              <div className={styles.stepIcon}><FolderTree size={20} /></div>
              <div>
                <h4 className={styles.stepTitle}>Seleccionar carpeta</h4>
                <p className={styles.stepDescription}>Elige la carpeta donde se guardará el documento.</p>
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <FoldersTree
                folders={carpetas as any}
                height={320}
                width={undefined as any}
                mode="select"
                selectedFolderId={formData.carpetaId ?? null}
                onSelectFolder={handleSelectCarpeta}
                resolvePath={resolvePath}
              />
              {errors?.carpetaId ? (
                <div className={styles.errorBox} style={{ marginTop: 8 }}>
                  {errors.carpetaId}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Información básica del archivo */}
      {formData.archivo && !errors.archivo && (
        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            <div className={styles.fullWidth}>
                <div style={{
                  backgroundColor: 'var(--color-background-secondary, #f8fafc)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  borderRadius: 8,
                  padding: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <File size={20} style={{ color: 'var(--color-primary, #3b82f6)' }} />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                      Información del Archivo
                    </h4>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                      <strong>Nombre:</strong> {formData.archivo.name}
                    </div>
                    <div>
                      <strong>Tamaño:</strong> {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div>
                      <strong>Tipo:</strong> {formData.archivo.type || 'application/octet-stream'}
                    </div>
                    <div>
                      <strong>Última modificación:</strong> {new Date(formData.archivo.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: 12, 
                    padding: 8, 
                    backgroundColor: vectorizationComplete 
                      ? 'var(--color-success-light, #ecfdf5)' 
                      : isVectorizing 
                        ? 'var(--color-info-light, #eff6ff)'
                        : 'var(--color-success-light, #ecfdf5)',
                    borderRadius: 4,
                    fontSize: '0.875rem',
                    color: vectorizationComplete 
                      ? 'var(--color-success-dark, #065f46)'
                      : isVectorizing 
                        ? 'var(--color-info-dark, #1e40af)'
                        : 'var(--color-success-dark, #065f46)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    {isVectorizing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Procesando y vectorizando documento...
                      </>
                    ) : vectorizationComplete ? (
                      <>
                        ✓ Archivo cargado y vectorizado correctamente. Revisa la consola para ver los detalles.
                      </>
                    ) : (
                      <>
                        ✓ Archivo cargado correctamente. Listo para continuar.
                      </>
                    )}
                  </div>

                  {/* Botón para buscar documentos similares (oculto temporalmente) */}
                  {formData.archivo && (
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <Button
                        variant="destructive"
                        size="m"
                        iconName="XCircle"
                        iconPosition="left"
                        onClick={handleClearFile}
                        disabled={isVectorizing}
                        aria-label="Limpiar archivo cargado"
                      >
                        Limpiar archivo
                      </Button>
                      {SIMILAR_SEARCH_UI_ENABLED && (
                        <Button
                          variant="action"
                          size="m"
                          iconName="Search"
                          iconPosition="left"
                          onClick={handleBuscarSimilares}
                          loading={isSearching}
                          disabled={isVectorizing || !vectorizationComplete}
                          aria-label="Buscar documentos similares"
                        >
                          Buscar similares
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1SubirArchivo;