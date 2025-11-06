import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, 
  X, Download, Eye, Users, Building2, Briefcase, Send, Loader 
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { ExcelOrganizationalParser, ParsedOrganizationalData, ValidationError } from '../../../utils/excelParser';
import { ExcelTemplateGenerator } from '../../../utils/excelTemplateGenerator';
import { organizacionesService } from '../../../services/organizaciones.service';
import { AlertService } from '../../ui/alerts/AlertService';
import { Modal } from '../../ui/modal/Modal';
import styles from './CargaMasiva.module.css';

interface CargaMasivaProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: ParsedOrganizationalData) => void;
  organizacionActual?: {
    organizacionId: number;
    razonSocial: string;
    codigo?: string;
  } | null;
  resetTrigger?: number; // 🔧 AGREGADO: Trigger para limpiar el estado desde el padre
}

interface LoadingState {
  isLoading: boolean;
  stage: 'upload' | 'validation' | 'processing' | 'complete';
  progress: number;
  message: string;
}

export const CargaMasiva: React.FC<CargaMasivaProps> = ({ 
  isOpen, 
  onClose, 
  onDataLoaded,
  organizacionActual,
  resetTrigger // 🔧 AGREGADO: Prop para limpiar desde el padre
}) => {
  const { colors } = useTheme();
  const { user, organizationInfo } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedOrganizationalData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    stage: 'upload',
    progress: 0,
    message: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSendingToBackend, setIsSendingToBackend] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [isOpen]);

  // 🔧 AGREGADO: Limpiar estado cuando el padre lo solicite
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      resetData();
    }
  }, [resetTrigger]);

  const resetData = () => {
    setSelectedFile(null);
    setParsedData(null);
    setErrors([]);
    setLoading({ isLoading: false, stage: 'upload', progress: 0, message: '' });
    setShowPreview(false);
    setValidationErrors([]);
    setShowValidationModal(false);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setErrors([]);
      setParsedData(null);
      setShowPreview(false);
      
      // Validar estructura del archivo
      setLoading({
        isLoading: true,
        stage: 'validation',
        progress: 20,
        message: 'Validando estructura del archivo...'
      });

      try {
        const validation = await ExcelOrganizationalParser.validateExcelStructure(file);
        if (!validation.isValid) {
          setErrors(validation.errors);
          setLoading({ isLoading: false, stage: 'upload', progress: 0, message: '' });
          return;
        }

        // Procesar archivo
        setLoading({
          isLoading: true,
          stage: 'processing',
          progress: 60,
          message: 'Procesando datos organizacionales...'
        });

        // Preparar información de la organización para el parser usando contexto del usuario
        // Descartamos organizacionActual ya que no debe ser hardcodeada para no Super Admins
        const organizacionContexto = organizationInfo.hasOrganization && organizationInfo.id ? {
          organizacionId: organizationInfo.id,
          razonSocial: organizationInfo.displayName,
          codigo: organizationInfo.code || organizationInfo.displayName.substring(0, 10).toUpperCase()
        } : undefined;

        const data = await ExcelOrganizationalParser.parseExcelFile(file, organizacionContexto);
        
        // Verificar si hay errores de validación
        if (data.hasValidationErrors) {
          setValidationErrors(data.validationErrors);
          setShowValidationModal(true);
          setLoading({ isLoading: false, stage: 'upload', progress: 0, message: '' });
          return;
        }
        
        setParsedData(data);
        
        setLoading({
          isLoading: false,
          stage: 'complete',
          progress: 100,
          message: 'Datos procesados exitosamente'
        });
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Error desconocido']);
        setLoading({ isLoading: false, stage: 'upload', progress: 0, message: '' });
      }
    }
  }, [organizationInfo.hasOrganization, organizationInfo.id, organizationInfo.displayName, organizationInfo.code]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    // Solo deshabilitar mientras está cargando; permitir vista previa aunque no exista organización
    disabled: loading.isLoading
  });

  const handleLoadData = async () => {
    if (!parsedData || parsedData.hasValidationErrors) return;
    
    // 🔧 AGREGADO: Confirmación para vista previa local
    const confirmed = await AlertService.confirm(
      `Los datos se cargarán solo para vista previa. No se guardarán en el servidor hasta usar el botón "Guardar".

Se mostrarán ${parsedData.unidades.length} unidades, ${parsedData.posiciones.length} posiciones y ${parsedData.personas.length} personas.

¿Desea continuar?`,
      {
        title: 'Confirmar Vista Previa',
        confirmText: 'Cargar Vista Previa',
        cancelText: 'Cancelar'
      }
    );

    if (!confirmed) {
      return;
    }
    onDataLoaded(parsedData);
    
    // Limpiar estado antes de cerrar
    setSelectedFile(null);
    setParsedData(null);
    setErrors([]);
    setLoading({ isLoading: false, stage: 'upload', progress: 0, message: '' });
    setShowPreview(false);
    setValidationErrors([]);
    setShowValidationModal(false);
    
    onClose();
  };

  const handleReset = () => {
    // 🔧 MEJORA: Usar resetData() que es más completa y limpia todos los estados
    resetData();
  };

  const downloadTemplate = () => {
    try {
      ExcelTemplateGenerator.createSampleTemplate();
    } catch (error) {
      console.error('Error al generar plantilla:', error);
      // Fallback: intentar descarga estática
      const link = document.createElement('a');
      link.href = '/templates/plantilla_organizacional.xlsx';
      link.download = 'plantilla_organizacional.xlsx';
      link.click();
    }
  };

  const handleSendToBackend = async () => {
    if (!parsedData || parsedData.hasValidationErrors) return;

    // 🔧 AGREGADO: Confirmación para eliminar estructura existente antes de la carga masiva
    const confirmed = await AlertService.confirm(
      `La carga masiva eliminará la estructura organizacional actual y la reemplazará con los datos del archivo Excel.

Se procesarán ${parsedData.unidades.length} unidades, ${parsedData.posiciones.length} posiciones y ${parsedData.personas.length} personas.

Esta acción no se puede deshacer. ¿Desea continuar?`,
      {
        title: 'Confirmar Carga Masiva',
        confirmText: 'Continuar',
        cancelText: 'Cancelar'
      }
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSendingToBackend(true);
      
      // 🔧 PASO 1: Eliminar estructura organizacional existente ANTES de cargar nuevos datos
      if (organizacionActual?.organizacionId) {
        try {
          const deleteResponse = await organizacionesService.deleteEstructuraOrganizacional(
            organizacionActual.organizacionId, 
            true, // confirmarEliminacionFisica
            'ELIMINAR_ESTRUCTURA_FISICA' // textoConfirmacion requerido por el API
          );
          
          if (!deleteResponse.success) {
            throw new Error(deleteResponse.message || 'Error al eliminar la estructura existente');
          }
          AlertService.info('Estructura eliminada. Cargando nuevos datos...');
          
        } catch (deleteError) {
          console.error('❌ [CARGA MASIVA] Error al eliminar estructura existente:', deleteError);
          const errorMessage = deleteError instanceof Error ? deleteError.message : 'Error desconocido';
          AlertService.error(`No se pudo eliminar la estructura existente: ${errorMessage}`);
          setIsSendingToBackend(false);
          return;
        }
      }
      
      // 🔧 PASO 2: Proceder con la carga masiva de nuevos datos
      // Convertir al formato del endpoint
      const endpointData = ExcelOrganizationalParser.convertToEndpointFormat(parsedData.cargaMasivaData);
      const response = await organizacionesService.ejecutarCargaMasiva(endpointData);
      
      if (response.success) {
        const data = response.data;
        
        const mensaje = `Carga masiva completada exitosamente.
        
Unidades: ${data.unidades?.length || 0}
Posiciones: ${data.posiciones?.length || 0}  
Personas: ${data.personas?.length || 0}
Asignaciones: ${data.personaPosiciones?.length || 0}

La estructura anterior fue reemplazada completamente.`;
        
        AlertService.success(mensaje);
        
        // Notificar al componente padre que se cargaron los datos
        if (onDataLoaded) {
          onDataLoaded(parsedData);
        }
        
        // Manejar errores si los hay
        if (data.errores && data.errores.length > 0) {
          console.warn('⚠️ Errores en carga masiva:', data.errores);
          AlertService.warning(`Se encontraron algunos errores:\n${data.errores.join('\n')}`);
        }
        
        // Manejar advertencias si las hay
        if (data.advertencias && data.advertencias.length > 0) {
          console.info('ℹ️ Advertencias en carga masiva:', data.advertencias);
          AlertService.info(`Advertencias:\n${data.advertencias.join('\n')}`);
        }
        
        // 🔧 NUEVO: Cerrar modal automáticamente después de carga exitosa
        setTimeout(() => {
          resetData();
          onClose(); // Cerrar el modal automáticamente
        }, 2000); // Reducido a 2 segundos para mejor UX
        
      } else {
        throw new Error(response.message || 'Error desconocido en la carga masiva');
      }
    } catch (error) {
      console.error('❌ [CARGA MASIVA] Error al enviar al backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      AlertService.error(`No se pudo completar la carga masiva:\n${errorMessage}`);
      setErrors([errorMessage]);
    } finally {
      setIsSendingToBackend(false);
    }
  };

  if (!isOpen) return null;

  return (
      <>
      <Modal
         isOpen={isOpen}
         onClose={() => {
           if (validationErrors.length > 0 || errors.length > 0) {
             resetData();
           }
           onClose();
         }}
         title="Carga Masiva de Estructura Organizacional"
         size="xl"
         hideFooter={true}
       >
        <div>
         
         <div className={styles.modalBody}>
          {/* Información del template */}
          <div className={styles.templateInfo}>
            <div className={styles.templateHeader}>
              <FileSpreadsheet className={styles.textPrimary} size={20} />
              <h3 className={styles.textPrimary}>Formato de Archivo</h3>
            </div>
            <p className={styles.textSecondary}>
              El archivo Excel debe contener las siguientes columnas en orden:
            </p>
            <div className={styles.columnsList}>
              <span>Código Unidad</span>
              <span>Nombre Unidad</span>
              <span>Unidad Padre</span>
              <span>Tipo Unidad</span>
              <span>Posición</span>
              <span>Categoría</span>
              <span>Nombre</span>
              <span>Apellido Paterno</span>
              <span>Apellido Materno</span>
              <span>Tipo Documento</span>
              <span>Número Documento</span>
              <span>Email</span>
              <span>Celular</span>
              <span>Fecha Nacimiento</span>
              <span>Fecha Ingreso</span>
              <span>Es Usuario</span>
            </div>
            <button 
              onClick={downloadTemplate}
              className={`${styles.downloadButton} ${styles.primaryButton}`}
            >
              <Download size={16} />
              Descargar Plantilla
            </button>
          </div>

          {/* Zona de carga */}
          <div 
            {...getRootProps()} 
            className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${loading.isLoading ? styles.dropzoneDisabled : ''}`}
          >
            <input {...getInputProps()} />
            
            {loading.isLoading ? (
              <div className={styles.loadingContent}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.textPrimary}>{loading.message}</p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${loading.progress}%` }}
                  ></div>
                </div>
              </div>
            ) : selectedFile ? (
              <div className={styles.fileSelected}>
                <FileSpreadsheet size={48} className={styles.textPrimary} />
                <p className={styles.textPrimary}>{selectedFile.name}</p>
                <p className={styles.textSecondary}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className={styles.dropzoneContent}>
                <Upload size={48} className={styles.textSecondary} />
                <p className={styles.textPrimary}>
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí o haz clic para seleccionar'}
                </p>
                <p className={styles.textSecondary}>
                  Formatos soportados: .xlsx, .xls
                </p>
              </div>
            )}
          </div>

          {/* Errores */}
          {errors.length > 0 && (
            <div className={styles.errorContainer}>
              <AlertCircle size={20} />
              <div>
                <h4>Errores encontrados:</h4>
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Vista previa de datos */}
          {parsedData && (
            <div className={styles.previewContainer}>
              <div className={styles.previewHeader}>
                <h3 className={styles.textPrimary}>Datos Procesados</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={styles.previewToggle}
                >
                  <Eye size={16} />
                  {showPreview ? 'Ocultar' : 'Ver'} Detalle
                </button>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <Building2 className={styles.textPrimary} size={24} />
                  <div>
                    <h4 className={styles.textPrimary}>{parsedData.unidades.length}</h4>
                    <p className={styles.textSecondary}>Unidades</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <Briefcase className={styles.textPrimary} size={24} />
                  <div>
                    <h4 className={styles.textPrimary}>{parsedData.posiciones.length}</h4>
                    <p className={styles.textSecondary}>Posiciones</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <Users className={styles.textPrimary} size={24} />
                  <div>
                    <h4 className={styles.textPrimary}>{parsedData.personas.length}</h4>
                    <p className={styles.textSecondary}>Personas</p>
                  </div>
                </div>
              </div>

              {showPreview && (
                <div className={styles.previewDetail}>
                  <div className={styles.previewSection}>
                    <h4 className={styles.textPrimary}>Organización</h4>
                    <p className={styles.textSecondary}>
                      {parsedData.organizacion.razonSocial}
                    </p>
                  </div>

                  <div className={styles.previewSection}>
                    <h4 className={styles.textPrimary}>Unidades Principales</h4>
                    <div className={styles.itemsList}>
                      {parsedData.unidades.slice(0, 5).map((unidad, index) => (
                        <div key={index} className={styles.previewItem}>
                          <span className={styles.textPrimary}>{unidad.nombre}</span>
                          <span className={styles.textSecondary}>({unidad.tipoUnidad})</span>
                        </div>
                      ))}
                      {parsedData.unidades.length > 5 && (
                        <p className={styles.textSecondary}>
                          ... y {parsedData.unidades.length - 5} más
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button
            onClick={handleReset}
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            disabled={loading.isLoading || isSendingToBackend}
          >
            Reiniciar
          </button>
          
          <button
            onClick={handleLoadData}
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            disabled={!parsedData || parsedData?.hasValidationErrors || loading.isLoading || isSendingToBackend}
          >
            <Eye size={16} />
            Cargar en Vista Previa
          </button>

          <button
            onClick={handleSendToBackend}
            className={`${styles.actionButton} ${styles.primaryButton}`}
            disabled={!parsedData || parsedData?.hasValidationErrors || loading.isLoading || isSendingToBackend}
          >
            {isSendingToBackend ? (
              <>
                <Loader size={16} className={styles.spinning} />
                Guardando...
              </>
            ) : (
              <>
                <Send size={16} />
                Guardar
              </>
            )}
          </button>
        </div>
        </div>
        </Modal>

       {/* Modal de Errores de Validación */}
      {showValidationModal && (
        <Modal
          isOpen={showValidationModal}
          onClose={() => {
            setShowValidationModal(false);
            if (validationErrors.length > 0) {
              resetData();
            }
          }}
          title="Errores de Validación Encontrados"
          size="xl"
          hideFooter={true}
        >
          <div className={`${styles.modalBody} ${styles.maxHeightScroll}`}>
            <div className={styles.errorHeader}>
              <h4 className={styles.errorHeaderTitle}>
                Se encontraron {validationErrors.length} errores en el archivo Excel
              </h4>
              <p className={styles.errorHeaderText}>
                Por favor, corrija los siguientes errores antes de continuar con la carga:
              </p>
            </div>

            <div className={styles.flexGapSmall}>
              {validationErrors.map((error, index) => (
                <div key={index} className={styles.validationError}>
                  <div className={styles.flexRow}>
                    <span className={styles.validationErrorTitle}>
                      Fila {error.row}, Columna {error.column} ({error.field})
                    </span>
                    <span className={styles.errorBadge}>
                      ERROR
                    </span>
                  </div>
                  <p className={styles.validationErrorMessage}>
                    {error.message}
                  </p>
                  {error.value && (
                    <p className={styles.validationErrorValue}>
                      Valor actual: "{error.value}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              onClick={() => setShowValidationModal(false)}
              className={`${styles.actionButton} ${styles.secondaryButton}`}
            >
              Cerrar
            </button>
            
            <button
              onClick={() => {
                setShowValidationModal(false);
                handleReset();
              }}
              className={`${styles.actionButton} ${styles.primaryButton}`}
            >
              Cargar Nuevo Archivo
            </button>
          </div>
        </Modal>
      )}
    </>
   );
};