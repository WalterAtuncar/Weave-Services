import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DatePickerComponent } from '../calendar/DatePickerComponent';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { cn, dateToLocalString, parseLocalDateString } from '../../../lib/utils';
import * as LucideIcons from "lucide-react";
import "./input.css";

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  requiredText?: boolean;
  icon?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onInvalid?: (e: React.InvalidEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  requiredText = false,
  icon,
  value = '',
  onChange,
  onValueChange,
  onInvalid,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  readonly = false,
  className,
  style,
  onBlur,
  onFocus,
  ...props
}) => {
  const { colors, theme } = useTheme();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0, transform: '' });
  const inputRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Convertir valor string a Date usando función segura
  const selectedDate = parseLocalDateString(value);

  // Obtener el ícono dinámicamente
  const IconComponent = icon ? (LucideIcons as any)[icon] : CalendarIcon;

  // Determinar errores
  const isEmpty = !value || value.trim() === '';
  const hasRequiredError = requiredText && touched && isEmpty;

  useEffect(() => {
    let error = false;
    let message = '';

    if (hasRequiredError) {
      error = true;
      message = label ? `El ${label} es requerido` : 'Este campo es requerido';
    }

    setHasError(error);
    setErrorMessage(message);
  }, [hasRequiredError, label]);

  // Calcular posición del calendario
  const calculateCalendarPosition = () => {
    if (!inputRef.current) return { top: 0, left: 0, width: 0, transform: 'translateY(0)' };
    
    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // 🔧 FIX: No usar scrollY para position fixed - getBoundingClientRect ya incluye scroll
    const calendarHeight = 380; // Altura optimizada del calendario con 6 semanas
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Preferir mostrar abajo, pero si no hay espacio suficiente, mostrar arriba
    const showAbove = spaceBelow < calendarHeight && spaceAbove > calendarHeight;
    
    // 🎯 Calcular posición vertical - FIXED: usar rect.bottom directamente
    let top;
    let transformY = '';
    
    if (showAbove) {
      // 🔧 FIX: Para que el calendario quede pegado ARRIBA del input
      // Posicionar el top en rect.top - 4px y usar transform para moverlo hacia arriba
      top = rect.top - 4;
      transformY = 'translateY(-100%)'; // Mover hacia arriba su propia altura
    } else {
      top = rect.bottom + 4; // 4px de margen abajo (pegado al input)
      transformY = 'translateY(0)';
    }
    
    // 🎯 Calcular posición horizontal
    let left = rect.left;
    
    // Responsive: ajustar ancho según viewport
    const isMobile = viewportWidth <= 768;
    const isSmallMobile = viewportWidth <= 480;
    
    let calendarWidth;
    if (isSmallMobile) {
      calendarWidth = Math.min(viewportWidth - 16, 280); // Ancho optimizado para móvil
    } else if (isMobile) {
      calendarWidth = Math.min(viewportWidth - 32, 300); // Ancho optimizado para tablet
    } else {
      calendarWidth = Math.max(rect.width, 300); // Ancho optimizado para escritorio
    }
    
    // Ajustar si se sale por la derecha
    const rightOverflow = (left + calendarWidth) - viewportWidth;
    if (rightOverflow > 0) {
      left = left - rightOverflow - (isSmallMobile ? 8 : 16);
    }
    
    // Ajustar si se sale por la izquierda
    const minLeft = isSmallMobile ? 8 : 16;
    if (left < minLeft) {
      left = minLeft;
    }
    
    // 🔧 Asegurar que no se vaya fuera de la pantalla
    const maxTop = viewportHeight - calendarHeight - 20; // Margen optimizado
    const minTop = 20; // Margen superior optimizado
    
    return {
      top: Math.min(Math.max(minTop, top), maxTop),
      left: Math.max(minLeft, left),
      width: calendarWidth,
      transform: transformY
    };
  };

  // Abrir/cerrar calendario
  const toggleCalendar = () => {
    if (disabled || readonly) return;
    
    if (!isCalendarOpen) {
      setCalendarPosition(calculateCalendarPosition());
    }
    setIsCalendarOpen(!isCalendarOpen);
  };

  // Manejar selección de fecha
  const handleDateSelect = (date: Date | undefined) => {
    const newValue = date ? dateToLocalString(date) : '';
    
    // Fecha seleccionada en DateInput
    
    // Simular evento de cambio para compatibilidad
    const syntheticEvent = {
      target: {
        value: newValue,
        name: props.name || '',
        type: 'date'
      }
    } as React.ChangeEvent<HTMLInputElement>;

    if (onChange) {
      onChange(syntheticEvent);
    }

    if (onValueChange) {
      onValueChange(newValue);
    }

    setIsCalendarOpen(false);
  };

  // Manejar blur
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setTouched(true);
    setBlurred(true);
    
    if (onBlur) {
      // Simular evento de blur para compatibilidad
      const syntheticEvent = {
        target: {
          value: value,
          name: props.name || '',
          type: 'date'
        }
      } as React.FocusEvent<HTMLInputElement>;
      onBlur(syntheticEvent);
    }
  };

  // Manejar focus
  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (onFocus) {
      // Simular evento de focus para compatibilidad
      const syntheticEvent = {
        target: {
          value: value,
          name: props.name || '',
          type: 'date'
        }
      } as React.FocusEvent<HTMLInputElement>;
      onFocus(syntheticEvent);
    }
  };

  // Cerrar calendario al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Verificar si el click es en el calendario o el input
      const isClickInCalendar = target.closest('[data-calendar-dropdown]');
      const isClickInInput = inputRef.current && inputRef.current.contains(target);
      
      if (isCalendarOpen && !isClickInCalendar && !isClickInInput) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  // Recalcular posición en scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (isCalendarOpen) {
        setCalendarPosition(calculateCalendarPosition());
      }
    };

    if (isCalendarOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isCalendarOpen]);

  // Determinar clase CSS basada en el estado de error y si tiene íconos
  const inputClasses = cn(
    hasError ? "input-default input-error" : "input-default",
    (icon && IconComponent) ? "input-with-icon" : "",
    disabled ? "input-disabled" : "",
    readonly ? "input-readonly" : "",
    "cursor-pointer select-none",
    className,
  );

  // Los estilos se manejan por CSS con data-theme
  const inputStyles = {
    ...(hasError && { borderColor: '#EF4444' }),
    backgroundColor: disabled ? colors.background : colors.surface,
    cursor: disabled || readonly ? 'not-allowed' : 'pointer',
    ...style
  };

  const inputElement = (
    <div className="relative">
      {IconComponent && icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconComponent className="h-4 w-4" style={{ color: colors.textSecondary }} />
        </div>
      )}
      
      <div
        ref={inputRef}
        className={inputClasses}
        style={inputStyles}
        onClick={toggleCalendar}
        onBlur={handleBlur}
        onFocus={handleFocus}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-expanded={isCalendarOpen}
        aria-haspopup="dialog"
        aria-label={label || 'Seleccionar fecha'}
        data-placeholder={!selectedDate}
        {...props}
      >
        <span style={{ 
          color: selectedDate ? colors.text : colors.textSecondary,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          lineHeight: 1
        }}>
          {selectedDate ? selectedDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : placeholder}
        </span>
      </div>

      {/* Indicador de que es clickeable */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <CalendarIcon className="h-4 w-4" style={{ color: colors.textSecondary }} />
      </div>

      {/* Input hidden para validación HTML5 nativa */}
      {(requiredText || props.required) && (
        <input
          type="text"
          value={value || ''}
          onChange={() => {}} // 🔧 FIX: Agregar onChange vacío para evitar warnings
          required
          style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            pointerEvents: 'none'
          }}
          onInvalid={(e) => {
            e.preventDefault();
            setTouched(true);
            setHasError(true);
            setErrorMessage(label ? `${label} es requerido` : "Este campo es requerido");
            if (onInvalid) {
              onInvalid(e);
            }
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );

  // Renderizar calendario usando Portal
  const renderCalendar = () => {
    if (!isCalendarOpen) return null;

    return createPortal(
      <div
        data-calendar-dropdown
        className={`calendar-dropdown ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
        style={{
          position: 'fixed',
          top: calendarPosition.top,
          left: calendarPosition.left,
          width: 'fit-content',
          minWidth: '280px',
          maxWidth: '90vw',
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 99999,
          padding: '4px', // Padding mínimo optimizado
          height: 'fit-content', // Ajustar exactamente al contenido
          overflow: 'visible', // Asegurar que el contenido sea visible
          transform: calendarPosition.transform
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DatePickerComponent
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          showOutsideDays={true}
          weekStartsOn={1}
          className="calendar-in-dropdown"
        />
      </div>,
      document.body
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {inputElement}
      {errorMessage && (
        <p className="text-sm text-red-500" style={{ margin: '4px 0 0 0' }}>{errorMessage}</p>
      )}
      {renderCalendar()}
    </div>
  );
};

export default DateInput;