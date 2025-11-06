import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Sistema, getTipoSistemaLabel, getFamiliaSistemaLabel } from '../models/Sistemas';
import { 
  ExportConfig, 
  ExportFormat, 
  ExportField, 
  ExportTemplate 
} from '../components/ui/advanced-export';

// Interfaces para tipos de exportación
interface SummaryItem {
  'Métrica': string;
  'Categoría': string;
  'Cantidad': number;
  'Porcentaje': string;
}

interface ExportMetadata {
  exportDate: string;
  totalRecords: number;
  template: ExportTemplate;
  format: ExportFormat;
  includeModules?: boolean;
  includeDependencies?: boolean;
  includeAnalytics: boolean;
  summary?: SummaryItem[];
}

interface ExportObject {
  metadata: ExportMetadata;
  data: any[];
}

// Extender jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: any[][];
      body?: any[][];
      startY?: number;
      styles?: any;
      headStyles?: any;
      alternateRowStyles?: any;
      margin?: any;
      [key: string]: any;
    }) => void;
  }
}

/**
 * Servicio para exportar sistemas en diferentes formatos
 */
export class SistemasExportService {
  /**
   * Exporta sistemas según la configuración especificada
   */
  static async exportSistemas(
    sistemas: Sistema[], 
    config: ExportConfig
  ): Promise<void> {
    const { format, includeFields, fileName } = config;
    
    // Filtrar sistemas según configuración
    const filteredSistemas = this.filterSistemas(sistemas, config);
    
    // Preparar datos para exportación
    const exportData = this.prepareExportData(filteredSistemas, config);
    
    // Exportar según formato
    switch (format) {
      case 'excel':
        await this.exportToExcel(exportData, fileName, config);
        break;
      case 'pdf':
        await this.exportToPDF(exportData, fileName, config);
        break;
      case 'csv':
        await this.exportToCSV(exportData, fileName, config);
        break;
      case 'json':
        await this.exportToJSON(exportData, fileName, config);
        break;
      default:
        throw new Error(`Formato de exportación no soportado: ${format}`);
    }
  }

  /**
   * Filtra sistemas según configuración de filtros
   */
  private static filterSistemas(sistemas: Sistema[], config: ExportConfig): Sistema[] {
    let filtered = [...sistemas];
    const { filters } = config;

    // Aplicar filtros
    if (filters.selectedSystems?.length) {
      filtered = filtered.filter(s => filters.selectedSystems!.includes(s.sistemaId));
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(s => 
        s.nombreSistema.toLowerCase().includes(search) ||
        s.codigoSistema?.toLowerCase().includes(search) ||
        s.funcionPrincipal?.toLowerCase().includes(search)
      );
    }

    if (filters.tipos?.length) {
      filtered = filtered.filter(s => filters.tipos!.includes(s.tipoSistema));
    }

    if (filters.familias?.length) {
      filtered = filtered.filter(s => filters.familias!.includes(s.familiaSistema));
    }

    if (filters.estados?.length) {
      filtered = filtered.filter(s => filters.estados!.includes(s.estado));
    }

    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter(s => {
        const fecha = new Date(s.fechaCreacion);
        return fecha >= from && fecha <= to;
      });
    }

    // Ordenamiento: primero por familia, luego por ID
    filtered.sort((a, b) => {
      // Ordenar por familia primero
      if (a.familiaSistema !== b.familiaSistema) {
        return a.familiaSistema - b.familiaSistema;
      }
      
      // Si las familias son iguales, ordenar por ID
      return a.sistemaId - b.sistemaId;
    });

    return filtered;
  }

  /**
   * Prepara datos para exportación según campos seleccionados
   */
  private static prepareExportData(sistemas: Sistema[], config: ExportConfig): any[] {
    const { includeFields, includeModules, includeDependencies } = config;
    
    return sistemas.map(sistema => {
      const row: any = {};

      // Agregar campos básicos
      includeFields.forEach(field => {
        switch (field) {
          case 'sistemaId':
            row['ID'] = sistema.sistemaId;
            break;
          case 'nombreSistema':
            row['Nombre del Sistema'] = sistema.nombreSistema;
            break;
          case 'codigoSistema':
            row['Código'] = sistema.codigoSistema || '';
            break;
          case 'funcionPrincipal':
            row['Función Principal'] = sistema.funcionPrincipal || '';
            break;
          case 'tipoSistema':
            row['Tipo'] = getTipoSistemaLabel(sistema.tipoSistema);
            break;
          case 'familiaSistema':
            row['Familia'] = getFamiliaSistemaLabel(sistema.familiaSistema);
            break;
          case 'estado':
            row['Estado'] = sistema.estado;
            break;
          case 'sistemaDepende':
            if (includeDependencies) {
              row['Sistema Dependiente'] = sistema.sistemaDepende || 'Ninguno';
            }
            break;
          case 'fechaCreacion':
            row['Fecha de Creación'] = new Date(sistema.fechaCreacion).toLocaleDateString();
            break;
          case 'fechaActualizacion':
            row['Fecha de Actualización'] = sistema.fechaActualizacion 
              ? new Date(sistema.fechaActualizacion).toLocaleDateString() 
              : '';
            break;
          case 'creadoPor':
            row['Creado Por'] = sistema.creadoPor;
            break;
          case 'actualizadoPor':
            row['Actualizado Por'] = sistema.actualizadoPor || '';
            break;
        }
      });

      // Agregar información de módulos si está habilitado
      if (includeModules && sistema.modulos?.length) {
        row['Módulos'] = sistema.modulos.map(m => m.nombreModulo).join(', ');
        row['Cantidad de Módulos'] = sistema.modulos.length;
      }

      return row;
    });
  }

  /**
   * Exporta a Excel
   */
  private static async exportToExcel(
    data: any[], 
    fileName: string, 
    config: ExportConfig
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Hoja principal con datos
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Configurar anchos de columna
    const columnWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sistemas');

    // Agregar hoja de resumen si incluye analytics
    if (config.includeAnalytics) {
      const summaryData = this.generateSummaryData(data, config);
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen');
    }

    // Descargar archivo
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  /**
   * Exporta a PDF
   */
  private static async exportToPDF(
    data: any[], 
    fileName: string, 
    config: ExportConfig
  ): Promise<void> {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Sistemas', 20, 20);
    
    // Información de exportación
    doc.setFontSize(12);
    doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total de sistemas: ${data.length}`, 20, 45);
    
    // Preparar datos para tabla
    const headers = Object.keys(data[0] || {});
    const rows = data.map(item => headers.map(header => item[header] || ''));
    
    // Generar tabla
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 55,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 55 },
    });

    // Descargar archivo
    doc.save(`${fileName}.pdf`);
  }

  /**
   * Exporta a CSV
   */
  private static async exportToCSV(
    data: any[], 
    fileName: string, 
    config: ExportConfig
  ): Promise<void> {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escapar comillas y envolver en comillas si contiene coma
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * Exporta a JSON
   */
  private static async exportToJSON(
    data: any[], 
    fileName: string, 
    config: ExportConfig
  ): Promise<void> {
    const exportObject: ExportObject = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalRecords: data.length,
        template: config.template,
        format: config.format,
        includeModules: config.includeModules,
        includeDependencies: config.includeDependencies,
        includeAnalytics: config.includeAnalytics,
      },
      data: data
    };

    if (config.includeAnalytics) {
      exportObject.metadata = {
        ...exportObject.metadata,
        summary: this.generateSummaryData(data, config)
      };
    }

    const jsonContent = JSON.stringify(exportObject, null, 2);
    
    // Crear y descargar archivo
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * Genera datos de resumen para analytics
   */
  private static generateSummaryData(data: any[], config: ExportConfig): SummaryItem[] {
    const summary: SummaryItem[] = [];
    
    // Resumen por tipo
    const tipoCount = new Map<string, number>();
    data.forEach(item => {
      if (item['Tipo']) {
        tipoCount.set(item['Tipo'], (tipoCount.get(item['Tipo']) || 0) + 1);
      }
    });
    
    tipoCount.forEach((count, tipo) => {
      summary.push({
        'Métrica': 'Sistemas por Tipo',
        'Categoría': tipo,
        'Cantidad': count,
        'Porcentaje': `${((count / data.length) * 100).toFixed(1)}%`
      });
    });

    // Resumen por familia
    const familiaCount = new Map<string, number>();
    data.forEach(item => {
      if (item['Familia']) {
        familiaCount.set(item['Familia'], (familiaCount.get(item['Familia']) || 0) + 1);
      }
    });
    
    familiaCount.forEach((count, familia) => {
      summary.push({
        'Métrica': 'Sistemas por Familia',
        'Categoría': familia,
        'Cantidad': count,
        'Porcentaje': `${((count / data.length) * 100).toFixed(1)}%`
      });
    });

    // Resumen por estado
    const estadoCount = new Map<string, number>();
    data.forEach(item => {
      if (item['Estado']) {
        estadoCount.set(item['Estado'], (estadoCount.get(item['Estado']) || 0) + 1);
      }
    });
    
    estadoCount.forEach((count, estado) => {
      summary.push({
        'Métrica': 'Sistemas por Estado',
        'Categoría': estado,
        'Cantidad': count,
        'Porcentaje': `${((count / data.length) * 100).toFixed(1)}%`
      });
    });

    return summary;
  }



  /**
   * Genera plantilla de ejemplo para importación
   */
  static generateImportTemplate(): void {
    const templateData = [
      {
        'Nombre del Sistema': 'Sistema de Ejemplo',
        'Código': 'SYS001',
        'Función Principal': 'Gestión de procesos',
        'Tipo': 'ERP',
        'Familia': 'Core Business',
        'Estado': 'ACTIVO',
        'Sistema Dependiente': '',
        'Módulos': 'Módulo A, Módulo B'
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Configurar anchos de columna
    const columnWidths = Object.keys(templateData[0]).map(key => ({
      wch: Math.max(key.length, 20)
    }));
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
    XLSX.writeFile(workbook, 'plantilla-sistemas.xlsx');
  }
}