import * as XLSX from 'xlsx';
import { 
  TIPO_SISTEMA_LABELS, 
  FAMILIA_SISTEMA_LABELS,
  TipoSistema,
  FamiliaSistema
} from '../models/Sistemas';
import { FamiliaSistemaOption } from '../services/types/familia-sistema.types';

// =============================================
// INTERFACES PARA PLANTILLA DE SISTEMAS
// =============================================

export interface SistemaTemplateRowData {
  nombreSistema: string;
  codigoSistema: string;
  funcionPrincipal: string;
  tipoSistema: string;
  familiaSistema: string;
  sistemaDepende: string;
  modulos: string;
}

export interface TemplateConfig {
  includeExamples: boolean;
  includeValidations: boolean;
  organizacion: string;
}

// =============================================
// GENERADOR DE PLANTILLAS EXCEL PARA SISTEMAS
// =============================================

export class ExcelSistemasTemplateGenerator {
  // Headers para hoja de sistemas
  private static readonly SISTEMAS_HEADERS = [
    'Código del Sistema',
    'Nombre del Sistema',
    'Función Principal',
    'Tipo de Sistema',
    'Familia de Sistema',
    'Sistema del que Depende'
  ];

  // Headers para hoja de módulos
  private static readonly MODULOS_HEADERS = [
    'Código del Sistema',
    'Nombre del Módulo',
    'Función del Módulo'
  ];

  // Datos de ejemplo para sistemas
  private static readonly SAMPLE_SISTEMAS = [
    {
      codigoSistema: 'SAP-ERP-001',
      nombreSistema: 'SAP ERP',
      funcionPrincipal: 'Sistema Enterprise Resource Planning para gestión integral de recursos empresariales',
      tipoSistema: TIPO_SISTEMA_LABELS[TipoSistema.PROVEEDOR],
      familiaSistema: FAMILIA_SISTEMA_LABELS[FamiliaSistema.ERP],
      sistemaDepende: ''
    },
    {
      codigoSistema: 'SF-CRM-001', 
      nombreSistema: 'Salesforce CRM',
      funcionPrincipal: 'Customer Relationship Management para gestión de clientes y ventas',
      tipoSistema: TIPO_SISTEMA_LABELS[TipoSistema.PROVEEDOR],
      familiaSistema: FAMILIA_SISTEMA_LABELS[FamiliaSistema.CRM],
      sistemaDepende: 'SAP ERP'
    },
    {
      codigoSistema: 'PBI-001',
      nombreSistema: 'Power BI',
      funcionPrincipal: 'Herramienta de Business Intelligence para análisis y visualización de datos',
      tipoSistema: TIPO_SISTEMA_LABELS[TipoSistema.PROVEEDOR],
      familiaSistema: FAMILIA_SISTEMA_LABELS[FamiliaSistema.BI],
      sistemaDepende: 'SAP ERP'
    },
    {
      codigoSistema: 'MS-TEAMS-001',
      nombreSistema: 'Microsoft Teams',
      funcionPrincipal: 'Plataforma de colaboración y comunicación empresarial',
      tipoSistema: TIPO_SISTEMA_LABELS[TipoSistema.PROVEEDOR],
      familiaSistema: FAMILIA_SISTEMA_LABELS[FamiliaSistema.COLABORACION],
      sistemaDepende: ''
    },
    {
      codigoSistema: 'SIN-001',
      nombreSistema: 'Sistema Interno de Nómina',
      funcionPrincipal: 'Sistema desarrollado internamente para gestión de nómina y recursos humanos',
      tipoSistema: TIPO_SISTEMA_LABELS[TipoSistema.INTERNO],
      familiaSistema: FAMILIA_SISTEMA_LABELS[FamiliaSistema.GESTION_RRHH],
      sistemaDepende: ''
    }
  ];

  // Datos de ejemplo para módulos
  private static readonly SAMPLE_MODULOS = [
    // Módulos SAP ERP
    { codigoSistema: 'SAP-ERP-001', nombreModulo: 'SAP FI', funcionModulo: 'Gestión Financiera y Contable' },
    { codigoSistema: 'SAP-ERP-001', nombreModulo: 'SAP CO', funcionModulo: 'Controlling y Control de Costos' },
    { codigoSistema: 'SAP-ERP-001', nombreModulo: 'SAP MM', funcionModulo: 'Materials Management - Gestión de Materiales' },
    { codigoSistema: 'SAP-ERP-001', nombreModulo: 'SAP HR', funcionModulo: 'Human Resources - Recursos Humanos' },
    { codigoSistema: 'SAP-ERP-001', nombreModulo: 'SAP SD', funcionModulo: 'Sales and Distribution - Ventas y Distribución' },
    
    // Módulos Salesforce CRM
    { codigoSistema: 'SF-CRM-001', nombreModulo: 'Sales Cloud', funcionModulo: 'Gestión de Ventas y Oportunidades' },
    { codigoSistema: 'SF-CRM-001', nombreModulo: 'Service Cloud', funcionModulo: 'Atención al Cliente y Soporte' },
    { codigoSistema: 'SF-CRM-001', nombreModulo: 'Marketing Cloud', funcionModulo: 'Automatización de Marketing' },
    
    // Módulos Power BI
    { codigoSistema: 'PBI-001', nombreModulo: 'Power BI Desktop', funcionModulo: 'Desarrollo de Reportes y Dashboards' },
    { codigoSistema: 'PBI-001', nombreModulo: 'Power BI Service', funcionModulo: 'Publicación y Compartir Reportes en la Nube' },
    
    // Módulos Microsoft Teams
    { codigoSistema: 'MS-TEAMS-001', nombreModulo: 'Chat y Mensajería', funcionModulo: 'Comunicación Instantánea Empresarial' },
    { codigoSistema: 'MS-TEAMS-001', nombreModulo: 'Videoconferencias', funcionModulo: 'Reuniones Virtuales y Webinars' },
    { codigoSistema: 'MS-TEAMS-001', nombreModulo: 'SharePoint Integration', funcionModulo: 'Integración con Documentos y Archivos' },
    
    // Módulos Sistema Interno de Nómina
    { codigoSistema: 'SIN-001', nombreModulo: 'Cálculo de Nómina', funcionModulo: 'Procesamiento Automático de Sueldos y Salarios' },
    { codigoSistema: 'SIN-001', nombreModulo: 'Reportes Tributarios', funcionModulo: 'Generación de Declaraciones y Reportes Fiscales' },
    { codigoSistema: 'SIN-001', nombreModulo: 'Control de Asistencia', funcionModulo: 'Registro y Control de Horarios de Trabajo' }
  ];

  /**
   * Genera una plantilla con datos de ejemplo (hojas separadas para sistemas y módulos)
   */
  static generateSampleTemplate(config: Partial<TemplateConfig> = {}, familiasSistema?: FamiliaSistemaOption[]): void {

    
    // CREAR WORKBOOK COMPLETAMENTE NUEVO
    const workbook = XLSX.utils.book_new();

    
    // ========================
    // HOJA 1: SISTEMAS
    // ========================

    const dataSistemas = [
      // Headers
      ['Código Sistema', 'Nombre Sistema', 'Función Principal', 'Tipo', 'Familia', 'Depende De'],
      // Datos de ejemplo
      ['SAP-001', 'SAP ERP', 'Sistema de gestión empresarial', 'Proveedor', 'ERP', ''],
      ['CRM-001', 'Salesforce', 'Gestión de relaciones con clientes', 'Proveedor', 'CRM', 'SAP-001'],
      ['BI-001', 'Power BI', 'Inteligencia de negocios', 'Proveedor', 'BI', 'SAP-001']
    ];
    
    const sheetSistemas = XLSX.utils.aoa_to_sheet(dataSistemas);
    sheetSistemas['!cols'] = [
      { wch: 15 }, // Código Sistema
      { wch: 25 }, // Nombre Sistema  
      { wch: 40 }, // Función Principal
      { wch: 15 }, // Tipo
      { wch: 20 }, // Familia
      { wch: 15 }  // Depende De
    ];
    XLSX.utils.book_append_sheet(workbook, sheetSistemas, 'SISTEMAS');

    
    // ========================
    // HOJA 2: MÓDULOS
    // ========================

    const dataModulos = [
      // Headers
      ['Código Sistema', 'Nombre Módulo', 'Función Módulo'],
      // Datos de ejemplo
      ['SAP-001', 'SAP FI', 'Módulo Financiero'],
      ['SAP-001', 'SAP CO', 'Módulo de Controlling'],
      ['SAP-001', 'SAP MM', 'Módulo de Materiales'],
      ['CRM-001', 'Sales Cloud', 'Gestión de Ventas'],
      ['CRM-001', 'Service Cloud', 'Atención al Cliente'],
      ['BI-001', 'Power BI Desktop', 'Creación de Reportes']
    ];
    
    const sheetModulos = XLSX.utils.aoa_to_sheet(dataModulos);
    sheetModulos['!cols'] = [
      { wch: 15 }, // Código Sistema
      { wch: 25 }, // Nombre Módulo
      { wch: 40 }  // Función Módulo
    ];
    XLSX.utils.book_append_sheet(workbook, sheetModulos, 'MÓDULOS');

    
    // ========================
    // HOJA 3: INSTRUCCIONES
    // ========================

    
    // Construir lista de tipos de sistema
    const tiposSistema = Object.values(TIPO_SISTEMA_LABELS);
    
    // Construir lista de familias de sistema (dinámicas del backend o fallback)
    let familiasSistemaList: string[];
    if (familiasSistema && Array.isArray(familiasSistema) && familiasSistema.length > 0) {
          familiasSistemaList = familiasSistema.map(familia => {
            const codigo = familia.codigo || 'SIN_CODIGO';
            const nombre = familia.nombre || 'Sin nombre';
            return `${codigo} - ${nombre}`;
          });
    } else {
      // Fallback usando las constantes estáticas
      familiasSistemaList = Object.entries(FAMILIA_SISTEMA_LABELS).map(([key, value]) => {
        return `${key} - ${value}`;
      });
    }
    
    const dataInstrucciones = [
      ['INSTRUCCIONES PARA IMPORTACIÓN DE SISTEMAS Y MÓDULOS'],
      [''],
      ['Esta plantilla tiene 3 hojas:'],
      ['1. SISTEMAS - Información básica de cada sistema'],
      ['2. MÓDULOS - Módulos asociados a cada sistema'],
      ['3. INSTRUCCIONES - Esta hoja con ayuda'],
      [''],
      ['HOJA SISTEMAS - CAMPOS REQUERIDOS:'],
      ['- Código Sistema: Único, alfanumérico (máx. 20 caracteres)'],
      ['- Nombre Sistema: Descriptivo (3-100 caracteres)'],
      ['- Función Principal: Descripción del sistema (opcional)'],
      ['- Tipo: Ver lista de tipos válidos abajo'],
      ['- Familia: Ver lista de familias válidas abajo'],
      ['- Depende De: Código del sistema padre (opcional)'],
      [''],
      ['HOJA MÓDULOS - CAMPOS REQUERIDOS:'],
      ['- Código Sistema: Debe existir en la hoja SISTEMAS'],
      ['- Nombre Módulo: Nombre del módulo (3-100 caracteres)'],
      ['- Función Módulo: Descripción del módulo'],
      [''],
      ['📋 TIPOS DE SISTEMA VÁLIDOS:'],
      ...tiposSistema.map(tipo => [`  • ${tipo}`]),
      [''],
      ['📋 FAMILIAS DE SISTEMA VÁLIDAS:'],
      [''],
      ['CÓDIGO - DESCRIPCIÓN'],
      ['─────────────────────────────────────────────────────'],
      ...familiasSistemaList.map(familia => [`${familia}`]),
      [''],
      ['💡 IMPORTANTE: En la hoja SISTEMAS, use únicamente el CÓDIGO (parte antes del guión)'],
      [''],
      ['⚠️ REGLAS IMPORTANTES:'],
      ['• Los códigos de sistema deben ser únicos'],
      ['• Los nombres de sistema deben ser únicos'],
      ['• Las dependencias deben referenciar códigos que existan'],
      ['• No se permiten dependencias circulares'],
      ['• Los campos opcionales pueden dejarse vacíos'],
      [''],
      ['📊 EJEMPLOS:'],
      ['SISTEMA: SAP-001 | SAP ERP | Sistema de gestión | Proveedor | ERP | '],
      ['MÓDULO: SAP-001 | SAP FI | Módulo Financiero'],
      ['MÓDULO: SAP-001 | SAP CO | Módulo Controlling'],
      [''],
      ['📝 NOTA: En el ejemplo anterior, "ERP" es el código que debe usarse'],
      ['    en la columna Familia, NO "Enterprise Resource Planning"']
    ];
    
    const sheetInstrucciones = XLSX.utils.aoa_to_sheet(dataInstrucciones);
    sheetInstrucciones['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, sheetInstrucciones, 'INSTRUCCIONES');

    
    // ========================
    // VERIFICACIÓN Y DESCARGA
    // ========================

    
    const fileName = `Plantilla_Sistemas_Modulos_${new Date().toISOString().slice(0,10)}.xlsx`;

    
    try {
      // MÉTODO 1: XLSX.writeFile (método estándar)
      XLSX.writeFile(workbook, fileName);
    } catch (error1) {
      console.error('❌ Método 1 falló:', error1);
      
      try {
        // MÉTODO 2: Descarga manual con blob
  
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
  
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
  
      } catch (error2) {
        console.error('❌ Método 2 falló:', error2);
        
        // MÉTODO 3: Forzar descarga con setTimeout
  
        setTimeout(() => {
          try {
            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
            
            function s2ab(s: string) {
              const buf = new ArrayBuffer(s.length);
              const view = new Uint8Array(buf);
              for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
              return buf;
            }
            
            const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            
      
          } catch (error3) {
            console.error('❌ Todos los métodos fallaron:', error3);
            alert('Error al descargar el archivo. Por favor, revisa la consola para más detalles.');
          }
        }, 100);
      }
    }
    

  }

  // Método generateEmptyTemplate removido - solo usamos generateSampleTemplate

  /**
   * Crear hoja de sistemas con ejemplos
   */
  private static createSistemasSheet(workbook: XLSX.WorkBook, config: TemplateConfig, familiasSistema?: FamiliaSistemaOption[]): void {
    const worksheetData = [this.SISTEMAS_HEADERS];
    
    if (config.includeExamples) {
      // Agregar datos de ejemplo de sistemas
      worksheetData.push(
        ...this.SAMPLE_SISTEMAS.map(sistema => [
          sistema.codigoSistema,
          sistema.nombreSistema,
          sistema.funcionPrincipal,
          sistema.tipoSistema,
          sistema.familiaSistema,
          sistema.sistemaDepende
        ])
      );
    } else {
      // Solo una fila vacía
      worksheetData.push(['', '', '', '', '', '']);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 20 }, // Código del Sistema
      { wch: 30 }, // Nombre del Sistema
      { wch: 50 }, // Función Principal
      { wch: 20 }, // Tipo de Sistema
      { wch: 25 }, // Familia de Sistema
      { wch: 25 }  // Sistema del que Depende
    ];

    // Formatear headers
    this.formatHeaders(worksheet, this.SISTEMAS_HEADERS.length);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'SISTEMAS');
  }

  /**
   * Crear hoja de módulos con ejemplos
   */
  private static createModulosSheet(workbook: XLSX.WorkBook, config: TemplateConfig): void {
    const worksheetData = [this.MODULOS_HEADERS];
    
    if (config.includeExamples) {
      // Agregar datos de ejemplo de módulos
      worksheetData.push(
        ...this.SAMPLE_MODULOS.map(modulo => [
          modulo.codigoSistema,
          modulo.nombreModulo,
          modulo.funcionModulo
        ])
      );
    } else {
      // Solo una fila vacía
      worksheetData.push(['', '', '']);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 20 }, // Código del Sistema
      { wch: 30 }, // Nombre del Módulo
      { wch: 50 }  // Función del Módulo
    ];

    // Formatear headers
    this.formatHeaders(worksheet, this.MODULOS_HEADERS.length);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'MÓDULOS');
  }

  /**
   * Formatear headers de una hoja
   */
  private static formatHeaders(worksheet: XLSX.WorkSheet, colCount: number): void {
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || `A1:${String.fromCharCode(65 + colCount - 1)}1`);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    }
  }

  /**
   * Crear hoja de validaciones y ayuda
   */
  private static createValidationsSheet(workbook: XLSX.WorkBook, familiasSistema?: FamiliaSistemaOption[]): void {
    const validationData = [
      ['🔧 INSTRUCCIONES Y VALIDACIONES PARA IMPORTACIÓN DE SISTEMAS'],
      [''],
      ['📊 NUEVA ESTRUCTURA CON HOJAS SEPARADAS:'],
      ['Esta plantilla utiliza DOS hojas separadas para una mejor organización:'],
      ['• SISTEMAS: Información principal de cada sistema'],
      ['• MÓDULOS: Módulos asociados a cada sistema'],
      [''],
      ['📋 HOJA "SISTEMAS" - ESTRUCTURA REQUERIDA:'],
      ['1. Código del Sistema', 'REQUERIDO', 'Código único alfanumérico (máx. 20 caracteres)'],
      ['2. Nombre del Sistema', 'REQUERIDO', 'Nombre único del sistema (3-100 caracteres)'],
      ['3. Función Principal', 'OPCIONAL', 'Descripción de la función del sistema (máx. 500 caracteres)'],
      ['4. Tipo de Sistema', 'REQUERIDO', 'Ver valores permitidos abajo'],
      ['5. Familia de Sistema', 'REQUERIDO', 'Ver valores permitidos abajo'],
      ['6. Sistema del que Depende', 'OPCIONAL', 'Nombre exacto del sistema padre (debe existir en el archivo)'],
      [''],
      ['📋 HOJA "MÓDULOS" - ESTRUCTURA REQUERIDA:'],
      ['1. Código del Sistema', 'REQUERIDO', 'Debe coincidir con un código de la hoja SISTEMAS'],
      ['2. Nombre del Módulo', 'REQUERIDO', 'Nombre descriptivo del módulo (3-100 caracteres)'],
      ['3. Función del Módulo', 'REQUERIDO', 'Descripción específica de la función del módulo'],
      [''],
      ['📝 TIPOS DE SISTEMA PERMITIDOS:'],
      ...Object.values(TIPO_SISTEMA_LABELS).map(label => ['', label, 'Válido']),
      [''],
      ['🏷️ FAMILIAS DE SISTEMA PERMITIDAS:'],
      ...(() => {
        if (familiasSistema && Array.isArray(familiasSistema) && familiasSistema.length > 0) {
          const result = familiasSistema.map(familia => {
            const nombreFamilia = familia.nombre || familia.codigo || 'SIN_NOMBRE';
            return ['', nombreFamilia, 'Válido'];
          });
          return result;
        } else {
          const fallback = Object.values(FAMILIA_SISTEMA_LABELS).map(label => ['', label, 'Válido']);
          return fallback;
        }
      })(),
      [''],
      ['⚠️ REGLAS IMPORTANTES:'],
      ['• Los códigos de sistema deben ser únicos en la hoja SISTEMAS'],
      ['• Los nombres de sistema deben ser únicos en la hoja SISTEMAS'],
      ['• Los códigos en MÓDULOS deben existir en la hoja SISTEMAS'],
      ['• Las dependencias deben referenciar sistemas que existan en el archivo'],
      ['• Los campos opcionales pueden dejarse vacíos'],
      ['• No se permiten dependencias circulares'],
      [''],
      ['📊 EJEMPLOS PRÁCTICOS:'],
      ['HOJA SISTEMAS:', '', ''],
      ['Código', 'Nombre', 'Función'],
      ['SAP-ERP-001', 'SAP ERP', 'Sistema Enterprise Resource Planning'],
      ['SF-CRM-001', 'Salesforce CRM', 'Customer Relationship Management'],
      [''],
      ['HOJA MÓDULOS:', '', ''],
      ['Código Sistema', 'Nombre Módulo', 'Función Módulo'],
      ['SAP-ERP-001', 'SAP FI', 'Gestión Financiera y Contable'],
      ['SAP-ERP-001', 'SAP CO', 'Controlling y Control de Costos'],
      ['SF-CRM-001', 'Sales Cloud', 'Gestión de Ventas y Oportunidades'],
      [''],
      ['🚨 ERRORES COMUNES:'],
      ['• Usar códigos duplicados en SISTEMAS'],
      ['• Referenciar códigos inexistentes en MÓDULOS'],
      ['• Tipos o familias con valores no válidos'],
      ['• Exceder límites de caracteres'],
      ['• Crear dependencias circulares'],
      ['• Dejar campos requeridos vacíos']
    ];

    const validationSheet = XLSX.utils.aoa_to_sheet(validationData);
    
    // Configurar anchos de columna
    validationSheet['!cols'] = [
      { wch: 30 },
      { wch: 40 },
      { wch: 50 }
    ];

    // Formatear título principal
    if (validationSheet['A1']) {
      validationSheet['A1'].s = {
        font: { bold: true, sz: 14, color: { rgb: '1F2937' } },
        fill: { fgColor: { rgb: 'F3F4F6' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    // Formatear secciones
    const sectionRows = [3, 12, 16, 25, 31, 38];
    sectionRows.forEach(row => {
      const cellAddress = `A${row}`;
      if (validationSheet[cellAddress]) {
        validationSheet[cellAddress].s = {
          font: { bold: true, color: { rgb: '4F46E5' } },
          fill: { fgColor: { rgb: 'EEF2FF' } }
        };
      }
    });

    XLSX.utils.book_append_sheet(workbook, validationSheet, 'Validaciones y Ayuda');
  }

  /**
   * Generar plantilla personalizada con sistemas existentes
   */
  static generateCustomTemplate(
    sistemasExistentes: Array<{ nombre: string; codigo?: string }>,
    organizacion: string = 'Mi Organización',
    familiasSistema?: FamiliaSistemaOption[]
  ): void {
    const workbook = XLSX.utils.book_new();
    
    // Hoja principal con estructura base
    const worksheetData = [
      this.SISTEMAS_HEADERS,
      ['', '', '', '', '', ''] // Fila vacía para nuevos sistemas
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 50 }, { wch: 20 }, 
      { wch: 25 }, { wch: 25 }, { wch: 60 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nuevos Sistemas');
    
    // Hoja con sistemas existentes para referencia
    if (sistemasExistentes.length > 0) {
      const existingData = [
        ['SISTEMAS EXISTENTES (Para referencia en dependencias)'],
        ['Nombre del Sistema', 'Código'],
        ...sistemasExistentes.map(s => [s.nombre, s.codigo || ''])
      ];

      const existingSheet = XLSX.utils.aoa_to_sheet(existingData);
      existingSheet['!cols'] = [{ wch: 30 }, { wch: 15 }];
      
      // Formatear header
      if (existingSheet['A1']) {
        existingSheet['A1'].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '059669' } },
          alignment: { horizontal: 'center' }
        };
      }

      XLSX.utils.book_append_sheet(workbook, existingSheet, 'Sistemas Existentes');
    }
    
    // Hoja de validaciones
    this.createValidationsSheet(workbook, familiasSistema);

    const fileName = `plantilla_sistemas_personalizada_${organizacion.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Generar archivo de configuración JSON para desarrolladores
   */
  static generateConfigTemplate(): void {
    const config = {
      metadata: {
        version: '1.0',
        description: 'Plantilla de configuración para importación de sistemas',
        lastUpdated: new Date().toISOString()
      },
      validation: {
        maxFileSize: '10MB',
        allowedExtensions: ['.xlsx', '.xls'],
        requiredColumns: this.SISTEMAS_HEADERS,
        dataTypes: {
          'Nombre del Sistema': 'string (required, 3-100 chars)',
          'Código del Sistema': 'string (optional, max 20 chars)',
          'Función Principal': 'string (optional, max 500 chars)',
          'Tipo de Sistema': `enum (${Object.values(TIPO_SISTEMA_LABELS).join(' | ')})`,
          'Familia de Sistema': `enum (${Object.values(FAMILIA_SISTEMA_LABELS).join(' | ')})`,
          'Sistema del que Depende': 'string (optional, must exist in file)',
          'Módulos': 'string (optional, semicolon separated)'
        }
      },
      examples: this.SAMPLE_SISTEMAS
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config_importacion_sistemas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Obtener información de la plantilla para mostrar al usuario
   */
  static getTemplateInfo(familiasSistema?: FamiliaSistemaOption[]): {
    requiredColumns: string[];
    optionalColumns: string[];
    tiposSistema: string[];
    familiasSistema: string[];
    maxFileSize: string;
    allowedFormats: string[];
  } {
    return {
      requiredColumns: ['Nombre del Sistema', 'Tipo de Sistema', 'Familia de Sistema'],
      optionalColumns: ['Código del Sistema', 'Función Principal', 'Sistema del que Depende', 'Módulos'],
      tiposSistema: Object.values(TIPO_SISTEMA_LABELS),
      familiasSistema: familiasSistema && familiasSistema.length > 0 
        ? familiasSistema.map(f => f.nombre)
        : Object.values(FAMILIA_SISTEMA_LABELS),
      maxFileSize: '10MB',
      allowedFormats: ['.xlsx', '.xls']
    };
  }
}