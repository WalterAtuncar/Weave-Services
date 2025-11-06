// types/DocumentTypes.ts
export interface DocumentoMetadata {
  nombre_documento: string;
  tipo_documento_id: number;
  fecha_creacion: string;
  tags: string[];
  tamaño_archivo: number;
  extension: string;
  departamento?: string;
}

export interface DocumentoVectorial {
  documento_id: number;
  contenido_texto: string;
  embedding: number[];
  metadata: DocumentoMetadata;
  chunks?: DocumentoChunk[];
  modelo_embedding: string;
  dimensiones: number;
  hash_contenido?: string;
  fecha_vectorizacion: string;
  version: number;
  estado: 'activo' | 'inactivo' | 'procesando';
}

export interface DocumentoChunk {
  numero_chunk: number;
  contenido: string;
  embedding_chunk?: number[];
  posicion_inicio: number;
  posicion_fin: number;
}

export interface ProcessingProgress {
  stage: 'extracting' | 'embedding' | 'saving' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface EmbeddingResult {
  embedding: number[];
  dimensiones: number;
  modelo_usado: string;
}

// services/TextExtractorService.ts
import * as pdfjsLib from 'pdfjs-dist';
import { DocumentoChunk } from '../types/DocumentTypes';

// Configurar worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export class TextExtractorService {
  private static instance: TextExtractorService;
  
  public static getInstance(): TextExtractorService {
    if (!TextExtractorService.instance) {
      TextExtractorService.instance = new TextExtractorService();
    }
    return TextExtractorService.instance;
  }

  async extraerTexto(archivo: File): Promise<{
    contenidoCompleto: string;
    chunks: DocumentoChunk[];
    estadisticas: {
      totalCaracteres: number;
      totalPalabras: number;
      totalPaginas: number;
    };
  }> {
    try {
      const extension = this.obtenerExtension(archivo.name).toLowerCase();
      
      switch (extension) {
        case 'pdf':
          return await this.extraerTextoPDF(archivo);
        case 'txt':
          return await this.extraerTextoTXT(archivo);
        case 'doc':
        case 'docx':
          throw new Error('Formato DOC/DOCX no soportado directamente. Use una biblioteca específica o convierta a PDF.');
        default:
          throw new Error(`Formato de archivo no soportado: ${extension}`);
      }
    } catch (error) {
      console.error('Error extrayendo texto:', error);
      throw new Error(`Error al extraer texto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async extraerTextoPDF(archivo: File): Promise<{
    contenidoCompleto: string;
    chunks: DocumentoChunk[];
    estadisticas: { totalCaracteres: number; totalPalabras: number; totalPaginas: number; };
  }> {
    const arrayBuffer = await archivo.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const textoPorPagina: string[] = [];
    const chunks: DocumentoChunk[] = [];
    let posicionActual = 0;

    // Extraer texto página por página
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const textoPagina = textContent.items
        .filter((item): item is any => 'str' in item)
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (textoPagina) {
        textoPorPagina.push(textoPagina);
        
        // Crear chunk por página
        chunks.push({
          numero_chunk: pageNum,
          contenido: textoPagina,
          posicion_inicio: posicionActual,
          posicion_fin: posicionActual + textoPagina.length
        });
        
        posicionActual += textoPagina.length + 1; // +1 para el espacio entre páginas
      }
    }

    const contenidoCompleto = textoPorPagina.join(' ');
    
    return {
      contenidoCompleto,
      chunks: this.dividirEnChunksSemanticos(contenidoCompleto, 500), // Rechunk semánticamente
      estadisticas: {
        totalCaracteres: contenidoCompleto.length,
        totalPalabras: contenidoCompleto.split(/\s+/).length,
        totalPaginas: pdf.numPages
      }
    };
  }

  private async extraerTextoTXT(archivo: File): Promise<{
    contenidoCompleto: string;
    chunks: DocumentoChunk[];
    estadisticas: { totalCaracteres: number; totalPalabras: number; totalPaginas: number; };
  }> {
    const texto = await archivo.text();
    const contenidoLimpio = this.limpiarTexto(texto);
    
    return {
      contenidoCompleto: contenidoLimpio,
      chunks: this.dividirEnChunksSemanticos(contenidoLimpio, 500),
      estadisticas: {
        totalCaracteres: contenidoLimpio.length,
        totalPalabras: contenidoLimpio.split(/\s+/).length,
        totalPaginas: 1
      }
    };
  }

  private dividirEnChunksSemanticos(texto: string, tamañoChunk: number): DocumentoChunk[] {
    const chunks: DocumentoChunk[] = [];
    const parrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let chunkActual = '';
    let numeroChunk = 1;
    let posicionInicio = 0;

    for (const parrafo of parrafos) {
      const parrafoLimpio = parrafo.trim();
      
      if (chunkActual.length + parrafoLimpio.length <= tamañoChunk) {
        chunkActual += (chunkActual ? '\n\n' : '') + parrafoLimpio;
      } else {
        // Guardar chunk actual si no está vacío
        if (chunkActual.trim()) {
          chunks.push({
            numero_chunk: numeroChunk++,
            contenido: chunkActual.trim(),
            posicion_inicio: posicionInicio,
            posicion_fin: posicionInicio + chunkActual.length
          });
          
          posicionInicio += chunkActual.length;
          chunkActual = parrafoLimpio;
        } else {
          chunkActual = parrafoLimpio;
        }
      }
    }

    // Agregar último chunk
    if (chunkActual.trim()) {
      chunks.push({
        numero_chunk: numeroChunk,
        contenido: chunkActual.trim(),
        posicion_inicio: posicionInicio,
        posicion_fin: posicionInicio + chunkActual.length
      });
    }

    return chunks;
  }

  private limpiarTexto(texto: string): string {
    return texto
      .replace(/\r\n/g, '\n')           // Normalizar saltos de línea
      .replace(/\r/g, '\n')             // Normalizar saltos de línea
      .replace(/\t/g, ' ')              // Reemplazar tabs con espacios
      .replace(/\s{3,}/g, '  ')         // Reducir espacios múltiples
      .replace(/\n{3,}/g, '\n\n')       // Reducir saltos de línea múltiples
      .trim();
  }

  private obtenerExtension(nombreArchivo: string): string {
    return nombreArchivo.split('.').pop() || '';
  }
}

// services/EmbeddingService.ts
import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
import { EmbeddingResult, DocumentoChunk } from '../types/DocumentTypes';

export class EmbeddingService {
  private static instance: EmbeddingService;
  private pipeline: FeatureExtractionPipeline | null = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2';
  private isLoading = false;
  private isLoaded = false;

  public static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  async inicializar(): Promise<void> {
    if (this.isLoaded || this.isLoading) {
      return;
    }

    this.isLoading = true;
    
    try {
      console.log('🤖 Iniciando carga del modelo de embeddings...');
      
      this.pipeline = await pipeline('feature-extraction', this.modelName, {
        revision: 'main',
        quantized: true, // Usar versión cuantizada para menor tamaño
      }) as FeatureExtractionPipeline;
      
      this.isLoaded = true;
      console.log('✅ Modelo de embeddings cargado exitosamente');
    } catch (error) {
      console.error('❌ Error cargando modelo de embeddings:', error);
      throw new Error('No se pudo cargar el modelo de embeddings');
    } finally {
      this.isLoading = false;
    }
  }

  async generarEmbedding(texto: string): Promise<EmbeddingResult> {
    await this.asegurarModeloCargado();
    
    try {
      const textoLimpio = this.preprocesarTexto(texto);
      
      const output = await this.pipeline!(textoLimpio, {
        pooling: 'mean',
        normalize: true
      });
      
      const embedding = Array.from(output.data) as number[];
      
      return {
        embedding,
        dimensiones: embedding.length,
        modelo_usado: this.modelName
      };
    } catch (error) {
      console.error('Error generando embedding:', error);
      throw new Error('Error al generar embedding del texto');
    }
  }

  async generarEmbeddingsLote(textos: string[]): Promise<EmbeddingResult[]> {
    await this.asegurarModeloCargado();
    
    const resultados: EmbeddingResult[] = [];
    
    for (let i = 0; i < textos.length; i++) {
      try {
        const resultado = await this.generarEmbedding(textos[i]);
        resultados.push(resultado);
        
        // Pequeña pausa para no bloquear la UI
        if (i % 5 === 0) {
          await this.esperar(50);
        }
      } catch (error) {
        console.error(`Error procesando texto ${i}:`, error);
        // Continuar con el siguiente texto
        resultados.push({
          embedding: [],
          dimensiones: 0,
          modelo_usado: this.modelName
        });
      }
    }
    
    return resultados;
  }

  async generarEmbeddingsParaChunks(chunks: DocumentoChunk[]): Promise<DocumentoChunk[]> {
    const chunksConEmbeddings = [...chunks];
    
    for (let i = 0; i < chunksConEmbeddings.length; i++) {
      try {
        const resultado = await this.generarEmbedding(chunksConEmbeddings[i].contenido);
        chunksConEmbeddings[i].embedding_chunk = resultado.embedding;
        
        console.log(`📊 Chunk ${i + 1}/${chunks.length} procesado`);
        
        // Pausa para no saturar
        await this.esperar(100);
      } catch (error) {
        console.error(`Error procesando chunk ${i}:`, error);
      }
    }
    
    return chunksConEmbeddings;
  }

  private async asegurarModeloCargado(): Promise<void> {
    if (!this.isLoaded) {
      await this.inicializar();
    }
  }

  private preprocesarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .replace(/[^\w\sáéíóúñü]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 512); // Limitar longitud para el modelo
  }

  private esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  calcularSimilitudCoseno(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Los embeddings deben tener la misma dimensión');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, Math.min(1, similarity)); // Asegurar rango [0, 1]
  }

  get estaListo(): boolean {
    return this.isLoaded;
  }

  get estaCargando(): boolean {
    return this.isLoading;
  }
}

// services/DocumentProcessorService.ts
import { TextExtractorService } from './TextExtractorService';
import { EmbeddingService } from './EmbeddingService';
import { DocumentoVectorial, DocumentoMetadata, ProcessingProgress } from '../types/DocumentTypes';
import CryptoJS from 'crypto-js';

export class DocumentProcessorService {
  private static instance: DocumentProcessorService;
  private textExtractor: TextExtractorService;
  private embeddingService: EmbeddingService;

  private constructor() {
    this.textExtractor = TextExtractorService.getInstance();
    this.embeddingService = EmbeddingService.getInstance();
  }

  public static getInstance(): DocumentProcessorService {
    if (!DocumentProcessorService.instance) {
      DocumentProcessorService.instance = new DocumentProcessorService();
    }
    return DocumentProcessorService.instance;
  }

  async procesarDocumentoCompleto(
    archivo: File,
    metadata: Partial<DocumentoMetadata>,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<DocumentoVectorial> {
    const documentoId = Date.now(); // En producción, esto vendría del backend
    
    try {
      // Fase 1: Extraer texto
      onProgress?.({
        stage: 'extracting',
        progress: 10,
        message: 'Extrayendo texto del documento...'
      });

      const resultadoExtraccion = await this.textExtractor.extraerTexto(archivo);
      
      onProgress?.({
        stage: 'extracting',
        progress: 30,
        message: `Texto extraído: ${resultadoExtraccion.estadisticas.totalPalabras} palabras`
      });

      // Fase 2: Generar embeddings
      onProgress?.({
        stage: 'embedding',
        progress: 40,
        message: 'Generando embedding del documento completo...'
      });

      const embeddingPrincipal = await this.embeddingService.generarEmbedding(
        resultadoExtraccion.contenidoCompleto
      );

      onProgress?.({
        stage: 'embedding',
        progress: 60,
        message: 'Generando embeddings para chunks...'
      });

      const chunksConEmbeddings = await this.embeddingService.generarEmbeddingsParaChunks(
        resultadoExtraccion.chunks
      );

      onProgress?.({
        stage: 'embedding',
        progress: 80,
        message: 'Embeddings generados exitosamente'
      });

      // Fase 3: Construir objeto final
      onProgress?.({
        stage: 'saving',
        progress: 90,
        message: 'Construyendo objeto de documento...'
      });

      const documentoCompleto: DocumentoVectorial = {
        documento_id: documentoId,
        contenido_texto: resultadoExtraccion.contenidoCompleto,
        embedding: embeddingPrincipal.embedding,
        metadata: {
          nombre_documento: archivo.name,
          tipo_documento_id: metadata.tipo_documento_id || 1,
          fecha_creacion: new Date().toISOString(),
          tags: metadata.tags || [],
          tamaño_archivo: archivo.size,
          extension: this.obtenerExtension(archivo.name),
          departamento: metadata.departamento || 'General',
          ...metadata
        },
        chunks: chunksConEmbeddings,
        modelo_embedding: embeddingPrincipal.modelo_usado,
        dimensiones: embeddingPrincipal.dimensiones,
        hash_contenido: this.generarHashContenido(resultadoExtraccion.contenidoCompleto),
        fecha_vectorizacion: new Date().toISOString(),
        version: 1,
        estado: 'activo'
      };

      onProgress?.({
        stage: 'completed',
        progress: 100,
        message: 'Documento procesado completamente'
      });

      return documentoCompleto;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: 'Error procesando documento',
        error: errorMessage
      });

      throw error;
    }
  }

  async buscarDocumentosSimilares(
    consulta: string,
    documentos: DocumentoVectorial[],
    limite = 5,
    umbralMinimo = 0.3
  ): Promise<Array<DocumentoVectorial & { similitud: number }>> {
    try {
      const embeddingConsulta = await this.embeddingService.generarEmbedding(consulta);
      
      const resultados = documentos
        .map(doc => ({
          ...doc,
          similitud: this.embeddingService.calcularSimilitudCoseno(
            embeddingConsulta.embedding,
            doc.embedding
          )
        }))
        .filter(doc => doc.similitud >= umbralMinimo)
        .sort((a, b) => b.similitud - a.similitud)
        .slice(0, limite);

      return resultados;
    } catch (error) {
      console.error('Error en búsqueda de similares:', error);
      throw new Error('Error al buscar documentos similares');
    }
  }

  private obtenerExtension(nombreArchivo: string): string {
    return nombreArchivo.split('.').pop()?.toLowerCase() || '';
  }

  private generarHashContenido(contenido: string): string {
    return CryptoJS.SHA256(contenido).toString();
  }

  get servicioEmbeddings(): EmbeddingService {
    return this.embeddingService;
  }

  get servicioExtraccion(): TextExtractorService {
    return this.textExtractor;
  }
}