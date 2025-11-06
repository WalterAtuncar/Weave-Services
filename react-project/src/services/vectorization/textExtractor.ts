import { DocumentoChunk } from './types';

// Nota: para DOCX usamos carga dinámica del módulo de navegador de Mammoth
// Esto evita problemas de bundling y sólo se carga cuando se necesita.

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
        case 'docx':
          return await this.extraerTextoDOCX(archivo);
        case 'txt':
          return await this.extraerTextoTXT(archivo);
        default:
          throw new Error(`Formato de archivo no soportado: ${extension}`);
      }
    } catch (error) {
      console.error('Error extrayendo texto:', error);
      throw new Error(`Error al extraer texto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Extracción REAL de PDF usando un Web Worker con pdfjs-dist
  private async extraerTextoPDF(archivo: File): Promise<{
    contenidoCompleto: string;
    chunks: DocumentoChunk[];
    estadisticas: { totalCaracteres: number; totalPalabras: number; totalPaginas: number };
  }> {
    const arrayBuffer = await archivo.arrayBuffer();

    return new Promise((resolve, reject) => {
      // Crea el worker (módulo ES) apuntando al worker de pdfjs
      const worker = new Worker(
        new URL('../../ai/workers/pdfText.worker.ts', import.meta.url),
        { type: 'module' }
      );

      const cleanup = () => {
        worker.removeEventListener('message', onMessage as EventListener);
        worker.removeEventListener('error', onError as EventListener);
        worker.terminate();
      };

      const onError = (e: ErrorEvent) => {
        cleanup();
        reject(new Error(e.message || 'Error en worker de PDF'));
      };

      const onMessage = (event: MessageEvent<any>) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'error') {
          cleanup();
          reject(new Error(data.error || 'Error en extracción de PDF'));
          return;
        }
        if (data.type === 'result') {
          const texto = this.limpiarTexto(data.payload?.text || '');
          const chunks = this.dividirEnChunksSemanticos(texto, 500);
          const totalCaracteres = texto.length;
          const totalPalabras = texto ? texto.split(/\s+/).filter(Boolean).length : 0;
          const totalPaginas = Number(data.payload?.meta?.pages) || 0;

          cleanup();
          resolve({
            contenidoCompleto: texto,
            chunks,
            estadisticas: { totalCaracteres, totalPalabras, totalPaginas },
          });
        }
      };

      worker.addEventListener('message', onMessage as EventListener);
      worker.addEventListener('error', onError as EventListener);

      // Enviar el ArrayBuffer al worker para extracción
      try {
        // Transferir el ArrayBuffer para evitar copia costosa
        worker.postMessage({ type: 'extract', source: 'arrayBuffer', data: arrayBuffer }, [arrayBuffer as unknown as ArrayBuffer]);
      } catch (err: any) {
        cleanup();
        reject(new Error(err?.message || 'No se pudo enviar datos al worker'));
      }
    });
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

  // Extracción de texto de DOCX (Microsoft Word) usando mammoth
  private async extraerTextoDOCX(archivo: File): Promise<{
    contenidoCompleto: string;
    chunks: DocumentoChunk[];
    estadisticas: { totalCaracteres: number; totalPalabras: number; totalPaginas: number };
  }> {
    const arrayBuffer = await archivo.arrayBuffer();

    try {
      // Carga dinámica del build de navegador de mammoth
      const mammothMod: any = await import('mammoth/mammoth.browser');
      const result = await mammothMod.extractRawText({ arrayBuffer });
      const textoPlano: string = typeof result?.value === 'string' ? result.value : '';

      const texto = this.limpiarTexto(textoPlano);
      const chunks = this.dividirEnChunksSemanticos(texto, 500);
      const totalCaracteres = texto.length;
      const totalPalabras = texto ? texto.split(/\s+/).filter(Boolean).length : 0;

      return {
        contenidoCompleto: texto,
        chunks,
        estadisticas: { totalCaracteres, totalPalabras, totalPaginas: 1 },
      };
    } catch (error: any) {
      console.error('Error extrayendo texto DOCX:', error);
      throw new Error(error?.message || 'No se pudo extraer texto del archivo DOCX');
    }
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