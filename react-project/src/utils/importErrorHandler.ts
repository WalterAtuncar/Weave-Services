import { 
  ParsedSistemaData, 
  SistemaImportResult, 
  ExcelSistemasParseResult 
} from './excelSistemasParser';
import { AlertService } from '../components/ui/alerts/AlertService';

// =============================================
// INTERFACES PARA MANEJO DE ERRORES
// =============================================

export interface ImportError {
  type: 'validation' | 'dependency' | 'system' | 'module' | 'network' | 'unknown';
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  details?: string;
  rowNumber?: number;
  fieldName?: string;
  suggestedFix?: string;
  timestamp: Date;
}

export interface ImportReport {
  summary: {
    totalSystems: number;
    successfulSystems: number;
    failedSystems: number;
    totalModules: number;
    successfulModules: number;
    failedModules: number;
    totalErrors: number;
    totalWarnings: number;
    processingTime: number; // en millisegundos
  };
  errors: ImportError[];
  warnings: ImportError[];
  systemsReport: Array<{
    rowNumber: number;
    systemName: string;
    status: 'success' | 'failed' | 'skipped';
    errors: ImportError[];
    warnings: ImportError[];
    modulesCreated: number;
    modulesFailed: number;
  }>;
  metadata: {
    fileName: string;
    fileSize: number;
    uploadTime: Date;
    processedBy: string;
    organizationId: number;
    processingTime: number;
  };
}

export interface ErrorRecoveryAction {
  type: 'retry' | 'skip' | 'modify' | 'manual';
  description: string;
  execute?: () => Promise<void>;
}

// =============================================
// CLASE PRINCIPAL PARA MANEJO DE ERRORES
// =============================================

export class ImportErrorHandler {
  private static readonly ERROR_CODES = {
    // Errores de validación
    VALIDATION_EMPTY_NAME: 'V001',
    VALIDATION_INVALID_NAME: 'V002',
    VALIDATION_DUPLICATE_NAME: 'V003',
    VALIDATION_INVALID_CODE: 'V004',
    VALIDATION_DUPLICATE_CODE: 'V005',
    VALIDATION_INVALID_TYPE: 'V006',
    VALIDATION_INVALID_FAMILY: 'V007',
    VALIDATION_INVALID_FUNCTION: 'V008',
    
    // Errores de dependencias
    DEPENDENCY_CIRCULAR: 'D001',
    DEPENDENCY_NOT_FOUND: 'D002',
    DEPENDENCY_INVALID: 'D003',
    
    // Errores de sistema
    SYSTEM_CREATION_FAILED: 'S001',
    SYSTEM_UPDATE_FAILED: 'S002',
    SYSTEM_DUPLICATE_EXISTS: 'S003',
    
    // Errores de módulos
    MODULE_CREATION_FAILED: 'M001',
    MODULE_INVALID_NAME: 'M002',
    MODULE_DUPLICATE_EXISTS: 'M003',
    
    // Errores de red/conexión
    NETWORK_CONNECTION_FAILED: 'N001',
    NETWORK_TIMEOUT: 'N002',
    NETWORK_SERVER_ERROR: 'N003',
    
    // Errores desconocidos
    UNKNOWN_ERROR: 'U001'
  };

  /**
   * Crea un error estructurado
   */
  static createError(
    type: ImportError['type'],
    severity: ImportError['severity'],
    code: string,
    customMessage?: string,
    details?: {
      rowNumber?: number;
      fieldName?: string;
      suggestedFix?: string;
      details?: string;
    }
  ): ImportError {
    return {
      type,
      severity,
      code,
      message: customMessage || 'Error durante el procesamiento',
      details: details?.details,
      rowNumber: details?.rowNumber,
      fieldName: details?.fieldName,
      suggestedFix: details?.suggestedFix,
      timestamp: new Date()
    };
  }

  /**
   * Descarga un reporte como archivo
   */
  static downloadReport(report: ImportReport, format: 'txt' | 'json' = 'txt'): void {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      content = this.generateTextReport(report);
      mimeType = 'text/plain';
      extension = 'txt';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_importacion_${report.metadata.uploadTime.toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera un reporte en formato texto básico
   */
  static generateTextReport(report: ImportReport): string {
    const lines: string[] = [];
    
    lines.push('=== REPORTE DE IMPORTACIÓN MASIVA ===\n');
    lines.push(`Archivo: ${report.metadata.fileName}`);
    lines.push(`Fecha: ${report.metadata.uploadTime.toLocaleString()}`);
    lines.push(`Tiempo de procesamiento: ${(report.metadata.processingTime / 1000).toFixed(2)}s\n`);
    
    lines.push('RESUMEN:');
    lines.push(`• Sistemas procesados: ${report.summary.totalSystems}`);
    lines.push(`• Sistemas exitosos: ${report.summary.successfulSystems}`);
    lines.push(`• Sistemas fallidos: ${report.summary.failedSystems}`);
    lines.push(`• Módulos creados: ${report.summary.successfulModules}`);
    lines.push(`• Errores: ${report.summary.totalErrors}`);
    lines.push(`• Advertencias: ${report.summary.totalWarnings}\n`);
    
    if (report.errors.length > 0) {
      lines.push('ERRORES:');
      report.errors.forEach((error, index) => {
        lines.push(`${index + 1}. [${error.code}] ${error.message}`);
        if (error.rowNumber) lines.push(`   Fila: ${error.rowNumber}`);
      });
    }
    
    return lines.join('\n');
  }

  /**
   * Muestra notificaciones basadas en errores
   */
  static showErrorNotifications(errors: ImportError[]): void {
    const criticalErrors = errors.filter(e => e.severity === 'error');
    const warnings = errors.filter(e => e.severity === 'warning');

    if (criticalErrors.length > 0) {
      AlertService.error(
        `Se encontraron ${criticalErrors.length} errores durante la importación.`,
        { title: 'Errores de Importación', duration: 5000 }
      );
    }

    if (warnings.length > 0) {
      AlertService.warning(
        `Se generaron ${warnings.length} advertencias durante el proceso.`,
        { title: 'Advertencias', duration: 5000 }
      );
    }
  }
}