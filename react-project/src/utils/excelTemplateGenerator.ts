import * as XLSX from 'xlsx';

export interface TemplateRowData {
  // organizacion: string; // ELIMINADO: Se obtiene automáticamente del contexto
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

export class ExcelTemplateGenerator {
  
  static createSampleTemplate(): void {
    // Headers de las columnas (sin "Organización" - se obtiene del contexto)
    const headers = [
      'Código Unidad',
      'Nombre Unidad',
      'Unidad Padre',
      'Tipo Unidad',
      'Posición',
      'Categoría',
      'Nombre',
      'Apellido Paterno',
      'Apellido Materno',
      'Tipo Documento',
      'Número Documento',
      'Email',
      'Celular',
      'Fecha Nacimiento',
      'Fecha Ingreso',
      'Es Usuario' // Nueva columna
    ];

    // Datos de ejemplo basados en el Excel del usuario
    const sampleData: TemplateRowData[] = [
      {
        codigoUnidad: 'DG',
        nombreUnidad: 'Dirección General',
        unidadPadre: '',
        tipoUnidad: 'DIRECCION',
        posicion: 'Director General',
        categoria: 'EJECUTIVO',
        nombre: 'Roberto',
        apellidoPaterno: 'Mendoza',
        apellidoMaterno: 'Silva',
        tipoDocumento: 'DNI',
        numeroDocumento: '15234567',
        email: 'roberto.mendoza@techcorp.com',
        celular: '987123456',
        fechaNacimiento: '12/05/1970',
        fechaIngreso: '1/01/2018',
        esUsuario: 'SI' // Director necesita acceso al sistema
      },
      {
        codigoUnidad: 'GRH',
        nombreUnidad: 'Gerencia de Recursos Humanos',
        unidadPadre: 'DG',
        tipoUnidad: 'GERENCIA',
        posicion: 'Gerente de Recursos Humanos',
        categoria: 'GERENCIAL',
        nombre: 'Ana',
        apellidoPaterno: 'García',
        apellidoMaterno: 'López',
        tipoDocumento: 'DNI',
        numeroDocumento: '25234569',
        email: 'ana.garcia@techcorp.com',
        celular: '987123457',
        fechaNacimiento: '15/08/1978',
        fechaIngreso: '15/01/2018',
        esUsuario: 'SI' // Gerente necesita acceso al sistema
      },
      {
        codigoUnidad: 'GTI',
        nombreUnidad: 'Gerencia de Tecnología e Información',
        unidadPadre: 'DG',
        tipoUnidad: 'GERENCIA',
        posicion: 'Gerente de Tecnología e Información',
        categoria: 'GERENCIAL',
        nombre: 'Carlos',
        apellidoPaterno: 'Rodríguez',
        apellidoMaterno: 'Martín',
        tipoDocumento: 'DNI',
        numeroDocumento: '42534570',
        email: 'carlos.rodriguez@techcorp.com',
        celular: '987123458',
        fechaNacimiento: '1/02/1975',
        fechaIngreso: '1/02/2018',
        esUsuario: 'SI' // Gerente de TI necesita acceso al sistema
      },
      {
        codigoUnidad: 'DSELCON',
        nombreUnidad: 'Departamento de Selección y Contratación',
        unidadPadre: 'GRH',
        tipoUnidad: 'DEPARTAMENTO',
        posicion: 'Jefe de Selección y Contratación',
        categoria: 'JEFATURA',
        nombre: 'Luis',
        apellidoPaterno: 'Sánchez',
        apellidoMaterno: 'Díaz',
        tipoDocumento: 'DNI',
        numeroDocumento: '65234572',
        email: 'luis.sanchez@techcorp.com',
        celular: '987123460',
        fechaNacimiento: '1/04/1982',
        fechaIngreso: '1/04/2018',
        esUsuario: 'NO' // Jefe no requiere acceso al sistema por ahora
      },
      {
        codigoUnidad: 'DDESSOFT',
        nombreUnidad: 'Departamento de Desarrollo de Software',
        unidadPadre: 'GTI',
        tipoUnidad: 'DEPARTAMENTO',
        posicion: 'Jefe de Desarrollo de Software',
        categoria: 'JEFATURA',
        nombre: 'David',
        apellidoPaterno: 'Ramírez',
        apellidoMaterno: 'Medina',
        tipoDocumento: 'DNI',
        numeroDocumento: '95234575',
        email: 'david.ramirez@techcorp.com',
        celular: '987123464',
        fechaNacimiento: '7/07/1977',
        fechaIngreso: '1/03/2018',
        esUsuario: 'SI' // Jefe de desarrollo necesita acceso al sistema
      },
      {
        codigoUnidad: 'AFRONT',
        nombreUnidad: 'Área de Desarrollo Frontend',
        unidadPadre: 'DDESSOFT',
        tipoUnidad: 'AREA',
        posicion: 'Desarrollador Frontend Senior',
        categoria: 'ESPECIALISTA',
        nombre: 'Camila',
        apellidoPaterno: 'Vásquez',
        apellidoMaterno: 'Espinoza',
        tipoDocumento: 'DNI',
        numeroDocumento: '92534585',
        email: 'camila.vasquez@techcorp.com',
        celular: '987123474',
        fechaNacimiento: '3/03/1990',
        fechaIngreso: '1/10/2018',
        esUsuario: 'SI' // Desarrollador necesita acceso al sistema
      },
      {
        codigoUnidad: 'ABACK',
        nombreUnidad: 'Área de Desarrollo Backend',
        unidadPadre: 'DDESSOFT',
        tipoUnidad: 'AREA',
        posicion: 'Desarrollador Backend Senior',
        categoria: 'ESPECIALISTA',
        nombre: 'Mateo',
        apellidoPaterno: 'Silva',
        apellidoMaterno: 'Valdez',
        tipoDocumento: 'DNI',
        numeroDocumento: '25234588',
        email: 'mateo.silva@techcorp.com',
        celular: '987123477',
        fechaNacimiento: '12/04/1989',
        fechaIngreso: '15/11/2018',
        esUsuario: 'SI' // Desarrollador necesita acceso al sistema
      }
    ];

    // Convertir datos a formato de array para XLSX
    const worksheetData = [
      headers,
      ...sampleData.map(row => [
        row.codigoUnidad,
        row.nombreUnidad,
        row.unidadPadre,
        row.tipoUnidad,
        row.posicion,
        row.categoria,
        row.nombre,
        row.apellidoPaterno,
        row.apellidoMaterno,
        row.tipoDocumento,
        row.numeroDocumento,
        row.email,
        row.celular,
        row.fechaNacimiento,
        row.fechaIngreso,
        row.esUsuario // Nueva columna
      ])
    ];

    // Crear workbook y worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Configurar ancho de columnas (agregando nueva columna)
    const columnWidths = [
      { wch: 12 }, // Código Unidad
      { wch: 30 }, // Nombre Unidad
      { wch: 12 }, // Unidad Padre
      { wch: 15 }, // Tipo Unidad
      { wch: 25 }, // Posición
      { wch: 15 }, // Categoría
      { wch: 15 }, // Nombre
      { wch: 18 }, // Apellido Paterno
      { wch: 18 }, // Apellido Materno
      { wch: 15 }, // Tipo Documento
      { wch: 15 }, // Número Documento
      { wch: 25 }, // Email
      { wch: 12 }, // Celular
      { wch: 15 }, // Fecha Nacimiento
      { wch: 15 }, // Fecha Ingreso
      { wch: 10 }  // Es Usuario
    ];

    worksheet['!cols'] = columnWidths;

    // Estilo para los headers
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3B82F6" } },
      alignment: { horizontal: "center", vertical: "center" }
    };

    // Aplicar estilo a los headers (fila 1)
    headers.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = headerStyle;
    });

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estructura Organizacional');

    // Crear y agregar hoja de instrucciones
    const instructionsSheet = this.createInstructionsSheet();
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, '📋 INSTRUCCIONES');

    // Descargar el archivo
    XLSX.writeFile(workbook, 'plantilla_organizacional.xlsx');
  }

  static createEmptyTemplate(): void {
    // Solo headers sin datos de ejemplo (sin "Organización" - se obtiene del contexto)
    const headers = [
      'Código Unidad',
      'Nombre Unidad',
      'Unidad Padre',
      'Tipo Unidad',
      'Posición',
      'Categoría',
      'Nombre',
      'Apellido Paterno',
      'Apellido Materno',
      'Tipo Documento',
      'Número Documento',
      'Email',
      'Celular',
      'Fecha Nacimiento',
      'Fecha Ingreso',
      'Es Usuario' // Nueva columna
    ];

    // Agregar una fila vacía como ejemplo (agregando nueva columna)
    const worksheetData = [
      headers,
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Configurar ancho de columnas (agregando nueva columna)
    const columnWidths = [
      { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 15 },
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 18 },
      { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
    ];

    worksheet['!cols'] = columnWidths;

    // Estilo para los headers
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3B82F6" } },
      alignment: { horizontal: "center", vertical: "center" }
    };

    // Aplicar estilo a los headers
    headers.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = headerStyle;
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estructura Organizacional');

    // Crear y agregar hoja de instrucciones
    const instructionsSheet = this.createInstructionsSheet();
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, '📋 INSTRUCCIONES');

    XLSX.writeFile(workbook, 'plantilla_organizacional_vacia.xlsx');
  }

  static getValidationRules(): { [key: string]: string[] } {
    return {
      tipoUnidad: ['Texto libre (máx. 50 caracteres)', 'Ejemplos: DIRECCION, GERENCIA, AREA, DEPARTAMENTO'],
      categoria: ['Texto libre (máx. 50 caracteres)', 'Ejemplos: GERENCIAL, ESPECIALISTA, ANALISTA, COORDINACION'],
      tipoDocumento: ['DNI', 'CE', 'PASSPORT', 'RUC'],
      esUsuario: ['SI', 'NO'] // Nueva validación para la columna Es Usuario
    };
  }

  private static createInstructionsSheet(): XLSX.WorkSheet {
    const instructionsData = [
      ['📋 INSTRUCCIONES PARA CARGA MASIVA DE ESTRUCTURA ORGANIZACIONAL'],
      [''],
      ['🎯 OBJETIVO:'],
      ['Esta plantilla le permite cargar masivamente la estructura organizacional de su empresa,'],
      ['incluyendo unidades organizacionales, posiciones y asignación de personal.'],
      [''],
      ['📊 ESTRUCTURA DEL ARCHIVO:'],
      ['El archivo debe contener exactamente 16 columnas en el siguiente orden:'],
      [''],
      ['Columna A: Código Unidad', 'REQUERIDO', 'Código único de la unidad (2-20 caracteres)'],
      ['Columna B: Nombre Unidad', 'REQUERIDO', 'Nombre de la unidad (3-200 caracteres)'],
      ['Columna C: Unidad Padre', 'OPCIONAL', 'Código de la unidad padre (si aplica)'],
      ['Columna D: Tipo Unidad', 'REQUERIDO', 'Tipo de unidad (texto libre, máx. 50 caracteres)'],
      ['Columna E: Posición', 'OPCIONAL', 'Nombre del puesto/cargo (3-150 caracteres)'],
      ['Columna F: Categoría', 'CONDICIONAL', 'Categoría del puesto (requerida si hay posición)'],
      ['Columna G: Nombre', 'CONDICIONAL', 'Nombre de la persona (2-100 caracteres)'],
      ['Columna H: Apellido Paterno', 'CONDICIONAL', 'Apellido paterno (requerido si hay persona)'],
      ['Columna I: Apellido Materno', 'OPCIONAL', 'Apellido materno (máx. 100 caracteres)'],
      ['Columna J: Tipo Documento', 'CONDICIONAL', 'DNI, CE, PASAPORTE, RUC'],
      ['Columna K: Número Documento', 'CONDICIONAL', 'Número según tipo de documento'],
      ['Columna L: Email', 'OPCIONAL', 'Correo electrónico válido (máx. 100 caracteres)'],
      ['Columna M: Celular', 'OPCIONAL', 'Número de celular (9 dígitos)'],
      ['Columna N: Fecha Nacimiento', 'OPCIONAL', 'Formato DD/MM/YYYY (ej: 15/03/1975)'],
      ['Columna O: Fecha Ingreso', 'OPCIONAL', 'Formato DD/MM/YYYY (ej: 20/03/2020)'],
      ['Columna P: Es Usuario', 'OPCIONAL', 'SI o NO (si tendrá acceso al sistema)'],
      [''],
      ['✅ VALIDACIONES Y FORMATOS:'],
      [''],
      ['🏢 CÓDIGOS DE UNIDAD:'],
      ['• Solo letras, números, guiones (-) y guiones bajos (_)'],
      ['• Entre 2 y 20 caracteres'],
      ['• Deben ser únicos en todo el archivo'],
      ['• Ejemplos válidos: DG, GRH, GTI, DSELCON'],
      [''],
      ['📋 TIPOS DE UNIDAD:'],
      ['• Texto libre (máximo 50 caracteres)'],
      ['• El sistema creará automáticamente tipos nuevos'],
      ['• Ejemplos: DIRECCION, GERENCIA, AREA, DEPARTAMENTO, SECCION'],
      [''],
      ['💼 CATEGORÍAS DE POSICIÓN:'],
      ['• Texto libre (máximo 50 caracteres)'],
      ['• El sistema creará automáticamente categorías nuevas'],
      ['• Ejemplos: GERENCIAL, ESPECIALISTA, ANALISTA, COORDINACION'],
      [''],
      ['👤 DATOS DE PERSONAS:'],
      ['• Si define una persona, nombre y apellido paterno son obligatorios'],
      ['• Solo letras y espacios en nombres y apellidos'],
      ['• Números de documento únicos en todo el archivo'],
      [''],
      ['📄 TIPOS DE DOCUMENTO:'],
      ['• DNI: Exactamente 8 dígitos (ej: 12345678)'],
      ['• CE: Entre 9 y 12 dígitos (ej: 123456789)'],
      ['• RUC: Exactamente 11 dígitos (ej: 12345678901)'],
      ['• PASAPORTE: Formato libre'],
      [''],
      ['📧 EMAILS:'],
      ['• Formato válido: usuario@dominio.com'],
      ['• Máximo 100 caracteres'],
      ['• Deben ser únicos en todo el archivo'],
      [''],
      ['📱 NÚMEROS DE CELULAR:'],
      ['• Exactamente 9 dígitos'],
      ['• Solo números (ej: 987654321)'],
      [''],
      ['📅 FECHAS:'],
      ['• Formato DD/MM/YYYY obligatorio'],
      ['• Ejemplos válidos: 15/03/1975, 1/1/2000, 29/02/2020'],
      ['• Fecha nacimiento: No puede ser futura ni anterior a 150 años'],
      ['• Fecha ingreso: No puede ser futura ni anterior a 50 años'],
      ['• Fecha ingreso debe ser al menos 14 años después del nacimiento'],
      [''],
      ['🔐 ACCESO AL SISTEMA:'],
      ['• SI: La persona tendrá acceso al sistema'],
      ['• NO: La persona no tendrá acceso al sistema'],
      ['• Valores válidos: SI, NO, si, no, Si, No (no es case sensitive)'],
      [''],
      ['🔄 RELACIONES JERÁRQUICAS:'],
      ['• Use el código de unidad en "Unidad Padre" para crear jerarquías'],
      ['• La unidad padre debe existir en el archivo'],
      ['• Evite relaciones circulares (A→B→A)'],
      ['• Unidades sin padre se consideran unidades raíz'],
      [''],
      ['⚠️ ERRORES COMUNES A EVITAR:'],
      [''],
      ['❌ Códigos de unidad duplicados'],
      ['❌ Números de documento duplicados'],
      ['❌ Emails duplicados'],
      ['❌ Fechas en formato MM/DD/YYYY (usar DD/MM/YYYY)'],
      ['❌ Nombres con números o caracteres especiales'],
      ['❌ DNI con más o menos de 8 dígitos'],
      ['❌ Emails sin @ o con formato incorrecto'],
      ['❌ Fechas futuras en nacimiento o ingreso'],
      ['❌ Referencia a unidades padre que no existen'],
      ['❌ Definir posición sin categoría'],
      ['❌ Definir persona sin nombre o apellido paterno'],
      [''],
      ['💡 CONSEJOS ÚTILES:'],
      [''],
      ['✅ Comience con las unidades más altas en la jerarquía'],
      ['✅ Use códigos cortos y descriptivos para las unidades'],
      ['✅ Mantenga consistencia en los tipos de unidad'],
      ['✅ Revise que todas las referencias de "Unidad Padre" existan'],
      ['✅ Valide fechas antes de cargar el archivo'],
      ['✅ Use la hoja "Estructura Organizacional" como referencia'],
      [''],
      ['🚀 PROCESO DE CARGA:'],
      [''],
      ['1. Complete los datos en la hoja "Estructura Organizacional"'],
      ['2. Guarde el archivo en formato .xlsx'],
      ['3. En el sistema, vaya a Gestión Organizacional'],
      ['4. Haga clic en "Carga Masiva"'],
      ['5. Seleccione su archivo'],
      ['6. El sistema validará automáticamente los datos'],
      ['7. Si hay errores, se mostrarán en pantalla con ubicación exacta'],
      ['8. Corrija los errores y vuelva a intentar'],
      ['9. Una vez validado, confirme la carga'],
      [''],
      ['📞 SOPORTE:'],
      ['Si tiene problemas o dudas, contacte al administrador del sistema.'],
      [''],
      ['⚙️ Versión de plantilla: 2.0 | Fecha: ' + new Date().toLocaleDateString('es-ES')]
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);

    // Configurar anchos de columna
    instructionsSheet['!cols'] = [
      { wch: 60 }, // Columna principal ancha
      { wch: 15 }, // Columna de tipo
      { wch: 40 }  // Columna de descripción
    ];

    // Aplicar estilos
    const titleStyle = {
      font: { bold: true, sz: 16, color: { rgb: '1F2937' } },
      fill: { fgColor: { rgb: 'EBF8FF' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const sectionHeaderStyle = {
      font: { bold: true, sz: 12, color: { rgb: '1E40AF' } },
      fill: { fgColor: { rgb: 'F0F9FF' } }
    };

    const warningStyle = {
      font: { bold: true, color: { rgb: 'DC2626' } },
      fill: { fgColor: { rgb: 'FEF2F2' } }
    };

    const successStyle = {
      font: { bold: true, color: { rgb: '059669' } },
      fill: { fgColor: { rgb: 'F0FDF4' } }
    };

    // Aplicar estilo al título
    if (instructionsSheet['A1']) {
      instructionsSheet['A1'].s = titleStyle;
    }

    // Aplicar estilos a secciones (filas que empiezan con emojis específicos)
    const sectionsToStyle = [
      { pattern: /^🎯/, style: sectionHeaderStyle },
      { pattern: /^📊/, style: sectionHeaderStyle },
      { pattern: /^✅/, style: sectionHeaderStyle },
      { pattern: /^🏢/, style: sectionHeaderStyle },
      { pattern: /^📋/, style: sectionHeaderStyle },
      { pattern: /^💼/, style: sectionHeaderStyle },
      { pattern: /^👤/, style: sectionHeaderStyle },
      { pattern: /^📄/, style: sectionHeaderStyle },
      { pattern: /^📧/, style: sectionHeaderStyle },
      { pattern: /^📱/, style: sectionHeaderStyle },
      { pattern: /^📅/, style: sectionHeaderStyle },
      { pattern: /^🔐/, style: sectionHeaderStyle },
      { pattern: /^🔄/, style: sectionHeaderStyle },
      { pattern: /^⚠️/, style: warningStyle },
      { pattern: /^❌/, style: warningStyle },
      { pattern: /^💡/, style: successStyle },
      { pattern: /^🚀/, style: sectionHeaderStyle },
      { pattern: /^📞/, style: sectionHeaderStyle }
    ];

    // Aplicar estilos según el contenido
    instructionsData.forEach((row, rowIndex) => {
      if (row[0]) {
        const cellContent = String(row[0]);
        const matchedSection = sectionsToStyle.find(section => section.pattern.test(cellContent));
        
        if (matchedSection) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
          if (!instructionsSheet[cellAddress]) instructionsSheet[cellAddress] = {};
          instructionsSheet[cellAddress].s = matchedSection.style;
        }
      }
    });

    return instructionsSheet;
  }
} 