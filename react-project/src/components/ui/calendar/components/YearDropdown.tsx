import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YearDropdownProps } from '../types/DatePickerTypes';
import { generateYearRange } from '../utils/dateUtils';
import { useTheme } from '../../../../contexts/ThemeContext';

export const YearDropdown: React.FC<YearDropdownProps> = React.memo(({
  currentYear,
  yearRange,
  onYearSelect,
  isOpen,
  onToggle,
  className = ''
}) => {
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate years with memoization for performance
  const years = useMemo(() => {
    if (!isOpen && !isInitialized) return []; // Lazy loading
    return generateYearRange(yearRange.from, yearRange.to);
  }, [yearRange.from, yearRange.to, isOpen, isInitialized]);

  // Initialize on first open
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  // Focus management
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const currentYearIndex = years.indexOf(currentYear);
      if (currentYearIndex !== -1) {
        setFocusedIndex(currentYearIndex);
        
        // Scroll to current year
        const yearElement = dropdownRef.current.children[currentYearIndex] as HTMLElement;
        if (yearElement) {
          yearElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    }
  }, [isOpen, currentYear, years]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < years.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      
      case 'End':
        e.preventDefault();
        setFocusedIndex(years.length - 1);
        break;
      
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < years.length) {
          handleYearSelect(years[focusedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        onToggle();
        buttonRef.current?.focus();
        break;
    }
  }, [isOpen, years, focusedIndex, onToggle]);

  // Handle year selection
  const handleYearSelect = useCallback((year: number) => {
    onYearSelect(year);
    onToggle();
    buttonRef.current?.focus();
  }, [onYearSelect, onToggle]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && dropdownRef.current) {
      const focusedElement = dropdownRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [focusedIndex, isOpen]);

  const baseClasses = `
    relative inline-block
    ${className}
  `;

  const buttonClasses = `
    flex items-center justify-between
    px-2 py-1
    text-xs font-medium
    border rounded-md
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${theme === 'dark' 
      ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-blue-500' 
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
    }
    ${isOpen ? 'ring-2 ring-blue-500' : ''}
  `;

  const dropdownClasses = `
    absolute top-full left-0 mt-0.5
    w-16 max-h-40
    bg-white dark:bg-gray-800
    border border-gray-300 dark:border-gray-600
    rounded-md shadow-lg
    z-50
    overflow-y-auto
    transition-all duration-200
    ${isOpen 
      ? 'opacity-100 scale-100' 
      : 'opacity-0 scale-95 pointer-events-none'
    }
  `;

  const yearItemClasses = (year: number, index: number) => `
    px-2 py-1
    text-xs
    cursor-pointer
    transition-colors duration-150
    ${year === currentYear 
      ? theme === 'dark'
        ? 'bg-blue-600 text-white'
        : 'bg-blue-500 text-white'
      : theme === 'dark'
        ? 'text-gray-200 hover:bg-gray-700'
        : 'text-gray-700 hover:bg-gray-100'
    }
    ${index === focusedIndex 
      ? theme === 'dark'
        ? 'bg-gray-700'
        : 'bg-gray-100'
      : ''
    }
  `;

  return (
    <div 
      className={baseClasses}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className={buttonClasses}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Año actual: ${currentYear}. Haga clic para seleccionar un año diferente.`}
      >
        <span>{currentYear}</span>
        <svg 
          className={`w-3 h-3 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {/* Dropdown content - Only render when initialized */}
      <AnimatePresence>
        {isOpen && isInitialized && (
          <motion.div
            ref={dropdownRef}
            className={dropdownClasses}
            role="listbox"
            aria-label="Seleccionar año"
            tabIndex={-1}
                         initial={{ 
               opacity: 0, 
               y: -4
             }}
             animate={{ 
               opacity: 1, 
               y: 0
             }}
             exit={{ 
               opacity: 0, 
               y: -4
             }}
             transition={{ 
               duration: 0.15, 
               ease: "easeOut" 
             }}
          >
            {years.map((year, index) => (
              <motion.div
                key={year}
                className={yearItemClasses(year, index)}
                role="option"
                aria-selected={year === currentYear}
                onClick={() => handleYearSelect(year)}
                onMouseEnter={() => setFocusedIndex(index)}
                                 whileHover={{ 
                   backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                 }}
                 whileTap={{ scale: 0.98 }}
                 transition={{ duration: 0.1 }}
                 initial={{ opacity: 0 }}
                 animate={{ 
                   opacity: 1,
                   transition: { 
                     delay: index * 0.01,
                     duration: 0.15 
                   }
                 }}
              >
                {year}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}); 