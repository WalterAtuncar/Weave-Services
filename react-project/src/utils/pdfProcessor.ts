// Procesador de PDF simplificado - solo validaciones básicas
export interface PDFExtractionResult {
  text: string;
  numPages: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
  pages: Array<{
    pageNumber: number;
    text: string;
    wordCount: number;
  }>;
}

/**
 * Validación básica de archivo PDF
 */
export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tipo de archivo
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    return { isValid: false, error: 'El archivo debe ser un PDF' };
  }

  // Validar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'El archivo es demasiado grande (máximo 10MB)' };
  }

  // Validar que no esté vacío
  if (file.size === 0) {
    return { isValid: false, error: 'El archivo está vacío' };
  }

  return { isValid: true };
};

/**
 * Extracción de texto simulada - retorna datos básicos del archivo
 */
export const extractTextFromPDF = async (file: File): Promise<PDFExtractionResult> => {
  const validation = validatePDFFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Simular extracción básica sin procesamiento real
  return {
    text: `Contenido del archivo: ${file.name}`,
    numPages: 1, // Valor por defecto
    metadata: {
      title: file.name.replace('.pdf', ''),
      creator: 'Usuario',
      creationDate: new Date(file.lastModified),
    },
    pages: [{
      pageNumber: 1,
      text: `Contenido del archivo: ${file.name}`,
      wordCount: 5
    }]
  };
};

/**
 * Dividir texto en chunks
 */
export const splitIntoChunks = (text: string, chunkSize: number = 500, overlap: number = 50): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }
  }
  
  return chunks.length > 0 ? chunks : [text];
};

/**
 * Obtener estadísticas básicas del texto
 */
export const getTextStatistics = (text: string) => {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
  
  return {
    characters: text.length,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0
  };
};

/**
 * Validar texto extraído
 */
export const validateExtractedText = (text: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!text || text.trim().length === 0) {
    issues.push('No se pudo extraer texto del PDF');
  }
  
  if (text.length < 10) {
    issues.push('El texto extraído es muy corto');
  }
  
  const stats = getTextStatistics(text);
  if (stats.words < 5) {
    issues.push('El documento contiene muy pocas palabras');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};