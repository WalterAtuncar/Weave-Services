/**
 * 🔍 Archivo de debugging para verificar fechas de Perú
 * Este archivo ayuda a diagnosticar problemas con la zona horaria
 */

import { getCurrentDatePeru, getPeruDateTime, getShortDatePeru } from './dateUtils';

/**
 * 🧪 Función de testing para verificar fechas de Perú
 */
export const testPeruDates = () => {
  const now = new Date();
  
  console.group('🇵🇪 TESTING FECHAS DE PERÚ');
  

  

  
  // Verificar si la zona horaria es correcta
  const peruTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
  const timeDiff = (now.getTime() - peruTime.getTime()) / (1000 * 60 * 60);
  

  
  // Test de formato de fecha
  const testDate = new Date('2024-12-15T10:00:00Z'); // Fecha fija para testing
  const peruTestDate = new Date(testDate.toLocaleString("en-US", { timeZone: "America/Lima" }));
  

  
  console.groupEnd();
  
  return {
    currentDate: getCurrentDatePeru(),
    isWorkingCorrectly: true,
    timestamp: now.toISOString()
  };
};

/**
 * 🔧 Función helper para formatear cualquier fecha a formato Perú
 */
export const formatDatePeru = (date: Date): string => {
  try {
    const peruDate = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).formatToParts(date);
    
    const day = peruDate.find(part => part.type === 'day')?.value || '1';
    const month = peruDate.find(part => part.type === 'month')?.value || 'Enero';
    const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
    
    return `${day} de ${monthCapitalized}`;
  } catch (error) {

    return date.toLocaleDateString('es-PE');
  }
};

/**
 * 🆕 Hook para usar en React DevTools o consola del navegador
 */
export const debugPeruDate = () => {
  if (typeof window !== 'undefined') {
    (window as any).testPeruDates = testPeruDates;
    (window as any).getCurrentDatePeru = getCurrentDatePeru;
    (window as any).getPeruDateTime = getPeruDateTime;
    

    
    // Ejecutar test automáticamente
    return testPeruDates();
  }
  return null;
};

// Auto-ejecución removida para evitar spam en la consola