import { TextExtractorService } from './textExtractor';
import { EmbeddingService } from './embeddingService';
import { DocumentoVectorial, DocumentoMetadata, ProcessingProgress } from './types';

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
    try {
      // Inicializar servicio de embeddings
      await this.embeddingService.inicializar();

      // Paso 1: Extraer texto
      onProgress?.({
        stage: 'extracting',
        progress: 10,
        message: 'Extrayendo texto del documento...'
      });

      const { contenidoCompleto, chunks, estadisticas } = await this.textExtractor.extraerTexto(archivo);

      onProgress?.({
        stage: 'extracting',
        progress: 30,
        message: `Texto extraído: ${estadisticas.totalPalabras} palabras, ${chunks.length} chunks`
      });

      // Paso 2: Generar embedding del documento completo
      onProgress?.({
        stage: 'embedding',
        progress: 40,
        message: 'Generando embedding del documento completo...'
      });

      const embeddingCompleto = await this.embeddingService.generarEmbedding(contenidoCompleto);

      onProgress?.({
        stage: 'embedding',
        progress: 60,
        message: 'Generando embeddings de chunks...'
      });

      // Paso 3: Generar embeddings para cada chunk
      const chunksConEmbeddings = await this.embeddingService.generarEmbeddingsParaChunks(chunks);

      onProgress?.({
        stage: 'embedding',
        progress: 80,
        message: 'Finalizando procesamiento...'
      });

      // Paso 4: Crear documento vectorial
      const documentoVectorial: DocumentoVectorial = {
        documento_id: Date.now(), // ID temporal basado en timestamp
        contenido_texto: contenidoCompleto,
        embedding: embeddingCompleto.embedding,
        metadata: {
          nombre_documento: archivo.name,
          tipo_documento_id: metadata.tipo_documento_id || 1,
          fecha_creacion: new Date().toISOString(),
          tags: metadata.tags || [],
          tamaño_archivo: archivo.size,
          extension: this.obtenerExtension(archivo.name),
          departamento: metadata.departamento || 'General'
        },
        chunks: chunksConEmbeddings,
        modelo_embedding: this.embeddingService.modeloNombre,
        dimensiones: this.embeddingService.dimensionesModelo,
        hash_contenido: this.generarHashContenido(contenidoCompleto),
        fecha_vectorizacion: new Date().toISOString(),
        version: 1,
        estado: 'activo'
      };

      onProgress?.({
        stage: 'completed',
        progress: 100,
        message: 'Documento procesado exitosamente'
      });

      return documentoVectorial;

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
  }

  // Actualiza un DocumentoVectorial existente a partir de nuevo texto editable
  // Recalcula embedding completo, chunks y embeddings de chunks, hash y version
  async actualizarDocumentoDesdeTexto(
    documento: DocumentoVectorial,
    nuevoTexto: string,
    opciones?: { tamañoChunk?: number }
  ): Promise<DocumentoVectorial> {
    const tamañoChunk = opciones?.tamañoChunk ?? 500;

    await this.embeddingService.inicializar();

    const contenido = this.limpiarTextoEditable(nuevoTexto || '');
    const chunks = this.dividirTextoEnChunks(contenido, tamañoChunk);

    const embeddingCompleto = await this.embeddingService.generarEmbedding(contenido);
    const chunksConEmbeddings = await this.embeddingService.generarEmbeddingsParaChunks(chunks);

    const documentoActualizado: DocumentoVectorial = {
      ...documento,
      contenido_texto: contenido,
      embedding: embeddingCompleto.embedding,
      chunks: chunksConEmbeddings,
      modelo_embedding: this.embeddingService.modeloNombre,
      dimensiones: this.embeddingService.dimensionesModelo,
      hash_contenido: this.generarHashContenido(contenido),
      fecha_vectorizacion: new Date().toISOString(),
      version: (documento.version || 1) + 1,
      estado: 'activo'
    };

    return documentoActualizado;
  }

  // Helpers internos para edición
  private dividirTextoEnChunks(texto: string, tamañoChunk: number) {
    const chunks: { numero_chunk: number; contenido: string; posicion_inicio: number; posicion_fin: number }[] = [];
    const parrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    let chunkActual = '';
    let numeroChunk = 1;
    let posicionInicio = 0;

    for (const parrafo of parrafos) {
      const p = parrafo.trim();
      if (chunkActual.length + p.length <= tamañoChunk) {
        chunkActual += (chunkActual ? '\n\n' : '') + p;
      } else {
        if (chunkActual.trim()) {
          chunks.push({
            numero_chunk: numeroChunk++,
            contenido: chunkActual.trim(),
            posicion_inicio: posicionInicio,
            posicion_fin: posicionInicio + chunkActual.length
          });
          posicionInicio += chunkActual.length;
        }
        chunkActual = p;
      }
    }

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

  private limpiarTextoEditable(texto: string): string {
    return texto
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s{3,}/g, '  ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private obtenerExtension(nombreArchivo: string): string {
    return nombreArchivo.split('.').pop()?.toLowerCase() || '';
  }

  private generarHashContenido(contenido: string): string {
    // Hash simple para demostración
    let hash = 0;
    for (let i = 0; i < contenido.length; i++) {
      const char = contenido.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  get servicioEmbeddings(): EmbeddingService {
    return this.embeddingService;
  }

  get servicioExtraccion(): TextExtractorService {
    return this.textExtractor;
  }
}