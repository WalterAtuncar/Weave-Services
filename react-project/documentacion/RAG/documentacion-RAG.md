# Implementación RAG con PDF en React (modo keyword-only)

ATENCIÓN: Esta documentación histórica describe una implementación basada en `@xenova/transformers` y `onnxruntime-web`. El proyecto actual ha sido migrado a un modo ligero keyword-only sin dependencias de ML. Por tanto, las secciones que instalan o configuran `@xenova/transformers`/`onnxruntime-web` quedan obsoletas.

Use las utilidades actuales (`EmbeddingService` y workers RAG/QA) que funcionan sin modelos externos.

## 1. Procesamiento del PDF

### Instalación de dependencias
Para procesar archivos PDF en el cliente, necesitarás instalar las siguientes librerías:

```bash
# Para procesamiento de PDF en el cliente
npm install pdfjs-dist

# Alternativas para procesamiento más avanzado (si necesitas backend)
npm install pdf-parse pdf2pic
```

### Configuración de PDF.js
```javascript
import * as pdfjsLib from 'pdfjs-dist';

// Configurar worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### Función para extraer texto del PDF
```javascript
const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
};
```

## 2. Chunking y Embeddings

### Nota sobre Xenova
No es necesario instalar `@xenova/transformers`. La vectorización se realiza mediante hashing de tokens en el cliente.

### Función para dividir texto en chunks
```javascript
const splitIntoChunks = (text, chunkSize = 500, overlap = 50) => {
  const chunks = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      // Mantener overlap
      const words = currentChunk.split(' ');
      currentChunk = words.slice(-overlap).join(' ') + ' ' + sentence;
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};
```

### Generación de embeddings
```javascript
import { pipeline } from '@xenova/transformers';

// Inicializar modelo de embeddings
const initializeEmbedder = async () => {
  return await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
};

// Generar embeddings para un texto
const generateEmbeddings = async (embedder, text) => {
  const embeddings = await embedder(text, { 
    pooling: 'mean', 
    normalize: true 
  });
  return embeddings.data;
};
```

## 3. Almacenamiento Vectorial (Cliente)

### Implementación simple con similitud coseno
```javascript
// Función para calcular similitud coseno
const cosineSimilarity = (a, b) => {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

// Búsqueda por similitud
const findSimilarChunks = (queryEmbedding, documentChunks, topK = 5) => {
  const similarities = documentChunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};
```

### Alternativa con librerías externas
```bash
# Para implementaciones más eficientes
npm install ml-matrix
npm install hnswlib-node  # Solo funciona en Node.js, no en browser
```

## 4. Estructura Básica del Componente React

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { pipeline } from '@xenova/transformers';
import * as pdfjsLib from 'pdfjs-dist';

const RAGComponent = () => {
  // Estados
  const [embedder, setEmbedder] = useState(null);
  const [generator, setGenerator] = useState(null);
  const [documentChunks, setDocumentChunks] = useState([]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);

  // Cargar modelos al montar el componente
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Cargando modelos...');
        
        const embedModel = await pipeline(
          'feature-extraction', 
          'Xenova/all-MiniLM-L6-v2'
        );
        
        const genModel = await pipeline(
          'text2text-generation', 
          'Xenova/flan-t5-small'
        );
        
        setEmbedder(embedModel);
        setGenerator(genModel);
        setModelLoading(false);
        console.log('Modelos cargados exitosamente');
      } catch (error) {
        console.error('Error cargando modelos:', error);
        setModelLoading(false);
      }
    };
    
    loadModels();
  }, []);

  // Procesar archivo PDF
  const processPDF = useCallback(async (file) => {
    if (!embedder) return;
    
    setLoading(true);
    try {
      // Extraer texto del PDF
      const fullText = await extractTextFromPDF(file);
      
      // Dividir en chunks
      const chunks = splitIntoChunks(fullText, 500, 50);
      
      // Generar embeddings para cada chunk
      const chunksWithEmbeddings = await Promise.all(
        chunks.map(async (chunk, index) => ({
          id: index,
          text: chunk,
          embedding: await generateEmbeddings(embedder, chunk)
        }))
      );
      
      setDocumentChunks(chunksWithEmbeddings);
      console.log(`Procesados ${chunksWithEmbeddings.length} chunks`);
    } catch (error) {
      console.error('Error procesando PDF:', error);
    } finally {
      setLoading(false);
    }
  }, [embedder]);

  // Realizar consulta RAG
  const performRAGQuery = useCallback(async () => {
    if (!query || !embedder || !generator || documentChunks.length === 0) return;
    
    setLoading(true);
    try {
      // Generar embedding de la consulta
      const queryEmbedding = await generateEmbeddings(embedder, query);
      
      // Encontrar chunks similares
      const relevantChunks = findSimilarChunks(queryEmbedding, documentChunks, 3);
      
      // Crear contexto para el generador
      const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
      const prompt = `Contexto: ${context}\n\nPregunta: ${query}\n\nRespuesta:`;
      
      // Generar respuesta
      const result = await generator(prompt, {
        max_length: 200,
        temperature: 0.7
      });
      
      setResponse(result[0].generated_text);
    } catch (error) {
      console.error('Error en consulta RAG:', error);
      setResponse('Error al procesar la consulta');
    } finally {
      setLoading(false);
    }
  }, [query, embedder, generator, documentChunks]);

  return (
    <div className="rag-component" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>RAG con PDF usando Xenova Transformers</h2>
      
      {modelLoading && (
        <div>Cargando modelos de IA... Esto puede tomar unos minutos.</div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="pdf-upload">Subir PDF:</label>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files[0] && processPDF(e.target.files[0])}
          disabled={!embedder || loading}
        />
      </div>
      
      {documentChunks.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p>✅ Documento procesado: {documentChunks.length} chunks generados</p>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="query-input">Hacer pregunta:</label>
        <input
          id="query-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe tu pregunta sobre el documento..."
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          disabled={loading || documentChunks.length === 0}
        />
        <button
          onClick={performRAGQuery}
          disabled={!query || loading || documentChunks.length === 0}
          style={{ marginTop: '10px', padding: '10px 20px' }}
        >
          {loading ? 'Procesando...' : 'Consultar'}
        </button>
      </div>
      
      {response && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px' 
        }}>
          <h3>Respuesta:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default RAGComponent;
```

## 5. Dependencias Necesarias

### package.json
```json
{
  "name": "rag-pdf-react",
  "version": "1.0.0",
  "dependencies": {
    "@xenova/transformers": "^2.17.1",
    "pdfjs-dist": "^4.0.379",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

### Instalación completa
```bash
# Crear proyecto React (si no existe)
npx create-react-app rag-pdf-app
cd rag-pdf-app

# Instalar dependencias principales
npm install @xenova/transformers pdfjs-dist

# Dependencias opcionales para mejores funcionalidades
npm install ml-matrix lodash

# Para desarrollo
npm install --save-dev @types/pdfjs-dist
```

## 6. Consideraciones Importantes

### Performance y Optimización

#### Uso de Web Workers
Para evitar bloquear el hilo principal durante el procesamiento:

```javascript
// worker.js
import { pipeline } from '@xenova/transformers';

let embedder = null;
let generator = null;

self.onmessage = async function(e) {
  const { type, data, id } = e.data;
  
  try {
    switch (type) {
      case 'init-embedder':
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        self.postMessage({ type: 'embedder-ready', id });
        break;
        
      case 'init-generator':
        generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small');
        self.postMessage({ type: 'generator-ready', id });
        break;
        
      case 'generate-embeddings':
        if (!embedder) throw new Error('Embedder not initialized');
        const embeddings = await embedder(data, { pooling: 'mean', normalize: true });
        self.postMessage({ type: 'embeddings-result', data: embeddings.data, id });
        break;
        
      case 'generate-text':
        if (!generator) throw new Error('Generator not initialized');
        const result = await generator(data.prompt, data.options);
        self.postMessage({ type: 'text-result', data: result, id });
        break;
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message, id });
  }
};
```

#### Hook para usar el Worker
```javascript
import { useEffect, useRef, useState } from 'react';

const useRAGWorker = () => {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const callbacksRef = useRef(new Map());

  useEffect(() => {
    workerRef.current = new Worker('/worker.js');
    
    workerRef.current.onmessage = (e) => {
      const { type, data, id, error } = e.data;
      const callback = callbacksRef.current.get(id);
      
      if (callback) {
        if (error) {
          callback.reject(new Error(error));
        } else {
          callback.resolve(data);
        }
        callbacksRef.current.delete(id);
      }
      
      if (type === 'embedder-ready' || type === 'generator-ready') {
        setIsReady(true);
      }
    };

    // Inicializar modelos
    workerRef.current.postMessage({ type: 'init-embedder' });
    workerRef.current.postMessage({ type: 'init-generator' });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const generateEmbeddings = (text) => {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random();
      callbacksRef.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ type: 'generate-embeddings', data: text, id });
    });
  };

  return { isReady, generateEmbeddings };
};
```
### Limitaciones y Soluciones

#### Limitaciones del Cliente
- **Memoria**: Los modelos pueden consumir mucha memoria RAM
- **Velocidad**: El procesamiento es más lento que en servidor
- **Tamaño de modelos**: Los modelos grandes pueden tardar en cargar

#### Soluciones Recomendadas
1. **Usar modelos más pequeños** para mejor rendimiento
2. **Implementar caché** para embeddings ya calculados
3. **Chunking inteligente** basado en párrafos o secciones
4. **Feedback visual** durante el procesamiento
5. **Fallback a API externa** para documentos muy grandes

### Modelos Alternativos

#### Para embeddings más rápidos
```javascript
// Modelo más pequeño y rápido
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L12-v2');

// Para idioma español específicamente
const embedder = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
```

#### Para generación de texto
```javascript
// Modelo más pequeño
const generator = await pipeline('text2text-generation', 'Xenova/flan-t5-base');

// Para conversación
const generator = await pipeline('text-generation', 'Xenova/gpt2');
```

### Configuración de Webpack/Vite

Para proyectos con Vite, añadir en `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@xenova/transformers']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
});
```

Esta guía te proporciona una base sólida para implementar RAG con PDFs en React. Puedes comenzar con la implementación básica y luego optimizar según tus necesidades específicas de rendimiento y funcionalidad.