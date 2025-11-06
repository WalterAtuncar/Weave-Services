import React, { forwardRef, useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertCircle, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// =============================================
// INTERFACES
// =============================================

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Etiqueta del campo */
  label?: string;
  /** Texto de ayuda */
  helperText?: string;
  /** Mensaje de error */
  error?: string;
  /** Si el campo es requerido */
  required?: boolean;
  /** Tamaño del textarea */
  size?: 's' | 'm' | 'l';
  /** Si muestra el contador de caracteres */
  showCounter?: boolean;
  /** Límite máximo de caracteres */
  maxLength?: number;
  /** Si el textarea se redimensiona automáticamente */
  autoResize?: boolean;
  /** Altura mínima en píxeles */
  minHeight?: number;
  /** Altura máxima en píxeles */
  maxHeight?: number;
  /** Clase CSS adicional */
  className?: string;
  /** Nombre del icono de Lucide para mostrar */
  icon?: string;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  error,
  required = false,
  size = 'm',
  showCounter = false,
  maxLength,
  autoResize = false,
  minHeight,
  maxHeight,
  className = '',
  value,
  onChange,
  rows = 3,
  icon,
  ...props
}, ref) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  // Obtener el ícono dinámicamente
  const IconComponent = icon ? (LucideIcons as any)[icon] : null;

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const getSizeConfig = () => {
    switch (size) {
      case 's':
        return {
          fontSize: '13px',
          padding: '8px 12px',
          borderRadius: '6px'
        };
      case 'm':
        return {
          fontSize: '14px',
          padding: '10px 14px',
          borderRadius: '8px'
        };
      case 'l':
        return {
          fontSize: '16px',
          padding: '12px 16px',
          borderRadius: '8px'
        };
      default:
        return {
          fontSize: '14px',
          padding: '10px 14px',
          borderRadius: '8px'
        };
    }
  };

  const getTextareaStyles = (): React.CSSProperties => {
    const sizeConfig = getSizeConfig();
    
    return {
      width: '100%',
      fontFamily: 'inherit',
      backgroundColor: colors.background,
      border: `1px solid ${error ? '#ef4444' : isFocused ? colors.primary : colors.border}`,
      color: colors.text,
      transition: 'all 0.2s ease',
      outline: 'none',
      resize: autoResize ? 'none' : 'vertical',
      minHeight: minHeight ? `${minHeight}px` : undefined,
      maxHeight: maxHeight ? `${maxHeight}px` : undefined,
      ...sizeConfig
    };
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Auto-resize logic
    if (autoResize) {
      const textarea = e.target;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      
      if (minHeight && scrollHeight < minHeight) {
        textarea.style.height = `${minHeight}px`;
      } else if (maxHeight && scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
      } else {
        textarea.style.height = `${scrollHeight}px`;
      }
    }

    onChange?.(e);
  };

  const characterCount = typeof value === 'string' ? value.length : 0;
  const isOverLimit = maxLength ? characterCount > maxLength : false;

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.text,
            marginBottom: '6px'
          }}
        >
          {label}
          {required && (
            <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
          )}
        </label>
      )}

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        {IconComponent && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '12px',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            <IconComponent size={16} color={colors.textSecondary} />
          </div>
        )}
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={rows}
          maxLength={maxLength}
          style={{
            ...getTextareaStyles(),
            paddingLeft: icon ? '36px' : undefined
          }}
          {...props}
        />

        {/* Ícono de error */}
        {error && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              pointerEvents: 'none'
            }}
          >
            <AlertCircle size={16} color="#ef4444" />
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px',
          minHeight: '16px'
        }}
      >
        {/* Helper text o error */}
        <div style={{ flex: 1 }}>
          {error ? (
            <div
              style={{
                fontSize: '12px',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AlertCircle size={12} />
              {error}
            </div>
          ) : helperText ? (
            <div
              style={{
                fontSize: '12px',
                color: colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <HelpCircle size={12} />
              {helperText}
            </div>
          ) : null}
        </div>

        {/* Contador de caracteres */}
        {showCounter && (
          <div
            style={{
              fontSize: '12px',
              color: isOverLimit ? '#ef4444' : colors.textSecondary,
              fontWeight: '500',
              marginLeft: '8px'
            }}
          >
            {characterCount}{maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';