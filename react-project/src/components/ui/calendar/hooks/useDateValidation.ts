import { useCallback, useMemo } from 'react';
import { DateValidationHook, DateValidationResult } from '../types/DatePickerTypes';
import { isDateInRange, isPast, isFuture, isToday } from '../utils/dateUtils';

export const useDateValidation = (
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[],
  disabledWeekdays?: number[] // 0 = Sunday, 1 = Monday, etc.
): DateValidationHook => {
  
  // Validate a single date
  const validateDate = useCallback((date: Date): DateValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if date is valid
    if (isNaN(date.getTime())) {
      errors.push('Fecha inválida');
      return { isValid: false, errors, warnings };
    }

    // Check min/max range
    if (!isDateInRange(date, minDate, maxDate)) {
      if (minDate && date < minDate) {
        errors.push(`La fecha no puede ser anterior a ${minDate.toLocaleDateString('es-ES')}`);
      }
      if (maxDate && date > maxDate) {
        errors.push(`La fecha no puede ser posterior a ${maxDate.toLocaleDateString('es-ES')}`);
      }
    }

    // Check disabled dates
    if (disabledDates?.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    )) {
      errors.push('Esta fecha no está disponible');
    }

    // Check disabled weekdays
    if (disabledWeekdays?.includes(date.getDay())) {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      errors.push(`Los ${dayNames[date.getDay()]}s no están disponibles`);
    }

    // Add warnings for edge cases
    if (isPast(date) && !isToday(date)) {
      warnings.push('Esta fecha está en el pasado');
    }

    if (isFuture(date)) {
      const futureThreshold = new Date();
      futureThreshold.setFullYear(futureThreshold.getFullYear() + 1);
      if (date > futureThreshold) {
        warnings.push('Esta fecha está muy en el futuro');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [minDate, maxDate, disabledDates, disabledWeekdays]);

  // Validate date range
  const validateDateRange = useCallback((startDate: Date, endDate: Date): DateValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate individual dates first
    const startValidation = validateDate(startDate);
    const endValidation = validateDate(endDate);

    // Combine errors from individual validations
    errors.push(...startValidation.errors.map(error => `Fecha inicio: ${error}`));
    errors.push(...endValidation.errors.map(error => `Fecha fin: ${error}`));
    warnings.push(...startValidation.warnings.map(warning => `Fecha inicio: ${warning}`));
    warnings.push(...endValidation.warnings.map(warning => `Fecha fin: ${warning}`));

    // Check if start date is before end date
    if (startDate >= endDate) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Check if date range is reasonable
    const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 365) {
      warnings.push('El rango de fechas es muy amplio (más de un año)');
    }

    if (daysDifference < 1) {
      warnings.push('El rango de fechas es muy pequeño');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [validateDate]);

  // Check if date is in range (memoized for performance)
  const isDateInRangeMemo = useMemo(() => {
    return (date: Date, minDateOverride?: Date, maxDateOverride?: Date): boolean => {
      return isDateInRange(
        date, 
        minDateOverride || minDate, 
        maxDateOverride || maxDate
      );
    };
  }, [minDate, maxDate]);

  // Check if date is disabled
  const isDateDisabled = useCallback((date: Date, additionalDisabledDates?: Date[]): boolean => {
    // Check basic range
    if (!isDateInRangeMemo(date)) {
      return true;
    }

    // Check disabled dates
    const allDisabledDates = [
      ...(disabledDates || []),
      ...(additionalDisabledDates || [])
    ];

    if (allDisabledDates.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    )) {
      return true;
    }

    // Check disabled weekdays
    if (disabledWeekdays?.includes(date.getDay())) {
      return true;
    }

    return false;
  }, [isDateInRangeMemo, disabledDates, disabledWeekdays]);

  return {
    validateDate,
    validateDateRange,
    isDateInRange: isDateInRangeMemo,
    isDateDisabled
  };
}; 