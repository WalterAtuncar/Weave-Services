// import { pipeline } from '@xenova/transformers';

export interface DocumentChunk {
  id: string;
  text: string;
  embedding?: number[];
  metadata?: {
    pageNumber?: number;
    chunkIndex: number;
    wordCount: number;
    source: string;
  };
}

export interface RAGSearchResult {
  chunk: DocumentChunk;
  similarity: number;
}

export interface RAGEngineConfig {
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  maxResults: number;
}

/**
 * Motor RAG para procesamiento de documentos y búsqueda semántica
 * Implementación basada en la documentación RAG
 */
export class RAGEngine {
  private embedder: any = null;
  private isInitialized = false;
  private config: RAGEngineConfig;
  private documentChunks: DocumentChunk[] = [];

  constructor(config: Partial<RAGEngineConfig> = {}) {
    this.config = {
      embeddingModel: 'keyword-hash',
      chunkSize: 500,
      chunkOverlap: 50,
      maxResults: 5,
      ...config
    };
  }

  /**
   * Inicializar el modelo de embeddings
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Inicializando motor RAG en modo keyword-only...');
      // No se requiere cargar modelos externos
      this.embedder = null;
      this.isInitialized = true;
      console.log('Motor RAG listo (sin Transformers)');
    } catch (error) {
      console.error('Error inicializando modelo de embeddings:', error);

      if (error instanceof Error) {
        if (error.message.includes('registerBackend')) {
          throw new Error('Error de configuración ONNX Runtime. La funcionalidad RAG no está disponible en este momento.');
        } else if (error.message.includes('fetch')) {
          throw new Error('Error de red al descargar el modelo. Verifica tu conexión a internet.');
        }
      }

      throw new Error(`Error al inicializar RAG Engine: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Generar embeddings para un texto
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      throw new Error('RAG Engine no está inicializado. Llama a initialize() primero.');
    }

    // Generar vector por hashing de tokens (dimensión fija)
    const dims = 256;
    const tokens = this.tokenize(text);
    const vec = new Array<number>(dims).fill(0);
    for (const tok of tokens) {
      let h = 5381;
      for (let i = 0; i < tok.length; i++) {
        h = ((h << 5) + h) + tok.charCodeAt(i);
        h |= 0;
      }
      const idx = Math.abs(h) % dims;
      vec[idx] += 1;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / norm);
  }

  /**
   * Procesar documento y crear chunks con embeddings
   */
  async processDocument(text: string, source: string = 'documento'): Promise<DocumentChunk[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Dividir texto en chunks
      const chunks = this.splitIntoChunks(text);
      
      // Generar embeddings para cada chunk
      const chunksWithEmbeddings: DocumentChunk[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.generateEmbeddings(chunk);
        
        chunksWithEmbeddings.push({
          id: `${source}_chunk_${i}`,
          text: chunk,
          embedding,
          metadata: {
            chunkIndex: i,
            wordCount: chunk.split(/\s+/).length,
            source
          }
        });
      }

      // Almacenar chunks en memoria
      this.documentChunks = chunksWithEmbeddings;
      
      console.log(`Documento procesado: ${chunksWithEmbeddings.length} chunks creados`);
      return chunksWithEmbeddings;
    } catch (error) {
      console.error('Error procesando documento:', error);
      throw new Error(`Error al procesar documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Buscar chunks similares a una consulta
   */
  async searchSimilar(query: string, topK: number = this.config.maxResults): Promise<RAGSearchResult[]> {
    if (!this.isInitialized) {
      throw new Error('RAG Engine no está inicializado');
    }

    if (this.documentChunks.length === 0) {
      throw new Error('No hay documentos procesados para buscar');
    }

    try {
      // Generar embedding de la consulta
      const queryEmbedding = await this.generateEmbeddings(query);
      
      // Calcular similitudes
      const similarities = this.documentChunks.map(chunk => ({
        chunk,
        similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding!)
      }));
      
      // Ordenar por similitud y retornar top K
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
    } catch (error) {
      console.error('Error en búsqueda semántica:', error);
      throw new Error(`Error en búsqueda: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener contexto relevante para una consulta
   */
  async getRelevantContext(query: string, maxChunks: number = 3): Promise<string> {
    const results = await this.searchSimilar(query, maxChunks);
    return results.map(result => result.chunk.text).join('\n\n');
  }

  /**
   * Dividir texto en chunks inteligentes
   */
  private splitIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;
      
      if (potentialChunk.length > this.config.chunkSize && currentChunk) {
        chunks.push(currentChunk.trim() + '.');
        
        // Crear overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.min(this.config.chunkOverlap, words.length));
        currentChunk = overlapWords.join(' ') + (overlapWords.length > 0 ? '. ' : '') + trimmedSentence;
      } else {
        currentChunk = potentialChunk;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim() + (currentChunk.endsWith('.') ? '' : '.'));
    }
    
    return chunks.filter(chunk => chunk.length > 10);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  /**
   * Calcular similitud coseno entre dos vectores
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Los vectores deben tener la misma longitud');
    }

    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Obtener estadísticas del índice
   */
  getIndexStats() {
    return {
      totalChunks: this.documentChunks.length,
      isInitialized: this.isInitialized,
      config: this.config,
      memoryUsage: this.documentChunks.length * (this.documentChunks[0]?.embedding?.length || 0) * 4 // aprox bytes
    };
  }

  /**
   * Limpiar índice
   */
  clearIndex(): void {
    this.documentChunks = [];
    console.log('Índice RAG limpiado');
  }

  /**
   * Indica si el motor está listo
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Eliminado: carga de Transformers/ORT. El motor funciona sin dependencias de ML.