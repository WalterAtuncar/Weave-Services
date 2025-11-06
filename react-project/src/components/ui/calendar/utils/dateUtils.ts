/**
 * Utility functions for date manipulation and formatting
 */

// Create a safe date to avoid timezone issues
export const createSafeDate = (year: number, month: number, day: number = 1): Date => {
  return new Date(year, month, day);
};

// Add months to a date
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Add years to a date
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Check if two dates are in the same month
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() && 
         date1.getMonth() === date2.getMonth();
};

// Check if a date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Check if a date is in the past
export const isPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Check if a date is in the future
export const isFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
};

// Get the start of a month
export const startOfMonth = (date: Date): Date => {
  return createSafeDate(date.getFullYear(), date.getMonth(), 1);
};

// Get the end of a month
export const endOfMonth = (date: Date): Date => {
  return createSafeDate(date.getFullYear(), date.getMonth() + 1, 0);
};

// Format date to locale string
export const formatDate = (date: Date, locale: string = 'es-ES'): string => {
  return date.toLocaleDateString(locale);
};

// Format month and year
export const formatMonthYear = (date: Date, locale: string = 'es-ES'): string => {
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
};

// Get month name
export const getMonthName = (date: Date, locale: string = 'es-ES'): string => {
  return date.toLocaleDateString(locale, { month: 'long' });
};

// Get short month name
export const getShortMonthName = (date: Date, locale: string = 'es-ES'): string => {
  return date.toLocaleDateString(locale, { month: 'short' });
};

// Get year from date
export const getYear = (date: Date): number => {
  return date.getFullYear();
};

// Get month from date (0-based)
export const getMonth = (date: Date): number => {
  return date.getMonth();
};

// Get day from date
export const getDay = (date: Date): number => {
  return date.getDate();
};

// Clamp a date between min and max dates
export const clampDate = (date: Date, minDate?: Date, maxDate?: Date): Date => {
  let result = new Date(date);
  
  if (minDate && result < minDate) {
    result = new Date(minDate);
  }
  
  if (maxDate && result > maxDate) {
    result = new Date(maxDate);
  }
  
  return result;
};

// Check if date is within range
export const isDateInRange = (date: Date, minDate?: Date, maxDate?: Date): boolean => {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
};

// Generate year range
export const generateYearRange = (fromYear?: number, toYear?: number): number[] => {
  const currentYear = new Date().getFullYear();
  const start = fromYear ?? currentYear - 50;
  const end = toYear ?? currentYear + 10;
  
  const years: number[] = [];
  for (let year = start; year <= end; year++) {
    years.push(year);
  }
  
  return years;
};

// Get previous month
export const getPreviousMonth = (date: Date): Date => {
  return addMonths(date, -1);
};

// Get next month
export const getNextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

// Parse date string safely
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Get days in month
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
export const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

// Spanish month names
export const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Spanish short month names
export const SPANISH_MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Spanish day names
export const SPANISH_DAYS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

// Spanish short day names
export const SPANISH_DAYS_SHORT = [
  'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'
];

// Get Spanish month name
export const getSpanishMonthName = (date: Date | undefined): string => {
  if (!date || !(date instanceof Date)) {
    return SPANISH_MONTHS[new Date().getMonth()]; // Fallback to current month
  }
  return SPANISH_MONTHS[date.getMonth()];
};

// Get Spanish short month name
export const getSpanishShortMonthName = (date: Date | undefined): string => {
  if (!date || !(date instanceof Date)) {
    return SPANISH_MONTHS_SHORT[new Date().getMonth()]; // Fallback to current month
  }
  return SPANISH_MONTHS_SHORT[date.getMonth()];
};

// Format date in Spanish
export const formatDateSpanish = (date: Date): string => {
  const day = date.getDate();
  const month = getSpanishMonthName(date);
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}; 