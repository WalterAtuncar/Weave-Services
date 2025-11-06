import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CustomNavigationProps } from '../types/DatePickerTypes';
import { YearDropdown } from './YearDropdown';
import { getSpanishMonthName } from '../utils/dateUtils';
import { useTheme } from '../../../../contexts/ThemeContext';

export const CustomNavigation: React.FC<CustomNavigationProps> = React.memo(({
  previousMonth,
  nextMonth,
  onPreviousClick,
  onNextClick,
  onMonthSelect,
  onYearSelect,
  displayMonth,
  showYearDropdown = true,
  yearRange = {
    from: new Date().getFullYear() - 50,
    to: new Date().getFullYear() + 10
  }
}) => {
  const { theme } = useTheme();
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const handleYearSelect = useCallback((year: number) => {
    if (onYearSelect) {
      // Usar onYearSelect específicamente para cambios de año
      onYearSelect(year);
    } else if (onMonthSelect && displayMonth) {
      // Fallback al método anterior si onYearSelect no está disponible
      const currentMonth = displayMonth.getMonth();
      const newMonth = new Date(year, currentMonth, 1);
      onMonthSelect(newMonth);
    }
    // No cerramos aquí - lo maneja YearDropdown con onToggle
  }, [onYearSelect, onMonthSelect, displayMonth]);

  const toggleYearDropdown = useCallback(() => {
    setIsYearDropdownOpen(prev => !prev);
  }, []);

  const baseNavClasses = `
    flex items-center justify-between
    px-2 py-1.5
    border-b
    position-relative
    z-10
    min-h-10
    ${theme === 'dark' 
      ? 'border-gray-700 bg-gray-800' 
      : 'border-gray-200 bg-gray-50'
    }
  `;

  const buttonClasses = `
    flex items-center justify-center
    w-6 h-6
    rounded-full
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${theme === 'dark'
      ? 'text-gray-300 hover:bg-gray-700 hover:text-white disabled:hover:bg-transparent'
      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:hover:bg-transparent'
    }
  `;

  const titleClasses = `
    flex items-center
    space-x-1.5
    text-sm font-semibold
    min-h-6
    ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}
  `;

  const monthNameClasses = `
    ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}
  `;

  return (
    <nav 
      className={baseNavClasses}
      role="navigation" 
      aria-label="Navegación del calendario"
    >
      {/* Previous Month Button */}
      <motion.button
        type="button"
        onClick={onPreviousClick}
        disabled={!previousMonth}
        className={buttonClasses}
        aria-label={`Ir al mes anterior${previousMonth ? `: ${getSpanishMonthName(previousMonth)} ${previousMonth.getFullYear()}` : ''}`}
        title={previousMonth ? `${getSpanishMonthName(previousMonth)} ${previousMonth.getFullYear()}` : 'No disponible'}
                 whileHover={{ 
           scale: previousMonth ? 1.05 : 1
         }}
         whileTap={{ 
           scale: previousMonth ? 0.98 : 1 
         }}
         transition={{ 
           duration: 0.15, 
           ease: "easeOut" 
         }}
      >
        <motion.svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          animate={{ 
            x: previousMonth ? 0 : 0,
            opacity: previousMonth ? 1 : 0.4
          }}
          transition={{ duration: 0.2 }}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </motion.svg>
      </motion.button>

      {/* Month and Year Display */}
      <div className={titleClasses}>
        <span className={monthNameClasses}>
          {getSpanishMonthName(displayMonth)}
        </span>
        
        {showYearDropdown ? (
          <YearDropdown
            currentYear={displayMonth?.getFullYear() || new Date().getFullYear()}
            yearRange={yearRange}
            onYearSelect={handleYearSelect}
            isOpen={isYearDropdownOpen}
            onToggle={toggleYearDropdown}
            className="ml-2"
          />
        ) : (
          <span className={monthNameClasses}>
            {displayMonth?.getFullYear() || new Date().getFullYear()}
          </span>
        )}
      </div>

      {/* Next Month Button */}
      <motion.button
        type="button"
        onClick={onNextClick}
        disabled={!nextMonth}
        className={buttonClasses}
        aria-label={`Ir al mes siguiente${nextMonth ? `: ${getSpanishMonthName(nextMonth)} ${nextMonth.getFullYear()}` : ''}`}
        title={nextMonth ? `${getSpanishMonthName(nextMonth)} ${nextMonth.getFullYear()}` : 'No disponible'}
                 whileHover={{ 
           scale: nextMonth ? 1.05 : 1
         }}
         whileTap={{ 
           scale: nextMonth ? 0.98 : 1 
         }}
         transition={{ 
           duration: 0.15, 
           ease: "easeOut" 
         }}
      >
        <motion.svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          animate={{ 
            x: nextMonth ? 0 : 0,
            opacity: nextMonth ? 1 : 0.4
          }}
          transition={{ duration: 0.2 }}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </motion.svg>
      </motion.button>
    </nav>
  );
}); 