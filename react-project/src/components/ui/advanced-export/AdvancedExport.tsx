import React, { useState, useMemo } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileType, 
  Settings, 
  Filter, 
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { Checkbox } from '../checkbox';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import { useTheme } from '../../../contexts/ThemeContext';
import { AlertService } from '../alerts/AlertService';
import { 
  Sistema, 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema,
  getTipoSistemaLabel,
  getFamiliaSistemaLabel,
  getEstadoSistemaLabel
} from '../../../models/Sistemas';
import { Sistema as SistemaDto } from '../../../services/types/sistemas.types';
import styles from './AdvancedExport.module.css';

export interface AdvancedExportProps {
  /** Lista de sistemas disponibles para exportar */
  sistemas: SistemaDto[];
  /** ID de la organización */
  organizacionId: number;
  /** Sistemas pre-seleccionados */
  selectedSystems?: number[];
  /** Callback cuando se inicia la exportación */
  onExport?: (config: ExportConfig) => Promise<void>;
  /** Callback cuando se cancela */
  onCancel?: () => void;
  /** Modo compacto */
  compact?: boolean;
}

export interface ExportConfig {
  format: ExportFormat;
  includeFields: ExportField[];
  filters: ExportFilters;
  template: ExportTemplate;
  fileName: string;
  includeAnalytics: boolean;
  includeModules?: boolean;
  includeDependencies?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';

export type ExportField = 
  | 'sistemaId'
  | 'nombreSistema' 
  | 'codigoSistema'
  | 'funcionPrincipal'
  | 'tipoSistema'
  | 'familiaSistema'
  | 'estado'
  | 'sistemaDepende'
  | 'fechaCreacion'
  | 'fechaActualizacion'
  | 'creadoPor'
  | 'actualizadoPor';

export type ExportTemplate = 'complete' | 'summary';

export interface ExportFilters {
  tipos?: TipoSistema[];
  familias?: FamiliaSistema[];
  estados?: EstadoSistema[];
  selectedSystems?: number[];
  searchText?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// =============================================
// UTILIDADES DE EXPORTACIÓN
// =============================================

// Normaliza cualquier valor de estado al enum EstadoSistema. Devuelve null si no es mapeable.
const ESTADOS_VALIDOS: EstadoSistema[] = [
  EstadoSistema.Borrador,
  EstadoSistema.IniciarFlujo,
  EstadoSistema.Pendiente,
  EstadoSistema.Rechazado,
  EstadoSistema.Inactivo,
  EstadoSistema.Activo,
  EstadoSistema.EnDesarrollo,
  EstadoSistema.EnMantenimiento
];

const normalizeEstado = (raw: any): EstadoSistema | null => {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === 'number') {
    return (ESTADOS_VALIDOS as number[]).includes(raw) ? (raw as EstadoSistema) : null;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') return null;

    const asNum = Number(trimmed);
    if (!Number.isNaN(asNum)) {
      return (ESTADOS_VALIDOS as number[]).includes(asNum) ? (asNum as EstadoSistema) : null;
    }

    const labelToCode: Record<string, EstadoSistema> = {};
    for (const code of ESTADOS_VALIDOS) {
      labelToCode[getEstadoSistemaLabel(code).toLowerCase()] = code;
    }
    const byLabel = labelToCode[trimmed.toLowerCase()];
    return byLabel !== undefined ? byLabel : null;
  }

  return null;
};

/** Mapear SistemaDto a formato de exportación COMPLETO usando TODA la data enriquecida */
const mapSistemaForExport = (sistema: SistemaDto) => {
  const s = sistema as any; // Acceso a la data enriquecida del backend
  const estadoNormalizado = normalizeEstado(s.estado);
  
  // 🐛 DEBUG: Agregar logs para debuggear el problema
  console.log('🔍 DEBUG mapSistemaForExport:', {
    sistemaId: s.sistemaId,
    nombreSistema: s.nombreSistema,
    estadoOriginal: s.estado,
    estadoNormalizado,
    estadoTextoOriginal: s.estadoTexto,
    tipoEstadoOriginal: typeof s.estado
  });
  
  // 🔧 FORZAR: Sobrescribir estadoTexto usando directamente el enum
  const estadoFinal = estadoNormalizado !== null ? estadoNormalizado : EstadoSistema.Inactivo;
  const estadoTextoForzado = getEstadoSistemaLabel(estadoFinal);
  
  console.log('🔧 FORZADO estadoTexto:', {
    estadoFinal,
    estadoTextoForzado,
    estadoTextoOriginalBackend: s.estadoTexto
  });
  
  return {
    // ==========================================
    // INFORMACIÓN BÁSICA DEL SISTEMA
    // ==========================================
    sistemaId: s.sistemaId || 0,
    nombreSistema: s.nombreSistema || '',
    codigoSistema: s.codigoSistema || '',
    codigoCompleto: s.codigoCompleto || '',
    funcionPrincipal: s.funcionPrincipal || '',
    version: s.version || 1,
    estado: estadoFinal,
    estadoTexto: estadoTextoForzado, // 🔧 USAR VALOR FORZADO DEL ENUM
    
    // ==========================================
    // INFORMACIÓN DE ORGANIZACIÓN
    // ==========================================
    organizacionId: s.organizacionId || 0,
    codigoOrganizacion: s.codigoOrganizacion || '',
    razonSocialOrganizacion: s.razonSocialOrganizacion || '',
    nombreComercialOrganizacion: s.nombreComercialOrganizacion || '',
    
    // ==========================================
    // TIPO DE SISTEMA (ENRIQUECIDO)
    // ==========================================
    tipoSistemaId: s.tipoSistemaId || 0,
    tipoSistemaCodigo: s.tipoSistemaCodigo || '',
    tipoSistemaNombre: s.tipoSistemaNombre || '',
    tipoSistemaDescripcion: s.tipoSistemaDescripcion || '',
    
    // ==========================================
    // FAMILIA DE SISTEMA (ENRIQUECIDO)
    // ==========================================
    familiaSistemaId: s.familiaSistemaId || 0,
    familiaSistemaCodigo: s.familiaSistemaCodigo || '',
    familiaSistemaNombre: s.familiaSistemaNombre || '',
    familiaSistemaDescripcion: s.familiaSistemaDescripcion || '',
    
    // ==========================================
    // INFORMACIÓN DE DEPENDENCIAS
    // ==========================================
    sistemaDepende: s.sistemaDepende || null,
    nombreSistemaPadre: s.nombreSistemaPadre || '',
    codigoSistemaPadre: s.codigoSistemaPadre || '',
    totalSistemasHijos: s.totalSistemasHijos || 0,
    sistemasHijosActivos: s.sistemasHijosActivos || 0,
    
    // ==========================================
    // INFORMACIÓN DE SERVIDOR
    // ==========================================
    idServidor: s.idServidor || null,
    servidorCodigo: s.servidorCodigo || '',
    servidorNombre: s.servidorNombre || '',
    servidorIP: s.servidorIP || '',
    servidorTipo: s.servidorTipo || '',
    servidorAmbiente: s.servidorAmbiente || '',
    servidorEstado: s.servidorEstado || '',
    
    // ==========================================
    // MÉTRICAS DE MÓDULOS
    // ==========================================
    totalModulos: s.totalModulos || 0,
    modulosActivos: s.modulosActivos || 0,
    sistemaModulos: s.sistemaModulos || null,
    
    // ==========================================
    // MÉTRICAS CALCULADAS
    // ==========================================
    antiguedadEnDias: s.antiguedadEnDias || 0,
    tieneCodigo: s.tieneCodigo || false,
    tieneFuncionPrincipal: s.tieneFuncionPrincipal || false,
    tieneDependencias: s.tieneDependencias || false,
    tieneModulos: s.tieneModulos || false,
    esSistemaRaiz: s.esSistemaRaiz || false,
    esSistemaHijo: s.esSistemaHijo || false,
    
    // ==========================================
    // AUDITORÍA
    // ==========================================
    fechaCreacion: s.fechaCreacion || '',
    fechaActualizacion: s.fechaActualizacion || '',
    creadoPor: s.creadoPor || 0,
    actualizadoPor: s.actualizadoPor || 0,
    nombreUsuarioCreador: s.nombreUsuarioCreador || '',
    nombreUsuarioActualizador: s.nombreUsuarioActualizador || '',
    registroEliminado: s.registroEliminado || false,
    
    // ==========================================
    // DATOS RELACIONALES COMPLEJOS
    // ==========================================
    sistemasHijos: s.sistemasHijos || null,
    
    // ==========================================
    // CAMPOS CALCULADOS PARA EXPORTACIÓN
    // ==========================================
    porcentajeModulosActivos: s.totalModulos > 0 ? ((s.modulosActivos / s.totalModulos) * 100).toFixed(1) + '%' : 'N/A',
    porcentajeSistemasHijosActivos: s.totalSistemasHijos > 0 ? ((s.sistemasHijosActivos / s.totalSistemasHijos) * 100).toFixed(1) + '%' : 'N/A',
    antiguedadFormateada: s.antiguedadEnDias >= 0 ? `${s.antiguedadEnDias} días` : 'Fecha futura',
    clasificacionComplejidad: s.totalModulos === 0 ? 'Simple' : 
                             s.totalModulos <= 3 ? 'Básico' : 
                             s.totalModulos <= 10 ? 'Intermedio' : 'Complejo',
    nivelDependencias: s.tieneDependencias ? (s.totalSistemasHijos > 0 ? 'Padre' : 'Hijo') : 'Independiente',
    saludGeneral: (estadoNormalizado === 1 && s.modulosActivos === s.totalModulos) ? 'Excelente' :
                  (estadoNormalizado === 1 && s.modulosActivos > 0) ? 'Bueno' :
                  (estadoNormalizado === 1) ? 'Regular' : 'Crítico'
  };
};

/** Generar gráficos como imágenes base64 para insertar en reportes */
const generateChartsAsImages = (sistemas: SistemaDto[]) => {
  const colors = {
    primary: '#6366F1',
    secondary: '#8B5CF6', 
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280'
  };

  const chartColors = [
    '#6366F1', // Primary - Indigo
    '#10B981', // Success - Emerald 
    '#F59E0B', // Warning - Amber
    '#EF4444', // Danger - Red
    '#8B5CF6', // Secondary - Violet
    '#06B6D4', // Info - Cyan
    '#84CC16', // Lime
    '#F97316'  // Orange
  ];

  // Función para generar SVG de Pie Chart
  const generatePieChartSVG = (data: Array<{ label: string; value: number }>, title: string) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return '';

    let cumulativePercentage = 0;
    let paths = '';
    let legends = '';

    data.forEach((item, index) => {
      const percentage = (item.value / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
      
      const startAngleRad = (startAngle - 90) * (Math.PI / 180);
      const endAngleRad = (endAngle - 90) * (Math.PI / 180);
      const largeArcFlag = percentage > 50 ? 1 : 0;
      
      const x1 = 150 + 120 * Math.cos(startAngleRad);
      const y1 = 150 + 120 * Math.sin(startAngleRad);
      const x2 = 150 + 120 * Math.cos(endAngleRad);
      const y2 = 150 + 120 * Math.sin(endAngleRad);
      
      const pathData = `M 150 150 L ${x1} ${y1} A 120 120 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      const color = chartColors[index % chartColors.length];
      
      paths += `<path d="${pathData}" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>`;
      legends += `<g transform="translate(320, ${40 + index * 25})">
        <rect x="0" y="0" width="12" height="12" fill="${color}"/>
        <text x="20" y="10" font-family="Arial" font-size="12" fill="${colors.text}">${item.label}: ${item.value} (${percentage.toFixed(1)}%)</text>
      </g>`;
      
      cumulativePercentage += percentage;
    });

    return `
      <svg width="600" height="350" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="350" fill="${colors.surface}"/>
        <text x="300" y="25" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="${colors.text}">${title}</text>
        ${paths}
        ${legends}
      </svg>
    `;
  };

  // Función para generar SVG de Donut Chart
  const generateDonutChartSVG = (data: Array<{ label: string; value: number }>, title: string) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return '';

    let cumulativePercentage = 0;
    let paths = '';
    let legends = '';

    data.forEach((item, index) => {
      const percentage = (item.value / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
      
      const startAngleRad = (startAngle - 90) * (Math.PI / 180);
      const endAngleRad = (endAngle - 90) * (Math.PI / 180);
      const largeArcFlag = percentage > 50 ? 1 : 0;
      
      const outerRadius = 120;
      const innerRadius = 70;
      
      const x1Outer = 150 + outerRadius * Math.cos(startAngleRad);
      const y1Outer = 150 + outerRadius * Math.sin(startAngleRad);
      const x2Outer = 150 + outerRadius * Math.cos(endAngleRad);
      const y2Outer = 150 + outerRadius * Math.sin(endAngleRad);
      
      const x1Inner = 150 + innerRadius * Math.cos(startAngleRad);
      const y1Inner = 150 + innerRadius * Math.sin(startAngleRad);
      const x2Inner = 150 + innerRadius * Math.cos(endAngleRad);
      const y2Inner = 150 + innerRadius * Math.sin(endAngleRad);
      
      const pathData = `M ${x1Outer} ${y1Outer} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner} Z`;
      const color = chartColors[index % chartColors.length];
      
      paths += `<path d="${pathData}" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>`;
      legends += `<g transform="translate(320, ${40 + index * 25})">
        <rect x="0" y="0" width="12" height="12" fill="${color}"/>
        <text x="20" y="10" font-family="Arial" font-size="12" fill="${colors.text}">${item.label}: ${item.value} (${percentage.toFixed(1)}%)</text>
      </g>`;
      
      cumulativePercentage += percentage;
    });

    // Centro del donut con texto
    const centerText = `<g transform="translate(150, 150)">
      <text y="-10" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="${colors.text}">${total}</text>
      <text y="10" text-anchor="middle" font-family="Arial" font-size="12" fill="${colors.textSecondary}">Total</text>
    </g>`;

    return `
      <svg width="600" height="350" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="350" fill="${colors.surface}"/>
        <text x="300" y="25" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="${colors.text}">${title}</text>
        ${paths}
        ${centerText}
        ${legends}
      </svg>
    `;
  };

  // Función para convertir SVG a base64
  const svgToBase64 = (svgString: string) => {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  };

  // Calcular distribuciones para gráficos
  const tipoDistribution = Object.values(TipoSistema).map(tipo => {
    const tipoValue = typeof tipo === 'number' ? tipo : parseInt(tipo as string, 10);
    return {
      label: getTipoSistemaLabel(tipoValue as TipoSistema),
      value: sistemas.filter(s => (s as any).tipoSistemaId === tipoValue || (s as any).tipoSistema === tipoValue).length
    };
  }).filter(item => item.value > 0);

  const familiaDistribution = Object.values(FamiliaSistema).map(familia => {
    const familiaValue = typeof familia === 'number' ? familia : parseInt(familia as string, 10);
    return {
      label: getFamiliaSistemaLabel(familiaValue as FamiliaSistema),
      value: sistemas.filter(s => (s as any).familiaSistemaId === familiaValue || (s as any).familiaSistema === familiaValue).length
    };
  }).filter(item => item.value > 0);

  // Generar gráficos como base64
  const pieChartSVG = generatePieChartSVG(tipoDistribution, 'Distribución por Tipo de Sistema');
  const donutChartSVG = generateDonutChartSVG(familiaDistribution, 'Distribución por Familia de Sistema');

  return {
    pieChart: {
      title: 'Distribución por Tipo de Sistema',
      base64: svgToBase64(pieChartSVG),
      width: 600,
      height: 350
    },
    donutChart: {
      title: 'Distribución por Familia de Sistema', 
      base64: svgToBase64(donutChartSVG),
      width: 600,
      height: 350
    }
  };
};

/** Generar datos según plantilla CON TODA LA DATA ENRIQUECIDA */
const generateTemplateData = (sistemas: SistemaDto[], template: ExportTemplate, includeFields: ExportField[], includeAnalytics: boolean = false) => {
  const mappedSistemas = sistemas.map(mapSistemaForExport);
  
  switch (template) {
    case 'complete':
      // REPORTE COMPLETO: Todos los campos disponibles + opciones adicionales
      return mappedSistemas.map(s => {
        const result: any = {
          // Información Básica
          'ID del Sistema': s.sistemaId,
          'Código del Sistema': s.codigoSistema,
          'Código Completo': s.codigoCompleto,
          'Nombre del Sistema': s.nombreSistema,
          'Función Principal': s.funcionPrincipal,
          'Versión': s.version,
          'Estado': s.estadoTexto,
          
          // Organización
          'Código Organización': s.codigoOrganizacion,
          'Razón Social': s.razonSocialOrganizacion,
          'Nombre Comercial': s.nombreComercialOrganizacion,
          
          // Tipo y Familia (Enriquecido)
          'Tipo Sistema Código': s.tipoSistemaCodigo,
          'Tipo Sistema': s.tipoSistemaNombre,
          'Tipo Descripción': s.tipoSistemaDescripcion,
          'Familia Sistema Código': s.familiaSistemaCodigo,
          'Familia Sistema': s.familiaSistemaNombre,
          'Familia Descripción': s.familiaSistemaDescripcion,
          
          // Auditoría
          'Fecha Creación': s.fechaCreacion ? new Date(s.fechaCreacion).toLocaleDateString('es-PE') : 'N/A',
          'Fecha Actualización': s.fechaActualizacion ? new Date(s.fechaActualizacion).toLocaleDateString('es-PE') : 'N/A',
          'Creado Por': s.nombreUsuarioCreador || `Usuario ID: ${s.creadoPor}`,
          'Actualizado Por': s.nombreUsuarioActualizador || `Usuario ID: ${s.actualizadoPor}`,
          'Antigüedad': s.antiguedadFormateada
        };
        
        // SERVIDOR INFO (si existe)
        if (s.servidorNombre || s.servidorIP) {
          result['Servidor'] = s.servidorNombre;
          result['Servidor IP'] = s.servidorIP;
          result['Servidor Tipo'] = s.servidorTipo;
          result['Servidor Ambiente'] = s.servidorAmbiente;
          result['Servidor Estado'] = s.servidorEstado;
        }
        
        // MÓDULOS (incluir siempre para reporte completo)
        if (s.tieneModulos) {
          result['Total Módulos'] = s.totalModulos;
          result['Módulos Activos'] = s.modulosActivos;
          result['% Módulos Activos'] = s.porcentajeModulosActivos;
          result['Clasificación Complejidad'] = s.clasificacionComplejidad;
          
          // Si tenemos datos detallados de módulos, incluirlos
          if (s.sistemaModulos && Array.isArray(s.sistemaModulos)) {
            const modulosInfo = s.sistemaModulos.map((mod: any) => {
              const est = normalizeEstado(mod.estado);
              const estLabel = est !== null ? getEstadoSistemaLabel(est) : '';
              return `${mod.nombreModulo || 'Módulo'}: ${mod.funcionModulo || 'Sin función'} (${estLabel})`;
            }).join(' | ');
            result['Detalle Módulos'] = modulosInfo;
          }
        }
        
        // DEPENDENCIAS (incluir siempre para reporte completo)
        if (s.tieneDependencias || s.esSistemaRaiz) {
          result['Sistema Padre'] = s.nombreSistemaPadre || 'Sistema Raíz';
          result['Código Padre'] = s.codigoSistemaPadre || 'N/A';
          result['Sistemas Hijos'] = s.totalSistemasHijos;
          result['Hijos Activos'] = s.sistemasHijosActivos;
          result['% Hijos Activos'] = s.porcentajeSistemasHijosActivos;
          result['Nivel Dependencias'] = s.nivelDependencias;
          
          // Si tenemos datos detallados de sistemas hijos, incluirlos
          if (s.sistemasHijos && Array.isArray(s.sistemasHijos)) {
            const hijosInfo = s.sistemasHijos.map((hijo: any) => {
              const est = normalizeEstado(hijo.estado);
              const estLabel = est !== null ? getEstadoSistemaLabel(est) : '';
              return `${hijo.nombreSistema || 'Sistema'} (${hijo.codigoSistema || 'Sin código'}) - ${estLabel}`;
            }).join(' | ');
            result['Detalle Sistemas Hijos'] = hijosInfo;
          }
        }
        
        // ANALYTICS (si se incluye la opción)
        if (includeAnalytics) {
          result['Salud General'] = s.saludGeneral;
          result['Tiene Código'] = s.tieneCodigo ? 'Sí' : 'No';
          result['Tiene Función'] = s.tieneFuncionPrincipal ? 'Sí' : 'No';
          result['Es Sistema Raíz'] = s.esSistemaRaiz ? 'Sí' : 'No';
          result['Es Sistema Hijo'] = s.esSistemaHijo ? 'Sí' : 'No';
        }
        
        return result;
      });
      
    case 'summary':
      // RESUMEN EJECUTIVO: Vista de alto nivel para directivos
      return mappedSistemas.map(s => {
        const result: any = {
          'Sistema': s.nombreSistema,
          'Código': s.codigoCompleto,
          'Tipo': s.tipoSistemaNombre,
          'Familia': s.familiaSistemaNombre,
          'Estado': s.estadoTexto,
          'Complejidad': s.clasificacionComplejidad,
          'Salud': s.saludGeneral,
          'Antigüedad': s.antiguedadFormateada
        };
        
        if (includeAnalytics) {
          result['Módulos'] = `${s.modulosActivos}/${s.totalModulos}`;
          result['Dependencias'] = s.nivelDependencias;
        }
        
        return result;
      });
      
    default:
      return mappedSistemas;
  }
};

/** Obtener etiqueta del campo para casos especiales (si se requiere) */
const getFieldLabel = (field: ExportField): string => {
  const labels: Record<ExportField, string> = {
    sistemaId: 'ID del Sistema',
    nombreSistema: 'Nombre del Sistema',
    codigoSistema: 'Código del Sistema',
    funcionPrincipal: 'Función Principal',
    tipoSistema: 'Tipo de Sistema',
    familiaSistema: 'Familia del Sistema',
    estado: 'Estado',
    sistemaDepende: 'Sistema del que Depende',
    fechaCreacion: 'Fecha de Creación',
    fechaActualizacion: 'Fecha de Actualización',
    creadoPor: 'Creado Por',
    actualizadoPor: 'Actualizado Por'
  };
  return labels[field];
};

/** Obtener valor del campo para casos especiales (usando data enriquecida) */
const getFieldValue = (sistema: any, field: ExportField): any => {
  switch (field) {
    case 'tipoSistema':
      return sistema.tipoSistemaNombre || sistema.tipoSistemaCodigo || 'N/A';
    case 'familiaSistema':
      return sistema.familiaSistemaNombre || sistema.familiaSistemaCodigo || 'N/A';
    case 'estado': {
      const est = normalizeEstado(sistema.estado);
      return sistema.estadoTexto || (est !== null ? getEstadoSistemaLabel(est) : '');
    }
    case 'fechaCreacion':
    case 'fechaActualizacion':
      return sistema[field] ? new Date(sistema[field]).toLocaleDateString('es-PE') : 'N/A';
    case 'sistemaDepende':
      return sistema.nombreSistemaPadre || (sistema.sistemaDepende ? `Sistema ID: ${sistema.sistemaDepende}` : 'Independiente');
    default:
      return sistema[field] || 'N/A';
  }
};

// =============================================
// FUNCIONES DE EXPORTACIÓN POR FORMATO
// =============================================

/** Exportar a Excel */
const exportToExcel = (data: any[], fileName: string, template: ExportTemplate, sistemas: SistemaDto[] = [], includeAnalytics: boolean = false) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja principal
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Aplicar estilos según plantilla
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Auto-ajustar ancho de columnas
    const colWidths = [];
    for (let c = range.s.c; c <= range.e.c; ++c) {
      let maxWidth = 10;
      for (let r = range.s.r; r <= range.e.r; ++r) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          maxWidth = Math.max(maxWidth, cell.v.toString().length);
        }
      }
      colWidths.push({ width: Math.min(maxWidth + 2, 50) });
    }
    worksheet['!cols'] = colWidths;
    
    // Agregar hoja al workbook
    const sheetName = template === 'complete' ? 'Sistemas Completo' : 'Resumen Ejecutivo';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // 📊 INSERTAR GRÁFICOS SI INCLUYE ANALYTICS
    if (includeAnalytics && sistemas.length > 0) {

      
      try {
        const charts = generateChartsAsImages(sistemas);
        
        // Crear hoja de gráficos con información textual
        const chartsData = [
          { 'Sección': 'Métricas y Análisis', 'Descripción': 'Análisis visual de la distribución de sistemas' },
          { 'Sección': '', 'Descripción': '' },
          { 'Sección': 'Distribución por Tipo', 'Descripción': 'Gráfico de pastel mostrando tipos de sistemas' },
          { 'Sección': 'Distribución por Familia', 'Descripción': 'Gráfico de dona mostrando familias de sistemas' },
          { 'Sección': '', 'Descripción': '' },
          { 'Sección': 'Nota Importante', 'Descripción': 'Los gráficos visuales están disponibles en formato PDF' },
        ];
        
        const chartsWorksheet = XLSX.utils.json_to_sheet(chartsData);
        
        // Auto-ajustar ancho para hoja de gráficos
        chartsWorksheet['!cols'] = [
          { width: 25 },
          { width: 60 }
        ];
        
        XLSX.utils.book_append_sheet(workbook, chartsWorksheet, 'Análisis Visual');
        

      } catch (chartError) {
        console.warn('⚠️ Error al generar gráficos para Excel:', chartError);
        // Continuar sin gráficos
      }
    }
    
    // Descargar archivo
    const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(workbook, finalFileName);
    
    return true;
  } catch (error) {
    console.error('❌ Error al exportar a Excel:', error);
    throw new Error('Error al generar archivo Excel');
  }
};

/** Exportar a CSV */
const exportToCSV = (data: any[], fileName: string) => {
  try {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    link.click();
    return true;
  } catch (error) {
    console.error('❌ Error al exportar a CSV:', error);
    throw new Error('Error al generar archivo CSV');
  }
};

/** Convertir datos a CSV */
const convertToCSV = (data: any[]): string => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Agregar headers
  csvRows.push(headers.join(','));
  
  // Agregar datos
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escapar comillas y agregar comillas si contiene comas
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

/** Exportar a JSON */
const exportToJSON = (data: any[], fileName: string) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    link.click();
    return true;
  } catch (error) {
    console.error('❌ Error al exportar a JSON:', error);
    throw new Error('Error al generar archivo JSON');
  }
};

/** Exportar a PDF PROFESIONAL usando jsPDF */
const exportToPDF = (data: any[], fileName: string, template: ExportTemplate, sistemas: SistemaDto[] = [], includeAnalytics: boolean = false) => {
  try {

    
    // Crear documento PDF
    const doc = new jsPDF({
      orientation: 'landscape', // Horizontal para más columnas
      unit: 'mm',
      format: 'a4'
    });
    
    // Configuraciones
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Colores del tema
    const colors = {
      primary: '#2563eb',
      secondary: '#64748b', 
      success: '#16a34a',
      warning: '#f59e0b',
      danger: '#dc2626',
      light: '#f8fafc',
      dark: '#1e293b'
    };
    
    let currentY = margin;
    
    // ==========================================
    // HEADER PRINCIPAL
    // ==========================================
    doc.setFillColor(colors.primary);
    doc.rect(margin, currentY, contentWidth, 25, 'F');
    
    // Título principal
    doc.setTextColor('#ffffff');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const title = template === 'complete' ? 'Reporte Completo de Sistemas' : 'Resumen Ejecutivo de Sistemas';
    doc.text(title, margin + 10, currentY + 16);
    
    // Fecha en el header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date().toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const fechaText = `Generado: ${fecha}`;
    // Calcular el ancho del texto para posicionarlo correctamente
    const fechaWidth = doc.getTextWidth(fechaText);
    doc.text(fechaText, pageWidth - margin - fechaWidth, currentY + 16);
    
    currentY += 25; // Reducido de 35 a 25
    
    // ==========================================
    // INFORMACIÓN ORGANIZACIONAL
    // ==========================================
    doc.setTextColor(colors.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Reporte', margin, currentY);
    currentY += 8; // Reducido de 10 a 8
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Total de registros: ${data.length}`, margin + 5, currentY);
    currentY += 4; // Reducido de 5 a 4
    doc.text(`• Plantilla: ${title}`, margin + 5, currentY);
    currentY += 4; // Reducido de 5 a 4
    doc.text(`• Formato: PDF Profesional`, margin + 5, currentY);
    currentY += 10; // Reducido de 15 a 10
    
    // ==========================================
    // SECCIÓN DE RESUMEN ESTADÍSTICO
    // ==========================================
    currentY = addSummarySection(doc, data, currentY, margin, contentWidth);
    
    // ==========================================
    // GRÁFICO DE DISTRIBUCIÓN (para resumen ejecutivo y completo)
    // ==========================================
    currentY = addSimpleBarChart(doc, data, currentY, margin, contentWidth, template);
    
    // ==========================================
    // 📊 GRÁFICOS DE ANÁLISIS (si está incluido)
    // ==========================================
    if (includeAnalytics && sistemas.length > 0) {
  
      
      try {
        const charts = generateChartsAsImages(sistemas);
        
        // Verificar si necesitamos nueva página
        if (currentY > pageHeight - 120) {
          doc.addPage();
          currentY = margin;
        }
        
        // Título de sección de análisis
        doc.setFillColor(colors.secondary);
        doc.rect(margin, currentY, contentWidth, 15, 'F');
        doc.setTextColor('#ffffff');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Análisis Visual de Sistemas', margin + 10, currentY + 10);
        currentY += 25;
        
        // Insertar gráfico de pastel (Distribución por Tipo)
        if (charts.pieChart.base64) {
          doc.setTextColor(colors.dark);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Distribución por Tipo de Sistema', margin, currentY);
          currentY += 10;
          
          // Insertar imagen del gráfico (escalada para el PDF)
          const chartWidth = 120; // mm
          const chartHeight = 70; // mm
          
          doc.addImage(
            charts.pieChart.base64,
            'SVG',
            margin,
            currentY,
            chartWidth,
            chartHeight
          );
          
          currentY += chartHeight + 15;
        }
        
        // Verificar si necesitamos nueva página para el segundo gráfico
        if (currentY > pageHeight - 100) {
          doc.addPage();
          currentY = margin;
        }
        
        // Insertar gráfico de dona (Distribución por Familia)
        if (charts.donutChart.base64) {
          doc.setTextColor(colors.dark);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Distribución por Familia de Sistema', margin, currentY);
          currentY += 10;
          
          // Insertar imagen del gráfico (escalada para el PDF)
          const chartWidth = 120; // mm
          const chartHeight = 70; // mm
          
          doc.addImage(
            charts.donutChart.base64,
            'SVG',
            margin,
            currentY,
            chartWidth,
            chartHeight
          );
          
          currentY += chartHeight + 20;
        }
        
    
      } catch (chartError) {
        console.warn('⚠️ Error al insertar gráficos en PDF:', chartError);
        // Continuar sin gráficos
      }
    }
    
    // ==========================================
    // TABLA DE DATOS PROFESIONAL
    // ==========================================
    if (data.length > 0) {
      // Obtener headers y preparar datos (PDF con columnas limitadas)
      const preferredHeaders = [
        'ID del Sistema',
        'Código del Sistema',
        'Nombre del Sistema',
        'Familia Sistema',
        'Función Principal',
        'Estado'
      ];
      const availableHeaders = Object.keys(data[0] || {});
      let headers = preferredHeaders.filter(h => availableHeaders.includes(h));
      // Fallback por si los datos no tienen las etiquetas esperadas
      if (headers.length === 0) {
        headers = availableHeaders.slice(0, Math.min(5, availableHeaders.length));
      }
      const tableData = data.map(row => headers.map(header => String(row[header] ?? '')));
      
      // Calcular ancho de columnas dinámicamente
      const maxColumns = Math.min(headers.length, 8); // Máximo 8 columnas por página
      const colWidth = contentWidth / maxColumns;
      const defaultColWidth = colWidth;
      
      // Dividir en grupos si hay muchas columnas
      const headerGroups = [];
      const dataGroups = [];
      
      for (let i = 0; i < headers.length; i += maxColumns) {
        headerGroups.push(headers.slice(i, i + maxColumns));
        dataGroups.push(tableData.map(row => row.slice(i, i + maxColumns)));
      }
      
      // Procesar cada grupo de columnas
      for (let groupIndex = 0; groupIndex < headerGroups.length; groupIndex++) {
        const groupHeaders = headerGroups[groupIndex];
        const groupData = dataGroups[groupIndex];

        // Calcular anchos por columna (incluir "Familia Sistema")
        const preferredWidthWeights: Record<string, number> = {
          'ID del Sistema': 0.06,
          'Código del Sistema': 0.08,
          'Nombre del Sistema': 0.22,
          'Familia Sistema': 0.20,
          'Función Principal': 0.32,
          'Estado': 0.12,
        };
        const knownHeaders = groupHeaders.filter(h => preferredWidthWeights[h] !== undefined);
        const knownWeightTotal = knownHeaders.reduce((sum, h) => sum + (preferredWidthWeights[h] as number), 0);
        const remainingHeaders = groupHeaders.filter(h => preferredWidthWeights[h] === undefined);
        const remainingWeight = Math.max(0, 1 - knownWeightTotal);
        const fallbackWeight = remainingHeaders.length > 0 ? remainingWeight / remainingHeaders.length : 0;
        const colWidths = groupHeaders.map(h => contentWidth * ((preferredWidthWeights[h] ?? fallbackWeight) || (1 / groupHeaders.length)));
        
        if (groupIndex > 0) {
          doc.addPage();
          currentY = margin;
          
          // Título de continuación
          doc.setFillColor(colors.secondary);
          doc.rect(margin, currentY, contentWidth, 15, 'F');
          doc.setTextColor('#ffffff');
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${title} - Continuación (${groupIndex + 1}/${headerGroups.length})`, margin + 10, currentY + 10);
          currentY += 25;
        }
        
        // Header de la tabla (asegurar espacio suficiente; si no, nueva página)
        const footerSpace = 24; // reservar espacio para el footer
        const headerNeededSpace = 12 + 8 + 10 + footerSpace; // header + una fila + pequeño margen + footer
        if (currentY >= pageHeight - headerNeededSpace) {
          doc.addPage();
          currentY = margin;
        }
        doc.setFillColor(colors.primary);
        doc.rect(margin, currentY, contentWidth, 12, 'F');
        
        doc.setTextColor('#ffffff');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        
        // Pintar headers con anchos variables
        {
          let xCursor = margin;
          groupHeaders.forEach((header, index) => {
            const cw = colWidths[index] ?? defaultColWidth;
            const maxHeaderChars = Math.max(6, Math.floor((cw - 4) / 2));
            const truncatedHeader = header.length > maxHeaderChars ? header.substring(0, Math.max(0, maxHeaderChars - 3)) + '...' : header;
            doc.text(truncatedHeader, xCursor + 2, currentY + 8);
            xCursor += cw;
          });
        }
        
        currentY += 12;
        
        // Filas de datos con alternancia de colores
        doc.setTextColor(colors.dark);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        groupData.forEach((row, rowIndex) => {
          // Color alternado para filas
          if (rowIndex % 2 === 0) {
            doc.setFillColor(colors.light);
            doc.rect(margin, currentY, contentWidth, 10, 'F');
          }
          
          // Celdas con anchos variables y truncado proporcional al ancho
          {
            let xCursor = margin;
            row.forEach((cell, cellIndex) => {
              const cw = colWidths[cellIndex] ?? defaultColWidth;
              const padding = 6;
              const columnName = groupHeaders[cellIndex];
              
              // Cálculo específico de caracteres por columna
              let approxChars;
              if (columnName === 'Nombre del Sistema' || columnName === 'Familia Sistema') {
                // Para estas columnas problemáticas, usar un cálculo más generoso
                approxChars = Math.max(18, Math.floor((cw - padding) / 1.4));
              } else {
                // Para otras columnas, usar el cálculo estándar
                approxChars = Math.max(12, Math.floor((cw - padding) / 1.8));
              }
              
              const text = String(cell);
              
              // Manejo especial para texto largo
              let truncatedCell = text;
              
              // Para columnas importantes, usar más líneas cuando sea posible
              const isMultiLineColumn = (
                columnName === 'Función Principal' ||
                columnName === 'Nombre del Sistema' ||
                columnName === 'Familia Sistema'
              ) && cw > 40; // Reducir aún más el umbral
              
              if (isMultiLineColumn && text.length > approxChars) {
                const words = text.split(' ');
                let line1 = '';
                let line2 = '';
                
                // Algoritmo mejorado para distribución de palabras
                for (const word of words) {
                  const testLine1 = line1 + (line1 ? ' ' : '') + word;
                  const testLine2 = line2 + (line2 ? ' ' : '') + word;
                  
                  if (testLine1.length <= approxChars) {
                    line1 = testLine1;
                  } else if (testLine2.length <= approxChars) {
                    line2 = testLine2;
                  } else {
                    // Si no cabe en ninguna línea, truncar la segunda línea
                    if (line2.length > 0) {
                      line2 = line2.substring(0, Math.max(0, approxChars - 3)) + '...';
                    }
                    break;
                  }
                }
                
                if (line2 && line2.length > 0) {
                  // Mostrar en dos líneas
                  doc.text(line1, xCursor + 3, currentY + 5);
                  doc.text(line2, xCursor + 3, currentY + 8);
                } else if (line1.length > 0) {
                  // Solo una línea disponible
                  if (line1.length > approxChars) {
                    line1 = line1.substring(0, Math.max(0, approxChars - 3)) + '...';
                  }
                  doc.text(line1, xCursor + 3, currentY + 6.5);
                } else {
                  // Fallback: mostrar texto completo si es posible
                  if (text.length <= approxChars) {
                    doc.text(text, xCursor + 3, currentY + 6.5);
                  } else {
                    truncatedCell = text.substring(0, Math.max(0, approxChars - 3)) + '...';
                    doc.text(truncatedCell, xCursor + 3, currentY + 6.5);
                  }
                }
              } else {
                // Para columnas normales o texto que cabe en una línea
                if (text.length > approxChars) {
                  truncatedCell = text.substring(0, Math.max(0, approxChars - 3)) + '...';
                }
                doc.text(truncatedCell, xCursor + 3, currentY + 6.5);
              }
              
              xCursor += cw;
            });
          }
          
          currentY += 10; // Aumentar altura de fila para mejor espaciado
          
          // Nueva página si es necesario (considerar espacio para header + fila + footer)
          if (currentY >= pageHeight - 60) {
            doc.addPage();
            currentY = margin;
            
            // Repetir header en nueva página
            doc.setFillColor(colors.primary);
            doc.rect(margin, currentY, contentWidth, 14, 'F');
            doc.setTextColor('#ffffff');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            
            // Header con anchos variables en nueva página
            let xCursor = margin;
            groupHeaders.forEach((header, index) => {
              const cw = colWidths[index] ?? defaultColWidth;
              const maxHeaderChars = Math.max(6, Math.floor((cw - 6) / 2.5));
              const truncatedHeader = header.length > maxHeaderChars ? header.substring(0, Math.max(0, maxHeaderChars - 3)) + '...' : header;
              doc.text(truncatedHeader, xCursor + 3, currentY + 9);
              xCursor += cw;
            });
            
            currentY += 14;
            doc.setTextColor(colors.dark);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
          }
        });
        
        currentY += 10;
      }
    }
    
    // ==========================================
    // FOOTER EN TODAS LAS PÁGINAS
    // ==========================================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Línea separadora
      doc.setDrawColor(colors.secondary);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Información del footer
      doc.setTextColor(colors.secondary);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Gestión de Procesos | Sistema de Información', margin, pageHeight - 12);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 30, pageHeight - 12);
      doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, margin, pageHeight - 6);
    }
    
    // ==========================================
    // DESCARGAR PDF
    // ==========================================
    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    doc.save(finalFileName);
    

    return true;
    
  } catch (error) {
    console.error('❌ Error al generar PDF profesional:', error);
    throw new Error('Error al generar archivo PDF profesional');
  }
};

/** Agregar sección de resumen estadístico al PDF */
const addSummarySection = (doc: jsPDF, data: any[], currentY: number, margin: number, contentWidth: number) => {
  try {
    // Calcular estadísticas básicas
    const totalSistemas = data.length;
    const sistemasActivos = data.filter(s => s['Estado'] === 'Activo' || s.estadoTexto === 'Activo').length;
    const sistemasConModulos = data.filter(s => (s['Total Módulos'] || s.totalModulos || 0) > 0).length;
    
    // Sección de resumen (más compacta)
  const boxHeight = 24; // antes 30
  doc.setFillColor('#f8fafc');
  doc.rect(margin, currentY, contentWidth, boxHeight, 'F');
  
  doc.setTextColor('#1e293b');
  doc.setFontSize(11); // antes 12
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Estadístico', margin + 10, currentY + 10);
  
  doc.setFontSize(9); // antes 10
  doc.setFont('helvetica', 'normal');
  
  // Primera columna
  doc.text(`Total de Sistemas: ${totalSistemas}`, margin + 10, currentY + 16);
  doc.text(`Sistemas Activos: ${sistemasActivos} (${((sistemasActivos/totalSistemas)*100).toFixed(1)}%)`, margin + 10, currentY + 21);
  
  // Segunda columna
  doc.text(`Sistemas con Módulos: ${sistemasConModulos}`, margin + 120, currentY + 16);
  doc.text(`Fecha Generación: ${new Date().toLocaleDateString('es-PE')}`, margin + 120, currentY + 21);
  
  return currentY + boxHeight + 6;
  } catch (error) {
    console.warn('⚠️ Error en sección de resumen:', error);
    return currentY + 10;
  }
};

/** Agregar gráfico de barras simple para métricas */
const addSimpleBarChart = (doc: jsPDF, data: any[], currentY: number, margin: number, contentWidth: number, template: ExportTemplate) => {
  try {
    if (template !== 'summary' && template !== 'complete') return currentY;
    
    // Calcular métricas por tipo
    const tipoSistemaCount: { [key: string]: number } = {};
    data.forEach(sistema => {
      const tipo = sistema['Tipo'] || sistema['Tipo Sistema'] || sistema.tipoSistemaNombre || 'Otro';
      tipoSistemaCount[tipo] = (tipoSistemaCount[tipo] || 0) + 1;
    });
    
    const tipos = Object.keys(tipoSistemaCount).slice(0, 6); // Máximo 6 categorías
    if (tipos.length === 0) return currentY;
    
    const maxValue = Math.max(...Object.values(tipoSistemaCount));
    const chartHeight = 80;
    const labelColumnWidth = 100; // Ancho fijo para columna de etiquetas
    const chartWidth = contentWidth - labelColumnWidth - 40; // Espacio para valores
    const barHeight = 14;
    const barSpacing = 6;

    // Verificar salto de página si no hay espacio suficiente para el gráfico completo
    const pageHeight = (doc as any).internal?.pageSize?.getHeight ? (doc as any).internal.pageSize.getHeight() : (doc as any).internal.pageSize.height;
    // Calcular altura necesaria para intentar mantener el gráfico en esta página
    const requiredHeight = Math.min((tipos.length * (barHeight + barSpacing)) + 20, 70); // tope 70mm
    const footerReserve = 35; // reducido para dar margen
    if (currentY >= pageHeight - requiredHeight - footerReserve) {
      // Si falta muy poco espacio, compactar separaciones en lugar de saltar de página
      if (pageHeight - currentY > 50) {
        // Reducir ligeramente altura y spacing de barras para encajar
        // NOTA: variables locales para no afectar otros gráficos
      } else {
        doc.addPage();
        currentY = margin;
      }
    }
    
    // Título del gráfico
    doc.setTextColor('#1e293b');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribución por Tipo de Sistema', margin, currentY);
    currentY += 20;
    
    // Crear barras
    tipos.forEach((tipo, index) => {
      const count = tipoSistemaCount[tipo];
      const barWidth = Math.max(10, (count / maxValue) * chartWidth); // Mínimo 10 puntos
      const yPos = currentY + (index * (barHeight + barSpacing));
      
      // Etiqueta (sin truncar)
      doc.setTextColor('#374151');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Dividir texto largo en múltiples líneas si es necesario
      const maxLabelWidth = labelColumnWidth - 5;
      const words = tipo.split(' ');
      let currentLine = '';
      let lineCount = 0;
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = doc.getTextWidth(testLine);
        
        if (textWidth <= maxLabelWidth || !currentLine) {
          currentLine = testLine;
        } else {
          // Escribir línea actual
          doc.text(currentLine, margin, yPos + 6 + (lineCount * 8));
          currentLine = word;
          lineCount++;
          if (lineCount >= 2) break; // Máximo 2 líneas
        }
      }
      
      // Escribir última línea
      if (currentLine && lineCount < 2) {
        doc.text(currentLine, margin, yPos + 6 + (lineCount * 8));
      }
      
      // Barra de fondo
      const barStartX = margin + labelColumnWidth;
      doc.setFillColor('#e2e8f0');
      doc.rect(barStartX, yPos, chartWidth, barHeight, 'F');
      
      // Barra de datos
      const colorIndex = index % 5;
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      doc.setFillColor(colors[colorIndex]);
      doc.rect(barStartX, yPos, barWidth, barHeight, 'F');
      
      // Valor al final de la barra
      doc.setTextColor('#1f2937');
      doc.setFont('helvetica', 'bold');
      doc.text(count.toString(), barStartX + barWidth + 5, yPos + 9);
    });
    
    return currentY + (tipos.length * (barHeight + barSpacing)) + 20;
  } catch (error) {
    console.warn('⚠️ Error en gráfico de barras:', error);
    return currentY + 10;
  }
};

const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string; icon: React.ComponentType }> = [
  { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
  { value: 'pdf', label: 'PDF (.pdf)', icon: FileText },
  { value: 'csv', label: 'CSV (.csv)', icon: FileType },
  { value: 'json', label: 'JSON (.json)', icon: FileType },
];

const EXPORT_TEMPLATES: Array<{ value: ExportTemplate; label: string; description: string }> = [
  { 
    value: 'complete', 
    label: 'Reporte Completo', 
    description: 'Incluye todos los campos y datos relacionados' 
  },
  { 
    value: 'summary', 
    label: 'Resumen Ejecutivo', 
    description: 'Vista resumida con información clave' 
  }
];

export const AdvancedExport: React.FC<AdvancedExportProps> = ({
  sistemas,
  organizacionId,
  selectedSystems = [],
  onExport,
  onCancel,
  compact = true
}) => {
  const { colors } = useTheme();

  // Estados para configuración de exportación
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'excel',
    includeFields: ['sistemaId', 'nombreSistema', 'tipoSistema', 'familiaSistema', 'estado'],
    filters: {
      selectedSystems: selectedSystems.length > 0 ? selectedSystems : undefined
    },
    template: 'complete',
    fileName: `sistemas-export-${new Date().toISOString().split('T')[0]}`,
    includeAnalytics: false,
    includeModules: false,
    includeDependencies: false
  });


  const [isExporting, setIsExporting] = useState(false);

  // Sistemas filtrados según configuración
  const filteredSistemas = useMemo(() => {
    let filtered = sistemas;

    // Filtro por sistemas seleccionados
    if (exportConfig.filters.selectedSystems?.length) {
      filtered = filtered.filter(s => {
        const sistemaData = s as any;
        const sistemaId = sistemaData.sistemaId || sistemaData.id || 0;
        return exportConfig.filters.selectedSystems!.includes(sistemaId);
      });
    }

    // Filtro por texto de búsqueda
    if (exportConfig.filters.searchText) {
      const search = exportConfig.filters.searchText.toLowerCase();
      filtered = filtered.filter(s => {
        const sistemaData = s as any;
        const nombre = sistemaData.nombreSistema || sistemaData.nombre || '';
        const codigo = sistemaData.codigoSistema || sistemaData.codigo || '';
        const funcion = sistemaData.funcionPrincipal || sistemaData.descripcion || '';
        
        return nombre.toLowerCase().includes(search) ||
               codigo.toLowerCase().includes(search) ||
               funcion.toLowerCase().includes(search);
      });
    }

    // Filtro por tipos
    if (exportConfig.filters.tipos?.length) {
      filtered = filtered.filter(s => {
        const sistemaData = s as any;
        const tipo = sistemaData.tipoSistema || sistemaData.tipoSistemaId || 0;
        return exportConfig.filters.tipos!.includes(tipo);
      });
    }

    // Filtro por familias
    if (exportConfig.filters.familias?.length) {
      filtered = filtered.filter(s => {
        const sistemaData = s as any;
        const familia = sistemaData.familiaSistema || sistemaData.familiaSistemaId || 0;
        return exportConfig.filters.familias!.includes(familia);
      });
    }

    // Filtro por estados
    if (exportConfig.filters.estados?.length) {
      filtered = filtered.filter(s => {
        const sistemaData = s as any;
        const estadoNormalizado = normalizeEstado(sistemaData.estado);
        return estadoNormalizado !== null && exportConfig.filters.estados!.includes(estadoNormalizado);
      });
    }

    // Filtro por rango de fechas
    if (exportConfig.filters.dateRange) {
      const { from, to } = exportConfig.filters.dateRange;
      filtered = filtered.filter(s => {
        const sistemaData = s as any;
        const fecha = new Date(sistemaData.fechaCreacion || '');
        return fecha >= from && fecha <= to;
      });
    }

    // Ordenamiento: primero por familia, luego por ID
    const sorted = filtered.sort((a, b) => {
      const sistemaA = a as any;
      const sistemaB = b as any;
      
      // Obtener familia de sistema
      const familiaA = sistemaA.familiaSistema || sistemaA.familiaSistemaId || 0;
      const familiaB = sistemaB.familiaSistema || sistemaB.familiaSistemaId || 0;
      
      // Ordenar por familia primero
      if (familiaA !== familiaB) {
        return familiaA - familiaB;
      }
      
      // Si las familias son iguales, ordenar por ID
      const idA = sistemaA.sistemaId || sistemaA.id || 0;
      const idB = sistemaB.sistemaId || sistemaB.id || 0;
      return idA - idB;
    });

    return sorted;
  }, [sistemas, exportConfig.filters]);

  // =============================================
  // FUNCIÓN PRINCIPAL DE EXPORTACIÓN
  // =============================================

  /** Ejecutar exportación según configuración */
  const handleExecuteExport = async (): Promise<boolean> => {
    try {
      setIsExporting(true);

      

      // Validaciones
      if (filteredSistemas.length === 0) {
        AlertService.warning('No hay sistemas que coincidan con los filtros aplicados');
        return false;
      }

      // Generar datos según plantilla con opciones de análisis
      const exportData = generateTemplateData(
        filteredSistemas, 
        exportConfig.template, 
        exportConfig.includeFields,
        exportConfig.includeAnalytics
      );

      if (exportData.length === 0) {
        AlertService.warning('No se generaron datos para exportar');
        return false;
      }

      // Ejecutar exportación según formato
      let success = false;
      const fileName = exportConfig.fileName || `sistemas-export-${new Date().toISOString().split('T')[0]}`;

      switch (exportConfig.format) {
        case 'excel':
          success = exportToExcel(exportData, fileName, exportConfig.template, filteredSistemas, exportConfig.includeAnalytics);
          break;
        case 'csv':
          success = exportToCSV(exportData, fileName);
          break;
        case 'json':
          success = exportToJSON(exportData, fileName);
          break;
        case 'pdf':
          success = exportToPDF(exportData, fileName, exportConfig.template, filteredSistemas, exportConfig.includeAnalytics);
          break;
        default:
          throw new Error(`Formato no soportado: ${exportConfig.format}`);
      }

      if (success) {
        const formatLabel = exportConfig.format.toUpperCase();
        const templateLabel = exportConfig.template === 'complete' ? 'Reporte Completo' : 'Resumen Ejecutivo';

        AlertService.success(
          `✅ Exportación ${formatLabel} ${exportConfig.format === 'pdf' ? 'profesional ' : ''}completada: ${filteredSistemas.length} sistemas exportados (${templateLabel})`
        );



        // Callback opcional
        if (onExport) {
          await onExport(exportConfig);
        }

        return true;
      } else {
        throw new Error('Error al ejecutar la exportación');
      }

    } catch (error) {
      console.error('❌ Error en exportación:', error);
      AlertService.error(`❌ Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  // Actualizar campos según plantilla
  const updateFieldsForTemplate = (template: ExportTemplate) => {
    let fields: ExportField[];
    
    switch (template) {
      case 'complete':
        fields = ['sistemaId', 'nombreSistema', 'codigoSistema', 'funcionPrincipal', 'tipoSistema', 'familiaSistema', 'estado', 'sistemaDepende', 'fechaCreacion', 'fechaActualizacion', 'creadoPor', 'actualizadoPor'];
        break;
      case 'summary':
        fields = ['nombreSistema', 'tipoSistema', 'familiaSistema', 'estado', 'fechaCreacion'];
        break;
      default:
        fields = ['nombreSistema', 'tipoSistema', 'estado'];
    }

    setExportConfig(prev => ({
      ...prev,
      includeFields: fields,
      template
    }));
  };

  // Manejar cambios en la configuración
  const handleConfigChange = (updates: Partial<ExportConfig>) => {
    setExportConfig(prev => ({ ...prev, ...updates }));
  };





  // Ejecutar exportación
  const handleExport = async () => {
    if (filteredSistemas.length === 0) {
      AlertService.warning('No hay sistemas para exportar con los filtros aplicados');
      return;
    }

    if (exportConfig.includeFields.length === 0) {
      AlertService.warning('Selecciona al menos un campo para exportar');
      return;
    }

    setIsExporting(true);

    try {
      await onExport?.(exportConfig);
      AlertService.success(`Exportación completada: ${filteredSistemas.length} sistemas exportados`);
    } catch (error) {
      console.error('Error en exportación:', error);
      AlertService.error('Error al exportar los datos. Inténtalo nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`${styles.advancedExport} ${compact ? styles.compact : ''}`}>
      {/* Configuración de formato */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
          Formato de Exportación
        </h3>
        
        <div className={styles.formatGrid}>
          {EXPORT_FORMATS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              className={`${styles.formatOption} ${exportConfig.format === value ? styles.selected : ''}`}
              onClick={() => handleConfigChange({ format: value })}
              style={{ 
                backgroundColor: exportConfig.format === value ? colors.primary : colors.surface,
                borderColor: exportConfig.format === value ? colors.primary : colors.border,
                color: exportConfig.format === value ? 'white' : colors.text
              }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plantillas predefinidas */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
          Plantilla de Exportación
        </h3>
        
        <div className={styles.templateGrid}>
          {EXPORT_TEMPLATES.map(({ value, label, description }) => (
            <div
              key={value}
              className={`${styles.templateOption} ${exportConfig.template === value ? styles.selected : ''}`}
              onClick={() => updateFieldsForTemplate(value)}
              style={{ 
                backgroundColor: colors.surface,
                borderColor: exportConfig.template === value ? colors.primary : colors.border
              }}
            >
              <div className={styles.templateHeader}>
                <input
                  type="radio"
                  checked={exportConfig.template === value}
                  onChange={() => updateFieldsForTemplate(value)}
                  style={{ accentColor: colors.primary }}
                />
                <span className={styles.templateTitle} style={{ color: colors.text }}>
                  {label}
                </span>
              </div>
              <p className={styles.templateDescription} style={{ color: colors.textSecondary }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Opciones adicionales */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
          Opciones Adicionales
        </h3>
        
        <div className={styles.optionsGrid}>
          <label className={styles.option} style={{ color: colors.text }}>
            <Checkbox
              checked={exportConfig.includeAnalytics}
              onCheckedChange={(checked) => handleConfigChange({ includeAnalytics: checked === true })}
            />
            <span>Incluir métricas y análisis (gráficos para Excel/PDF)</span>
          </label>
        </div>
      </div>

      {/* Configuración de archivo */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
          Configuración del Archivo
        </h3>
        
        <div className={styles.fileConfig}>
          <Input
            label="Nombre del archivo"
            value={exportConfig.fileName}
            onChange={(e) => handleConfigChange({ fileName: e.target.value })}
            placeholder="sistemas-export"
          />
        </div>
      </div>

      {/* Resumen y acciones */}
      <div className={styles.summary} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.summaryInfo}>
          <div className={styles.summaryStats}>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: colors.text }}>
                {filteredSistemas.length}
              </span>
              <span className={styles.statLabel} style={{ color: colors.textSecondary }}>
                Sistemas
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: colors.text }}>
                {exportConfig.includeFields.length}
              </span>
              <span className={styles.statLabel} style={{ color: colors.textSecondary }}>
                Campos
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: colors.text }}>
                {exportConfig.format.toUpperCase()}
              </span>
              <span className={styles.statLabel} style={{ color: colors.textSecondary }}>
                Formato
              </span>
            </div>
          </div>
        </div>
        
        {/* Botón de exportación */}
        <div className={styles.exportActions}>
          <Button
            size="l"
            variant="default"
            onClick={handleExecuteExport}
            disabled={isExporting || filteredSistemas.length === 0}
            iconName={isExporting ? "Loader" : "Download"}
            iconPosition="left"
            style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
              minWidth: '140px'
            }}
          >
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>

      </div>
    </div>
  );
};