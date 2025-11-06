// components/DocumentUpload/DocumentUploadContainer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DocumentProcessorService } from '../../services/DocumentProcessorService';
import { DocumentoVectorial, ProcessingProgress } from '../../types/DocumentTypes';
import { DocumentUploadForm } from './DocumentUploadForm';
import { ProcessingIndicator } from './ProcessingIndicator';
import { DocumentResult } from './DocumentResult';

interface DocumentUploadContainerProps {
  onDocumentProcessed?: (document: DocumentoVectorial) => void;
  allowedTypes?: string[];
  maxSize?: number;
}

export const DocumentUploadContainer: React.FC<DocumentUploadContainerProps> = ({
  onDocumentProcessed,
  allowedTypes = ['.pdf', '.txt'],
  maxSize = 50 * 1024 * 1024 // 50MB por defecto
}) => {
  const [documentProcessor] = useState(() => DocumentProcessorService.getInstance());
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
  const [processedDocument, setProcessedDocument] = useState<DocumentoVectorial | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    setIsLoadingModel(true);
    try {
      await documentProcessor.servicioEmbeddings.inicializar();
      setIsModelLoaded(true);
    } catch (error) {
      setError('Error cargando modelo de IA. Inténtelo más tarde.');
    } finally {
      setIsLoadingModel(false);
    }
  };

  const handleFileUpload = useCallback(async (
    file: File,
    metadata: {
      tipoDocumentoId: number;
      tags: string[];
      departamento: string;
    }
  ) => {
    setError(null);
    setProcessedDocument(null);
    setProcessingProgress(null);

    try {
      // Validaciones
      if (!allowedTypes.some(type => file.name.toLowerCase().endsWith(type.replace('.', '')))) {
        throw new Error(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
      }

      if (file.size > maxSize) {
        throw new Error(`Archivo muy grande. Tamaño máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      }

      console.log('🚀 Iniciando procesamiento del documento:', file.name);

      const documento = await documentProcessor.procesarDocumentoCompleto(
        file,
        {
          tipo_documento_id: metadata.tipoDocumentoId,
          tags: metadata.tags,
          departamento: metadata.departamento
        },
        setProcessingProgress
      );

      console.log('✅ Documento procesado exitosamente:', documento);

      setProcessedDocument(documento);
      onDocumentProcessed?.(documento);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error procesando documento:', errorMessage);
      setError(errorMessage);
    }
  }, [documentProcessor, allowedTypes, maxSize, onDocumentProcessed]);

  const handleRetry = () => {
    setError(null);
    setProcessedDocument(null);
    setProcessingProgress(null);
  };

  const handleNewDocument = () => {
    setProcessedDocument(null);
    setProcessingProgress(null);
    setError(null);
  };

  if (!isModelLoaded && isLoadingModel) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-lg border-2 border-blue-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Cargando Modelo de IA</h3>
        <p className="text-blue-600 text-center">
          Descargando y configurando el modelo de procesamiento de texto...
          <br />
          <span className="text-sm">Esto puede tomar unos minutos la primera vez</span>
        </p>
      </div>
    );
  }

  if (!isModelLoaded) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error de Configuración</h3>
        <p className="text-red-600 mb-4">{error || 'No se pudo cargar el modelo de IA'}</p>
        <button
          onClick={initializeServices}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📄 Procesador Inteligente de Documentos
            <span className="text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded">
              IA Lista
            </span>
          </h2>
          <p className="mt-2 text-gray-600">
            Sube documentos para extraer texto y generar embeddings con IA
          </p>
        </div>

        <div className="p-6">
          {/* Formulario de Upload */}
          {!processingProgress && !processedDocument && (
            <DocumentUploadForm
              onFileUpload={handleFileUpload}
              allowedTypes={allowedTypes}
              maxSize={maxSize}
              disabled={!isModelLoaded}
            />
          )}

          {/* Indicador de Progreso */}
          {processingProgress && (
            <ProcessingIndicator
              progress={processingProgress}
              onCancel={handleRetry}
            />
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-red-800 font-semibold">Error de Procesamiento</h4>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Resultado */}
          {processedDocument && (
            <DocumentResult
              document={processedDocument}
              onNewDocument={handleNewDocument}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// components/DocumentUpload/DocumentUploadForm.tsx
import React, { useState, useRef } from 'react';

interface DocumentUploadFormProps {
  onFileUpload: (file: File, metadata: {
    tipoDocumentoId: number;
    tags: string[];
    departamento: string;
  }) => void;
  allowedTypes: string[];
  maxSize: number;
  disabled?: boolean;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onFileUpload,
  allowedTypes,
  maxSize,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumentoId, setTipoDocumentoId] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [departamento, setDepartamento] = useState('General');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleTagAdd = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    onFileUpload(selectedFile, {
      tipoDocumentoId,
      tags,
      departamento
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selector de Archivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Documento
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            selectedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
          {selectedFile ? (
            <div>
              <div className="text-green-600 text-lg mb-2">✅ {selectedFile.name}</div>
              <div className="text-sm text-gray-600">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Tipo desconocido'}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-gray-500 text-lg mb-2">📄 Click para seleccionar archivo</div>
              <div className="text-sm text-gray-400">
                Tipos permitidos: {allowedTypes.join(', ')} • Máximo: {formatFileSize(maxSize)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata del Documento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Documento
          </label>
          <select
            value={tipoDocumentoId}
            onChange={(e) => setTipoDocumentoId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <option value={1}>Manual de Procedimientos</option>
            <option value={2}>Política Empresarial</option>
            <option value={3}>Instructivo</option>
            <option value={4}>Formato/Plantilla</option>
            <option value={5}>Normativa</option>
            <option value={6}>Otros</option>
          </select>
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento
          </label>
          <select
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <option value="General">General</option>
            <option value="Finanzas">Finanzas</option>
            <option value="RRHH">Recursos Humanos</option>
            <option value="IT">Tecnología</option>
            <option value="Legal">Legal</option>
            <option value="Operaciones">Operaciones</option>
            <option value="Calidad">Calidad</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Etiquetas (Tags)
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
            placeholder="Agregar etiqueta..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleTagAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={disabled || !tagInput.trim()}
          >
            Agregar
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-blue-600 hover:text-blue-800"
                  disabled={disabled}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={!selectedFile || disabled}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {disabled ? 'Procesando...' : '🚀 Procesar Documento con IA'}
      </button>
    </form>
  );
};

// components/DocumentUpload/ProcessingIndicator.tsx
import React from 'react';
import { ProcessingProgress } from '../../types/DocumentTypes';

interface ProcessingIndicatorProps {
  progress: ProcessingProgress;
  onCancel?: () => void;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  progress,
  onCancel
}) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'extracting': return '📄';
      case 'embedding': return '🤖';
      case 'saving': return '💾';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'extracting': return 'Extrayendo Texto';
      case 'embedding': return 'Generando IA';
      case 'saving': return 'Guardando';
      case 'completed': return 'Completado';
      case 'error': return 'Error';
      default: return 'Procesando';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {getStageIcon(progress.stage)} {getStageText(progress.stage)}
        </h3>
        {onCancel && progress.stage !== 'completed' && progress.stage !== 'error' && (
          <button
            onClick={onCancel}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Barra de Progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{progress.message}</span>
          <span>{progress.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progress.stage === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Detalles del Proceso */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className={progress.progress >= 30 ? 'text-green-600' : 'text-gray-400'}>
            {progress.progress >= 30 ? '✅' : '⏳'} Extracción de texto
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={progress.progress >= 60 ? 'text-green-600' : 'text-gray-400'}>
            {progress.progress >= 60 ? '✅' : '⏳'} Generación de embeddings
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={progress.progress >= 90 ? 'text-green-600' : 'text-gray-400'}>
            {progress.progress >= 90 ? '✅' : '⏳'} Construcción del objeto
          </span>
        </div>
      </div>

      {/* Error */}
      {progress.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{progress.error}</p>
        </div>
      )}
    </div>
  );
};

// components/DocumentUpload/DocumentResult.tsx
import React, { useState } from 'react';
import { DocumentoVectorial } from '../../types/DocumentTypes';

interface DocumentResultProps {
  document: DocumentoVectorial;
  onNewDocument: () => void;
}

export const DocumentResult: React.FC<DocumentResultProps> = ({
  document,
  onNewDocument
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'embedding' | 'json'>('overview');
  const [showFullContent, setShowFullContent] = useState(false);

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado al portapapeles!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(document, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `documento_${document.documento_id}_vectorial.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="bg-green-50 p-6 border-b border-green-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-green-800 flex items-center gap-2 mb-2">
              ✅ Documento Procesado Exitosamente
            </h3>
            <p className="text-green-700 font-medium">{document.metadata.nombre_documento}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {document.metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadJSON}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              📥 Descargar JSON
            </button>
            <button
              onClick={onNewDocument}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              📄 Nuevo Documento
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {[
            { key: 'overview', label: '📊 Resumen', icon: '📊' },
            { key: 'content', label: '📄 Contenido', icon: '📄' },
            { key: 'embedding', label: '🤖 Vector IA', icon: '🤖' },
            { key: 'json', label: '💻 JSON', icon: '💻' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{document.dimensiones}</div>
                <div className="text-sm text-blue-800">Dimensiones Vector</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{document.chunks?.length || 0}</div>
                <div className="text-sm text-green-800">Chunks Generados</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {document.contenido_texto.split(' ').length}
                </div>
                <div className="text-sm text-purple-800">Palabras Extraídas</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatBytes(document.metadata.tamaño_archivo)}
                </div>
                <div className="text-sm text-yellow-800">Tamaño Archivo</div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Información del Documento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">ID:</span> {document.documento_id}</div>
                <div><span className="font-medium">Tipo:</span> {document.metadata.tipo_documento_id}</div>
                <div><span className="font-medium">Departamento:</span> {document.metadata.departamento}</div>
                <div><span className="font-medium">Extensión:</span> {document.metadata.extension}</div>
                <div><span className="font-medium">Modelo IA:</span> {document.modelo_embedding}</div>
                <div><span className="font-medium">Fecha Procesamiento:</span> {formatDate(document.fecha_vectorizacion)}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-900">Texto Extraído</h4>
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showFullContent ? 'Mostrar menos' : 'Mostrar todo'}
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {showFullContent 
                  ? document.contenido_texto 
                  : document.contenido_texto.substring(0, 1000) + (document.contenido_texto.length > 1000 ? '...' : '')
                }
              </pre>
            </div>

            {/* Chunks */}
            {document.chunks && document.chunks.length > 0 && (
              <div className="mt-6">
                <h5 className="font-medium text-gray-900 mb-3">Chunks Procesados ({document.chunks.length})</h5>
                <div className="space-y-2">
                  {document.chunks.slice(0, 3).map((chunk, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                      <div className="text-xs text-gray-600 mb-1">
                        Chunk {chunk.numero_chunk} • {chunk.contenido.length} caracteres
                      </div>
                      <div className="text-sm text-gray-700">
                        {chunk.contenido.substring(0, 200)}...
                      </div>
                    </div>
                  ))}
                  {document.chunks.length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... y {document.chunks.length - 3} chunks más
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'embedding' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-900">Vector de Embeddings</h4>
              <button
                onClick={() => copyToClipboard(JSON.stringify(document.embedding))}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                📋 Copiar Vector
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">
                Dimensiones: {document.dimensiones} • Modelo: {document.modelo_embedding}
              </div>
              <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto">
                <code className="text-xs text-gray-700">
                  [{document.embedding.slice(0, 10).map(n => n.toFixed(4)).join(', ')}, ...]
                </code>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Mostrando primeros 10 valores de {document.embedding.length} dimensiones
              </div>
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-900">Objeto JSON Completo</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(document, null, 2))}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  📋 Copiar
                </button>
                <button
                  onClick={downloadJSON}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  💾 Descargar
                </button>
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg max-h-96 overflow-auto">
              <pre className="text-green-400 text-sm">
                {JSON.stringify(document, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};