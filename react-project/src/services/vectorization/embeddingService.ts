import { EmbeddingResult, DocumentoChunk } from './types';

// Servicio de embeddings en modo keyword-only (sin Xenova/Transformers)
export class EmbeddingService {
  private static instance: EmbeddingService;
  private modelName = 'keyword-hash';
  private dimensions = 256; // Dimensión fija para hashing de tokens
  private isLoaded = false;
  private isLoading = false;

  public static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  async inicializar(): Promise<void> {
    if (this.isLoaded || this.isLoading) return;
    this.isLoading = true;
    try {
      // No hay modelos externos que cargar
      this.isLoaded = true;
      console.log('✅ Servicio de embeddings (keyword-only) listo');
    } finally {
      this.isLoading = false;
    }
  }

  async generarEmbedding(texto: string): Promise<EmbeddingResult> {
    await this.asegurarModeloCargado();
    const tokens = this.tokenizar(texto);
    const vector = this.hashTokens(tokens, this.dimensions);
    return {
      embedding: vector,
      dimensiones: this.dimensions,
      modelo_usado: this.modelName,
    };
  }

  async generarEmbeddingsLote(textos: string[]): Promise<EmbeddingResult[]> {
    await this.asegurarModeloCargado();
    return textos.map((t) => ({
      embedding: this.hashTokens(this.tokenizar(t), this.dimensions),
      dimensiones: this.dimensions,
      modelo_usado: this.modelName,
    }));
  }

  async generarEmbeddingsParaChunks(chunks: DocumentoChunk[]): Promise<DocumentoChunk[]> {
    await this.asegurarModeloCargado();
    return chunks.map((chunk) => ({
      ...chunk,
      embedding_chunk: this.hashTokens(this.tokenizar(chunk.contenido), this.dimensions),
    }));
  }

  private async asegurarModeloCargado(): Promise<void> {
    if (!this.isLoaded) {
      await this.inicializar();
    }
  }

  private tokenizar(texto: string): string[] {
    // Normalizar a minúsculas, quitar acentos y caracteres no alfanuméricos
    const sinAcentos = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ');

    const tokens = sinAcentos
      .split(/\s+/)
      .filter(Boolean)
      .filter((t) => t.length >= 3);

    // Stopwords en español (lista básica)
    const stopwords = new Set([
      'el','la','los','las','de','del','y','o','u','que','en','para','por','con','sin','un','una','unos','unas',
      'al','se','su','sus','lo','le','les','es','son','ser','fue','han','ha','hay','muy','más','menos','tambien','también',
      'como','entre','sobre','desde','hasta','esto','eso','esta','esa','aquel','aquella','donde','cuando','cual','cuales',
      'si','no','ya','solo','sólo','cada','todo','todos','toda','todas','asi','así','porque','qué','cuál','cuáles',
      'elaborado','documento','informe'
    ]);

    return tokens.filter((t) => !stopwords.has(t));
  }

  private hashTokens(tokens: string[], dims: number): number[] {
    const vec = new Array<number>(dims).fill(0);
    for (const tok of tokens) {
      let h = 5381;
      for (let i = 0; i < tok.length; i++) {
        h = ((h << 5) + h) + tok.charCodeAt(i);
        h |= 0; // mantener en 32 bits
      }
      const idx = Math.abs(h) % dims;
      vec[idx] += 1;
    }
    // Normalización L2
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  }

  calcularSimilitudCoseno(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Los embeddings deben tener la misma dimensión');
    }
    const dot = embedding1.reduce((s, v, i) => s + v * embedding2[i], 0);
    const n1 = Math.sqrt(embedding1.reduce((s, v) => s + v * v, 0));
    const n2 = Math.sqrt(embedding2.reduce((s, v) => s + v * v, 0));
    const sim = n1 === 0 || n2 === 0 ? 0 : dot / (n1 * n2);
    return parseFloat(sim.toFixed(4));
  }

  get estaListo(): boolean {
    return this.isLoaded;
  }

  get modeloNombre(): string {
    return this.modelName;
  }

  get dimensionesModelo(): number {
    return this.dimensions;
  }
}