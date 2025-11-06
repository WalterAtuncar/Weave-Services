/**
 * 📅 Utilidades para manejo de fechas en zona horaria de Perú
 */

/**
 * 🔧 CORREGIDO: Obtiene la fecha actual en zona horaria de Perú (GMT-5)
 * @returns string - Fecha formateada en español (ej: "Hoy 15 de Diciembre")
 */
export const getCurrentDatePeru = (): string => {
  try {
    // Crear fecha actual y ajustar a zona horaria de Perú (UTC-5)
    const now = new Date();
    
    // Opción 1: Usar Intl.DateTimeFormat para mayor precisión
    const peruDate = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).formatToParts(now);
    
    // Extraer día y mes de las partes formateadas
    const day = peruDate.find(part => part.type === 'day')?.value || '1';
    const month = peruDate.find(part => part.type === 'month')?.value || 'Enero';
    
    // Capitalizar primera letra del mes
    const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
    
    const result = `Hoy ${day} de ${monthCapitalized}`;
    
    return result;
    
  } catch (error) {
    console.error('❌ Error al obtener fecha de Perú:', error);
    
    // Fallback mejorado: calcular manualmente UTC-5
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const peruTime = new Date(utcTime + (-5 * 3600000)); // UTC-5
    
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const day = peruTime.getDate();
    const month = months[peruTime.getMonth()];
    
    const fallbackResult = `Hoy ${day} de ${month}`;
    
    console.warn('⚠️ Usando fecha fallback:', fallbackResult);
    return fallbackResult;
  }
};

/**
 * 🔧 MEJORADO: Obtiene solo la fecha formateada sin "Hoy"
 * @returns string - Fecha formateada (ej: "15 de Diciembre")
 */
export const getFormattedDatePeru = (): string => {
  return getCurrentDatePeru().replace('Hoy ', '');
};

/**
 * 🔧 MEJORADO: Obtiene la fecha y hora actual en zona horaria de Perú
 * @returns Date - Objeto Date ajustado a zona horaria de Perú
 */
export const getPeruDateTime = (): Date => {
  try {
    const now = new Date();
    
    // Usar Intl para obtener fecha/hora precisa de Perú
    const peruTimeString = now.toLocaleString("en-US", { 
      timeZone: "America/Lima",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    return new Date(peruTimeString);
  } catch (error) {
    console.error('❌ Error al obtener DateTime de Perú:', error);
    
    // Fallback manual UTC-5
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utcTime + (-5 * 3600000));
  }
};

/**
 * 🆕 NUEVO: Obtiene fecha corta para Perú
 * @returns string - Fecha en formato DD/MM/YYYY
 */
export const getShortDatePeru = (): string => {
  try {
    const peruDate = getPeruDateTime();
    const day = String(peruDate.getDate()).padStart(2, '0');
    const month = String(peruDate.getMonth() + 1).padStart(2, '0');
    const year = peruDate.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('❌ Error al obtener fecha corta de Perú:', error);
    return new Date().toLocaleDateString('es-PE');
  }
};

/**
 * 🆕 NUEVO: Verifica si la fecha está actualizada
 * @param currentDisplayDate - Fecha actualmente mostrada
 * @returns boolean - true si necesita actualización
 */
export const needsDateUpdate = (currentDisplayDate: string): boolean => {
  const actualDate = getCurrentDatePeru();
  return currentDisplayDate !== actualDate;
}; 