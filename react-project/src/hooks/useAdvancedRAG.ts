// Hook avanzado para RAG con múltiples modelos, caché inteligente y métricas
import { useEffect, useRef, useState, useCallback } from 'react';

// Tipos importados del worker
type WorkerConfig = {
  embeddingModel?: 'fast' | 'balanced' | 'multilingual' | 'quality';
  qaModel?: 'fast' | 'balanced' | 'multilingual';
  generationModel?: 'fast' | 'balanced' | 'conversational';
  enableCache?: boolean;
  maxCacheSize?: number;
};

type ChunkingOptions = {
  chunkingStrategy?: 'fixed' | 'semantic' | 'paragraph' | 'sentence';
  chunkSize?: number;
  overlap?: number;
  minChunkSize?: number;
  maxChunkSize?: number;
  language?: 'es' | 'en' | 'auto';
};

type QueryOptions = {
  topK?: number;
  useQA?: boolean;
  useGeneration?: boolean;
  temperature?: number;
  maxLength?: number;
  includeContext?: boolean;
  contextWindow?: number;
};

type IndexStats = {
  chunks: number;
  totalTokens: number;
  avgChunkSize: number;
  processingTime: number;
  strategy: string;
  cacheHits: number;
};

type QueryResponse = {
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

type RAGMetrics = {
  totalQueries: number;
  avgResponseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  modelsLoaded: string[];
  indexCount: number;
};

interface UseAdvancedRAGReturn {
  // Estado
  isReady: boolean;
  isIndexing: boolean;
  isQuerying: boolean;
  error: string | null;
  
  // Datos
  currentIndex: string | null;
  indexStats: IndexStats | null;
  lastResponse: QueryResponse | null;
  metrics: RAGMetrics | null;
  
  // Funciones
  initialize: (config?: WorkerConfig) => Promise<void>;
  buildIndex: (text: string, options?: ChunkingOptions) => Promise<string>;
  query: (question: string, options?: QueryOptions) => Promise<QueryResponse>;
  clearCache: (indexId?: string) => void;
  getMetrics: () => void;
  
  // Configuración
  updateConfig: (config: Partial<WorkerConfig>) => void;
  
  // Utilidades
  resetError: () => void;
  getCapabilities: () => string[];
}

export const useAdvancedRAG = (initialConfig?: WorkerConfig): UseAdvancedRAGReturn => {
  // Estados
  const [isReady, setIsReady] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<string | null>(null);
  const [indexStats, setIndexStats] = useState<IndexStats | null>(null);
  const [lastResponse, setLastResponse] = useState<QueryResponse | null>(null);
  const [metrics, setMetrics] = useState<RAGMetrics | null>(null);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [config, setConfig] = useState<WorkerConfig>(initialConfig || {});

  // Referencias
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef(new Map<string, { resolve: Function; reject: Function }>());
  const messageIdRef = useRef(0);

  // Generar ID único para mensajes
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${++messageIdRef.current}`;
  }, []);

  // Enviar mensaje al worker con Promise
  const sendMessage = useCallback((message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker no inicializado'));
        return;
      }

      const messageId = generateMessageId();
      const messageWithId = { ...message, messageId };
      
      callbacksRef.current.set(messageId, { resolve, reject });
      workerRef.current.postMessage(messageWithId);

      // Timeout de 30 segundos
      setTimeout(() => {
        if (callbacksRef.current.has(messageId)) {
          callbacksRef.current.delete(messageId);
          reject(new Error('Timeout: El worker no respondió en 30 segundos'));
        }
      }, 30000);
    });
  }, [generateMessageId]);

  // Manejo de mensajes del worker
  const handleWorkerMessage = useCallback((event: MessageEvent) => {
    const { type, messageId, ...data } = event.data;

    // Manejar respuestas con callback
    if (messageId && callbacksRef.current.has(messageId)) {
      const { resolve, reject } = callbacksRef.current.get(messageId)!;
      callbacksRef.current.delete(messageId);

      if (type === 'error') {
        reject(new Error(data.error));
      } else {
        resolve(data);
      }
      return;
    }

    // Manejar mensajes sin callback específico
    switch (type) {
      case 'worker_ready':
        setIsReady(true);
        setCapabilities(data.capabilities || []);
        setError(null);
        break;

      case 'index_ready':
        setIsIndexing(false);
        setCurrentIndex(data.id);
        setIndexStats(data.stats);
        setError(null);
        break;

      case 'query_response':
        setIsQuerying(false);
        setLastResponse({
          answer: data.answer,
          confidence: data.confidence,
          context: data.context,
          metadata: data.metadata,
        });
        setError(null);
        break;

      case 'metrics':
        setMetrics(data.data);
        break;

      case 'error':
        setError(data.error);
        setIsIndexing(false);
        setIsQuerying(false);
        break;

      case 'cache_cleared':
        if (data.indexId === currentIndex || !data.indexId) {
          setCurrentIndex(null);
          setIndexStats(null);
          setLastResponse(null);
        }
        break;
    }
  }, [currentIndex]);

  // Inicializar worker
  useEffect(() => {
    const initWorker = async () => {
      try {
        // Crear worker
        workerRef.current = new Worker(
          new URL('../ai/workers/advanced-rag.worker.ts', import.meta.url),
          { type: 'module' }
        );

        workerRef.current.onmessage = handleWorkerMessage;
        
        workerRef.current.onerror = (error) => {
          console.error('Error en worker:', error);
          setError(`Error en worker: ${error.message}`);
          setIsReady(false);
        };

        // Inicializar con configuración
        await sendMessage({ type: 'init', config });

      } catch (error: any) {
        console.error('Error inicializando worker:', error);
        setError(`Error inicializando worker: ${error.message}`);
      }
    };

    initWorker();

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      callbacksRef.current.clear();
    };
  }, []); // Solo ejecutar una vez

  // Funciones públicas
  const initialize = useCallback(async (newConfig?: WorkerConfig) => {
    if (newConfig) {
      setConfig(prev => ({ ...prev, ...newConfig }));
    }
    
    if (workerRef.current) {
      try {
        await sendMessage({ type: 'init', config: newConfig || config });
      } catch (error: any) {
        setError(`Error reinicializando: ${error.message}`);
        throw error;
      }
    }
  }, [config, sendMessage]);

  const buildIndex = useCallback(async (text: string, options?: ChunkingOptions): Promise<string> => {
    if (!isReady) {
      throw new Error('Worker no está listo');
    }

    if (!text || text.trim().length < 50) {
      throw new Error('El texto debe tener al menos 50 caracteres');
    }

    setIsIndexing(true);
    setError(null);

    try {
      const indexId = `index_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      const response = await sendMessage({
        type: 'build_index',
        id: indexId,
        text: text.trim(),
        options: {
          chunkingStrategy: 'paragraph',
          chunkSize: 800,
          overlap: 200,
          minChunkSize: 150,
          maxChunkSize: 1200,
          language: 'auto',
          ...options,
        },
      });

      return response.id;
    } catch (error: any) {
      setIsIndexing(false);
      setError(`Error construyendo índice: ${error.message}`);
      throw error;
    }
  }, [isReady, sendMessage]);

  const query = useCallback(async (question: string, options?: QueryOptions): Promise<QueryResponse> => {
    if (!isReady) {
      throw new Error('Worker no está listo');
    }

    if (!currentIndex) {
      throw new Error('No hay índice disponible. Construye un índice primero.');
    }

    if (!question || question.trim().length < 3) {
      throw new Error('La pregunta debe tener al menos 3 caracteres');
    }

    setIsQuerying(true);
    setError(null);

    try {
      const response = await sendMessage({
        type: 'query',
        indexId: currentIndex,
        question: question.trim(),
        options: {
          topK: 3,
          useQA: true,
          useGeneration: false,
          temperature: 0.7,
          maxLength: 200,
          includeContext: true,
          contextWindow: 3,
          ...options,
        },
      });

      const queryResponse: QueryResponse = {
        answer: response.answer,
        confidence: response.confidence,
        context: response.context,
        metadata: response.metadata,
      };

      return queryResponse;
    } catch (error: any) {
      setIsQuerying(false);
      setError(`Error en consulta: ${error.message}`);
      throw error;
    }
  }, [isReady, currentIndex, sendMessage]);

  const clearCache = useCallback((indexId?: string) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'clear_cache',
        indexId: indexId || currentIndex,
      });
    }
  }, [currentIndex]);

  const getMetrics = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'get_metrics' });
    }
  }, []);

  const updateConfig = useCallback(async (newConfig: Partial<WorkerConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    if (isReady) {
      try {
        await initialize(updatedConfig);
      } catch (error) {
        console.error('Error actualizando configuración:', error);
      }
    }
  }, [config, isReady, initialize]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const getCapabilities = useCallback(() => {
    return capabilities;
  }, [capabilities]);

  return {
    // Estado
    isReady,
    isIndexing,
    isQuerying,
    error,
    
    // Datos
    currentIndex,
    indexStats,
    lastResponse,
    metrics,
    
    // Funciones
    initialize,
    buildIndex,
    query,
    clearCache,
    getMetrics,
    
    // Configuración
    updateConfig,
    
    // Utilidades
    resetError,
    getCapabilities,
  };
};

export default useAdvancedRAG;