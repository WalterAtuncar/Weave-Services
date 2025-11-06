import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { toPng, toJpeg, toSvg } from 'html-to-image';

// Interfaces para tipos de exportación
export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'excel';
  quality?: number;
  scale?: number;
  paperSize?: 'a4' | 'a3' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  includeBackground?: boolean;
  fileName?: string;
}

export interface OrganizationalData {
  organizacion: any;
  unidades: any[];
  posiciones: any[];
  personas: any[];
  personaPosiciones: any[];
}

// Configuraciones por defecto
const DEFAULT_OPTIONS: Partial<ExportOptions> = {
  quality: 1.0,
  scale: 2,
  paperSize: 'a4',
  orientation: 'landscape',
  includeBackground: true,
  fileName: 'organigrama'
};

/**
 * Preparar elemento para exportación optimizando el texto
 */
const prepareElementForExport = async (element: HTMLElement): Promise<void> => {
  // Forzar el renderizado de todos los elementos
  element.style.transform = 'translateZ(0)';
  
  // Asegurar que todas las fuentes estén cargadas
  await document.fonts.ready;
  
  // OCULTAR ELEMENTOS QUE NO DEBEN APARECER EN LA EXPORTACIÓN
  const elementsToHide = [
    // Paneles y overlays
    '.exportOverlay',
    '.exportPanel',
    '.navigationPanel',
    '.modalOverlay',
    '.modal',
    '.searchResults',
    '.searchResultItem',
    
    // Header y controles
    '.orgChartHeader',
    '.panIndicator',
    '.panControls',
    '.panControl',
    '.zoomControls',
    '.zoomControl',
    '.zoomIndicator',
    '.panModeToggle',
    '.fitToScreenButton',
    '.resetButton',
    
    // Botones y acciones
    '.unitCardActions',
    '.positionCardActions',
    '.createUnitButton',
    '.createFirstUnitButton',
    '.assignButton',
    '.unitActionButton',
    '.positionActionButton',
    '.closeButton',
    
    // Estados especiales
    '.emptyState',
    '.errorContainer',
    '.loadingContainer',
    '.loadingOverlay',
    
    // Elementos de navegación
    '.navigationButton',
    '.searchContainer',
    '.searchInput',
    '.filterContainer',
    '.filterButton',
    '.toggleButton',
    '.modeToggle',
    
    // Elementos de interfaz
    '.tooltip',
    '.dropdown',
    '.dropdownMenu',
    '.contextMenu',
    '.actionMenu',
    '.floatingButton',
    '.floatingAction',
    
    // Elementos específicos que pueden aparecer como cards grises
    'button[title*="Clic para"]',
    'button[title*="Agregar"]',
    'button[title*="Eliminar"]',
    'button[title*="Asignar"]',
    'button[title*="Editar"]',
    'div[style*="cursor: pointer"]',
    '.clickable',
    '.interactive',
    '.overlay',
    '.backdrop'
  ];
  
  const hiddenElements: HTMLElement[] = [];
  
  // Ocultar elementos problemáticos
  elementsToHide.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style.display !== 'none') {
        hiddenElements.push(htmlEl);
        htmlEl.style.display = 'none';
        htmlEl.setAttribute('data-hidden-for-export', 'true');
      }
    });
  });
  
  // Guardar referencia para restaurar después
  (element as any).__hiddenElements = hiddenElements;
  
  // Aplicar estilos temporales para mejorar la exportación
  const positionCards = element.querySelectorAll('.positionCard');
  positionCards.forEach((card: Element) => {
    const htmlCard = card as HTMLElement;
    htmlCard.style.minWidth = '250px';
    htmlCard.style.width = '250px';
    htmlCard.style.minHeight = '105px';
    htmlCard.style.boxSizing = 'border-box';
  });
  
  // Asegurar que los títulos se muestren correctamente
  const titles = element.querySelectorAll('.positionCardTitle h4');
  titles.forEach((title: Element) => {
    const htmlTitle = title as HTMLElement;
    htmlTitle.style.whiteSpace = 'normal';
    htmlTitle.style.wordWrap = 'break-word';
    htmlTitle.style.overflowWrap = 'break-word';
    htmlTitle.style.lineHeight = '1.6';
    htmlTitle.style.fontSize = '0.8rem';
    htmlTitle.style.maxWidth = '100%';
    htmlTitle.style.display = 'block';
    htmlTitle.style.letterSpacing = '0.02em';
    htmlTitle.style.wordSpacing = '0.1em';
  });
  
  // Asegurar que el contenido de las tarjetas tenga suficiente padding
  const cardContents = element.querySelectorAll('.positionCardContent');
  cardContents.forEach((content: Element) => {
    const htmlContent = content as HTMLElement;
    htmlContent.style.padding = '1rem';
    htmlContent.style.boxSizing = 'border-box';
  });
  
  // Mejorar el espaciado de los títulos
  const titleContainers = element.querySelectorAll('.positionCardTitle');
  titleContainers.forEach((container: Element) => {
    const htmlContainer = container as HTMLElement;
    htmlContainer.style.marginBottom = '0.375rem';
    htmlContainer.style.minHeight = '2rem';
  });
  
  // Forzar reflow para asegurar que el texto se renderice correctamente
  element.offsetHeight;
  
  // Forzar que elementos del organigrama sean visibles para la captura
  const orgChartElements = element.querySelectorAll('.unitCard, .positionCard, .hierarchyContainer');
  orgChartElements.forEach((card: Element) => {
    const htmlCard = card as HTMLElement;
    // Asegurar visibilidad para la exportación
    htmlCard.style.setProperty('display', 'flex', 'important');
    htmlCard.style.setProperty('visibility', 'visible', 'important');
    htmlCard.style.setProperty('opacity', '1', 'important');
  });

  // Esperar un momento adicional para que todo se renderice
  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Restaurar elemento después de la exportación
 */
const restoreElementAfterExport = async (element: HTMLElement): Promise<void> => {
  if (!element) return;
  
  // Remover estilos temporales
  element.style.transform = '';
  
  // RESTAURAR ELEMENTOS QUE FUERON OCULTADOS
  const hiddenElements = (element as any).__hiddenElements as HTMLElement[];
  if (hiddenElements && hiddenElements.length > 0) {
    hiddenElements.forEach(htmlEl => {
      htmlEl.style.display = '';
      htmlEl.removeAttribute('data-hidden-for-export');
    });
  }
  
  // Limpiar referencia
  delete (element as any).__hiddenElements;
  
  // También restaurar elementos por selector (por si algunos se perdieron)
  const elementsToRestore = document.querySelectorAll('[data-hidden-for-export="true"]');
  elementsToRestore.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = '';
    htmlEl.removeAttribute('data-hidden-for-export');
  });
  
  // Restaurar estilos originales de las tarjetas
  const positionCards = element.querySelectorAll('.positionCard');
  positionCards.forEach((card: Element) => {
    const htmlCard = card as HTMLElement;
    htmlCard.style.minWidth = '';
    htmlCard.style.width = '';
    htmlCard.style.minHeight = '';
    htmlCard.style.boxSizing = '';
  });
  
  // Restaurar estilos originales de los títulos
  const titles = element.querySelectorAll('.positionCardTitle h4');
  titles.forEach((title: Element) => {
    const htmlTitle = title as HTMLElement;
    htmlTitle.style.whiteSpace = '';
    htmlTitle.style.wordWrap = '';
    htmlTitle.style.overflowWrap = '';
    htmlTitle.style.lineHeight = '';
    htmlTitle.style.fontSize = '';
    htmlTitle.style.maxWidth = '';
    htmlTitle.style.display = '';
    htmlTitle.style.letterSpacing = '';
    htmlTitle.style.wordSpacing = '';
  });
  
  // Restaurar estilos originales del contenido
  const cardContents = element.querySelectorAll('.positionCardContent');
  cardContents.forEach((content: Element) => {
    const htmlContent = content as HTMLElement;
    htmlContent.style.padding = '';
    htmlContent.style.boxSizing = '';
  });
  
  // Restaurar estilos originales de los contenedores de título
  const titleContainers = element.querySelectorAll('.positionCardTitle');
  titleContainers.forEach((container: Element) => {
    const htmlContainer = container as HTMLElement;
    htmlContainer.style.marginBottom = '';
    htmlContainer.style.minHeight = '';
  });

  // Restaurar estilos de visibilidad forzados
  const orgChartElements = element.querySelectorAll('.unitCard, .positionCard, .hierarchyContainer');
  orgChartElements.forEach((card: Element) => {
    const htmlCard = card as HTMLElement;
    htmlCard.style.removeProperty('display');
    htmlCard.style.removeProperty('visibility');
    htmlCard.style.removeProperty('opacity');
  });
};

/**
 * Exportar organigrama como imagen PNG/JPG
 */
export const exportAsImage = async (options: ExportOptions, reactFlowInstance?: any): Promise<void> => {
  try {
    // Detectar automáticamente qué vista está activa
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    
    // Si React Flow está activo, usar la función específica
    if (reactFlowElement && reactFlowElement.offsetHeight > 0 && reactFlowElement.offsetWidth > 0) {
      return await exportReactFlowAsImage(options, reactFlowInstance);
    }
    
    // Fallback a vista clásica
    const classicElement = document.querySelector('.orgChartInner') as HTMLElement;
    if (!classicElement || !classicElement.offsetHeight || !classicElement.offsetWidth) {
      throw new Error('No se encontró el elemento del organigrama. Asegúrese de que el organigrama esté visible.');
    }
    const element = classicElement;

    // Verificar si el elemento es válido y tiene contenido
    if (!element.offsetHeight || !element.offsetWidth) {
      console.warn('Elemento del organigrama no visible, intentando forzar visibilidad');
      element.style.display = 'block';
      element.style.visibility = 'visible';
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Preparar el elemento para exportación
    await prepareElementForExport(element);

    // Configurar html2canvas con opciones optimizadas para texto
    let canvas;
    try {
      canvas = await html2canvas(element, {
        scale: mergedOptions.scale || 3, // Escala alta para mejor calidad de texto
        backgroundColor: mergedOptions.includeBackground ? '#ffffff' : null,
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        ignoreElements: (element) => {
          // Lista completa de elementos a ignorar
          const classesToIgnore = [
            'exportOverlay', 'exportPanel', 'navigationPanel', 'modal', 'modalOverlay',
            'searchResults', 'searchResultItem', 'orgChartHeader', 'panIndicator', 
            'panControls', 'panControl', 'zoomControls', 'zoomControl', 'zoomIndicator',
            'panModeToggle', 'fitToScreenButton', 'resetButton', 'unitCardActions',
            'positionCardActions', 'createUnitButton', 'createFirstUnitButton',
            'assignButton', 'unitActionButton', 'positionActionButton', 'closeButton',
            'emptyState', 'errorContainer', 'loadingContainer', 'loadingOverlay',
            'navigationButton', 'searchContainer', 'searchInput', 'filterContainer',
            'filterButton', 'toggleButton', 'modeToggle', 'tooltip', 'dropdown',
            'dropdownMenu', 'contextMenu', 'actionMenu', 'floatingButton', 'floatingAction',
            'clickable', 'interactive', 'overlay', 'backdrop'
          ];
          
          // Verificar si el elemento tiene alguna de las clases a ignorar
          if (classesToIgnore.some(cls => element.classList.contains(cls))) {
            return true;
          }
          
          // Verificar si fue marcado para ocultar
          if (element.getAttribute('data-hidden-for-export') === 'true') {
            return true;
          }
          
          // Verificar si es un botón con títulos específicos
          if (element.tagName === 'BUTTON') {
            const title = element.getAttribute('title') || '';
            if (title.includes('Clic para') || title.includes('Agregar') || 
                title.includes('Eliminar') || title.includes('Asignar') || 
                title.includes('Editar')) {
              return true;
            }
          }
          
          // Verificar si tiene cursor pointer (elementos interactivos)
          if ((element as HTMLElement).style.cursor === 'pointer' && !element.classList.contains('unitCard') && 
              !element.classList.contains('positionCard')) {
            return true;
          }
          
          return false;
        }
      });
    } catch (canvasError) {
      console.warn('Error con configuración avanzada, intentando configuración simple:', canvasError);
      // Fallback con configuración más simple
      canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 10000
      });
    }

    // Restaurar el elemento después de la exportación
    await restoreElementAfterExport(element);

    // Convertir a blob y descargar
    canvas.toBlob((blob) => {
      if (blob) {
        const fileName = `${mergedOptions.fileName}.${options.format}`;
        saveAs(blob, fileName);
      }
    }, `image/${options.format}`, mergedOptions.quality);

  } catch (error) {
    console.error('Error al exportar imagen:', error);
    // Intentar restaurar el elemento incluso si falla
    try {
      await restoreElementAfterExport(document.querySelector('.orgChartInner') as HTMLElement);
    } catch (restoreError) {
      console.error('Error al restaurar elemento:', restoreError);
    }
    
    // Dar un mensaje de error más específico basado en el tipo de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`Error al exportar la imagen: ${errorMessage}. Por favor, intenta nuevamente.`);
  }
};

/**
 * Exportar organigrama como PDF
 */
export const exportAsPDF = async (options: ExportOptions, reactFlowInstance?: any): Promise<void> => {
  try {
    // Detectar automáticamente qué vista está activa
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    
    // Si React Flow está activo, usar la función específica
    if (reactFlowElement && reactFlowElement.offsetHeight > 0 && reactFlowElement.offsetWidth > 0) {
      return await exportReactFlowAsPDF(options, reactFlowInstance);
    }
    
    // Fallback a vista clásica
    const classicElement = document.querySelector('.orgChartInner') as HTMLElement;
    if (!classicElement || !classicElement.offsetHeight || !classicElement.offsetWidth) {
      throw new Error('No se encontró el elemento del organigrama. Asegúrese de que el organigrama esté visible.');
    }
    const element = classicElement;

    // Verificar si el elemento es válido y tiene contenido
    if (!element.offsetHeight || !element.offsetWidth) {
      console.warn('Elemento del organigrama no visible, intentando forzar visibilidad');
      element.style.display = 'block';
      element.style.visibility = 'visible';
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Preparar el elemento para exportación
    await prepareElementForExport(element);

    // Capturar imagen con alta calidad
    let canvas;
    try {
      canvas = await html2canvas(element, {
        scale: 3, // Alta resolución para PDF
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        ignoreElements: (element) => {
          // Lista completa de elementos a ignorar
          const classesToIgnore = [
            'exportOverlay', 'exportPanel', 'navigationPanel', 'modal', 'modalOverlay',
            'searchResults', 'searchResultItem', 'orgChartHeader', 'panIndicator', 
            'panControls', 'panControl', 'zoomControls', 'zoomControl', 'zoomIndicator',
            'panModeToggle', 'fitToScreenButton', 'resetButton', 'unitCardActions',
            'positionCardActions', 'createUnitButton', 'createFirstUnitButton',
            'assignButton', 'unitActionButton', 'positionActionButton', 'closeButton',
            'emptyState', 'errorContainer', 'loadingContainer', 'loadingOverlay',
            'navigationButton', 'searchContainer', 'searchInput', 'filterContainer',
            'filterButton', 'toggleButton', 'modeToggle', 'tooltip', 'dropdown',
            'dropdownMenu', 'contextMenu', 'actionMenu', 'floatingButton', 'floatingAction',
            'clickable', 'interactive', 'overlay', 'backdrop'
          ];
          
          // Verificar si el elemento tiene alguna de las clases a ignorar
          if (classesToIgnore.some(cls => element.classList.contains(cls))) {
            return true;
          }
          
          // Verificar si fue marcado para ocultar
          if (element.getAttribute('data-hidden-for-export') === 'true') {
            return true;
          }
          
          // Verificar si es un botón con títulos específicos
          if (element.tagName === 'BUTTON') {
            const title = element.getAttribute('title') || '';
            if (title.includes('Clic para') || title.includes('Agregar') || 
                title.includes('Eliminar') || title.includes('Asignar') || 
                title.includes('Editar')) {
              return true;
            }
          }
          
          // Verificar si tiene cursor pointer (elementos interactivos)
          if ((element as HTMLElement).style.cursor === 'pointer' && !element.classList.contains('unitCard') && 
              !element.classList.contains('positionCard')) {
            return true;
          }
          
          return false;
        }
      });
    } catch (canvasError) {
      console.warn('Error con configuración avanzada para PDF, intentando configuración simple:', canvasError);
      // Fallback con configuración más simple
      canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 10000
      });
    }

    // Restaurar el elemento después de la captura
    await restoreElementAfterExport(element);

    // Configuraciones de página según el tamaño
    const pageConfigs = {
      a4: { width: 210, height: 297 },
      a3: { width: 297, height: 420 },
      letter: { width: 216, height: 279 },
      legal: { width: 216, height: 356 }
    };

    const pageConfig = pageConfigs[mergedOptions.paperSize!];
    const isLandscape = mergedOptions.orientation === 'landscape';
    
    const pageWidth = isLandscape ? pageConfig.height : pageConfig.width;
    const pageHeight = isLandscape ? pageConfig.width : pageConfig.height;

    // Crear PDF
    const pdf = new jsPDF({
      orientation: mergedOptions.orientation!,
      unit: 'mm',
      format: mergedOptions.paperSize!,
      compress: true
    });

    // Calcular dimensiones para ajustar al PDF
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    let pdfWidth = pageWidth - 20; // Margen de 10mm cada lado
    let pdfHeight = pdfWidth / ratio;

    // Si la altura excede la página, ajustar por altura
    if (pdfHeight > pageHeight - 20) {
      pdfHeight = pageHeight - 20;
      pdfWidth = pdfHeight * ratio;
    }

    // Calcular posición centrada
    const x = (pageWidth - pdfWidth) / 2;
    const y = (pageHeight - pdfHeight) / 2;

    // Si el contenido es muy grande, dividir en múltiples páginas
    if (pdfHeight > pageHeight - 20) {
      const pagesNeeded = Math.ceil(imgHeight / (imgWidth / pdfWidth * (pageHeight - 20)));
      
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) pdf.addPage();
        
        const sourceY = i * (imgHeight / pagesNeeded);
        const sourceHeight = imgHeight / pagesNeeded;
        
        // Crear canvas temporal para la sección
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgWidth;
        tempCanvas.height = sourceHeight;
        
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx?.drawImage(canvas, 0, -sourceY);
        
        const tempImageData = tempCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(tempImageData, 'JPEG', x, 10, pdfWidth, pageHeight - 20);
      }
    } else {
      // Una sola página
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imageData, 'JPEG', x, y, pdfWidth, pdfHeight);
    }

    // Agregar metadatos
    pdf.setProperties({
      title: 'Organigrama Empresarial',
      subject: 'Estructura Organizacional',
      author: 'Sistema de Gestión',
      creator: 'Constructor de Organigrama'
    });

    // Descargar PDF
    const fileName = `${mergedOptions.fileName}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error al exportar PDF:', error);
    // Intentar restaurar el elemento incluso si falla
    try {
      await restoreElementAfterExport(document.querySelector('.orgChartInner') as HTMLElement);
    } catch (restoreError) {
      console.error('Error al restaurar elemento:', restoreError);
    }
    
    // Dar un mensaje de error más específico basado en el tipo de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`Error al exportar PDF: ${errorMessage}. Por favor, intenta nuevamente.`);
  }
};



/**
 * Exportar reporte en Excel
 */
export const exportAsExcel = async (data: OrganizationalData, options: ExportOptions): Promise<void> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { organizacion, unidades, posiciones, personas, personaPosiciones } = data;

    // Validación defensiva para evitar errores con datos undefined
    const safePersonaPosiciones = personaPosiciones || [];

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();

         // Ajustar fecha para Perú (UTC-5)
     const peruDate = new Date();
     peruDate.setHours(peruDate.getHours() - 5);
     
     // Hoja 1: Resumen ejecutivo
     const resumenData = [
       ['REPORTE ORGANIZACIONAL'],
       ['Organización:', organizacion.razonSocial],
       ['Fecha de generación:', peruDate.toLocaleDateString('es-ES')],
      [''],
      ['RESUMEN'],
      ['Total de unidades:', unidades.length],
      ['Total de posiciones:', posiciones.length],
      ['Total de personas:', personas.length],
      ['Posiciones ocupadas:', safePersonaPosiciones.length],
      ['Posiciones vacantes:', posiciones.length - safePersonaPosiciones.length],
      ['% de ocupación:', `${posiciones.length > 0 ? ((safePersonaPosiciones.length / posiciones.length) * 100).toFixed(1) : '0'}%`]
    ];

    const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

    // Hoja 2: Estructura organizacional
    const estructuraData = [
      ['ID Unidad', 'Nombre Unidad', 'Tipo', 'Unidad Padre', 'Objetivo', 'Estado']
    ];

    unidades.forEach(unidad => {
      const unidadPadre = unidad.unidadPadreId ? 
        unidades.find(u => u.unidadesOrgId === unidad.unidadPadreId)?.nombre : 
        'Raíz';
      
      estructuraData.push([
        unidad.unidadesOrgId,
        unidad.nombre,
        unidad.tipoUnidad,
        unidadPadre,
        unidad.objetivo || '',
        unidad.estado
      ]);
    });

    const estructuraSheet = XLSX.utils.aoa_to_sheet(estructuraData);
    XLSX.utils.book_append_sheet(workbook, estructuraSheet, 'Estructura');

    // Hoja 3: Posiciones y asignaciones
    const posicionesData = [
      ['ID Posición', 'Nombre Posición', 'Categoría', 'Unidad', 'Persona Asignada', 'Documento', 'Estado']
    ];

    posiciones.forEach(posicion => {
      const unidad = unidades.find(u => u.unidadesOrgId === posicion.unidadesOrgId);
      const assignment = safePersonaPosiciones.find(pp => pp.posicionId === posicion.posicionId);
      const persona = assignment ? personas.find(p => p.personaId === assignment.personaId) : null;
      
      posicionesData.push([
        String(posicion.posicionId),
        posicion.nombre,
        posicion.categoria,
        unidad?.nombre || 'Sin unidad',
        persona ? `${persona.nombres} ${persona.apellidoPaterno}` : 'VACANTE',
        persona?.nroDoc ? String(persona.nroDoc) : '',
        posicion.estado
      ]);
    });

    const posicionesSheet = XLSX.utils.aoa_to_sheet(posicionesData);
    XLSX.utils.book_append_sheet(workbook, posicionesSheet, 'Posiciones');

    // Hoja 4: Directorio de personas
    const personasData = [
      ['ID', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Documento', 'Posición Actual', 'Unidad', 'Estado']
    ];

    personas.forEach(persona => {
      const assignment = safePersonaPosiciones.find(pp => pp.personaId === persona.personaId);
      const posicion = assignment ? posiciones.find(p => p.posicionId === assignment.posicionId) : null;
      const unidad = posicion ? unidades.find(u => u.unidadesOrgId === posicion.unidadesOrgId) : null;
      
      personasData.push([
        String(persona.personaId),
        persona.nombres,
        persona.apellidoPaterno,
        persona.apellidoMaterno || '',
        String(persona.nroDoc || ''),
        posicion?.nombre || 'Sin asignación',
        unidad?.nombre || '',
        persona.estado
      ]);
    });

    const personasSheet = XLSX.utils.aoa_to_sheet(personasData);
    XLSX.utils.book_append_sheet(workbook, personasSheet, 'Directorio');

    // Hoja 5: Análisis por niveles
    const nivelesData = [['Nivel', 'Unidades', 'Posiciones', 'Personas Asignadas', '% Ocupación']];
    
    const getUnitLevel = (unitId: number): number => {
      const unit = unidades.find(u => u.unidadesOrgId === unitId);
      if (!unit || !unit.unidadPadreId) return 0;
      return 1 + getUnitLevel(unit.unidadPadreId);
    };

    const levelStats: Record<number, { units: number; positions: number; people: number }> = {};
    
    unidades.forEach(unidad => {
      const level = getUnitLevel(unidad.unidadesOrgId);
      if (!levelStats[level]) {
        levelStats[level] = { units: 0, positions: 0, people: 0 };
      }
      levelStats[level].units++;
      
      const unitPositions = posiciones.filter(p => p.unidadesOrgId === unidad.unidadesOrgId);
      levelStats[level].positions += unitPositions.length;
      
      unitPositions.forEach(pos => {
        const hasAssignment = safePersonaPosiciones.some(pp => pp.posicionId === pos.posicionId);
        if (hasAssignment) levelStats[level].people++;
      });
    });

    Object.entries(levelStats).forEach(([level, stats]) => {
      const ocupacion = stats.positions > 0 ? (stats.people / stats.positions * 100).toFixed(1) : '0';
      nivelesData.push([
        `Nivel ${level}`,
        String(stats.units),
        String(stats.positions),
        String(stats.people),
        `${ocupacion}%`
      ]);
    });

    const nivelesSheet = XLSX.utils.aoa_to_sheet(nivelesData);
    XLSX.utils.book_append_sheet(workbook, nivelesSheet, 'Análisis por Niveles');

    // Generar y descargar archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `${mergedOptions.fileName}_reporte.xlsx`;
    saveAs(blob, fileName);

  } catch (error) {
    console.error('Error al exportar Excel:', error);
    throw new Error('Error al generar el reporte Excel. Por favor, intenta nuevamente.');
  }
};







/**
 * Exportar React Flow como imagen usando html-to-image
 */
export const exportReactFlowAsImage = async (options: ExportOptions, reactFlowInstance?: any): Promise<void> => {
  try {
    // Buscar el elemento React Flow
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!reactFlowElement) {
      throw new Error('No se encontró el elemento React Flow. Asegúrese de que la vista React Flow esté activa.');
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Si tenemos la instancia de React Flow, ajustar la vista para mostrar todo
      if (reactFlowInstance) {
        // Guardar viewport actual
        const currentViewport = reactFlowInstance.getViewport();
        
        // Guardar el viewport actual para restaurarlo después
        const originalViewport = reactFlowInstance.getViewport();
        
        // Resetear el viewport a escala 1:1 y posición (0,0) para cálculos precisos
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
        
        // Esperar un momento para que se aplique el cambio
        await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        // Estrategia simplificada: usar coordenadas originales de nodos (zoom 1:1)
        const nodes = reactFlowInstance.getNodes();
        
        // Si no hay nodos, usar dimensiones por defecto
        if (nodes.length === 0) {
          var exportWidth = 800;
          var exportHeight = 600;
        } else {
          // Calcular el bounding box usando coordenadas originales de los nodos
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          
          nodes.forEach((node: any) => {
            const nodeX = node.position.x;
            const nodeY = node.position.y;
            const nodeWidth = node.width || 200;
            const nodeHeight = node.height || 100;
            
            minX = Math.min(minX, nodeX);
            minY = Math.min(minY, nodeY);
            maxX = Math.max(maxX, nodeX + nodeWidth);
            maxY = Math.max(maxY, nodeY + nodeHeight);
          });
          
          // Agregar padding generoso y asegurar dimensiones mínimas
          const padding = 100;
          var exportWidth = Math.max(800, maxX - minX + (padding * 2));
          var exportHeight = Math.max(600, maxY - minY + (padding * 2));
          
          // Ajustar el viewport para centrar el contenido
           const centerX = (minX + maxX) / 2;
           const centerY = (minY + maxY) / 2;
           reactFlowInstance.setViewport({ 
             x: -centerX + exportWidth / 2, 
             y: -centerY + exportHeight / 2, 
             zoom: 1 
           });
         }
         
         // Esperar un momento para que se aplique el centrado
         await new Promise(resolve => setTimeout(resolve, 200));
         
         // Configurar opciones para html-to-image
        const exportOptions = {
          quality: mergedOptions.quality || 1.0,
          pixelRatio: mergedOptions.scale || 2,
          backgroundColor: mergedOptions.includeBackground ? '#ffffff' : 'transparent',
          width: Math.max(exportWidth, reactFlowElement.offsetWidth),
          height: Math.max(exportHeight, reactFlowElement.offsetHeight),
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          },
          filter: (node: Element) => {
            // Filtrar elementos que no deben aparecer en la exportación
            const element = node as HTMLElement;
            const classesToIgnore = [
              'react-flow__controls', 'react-flow__minimap', 'react-flow__attribution',
              'exportOverlay', 'exportPanel', 'navigationPanel', 'modal', 'modalOverlay',
              'contextMenu', 'tooltip', 'dropdown', 'floatingButton'
            ];
            
            return !classesToIgnore.some(cls => element.classList?.contains(cls));
          }
        };

        let dataUrl: string;
        
        // Usar la función apropiada según el formato
        if (options.format === 'png') {
          dataUrl = await toPng(reactFlowElement, exportOptions);
        } else if (options.format === 'jpg') {
          dataUrl = await toJpeg(reactFlowElement, { ...exportOptions, backgroundColor: '#ffffff' });
        } else {
          throw new Error(`Formato ${options.format} no soportado para React Flow`);
        }

        // Convertir dataUrl a blob y descargar
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileName = `${mergedOptions.fileName}.${options.format}`;
        saveAs(blob, fileName);
        // Restaurar viewport original
        reactFlowInstance.setViewport(originalViewport);
        
      } catch (exportError) {
        console.error('Error durante la exportación:', exportError);
        // Restaurar viewport original en caso de error
        reactFlowInstance.setViewport(originalViewport);
        throw exportError;
      }
    } else {
      // Fallback sin instancia de React Flow
      const exportOptions = {
        quality: mergedOptions.quality || 1.0,
        pixelRatio: mergedOptions.scale || 2,
        backgroundColor: mergedOptions.includeBackground ? '#ffffff' : 'transparent'
      };

      let dataUrl: string;
      if (options.format === 'png') {
        dataUrl = await toPng(reactFlowElement, exportOptions);
      } else if (options.format === 'jpg') {
        dataUrl = await toJpeg(reactFlowElement, { ...exportOptions, backgroundColor: '#ffffff' });
      } else {
        throw new Error(`Formato ${options.format} no soportado`);
      }

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileName = `${mergedOptions.fileName}.${options.format}`;
      saveAs(blob, fileName);
    }

  } catch (error) {
    console.error('Error al exportar React Flow como imagen:', error);
    throw new Error(`Error al exportar como ${options.format.toUpperCase()}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Exportar React Flow como PDF usando html-to-image
 */
export const exportReactFlowAsPDF = async (options: ExportOptions, reactFlowInstance?: any): Promise<void> => {
  try {
    // Buscar el elemento React Flow
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!reactFlowElement) {
      throw new Error('No se encontró el elemento React Flow. Asegúrese de que la vista React Flow esté activa.');
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Si tenemos la instancia de React Flow, ajustar la vista
    if (reactFlowInstance) {
      const currentViewport = reactFlowInstance.getViewport();
      
      // Guardar el viewport actual para restaurarlo después
      const originalViewport = reactFlowInstance.getViewport();
      
      // Resetear el viewport a escala 1:1 y posición (0,0) para cálculos precisos
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      
      // Esperar un momento para que se aplique el cambio
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        // Estrategia simplificada: usar coordenadas originales de nodos (zoom 1:1)
        const nodes = reactFlowInstance.getNodes();
        
        // Si no hay nodos, usar dimensiones por defecto
        if (nodes.length === 0) {
          var exportWidth = 800;
          var exportHeight = 600;
        } else {
          // Calcular el bounding box usando coordenadas originales de los nodos
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          
          nodes.forEach((node: any) => {
            const nodeX = node.position.x;
            const nodeY = node.position.y;
            const nodeWidth = node.width || 200;
            const nodeHeight = node.height || 100;
            
            minX = Math.min(minX, nodeX);
            minY = Math.min(minY, nodeY);
            maxX = Math.max(maxX, nodeX + nodeWidth);
            maxY = Math.max(maxY, nodeY + nodeHeight);
          });
          
          // Agregar padding generoso y asegurar dimensiones mínimas
          const padding = 100;
          var exportWidth = Math.max(800, maxX - minX + (padding * 2));
          var exportHeight = Math.max(600, maxY - minY + (padding * 2));
          
          // Ajustar el viewport para centrar el contenido
           const centerX = (minX + maxX) / 2;
           const centerY = (minY + maxY) / 2;
           reactFlowInstance.setViewport({ 
             x: -centerX + exportWidth / 2, 
             y: -centerY + exportHeight / 2, 
             zoom: 1 
           });
         }
         
         // Esperar un momento para que se aplique el centrado
         await new Promise(resolve => setTimeout(resolve, 200));
         
         // Generar imagen PNG de alta calidad
        const dataUrl = await toPng(reactFlowElement, {
          quality: 1.0,
          pixelRatio: 3, // Alta resolución para PDF
          backgroundColor: '#ffffff',
          width: Math.max(exportWidth, reactFlowElement.offsetWidth),
          height: Math.max(exportHeight, reactFlowElement.offsetHeight),
          filter: (node: Element) => {
            const element = node as HTMLElement;
            const classesToIgnore = [
              'react-flow__controls', 'react-flow__minimap', 'react-flow__attribution',
              'exportOverlay', 'exportPanel', 'navigationPanel', 'modal', 'modalOverlay',
              'contextMenu', 'tooltip', 'dropdown', 'floatingButton'
            ];
            return !classesToIgnore.some(cls => element.classList?.contains(cls));
          }
        });

        // Crear PDF
        const pdf = new jsPDF({
          orientation: mergedOptions.orientation || 'landscape',
          unit: 'mm',
          format: mergedOptions.paperSize || 'a4'
        });

        // Obtener dimensiones del PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Crear imagen temporal para obtener dimensiones
        const img = new Image();
        img.onload = () => {
          const imgWidth = img.width;
          const imgHeight = img.height;
          
          // Calcular escala para ajustar al PDF manteniendo proporción
          const scaleX = pdfWidth / imgWidth;
          const scaleY = pdfHeight / imgHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const finalWidth = imgWidth * scale;
          const finalHeight = imgHeight * scale;
          
          // Centrar imagen en el PDF
          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;
          
          pdf.addImage(dataUrl, 'PNG', x, y, finalWidth, finalHeight);
          
          const fileName = `${mergedOptions.fileName}.pdf`;
          pdf.save(fileName);
        };
        img.src = dataUrl;
        
        // Restaurar viewport original
        reactFlowInstance.setViewport(originalViewport);
        
      } catch (exportError) {
        console.error('Error durante la exportación PDF:', exportError);
        reactFlowInstance.setViewport(originalViewport);
        throw exportError;
      }
    } else {
      throw new Error('Se requiere la instancia de React Flow para exportar PDF correctamente');
    }

  } catch (error) {
    console.error('Error al exportar React Flow como PDF:', error);
    throw new Error(`Error al exportar como PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Obtener información del dispositivo para analytics
 */
export const getExportMetadata = () => {
  // Ajustar fecha para Perú (UTC-5)
  const peruDate = new Date();
  peruDate.setHours(peruDate.getHours() - 5);
  
  return {
    timestamp: peruDate.toISOString(),
    userAgent: navigator.userAgent,
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
};