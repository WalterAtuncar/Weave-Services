import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convierte una fecha a string en formato YYYY-MM-DD sin problemas de zona horaria
 * @param date Fecha a convertir
 * @returns String en formato YYYY-MM-DD
 */
export function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parsea un string de fecha en formato YYYY-MM-DD de forma segura sin problemas de zona horaria
 * @param dateString String en formato YYYY-MM-DD
 * @returns Date normalizada o undefined si el string es inválido
 */
export function parseLocalDateString(dateString: string): Date | undefined {
  if (!dateString || typeof dateString !== 'string') return undefined;
  
  try {
    // Verificar que el formato sea YYYY-MM-DD
    const match = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) return undefined;
    
    const [, yearStr, monthStr, dayStr] = match;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // Los meses en JS van de 0-11
    const day = parseInt(dayStr, 10);
    
    // Validar que los valores sean válidos
    if (year < 1900 || year > 2100) return undefined;
    if (month < 0 || month > 11) return undefined;
    if (day < 1 || day > 31) return undefined;
    
    // Crear fecha a las 12:00 del mediodía para evitar problemas de zona horaria
    const date = new Date(year, month, day, 12, 0, 0, 0);
    
    // Verificar que la fecha sea válida (por ejemplo, 31 de febrero sería inválida)
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return undefined;
    }
    
    return date;
  } catch (error) {
    console.error('Error parseando fecha:', error);
    return undefined;
  }
}

/**
 * Normaliza una fecha para evitar problemas de zona horaria estableciendo la hora a las 12:00
 * @param date Fecha a normalizar
 * @returns Nueva fecha normalizada
 */
export function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

/**
 * Crea una fecha segura desde componentes de fecha
 * @param year Año
 * @param month Mes (0-11)
 * @param day Día
 * @returns Nueva fecha a las 12:00 del mediodía
 */
export function createSafeDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12, 0, 0, 0);
}
