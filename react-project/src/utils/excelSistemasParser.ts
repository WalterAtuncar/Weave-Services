import * as XLSX from 'xlsx';
import { 
  CreateSistemaDto, 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema,
  TIPO_SISTEMA_LABELS,
  FAMILIA_SISTEMA_LABELS
} from '../models/Sistemas';
import { 
  validateCreateSistema,
  validateNombreSistema,
  validateCodigoSistema,
  validateFuncionPrincipal,
  validateFamiliaSistemaByOrganizacion,
  getFamiliaSistemaIdByLabel
} from './sistemasValidation';
import { FamiliaSistemaOption } from '../services/types/familia-sistema.types';

// =============================================
// INTERFACES PARA EXCEL DE SISTEMAS
// =============================================

export interface ExcelSistemaRowData {
  nombreSistema: string;
  codigoSistema: string;
  funcionPrincipal: string;
  tipoSistema: string;
  familiaSistema: string;
  sistemaDepende: string; // Nombre del sistema padre
  modulos: string; // Lista de módulos separados por punto y coma
}

// Interfaz específica para datos parseados del Excel
export interface ParsedSistemaFromExcel {
  nombreSistema: string;
  codigoSistema?: string;
  funcionPrincipal?: string;
  sistemaDepende?: string; // Nombre del sistema padre (del Excel)
  tipoSistema: number;
  familiaSistema: number;
  estado: EstadoSistema;
}

export interface ParsedSistemaData {
  sistema: ParsedSistemaFromExcel;
  modulos: string[];
  errors: string[];
  warnings: string[];
  rowNumber: number;
}

export interface ExcelSistemasParseResult {
  sistemas: ParsedSistemaData[];
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validSystems: number;
    invalidSystems: number;
    totalModules: number;
  };
}

export interface SistemaImportResult {
  success: boolean;
  createdSystems: number;
  createdModules: number;
  errors: string[];
  warnings: string[];
  failedSystems: Array<{
    rowNumber: number;
    nombreSistema: string;
    error: string;
  }>;
}

// =============================================
// PARSER DE EXCEL PARA SISTEMAS
// =============================================

export class ExcelSistemasParser {
  private static readonly REQUIRED_HEADERS = [
    'Nombre del Sistema',
    'Código del Sistema',
    'Función Principal',
    'Tipo de Sistema',
    'Familia de Sistema',
    'Sistema del que Depende',
    'Módulos'
  ];

  // Headers para nuevo formato con hojas separadas
  private static readonly SISTEMAS_HEADERS = [
    'Código Sistema',
    'Nombre Sistema',
    'Función Principal',
    'Tipo',
    'Familia',
    'Depende De'
  ];

  private static readonly MODULOS_HEADERS = [
    'Código Sistema',
    'Nombre Módulo',
    'Función Módulo'
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];

  /**
   * Valida la estructura básica del archivo Excel
   */
  static async validateExcelFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {

    const errors: string[] = [];

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`El archivo excede el tamaño máximo permitido (${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Validar extensión
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(`Extensión de archivo no permitida. Use: ${this.ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Validar contenido básico
    try {
      const workbook = await this.readWorkbook(file);

      
      if (workbook.SheetNames.length === 0) {
        errors.push('El archivo no contiene hojas válidas');
        return { isValid: false, errors };
      }

      // Detectar formato y validar headers apropiados
      const hasSistemasSheet = workbook.SheetNames.includes('SISTEMAS');
      const hasModulosSheet = workbook.SheetNames.includes('MÓDULOS');
      
      if (hasSistemasSheet && hasModulosSheet) {

        
        // Validar headers de SISTEMAS
        const sistemasSheet = workbook.Sheets['SISTEMAS'];
        if (sistemasSheet) {
          const sistemasHeaders = this.extractHeaders(sistemasSheet);

          
          const missingSistemasHeaders = this.SISTEMAS_HEADERS.filter(h => !sistemasHeaders.includes(h));
          if (missingSistemasHeaders.length > 0) {
            errors.push(`Faltan columnas en hoja SISTEMAS: ${missingSistemasHeaders.join(', ')}`);
          }
        } else {
          errors.push('No se encontró la hoja SISTEMAS');
        }
        
        // Validar headers de MÓDULOS
        const modulosSheet = workbook.Sheets['MÓDULOS'];
        if (modulosSheet) {
          const modulosHeaders = this.extractHeaders(modulosSheet);

          
          const missingModulosHeaders = this.MODULOS_HEADERS.filter(h => !modulosHeaders.includes(h));
          if (missingModulosHeaders.length > 0) {
            errors.push(`Faltan columnas en hoja MÓDULOS: ${missingModulosHeaders.join(', ')}`);
          }
        } else {
          errors.push('No se encontró la hoja MÓDULOS');
        }
        
      } else {

        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          errors.push('El archivo no contiene hojas válidas');
          return { isValid: false, errors };
        }

        // Validar headers legacy
        const headers = this.extractHeaders(worksheet);

        
        const missingHeaders = this.REQUIRED_HEADERS.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          errors.push(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`);
        }
      }

    } catch (error) {

      errors.push(`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }


    return { isValid: errors.length === 0, errors };
  }

  /**
   * Parsea el archivo Excel y retorna los datos validados
   */
  static async parseExcelFile(
    file: File, 
    organizacionId: number, 
    familiasPermitidas?: FamiliaSistemaOption[]
  ): Promise<ExcelSistemasParseResult> {

    
    const result: ExcelSistemasParseResult = {
      sistemas: [],
      errors: [],
      warnings: [],
      summary: {
        totalRows: 0,
        validSystems: 0,
        invalidSystems: 0,
        totalModules: 0
      }
    };

    try {
      const workbook = await this.readWorkbook(file);

      
      // Verificar si es la nueva estructura (hojas separadas)
      const hasSistemasSheet = workbook.SheetNames.includes('SISTEMAS');
      const hasModulosSheet = workbook.SheetNames.includes('MÓDULOS');
      
      if (hasSistemasSheet && hasModulosSheet) {

        return await this.parseNewFormatExcel(workbook, organizacionId, familiasPermitidas);
      } else {

        return await this.parseLegacyFormatExcel(workbook, organizacionId, familiasPermitidas);
      }

    } catch (error) {

      result.errors.push(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    return result;
  }
  
  /**
   * Parsea el nuevo formato con hojas separadas SISTEMAS y MÓDULOS
   */
  private static async parseNewFormatExcel(
    workbook: XLSX.WorkBook, 
    organizacionId: number, 
    familiasPermitidas?: FamiliaSistemaOption[]
  ): Promise<ExcelSistemasParseResult> {

    
    const result: ExcelSistemasParseResult = {
      sistemas: [],
      errors: [],
      warnings: [],
      summary: {
        totalRows: 0,
        validSystems: 0,
        invalidSystems: 0,
        totalModules: 0
      }
    };

    try {
      // ===== PROCESAR HOJA SISTEMAS =====

      const sistemasSheet = workbook.Sheets['SISTEMAS'];
      if (!sistemasSheet) {
        result.errors.push('No se encontró la hoja SISTEMAS');
        return result;
      }

      const sistemasData = XLSX.utils.sheet_to_json(sistemasSheet, {
        header: ['codigoSistema', 'nombreSistema', 'funcionPrincipal', 'tipoSistema', 'familiaSistema', 'sistemaDepende'],
        range: 1 // Saltar header
      });
      

      result.summary.totalRows = sistemasData.length;

      // ===== PROCESAR HOJA MÓDULOS =====

      const modulosSheet = workbook.Sheets['MÓDULOS'];
      if (!modulosSheet) {
        result.errors.push('No se encontró la hoja MÓDULOS');
        return result;
      }

      const modulosData = XLSX.utils.sheet_to_json(modulosSheet, {
        header: ['codigoSistema', 'nombreModulo', 'funcionModulo'],
        range: 1 // Saltar header
      });
      

      result.summary.totalModules = modulosData.length;

      // ===== COMBINAR DATOS =====

      const sistemaNames = new Set<string>();
      const sistemaCodes = new Set<string>();
      
      // Procesar cada sistema
      for (let i = 0; i < sistemasData.length; i++) {
        const sistemaRow = sistemasData[i] as any;
        const rowNumber = i + 2;
        

        
        // Crear objeto del sistema
        const parsedSistema: ParsedSistemaData = {
          sistema: {
            nombreSistema: this.cleanString(sistemaRow.nombreSistema) || '',
            codigoSistema: this.cleanString(sistemaRow.codigoSistema),
            funcionPrincipal: this.cleanString(sistemaRow.funcionPrincipal),
            tipoSistema: this.getTipoSistemaByLabel(this.cleanString(sistemaRow.tipoSistema)) || 1,
            familiaSistema: 1, // Se asignará después de la validación
            sistemaDepende: this.cleanString(sistemaRow.sistemaDepende) || undefined,
            estado: EstadoSistema.Borrador
          },
          modulos: [],
          errors: [],
          warnings: [],
          rowNumber
        };

        // Buscar módulos para este sistema
        const codigoSistema = this.cleanString(sistemaRow.codigoSistema);
        if (codigoSistema) {
          const modulosDelSistema = modulosData.filter((modulo: any) => 
            this.cleanString(modulo.codigoSistema) === codigoSistema
          );
          
          parsedSistema.modulos = modulosDelSistema.map((modulo: any) => 
            `${this.cleanString(modulo.nombreModulo)} - ${this.cleanString(modulo.funcionModulo)}`
          );
          

        }

        // Validar familia de sistema
        const familiaSistemaLabel = this.cleanString(sistemaRow.familiaSistema);
        if (!familiaSistemaLabel) {
          parsedSistema.errors.push('La familia de sistema es requerida');
        } else {
          // Si se proporcionan familias permitidas, validar contra la organización
          if (familiasPermitidas && familiasPermitidas.length > 0) {
            const validationResult = validateFamiliaSistemaByOrganizacion(familiaSistemaLabel, familiasPermitidas);
            if (!validationResult.isValid) {
              parsedSistema.errors.push(validationResult.error!);
            } else {
              const familiaId = getFamiliaSistemaIdByLabel(familiaSistemaLabel, familiasPermitidas);
              if (familiaId !== undefined) {
                parsedSistema.sistema.familiaSistema = familiaId;
              } else {
                parsedSistema.errors.push(`No se pudo obtener el ID de la familia de sistema: "${familiaSistemaLabel}"`);
              }
            }
          } else {
            // Fallback a la validación original si no se proporcionan familias permitidas
            const familiaValue = this.getFamiliaSistemaByLabel(familiaSistemaLabel);
            if (familiaValue === undefined) {
              parsedSistema.errors.push(`Familia de sistema inválida: "${familiaSistemaLabel}". Valores permitidos: ${Object.values(FAMILIA_SISTEMA_LABELS).join(', ')}`);
            } else {
              parsedSistema.sistema.familiaSistema = familiaValue;
            }
          }
        }

        // Validaciones básicas
        if (!parsedSistema.sistema.nombreSistema) {
          parsedSistema.errors.push('El nombre del sistema es requerido');
        }
        
        if (parsedSistema.errors.length === 0) {
          result.summary.validSystems++;
          sistemaNames.add(parsedSistema.sistema.nombreSistema);
          if (parsedSistema.sistema.codigoSistema) {
            sistemaCodes.add(parsedSistema.sistema.codigoSistema);
          }
        } else {
          result.summary.invalidSystems++;
        }

        result.sistemas.push(parsedSistema);
      }


      
    } catch (error) {

      result.errors.push(`Error al procesar hojas separadas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    return result;
  }

  /**
   * Parsea el formato legacy (una sola hoja)
   */
  private static async parseLegacyFormatExcel(
    workbook: XLSX.WorkBook, 
    organizacionId: number, 
    familiasPermitidas?: FamiliaSistemaOption[]
  ): Promise<ExcelSistemasParseResult> {

    
    const result: ExcelSistemasParseResult = {
      sistemas: [],
      errors: [],
      warnings: [],
      summary: {
        totalRows: 0,
        validSystems: 0,
        invalidSystems: 0,
        totalModules: 0
      }
    };

    try {
      // Para formato legacy no validamos headers nuevamente (ya se validó antes)
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const rawData: ExcelSistemaRowData[] = XLSX.utils.sheet_to_json(worksheet, {
        header: [
          'nombreSistema',
          'codigoSistema', 
          'funcionPrincipal',
          'tipoSistema',
          'familiaSistema',
          'sistemaDepende',
          'modulos'
        ],
        range: 1 // Saltar header row
      });

      result.summary.totalRows = rawData.length;

      // Procesar cada fila
      const sistemaNames = new Set<string>();
      const sistemaCodes = new Set<string>();
      
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNumber = i + 2; // +2 porque empezamos en fila 1 (header) y array empieza en 0
        
        const parsedSistema = this.parseRow(row, rowNumber, organizacionId, sistemaNames, sistemaCodes, familiasPermitidas);
        
        if (parsedSistema.errors.length === 0) {
          result.summary.validSystems++;
          sistemaNames.add(parsedSistema.sistema.nombreSistema);
          if (parsedSistema.sistema.codigoSistema) {
            sistemaCodes.add(parsedSistema.sistema.codigoSistema);
          }
        } else {
          result.summary.invalidSystems++;
        }
        
        result.summary.totalModules += parsedSistema.modulos.length;
        result.sistemas.push(parsedSistema);
      }

      // Validar dependencias entre sistemas
      this.validateDependencies(result.sistemas, result);

    } catch (error) {
      result.errors.push(`Error al procesar formato legacy: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    return result;
  }

  /**
   * Parsea una fila individual del Excel
   */
  private static parseRow(
    row: ExcelSistemaRowData, 
    rowNumber: number, 
    organizacionId: number,
    existingNames: Set<string>,
    existingCodes: Set<string>,
    familiasPermitidas?: FamiliaSistemaOption[]
  ): ParsedSistemaData {
    const result: ParsedSistemaData = {
      sistema: {
        nombreSistema: '',
        codigoSistema: undefined,
        funcionPrincipal: undefined,
        tipoSistema: TipoSistema.INTERNO,
        familiaSistema: FamiliaSistema.ERP,
        sistemaDepende: undefined,
        estado: EstadoSistema.Borrador
      },
      modulos: [],
      errors: [],
      warnings: [],
      rowNumber
    };

    // Validar nombre del sistema
    const nombreSistema = this.cleanString(row.nombreSistema);
    if (!nombreSistema) {
      result.errors.push('El nombre del sistema es requerido');
    } else {
      const nombreValidation = validateNombreSistema(nombreSistema, undefined, undefined);
      if (!nombreValidation.isValid) {
        result.errors.push(nombreValidation.error || 'Nombre de sistema inválido');
      } else if (existingNames.has(nombreSistema)) {
        result.errors.push('Ya existe un sistema con este nombre en el archivo');
      } else {
        result.sistema.nombreSistema = nombreSistema;
      }
    }

    // Validar código del sistema (opcional)
    const codigoSistema = this.cleanString(row.codigoSistema);
    if (codigoSistema) {
      const codigoValidation = validateCodigoSistema(codigoSistema, undefined, undefined);
      if (!codigoValidation.isValid) {
        result.errors.push(codigoValidation.error || 'Código de sistema inválido');
      } else if (existingCodes.has(codigoSistema)) {
        result.errors.push('Ya existe un sistema con este código en el archivo');
      } else {
        result.sistema.codigoSistema = codigoSistema;
      }
    }

    // Validar función principal (opcional)
    const funcionPrincipal = this.cleanString(row.funcionPrincipal);
    if (funcionPrincipal) {
      const funcionValidation = validateFuncionPrincipal(funcionPrincipal);
      if (!funcionValidation.isValid) {
        result.errors.push(funcionValidation.error || 'Función principal inválida');
      } else {
        result.sistema.funcionPrincipal = funcionPrincipal;
      }
    }

    // Validar tipo de sistema
    const tipoSistema = this.cleanString(row.tipoSistema);
    if (!tipoSistema) {
      result.errors.push('El tipo de sistema es requerido');
    } else {
      const tipoValue = this.getTipoSistemaByLabel(tipoSistema);
      if (tipoValue === undefined) {
        result.errors.push(`Tipo de sistema inválido: "${tipoSistema}". Valores permitidos: ${Object.values(TIPO_SISTEMA_LABELS).join(', ')}`);
      } else {
        result.sistema.tipoSistema = tipoValue;
      }
    }

    // Validar familia de sistema
    const familiaSistema = this.cleanString(row.familiaSistema);
    if (!familiaSistema) {
      result.errors.push('La familia de sistema es requerida');
    } else {
      // Si se proporcionan familias permitidas, validar contra la organización
      if (familiasPermitidas && familiasPermitidas.length > 0) {
        const validationResult = validateFamiliaSistemaByOrganizacion(familiaSistema, familiasPermitidas);
        if (!validationResult.isValid) {
          result.errors.push(validationResult.error!);
        } else {
          const familiaId = getFamiliaSistemaIdByLabel(familiaSistema, familiasPermitidas);
          if (familiaId !== undefined) {
            result.sistema.familiaSistema = familiaId;
          } else {
            result.errors.push(`No se pudo obtener el ID de la familia de sistema: "${familiaSistema}"`);
          }
        }
      } else {
        // Fallback a la validación original si no se proporcionan familias permitidas
        const familiaValue = this.getFamiliaSistemaByLabel(familiaSistema);
        if (familiaValue === undefined) {
          result.errors.push(`Familia de sistema inválida: "${familiaSistema}". Valores permitidos: ${Object.values(FAMILIA_SISTEMA_LABELS).join(', ')}`);
        } else {
          result.sistema.familiaSistema = familiaValue;
        }
      }
    }

    // Procesar sistema del que depende (opcional)
    const sistemaDepende = this.cleanString(row.sistemaDepende);
    if (sistemaDepende) {
      // Por ahora solo guardamos el nombre, la validación de existencia se hará en el backend
      result.sistema.sistemaDepende = sistemaDepende;
    }

    // Procesar módulos
    const modulos = this.cleanString(row.modulos);
    if (modulos) {
      result.modulos = modulos
        .split(';')
        .map(m => m.trim())
        .filter(m => m.length > 0);
      
      // Validar módulos
      result.modulos.forEach((modulo, index) => {
        if (modulo.length > 100) {
          result.warnings.push(`Módulo ${index + 1} excede 100 caracteres y será truncado`);
          result.modulos[index] = modulo.substring(0, 100);
        }
      });
    }

    return result;
  }

  /**
   * Valida las dependencias entre sistemas
   */
  private static validateDependencies(sistemas: ParsedSistemaData[], result: ExcelSistemasParseResult): void {
    const sistemaNames = new Map<string, number>();
    
    // Mapear nombres a números de fila
    sistemas.forEach(sistema => {
      if (sistema.sistema.nombreSistema) {
        sistemaNames.set(sistema.sistema.nombreSistema, sistema.rowNumber);
      }
    });

    // Validar dependencias
    sistemas.forEach(sistema => {
      if (sistema.sistema.nombreSistema && sistemas.find(s => s.sistema.nombreSistema === sistema.sistema.nombreSistema)) {
        const dependencia = this.cleanString(sistema.sistema.nombreSistema);
        if (dependencia && !sistemaNames.has(dependencia)) {
          sistema.warnings.push(`Sistema padre "${dependencia}" no encontrado en el archivo`);
        }
      }
    });
  }

  /**
   * Utilitarios
   */
  private static async readWorkbook(file: File): Promise<XLSX.WorkBook> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  private static extractHeaders(worksheet: XLSX.WorkSheet): string[] {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    const headers: string[] = [];
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        headers.push(cell.v.toString());
      }
    }
    
    return headers;
  }

  private static cleanString(value: any): string {
    if (value === undefined || value === null) return '';
    return value.toString().trim();
  }

  /**
   * Buscar tipo de sistema por label
   */
  private static getTipoSistemaByLabel(label: string): TipoSistema | undefined {
    const entry = Object.entries(TIPO_SISTEMA_LABELS).find(([_, value]) => 
      value.toLowerCase() === label.toLowerCase()
    );
    return entry ? parseInt(entry[0]) as TipoSistema : undefined;
  }

  /**
   * Buscar familia de sistema por label
   */
  private static getFamiliaSistemaByLabel(label: string): FamiliaSistema | undefined {
    const entry = Object.entries(FAMILIA_SISTEMA_LABELS).find(([_, value]) => 
      value.toLowerCase() === label.toLowerCase()
    );
    return entry ? parseInt(entry[0]) as FamiliaSistema : undefined;
  }

  /**
   * Generar reporte de errores para mostrar al usuario
   */
  static generateErrorReport(result: ExcelSistemasParseResult): string {
    const lines: string[] = [];
    
    lines.push('=== REPORTE DE IMPORTACIÓN DE SISTEMAS ===\n');
    
    lines.push(`Total de filas procesadas: ${result.summary.totalRows}`);
    lines.push(`Sistemas válidos: ${result.summary.validSystems}`);
    lines.push(`Sistemas con errores: ${result.summary.invalidSystems}`);
    lines.push(`Total de módulos: ${result.summary.totalModules}\n`);
    
    if (result.errors.length > 0) {
      lines.push('ERRORES GENERALES:');
      result.errors.forEach((error, index) => {
        lines.push(`${index + 1}. ${error}`);
      });
      lines.push('');
    }
    
    if (result.warnings.length > 0) {
      lines.push('ADVERTENCIAS GENERALES:');
      result.warnings.forEach((warning, index) => {
        lines.push(`${index + 1}. ${warning}`);
      });
      lines.push('');
    }
    
    const systemsWithErrors = result.sistemas.filter(s => s.errors.length > 0);
    if (systemsWithErrors.length > 0) {
      lines.push('SISTEMAS CON ERRORES:');
      systemsWithErrors.forEach(sistema => {
        lines.push(`\nFila ${sistema.rowNumber}: ${sistema.sistema.nombreSistema || 'Sin nombre'}`);
        sistema.errors.forEach(error => {
          lines.push(`  ❌ ${error}`);
        });
        if (sistema.warnings.length > 0) {
          sistema.warnings.forEach(warning => {
            lines.push(`  ⚠️ ${warning}`);
          });
        }
      });
    }
    
    return lines.join('\n');
  }
}