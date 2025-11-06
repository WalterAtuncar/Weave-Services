import React, { useState } from 'react';
import { 
  Download, FileImage, FileText, FileSpreadsheet, 
  Image, Printer, X, Settings,
  AlertCircle, CheckCircle, Loader
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertService } from '../../ui/alerts/AlertService';
import { 
  ExportOptions, 
  OrganizationalData,
  exportAsImage,
  exportAsPDF,
  exportAsSVG,
  exportAsExcel
} from '../../../utils/exportUtils';
import styles from './ExportPanel.module.css';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: OrganizationalData;
  reactFlowInstance?: any; // Instancia de React Flow para exportación optimizada
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  isOpen,
  onClose,
  data,
  reactFlowInstance
}) => {
  const { colors } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>('');
  
  // Opciones de exportación
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 1.0,
    scale: 2,
    paperSize: 'a4',
    orientation: 'landscape',
    includeBackground: true,
    fileName: 'organigrama'
  });

  // Manejar exportación
  const handleExport = async (format: ExportOptions['format']) => {
    setIsExporting(true);
    setExportType(format);

    try {
             // Ajustar fecha para Perú (UTC-5)
       const peruDate = new Date();
       peruDate.setHours(peruDate.getHours() - 5);
       const peruDateString = peruDate.toISOString().split('T')[0];
       
       const options: ExportOptions = {
         ...exportOptions,
         format,
         fileName: `${exportOptions.fileName}_${peruDateString}`
       };

      switch (format) {
        case 'png':
        case 'jpg':
          await exportAsImage(options, reactFlowInstance);
          AlertService.success(`Imagen ${format.toUpperCase()} exportada exitosamente`);
          break;
        
        case 'pdf':
          await exportAsPDF(options, reactFlowInstance);
          AlertService.success('PDF exportado exitosamente');
          break;
        

        
        case 'excel':
          await exportAsExcel(data, options);
          AlertService.success('Reporte Excel exportado exitosamente');
          break;
        
        default:
          throw new Error('Formato no soportado');
      }
    } catch (error) {
      console.error('Error en exportación:', error);
      AlertService.error(error instanceof Error ? error.message : 'Error desconocido en la exportación');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };



  if (!isOpen) return null;

  return (
    <div className={styles.exportOverlay}>
      <div 
        className={styles.exportPanel}
      >
        {/* Header */}
        <div className={styles.exportHeader}>
          <div className={styles.exportTitle}>
            <Download size={20} className={styles.accentIcon} />
            <h3>Exportar Organigrama</h3>
          </div>
          <button
            onClick={onClose}
            className={`${styles.closeButton} ${styles.textSecondary}`}
            disabled={isExporting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Opciones de configuración */}
        <div className={styles.exportSection}>
          <h4 className={styles.sectionTitle}>
            Configuración
          </h4>
          
          <div className={styles.configGrid}>
            <div className={styles.configItem}>
              <label className={`${styles.configLabel} ${styles.textPrimary}`}>
                Nombre del archivo:
              </label>
              <input
                type="text"
                value={exportOptions.fileName}
                onChange={(e) => setExportOptions(prev => ({ ...prev, fileName: e.target.value }))}
                className={styles.configInput}
                placeholder="Nombre del archivo"
              />
            </div>

            <div className={styles.configItem}>
              <label className={`${styles.configLabel} ${styles.textPrimary}`}>
                Tamaño de papel:
              </label>
              <select
                value={exportOptions.paperSize}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  paperSize: e.target.value as 'a4' | 'a3' | 'letter' | 'legal' 
                }))}
                className={styles.configSelect}
              >
                <option value="a4">A4</option>
                <option value="a3">A3</option>
                <option value="letter">Carta</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            <div className={styles.configItem}>
              <label className={`${styles.configLabel} ${styles.textPrimary}`}>
                Orientación:
              </label>
              <select
                value={exportOptions.orientation}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  orientation: e.target.value as 'portrait' | 'landscape' 
                }))}
                className={styles.configSelect}
              >
                <option value="landscape">Horizontal</option>
                <option value="portrait">Vertical</option>
              </select>
            </div>

            <div className={styles.configItem}>
              <label className={`${styles.configLabel} ${styles.textPrimary}`}>
                Calidad (1-10):
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={exportOptions.scale}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  scale: parseInt(e.target.value) 
                }))}
                className={styles.configRange}
              />
              <span className={styles.mutedSmall}>
                {exportOptions.scale}/10
              </span>
            </div>
          </div>

          <div className={styles.configCheckbox}>
            <label className={styles.textPrimary}>
              <input
                type="checkbox"
                checked={exportOptions.includeBackground}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  includeBackground: e.target.checked 
                }))}
              />
              Incluir fondo blanco
            </label>
          </div>
        </div>

        {/* Exportar como imagen */}
        <div className={styles.exportSection}>
          <h4 className={styles.sectionTitle}>
            Exportar como Imagen
          </h4>
          
          <div className={styles.exportGrid}>
            <button
              onClick={() => handleExport('png')}
              disabled={isExporting}
              className={`${styles.exportButton} ${styles.exportButtonImage}`}
            >
              {isExporting && exportType === 'png' ? (
                <Loader size={20} className={styles.spinning} />
              ) : (
                <Image size={20} className={styles.iconSuccess} />
              )}
              <div className={styles.exportButtonText}>
                <span>PNG</span>
                <small>Alta calidad, fondo transparente</small>
              </div>
            </button>

            <button
              onClick={() => handleExport('jpg')}
              disabled={isExporting}
              className={`${styles.exportButton} ${styles.exportButtonImage}`}
            >
              {isExporting && exportType === 'jpg' ? (
                <Loader size={20} className={styles.spinning} />
              ) : (
                <FileImage size={20} className={styles.iconWarning} />
              )}
              <div className={styles.exportButtonText}>
                <span>JPG</span>
                <small>Archivo más pequeño</small>
              </div>
            </button>


          </div>
        </div>

        {/* Exportar documentos */}
        <div className={styles.exportSection}>
          <h4 className={styles.sectionTitle}>
            Exportar Documentos
          </h4>
          
          <div className={styles.exportGrid}>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className={`${styles.exportButton} ${styles.exportButtonDocument}`}
            >
              {isExporting && exportType === 'pdf' ? (
                <Loader size={20} className={styles.spinning} />
              ) : (
                <FileText size={20} className={styles.iconDanger} />
              )}
              <div className={styles.exportButtonText}>
                <span>PDF</span>
                <small>Ideal para impresión</small>
              </div>
            </button>

            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className={`${styles.exportButton} ${styles.exportButtonDocument}`}
            >
              {isExporting && exportType === 'excel' ? (
                <Loader size={20} className={styles.spinning} />
              ) : (
                <FileSpreadsheet size={20} className={styles.iconExcel} />
              )}
              <div className={styles.exportButtonText}>
                <span>Excel</span>
                <small>Reporte completo</small>
              </div>
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className={styles.exportSection}>
          <div className={styles.exportInfo}>
            <div className={styles.infoItem}>
              <CheckCircle size={16} className={styles.iconSuccess} />
              <span className={styles.textSecondary}>
                {data.unidades.length} unidades • {data.posiciones.length} posiciones
              </span>
            </div>
            <div className={styles.infoItem}>
              <AlertCircle size={16} className={styles.iconWarning} />
              <span className={styles.textSecondary}>
                Archivos de alta calidad pueden tardar más en generarse
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};