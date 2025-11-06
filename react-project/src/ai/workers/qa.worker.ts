// Web Worker para análisis de texto y preguntas/respuestas (QA)
// Implementa un índice simple basado en embeddings + recuperación y QA extractivo opcional.

// Eliminamos importación estática para evitar inicialización temprana de ORT/Transformers
// import { pipeline, env, type Pipeline } from '@xenova/transformers';

// Tipado laxo para el pipeline
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pipeline = any;

// Modo liviano: sin Xenova/Transformers ni ORT; solo búsqueda por palabras clave.

// Mensajes de entrada
export type BuildIndexMessage = {
  type: 'build_index';
  id?: string;
  text: string;
  options?: {
    chunkSize?: number;
    overlap?: number;
    topK?: number;
    embeddingModel?: string; // por defecto 'Xenova/all-MiniLM-L6-v2'
    qaModel?: string; // por defecto 'Xenova/distilbert-base-cased-distilled-squad'
  };
};

export type AskMessage = {
  type: 'ask';
  id: string; // id del índice a usar
  question: string;
  topK?: number; // por defecto 3
  useExtractiveQA?: boolean; // por defecto true
};

export type ClearMessage = { type: 'clear'; id?: string };

// Mensajes de salida
export type IndexReadyMessage = {
  type: 'index_ready';
  id: string;
  stats: { chunks: number; milliseconds: number };
};

export type AnswerMessage = {
  type: 'answer';
  id: string;
  question: string;
  answer: string;
  context: Array<{ index: number; score: number; text: string }>;
  timings: { milliseconds: number };
};

export type ErrorMessage = { type: 'error'; error: string };

// Estructuras internas
// Modo del índice: solo 'simple' (sin embeddings ni modelos externos)
 type IndexMode = 'simple';

 type IndexData = {
  chunks: string[];
  embeddings: Float32Array[] | null; // null cuando estamos en modo simple
  tokens?: string[][]; // usado en modo simple
  createdAt: number;
  mode: IndexMode;
};

const indices = new Map<string, IndexData>();

// Sin modelos externos: no se requieren pipelines de embeddings ni QA.

function chunkText(text: string, size = 800, overlap = 200): string[] {
  const chunks: string[] = [];
  if (!text) return chunks;
  const len = text.length;
  let i = 0;
  while (i < len) {
    const end = Math.min(i + size, len);
    let chunk = text.slice(i, end);
    // Intenta cortar en límite de oración si es posible para mejor calidad
    if (end < len) {
      const lastDot = chunk.lastIndexOf('.');
      if (lastDot > size * 0.6) {
        chunk = chunk.slice(0, lastDot + 1);
      }
    }
    chunks.push(chunk.trim());
    if (end >= len) break;
    i = Math.max(i + 1, end - overlap);
  }
  return chunks;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/[\p{Diacritic}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(t => t.length > 2);
}

function cosineSim(a: Float32Array, b: Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

self.onmessage = async (e: MessageEvent) => {
  const { type } = e.data;
  try {
    switch (type) {
      case 'build_index': {
        const { id = crypto.randomUUID(), text, options = {} } = e.data as BuildIndexMessage;
        const { chunkSize = 800, overlap = 200 } = options;
        const start = performance.now();

        // Chunking
        const chunks = chunkText(text, chunkSize, overlap);

        // Índice simple: tokenizamos por chunk y no generamos embeddings
        const tokensByChunk = chunks.map(c => tokenize(c));
        const embeddings: Float32Array[] | null = null;
        indices.set(id, { chunks, embeddings, tokens: tokensByChunk, createdAt: Date.now(), mode: 'simple' });

        const ms = Math.round(performance.now() - start);
        self.postMessage({ type: 'index_ready', id, stats: { chunks: chunks.length, milliseconds: ms } } satisfies IndexReadyMessage);
        break;
      }
      case 'ask': {
        const { id, question, topK = 3 } = e.data as AskMessage;
        const index = indices.get(id);
        if (!index) throw new Error('Índice no encontrado');

        const start = performance.now();
        let answer = '';
        let top: Array<{ index: number; score: number; text: string }> = [];
        // Ruta SIMPLE por coincidencia de palabras clave (sin modelos)
        const qTokens = tokenize(question);
        const qSet = new Set(qTokens);
        const scored = index.chunks.map((text, i) => {
          const toks = index.tokens?.[i] ?? tokenize(text);
          let overlap = 0;
          for (const t of toks) if (qSet.has(t)) overlap++;
          const score = overlap / Math.sqrt((qTokens.length + 1) * (toks.length + 1));
          return { index: i, score, text };
        });
        scored.sort((a, b) => b.score - a.score);
        top = scored.slice(0, topK);
        answer = top[0]?.text ?? '';

        const ms = Math.round(performance.now() - start);
        self.postMessage({ type: 'answer', id, question, answer, context: top, timings: { milliseconds: ms } } satisfies AnswerMessage);
        break;
      }
      case 'clear': {
        const { id } = e.data as ClearMessage;
        if (id) indices.delete(id); else indices.clear();
        break;
      }
      default:
        throw new Error(`Tipo de mensaje no soportado: ${type}`);
    }
  } catch (error: any) {
    const msg: ErrorMessage = { type: 'error', error: error.message || String(error) };
    self.postMessage(msg);
  }
};