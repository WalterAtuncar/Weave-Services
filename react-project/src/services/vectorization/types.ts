// types/DocumentVectorization.ts
export interface DocumentoMetadata {
  nombre_documento: string;
  tipo_documento_id: number;
  fecha_creacion: string;
  tags: string[];
  tamaño_archivo: number;
  extension: string;
  departamento?: string;
}

export interface DocumentoChunk {
  numero_chunk: number;
  contenido: string;
  embedding_chunk?: number[];
  posicion_inicio: number;
  posicion_fin: number;
}

export interface DocumentoVectorial {
  documento_id: number;
  contenido_texto: string;
  embedding: number[];
  metadata: DocumentoMetadata;
  chunks: DocumentoChunk[];
  modelo_embedding: string;
  dimensiones: number;
  hash_contenido: string;
  fecha_vectorizacion: string;
  version: number;
  estado: 'activo' | 'inactivo' | 'procesando';
}

export interface ProcessingProgress {
  stage: 'extracting' | 'chunking' | 'embedding' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface EmbeddingResult {
  embedding: number[];
  dimensiones: number;
  modelo_usado: string;
}

export interface VectorizationConfig {
  chunkSize: number;
  chunkOverlap: number;
  modelName: string;
  dimensions: number;
}