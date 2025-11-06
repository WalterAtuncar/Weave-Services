import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { getDocumentKind } from '../../../utils/documentFileValidator';
// Eliminado: conversión server-side. Usamos únicamente render local (base64 / docx-preview / Mammoth)

let __pdfjsWorker: Worker | null = null;
function ensurePdfjsWorker() {
  // Objetivo: funcionar en dev y hosting aunque el módulo Worker esté bloqueado por CSP.
  // Estrategia: 1) intentar módulo worker; 2) fallback a workerSrc clásico; 3) último recurso: disableWorker.
  try {
    if (__pdfjsWorker) return;
    try {
      __pdfjsWorker = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), { type: 'module' });
      (pdfjsLib.GlobalWorkerOptions as any).workerPort = __pdfjsWorker;
      return;
    } catch (moduleErr) {
      // En algunos hostings, los Module Workers están restringidos por CSP (worker-src/script-src).
      // Usamos el worker clásico como fallback.
      try {
        const workerSrcUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
        (pdfjsLib.GlobalWorkerOptions as any).workerSrc = workerSrcUrl;
        (pdfjsLib.GlobalWorkerOptions as any).disableWorker = false;
        __pdfjsWorker = null; // pdf.js gestionará el worker clásico con workerSrc.
        return;
      } catch (classicErr) {
        console.warn('Fallback a workerSrc clásico falló:', classicErr);
      }
    }
  } catch (e) {
    console.warn('No se pudo inicializar el worker de PDFJS:', e);
  }
  // Último recurso: trabajar sin worker en hilo principal para evitar bloqueos.
  try {
    (pdfjsLib.GlobalWorkerOptions as any).disableWorker = true;
  } catch {}
}

interface DocumentViewerProps {
  file?: File | null; // Archivo para visualización (PDF preferente)
  originalFile?: File | null; // Archivo original para descarga
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const DocumentViewer: React.FC<DocumentViewerProps> = ({ file, originalFile, className }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<'pdf' | 'docx' | 'doc' | 'pptx' | 'ppt' | 'xlsx' | 'xls' | 'desconocido'>('desconocido');

  // DOCX state
  const [originalDocxHtml, setOriginalDocxHtml] = useState<string>('');
  const [docxHtml, setDocxHtml] = useState<string>('');
  const [docxPreviewActive, setDocxPreviewActive] = useState<boolean>(false);

  // PDF state
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const pdfTextsRef = useRef<string[]>([]);

  // Viewer controls
  const [zoom, setZoom] = useState<number>(1);
  const [cursorMode, setCursorMode] = useState<'hand' | 'select'>('hand');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMatches, setSearchMatches] = useState<number[]>([]); // For PDF: pages indices (1-based). For DOCX: not used.
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // TTS state
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [ttsActive, setTtsActive] = useState(false);
  const [ttsPaused, setTtsPaused] = useState(false);
  const [ttsRate, setTtsRate] = useState(1);
  // Inicialización de voces TTS
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesReady, setVoicesReady] = useState(false);

  // Containers
  const pdfOuterRef = useRef<HTMLDivElement | null>(null); // scroll container for PDF
  const pdfContentRef = useRef<HTMLDivElement | null>(null); // holds canvases
  const docxOuterRef = useRef<HTMLDivElement | null>(null); // scroll container for DOCX
  const docxContentRef = useRef<HTMLDivElement | null>(null); // content container for DOCX (docx-preview)

  // Panning
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  useEffect(() => {
    setError(null);
    setDocxHtml('');
    setOriginalDocxHtml('');
    setDocxPreviewActive(false);
    setPdfTotalPages(0);
    pdfTextsRef.current = [];
    setZoom(1);
    setSearchQuery('');
    setSearchMatches([]);
    setCurrentMatchIndex(0);
    stopTTS();

    if (!file) {
      // Si no hay archivo de visualización, el tipo depende del original
      const ok = originalFile ? getDocumentKind(originalFile) : 'desconocido';
      setKind(ok);
      return;
    }

    const k = getDocumentKind(file);
    setKind(k);

    if (k === 'pdf') {
      ensurePdfjsWorker();
      renderPdf(file);
    } else if (k === 'docx') {
      renderDocx(file);
    } else if (k === 'doc') {
      // Vista para .doc (Word 97-2003) no soportada sin conversión local.
      // Mostramos mensaje y permitimos descargar el archivo original.
      setError('Vista no disponible para archivos .doc. Descarga el archivo original.');
    } else {
      setError('Formato no soportado');
    }
  }, [file, originalFile]);

  useEffect(() => {
    // Panning handlers for PDF/DOCX when cursor is "hand"
    const outer = kind === 'pdf' ? pdfOuterRef.current : kind === 'docx' ? docxOuterRef.current : null;
    if (!outer) return;
    const onMouseDown = (e: MouseEvent) => {
      if (cursorMode !== 'hand') return;
      isPanningRef.current = true;
      outer.style.cursor = 'grabbing';
      panStartRef.current = { x: e.clientX, y: e.clientY, scrollLeft: outer.scrollLeft, scrollTop: outer.scrollTop };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current || !panStartRef.current) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      outer.scrollLeft = panStartRef.current.scrollLeft - dx;
      outer.scrollTop = panStartRef.current.scrollTop - dy;
    };
    const endPan = () => {
      isPanningRef.current = false;
      outer.style.cursor = cursorMode === 'hand' ? 'grab' : 'auto';
    };
    outer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endPan);
    outer.addEventListener('mouseleave', endPan);
    return () => {
      outer.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endPan);
      outer.removeEventListener('mouseleave', endPan);
    };
  }, [cursorMode, kind]);

  // --- NUEVO: Mantener el mismo contenedor para DOCX y aplicar HTML cuando se use Mammoth ---
  useEffect(() => {
    if (kind === 'docx' && !docxPreviewActive && docxContentRef.current) {
      docxContentRef.current.innerHTML = docxHtml || '';
    }
  }, [docxHtml, kind, docxPreviewActive]);

  async function renderPdf(f: File) {
    try {
      setLoading(true);
      const data = await f.arrayBuffer();
      const loadingTask = (pdfjsLib as any).getDocument({ data, useSystemFonts: true });
      const pdf = await loadingTask.promise;
      const content = pdfContentRef.current;
      const outer = pdfOuterRef.current;
      if (!content || !outer) return;
      content.innerHTML = '';
      setPdfTotalPages(pdf.numPages);

      const renderScale = 1.0; // base scale; zoom applies via CSS transform
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        canvas.style.margin = '0 auto 16px auto';
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        content.appendChild(canvas);
        // Extract text for search/TTS
        try {
          const text = await page.getTextContent();
          const pageText = text.items.map((t: any) => t.str).join(' ');
          pdfTextsRef.current[pageNum - 1] = pageText;
        } catch (ex) {
          pdfTextsRef.current[pageNum - 1] = '';
        }
      }
    } catch (e: any) {
      console.error('Error al visualizar PDF:', e);
      setError(e?.message || 'No se pudo visualizar el PDF');
    } finally {
      setLoading(false);
    }
  }

  // Nuevo: renderizar PDF desde ArrayBuffer (resultado del servidor)
  async function renderPdfBuffer(data: ArrayBuffer) {
    try {
      setLoading(true);
      const loadingTask = (pdfjsLib as any).getDocument({ data, useSystemFonts: true });
      const pdf = await loadingTask.promise;
      const content = pdfContentRef.current;
      const outer = pdfOuterRef.current;
      if (!content || !outer) return;
      content.innerHTML = '';
      setPdfTotalPages(pdf.numPages);
      const renderScale = 1.0;
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        canvas.style.margin = '0 auto 16px auto';
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        content.appendChild(canvas);
        try {
          const text = await page.getTextContent();
          const pageText = text.items.map((t: any) => t.str).join(' ');
          pdfTextsRef.current[pageNum - 1] = pageText;
        } catch {
          pdfTextsRef.current[pageNum - 1] = '';
        }
      }
    } catch (e: any) {
      console.error('Error al visualizar PDF convertido:', e);
      setError(e?.message || 'No se pudo visualizar el PDF convertido');
    } finally {
      setLoading(false);
    }
  }

  async function renderDocx(f: File) {
    try {
      setLoading(true);
      const arrayBuffer = await f.arrayBuffer();
      const content = docxContentRef.current;
      if (!content) return;
      content.innerHTML = '';
      // Intento 1: usar docx-preview para mayor fidelidad
      let previewOk = false;
      try {
        const docxPreview: any = await import('docx-preview');
        await docxPreview.renderAsync(arrayBuffer, content, undefined, {
          className: 'docx-preview',
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: false,
          inWrapper: true
        });
        // Verificar si realmente produjo contenido visible
        const textLen = (content.textContent || '').trim().length;
        const hasVisuals = !!content.querySelector('img, canvas, svg, .docx');
        const isEmpty = textLen === 0 && !hasVisuals;
        if (!isEmpty) {
          setDocxPreviewActive(true);
          setOriginalDocxHtml(content.innerHTML || '');
          setDocxHtml(content.innerHTML || '');
          previewOk = true;
        } else {
          console.warn('docx-preview produjo salida vacía; se intentará conversión server-side');
          content.innerHTML = '';
          setDocxPreviewActive(false);
        }
      } catch (e) {
        console.warn('docx-preview no disponible o falló, se intentará conversión server-side:', e);
      }
      if (previewOk) return; // éxito con docx-preview

      // Fallback: Mammoth a HTML (simplificado) con imágenes inline (sin servidor)
      try {
        const mammothMod: any = await import('mammoth/mammoth.browser');
        const result = await mammothMod.convertToHtml(
          { arrayBuffer },
          { convertImage: mammothMod.images.inline(), includeDefaultStyleMap: true }
        );
        let html = result?.value || '';
        if (!html || html.trim() === '') {
          html = '<p>(No se pudo extraer contenido del DOCX)</p>';
        }
        setOriginalDocxHtml(html);
        setDocxHtml(html);
        setDocxPreviewActive(false);
      } catch (e) {
        console.error('Mammoth falló al convertir DOCX:', e);
        setDocxPreviewActive(false);
        setOriginalDocxHtml('<p>(Error al convertir DOCX)</p>');
        setDocxHtml('<p>(Error al convertir DOCX)</p>');
      }
    } catch (e: any) {
      console.error('Error al visualizar DOCX:', e);
      setError(e?.message || 'No se pudo visualizar el DOCX');
    } finally {
      setLoading(false);
    }
  }

  // Eliminado: conversión y renderizado de PDF desde servidor.

  const handleDownload = () => {
    const f = originalFile || file;
    if (f) {
      try {
        saveAs(f, f.name);
      } catch (e) {
        console.warn('Fallo la descarga directa del archivo:', e);
      }
    }
  };

  // Zoom controls (apply via CSS transform)
  const zoomIn = () => setZoom((z) => clamp(z + 0.1, 0.5, 3));
  const zoomOut = () => setZoom((z) => clamp(z - 0.1, 0.5, 3));
  const resetZoom = () => setZoom(1);

  // Navigation (PDF only): scroll to page
  const goToPage = (n: number) => {
    if (kind !== 'pdf' || !pdfOuterRef.current || !pdfContentRef.current) return;
    const canvases = pdfContentRef.current.querySelectorAll('canvas');
    const idx = clamp(n, 1, canvases.length) - 1;
    const target = canvases[idx] as HTMLCanvasElement | undefined;
    if (target) {
      const top = target.offsetTop - 8;
      pdfOuterRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  };
  const goFirst = () => goToPage(1);
  const goLast = () => goToPage(pdfTotalPages);
  const goPrev = () => {
    if (kind !== 'pdf' || !pdfOuterRef.current || !pdfContentRef.current) return;
    const cur = getCurrentPdfPage();
    goToPage(cur - 1);
  };
  const goNext = () => {
    if (kind !== 'pdf') return;
    const cur = getCurrentPdfPage();
    goToPage(cur + 1);
  };
  const getCurrentPdfPage = (): number => {
    if (!pdfOuterRef.current || !pdfContentRef.current) return 1;
    const canvases = Array.from(pdfContentRef.current.querySelectorAll('canvas')) as HTMLCanvasElement[];
    const scrollTop = pdfOuterRef.current.scrollTop;
    let closest = 1;
    let minDist = Number.MAX_VALUE;
    canvases.forEach((c, i) => {
      const dist = Math.abs(c.offsetTop - scrollTop);
      if (dist < minDist) {
        minDist = dist;
        closest = i + 1;
      }
    });
    return closest;
  };

  // Search
  useEffect(() => {
    if (!searchQuery) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      // Reset DOCX highlighting solo si se usa Mammoth
      if (kind === 'docx' && !docxPreviewActive) setDocxHtml(originalDocxHtml);
      return;
    }
    if (kind === 'pdf') {
      const q = searchQuery.toLowerCase();
      const matches: number[] = [];
      for (let i = 0; i < pdfTextsRef.current.length; i++) {
        const pageText = (pdfTextsRef.current[i] || '').toLowerCase();
        if (pageText.includes(q)) matches.push(i + 1);
      }
      setSearchMatches(matches);
      setCurrentMatchIndex(0);
      if (matches.length) goToPage(matches[0]);
    } else if (kind === 'docx') {
      // Si se usa docx-preview, no manipulamos el HTML (evita romper estilos);
      // se ofrece búsqueda básica sin resaltado.
      if (!docxPreviewActive) {
        const html = highlightOccurrences(originalDocxHtml, searchQuery);
        setDocxHtml(html);
      }
    }
  }, [searchQuery, kind, originalDocxHtml, docxPreviewActive]);

  function highlightOccurrences(html: string, query: string): string {
    try {
      const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${esc})`, 'gi');
      return html.replace(regex, '<mark>$1</mark>');
    } catch {
      return html;
    }
  }

  const nextMatch = () => {
    if (kind !== 'pdf') return;
    if (!searchMatches.length) return;
    const idx = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(idx);
    goToPage(searchMatches[idx]);
  };
  const prevMatch = () => {
    if (kind !== 'pdf') return;
    if (!searchMatches.length) return;
    const idx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(idx);
    goToPage(searchMatches[idx]);
  };

  // TTS
  // Cargar voces de SpeechSynthesis y marcar disponibilidad
  useEffect(() => {
    try {
      const synth = window.speechSynthesis;
      const loadVoices = () => {
        const v = synth.getVoices();
        setVoices(v);
        setVoicesReady(!!v && v.length > 0);
      };
      // Intento inmediato
      loadVoices();
      // Suscripción al evento de voces cargadas
      synth.addEventListener?.('voiceschanged', loadVoices);
      // Fallback para navegadores que usan onvoiceschanged
      (synth as any).onvoiceschanged = loadVoices;
      return () => {
        try {
          synth.removeEventListener?.('voiceschanged', loadVoices);
          (synth as any).onvoiceschanged = null;
        } catch {}
      };
    } catch {}
  }, []);

  // Selección de voz preferida (español si disponible)
  const preferredVoice = useMemo(() => {
    if (!voices || voices.length === 0) return null;
    const byLangEs = voices.find((v) => (v.lang || '').toLowerCase().startsWith('es'));
    if (byLangEs) return byLangEs;
    const byNameEs = voices.find((v) => /spanish|español/i.test(v.name));
    if (byNameEs) return byNameEs;
    return voices[0] || null;
  }, [voices]);

  const getDocxPlainText = useMemo(() => {
    if (docxPreviewActive && docxContentRef.current) {
      return docxContentRef.current.textContent || '';
    }
    const div = document.createElement('div');
    div.innerHTML = originalDocxHtml;
    return div.textContent || '';
  }, [originalDocxHtml, docxPreviewActive]);

  const getCurrentPdfText = () => {
    const page = getCurrentPdfPage();
    return pdfTextsRef.current[page - 1] || '';
  };

  // Espera activa de voces (algunos navegadores cargan voces de forma asíncrona)
  const waitForVoices = async (timeoutMs = 2000): Promise<SpeechSynthesisVoice[] | null> => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return null;
      const start = Date.now();
      let list = synth.getVoices();
      if (list && list.length) return list;
      return await new Promise((resolve) => {
        const iv = window.setInterval(() => {
          list = synth.getVoices();
          const expired = Date.now() - start > timeoutMs;
          if ((list && list.length) || expired) {
            window.clearInterval(iv);
            resolve(list || []);
          }
        }, 150);
      });
    } catch {
      return null;
    }
  };

  const startTTS = async () => {
    try {
      const synth = window.speechSynthesis;
      if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
        setError('Tu navegador no soporta lectura en voz alta.');
        return;
      }
      const text = kind === 'docx' ? getDocxPlainText : getCurrentPdfText();
      const txt = (text || '').trim();
      if (!txt) {
        setError('No hay texto disponible para leer en esta página.');
        return;
      }
      // Asegurar voces cargadas antes de hablar
      if (!voicesReady) {
        await waitForVoices(2000);
      }
      const currentVoices = window.speechSynthesis.getVoices();
      const voice = preferredVoice || currentVoices?.find((v) => (v.lang || '').toLowerCase().startsWith('es')) || currentVoices?.[0] || null;

      const utterance = new SpeechSynthesisUtterance(txt);
      utterance.rate = clamp(ttsRate, 0.5, 2);
      utterance.lang = (voice?.lang) || 'es-ES';
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        setTtsActive(true);
        setTtsPaused(false);
      };
      utterance.onend = () => {
        setTtsActive(false);
        setTtsPaused(false);
        utteranceRef.current = null;
      };
      utterance.onerror = (ev: any) => {
        console.warn('Error TTS:', ev?.error);
        setTtsActive(false);
        setTtsPaused(false);
        setError('Ocurrió un problema al iniciar la lectura.');
        utteranceRef.current = null;
      };
      utteranceRef.current = utterance;
      try { synth.cancel(); } catch {}
      // Hack para Safari/iOS: reanudar si el motor se queda en pausa
      try { synth.resume(); } catch {}
      synth.speak(utterance);
      // Mantener reanudación activa un corto periodo para navegadores que pausan automáticamente
      const resumeUntilStart = window.setInterval(() => {
        try {
          if (synth.paused && ttsActive) synth.resume();
          if (!synth.speaking) {
            window.clearInterval(resumeUntilStart);
          }
        } catch {
          window.clearInterval(resumeUntilStart);
        }
      }, 250);
    } catch (e) {
      console.warn('TTS no disponible:', e);
      setError('No fue posible iniciar la lectura en voz alta.');
    }
  };
  const pauseTTS = () => {
    try {
      window.speechSynthesis.pause();
      setTtsPaused(true);
    } catch {}
  };
  const resumeTTS = () => {
    try {
      window.speechSynthesis.resume();
      setTtsPaused(false);
    } catch {}
  };
  const stopTTS = () => {
    try {
      window.speechSynthesis.cancel();
      setTtsActive(false);
      setTtsPaused(false);
      utteranceRef.current = null;
    } catch {}
  };

  const hasViewer = file && (kind === 'pdf' || kind === 'docx');
  const displayName = (originalFile && originalFile.name) || (file && file.name) || '';
  const originalKind = originalFile ? getDocumentKind(originalFile) : 'desconocido';

  return (
    <div className={className || ''} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Vista del documento</strong>
          {displayName && <span style={{ marginLeft: 8, color: '#64748b' }}>{displayName}</span>}
        </div>
        {(originalFile || file) && (
          <button
            type="button"
            onClick={handleDownload}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Descargar
          </button>
        )}
      </div>

      {/* Toolbar */}
      {hasViewer && (
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          padding: 8, border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 8,
          background: 'var(--color-background-secondary, #f8fafc)'
        }}>
          {/* Zoom */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Zoom</span>
            <button onClick={zoomOut} title="Alejar" style={{ padding: '6px 10px' }}>-</button>
            <button onClick={zoomIn} title="Acercar" style={{ padding: '6px 10px' }}>+</button>
            <button onClick={resetZoom} title="Reset" style={{ padding: '6px 10px' }}>100%</button>
          </div>

          {/* Cursor mode */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Cursor</span>
            <button
              onClick={() => setCursorMode('hand')}
              title="Modo mano"
              style={{ padding: '6px 10px', background: cursorMode === 'hand' ? '#e2e8f0' : undefined }}
            >
              🖐️
            </button>
            <button
              onClick={() => setCursorMode('select')}
              title="Seleccionar"
              style={{ padding: '6px 10px', background: cursorMode === 'select' ? '#e2e8f0' : undefined }}
            >
              I
            </button>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
            <span style={{ color: '#64748b' }}>Buscar</span>
            <input
              type="text"
              placeholder="Texto a buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '6px 10px' }}
            />
            {kind === 'pdf' && (
              <>
                <button onClick={prevMatch} title="Anterior" style={{ padding: '6px 10px' }}>◀</button>
                <button onClick={nextMatch} title="Siguiente" style={{ padding: '6px 10px' }}>▶</button>
              </>
            )}
          </div>

          {/* TTS */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Leer</span>
            {!ttsActive ? (
              <button onClick={startTTS} title="Leer" style={{ padding: '6px 10px' }}>►</button>
            ) : !ttsPaused ? (
              <button onClick={pauseTTS} title="Pausar" style={{ padding: '6px 10px' }}>⏸</button>
            ) : (
              <button onClick={resumeTTS} title="Continuar" style={{ padding: '6px 10px' }}>⏵</button>
            )}
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={ttsRate}
              onChange={(e) => setTtsRate(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {loading && (
        <div style={{ padding: 16, color: 'var(--color-info-dark, #1e40af)' }}>Cargando visor...</div>
      )}

      {error && (
        <div style={{ padding: 16, color: 'var(--color-danger, #ef4444)' }}>{error}</div>
      )}

      {!loading && !error && (
        hasViewer ? (
          kind === 'pdf' ? (
            <div
              ref={pdfOuterRef}
              style={{
                background: 'var(--color-background-secondary, #f8fafc)',
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--color-border, #e2e8f0)',
                overflow: 'auto',
                maxHeight: 600,
                cursor: cursorMode === 'hand' ? 'grab' : 'auto',
                userSelect: cursorMode === 'hand' ? 'none' as any : 'auto'
              }}
            >
              <div
                ref={pdfContentRef}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              />
            </div>
          ) : (
            <div
              ref={docxOuterRef}
              style={{
                background: '#ffffff',
                padding: 16,
                borderRadius: 8,
                border: '1px solid var(--color-border, #e2e8f0)',
                overflow: 'auto',
                maxHeight: 600,
                cursor: cursorMode === 'hand' ? 'grab' : 'auto',
                userSelect: cursorMode === 'hand' ? 'none' as any : 'auto'
              }}
            >
              {/* Unificar contenedor: evitar reemplazo del nodo al alternar entre docx-preview y Mammoth */}
              <div
                ref={docxContentRef}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              />
            </div>
          )
        ) : (
          <div style={{ padding: 16, color: '#64748b' }}>
            {originalKind === 'xlsx' || originalKind === 'xls'
              ? 'No hay vista disponible para archivos Excel. Puedes descargar el archivo original.'
              : 'No hay vista disponible. Sube un PDF válido o conviértelo en el paso 1.'}
          </div>
        )
      )}
    </div>
  );
};

export default DocumentViewer;