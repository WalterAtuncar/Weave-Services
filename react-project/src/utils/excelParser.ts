import * as XLSX from 'xlsx';
import { dateToLocalString } from '../lib/utils';

// Interfaces para los datos del Excel (sin organización - se obtiene del contexto)
export interface ExcelRowData {
  // organizacion: string; // ELIMINADO: Se obtiene del contexto del usuario logueado
  codigoUnidad: string;
  nombreUnidad: string;
  unidadPadre: string;
  tipoUnidad: string;
  posicion: string;
  categoria: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  celular: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  esUsuario: string; // Nueva columna: "SI" o "NO"
}

// Interface para errores de validación con ubicación
export interface ValidationError {
  row: number;
  column: string;
  field: string;
  message: string;
  value: any;
}

// Interface para resultado de validación
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Interfaces para Carga Masiva - Estructura Organizacional (Depurado)
export interface IOrganizacion {
  OrganizacionId: number;
  RazonSocial: string;
  Codigo: string;
}

export interface IPersona {
  PersonaIdTemp: number;
  TipoDoc: string;
  NroDoc: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
  Nombres: string;
  FechaNacimiento: string;
  FechaIngreso: string;
  EmailPersonal: string;
  Celular: string;
  EsUsuario: boolean; // Nueva propiedad booleana para el backend
}

export interface IUnidadOrg {
  UnidadOrgIdTemp: number;
  OrganizacionId: number;
  UnidadPadreId: number | null;
  TipoUnidad: string;
  Nombre: string;
  NombreCorto: string;
}

export interface IPosicion {
  PosicionIdTemp: number;
  UnidadesOrgId: number;
  Nombre: string;
  Categoria: string;
}

export interface IPersonaPosicion {
  PersonaIdTemp: number;
  PosicionIdTemp: number;
}

// Interface principal para la carga masiva
export interface ICargaMasivaOrganizacional {
  organizacion: IOrganizacion;
  personas: IPersona[];
  unidadesOrg: IUnidadOrg[];
  posiciones: IPosicion[];
  personaPosicion: IPersonaPosicion[];
}

// Interfaces para datos procesados (mantener compatibilidad)
export interface ParsedOrganizationalData {
  organizacion: {
    organizacionId: number;
    razonSocial: string;
  };
  unidades: Array<{
    unidadesOrgId: number;
    organizacionId: number;
    unidadPadreId: number | null;
    nombre: string;
    nombreCorto: string;
    tipoUnidad: string;
    objetivo: string;
    estado: string;
    version: number;
  }>;
  posiciones: Array<{
    posicionId: number;
    unidadesOrgId: number;
    nombre: string;
    categoria: string;
    objetivo: string;
    ordenImpresion: number;
    estado: string;
    version: number;
  }>;
  personas: Array<{
    personaId: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nroDoc: string;
    tipoDoc: string;
    emailPersonal: string;
    celular: string;
    codEmpleado: string;
    fechaNacimiento?: string;
    fechaIngreso?: string;
    estado: string;
    esUsuario: boolean; // Nueva propiedad booleana
  }>;
  personaPosiciones: Array<{
    personaId: number;
    posicionId: number;
    fechaInicio: string;
    fechaFin: string | null;
    estado: string;
    version: number;
  }>;
  // Agregar el nuevo objeto para carga masiva
  cargaMasivaData: ICargaMasivaOrganizacional;
  // Nuevos campos para validación
  validationErrors: ValidationError[];
  hasValidationErrors: boolean;
}

export class ExcelOrganizationalParser {
  private static generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Convierte cualquier valor a string, manejando números y nulos
   * @param value Valor a convertir
   * @returns String o cadena vacía si es nulo/undefined
   */
  private static ensureString(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  }

  // Método para parsear con información de organización del contexto
  static async parseExcelFile(file: File, organizacionContexto?: { organizacionId: number; razonSocial: string; codigo?: string }): Promise<ParsedOrganizationalData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir a JSON con headers personalizados (sin organización)
          const jsonData: ExcelRowData[] = XLSX.utils.sheet_to_json(worksheet, {
            header: [
              // 'organizacion', // ELIMINADO: Se obtiene del contexto
              'codigoUnidad', 
              'nombreUnidad',
              'unidadPadre',
              'tipoUnidad',
              'posicion',
              'categoria',
              'nombre',
              'apellidoPaterno',
              'apellidoMaterno',
              'tipoDocumento',
              'numeroDocumento',
              'email',
              'celular',
              'fechaNacimiento',
              'fechaIngreso',
              'esUsuario'
            ],
            range: 1 // Empezar desde la fila 2 (saltar headers)
          });

          const parsedData = this.processExcelData(jsonData, organizacionContexto);
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Error al procesar el archivo Excel: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  private static processExcelData(rawData: ExcelRowData[], organizacionContexto?: { organizacionId: number; razonSocial: string; codigo?: string }): ParsedOrganizationalData {
    // Filtrar filas que tienen datos básicos antes de validar
    const filasConDatos = rawData.filter(row => 
      row.nombreUnidad && row.codigoUnidad // Solo validar filas con datos básicos
    );

    // ✅ SIMPLIFICADO: Solo recolectar códigos para validaciones básicas
    // 🚫 NO se validan duplicados - El parser se encarga de consolidar unidades con códigos repetidos
    const todosCodigosUnidad = new Set<string>();
    const nombreUnidadToCodigos = new Map<string, Set<string>>(); // Mapeo nombre -> códigos
    const nombresConMultiplesCodigos = new Set<string>(); // Nombres con códigos diferentes
    
    filasConDatos.forEach(row => {
      if (row.codigoUnidad && row.codigoUnidad.trim()) {
        const codigoUpper = this.ensureString(row.codigoUnidad).toUpperCase();
        todosCodigosUnidad.add(codigoUpper); // ✅ Permitir duplicados - el parser los consolidará
      }

      // 🔧 NUEVA VALIDACIÓN: Detectar nombres con múltiples códigos
      if (row.nombreUnidad && row.nombreUnidad.trim() && row.codigoUnidad && row.codigoUnidad.trim()) {
        const nombreLimpio = this.ensureString(row.nombreUnidad).trim().toLowerCase();
        const codigoLimpio = this.ensureString(row.codigoUnidad).trim().toUpperCase();
        
        if (!nombreUnidadToCodigos.has(nombreLimpio)) {
          nombreUnidadToCodigos.set(nombreLimpio, new Set<string>());
        }
        
        const codigosExistentes = nombreUnidadToCodigos.get(nombreLimpio)!;
        codigosExistentes.add(codigoLimpio);
        
        // Si este nombre ya tiene más de un código, marcarlo como problemático
        if (codigosExistentes.size > 1) {
          nombresConMultiplesCodigos.add(nombreLimpio);
        }
      }
    });

    // 🔧 PASO 2: Validar todos los datos con el conjunto completo de códigos
    const allValidationErrors: ValidationError[] = [];
    const existingData = {
      codigosUnidad: todosCodigosUnidad, // 🔧 Usar el conjunto completo
      nombreUnidadToCodigos: nombreUnidadToCodigos, // 🔧 Mapeo nombre -> códigos
      nombresConMultiplesCodigos: nombresConMultiplesCodigos, // 🔧 Nombres con códigos múltiples
      numerosDocumento: new Set<string>(),
      emails: new Set<string>()
    };

    // Validar solo las filas que tienen datos
    filasConDatos.forEach((row, index) => {
      // Encontrar el índice real en rawData para reportar la fila correcta
      const realIndex = rawData.findIndex(r => r === row);
      const rowErrors = this.validateExcelRow(row, realIndex, existingData);
      allValidationErrors.push(...rowErrors);
    });

    // Si hay errores de validación, retornar resultado con errores
    if (allValidationErrors.length > 0) {
      return {
        organizacion: {
          organizacionId: organizacionContexto?.organizacionId || 0,
          razonSocial: organizacionContexto?.razonSocial || 'Sin organización'
        },
        unidades: [],
        posiciones: [],
        personas: [],
        personaPosiciones: [],
        cargaMasivaData: {
          organizacion: {
            OrganizacionId: organizacionContexto?.organizacionId || 0,
            RazonSocial: organizacionContexto?.razonSocial || 'Sin organización',
            Codigo: organizacionContexto?.codigo || ''
          },
          unidadesOrg: [],
          posiciones: [],
          personas: [],
          personaPosicion: []
        },
        validationErrors: allValidationErrors,
        hasValidationErrors: true
      };
    }

    // Filtrar filas vacías (sin verificar organización ya que no existe)
    const validData = rawData.filter(row => 
      row.nombreUnidad && row.codigoUnidad
    );

    if (validData.length === 0) {
      throw new Error('No se encontraron datos válidos en el archivo Excel');
    }

    // Usar información de la organización del contexto o crear una por defecto
    const organizacionInfo = organizacionContexto || {
      organizacionId: this.generateId(),
      razonSocial: 'Organización Importada'
    };

    // ✅ Procesar unidades - Se permite códigos duplicados, el parser los consolidará automáticamente
    const unidadesMap = new Map<string, any>();
    const posicionesMap = new Map<string, any>();
    const personasMap = new Map<string, any>();
    const asignaciones: Array<any> = [];

    validData.forEach((row, index) => {
      // Procesar unidad
      if (!unidadesMap.has(row.codigoUnidad)) {
        const unidadPadreId = row.unidadPadre && row.unidadPadre !== row.codigoUnidad 
          ? this.findUnidadIdByCodigo(unidadesMap, row.unidadPadre) 
          : null;

        const unidad = {
          unidadesOrgId: this.generateId(),
          organizacionId: organizacionInfo.organizacionId,
          unidadPadreId,
          nombre: this.ensureString(row.nombreUnidad),
          nombreCorto: this.ensureString(row.codigoUnidad),
          tipoUnidad: this.ensureString(row.tipoUnidad).toUpperCase() || 'AREA',
          objetivo: `Gestionar las actividades de ${this.ensureString(row.nombreUnidad)}`,
          estado: 'ACTIVO',
          version: 1,
          _codigo: this.ensureString(row.codigoUnidad), // Para referencia temporal
          _unidadPadreRaw: this.ensureString(row.unidadPadre) // Guardar referencia raw para debugging
        };
        unidadesMap.set(row.codigoUnidad, unidad);
      }

      // Procesar posición si existe
      if (row.posicion && row.posicion.trim()) {
        const posicionKey = `${row.codigoUnidad}-${row.posicion}`;
        if (!posicionesMap.has(posicionKey)) {
          const unidad = unidadesMap.get(row.codigoUnidad);
          const posicion = {
            posicionId: this.generateId(),
            unidadesOrgId: unidad.unidadesOrgId,
            nombre: this.ensureString(row.posicion),
            categoria: this.ensureString(row.categoria).toUpperCase() || 'ESPECIALISTA',
            objetivo: `Responsable de ${this.ensureString(row.posicion)}`,
            ordenImpresion: index + 1,
            estado: 'ACTIVO',
            version: 1
          };

          posicionesMap.set(posicionKey, posicion);
        }

        // Procesar persona si existe
        if (row.nombre && row.apellidoPaterno && row.numeroDocumento) {
          if (!personasMap.has(row.numeroDocumento)) {
            const persona = {
              personaId: this.generateId(),
              nombres: this.ensureString(row.nombre),
              apellidoPaterno: this.ensureString(row.apellidoPaterno),
              apellidoMaterno: this.ensureString(row.apellidoMaterno),
              nroDoc: this.ensureString(row.numeroDocumento),
              tipoDoc: this.ensureString(row.tipoDocumento) || 'DNI',
              emailPersonal: this.ensureString(row.email),
              celular: this.ensureString(row.celular),
              codEmpleado: `EMP${String(index + 1).padStart(3, '0')}`,
              fechaNacimiento: this.formatDate(row.fechaNacimiento),
              fechaIngreso: this.formatDate(row.fechaIngreso),
              estado: 'ACTIVO',
              esUsuario: this.ensureString(row.esUsuario).toUpperCase() === 'SI'
            };

            personasMap.set(row.numeroDocumento, persona);
          }

          // Crear asignación persona-posición
          const persona = personasMap.get(row.numeroDocumento);
          const posicion = posicionesMap.get(posicionKey);

          if (persona && posicion) {
            asignaciones.push({
              personaId: persona.personaId,
              posicionId: posicion.posicionId,
              fechaInicio: this.formatDate(row.fechaIngreso) || dateToLocalString(new Date()),
              fechaFin: null,
              estado: 'ACTIVO',
              version: 1
            });
          }
        }
      }
    });

    // Resolver referencias de unidades padre después de procesar todas
    const unidadesArray = Array.from(unidadesMap.values()).map(unidad => {
      if (unidad.unidadPadreId === null && unidad._codigo) {
        // Buscar el padre real
        const rowWithPadre = validData.find(row => 
          row.codigoUnidad === unidad._codigo && 
          row.unidadPadre && 
          row.unidadPadre !== row.codigoUnidad &&
          row.unidadPadre.trim() !== ''
        );
        
        if (rowWithPadre && rowWithPadre.unidadPadre) {
          const unidadPadre = unidadesMap.get(rowWithPadre.unidadPadre);
          if (unidadPadre) {
            unidad.unidadPadreId = unidadPadre.unidadesOrgId;

          } else {

          }
        } else {

        }
      } else if (unidad.unidadPadreId !== null) {

      }
      
      // Limpiar propiedades temporales
      delete unidad._codigo;
      delete unidad._unidadPadreRaw;
      return unidad;
    });

    // Debug: Mostrar las relaciones procesadas antes de construir el objeto

    // Construir objeto de carga masiva
    const cargaMasivaData = this.buildCargaMasivaObject(
      organizacionInfo,
      validData,
      unidadesMap,
      posicionesMap,
      personasMap
    );

    // Mostrar resumen de la carga masiva

    return {
      organizacion: organizacionInfo,
      unidades: unidadesArray,
      posiciones: Array.from(posicionesMap.values()),
      personas: Array.from(personasMap.values()),
      personaPosiciones: asignaciones,
      cargaMasivaData,
      validationErrors: [],
      hasValidationErrors: false
    };
  }

  private static findUnidadIdByCodigo(unidadesMap: Map<string, any>, codigo: string): number | null {
    const unidad = unidadesMap.get(codigo);
    return unidad ? unidad.unidadesOrgId : null;
  }

  private static buildCargaMasivaObject(
    organizacionInfo: { organizacionId: number; razonSocial: string; codigo?: string },
    validData: ExcelRowData[],
    unidadesMap: Map<string, any>,
    posicionesMap: Map<string, any>,
    personasMap: Map<string, any>
  ): ICargaMasivaOrganizacional {
    
    // Construir objeto de carga masiva
    
    // Contadores para IDs temporales consecutivos
    let personaIdCounter = 1;
    let unidadIdCounter = 1;
    let posicionIdCounter = 1;
    
    // Maps para mantener la relación entre códigos y IDs temporales
    const unidadCodigoToTempId = new Map<string, number>();
    const personaDocToTempId = new Map<string, number>();
    const posicionKeyToTempId = new Map<string, number>();

    // 1. Construir organización
    const organizacion: IOrganizacion = {
      OrganizacionId: organizacionInfo.organizacionId,
      RazonSocial: organizacionInfo.razonSocial,
      Codigo: organizacionInfo.codigo || organizacionInfo.razonSocial.substring(0, 10).toUpperCase()
    };

    // 2. Construir unidades organizacionales
    const unidadesOrg: IUnidadOrg[] = [];
    
    // Primero asignar IDs temporales a todas las unidades
    Array.from(unidadesMap.values()).forEach(unidad => {
      const tempId = unidadIdCounter++;
      const codigoUnidad = unidad._codigo || unidad.nombreCorto;
      unidadCodigoToTempId.set(codigoUnidad, tempId);

    });
    
    // Luego construir las unidades con las referencias correctas
    Array.from(unidadesMap.values()).forEach(unidad => {
      const codigoUnidad = unidad._codigo || unidad.nombreCorto;
      const tempId = unidadCodigoToTempId.get(codigoUnidad)!;
      
      // Buscar el ID temporal del padre usando múltiples estrategias
      let unidadPadreId: number | null = null;
      
      // Estrategia 1: Usar el unidadPadreId ya procesado en processExcelData
      if (unidad.unidadPadreId !== null) {
        // Encontrar la unidad padre por su unidadesOrgId
        const unidadPadre = Array.from(unidadesMap.values()).find(u => u.unidadesOrgId === unidad.unidadPadreId);
        if (unidadPadre) {
          const codigoPadre = unidadPadre._codigo || unidadPadre.nombreCorto;
          unidadPadreId = unidadCodigoToTempId.get(codigoPadre) || null;

        }
      }
      
      // Estrategia 2: Buscar en datos raw como fallback
      if (unidadPadreId === null && codigoUnidad) {
        const rowWithPadre = validData.find(row => 
          row.codigoUnidad === codigoUnidad && 
          row.unidadPadre && 
          row.unidadPadre !== row.codigoUnidad &&
          row.unidadPadre.trim() !== ''
        );
        
        if (rowWithPadre && rowWithPadre.unidadPadre) {
          unidadPadreId = unidadCodigoToTempId.get(rowWithPadre.unidadPadre) || null;

        }
      }



      unidadesOrg.push({
        UnidadOrgIdTemp: tempId,
        OrganizacionId: organizacionInfo.organizacionId,
        UnidadPadreId: unidadPadreId,
        TipoUnidad: unidad.tipoUnidad,
        Nombre: unidad.nombre,
        NombreCorto: unidad.nombreCorto
      });
    });

    // 3. Construir personas
    const personas: IPersona[] = [];
    
    Array.from(personasMap.values()).forEach(persona => {
      const tempId = personaIdCounter++;
      personaDocToTempId.set(persona.nroDoc, tempId);

      personas.push({
        PersonaIdTemp: tempId,
        TipoDoc: this.ensureString(persona.tipoDoc),
        NroDoc: this.ensureString(persona.nroDoc),
        ApellidoPaterno: this.ensureString(persona.apellidoPaterno),
        ApellidoMaterno: this.ensureString(persona.apellidoMaterno),
        Nombres: this.ensureString(persona.nombres),
        FechaNacimiento: this.ensureString(persona.fechaNacimiento),
        FechaIngreso: this.ensureString(persona.fechaIngreso),
        EmailPersonal: this.ensureString(persona.emailPersonal),
        Celular: this.ensureString(persona.celular),
        EsUsuario: persona.esUsuario
      });
    });

    // 4. Construir posiciones
    const posiciones: IPosicion[] = [];
    
    Array.from(posicionesMap.values()).forEach(posicion => {
      const tempId = posicionIdCounter++;
      
      // Encontrar el ID temporal de la unidad
      const unidadOriginal = Array.from(unidadesMap.values()).find(u => u.unidadesOrgId === posicion.unidadesOrgId);
      const unidadTempId = unidadCodigoToTempId.get(unidadOriginal?._codigo || unidadOriginal?.nombreCorto) || 1;
      
      // Crear clave única para la posición
      const posicionKey = `${unidadOriginal?._codigo || unidadOriginal?.nombreCorto}-${posicion.nombre}`;
      posicionKeyToTempId.set(posicionKey, tempId);

      posiciones.push({
        PosicionIdTemp: tempId,
        UnidadesOrgId: unidadTempId,
        Nombre: posicion.nombre,
        Categoria: posicion.categoria
      });
    });

    // 5. Construir relaciones persona-posición
    const personaPosicion: IPersonaPosicion[] = [];
    
    validData.forEach((row, index) => {
      if (row.nombre && row.apellidoPaterno && row.numeroDocumento && row.posicion) {
        // Convertir numeroDocumento a string para que coincida con el mapeo
        const numeroDocumentoString = String(row.numeroDocumento);
        const personaTempId = personaDocToTempId.get(numeroDocumentoString);
        // Limpiar espacios extra en la posición antes de construir la clave
        const posicionLimpia = row.posicion.trim();
        const posicionKey = `${row.codigoUnidad}-${posicionLimpia}`;
        const posicionTempId = posicionKeyToTempId.get(posicionKey);

        if (personaTempId && posicionTempId) {
          // Evitar duplicados
          const existe = personaPosicion.some(pp => 
            pp.PersonaIdTemp === personaTempId && pp.PosicionIdTemp === posicionTempId
          );
          
          if (!existe) {
            personaPosicion.push({
              PersonaIdTemp: personaTempId,
              PosicionIdTemp: posicionTempId
            });
          }
        }
      }
    });

    const result = {
      organizacion,
      personas,
      unidadesOrg,
      posiciones,
      personaPosicion
    };
    
    // 🔧 AGREGADO: Mostrar información de usuarios que se van a crear
    const personasConUsuario = personas.filter(p => p.EsUsuario);
    
    return result;
  }

    private static formatDate(dateString: string): string | undefined {
    if (!dateString) return undefined;
    
    const cleanString = String(dateString).trim();
    if (!cleanString) return undefined;
    
    try {
      // Si es un número (serial de Excel)
      if (!isNaN(Number(cleanString))) {
        const excelDate = new Date((Number(cleanString) - 25569) * 86400 * 1000);
        if (!isNaN(excelDate.getTime())) {
          return dateToLocalString(excelDate);
        }
      }
      
      // Verificar formato DD/MM/YYYY, D/M/YYYY, DD/M/YYYY, D/MM/YYYY
      const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
      const match = cleanString.match(ddmmyyyyPattern);
      
      if (match) {
        let [, day, month, year] = match;
        
        // Convertir año de 2 dígitos a 4 dígitos si es necesario
        if (year.length === 2) {
          const currentYear = new Date().getFullYear();
          const yearNum = parseInt(year);
          // Si el año está entre 00-30, asumimos 2000-2030, sino 1900-1999
          if (yearNum <= 30) {
            year = (2000 + yearNum).toString();
          } else {
            year = (1900 + yearNum).toString();
          }
        }
        
        // Asegurar formato con ceros a la izquierda
        day = day.padStart(2, '0');
        month = month.padStart(2, '0');
        year = year.padStart(4, '0');
        
        // Crear fecha en formato ISO (YYYY-MM-DD)
        const isoDate = `${year}-${month}-${day}`;
        const date = new Date(isoDate);
        
        // SIMPLIFICACIÓN: Si la fecha se puede crear y no es NaN, es válida
        const isValidTime = !isNaN(date.getTime());
        
        if (isValidTime) {
          return isoDate;
        }
      }
      
      // Si no es DD/MM/YYYY, intentar otros formatos comunes
      // YYYY-MM-DD
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleanString)) {
        const date = new Date(cleanString);
        if (!isNaN(date.getTime())) {
          return dateToLocalString(date);
        }
      }
      
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  static validateExcelStructure(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
          const errors: string[] = [];
          
          // Verificar que tenga al menos las columnas mínimas (sin organización: 16 columnas)
          if (range.e.c < 15) {
            errors.push('El archivo debe tener al menos 16 columnas (incluyendo la nueva columna "Es Usuario")');
          }
          
          // Verificar que tenga datos
          if (range.e.r < 1) {
            errors.push('El archivo debe tener al menos 2 filas (header + datos)');
          }
          
          // Validar headers esperados (opcional, para mejor UX)
          const firstRow = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0 })[0] as string[];
          if (firstRow && firstRow.length > 0) {
            const expectedHeaders = [
              'Código Unidad', 'Nombre Unidad', 'Unidad Padre', 'Tipo Unidad', 'Posición',
              'Categoría', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Tipo Documento',
              'Número Documento', 'Email', 'Celular', 'Fecha Nacimiento', 'Fecha Ingreso', 'Es Usuario'
            ];
            
            const hasOrganizacionColumn = firstRow[0]?.toLowerCase().includes('organización') || 
                                        firstRow[0]?.toLowerCase().includes('organizacion');
            
            if (hasOrganizacionColumn) {
              errors.push('⚠️ El archivo contiene la columna "Organización" que ya no es necesaria. Por favor, descarga la nueva plantilla sin esta columna.');
            }
          }
          
          resolve({
            isValid: errors.length === 0,
            errors
          });
        } catch (error) {
          resolve({
            isValid: false,
            errors: [`Error al validar el archivo: ${error}`]
          });
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convierte el objeto de carga masiva al formato esperado por el endpoint del backend
   * @param cargaMasivaData Objeto de carga masiva interno
   * @returns Objeto en formato del endpoint
   */
  static convertToEndpointFormat(cargaMasivaData: ICargaMasivaOrganizacional): any {
    return {
      organizacion: {
        organizacionId: cargaMasivaData.organizacion.OrganizacionId,
        razonSocial: this.ensureString(cargaMasivaData.organizacion.RazonSocial),
        codigo: this.ensureString(cargaMasivaData.organizacion.Codigo)
      },
      personas: cargaMasivaData.personas.map(persona => ({
        personaIdTemp: persona.PersonaIdTemp,
        tipoDoc: this.mapTipoDocumento(this.ensureString(persona.TipoDoc)),
        nroDoc: this.ensureString(persona.NroDoc),
        codEmpleado: this.ensureString(persona.NroDoc), // Usar número de documento como código de empleado
        apellidoPaterno: this.ensureString(persona.ApellidoPaterno),
        apellidoMaterno: this.ensureString(persona.ApellidoMaterno),
        nombres: this.ensureString(persona.Nombres),
        estadoLaboral: 1, // Activo por defecto
        fechaNacimiento: this.ensureString(persona.FechaNacimiento),
        fechaIngreso: this.ensureString(persona.FechaIngreso),
        emailPersonal: this.ensureString(persona.EmailPersonal),
        celular: this.ensureString(persona.Celular),
        direccion: "", // Campo vacío por defecto
        ubigeo: "", // Campo vacío por defecto
        esUsuario: persona.EsUsuario
      })),
      unidadesOrg: cargaMasivaData.unidadesOrg.map(unidad => ({
        unidadOrgIdTemp: unidad.UnidadOrgIdTemp,
        organizacionId: unidad.OrganizacionId,
        unidadPadreId: unidad.UnidadPadreId,
        tipoUnidad: this.mapTipoUnidad(this.ensureString(unidad.TipoUnidad)),
        nombre: this.ensureString(unidad.Nombre),
        nombreCorto: this.ensureString(unidad.NombreCorto),
        objetivo: "", // Campo vacío por defecto
        posicionCategoria: 1, // Valor por defecto
        centroCosto: "" // Campo vacío por defecto
      })),
      posiciones: cargaMasivaData.posiciones.map(posicion => ({
        posicionIdTemp: posicion.PosicionIdTemp,
        unidadOrgIdTemp: posicion.UnidadesOrgId,
        nombre: this.ensureString(posicion.Nombre),
        categoria: this.mapCategoriaPosicion(this.ensureString(posicion.Categoria)),
        objetivo: "", // Campo vacío por defecto
        ordenImpresion: 0 // Valor por defecto
      })),
      personaPosicion: cargaMasivaData.personaPosicion.map(relacion => ({
        personaIdTemp: relacion.PersonaIdTemp,
        posicionIdTemp: relacion.PosicionIdTemp,
        fechaInicio: dateToLocalString(new Date()), // Fecha actual
        fechaFin: null // Sin fecha fin por defecto
      }))
    };
  }

  /**
   * Mapea el tipo de documento a número
   * @param tipoDoc Tipo de documento como string
   * @returns Número correspondiente al tipo de documento
   */
  private static mapTipoDocumento(tipoDoc: string): number {
    const mapeo: { [key: string]: number } = {
      'DNI': 1,
      'CE': 2,
      'PASAPORTE': 3,
      'RUC': 4
    };
    return mapeo[tipoDoc.toUpperCase()] || 1; // DNI por defecto
  }

  /**
   * Mapea el tipo de unidad a número
   * @param tipoUnidad Tipo de unidad como string
   * @returns Número correspondiente al tipo de unidad
   */
  private static mapTipoUnidad(tipoUnidad: string): number {
    const mapeo: { [key: string]: number } = {
      'DIRECCION': 1, // Mapeado a Corporativo (nivel más alto)
      'CORPORATIVO': 1,
      'DIVISION': 2,
      'GERENCIA': 3,
      'SUBGERENCIA': 4,
      'DEPARTAMENTO': 5,
      'AREA': 6,
      'SECCION': 7,
      'EQUIPO': 8
    };
    return mapeo[tipoUnidad.toUpperCase()] || 8; // EQUIPO por defecto
  }

  /**
   * Mapea la categoría de posición a número
   * @param categoria Categoría como string
   * @returns Número correspondiente a la categoría
   */
  private static mapCategoriaPosicion(categoria: string): number {
    const mapeo: { [key: string]: number } = {
      'DIRECTIVO': 1,
      'GERENCIAL': 2,
      'JEFATURA': 3,
      'SUPERVISORIO': 4,
      'ANALISTA': 5,
      'ESPECIALISTA': 6,
      'TECNICO': 7,
      'OPERATIVO': 8,
      'PRACTICANTE': 9
    };
    return mapeo[categoria.toUpperCase()] || 5; // ANALISTA por defecto
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN DE CAMPOS
  // =============================================

  /**
   * Valida una fila completa del Excel
   */
  private static validateExcelRow(row: ExcelRowData, rowIndex: number, existingData: {
    codigosUnidad: Set<string>,
    nombreUnidadToCodigos: Map<string, Set<string>>,
    nombresConMultiplesCodigos: Set<string>,
    numerosDocumento: Set<string>,
    emails: Set<string>
  }): ValidationError[] {
    const errors: ValidationError[] = [];
    const rowNumber = rowIndex + 2; // +2 porque array empieza en 0 y hay header

    // Mapeo de columnas (A=1, B=2, etc.)
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

    // 1. Validar Código Unidad (Columna A)
              errors.push(...this.validateCodigoUnidad(row.codigoUnidad, rowNumber, columns[0])); // ✅ No se valida duplicados

    // 2. Validar Nombre Unidad (Columna B)
    errors.push(...this.validateNombreUnidad(row.nombreUnidad, rowNumber, columns[1]));

    // 2.1. 🔧 NUEVA VALIDACIÓN: Consistencia Nombre-Código
    errors.push(...this.validateNombreUnidadConsistencia(row.nombreUnidad, row.codigoUnidad, rowNumber, columns[1], existingData.nombreUnidadToCodigos, existingData.nombresConMultiplesCodigos));

    // 3. Validar Unidad Padre (Columna C)
    errors.push(...this.validateUnidadPadre(row.unidadPadre, row.codigoUnidad, rowNumber, columns[2], existingData.codigosUnidad));

    // 4. Validar Tipo Unidad (Columna D)
    errors.push(...this.validateTipoUnidad(row.tipoUnidad, rowNumber, columns[3]));

    // 5. Validar Posición si existe (Columna E)
    if (row.posicion && row.posicion.trim()) {
      errors.push(...this.validatePosicion(row.posicion, rowNumber, columns[4]));
    }

    // 6. Validar Categoría si existe posición (Columna F)
    if (row.posicion && row.posicion.trim()) {
      errors.push(...this.validateCategoria(row.categoria, rowNumber, columns[5]));
    }

    // 7. Validar datos de persona si existen
    if (row.nombre || row.apellidoPaterno || row.numeroDocumento) {
      // Validar Nombre (Columna G)
      errors.push(...this.validateNombrePersona(row.nombre, rowNumber, columns[6]));
      
      // Validar Apellido Paterno (Columna H)
      errors.push(...this.validateApellidoPaterno(row.apellidoPaterno, rowNumber, columns[7]));
      
      // Validar Apellido Materno (Columna I)
      errors.push(...this.validateApellidoMaterno(row.apellidoMaterno, rowNumber, columns[8]));
      
      // Validar Tipo Documento (Columna J)
      errors.push(...this.validateTipoDocumento(row.tipoDocumento, rowNumber, columns[9]));
      
      // Validar Número Documento (Columna K)
      errors.push(...this.validateNumeroDocumento(row.numeroDocumento, row.tipoDocumento, rowNumber, columns[10], existingData.numerosDocumento));
      
      // Validar Email (Columna L)
      errors.push(...this.validateEmail(row.email, rowNumber, columns[11], existingData.emails));
      
      // Validar Celular (Columna M)
      errors.push(...this.validateCelular(row.celular, rowNumber, columns[12]));
      
      // Validar Fecha Nacimiento (Columna N)
      errors.push(...this.validateFechaNacimiento(row.fechaNacimiento, rowNumber, columns[13]));
      
      // Validar Fecha Ingreso (Columna O)
      errors.push(...this.validateFechaIngreso(row.fechaIngreso, row.fechaNacimiento, rowNumber, columns[14]));
      
      // Validar Es Usuario (Columna P)
      errors.push(...this.validateEsUsuario(row.esUsuario, rowNumber, columns[15]));
    }

    return errors;
  }

  private static validateCodigoUnidad(codigo: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanCodigo = this.ensureString(codigo);

    if (!cleanCodigo) {
      errors.push({
        row, column: col, field: 'Código Unidad',
        message: 'El código de unidad es requerido',
        value: codigo
      });
    } else {
      if (cleanCodigo.length < 2) {
        errors.push({
          row, column: col, field: 'Código Unidad',
          message: 'El código debe tener al menos 2 caracteres',
          value: codigo
        });
      }
      if (cleanCodigo.length > 20) {
        errors.push({
          row, column: col, field: 'Código Unidad',
          message: 'El código no puede exceder 20 caracteres',
          value: codigo
        });
      }
      if (!/^[A-Z0-9_-]+$/i.test(cleanCodigo)) {
        errors.push({
          row, column: col, field: 'Código Unidad',
          message: 'El código solo puede contener letras, números, guiones y guiones bajos',
          value: codigo
        });
      }
      // ✅ ELIMINADA: Validación de códigos duplicados - El parser se encarga de la unicidad
      // if (codigosDuplicados.has(cleanCodigo.toUpperCase())) {
      //   errors.push({
      //     row, column: col, field: 'Código Unidad',
      //     message: 'Ya existe una unidad con este código en el archivo',
      //     value: codigo
      //   });
      // }
    }

    return errors;
  }

  private static validateNombreUnidad(nombre: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanNombre = this.ensureString(nombre);

    if (!cleanNombre) {
      errors.push({
        row, column: col, field: 'Nombre Unidad',
        message: 'El nombre de la unidad es requerido',
        value: nombre
      });
    } else {
      if (cleanNombre.length < 3) {
        errors.push({
          row, column: col, field: 'Nombre Unidad',
          message: 'El nombre debe tener al menos 3 caracteres',
          value: nombre
        });
      }
      if (cleanNombre.length > 200) {
        errors.push({
          row, column: col, field: 'Nombre Unidad',
          message: 'El nombre no puede exceder 200 caracteres',
          value: nombre
        });
      }
    }

    return errors;
  }

  /**
   * 🔧 NUEVA VALIDACIÓN: Verifica que la unidad padre exista como código de unidad
   * Esta validación asegura la integridad referencial de la estructura jerárquica
   */
  private static validateUnidadPadre(unidadPadre: string, codigoUnidadActual: string, row: number, col: string, existingCodes: Set<string>): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanUnidadPadre = this.ensureString(unidadPadre);

    // Si no hay unidad padre, es válido (puede ser una unidad raíz)
    if (!cleanUnidadPadre || cleanUnidadPadre.trim() === '') {
      return errors;
    }

    // No puede ser padre de sí misma
    if (cleanUnidadPadre === codigoUnidadActual) {
      errors.push({
        row, column: col, field: 'Unidad Padre',
        message: 'Una unidad no puede ser padre de sí misma',
        value: unidadPadre
      });
      return errors;
    }

    // La unidad padre debe existir como código de unidad en el archivo
    const unidadPadreUpper = cleanUnidadPadre.toUpperCase();
    if (!existingCodes.has(unidadPadreUpper)) {
      errors.push({
        row, column: col, field: 'Unidad Padre',
        message: `El código de unidad padre "${cleanUnidadPadre}" no existe en el archivo. Debe existir como "Código Unidad" en alguna fila.`,
        value: unidadPadre
      });
    }

    return errors;
  }

  /**
   * 🔧 NUEVA VALIDACIÓN: Verifica que unidades con el mismo nombre tengan el mismo código
   * Esta validación previene la duplicación lógica de unidades organizacionales
   */
  private static validateNombreUnidadConsistencia(nombreUnidad: string, codigoUnidad: string, row: number, col: string, nombreUnidadToCodigos: Map<string, Set<string>>, nombresConMultiplesCodigos: Set<string>): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanNombre = this.ensureString(nombreUnidad).trim().toLowerCase();
    const cleanCodigo = this.ensureString(codigoUnidad).trim().toUpperCase();

    // Solo validar si ambos campos tienen valor
    if (!cleanNombre || !cleanCodigo) {
      return errors;
    }

    // Verificar si este nombre está en la lista de nombres con múltiples códigos
    if (nombresConMultiplesCodigos.has(cleanNombre)) {
      const codigosExistentes = nombreUnidadToCodigos.get(cleanNombre);
      if (codigosExistentes && codigosExistentes.size > 1) {
        const codigosArray = Array.from(codigosExistentes);
        errors.push({
          row, column: col, field: 'Nombre Unidad',
          message: `La unidad "${nombreUnidad}" aparece con múltiples códigos diferentes: ${codigosArray.join(', ')}. Una unidad debe tener un único código consistente.`,
          value: nombreUnidad
        });
      }
    }

    return errors;
  }

  private static validateTipoUnidad(tipo: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanTipo = this.ensureString(tipo);

    if (!cleanTipo) {
      errors.push({
        row, column: col, field: 'Tipo Unidad',
        message: 'El tipo de unidad es requerido',
        value: tipo
      });
    } else {
      if (cleanTipo.length > 50) {
        errors.push({
          row, column: col, field: 'Tipo Unidad',
          message: 'El tipo de unidad no puede exceder 50 caracteres',
          value: tipo
        });
      }
    }

    return errors;
  }

  private static validatePosicion(posicion: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanPosicion = this.ensureString(posicion);

    if (cleanPosicion.length < 3) {
      errors.push({
        row, column: col, field: 'Posición',
        message: 'El nombre de la posición debe tener al menos 3 caracteres',
        value: posicion
      });
    }
    if (cleanPosicion.length > 150) {
      errors.push({
        row, column: col, field: 'Posición',
        message: 'El nombre de la posición no puede exceder 150 caracteres',
        value: posicion
      });
    }

    return errors;
  }

  private static validateCategoria(categoria: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanCategoria = this.ensureString(categoria);

    if (!cleanCategoria) {
      errors.push({
        row, column: col, field: 'Categoría',
        message: 'La categoría es requerida cuando se define una posición',
        value: categoria
      });
    } else {
      if (cleanCategoria.length > 50) {
        errors.push({
          row, column: col, field: 'Categoría',
          message: 'La categoría no puede exceder 50 caracteres',
          value: categoria
        });
      }
    }

    return errors;
  }

  private static validateNombrePersona(nombre: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanNombre = this.ensureString(nombre);

    if (!cleanNombre) {
      errors.push({
        row, column: col, field: 'Nombre',
        message: 'El nombre es requerido cuando se define una persona',
        value: nombre
      });
    } else {
      if (cleanNombre.length < 2) {
        errors.push({
          row, column: col, field: 'Nombre',
          message: 'El nombre debe tener al menos 2 caracteres',
          value: nombre
        });
      }
      if (cleanNombre.length > 100) {
        errors.push({
          row, column: col, field: 'Nombre',
          message: 'El nombre no puede exceder 100 caracteres',
          value: nombre
        });
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cleanNombre)) {
        errors.push({
          row, column: col, field: 'Nombre',
          message: 'El nombre solo puede contener letras y espacios',
          value: nombre
        });
      }
    }

    return errors;
  }

  private static validateApellidoPaterno(apellido: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanApellido = this.ensureString(apellido);

    if (!cleanApellido) {
      errors.push({
        row, column: col, field: 'Apellido Paterno',
        message: 'El apellido paterno es requerido cuando se define una persona',
        value: apellido
      });
    } else {
      if (cleanApellido.length < 2) {
        errors.push({
          row, column: col, field: 'Apellido Paterno',
          message: 'El apellido paterno debe tener al menos 2 caracteres',
          value: apellido
        });
      }
      if (cleanApellido.length > 100) {
        errors.push({
          row, column: col, field: 'Apellido Paterno',
          message: 'El apellido paterno no puede exceder 100 caracteres',
          value: apellido
        });
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cleanApellido)) {
        errors.push({
          row, column: col, field: 'Apellido Paterno',
          message: 'El apellido paterno solo puede contener letras y espacios',
          value: apellido
        });
      }
    }

    return errors;
  }

  private static validateApellidoMaterno(apellido: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanApellido = this.ensureString(apellido);

    if (cleanApellido) {
      if (cleanApellido.length > 100) {
        errors.push({
          row, column: col, field: 'Apellido Materno',
          message: 'El apellido materno no puede exceder 100 caracteres',
          value: apellido
        });
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cleanApellido)) {
        errors.push({
          row, column: col, field: 'Apellido Materno',
          message: 'El apellido materno solo puede contener letras y espacios',
          value: apellido
        });
      }
    }

    return errors;
  }

  private static validateTipoDocumento(tipoDoc: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanTipoDoc = this.ensureString(tipoDoc).toUpperCase();
    const tiposValidos = ['DNI', 'CE', 'PASAPORTE', 'RUC'];

    if (!cleanTipoDoc) {
      errors.push({
        row, column: col, field: 'Tipo Documento',
        message: 'El tipo de documento es requerido cuando se define una persona',
        value: tipoDoc
      });
    } else if (!tiposValidos.includes(cleanTipoDoc)) {
      errors.push({
        row, column: col, field: 'Tipo Documento',
        message: `Tipo de documento inválido. Valores permitidos: ${tiposValidos.join(', ')}`,
        value: tipoDoc
      });
    }

    return errors;
  }

  private static validateNumeroDocumento(nroDoc: string, tipoDoc: string, row: number, col: string, existingDocs: Set<string>): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanNroDoc = this.ensureString(nroDoc);
    const cleanTipoDoc = this.ensureString(tipoDoc).toUpperCase();

    if (!cleanNroDoc) {
      errors.push({
        row, column: col, field: 'Número Documento',
        message: 'El número de documento es requerido cuando se define una persona',
        value: nroDoc
      });
    } else {
      // Validaciones específicas por tipo de documento
      if (cleanTipoDoc === 'DNI') {
        if (!/^\d{8}$/.test(cleanNroDoc)) {
          errors.push({
            row, column: col, field: 'Número Documento',
            message: 'El DNI debe tener exactamente 8 dígitos',
            value: nroDoc
          });
        }
      } else if (cleanTipoDoc === 'CE') {
        if (!/^[A-Z0-9]{12}$/.test(cleanNroDoc.toUpperCase())) {
          errors.push({
            row, column: col, field: 'Número Documento',
            message: 'El CE debe tener exactamente 12 caracteres alfanuméricos',
            value: nroDoc
          });
        }
      } else if (cleanTipoDoc === 'RUC') {
        if (!/^\d{11}$/.test(cleanNroDoc)) {
          errors.push({
            row, column: col, field: 'Número Documento',
            message: 'El RUC debe tener exactamente 11 dígitos',
            value: nroDoc
          });
        }
      }

      // Verificar duplicados
      if (existingDocs.has(cleanNroDoc)) {
        errors.push({
          row, column: col, field: 'Número Documento',
          message: 'Ya existe una persona con este número de documento en el archivo',
          value: nroDoc
        });
      } else {
        existingDocs.add(cleanNroDoc);
      }
    }

    return errors;
  }

  private static validateEmail(email: string, row: number, col: string, existingEmails: Set<string>): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanEmail = this.ensureString(email).toLowerCase();

    if (!cleanEmail) {
      errors.push({
        row, column: col, field: 'Email',
        message: 'El email personal es requerido cuando se define una persona',
        value: email
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        errors.push({
          row, column: col, field: 'Email',
          message: 'El formato del email no es válido',
          value: email
        });
      } else if (cleanEmail.length > 100) {
        errors.push({
          row, column: col, field: 'Email',
          message: 'El email no puede exceder 100 caracteres',
          value: email
        });
      } else {
        if (existingEmails.has(cleanEmail)) {
          errors.push({
            row, column: col, field: 'Email',
            message: 'Ya existe una persona con este email en el archivo',
            value: email
          });
        } else {
          existingEmails.add(cleanEmail);
        }
      }
    }

    return errors;
  }

  private static validateCelular(celular: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanCelular = this.ensureString(celular);

    if (cleanCelular) {
      if (!/^\d{9}$/.test(cleanCelular)) {
        errors.push({
          row, column: col, field: 'Celular',
          message: 'El celular debe tener exactamente 9 dígitos',
          value: celular
        });
      }
    }

    return errors;
  }

  private static validateFechaNacimiento(fecha: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanFecha = this.ensureString(fecha);

    if (!cleanFecha) {
      errors.push({
        row, column: col, field: 'Fecha Nacimiento',
        message: 'La fecha de nacimiento es requerida cuando se define una persona',
        value: fecha
      });
    } else {
      // Intentar formatear la fecha usando nuestro método mejorado
      const fechaFormateada = this.formatDate(cleanFecha);
      
      if (!fechaFormateada) {
        errors.push({
          row, column: col, field: 'Fecha Nacimiento',
          message: 'Formato de fecha inválido. Use DD/MM/YYYY (ej: 15/03/1975)',
          value: fecha
        });
      } else {
        // Si se pudo formatear, validar rangos lógicos
        const fechaNac = new Date(fechaFormateada);
        const hoy = new Date();
        const hace150Anos = new Date(hoy.getFullYear() - 150, hoy.getMonth(), hoy.getDate());
        const hace18Anos = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());

        if (fechaNac > hoy) {
          errors.push({
            row, column: col, field: 'Fecha Nacimiento',
            message: 'La fecha de nacimiento no puede ser futura',
            value: fecha
          });
        } else if (fechaNac < hace150Anos) {
          errors.push({
            row, column: col, field: 'Fecha Nacimiento',
            message: 'La fecha de nacimiento no puede ser anterior a 150 años',
            value: fecha
          });
        } else if (fechaNac > hace18Anos) {
          errors.push({
            row, column: col, field: 'Fecha Nacimiento',
            message: 'La persona debe tener al menos 18 años de edad',
            value: fecha
          });
        }
      }
    }

    return errors;
  }

  private static validateFechaIngreso(fechaIngreso: string, fechaNacimiento: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanFechaIngreso = this.ensureString(fechaIngreso);

    if (cleanFechaIngreso) {
      const fechaIngresoFormateada = this.formatDate(cleanFechaIngreso);
      
      if (!fechaIngresoFormateada) {
        errors.push({
          row, column: col, field: 'Fecha Ingreso',
          message: 'Formato de fecha inválido. Use DD/MM/YYYY (ej: 15/03/2020)',
          value: fechaIngreso
        });
      } else {
        const fechaIng = new Date(fechaIngresoFormateada);
        const hoy = new Date();
        const hace50Anos = new Date(hoy.getFullYear() - 50, hoy.getMonth(), hoy.getDate());

        if (fechaIng > hoy) {
          errors.push({
            row, column: col, field: 'Fecha Ingreso',
            message: 'La fecha de ingreso no puede ser futura',
            value: fechaIngreso
          });
        } else if (fechaIng < hace50Anos) {
          errors.push({
            row, column: col, field: 'Fecha Ingreso',
            message: 'La fecha de ingreso no puede ser anterior a 50 años',
            value: fechaIngreso
          });
        }

        // Validar que sea posterior a fecha de nacimiento + 18 años (solo si hay fecha de nacimiento válida)
        const cleanFechaNac = this.ensureString(fechaNacimiento);
        if (cleanFechaNac) {
          const fechaNacFormateada = this.formatDate(cleanFechaNac);
          if (fechaNacFormateada) {
            const fechaNac = new Date(fechaNacFormateada);
            const fechaMinima = new Date(fechaNac.getFullYear() + 18, fechaNac.getMonth(), fechaNac.getDate());
            
            if (fechaIng < fechaMinima) {
              errors.push({
                row, column: col, field: 'Fecha Ingreso',
                message: 'La fecha de ingreso debe ser cuando la persona tenga al menos 18 años',
                value: fechaIngreso
              });
            }
          }
        }
      }
    }

    return errors;
  }

  private static validateEsUsuario(esUsuario: string, row: number, col: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const cleanEsUsuario = this.ensureString(esUsuario).toUpperCase();
    const valoresValidos = ['SI', 'NO'];

    if (cleanEsUsuario && !valoresValidos.includes(cleanEsUsuario)) {
      errors.push({
        row, column: col, field: 'Es Usuario',
        message: 'Valor inválido. Use "SI" o "NO"',
        value: esUsuario
      });
    }

    return errors;
  }
}