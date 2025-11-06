// Worker para extraer texto de PDFs usando pdfjs-dist
// NOTA: Este worker no usa DOM, se ejecuta en contexto de Web Worker.

// Import pdfjs-dist for web workers
import * as pdfjsLib from 'pdfjs-dist';

console.log('[PDF Worker] Starting worker initialization');
console.log('[PDF Worker] pdfjsLib:', pdfjsLib);

// Crear un worker interno de pdf.js como módulo y asignarlo a workerPort
const pdfjsInnerWorker = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), { type: 'module' });
(pdfjsLib.GlobalWorkerOptions as any).workerPort = pdfjsInnerWorker;
console.log('[PDF Worker] GlobalWorkerOptions: workerPort set to inner pdf.js worker');

// Tipado de mensajes
interface ExtractMessage {
  type: 'extract';
  source: 'url' | 'arrayBuffer';
  data: string | ArrayBuffer;
}

interface ResultMessage {
  type: 'result';
  payload: {
    text: string;
    meta: { pages: number; characters: number; milliseconds: number };
  };
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

self.onmessage = async (event: MessageEvent<ExtractMessage>) => {
  console.log('[PDF Worker] Received message:', event.data);
  const msg = event.data;
  if (!msg || msg.type !== 'extract') return;

  const t0 = performance.now();
  console.log('[PDF Worker] Starting PDF extraction');
  try {
    console.log('[PDF Worker] Loading PDF document...');
    console.log('[PDF Worker] Data source:', msg.source);
    
    let loadingTask;
    if (msg.source === 'url' && typeof msg.data === 'string') {
      loadingTask = pdfjsLib.getDocument({ url: msg.data, useSystemFonts: true });
    } else if (msg.source === 'arrayBuffer' && msg.data instanceof ArrayBuffer) {
      loadingTask = pdfjsLib.getDocument({ data: msg.data, useSystemFonts: true });
    } else {
      throw new Error('Fuente de datos inválida para PDF');
    }
    
    console.log('[PDF Worker] Loading task created:', loadingTask);

    console.log('[PDF Worker] Waiting for PDF to load...');
    const pdf = await loadingTask.promise;
    console.log('[PDF Worker] PDF loaded successfully. Pages:', pdf.numPages);
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => ('str' in item ? item.str : '')).filter(Boolean);
      fullText += strings.join(' ') + '\n';
    }

    const t1 = performance.now();
    const result: ResultMessage = {
      type: 'result',
      payload: {
        text: fullText,
        meta: {
          pages: (await pdf.numPages) || 0,
          characters: fullText.length,
          milliseconds: Math.round(t1 - t0),
        },
      },
    };

    (self as unknown as Worker).postMessage(result);
  } catch (err: any) {
    console.error('[PDF Worker] Error extracting PDF text:', err);
    console.error('[PDF Worker] Error stack:', err?.stack || 'No stack trace');
    const error: ErrorMessage = { type: 'error', error: err?.message || 'Error en extracción de PDF' };
    (self as unknown as Worker).postMessage(error);
  }
};