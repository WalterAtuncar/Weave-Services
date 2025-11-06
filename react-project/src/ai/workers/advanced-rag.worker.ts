// Advanced RAG Worker - Implementación robusta con múltiples modelos, caché y optimizaciones
// Basado en las mejores prácticas de la documentación RAG

// Modo keyword-only: sin dependencias externas de ML (sin Transformers ni ORT)

// Tipado laxo para pipelines
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pipeline = any;

// Sin carga de Transformers; función no-op para mantener compatibilidad de llamadas
let ensureTfPromise: Promise<void> | null = null;
async function ensureTransformers(): Promise<void> {
  if (ensureTfPromise) return ensureTfPromise;
  ensureTfPromise = Promise.resolve();
  return ensureTfPromise;
}

// Configuración de modelos en modo keyword-only (sin modelos externos)
const MODEL_CONFIGS = {
  embeddings: {
    'fast': { model: 'none', size: 'none', speed: 'none' },
    'balanced': { model: 'none', size: 'none', speed: 'none' },
    'multilingual': { model: 'none', size: 'none', speed: 'none' },
    'quality': { model: 'none', size: 'none', speed: 'none' }
  },
  qa: {
    'fast': { model: 'none', size: 'none' },
    'balanced': { model: 'none', size: 'none' },
    'multilingual': { model: 'none', size: 'none' }
  },
  generation: {
    'fast': { model: 'none', size: 'none' },
    'balanced': { model: 'none', size: 'none' },
    'conversational': { model: 'none', size: 'none' }
  }
};

// Tipos de mensajes
export type InitWorkerMessage = {
  type: 'init';
  config?: {
    embeddingModel?: keyof typeof MODEL_CONFIGS.embeddings;
    qaModel?: keyof typeof MODEL_CONFIGS.qa;
    generationModel?: keyof typeof MODEL_CONFIGS.generation;
    enableCache?: boolean;
    maxCacheSize?: number;
  };
};

export type BuildIndexMessage = {
  type: 'build_index';
  id: string;
  text: string;
  options?: {
    chunkingStrategy?: 'fixed' | 'semantic' | 'paragraph' | 'sentence';
    chunkSize?: number;
    overlap?: number;
    minChunkSize?: number;
    maxChunkSize?: number;
    topK?: number;
    language?: 'es' | 'en' | 'auto';
  };
};

export type QueryMessage = {
  type: 'query';
  indexId: string;
  question: string;
  options?: {
    topK?: number;
    useQA?: boolean;
    useGeneration?: boolean;
    temperature?: number;
    maxLength?: number;
    includeContext?: boolean;
    contextWindow?: number;
  };
};

export type CacheStatsMessage = { type: 'cache_stats' };
export type ClearCacheMessage = { type: 'clear_cache'; indexId?: string };
export type GetMetricsMessage = { type: 'get_metrics' };

// Tipos de respuestas
export type WorkerReadyMessage = {
  type: 'worker_ready';
  models: {
    embedding: string;
    qa: string;
    generation: string;
  };
  capabilities: string[];
};

export type IndexReadyMessage = {
  type: 'index_ready';
  id: string;
  stats: {
    chunks: number;
    totalTokens: number;
    avgChunkSize: number;
    processingTime: number;
    strategy: string;
    cacheHits: number;
  };
};

export type QueryResponseMessage = {
  type: 'query_response';
  indexId: string;
  question: string;
  answer: string;
  confidence: number;
  context: Array<{
    index: number;
    score: number;
    text: string;
    tokens: number;
  }>;
  metadata: {
    processingTime: number;
    method: 'semantic' | 'qa' | 'generation' | 'hybrid';
    cacheHit: boolean;
    modelUsed: string;
  };
};

export type MetricsMessage = {
  type: 'metrics';
  data: {
    totalQueries: number;
    avgResponseTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    modelsLoaded: string[];
    indexCount: number;
  };
};

export type ErrorMessage = {
  type: 'error';
  error: string;
  context?: string;
  recoverable?: boolean;
};

// Estructuras internas
interface ChunkData {
  text: string;
  tokens: string[];
  embedding?: Float32Array;
  metadata: {
    index: number;
    startPos: number;
    endPos: number;
    sentences: number;
    paragraphs: number;
  };
}

interface IndexData {
  id: string;
  chunks: ChunkData[];
  originalText: string;
  createdAt: number;
  strategy: string;
  language: string;
  stats: {
    totalChunks: number;
    totalTokens: number;
    avgChunkSize: number;
  };
}

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  hits: number;
  size: number;
}

// Estado global del worker
class AdvancedRAGWorker {
  private indices = new Map<string, IndexData>();
  private cache = new Map<string, CacheEntry>();
  private models: {
    embedder?: Pipeline;
    qa?: Pipeline;
    generator?: Pipeline;
  } = {};
  
  private config = {
    embeddingModel: 'fast' as keyof typeof MODEL_CONFIGS.embeddings,
    qaModel: 'fast' as keyof typeof MODEL_CONFIGS.qa,
    generationModel: 'fast' as keyof typeof MODEL_CONFIGS.generation,
    enableCache: true,
    maxCacheSize: 100 * 1024 * 1024, // 100MB
  };

  private metrics = {
    totalQueries: 0,
    totalResponseTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    startTime: Date.now(),
  };

  // Inicialización del worker
  async init(config?: InitWorkerMessage['config']): Promise<WorkerReadyMessage> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Modo keyword-only: capacidades limitadas y sin modelos externos
    const capabilities: string[] = ['keyword_search', 'chunking', 'caching'];
    const models = {
      embedding: 'none',
      qa: 'none',
      generation: 'none',
    };

    return { type: 'worker_ready', models, capabilities };
  }

  // Chunking inteligente
  private chunkText(text: string, strategy: string, options: any): ChunkData[] {
    const chunks: ChunkData[] = [];
    
    switch (strategy) {
      case 'semantic':
        return this.semanticChunking(text, options);
      case 'paragraph':
        return this.paragraphChunking(text, options);
      case 'sentence':
        return this.sentenceChunking(text, options);
      default:
        return this.fixedChunking(text, options);
    }
  }

  private fixedChunking(text: string, options: any): ChunkData[] {
    const { chunkSize = 800, overlap = 200, minChunkSize = 100 } = options;
    const chunks: ChunkData[] = [];
    
    let start = 0;
    let index = 0;
    
    while (start < text.length) {
      let end = Math.min(start + chunkSize, text.length);
      
      // Intentar cortar en límite de oración
      if (end < text.length) {
        const lastSentence = text.lastIndexOf('.', end);
        const lastQuestion = text.lastIndexOf('?', end);
        const lastExclamation = text.lastIndexOf('!', end);
        
        const bestCut = Math.max(lastSentence, lastQuestion, lastExclamation);
        if (bestCut > start + minChunkSize) {
          end = bestCut + 1;
        }
      }
      
      const chunkText = text.slice(start, end).trim();
      if (chunkText.length >= minChunkSize) {
        chunks.push({
          text: chunkText,
          tokens: this.tokenize(chunkText),
          metadata: {
            index: index++,
            startPos: start,
            endPos: end,
            sentences: (chunkText.match(/[.!?]+/g) || []).length,
            paragraphs: (chunkText.match(/\n\s*\n/g) || []).length + 1,
          },
        });
      }
      
      start = Math.max(start + 1, end - overlap);
      index++;
    }
    
    return chunks;
  }

  private paragraphChunking(text: string, options: any): ChunkData[] {
    const { maxChunkSize = 1200, minChunkSize = 200 } = options;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const chunks: ChunkData[] = [];
    
    let currentChunk = '';
    let index = 0;
    let startPos = 0;
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      
      if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk) {
        // Guardar chunk actual
        chunks.push({
          text: currentChunk.trim(),
          tokens: this.tokenize(currentChunk),
          metadata: {
            index: index++,
            startPos,
            endPos: startPos + currentChunk.length,
            sentences: (currentChunk.match(/[.!?]+/g) || []).length,
            paragraphs: (currentChunk.match(/\n\s*\n/g) || []).length + 1,
          },
        });
        
        startPos += currentChunk.length;
        currentChunk = trimmedParagraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
      }
    }
    
    // Último chunk
    if (currentChunk.trim().length >= minChunkSize) {
      chunks.push({
        text: currentChunk.trim(),
        tokens: this.tokenize(currentChunk),
        metadata: {
          index: index++,
          startPos,
          endPos: startPos + currentChunk.length,
          sentences: (currentChunk.match(/[.!?]+/g) || []).length,
          paragraphs: (currentChunk.match(/\n\s*\n/g) || []).length + 1,
        },
      });
    }
    
    return chunks;
  }

  private sentenceChunking(text: string, options: any): ChunkData[] {
    const { maxChunkSize = 600, minChunkSize = 150 } = options;
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    const chunks: ChunkData[] = [];
    
    let currentChunk = '';
    let index = 0;
    let startPos = 0;
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          tokens: this.tokenize(currentChunk),
          metadata: {
            index: index++,
            startPos,
            endPos: startPos + currentChunk.length,
            sentences: (currentChunk.match(/[.!?]+/g) || []).length,
            paragraphs: 1,
          },
        });
        
        startPos += currentChunk.length;
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk.trim().length >= minChunkSize) {
      chunks.push({
        text: currentChunk.trim(),
        tokens: this.tokenize(currentChunk),
        metadata: {
          index: index++,
          startPos,
          endPos: startPos + currentChunk.length,
          sentences: (currentChunk.match(/[.!?]+/g) || []).length,
          paragraphs: 1,
        },
      });
    }
    
    return chunks;
  }

  private semanticChunking(text: string, options: any): ChunkData[] {
    // Para chunking semántico real necesitaríamos análisis más avanzado
    // Por ahora, usamos una heurística mejorada basada en párrafos y oraciones
    return this.paragraphChunking(text, options);
  }

  // Tokenización mejorada
  private tokenize(text: string): string[] {
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\p{Diacritic}]/gu, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const tokens = normalized.split(' ').filter(t => t.length > 2);
    
    // Stopwords más completas para español
    const stopwords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'y', 'o', 'u',
      'en', 'para', 'por', 'con', 'sin', 'a', 'que', 'se', 'su', 'sus', 'es', 'son', 'ser',
      'este', 'esta', 'estos', 'estas', 'como', 'más', 'menos', 'muy', 'ya', 'no', 'si', 'sí',
      'sobre', 'entre', 'desde', 'hasta', 'cuando', 'donde', 'qué', 'cuál', 'cual', 'cuáles',
      'cuales', 'quién', 'quien', 'quienes', 'cuanto', 'cuánto', 'cuantos', 'cuántos', 'cuanta',
      'cuánta', 'lo', 'le', 'les', 'me', 'te', 'mi', 'mis', 'tu', 'tus', 'nos', 'vos',
      'ellos', 'ellas', 'ella', 'usted', 'ustedes', 'debe', 'deben', 'deberá', 'deberán',
      'debería', 'será', 'serán', 'fue', 'fueron', 'han', 'has', 'había', 'habían', 'hay',
      'está', 'están', 'estaba', 'estaban', 'todo', 'toda', 'todos', 'todas', 'otro', 'otra',
      'otros', 'otras', 'mismo', 'misma', 'mismos', 'mismas', 'cada', 'algún', 'alguna',
      'algunos', 'algunas', 'ningún', 'ninguna', 'ningunos', 'ningunas', 'tanto', 'tanta',
      'tantos', 'tantas', 'poco', 'poca', 'pocos', 'pocas', 'mucho', 'mucha', 'muchos', 'muchas'
    ]);
    
    return tokens.filter(token => !stopwords.has(token));
  }

  // Sistema de caché inteligente
  private getCacheKey(type: string, data: any): string {
    return `${type}:${JSON.stringify(data)}`;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.config.enableCache) return null;
    
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Verificar expiración (24 horas)
    if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    this.metrics.cacheHits++;
    return entry.data as T;
  }

  private setCache(key: string, data: any): void {
    if (!this.config.enableCache) return;
    
    const size = JSON.stringify(data).length;
    
    // Limpiar caché si está lleno
    if (this.getCacheSize() + size > this.config.maxCacheSize) {
      this.evictCache();
    }
    
    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      hits: 0,
      size,
    });
  }

  private getCacheSize(): number {
    return Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
  }

  private evictCache(): void {
    // Estrategia LRU: eliminar entradas menos usadas y más antiguas
    const entries = Array.from(this.cache.values())
      .sort((a, b) => (a.hits / (Date.now() - a.timestamp)) - (b.hits / (Date.now() - b.timestamp)));
    
    // Eliminar 25% de las entradas
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i].key);
    }
  }

  // Construcción de índice mejorada
  async buildIndex(msg: BuildIndexMessage): Promise<IndexReadyMessage> {
    const startTime = performance.now();
    const { id, text, options = {} } = msg;
    
    const {
      chunkingStrategy = 'paragraph',
      chunkSize = 800,
      overlap = 200,
      minChunkSize = 150,
      maxChunkSize = 1200,
      language = 'auto'
    } = options;

    // Detectar idioma si es auto
    const detectedLanguage = language === 'auto' ? this.detectLanguage(text) : language;
    
    // Chunking inteligente
    const chunks = this.chunkText(text, chunkingStrategy, {
      chunkSize,
      overlap,
      minChunkSize,
      maxChunkSize
    });

    // Modo keyword-only: no se generan embeddings
    const cacheHits = 0;
    for (const chunk of chunks) {
      chunk.embedding = undefined;
    }

    // Calcular estadísticas
    const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens.length, 0);
    const avgChunkSize = chunks.length > 0 ? totalTokens / chunks.length : 0;

    const indexData: IndexData = {
      id,
      chunks,
      originalText: text,
      createdAt: Date.now(),
      strategy: chunkingStrategy,
      language: detectedLanguage,
      stats: {
        totalChunks: chunks.length,
        totalTokens,
        avgChunkSize: Math.round(avgChunkSize),
      },
    };

    this.indices.set(id, indexData);

    return {
      type: 'index_ready',
      id,
      stats: {
        chunks: chunks.length,
        totalTokens,
        avgChunkSize: Math.round(avgChunkSize),
        processingTime: Math.round(performance.now() - startTime),
        strategy: chunkingStrategy,
        cacheHits,
      },
    };
  }

  // Detección simple de idioma
  private detectLanguage(text: string): string {
    const sample = text.slice(0, 1000).toLowerCase();
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las'];
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'];
    
    let spanishCount = 0;
    let englishCount = 0;
    
    spanishWords.forEach(word => {
      spanishCount += (sample.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    });
    
    englishWords.forEach(word => {
      englishCount += (sample.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    });
    
    return spanishCount > englishCount ? 'es' : 'en';
  }

  // Consulta avanzada con múltiples estrategias
  async query(msg: QueryMessage): Promise<QueryResponseMessage> {
    const startTime = performance.now();
    this.metrics.totalQueries++;
    
    const { indexId, question, options = {} } = msg;
    const {
      topK = 3,
      useQA = true,
      useGeneration = false,
      temperature = 0.7,
      maxLength = 200,
      includeContext = true,
      contextWindow = 3
    } = options;

    const index = this.indices.get(indexId);
    if (!index) {
      throw new Error(`Índice ${indexId} no encontrado`);
    }

    // Verificar caché de respuesta
    const cacheKey = this.getCacheKey('query', { indexId, question, options });
    const cachedResponse = this.getFromCache<QueryResponseMessage>(cacheKey);
    if (cachedResponse) {
      return { ...cachedResponse, metadata: { ...cachedResponse.metadata, cacheHit: true } };
    }

    let method: 'semantic' | 'qa' | 'generation' | 'hybrid' = 'semantic';
    let answer = '';
    let confidence = 0;
    let context: any[] = [];
    let modelUsed = 'none';

    try {
      // 1. Búsqueda semántica
      context = await this.semanticSearch(index, question, topK);
      
      if (context.length === 0) {
        // Fallback a búsqueda por palabras clave
        context = this.keywordSearch(index, question, topK);
        method = 'semantic';
      }

      // 2. QA extractivo si está habilitado
      if (useQA && context.length > 0) {
        try {
          const qaResult = await this.extractiveQA(question, context, contextWindow);
          if (qaResult.answer && qaResult.confidence > 0.3) {
            answer = qaResult.answer;
            confidence = qaResult.confidence;
            method = 'qa';
            modelUsed = MODEL_CONFIGS.qa[this.config.qaModel].model;
          }
        } catch (error) {
          console.warn('Error en QA extractivo:', error);
        }
      }

      // 3. Generación de texto si está habilitado o QA falló
      if (useGeneration && (!answer || confidence < 0.5)) {
        try {
          const genResult = await this.generateAnswer(question, context, {
            temperature,
            maxLength,
            contextWindow
          });
          if (genResult.answer) {
            answer = genResult.answer;
            confidence = Math.max(confidence, genResult.confidence);
            method = answer ? 'hybrid' : 'generation';
            modelUsed = MODEL_CONFIGS.generation[this.config.generationModel].model;
          }
        } catch (error) {
          console.warn('Error en generación:', error);
        }
      }

      // 4. Fallback final
      if (!answer && context.length > 0) {
        answer = context[0].text;
        confidence = context[0].score;
        method = 'semantic';
      }

    } catch (error) {
      throw new Error(`Error en consulta: ${error}`);
    }

    const processingTime = Math.round(performance.now() - startTime);
    this.metrics.totalResponseTime += processingTime;

    const response: QueryResponseMessage = {
      type: 'query_response',
      indexId,
      question,
      answer: answer || 'No se pudo encontrar una respuesta relevante.',
      confidence,
      context: includeContext ? context : [],
      metadata: {
        processingTime,
        method,
        cacheHit: false,
        modelUsed,
      },
    };

    // Guardar en caché si la confianza es alta
    if (confidence > 0.4) {
      this.setCache(cacheKey, response);
    }

    return response;
  }

  // Búsqueda semántica mejorada
  private async semanticSearch(index: IndexData, question: string, topK: number) {
    // Degradar a búsqueda por palabras clave
    return this.keywordSearch(index, question, topK);
  }

  // Búsqueda por palabras clave mejorada
  private keywordSearch(index: IndexData, question: string, topK: number) {
    const questionTokens = this.tokenize(question);
    const questionSet = new Set(questionTokens);

    const scored = index.chunks.map(chunk => {
      const chunkTokens = chunk.tokens;
      let overlap = 0;
      let exactMatches = 0;

      for (const token of chunkTokens) {
        if (questionSet.has(token)) {
          overlap++;
          // Bonus por coincidencias exactas de palabras importantes
          if (token.length > 4) exactMatches++;
        }
      }

      // Puntuación mejorada con bonus por coincidencias exactas
      const baseScore = overlap / Math.sqrt((questionTokens.length + 1) * (chunkTokens.length + 1));
      const exactBonus = exactMatches * 0.1;
      const score = baseScore + exactBonus;

      return {
        index: chunk.metadata.index,
        score,
        text: chunk.text,
        tokens: chunkTokens.length,
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // QA extractivo mejorado
  private async extractiveQA(question: string, context: any[], contextWindow: number) {
    // Desactivado en modo keyword-only
    return { answer: '', confidence: 0 };
  }

  // Generación de respuestas
  private async generateAnswer(question: string, context: any[], options: any) {
    // Desactivado en modo keyword-only
    return { answer: '', confidence: 0 };
  }

  // Utilidades
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  // Métricas y estadísticas
  getMetrics(): MetricsMessage {
    const avgResponseTime = this.metrics.totalQueries > 0 
      ? this.metrics.totalResponseTime / this.metrics.totalQueries 
      : 0;
    
    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
      : 0;

    return {
      type: 'metrics',
      data: {
        totalQueries: this.metrics.totalQueries,
        avgResponseTime: Math.round(avgResponseTime),
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        memoryUsage: this.getCacheSize(),
        modelsLoaded: Object.keys(this.models).filter(key => this.models[key as keyof typeof this.models]),
        indexCount: this.indices.size,
      },
    };
  }

  // Limpieza de caché
  clearCache(indexId?: string): void {
    if (indexId) {
      // Limpiar caché específico del índice
      const keysToDelete = Array.from(this.cache.keys())
        .filter(key => key.includes(indexId));
      keysToDelete.forEach(key => this.cache.delete(key));
      
      // También eliminar el índice
      this.indices.delete(indexId);
    } else {
      this.cache.clear();
      this.indices.clear();
    }
  }
}

// Instancia global del worker
const ragWorker = new AdvancedRAGWorker();

// Manejo de mensajes
self.onmessage = async (event: MessageEvent) => {
  const message = event.data;
  
  try {
    switch (message.type) {
      case 'init':
        const initResult = await ragWorker.init(message.config);
        self.postMessage(initResult);
        break;
        
      case 'build_index':
        const indexResult = await ragWorker.buildIndex(message);
        self.postMessage(indexResult);
        break;
        
      case 'query':
        const queryResult = await ragWorker.query(message);
        self.postMessage(queryResult);
        break;
        
      case 'get_metrics':
        const metricsResult = ragWorker.getMetrics();
        self.postMessage(metricsResult);
        break;
        
      case 'clear_cache':
        ragWorker.clearCache(message.indexId);
        self.postMessage({ type: 'cache_cleared', indexId: message.indexId });
        break;
        
      case 'cache_stats':
        const stats = ragWorker.getMetrics();
        self.postMessage(stats);
        break;
        
      default:
        throw new Error(`Tipo de mensaje no reconocido: ${message.type}`);
    }
  } catch (error: any) {
    const errorMessage: ErrorMessage = {
      type: 'error',
      error: error.message || String(error),
      context: message.type,
      recoverable: true,
    };
    self.postMessage(errorMessage);
  }
};

// Manejo de errores no capturados
self.onerror = (error) => {
  const errorMessage: ErrorMessage = {
    type: 'error',
    error: `Error no capturado: ${error.message}`,
    recoverable: false,
  };
  self.postMessage(errorMessage);
};