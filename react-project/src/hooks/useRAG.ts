import { useState, useCallback, useRef, useEffect } from 'react';
import { RAGEngine, DocumentChunk, RAGSearchResult, RAGEngineConfig } from '../utils/ragEngine';

export interface UseRAGState {
  isInitialized: boolean;
  isProcessing: boolean;
  isSearching: boolean;
  error: string | null;
  indexStats: {
    totalChunks: number;
    isInitialized: boolean;
    config: RAGEngineConfig;
    memoryUsage: number;
  } | null;
}

export interface UseRAGActions {
  initializeRAG: () => Promise<void>;
  processDocument: (text: string, source?: string) => Promise<DocumentChunk[]>;
  searchSimilar: (query: string, topK?: number) => Promise<RAGSearchResult[]>;
  getRelevantContext: (query: string, maxChunks?: number) => Promise<string>;
  clearIndex: () => void;
  refreshStats: () => void;
}

export interface UseRAGReturn extends UseRAGState, UseRAGActions {}

// Eventos globales para sincronizar múltiples instancias del hook
const RAG_READY_EVENT = 'rag_ready';
const RAG_INDEX_UPDATED_EVENT = 'rag_index_updated';

// =============== SINGLETON COMPARTIDO ===============
let sharedEngine: RAGEngine | null = null;
let initPromise: Promise<void> | null = null;

function getSharedEngine(config?: Partial<RAGEngineConfig>): RAGEngine {
  if (!sharedEngine) {
    sharedEngine = new RAGEngine(config);
  }
  return sharedEngine;
}

/**
 * Hook personalizado para gestionar el motor RAG
 * Proporciona una interfaz reactiva para el procesamiento de documentos y búsqueda semántica
 */
export function useRAG(config?: Partial<RAGEngineConfig>): UseRAGReturn {
  const ragEngineRef = useRef<RAGEngine | null>(null);
  
  const [state, setState] = useState<UseRAGState>({
    isInitialized: false,
    isProcessing: false,
    isSearching: false,
    error: null,
    indexStats: null
  });

  // Inicializar referencia a la instancia compartida una sola vez
  useEffect(() => {
    ragEngineRef.current = getSharedEngine(config);
    // Sincronizar estado con la instancia compartida actual
    if (ragEngineRef.current) {
      const ready = ragEngineRef.current.isReady();
      const stats = ragEngineRef.current.getIndexStats();
      setState(prev => ({ ...prev, isInitialized: ready, indexStats: stats }));
    }

    // Suscribirse a eventos globales para reflejar cambios iniciados desde otros lugares
    const onReady = () => {
      const stats = ragEngineRef.current?.getIndexStats() || null;
      setState(prev => ({ ...prev, isInitialized: true, indexStats: stats }));
    };
    const onIndexUpdated = () => {
      const stats = ragEngineRef.current?.getIndexStats() || null;
      setState(prev => ({ ...prev, indexStats: stats }));
    };

    window.addEventListener(RAG_READY_EVENT, onReady as EventListener);
    window.addEventListener(RAG_INDEX_UPDATED_EVENT, onIndexUpdated as EventListener);

    // Pequeño polling hasta que el motor esté listo (por si el evento se pierde)
    let pollId: number | null = null;
    if (!ragEngineRef.current?.isReady()) {
      pollId = window.setInterval(() => {
        if (ragEngineRef.current?.isReady()) {
          const stats = ragEngineRef.current?.getIndexStats() || null;
          setState(prev => ({ ...prev, isInitialized: true, indexStats: stats }));
          if (pollId) window.clearInterval(pollId);
        }
      }, 500);
    }

    return () => {
      window.removeEventListener(RAG_READY_EVENT, onReady as EventListener);
      window.removeEventListener(RAG_INDEX_UPDATED_EVENT, onIndexUpdated as EventListener);
      if (pollId) window.clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Actualizar estadísticas del índice
   */
  const refreshStats = useCallback(() => {
    if (ragEngineRef.current) {
      const stats = ragEngineRef.current.getIndexStats();
      setState(prev => ({ ...prev, indexStats: stats }));
    }
  }, []);

  /**
   * Inicializar el motor RAG (idempotente y libre de carreras)
   */
  const initializeRAG = useCallback(async () => {
    const engine = ragEngineRef.current;
    if (!engine) return;

    // Si ya está listo, sincroniza estado y sal
    if (engine.isReady()) {
      setState(prev => ({ ...prev, isInitialized: true }));
      refreshStats();
      return;
    }

    // Evitar múltiples inicializaciones concurrentes
    if (!initPromise) {
      initPromise = (async () => {
        await engine.initialize();
      })();
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      await initPromise;
      setState(prev => ({ 
        ...prev, 
        isInitialized: true, 
        isProcessing: false 
      }));
      refreshStats();
      // Notificar globalmente que el motor está listo
      window.dispatchEvent(new CustomEvent(RAG_READY_EVENT));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al inicializar RAG';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }));
      console.warn('RAG Engine no disponible:', error);
    } finally {
      // Permitir futuros intentos si falló
      initPromise = null;
    }
  }, [refreshStats]);

  /**
   * Procesar documento y crear índice
   */
  const processDocument = useCallback(async (text: string, source: string = 'documento'): Promise<DocumentChunk[]> => {
    if (!ragEngineRef.current) {
      throw new Error('RAG Engine no está disponible');
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const chunks = await ragEngineRef.current.processDocument(text, source);
      setState(prev => ({ ...prev, isProcessing: false }));
      refreshStats();
      // Notificar actualización de índice
      window.dispatchEvent(new CustomEvent(RAG_INDEX_UPDATED_EVENT));
      return chunks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar documento';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }));
      console.error('Error procesando documento:', error);
      throw error;
    }
  }, [refreshStats]);

  /**
   * Buscar chunks similares
   */
  const searchSimilar = useCallback(async (query: string, topK?: number): Promise<RAGSearchResult[]> => {
    if (!ragEngineRef.current) {
      throw new Error('RAG Engine no está disponible');
    }

    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const results = await ragEngineRef.current.searchSimilar(query, topK);
      setState(prev => ({ ...prev, isSearching: false }));
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en búsqueda';
      setState(prev => ({ 
        ...prev, 
        isSearching: false, 
        error: errorMessage 
      }));
      console.error('Error en búsqueda semántica:', error);
      throw error;
    }
  }, []);

  /**
   * Obtener contexto relevante para una consulta
   */
  const getRelevantContext = useCallback(async (query: string, maxChunks?: number): Promise<string> => {
    if (!ragEngineRef.current) {
      throw new Error('RAG Engine no está disponible');
    }

    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const context = await ragEngineRef.current.getRelevantContext(query, maxChunks);
      setState(prev => ({ ...prev, isSearching: false }));
      return context;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido obteniendo contexto';
      setState(prev => ({ 
        ...prev, 
        isSearching: false, 
        error: errorMessage 
      }));
      console.error('Error obteniendo contexto:', error);
      throw error;
    }
  }, []);

  /**
   * Limpiar índice
   */
  const clearIndex = useCallback(() => {
    if (ragEngineRef.current) {
      ragEngineRef.current.clearIndex();
      refreshStats();
      window.dispatchEvent(new CustomEvent(RAG_INDEX_UPDATED_EVENT));
    }
  }, [refreshStats]);

  return {
    // Estado
    isInitialized: state.isInitialized,
    isProcessing: state.isProcessing,
    isSearching: state.isSearching,
    error: state.error,
    indexStats: state.indexStats,
    
    // Acciones
    initializeRAG,
    processDocument,
    searchSimilar,
    getRelevantContext,
    clearIndex,
    refreshStats
  };
}