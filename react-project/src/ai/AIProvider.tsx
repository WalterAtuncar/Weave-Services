import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// Tipo del resultado de extracción de PDF
export type PdfExtractionResult = {
  text: string;
  meta: {
    pages: number;
    characters: number;
    milliseconds: number;
  };
};

export type AIContextValue = {
  // Estado general
  isBusy: boolean;
  lastError: string | null;

  // Acciones
  extractPdfText: (
    input: File | Blob | ArrayBuffer | string
  ) => Promise<PdfExtractionResult>;

  // QA
  buildIndex: (text: string, options?: { chunkSize?: number; overlap?: number }) => Promise<{ id: string; chunks: number; milliseconds: number }>;
  ask: (id: string, question: string, options?: { topK?: number; useExtractiveQA?: boolean }) => Promise<{ answer: string; context: Array<{ index: number; score: number; text: string }>; milliseconds: number }>;
};

const AIContext = createContext<AIContextValue | null>(null);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const workerRef = useRef<Worker | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Worker para extracción PDF
  const getWorker = () => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('./workers/pdfText.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  };

  const extractPdfText = useCallback(async (input: File | Blob | ArrayBuffer | string) => {
    setLastError(null);
    setIsBusy(true);
    const t0 = performance.now();

    const worker = getWorker();
    const payload: any = { type: 'extract' };

    try {
      if (typeof input === 'string') {
        payload.source = 'url';
        payload.data = input;
      } else if (input instanceof ArrayBuffer) {
        payload.source = 'arrayBuffer';
        payload.data = input;
      } else {
        // File o Blob
        const buf = await input.arrayBuffer();
        payload.source = 'arrayBuffer';
        payload.data = buf;
      }

      const result = await new Promise<PdfExtractionResult>((resolve, reject) => {
        const handleMessage = (evt: MessageEvent) => {
          const msg = evt.data;
          if (msg?.type === 'result') {
            worker.removeEventListener('message', handleMessage);
            resolve(msg.payload as PdfExtractionResult);
          } else if (msg?.type === 'error') {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(msg.error || 'Worker error'));
          }
        };

        worker.addEventListener('message', handleMessage);
        // Transferir ArrayBuffer si aplica
        if (payload.source === 'arrayBuffer' && payload.data instanceof ArrayBuffer) {
          worker.postMessage(payload, [payload.data]);
        } else {
          worker.postMessage(payload);
        }
      });

      const t1 = performance.now();
      // Asegurar meta.milliseconds si no vino del worker
      const finalResult: PdfExtractionResult = {
        text: result.text,
        meta: {
          milliseconds: result.meta?.milliseconds ?? Math.round(t1 - t0),
          pages: result.meta?.pages ?? 0,
          characters: result.meta?.characters ?? result.text.length,
        },
      };
      return finalResult;
    } catch (err: any) {
      const message = err?.message || 'Error extrayendo texto del PDF';
      setLastError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, []);

  // ===== QA Worker =====
  const qaWorkerRef = useRef<Worker | null>(null);
  const getQaWorker = () => {
    if (!qaWorkerRef.current) {
      qaWorkerRef.current = new Worker(
        new URL('./workers/qa.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return qaWorkerRef.current;
  };

  const buildIndex = useCallback(async (text: string, options?: { chunkSize?: number; overlap?: number }) => {
    setLastError(null);
    const worker = getQaWorker();
    const payload = { type: 'build_index', text, options } as const;

    const res = await new Promise<{ id: string; chunks: number; milliseconds: number }>((resolve, reject) => {
      const handleMessage = (evt: MessageEvent) => {
        const msg = evt.data;
        if (msg?.type === 'index_ready') {
          worker.removeEventListener('message', handleMessage);
          resolve({ id: msg.id, chunks: msg.stats?.chunks ?? 0, milliseconds: msg.stats?.milliseconds ?? 0 });
        } else if (msg?.type === 'error') {
          worker.removeEventListener('message', handleMessage);
          reject(new Error(msg.error || 'QA worker error'));
        }
      };
      worker.addEventListener('message', handleMessage);
      worker.postMessage(payload);
    });

    return res;
  }, []);

  const ask = useCallback(async (id: string, question: string, options?: { topK?: number; useExtractiveQA?: boolean }) => {
    setLastError(null);
    const worker = getQaWorker();
    const payload = { type: 'ask', id, question, topK: options?.topK, useExtractiveQA: options?.useExtractiveQA } as const;

    const res = await new Promise<{ answer: string; context: Array<{ index: number; score: number; text: string }>; milliseconds: number }>((resolve, reject) => {
      const handleMessage = (evt: MessageEvent) => {
        const msg = evt.data;
        if (msg?.type === 'answer') {
          worker.removeEventListener('message', handleMessage);
          resolve({ answer: msg.answer as string, context: (msg.context ?? []) as any, milliseconds: msg.timings?.milliseconds ?? 0 });
        } else if (msg?.type === 'error') {
          worker.removeEventListener('message', handleMessage);
          reject(new Error(msg.error || 'QA worker error'));
        }
      };
      worker.addEventListener('message', handleMessage);
      worker.postMessage(payload);
    });

    return res;
  }, []);

  const value = useMemo<AIContextValue>(() => ({
    isBusy,
    lastError,
    extractPdfText,
    buildIndex,
    ask,
  }), [isBusy, lastError, extractPdfText, buildIndex, ask]);

  return (
    <AIContext.Provider value={value}>{children}</AIContext.Provider>
  );
};

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI debe usarse dentro de <AIProvider>');
  return ctx;
};