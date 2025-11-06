import * as XLSX from 'xlsx';
import { 
  ParsedProcesoJerarquicoFromExcel, 
  ExcelProcesosJerarquicoParseResult,
  BulkInsertProcesosJerarquicoPayload,
  TipoProceso
} from '../models/Procesos';

// =============================================
// NUEVO PARSER PARA MODELO JERÁRQUICO
// =============================================

export interface ExcelProcesosJerarquicoParseResultLike {
  procesos: Array<{
    // Entrada compatible con UI existente
    proceso: {
      nombreProceso: string;
      codigoProceso?: string;
      descripcionProceso?: string;
      versionProceso?: string;
      ordenProceso?: number;
      padreCodigoProceso?: string; // Código del proceso padre
      nivel?: number;
      tipoProcesoNombre?: string; // Texto de tipo proceso según Excel
      tipoProcesoId?: number;     // ID mapeado del catálogo
    };
    errors: string[];
    warnings: string[];
    rowNumber: number;
  }>;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validProcesos: number;
    invalidProcesos: number;
    maxNivel: number;
  };
  // Payload específico para el nuevo modelo jerárquico
  payload: BulkInsertProcesosJerarquicoPayload;
}

export class ExcelProcesosJerarquicoParser {
  static async parseExcelFile(
    file: File,
    organizacionId: number,
    tiposProcesoCatalog: Array<{ tipoProcesoId: number; nombre: string }>
  ): Promise<ExcelProcesosJerarquicoParseResultLike> {
    const result: ExcelProcesosJerarquicoParseResultLike = {
      procesos: [],
      errors: [],
      warnings: [],
      summary: {
        totalRows: 0,
        validProcesos: 0,
        invalidProcesos: 0,
        maxNivel: 0,
      },
      payload: {
        organizacionId,
        creadoPor: 0, // creadoPor no se usa aquí en el parser
        procesos: [],
      },
    };

    // Helper para normalizar textos (case y acentos)
    const normalize = (s?: string) => (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      const procesosSheet = workbook.Sheets['PROCESOS'];
      if (!procesosSheet) {
        result.errors.push('La plantilla debe contener la hoja: PROCESOS');
        return result;
      }

      // Leer las columnas del Excel tal como están (primera fila como headers)
      const rawData: any[] = XLSX.utils.sheet_to_json(procesosSheet, { 
        defval: ''  // Valor por defecto para celdas vacías
      });

      // Mapeo de nombres de columnas del Excel a propiedades internas
      const columnMapping: { [key: string]: string } = {
        'Código Proceso': 'codigoProceso',
        'CodigoProceso': 'codigoProceso',
        'codigoProceso': 'codigoProceso',
        'Nombre Proceso': 'nombreProceso', 
        'NombreProceso': 'nombreProceso',
        'nombreProceso': 'nombreProceso',
        'Descripción Proceso': 'descripcionProceso',
        'DescripcionProceso': 'descripcionProceso', 
        'descripcionProceso': 'descripcionProceso',
        'Tipo Proceso': 'tipoProcesoNombre',
        'TipoProceso': 'tipoProcesoNombre',
        'tipoProcesoNombre': 'tipoProcesoNombre',
        'Orden Proceso': 'ordenProceso',
        'OrdenProceso': 'ordenProceso',
        'ordenProceso': 'ordenProceso',
        'Código Padre': 'codigoPadre',
        'CodigoPadre': 'codigoPadre', 
        'codigoPadre': 'codigoPadre',
        'Nivel': 'nivel',
        'nivel': 'nivel',
        'Version Proceso': 'versionProceso',
        'VersionProceso': 'versionProceso',
        'versionProceso': 'versionProceso'
      };

      // Normalizar los datos usando el mapeo de columnas
      const procesosNormalizados = rawData.map(row => {
        const normalizedRow: any = {};
        Object.keys(row).forEach(key => {
          const mappedKey = columnMapping[key] || key;
          normalizedRow[mappedKey] = row[key];
        });
        return normalizedRow;
      });

      result.summary.totalRows = procesosNormalizados.length;

      // Mapas para validar jerarquía
      const codigosProceso = new Set<string>();
      const procesosValidos: ParsedProcesoJerarquicoFromExcel[] = [];
      let tempIdCounter = 1;
      let maxNivel = 0;

      // Construir mapa de tipos por nombre normalizado
      const tiposMap = new Map<string, number>();
      (tiposProcesoCatalog || []).forEach(tp => {
        tiposMap.set(normalize(tp.nombre), tp.tipoProcesoId);
      });

      // Primera pasada: validar y crear procesos
      for (let i = 0; i < procesosNormalizados.length; i++) {
        const r = procesosNormalizados[i];
        const codigo = this.clean(r.codigoProceso);
        const nombre = this.clean(r.nombreProceso);
        const descripcion = this.clean(r.descripcionProceso);
        const tipoProcesoNombre = this.clean(r.tipoProcesoNombre);
        const version = this.clean(r.versionProceso) || '1.0';
        const orden = this.parseNumber(r.ordenProceso) || 0;
        const codigoPadre = this.clean(r.codigoPadre);
        const nivel = this.parseNumber(r.nivel) || 1;

        const rowErrors: string[] = [];
        const rowWarnings: string[] = [];

        // Validaciones básicas
        if (!codigo) rowErrors.push('El Código Proceso es requerido');
        if (!nombre) rowErrors.push('El Nombre Proceso es requerido');
        if (codigo && codigosProceso.has(codigo)) {
          rowErrors.push(`Código Proceso duplicado: ${codigo}`);
        }
        if (nivel < 1 || nivel > 10) {
          rowErrors.push('El nivel debe estar entre 1 y 10');
        }

        // Validación de Tipo Proceso
        let tipoProcesoId: number | undefined = undefined;
        if (!tipoProcesoNombre) {
          rowErrors.push('El Tipo Proceso es requerido');
        } else {
          const id = tiposMap.get(normalize(tipoProcesoNombre));
          if (!id) {
            rowErrors.push(`El Tipo Proceso '${tipoProcesoNombre}' no existe en la organización`);
          } else {
            tipoProcesoId = id;
          }
        }

        // Validaciones de jerarquía
        if (nivel === 1 && codigoPadre) {
          rowWarnings.push('Los procesos de nivel 1 no deberían tener padre');
        }
        if (nivel > 1 && !codigoPadre) {
          rowErrors.push('Los procesos de nivel mayor a 1 deben tener un código padre');
        }

        const compatibleEntry = {
          proceso: {
            nombreProceso: nombre || '',
            codigoProceso: codigo || undefined,
            descripcionProceso: descripcion || undefined,
            versionProceso: version,
            ordenProceso: orden,
            padreCodigoProceso: codigoPadre || undefined,
            nivel: nivel,
            tipoProcesoNombre: tipoProcesoNombre || undefined,
            tipoProcesoId: tipoProcesoId,
          },
          errors: rowErrors,
          warnings: rowWarnings,
          rowNumber: i + 2,
        };

        if (rowErrors.length === 0 && codigo && nombre && tipoProcesoId !== undefined) {
          codigosProceso.add(codigo);
          
          const procesoValido: ParsedProcesoJerarquicoFromExcel = {
            tempId: tempIdCounter++,
            padreCodigoProceso: codigoPadre || null,
            organizacionId,
            tipoProcesoId: tipoProcesoId, // ✅ usar mapeo real
            codigoProceso: codigo,
            nombreProceso: nombre,
            descripcionProceso: descripcion || null,
            versionProceso: version,
            ordenProceso: orden,
            nivel: nivel,
          };

          procesosValidos.push(procesoValido);
          result.summary.validProcesos++;
          maxNivel = Math.max(maxNivel, nivel);
        } else {
          result.summary.invalidProcesos++;
        }

        result.procesos.push(compatibleEntry);
      }

      // Segunda pasada: validar referencias de jerarquía
      const codigosValidosSet = new Set(procesosValidos.map(p => p.codigoProceso));
      
      for (const proceso of procesosValidos) {
        if (proceso.padreCodigoProceso && !codigosValidosSet.has(proceso.padreCodigoProceso)) {
          const procesoEntry = result.procesos.find(p => p.proceso.codigoProceso === proceso.codigoProceso);
          if (procesoEntry) {
            procesoEntry.errors.push(`El proceso padre '${proceso.padreCodigoProceso}' no existe o es inválido`);
            result.summary.validProcesos--;
            result.summary.invalidProcesos++;
          }
        } else {
          // Agregar al payload final
          result.payload.procesos.push({
            tempId: proceso.tempId,
            padreCodigoProceso: proceso.padreCodigoProceso,
            tipoProcesoId: proceso.tipoProcesoId!,
            codigoProceso: proceso.codigoProceso,
            nombreProceso: proceso.nombreProceso,
            descripcionProceso: proceso.descripcionProceso,
            versionProceso: proceso.versionProceso,
            ordenProceso: proceso.ordenProceso,
            nivel: proceso.nivel,
          });
        }
      }

      result.summary.maxNivel = maxNivel;

    } catch (err) {
      result.errors.push(`Error al procesar el archivo: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }

    return result;
  }

  private static clean(value: any): string | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    return String(value).trim();
  }

  private static parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
}

// Mantener compatibilidad con el parser anterior
export { ExcelProcesosJerarquicoParser as ExcelProcesosParser };
export type { ExcelProcesosJerarquicoParseResultLike as ExcelProcesosParseSummaryLike };
export type { ExcelProcesosJerarquicoParseResultLike as ExcelProcesosParseResultLike };