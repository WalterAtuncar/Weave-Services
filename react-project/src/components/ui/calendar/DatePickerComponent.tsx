import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { DayPicker, DayPickerProps } from 'react-day-picker';
import { motion } from 'framer-motion';
import { DatePickerProps } from './types/DatePickerTypes';
import { CustomNavigation } from './components/CustomNavigation';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useDateValidation } from './hooks/useDateValidation';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  addMonths, 
  getPreviousMonth, 
  getNextMonth, 
  isDateInRange,
  SPANISH_DAYS_SHORT 
} from './utils/dateUtils';
import styles from './styles/DatePicker.module.css';
import 'react-day-picker/style.css';

// Spanish labels
const SPANISH_LABELS = {
  labelPrevious: () => 'Mes anterior',
  labelNext: () => 'Mes siguiente',
  labelToday: 'Hoy',
  labelWeekdays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
};

// Animaciones simplificadas con Framer Motion - solo entrada suave

export const DatePickerComponent: React.FC<DatePickerProps> = React.memo(({
  showYearDropdown = true,
  enableKeyboardNavigation = true,
  animationDuration = 300,
  customClassNames = {},
  onMonthChange,
  minDate,
  maxDate,
  theme: themeProp,
  yearRange,
  className = '',
  selected,
  onSelect,
  disabled,
  weekStartsOn = 1, // Monday
  showOutsideDays = true,
  locale,
  ...dayPickerProps
}) => {
  const { theme: globalTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState(enableKeyboardNavigation);
  
  // Estados para animaciones simplificadas (solo para compatibilidad)
  const [animationDirection, setAnimationDirection] = useState(0);

  // Determine theme
  const currentTheme = themeProp === 'auto' || !themeProp ? globalTheme : themeProp;

  // Date navigation hook
  const {
    currentMonth,
    isTransitioning: navIsTransitioning,
    transitionDirection,
    navigateToMonth,
    navigateToPrevious: originalNavigateToPrevious,
    navigateToNext: originalNavigateToNext,
    jumpToYear: originalJumpToYear,
    canNavigatePrevious,
    canNavigateNext
  } = useDateNavigation(
    selected instanceof Date ? selected : new Date(),
    minDate,
    maxDate,
    onMonthChange
  );

  // Funciones de navegación simplificadas
  const navigateToPrevious = useCallback(() => {
    setAnimationDirection(-1);
    originalNavigateToPrevious();
  }, [originalNavigateToPrevious]);

  const navigateToNext = useCallback(() => {
    setAnimationDirection(1);
    originalNavigateToNext();
  }, [originalNavigateToNext]);

  const jumpToYear = useCallback((year: number) => {
    setAnimationDirection(year > currentMonth.getFullYear() ? 1 : -1);
    originalJumpToYear(year);
  }, [originalJumpToYear, currentMonth]);

  // Date validation hook - only pass Date arrays
  const disabledDates = Array.isArray(disabled) && disabled.every(d => d instanceof Date) 
    ? disabled as Date[] 
    : undefined;
  const { isDateDisabled, validateDate } = useDateValidation(
    minDate,
    maxDate,
    disabledDates
  );

  // Calculate year range
  const yearRangeCalculated = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return {
      from: yearRange?.from ?? currentYear - 50,
      to: yearRange?.to ?? currentYear + 10
    };
  }, [yearRange]);

  // CustomNav ya no es necesario - ahora renderizamos CustomNavigation directamente

  // Handle date selection with validation
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) {
      onSelect?.(undefined);
      return;
    }

    const validation = validateDate(date);
    if (validation.isValid) {
      onSelect?.(date);
    } else {
      console.warn('Selected date is invalid:', validation.errors);
    }
  }, [onSelect, validateDate]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!keyboardNavEnabled) return;

    const { key, shiftKey, metaKey, ctrlKey } = e;

    // Prevent default for handled keys
    const handledKeys = [
      'PageUp', 'PageDown', 'ArrowLeft', 'ArrowRight', 
      'ArrowUp', 'ArrowDown', 'Home', 'End'
    ];
    
    if (handledKeys.includes(key)) {
      e.preventDefault();
    }

    switch (key) {
      case 'PageUp':
        if (shiftKey) {
          // Navigate to previous year
          const newYear = currentMonth.getFullYear() - 1;
          jumpToYear(newYear);
        } else {
          // Navigate to previous month
          navigateToPrevious();
        }
        break;
      
      case 'PageDown':
        if (shiftKey) {
          // Navigate to next year
          const newYear = currentMonth.getFullYear() + 1;
          jumpToYear(newYear);
        } else {
          // Navigate to next month
          navigateToNext();
        }
        break;
      
      case 'Home':
        if (metaKey || ctrlKey) {
          // Go to current month
          navigateToMonth(new Date());
        }
        break;
      
      case 'Escape':
        // Remove focus from calendar
        if (containerRef.current) {
          containerRef.current.blur();
        }
        break;
    }
  }, [
    keyboardNavEnabled,
    currentMonth,
    navigateToPrevious,
    navigateToNext,
    navigateToMonth,
    jumpToYear
  ]);

  // Handle month transitions - simplified
  // No need for additional state management since we use navIsTransitioning directly

  // Memoized disabled dates function
  const disabledMatcher = useMemo(() => {
    if (typeof disabled === 'function') {
      return disabled;
    }
    
    if (Array.isArray(disabled)) {
      return (date: Date) => disabled.some(d => 
        d instanceof Date && date.toDateString() === d.toDateString()
      );
    }
    
    return (date: Date) => {
      return !isDateInRange(date, minDate, maxDate) || isDateDisabled(date);
    };
  }, [disabled, minDate, maxDate, isDateDisabled]);

  // Container classes
  const containerClasses = useMemo(() => {
    return [
      styles.container,
      styles[currentTheme],
      customClassNames.container,
      className
      // Removed loading class to prevent blocking
    ].filter(Boolean).join(' ');
  }, [currentTheme, customClassNames.container, className]);

  // Month container classes
  const monthContainerClasses = useMemo(() => {
    return [
      styles.monthContainer,
      customClassNames.monthContainer,
      transitionDirection === 'left' ? styles.monthEnter : '',
      transitionDirection === 'right' ? styles.monthEnterFromLeft : ''
    ].filter(Boolean).join(' ');
  }, [customClassNames.monthContainer, transitionDirection]);

  return (
    <motion.div 
      ref={containerRef}
      className={containerClasses}
      onKeyDown={handleKeyDown}
      tabIndex={keyboardNavEnabled ? 0 : -1}
      role="application"
      aria-label="Calendario interactivo"
      aria-roledescription="Navegue con las flechas del teclado, PageUp/PageDown para meses, Shift+PageUp/PageDown para años"
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'fit-content',
        minHeight: 'fit-content',
        maxHeight: 'none',
        width: 'fit-content',
        minWidth: '280px',
        overflow: 'visible'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Navegación manual arriba */}
      <CustomNavigation
        previousMonth={canNavigatePrevious ? getPreviousMonth(currentMonth) : undefined}
        nextMonth={canNavigateNext ? getNextMonth(currentMonth) : undefined}
        onPreviousClick={navigateToPrevious}
        onNextClick={navigateToNext}
        onMonthSelect={navigateToMonth}
        onYearSelect={jumpToYear}
        displayMonth={currentMonth}
        showYearDropdown={showYearDropdown}
        yearRange={yearRangeCalculated}
      />
      
      {/* Calendario sin navegación */}
      <div 
        className={monthContainerClasses}
        style={{
          height: 'fit-content',
          minHeight: 'fit-content',
          maxHeight: 'none',
          width: 'fit-content',
          overflow: 'visible',
          flex: '1'
        }}
      >
        <DayPicker
          mode="single"
          selected={selected instanceof Date ? selected : undefined}
          onSelect={handleDateSelect}
          month={currentMonth}
          onMonthChange={navigateToMonth}
          disabled={disabledMatcher}
          weekStartsOn={weekStartsOn}
          showOutsideDays={true}
          fixedWeeks={true}
          numberOfMonths={1}
          locale={locale}
          labels={SPANISH_LABELS}
          style={{
            height: 'fit-content !important',
            minHeight: 'fit-content !important',
            maxHeight: 'none !important',
            width: 'fit-content !important',
            overflow: 'visible !important'
          }}
          modifiersStyles={{
            outside: { opacity: 0.5 }
          }}
          styles={{
            root: { height: '300px !important', minHeight: '300px !important', overflow: 'visible !important' },
            months: { height: '280px !important', minHeight: '280px !important', overflow: 'visible !important' },
            month: { height: '250px !important', minHeight: '250px !important', overflow: 'visible !important' },
            table: { height: '200px !important', minHeight: '200px !important', overflow: 'visible !important' },
            tbody: { height: '180px !important', minHeight: '180px !important', overflow: 'visible !important' },
            week: { height: '30px !important', minHeight: '30px !important', overflow: 'visible !important' },
            day: { height: '30px !important', minHeight: '30px !important', overflow: 'visible !important' }
          }}
          components={{
            Nav: () => <></>, // Remover navegación del DayPicker
            MonthCaption: () => <></>, // Eliminar título duplicado para hacer el calendario más compacto
          }}
          classNames={{
            month: styles.month,
            table: styles.table,
            day: styles.day,
            nav: customClassNames.nav || styles.nav
          }}
          modifiers={{
            today: new Date(),
            disabled: disabledMatcher,
            outside: (date) => {
              if (!currentMonth) return false;
              const month = currentMonth.getMonth();
              const year = currentMonth.getFullYear();
              return date.getMonth() !== month || date.getFullYear() !== year;
            }
          }}
          modifiersClassNames={{
            today: styles.today,
            selected: styles.selected,
            disabled: styles.disabled,
            outside: styles.outside
          }}
        />
      </div>
    </motion.div>
  );
});

DatePickerComponent.displayName = 'DatePickerComponent'; 