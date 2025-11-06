import * as XLSX from 'xlsx';

// Interfaz para tipos de proceso
export interface TipoProceso {
  tipoProcesoId: number;
  nombre: string;
  descripcion?: string;
}

/**
 * Generador de plantilla Excel para el nuevo modelo jerárquico de Procesos.
 * - Unifica Macroprocesos, Procesos y Subprocesos en una sola tabla jerárquica
 * - Usa relación padre-hijo mediante códigos de proceso
 * - INCLUYE tipos de proceso en lugar de versión
 * - EXCLUYE campos de auditoría (CreadoPor, FechaCreacion, ActualizadoPor, FechaActualizacion, RegistroEliminado)
 */
export class ExcelProcesosTemplateGenerator {
  /** Genera una plantilla con ejemplos y hoja de instrucciones para el modelo jerárquico */
  static generateSampleTemplate(tiposProceso: TipoProceso[] = []): void {
    const workbook = XLSX.utils.book_new();

    // Determinar etiquetas de tipo según los datos recibidos
    // Preferimos coherencia con la lista de INSTRUCCIONES: Macroproceso, Proceso, Subproceso.
    const normalize = (s?: string) => (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const findNombre = (target: string) => tiposProceso.find(tp => normalize(tp.nombre) === normalize(target))?.nombre;

    const tipoNivel1 = findNombre('Macroproceso') || tiposProceso[0]?.nombre || 'Estratégico'; // Nivel 1 (macro)
    const tipoNivel2 = findNombre('Proceso') || tiposProceso[1]?.nombre || tiposProceso[0]?.nombre || 'Operativo';   // Nivel 2 (proceso)
    const tipoNivel3 = findNombre('Subproceso') || tiposProceso[2]?.nombre || tiposProceso[1]?.nombre || tiposProceso[0]?.nombre || 'Soporte';     // Nivel 3 (subproceso)

    // ========================
    // HOJA 1: PROCESOS (MODELO JERÁRQUICO)
    // ========================
    const dataProcesos = [
      // Encabezados
      ['Código Proceso', 'Nombre Proceso', 'Descripción Proceso', 'Tipo Proceso', 'Orden Proceso', 'Código Padre', 'Nivel'],
      // Ejemplos - Nivel 1 (Macroprocesos)
      ['MAC-ADM-001', 'Administración', 'Macroproceso de soporte administrativo', tipoNivel1, 1, '', 1],
      ['MAC-OPS-001', 'Operaciones', 'Macroproceso operacional principal', tipoNivel1, 2, '', 1],
      ['MAC-EST-001', 'Estratégicos', 'Macroproceso de planificación estratégica', tipoNivel1, 3, '', 1],
      // Ejemplos - Nivel 2 (Procesos)
      ['PR-ADM-REG-001', 'Registro de Documentos', 'Registro y archivo de documentos administrativos', tipoNivel2, 1, 'MAC-ADM-001', 2],
      ['PR-ADM-REC-002', 'Recursos Humanos', 'Gestión de recursos humanos', tipoNivel2, 2, 'MAC-ADM-001', 2],
      ['PR-OPS-PROD-001', 'Planificación de Producción', 'Planificación operativa de producción', tipoNivel2, 1, 'MAC-OPS-001', 2],
      ['PR-OPS-CAL-002', 'Control de Calidad', 'Aseguramiento y control de calidad', tipoNivel2, 2, 'MAC-OPS-001', 2],
      ['PR-EST-PLAN-001', 'Planificación Estratégica', 'Desarrollo de planes estratégicos', tipoNivel2, 1, 'MAC-EST-001', 2],
      // Ejemplos - Nivel 3 (Subprocesos)
      ['SP-ADM-REG-001', 'Recepción de Documentos', 'Recepción y verificación de documentos entrantes', tipoNivel3, 1, 'PR-ADM-REG-001', 3],
      ['SP-ADM-REG-002', 'Archivo de Documentos', 'Clasificación y archivo de documentos', tipoNivel3, 2, 'PR-ADM-REG-001', 3],
      ['SP-OPS-PROD-001', 'Programación Semanal', 'Detalle de programación de producción semanal', tipoNivel3, 1, 'PR-OPS-PROD-001', 3],
      ['SP-OPS-CAL-001', 'Inspección de Insumos', 'Inspección y certificación de insumos', tipoNivel3, 1, 'PR-OPS-CAL-002', 3],
      ['SP-EST-PLAN-001', 'Análisis de Mercado', 'Análisis y evaluación del mercado objetivo', tipoNivel3, 1, 'PR-EST-PLAN-001', 3],
    ];

    const sheetProcesos = XLSX.utils.aoa_to_sheet(dataProcesos);
    sheetProcesos['!cols'] = [
      { wch: 18 }, // Código Proceso
      { wch: 30 }, // Nombre Proceso
      { wch: 50 }, // Descripción Proceso
      { wch: 16 }, // Tipo Proceso
      { wch: 14 }, // Orden Proceso
      { wch: 18 }, // Código Padre
      { wch: 8 },  // Nivel
    ];
    XLSX.utils.book_append_sheet(workbook, sheetProcesos, 'PROCESOS');

    // ========================
    // HOJA 2: INSTRUCCIONES
    // ========================
    const tiposProcesoTexto = tiposProceso.length > 0 
      ? tiposProceso.map(tp => `• ${tp.nombre}${tp.descripcion ? ` - ${tp.descripcion}` : ''}`).join('\n')
      : '• Estratégico - Procesos de planificación y dirección\n• Operativo - Procesos principales del negocio\n• Soporte - Procesos de apoyo y administrativos';

    const dataInstr = [
      ['INSTRUCCIONES PARA IMPORTACIÓN DE PROCESOS JERÁRQUICOS'],
      [''],
      ['NUEVO MODELO JERÁRQUICO:'],
      ['Esta plantilla utiliza un modelo unificado donde todos los procesos (macroprocesos,'],
      ['procesos y subprocesos) se manejan en una sola tabla jerárquica.'],
      [''],
      ['ESTRUCTURA DE LA PLANTILLA:'],
      ['1. PROCESOS - Información jerárquica de todos los procesos'],
      ['2. INSTRUCCIONES - Esta hoja con ayuda'],
      [''],
      ['CAMPOS PRINCIPALES:'],
      ['• Código Proceso: Identificador único del proceso (REQUERIDO)'],
      ['• Nombre Proceso: Nombre descriptivo del proceso (REQUERIDO)'],
      ['• Descripción Proceso: Descripción detallada (OPCIONAL)'],
      ['• Tipo Proceso: Tipo de proceso según clasificación organizacional (REQUERIDO)'],
      ['• Orden Proceso: Orden de visualización (OPCIONAL, default: 0)'],
      ['• Código Padre: Código del proceso padre (VACÍO para nivel 1)'],
      ['• Nivel: Nivel jerárquico (1=Macroproceso, 2=Proceso, 3=Subproceso, etc.)'],
      [''],
      ['TIPOS DE PROCESO DISPONIBLES:'],
      ...tiposProcesoTexto.split('\n').map(line => [line]),
      [''],
      ['REGLAS DE JERARQUÍA:'],
      ['• Nivel 1: Procesos raíz (macroprocesos) - NO deben tener Código Padre'],
      ['• Nivel 2+: Procesos hijos - DEBEN tener un Código Padre válido'],
      ['• El Código Padre debe existir en la misma plantilla'],
      ['• Los niveles deben ser consecutivos (no saltar de nivel 1 a nivel 3)'],
      ['• Máximo 10 niveles de jerarquía'],
      [''],
      ['REGLAS DE VALIDACIÓN:'],
      ['• Los códigos deben ser únicos'],
      ['• Los nombres deben tener entre 3 y 100 caracteres'],
      ['• El nivel debe estar entre 1 y 10'],
      ['• El tipo de proceso debe ser uno de los disponibles'],
      ['• No se permiten referencias circulares'],
      [''],
      ['CAMPOS EXCLUIDOS (MANEJADOS POR EL SISTEMA):'],
      ['• ProcesoId (generado automáticamente)'],
      ['• PadreId (calculado desde Código Padre)'],
      ['• OrganizacionId (tomado del contexto)'],
      ['• TipoProcesoId (calculado desde Tipo Proceso)'],
      ['• EstadoId (asignado por defecto)'],
      ['• RutaJerarquica (calculada automáticamente)'],
      ['• Campos de auditoría (CreadoPor, FechaCreacion, etc.)'],
      [''],
      ['EJEMPLOS DE JERARQUÍA:'],
      [`Nivel 1: MAC-ADM-001 (Administración) - Sin padre - Tipo: ${tipoNivel1}`],
      [`  Nivel 2: PR-ADM-REG-001 (Registro de Documentos) - Padre: MAC-ADM-001 - Tipo: ${tipoNivel2}`],
      [`    Nivel 3: SP-ADM-REG-001 (Recepción de Documentos) - Padre: PR-ADM-REG-001 - Tipo: ${tipoNivel3}`],
      [''],
      ['CONSEJOS:'],
      ['• Use códigos descriptivos y consistentes'],
      ['• Mantenga una nomenclatura clara (MAC- para macroprocesos, PR- para procesos, SP- para subprocesos)'],
      ['• Verifique que todos los códigos padre existan antes de importar'],
      ['• Los procesos se crearán en orden jerárquico automáticamente'],
      ['• Use solo los tipos de proceso listados arriba'],
      ['• El orden es un número entero para ordenar visualmente'],
      [''],
      ['EJEMPLOS:'],
      [`MACROPROCESO: MAC-OPS-001 | Operaciones | Macroproceso operacional principal | ${tipoNivel1} | 2`],
      [`PROCESO: PR-OPS-PROD-001 | Planificación de Producción | ... | ${tipoNivel2} | 1 | MAC-OPS-001`],
      [`SUBPROCESO: SP-OPS-PROD-001 | Programación Semanal | ... | ${tipoNivel3} | 1 | PR-OPS-PROD-001`],
      [''],
      ['NOTA: Use SIEMPRE el CÓDIGO del padre para relacionar. Los IDs son internos al sistema.'],
    ];

    const sheetInstr = XLSX.utils.aoa_to_sheet(dataInstr);
    sheetInstr['!cols'] = [{ wch: 80 }]; // Ancho para instrucciones
    XLSX.utils.book_append_sheet(workbook, sheetInstr, 'INSTRUCCIONES');

    // Descargar archivo
    XLSX.writeFile(workbook, 'Plantilla_Procesos_Jerarquicos.xlsx');
  }

  /** Genera una plantilla vacía solo con encabezados */
  static generateEmptyTemplate(tiposProceso: TipoProceso[] = []): void {
    const workbook = XLSX.utils.book_new();

    // Hoja de procesos vacía
    const dataProcesos = [
      ['Código Proceso', 'Nombre Proceso', 'Descripción Proceso', 'Tipo Proceso', 'Orden Proceso', 'Código Padre', 'Nivel'],
    ];
    
    const sheetProcesos = XLSX.utils.aoa_to_sheet(dataProcesos);
    sheetProcesos['!cols'] = [
      { wch: 18 }, // Código Proceso
      { wch: 30 }, // Nombre Proceso
      { wch: 50 }, // Descripción Proceso
      { wch: 16 }, // Tipo Proceso
      { wch: 14 }, // Orden Proceso
      { wch: 18 }, // Código Padre
      { wch: 8 },  // Nivel
    ];
    XLSX.utils.book_append_sheet(workbook, sheetProcesos, 'PROCESOS');

    // Hoja de instrucciones con tipos de proceso
    const tiposProcesoTexto = tiposProceso.length > 0 
      ? tiposProceso.map(tp => `• ${tp.nombre}${tp.descripcion ? ` - ${tp.descripcion}` : ''}`).join('\n')
      : '• Estratégico - Procesos de planificación y dirección\n• Operativo - Procesos principales del negocio\n• Soporte - Procesos de apoyo y administrativos';

    const dataInstr = [
      ['INSTRUCCIONES PARA IMPORTACIÓN DE PROCESOS JERÁRQUICOS'],
      [''],
      ['Ver plantilla con ejemplos para más detalles sobre el uso.'],
      [''],
      ['CAMPOS REQUERIDOS:'],
      ['• Código Proceso'],
      ['• Nombre Proceso'],
      ['• Tipo Proceso'],
      ['• Nivel (1-10)'],
      [''],
      ['CAMPOS OPCIONALES:'],
      ['• Descripción Proceso'],
      ['• Orden Proceso'],
      ['• Código Padre (requerido para niveles > 1)'],
      [''],
      ['TIPOS DE PROCESO DISPONIBLES:'],
      ...tiposProcesoTexto.split('\n').map(line => [line]),
    ];
    
    const sheetInstr = XLSX.utils.aoa_to_sheet(dataInstr);
    sheetInstr['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, sheetInstr, 'INSTRUCCIONES');

    // Descargar archivo
    XLSX.writeFile(workbook, 'Plantilla_Procesos_Jerarquicos_Vacia.xlsx');
  }
}