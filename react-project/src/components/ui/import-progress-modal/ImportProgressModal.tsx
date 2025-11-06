import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Clock,
  Database,
  Loader,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../modal/Modal';
import { Button } from '../button/button';
import { useTheme } from '../../../contexts/ThemeContext';
import { BulkImportResponseData } from '../../../services/types/sistemas.types';
import styles from './ImportProgressModal.module.css';

export interface ImportProgressModalProps {
  /** Abrir/cerrar el modal */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Estado: 'loading' | 'completed' */
  status: 'loading' | 'completed';
  /** Datos de respuesta del backend (solo cuando status = 'completed') */
  importResult?: BulkImportResponseData;
}

export const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
  isOpen,
  onClose,
  status,
  importResult
}) => {
  const { colors } = useTheme();

  // Renderizar contenido según el estado
  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className={styles.loadingContent}>
          <div className={styles.loadingIcon}>
            <Loader size={48} color={colors.primary} className={styles.spinner} />
          </div>
          <h3 className={styles.loadingTitle}>Procesando Importación</h3>
          <p className={styles.loadingDescription}>
            El backend está procesando la carga masiva de sistemas y módulos...
          </p>
          <div className={styles.loadingNote}>
            <Clock size={16} color={colors.textSecondary} />
            <span>Este proceso puede tomar unos momentos</span>
          </div>
        </div>
      );
    }

    if (status === 'completed' && importResult) {
      const hasErrors = importResult.errores && importResult.errores.length > 0;
      const hasFailedSystems = importResult.resultados && importResult.resultados.some(r => !r.exitoso);

      return (
        <div className={styles.resultsContent}>
          {/* Header de Resultados */}
          <div className={styles.resultsHeader}>
            <div className={styles.successIcon}>
              {hasErrors || hasFailedSystems ? (
                <AlertTriangle size={48} color={colors.warning} />
              ) : (
                <CheckCircle size={48} color={colors.success} />
              )}
            </div>
            <h3 className={styles.resultsTitle}>
              {hasErrors || hasFailedSystems ? 'Importación Completada con Advertencias' : 'Importación Exitosa'}
            </h3>
            <p className={styles.resultsDescription}>
              Procesado el {new Date(importResult.fechaProceso).toLocaleString('es-ES')}
            </p>
          </div>

          {/* Estadísticas Generales */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Database size={24} color={colors.primary} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{importResult.sistemasCreados}</div>
                <div className={styles.statLabel}>de {importResult.totalSistemasProcesados} Sistemas</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FileText size={24} color={colors.secondary} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{importResult.modulosCreados}</div>
                <div className={styles.statLabel}>de {importResult.totalModulosProcesados} Módulos</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AlertCircle size={24} color={hasErrors ? colors.danger : colors.success} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{importResult.errores?.length || 0}</div>
                <div className={styles.statLabel}>Errores Generales</div>
              </div>
            </div>
          </div>

          {/* Errores Generales */}
          {importResult.errores && importResult.errores.length > 0 && (
            <div className={styles.errorsSection}>
              <h4 className={styles.sectionTitle}>
                <AlertTriangle size={20} color={colors.danger} />
                Errores Generales ({importResult.errores.length})
              </h4>
              <div className={styles.errorsList}>
                {importResult.errores.map((error, index) => (
                  <div key={index} className={styles.errorItem}>
                    <AlertCircle size={16} color={colors.danger} />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados por Sistema */}
          {importResult.resultados && importResult.resultados.length > 0 && (
            <div className={styles.systemsSection}>
              <h4 className={styles.sectionTitle}>
                <Database size={20} color={colors.primary} />
                Resultados por Sistema ({importResult.resultados.length})
              </h4>
              <div className={styles.systemsList}>
                {importResult.resultados.map((resultado, index) => (
                  <div key={index} className={`${styles.systemCard} ${!resultado.exitoso ? styles.systemError : styles.systemSuccess}`}>
                    <div className={styles.systemHeader}>
                      <div className={styles.systemIcon}>
                        {resultado.exitoso ? (
                          <CheckCircle size={20} color={colors.success} />
                        ) : (
                          <X size={20} color={colors.danger} />
                        )}
                      </div>
                      <div className={styles.systemInfo}>
                        <div className={styles.systemName}>{resultado.nombreSistema}</div>
                        <div className={styles.systemCode}>Código: {resultado.codigoSistema}</div>
                      </div>
                      <div className={styles.systemStats}>
                        <span className={styles.systemId}>ID: {resultado.sistemaId}</span>
                        <span className={styles.modulesCount}>{resultado.modulosCreados} módulos</span>
                      </div>
                    </div>
                    
                    {resultado.mensajeError && (
                      <div className={styles.systemError}>
                        <AlertCircle size={16} color={colors.danger} />
                        <span>{resultado.mensajeError}</span>
                      </div>
                    )}

                    {resultado.erroresModulos && resultado.erroresModulos.length > 0 && (
                      <div className={styles.moduleErrors}>
                        <div className={styles.moduleErrorsTitle}>Errores en Módulos:</div>
                        {resultado.erroresModulos.map((errorModulo, idx) => (
                          <div key={idx} className={styles.moduleError}>
                            <AlertTriangle size={14} color={colors.warning} />
                            <span>{errorModulo}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información Adicional */}
          <div className={styles.additionalInfo}>
            <div className={styles.infoItem}>
              <strong>Organización ID:</strong> {importResult.organizacionId}
            </div>
            <div className={styles.infoItem}>
              <strong>Fecha de Proceso:</strong> {new Date(importResult.fechaProceso).toLocaleString('es-ES')}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={status === 'loading' ? 'Procesando Importación' : 'Resultados de Importación'}
      size="xl"
      showCloseButton={status === 'completed'}
      className={styles.importProgressModal}
    >
      {renderContent()}
    </Modal>
  );
}; 