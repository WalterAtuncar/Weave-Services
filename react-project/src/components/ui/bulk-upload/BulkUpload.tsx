import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileText, AlertTriangle, CheckCircle, X, Loader } from 'lucide-react';
import { Button } from '../button/button';
import { AlertService } from '../alerts/AlertService';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useFamiliasSistema } from '../../../hooks/useFamiliasSistema';
import { 
  ExcelSistemasParser, 
  ExcelSistemasParseResult, 
  ParsedSistemaData 
} from '../../../utils/excelSistemasParser';
import { ExcelProcesosParser, ExcelProcesosParseResultLike } from '../../../utils/excelProcesosParser';
import { 
  ExcelSistemasTemplateGenerator 
} from '../../../utils/excelSistemasTemplateGenerator';
import { ExcelProcesosTemplateGenerator, TipoProceso } from '../../../utils/excelProcesosTemplateGenerator';
import { tiposProcesoService } from '../../../services/tipos-proceso.service';
import styles from './BulkUpload.module.css';

export interface BulkUploadProps {
  organizacionId: number;
  onValidationComplete?: (result: any) => void;
  sistemasExistentes?: any[];
  disabled?: boolean;
  // Nuevos props opcionales para personalizar textos de encabezado
  title?: string;
  description?: string;
  // Nuevo: tipo de plantilla a descargar
  templateType?: 'sistemas' | 'procesos';
  // Props que ya se usan en el componente pero faltaban en la interfaz
  compact?: boolean;
  onCancel?: () => void;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({
  organizacionId,
  onValidationComplete,
  onCancel,
  sistemasExistentes = [],
  disabled = false,
  compact = false,
  title = 'Carga Masiva de Sistemas',
  description = 'Descarga la plantilla Excel con ejemplos e importa múltiples sistemas y módulos.',
  templateType = 'sistemas'
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hook para obtener familias dinámicas del backend
  const { familiasSistemaActivas, loading: familiasLoading, error: familiasError } = useFamiliasSistema();
  
  // Estados
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ExcelSistemasParseResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [tiposProceso, setTiposProceso] = useState<TipoProceso[]>([]);
  const [tiposProcesoLoading, setTiposProcesoLoading] = useState(false);

  // Derivados para controlar bloqueo en "procesos"
  const isProcesos = templateType === 'procesos';
  const tiposProcesoReady = !tiposProcesoLoading && tiposProceso.length > 0;
  const procesosBlocked = isProcesos && !tiposProcesoReady; // Bloquear descarga y carga si no hay tipos

  // Efecto para cargar tipos de proceso cuando el templateType es 'procesos'
  useEffect(() => {
    if (templateType === 'procesos' && organizationInfo?.id) {
      const cargarTiposProceso = async () => {
        try {
          setTiposProcesoLoading(true);
          const tiposApi = await tiposProcesoService.obtenerTodosTiposProceso(organizationInfo.id);
          // Mapear desde TipoProcesoEntity (backend) a la interfaz TipoProceso que usa el generador de Excel
          const tiposMapeados: TipoProceso[] = tiposApi.map((tp: any) => ({
            tipoProcesoId: tp.tipoProcesoId,
            nombre: tp.nombreTipoProceso,
            descripcion: tp.descripcionTipoProceso ?? undefined,
          }));
          setTiposProceso(tiposMapeados);
          // Advertir si la organización no tiene tipos configurados
          if (!tiposMapeados || tiposMapeados.length === 0) {
            AlertService.warning('Faltan configurar los tipos de proceso de la organización. No es posible cargar ni descargar la plantilla.');
          }
        } catch (error) {
          console.error('Error al cargar tipos de proceso:', error);
          AlertService.error('Error al cargar tipos de proceso');
        } finally {
          setTiposProcesoLoading(false);
        }
      };

      cargarTiposProceso();
    }
  }, [templateType, organizationInfo?.id]);

  // Manejadores de drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !procesosBlocked) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || procesosBlocked) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Manejador de selección de archivo
  const handleFileSelection = async (file: File) => {
    if (!file) return;

    // Si está bloqueado para procesos, informar y salir
    if (procesosBlocked) {
      AlertService.error('Faltan configurar los tipos de proceso de la organización. No es posible cargar la plantilla.');
      return;
    }

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      AlertService.error('Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    // Validar tamaño
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      AlertService.error('El archivo excede el tamaño máximo permitido (10MB)');
      return;
    }

    setSelectedFile(file);
    setValidationResult(null);
    
    // Validar automáticamente
    await validateFile(file);
  };

  // Validar archivo
  const validateFile = async (file: File) => {
    // Bloquear validación si faltan tipos de proceso
    if (procesosBlocked) {
      AlertService.error('Faltan configurar los tipos de proceso de la organización. No es posible validar ni importar.');
      return;
    }

    setIsValidating(true);
    const loadingToastId = AlertService.loading('Validando archivo Excel...');

    try {
      const result = templateType === 'procesos'
        ? await ExcelProcesosParser.parseExcelFile(file, organizacionId, tiposProceso)
        : await ExcelSistemasParser.parseExcelFile(file, organizacionId, familiasSistemaActivas);

      // Normalizar summary para mantener compatibilidad de UI
      const normalizedResult: any = { ...result } as any;
      if (templateType === 'procesos') {
        const r: any = result as any;
        normalizedResult.summary = {
          ...r.summary,
          validSystems: r.summary?.validProcesos ?? 0,
          invalidSystems: r.summary?.invalidProcesos ?? 0,
          totalModules: r.summary?.maxNivel ?? 0,
        };
      }

      setValidationResult(normalizedResult as any);

      if (templateType === 'procesos') {
        const procesosResult = normalizedResult as ExcelProcesosParseResultLike;
        console.log('Payload PROCESOS listo para backend:', procesosResult.payload);
        console.log('Columnas procesadas:', (procesosResult as any).processedColumns);
      }

      if ((normalizedResult as any).errors.length > 0) {
        AlertService.updateLoading(
          loadingToastId,
          'error',
          `Archivo procesado con ${(normalizedResult as any).errors.length} errores. Revisa los detalles.`,
          4000
        );
      } else if ((normalizedResult as any).summary.invalidSystems > 0) {
        AlertService.updateLoading(
          loadingToastId,
          'error',
          templateType === 'procesos'
            ? `${(normalizedResult as any).summary.invalidSystems} procesos tienen errores de validación.`
            : `${(normalizedResult as any).summary.invalidSystems} sistemas tienen errores de validación.`,
          4000
        );
      } else {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          templateType === 'procesos'
            ? `¡Archivo válido! ${(normalizedResult as any).summary.validSystems} procesos listos para importar.`
            : `¡Archivo válido! ${(normalizedResult as any).summary.validSystems} sistemas listos para importar.`,
          3000
        );
      }

      onValidationComplete?.(normalizedResult);

    } catch (error) {
      console.error('Error al validar archivo:', error);
      AlertService.updateLoading(
        loadingToastId,
        'error',
        error instanceof Error ? error.message : 'Error desconocido al validar archivo',
        5000
      );
    } finally {
      setIsValidating(false);
    }
  };

  // Manejadores de botones
  const handleFileInput = () => {
    if (procesosBlocked) {
      AlertService.error('Faltan configurar los tipos de proceso de la organización. No es posible cargar la plantilla.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationResult(null);

    // Delegar en validateFile para evitar duplicación y asegurar que se llame onValidationComplete
    await validateFile(file);

    // Permitir re-seleccionar el mismo archivo si es necesario
    event.target.value = '';
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    // Si está deshabilitado o cargando familias (solo aplica para sistemas), mostrar aviso
    if (disabled) {
      AlertService.warning('La descarga de plantilla está deshabilitada.');
      return;
    }

    if (templateType === 'sistemas') {
      if (familiasLoading) {
        AlertService.warning('Cargando información de familias, por favor espere...');
        return;
      }
      ExcelSistemasTemplateGenerator.generateSampleTemplate({}, familiasSistemaActivas);
    } else {
      // Procesos: verificar si están cargando o si no hay tipos de proceso
      if (tiposProcesoLoading) {
        AlertService.warning('Cargando información de tipos de proceso, por favor espere...');
        return;
      }
      if (procesosBlocked) {
        AlertService.error('Faltan configurar los tipos de proceso de la organización. No es posible descargar la plantilla.');
        return;
      }
      // Generar plantilla con tipos de proceso
      ExcelProcesosTemplateGenerator.generateSampleTemplate(tiposProceso);
    }

    AlertService.success('Plantilla descargada exitosamente');
  };



  // Renderizar resumen de validación
  const renderValidationSummary = () => {
    if (!validationResult) return null;

    const { summary, errors, warnings } = validationResult as any;
    const invalidCount = (summary as any)?.invalidSystems ?? 0;
    const hasErrors = (errors?.length ?? 0) > 0 || invalidCount > 0;

    // Datos por fila (solo procesos)
    const rowDetails = templateType === 'procesos' && (validationResult as any)?.procesos
      ? (validationResult as any).procesos
      : [];
    const rowsWithErrors = Array.isArray(rowDetails)
      ? rowDetails.filter((r: any) => (r.errors?.length ?? 0) > 0)
      : [];

    return (
      <div className={styles.validationSummary}>
        <div className={styles.summaryHeader}>
          <div className={styles.summaryTitle}>
            {hasErrors ? (
              <>
                <AlertTriangle size={20} color="#F59E0B" />
                <span>Validación completada con advertencias</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} color="#10B981" />
                <span>Validación exitosa</span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="s"
            onClick={() => setShowDetails(!showDetails)}
            iconName={showDetails ? 'ChevronDown' : 'ChevronRight'}
            iconPosition="left"
          >
            {showDetails ? 'Ocultar' : 'Ver'} Detalles
          </Button>
        </div>

        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{(validationResult as any).summary.totalRows}</span>
            <span className={styles.statLabel}>Filas procesadas</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: colors.success }}>
              {(validationResult as any).summary.validSystems}
            </span>
            <span className={styles.statLabel}>
              {templateType === 'procesos' ? 'Procesos válidos' : 'Sistemas válidos'}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: colors.warning }}>
              {(validationResult as any).summary.invalidSystems}
            </span>
            <span className={styles.statLabel}>Con errores</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: colors.info }}>
              {(validationResult as any).summary.totalModules}
            </span>
            <span className={styles.statLabel}>
              {templateType === 'procesos' ? 'Niveles máximos' : 'Módulos totales'}
            </span>
          </div>

          {/* Columnas procesadas (solo para procesos) */}
          {templateType === 'procesos' && (validationResult as any)?.processedColumns && (
            <>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {(validationResult as any).processedColumns.macroprocesos}
                </span>
                <span className={styles.statLabel}>Columnas Macroprocesos</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {(validationResult as any).processedColumns.procesos}
                </span>
                <span className={styles.statLabel}>Columnas Procesos</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {(validationResult as any).processedColumns.subprocesos}
                </span>
                <span className={styles.statLabel}>Columnas Subprocesos</span>
              </div>
            </>
          )}
        </div>

        {showDetails && (
          <div className={styles.detailsSection}>
            {errors?.length > 0 && (
              <div className={styles.errorsList}>
                <h4>Errores generales:</h4>
                <ul>
                  {errors.map((error: string, index: number) => (
                    <li key={index} className={styles.errorItem}>
                      <AlertTriangle size={14} />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {warnings?.length > 0 && (
              <div className={styles.warningsList}>
                <h4>Advertencias generales:</h4>
                <ul>
                  {warnings.map((warning: string, index: number) => (
                    <li key={index} className={styles.warningItem}>
                      <AlertTriangle size={14} />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detalle de errores por fila (solo para procesos) */}
            {templateType === 'procesos' && rowsWithErrors.length > 0 && (
              <div className={styles.errorsList}>
                <h4>Errores por fila:</h4>
                <ul>
                  {rowsWithErrors.map((row: any, idx: number) => (
                    <li key={idx} className={styles.errorItem}>
                      <AlertTriangle size={14} />
                      <span>
                        Fila {row.rowNumber}: "{row.proceso?.codigoProceso || 'sin código'}" - {row.proceso?.nombreProceso || 'sin nombre'} (Tipo: {row.proceso?.tipoProcesoNombre || 'sin tipo'})
                      </span>
                      <ul style={{ marginTop: 6, marginLeft: 22 }}>
                        {row.errors.map((e: string, i: number) => (
                          <li key={i} className={styles.errorItem}>
                            <AlertTriangle size={12} /> {e}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar información del archivo
  const renderFileInfo = () => {
    if (!selectedFile) return null;

    return (
      <div className={styles.fileInfo}>
        <div className={styles.fileDetails}>
          <FileText size={24} color={colors.primary} />
          <div className={styles.fileMetadata}>
            <span className={styles.fileName}>{selectedFile.name}</span>
            <span className={styles.fileSize}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="s"
          onClick={handleRemoveFile}
          disabled={isValidating}
          iconName="X"
        />
      </div>
    );
  };

  return (
    <div className={`${styles.bulkUpload} ${compact ? styles.compact : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title} style={{ color: colors.text }}>
          {title}
        </h3>
        <p className={styles.description} style={{ color: colors.textSecondary }}>
          {description}
        </p>
      </div>

      {/* Área de descarga de plantillas */}
      <div className={styles.templateSection}>
        <h4 className={styles.sectionTitle}>📋 Descargar Plantilla Excel</h4>

        {/* Mensaje de bloqueo para PROCESOS */}
        {procesosBlocked && (
          <div
            style={{
              background: '#FFF7ED',
              border: '1px solid #FDBA74',
              color: '#9A3412',
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <AlertTriangle size={18} color="#F59E0B" />
            <span>
              Faltan configurar los tipos de proceso de la organización. No es posible cargar ni descargar la plantilla.
            </span>
          </div>
        )}

        <div className={styles.templateButtons}>
          <Button
            variant="default"
            size="m"
            onClick={handleDownloadTemplate}
            disabled={
              disabled ||
              (templateType === 'sistemas'
                ? familiasLoading
                : (tiposProcesoLoading || procesosBlocked))
            }
            iconName={
              templateType === 'sistemas'
                ? (familiasLoading ? 'Loader' : 'Download')
                : (tiposProcesoLoading ? 'Loader' : 'Download')
            }
            iconPosition="left"
            style={{ 
              backgroundColor: '#414976', 
              color: 'white',
              minWidth: '200px'
            }}
          >
            {templateType === 'sistemas'
              ? (familiasLoading ? 'Cargando Familias...' : 'Descargar Plantilla Excel')
              : (tiposProcesoLoading ? 'Cargando Tipos de Proceso...' : 'Descargar Plantilla Excel')}
          </Button>
        </div>

      </div>

      {/* Área de carga de archivos */}
      <div
        className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''} ${
          selectedFile ? styles.hasFile : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ 
          backgroundColor: dragActive ? colors.primary + '10' : colors.surface,
          borderColor: dragActive ? colors.primary : colors.border
        }}
      >
        {isValidating ? (
          <div className={styles.loadingState}>
            <Loader size={32} className={styles.spinner} />
            <span>Validando archivo...</span>
          </div>
        ) : selectedFile ? (
          <>
            {renderFileInfo()}
            {renderValidationSummary()}
          </>
        ) : (
          <div className={styles.uploadPrompt}>
            <Upload size={48} color={colors.textSecondary} />
            <h4 style={{ color: colors.text }}>
              Arrastra tu archivo Excel aquí
            </h4>
            <p style={{ color: colors.textSecondary }}>
              o haz clic para seleccionar un archivo
            </p>
            <Button
              variant="outline"
              onClick={handleFileInput}
              disabled={disabled || procesosBlocked}
              iconName="Upload"
              iconPosition="left"
            >
              Seleccionar Archivo
            </Button>
            <div className={styles.uploadHints}>
              <span>Formatos permitidos: .xlsx, .xls</span>
              <span>Tamaño máximo: 10MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Input oculto para selección de archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />


    </div>
  );
};