import React, { useState, useEffect } from 'react';
import { Input, InputProps } from './input';
import { useTheme } from '../../../contexts/ThemeContext';

export interface InputWrapperProps extends Omit<InputProps, 'label' | 'requiredText'> {
  label: string;
  requiredText?: boolean;
  required?: boolean; // Agregar soporte para required nativo
  icon?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string | null; // 🔧 Prop para error externo
  helperText?: string; // 🔧 Prop para texto de ayuda
}

export const InputWrapper: React.FC<InputWrapperProps> = ({
  label,
  requiredText = false,
  required = false,
  icon,
  value = '',
  onValueChange,
  onChange,
  onBlur,
  onFocus,
  onInvalid,
  type = 'text',
  error = null, // 🔧 Prop error externo
  helperText, // 🔧 Prop helperText
  ...props
}) => {
  const { colors } = useTheme();
  const [touched, setTouched] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Función para validar formato de email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Determinar errores
  const isEmpty = !value || value.toString().trim() === '';
  const isEmailType = type === 'email';
  const hasEmailFormatError = isEmailType && blurred && !isEmpty && !isValidEmail(value.toString());
  const hasRequiredError = (requiredText || required) && touched && isEmpty;

  useEffect(() => {
    let hasErrorState = false;
    let message = '';

    // 🔧 Prioridad 1: Error externo (pasado como prop)
    if (error) {
      hasErrorState = true;
      message = error;
    }
    // Prioridad 2: Validaciones internas
    else if (hasRequiredError) {
      hasErrorState = true;
      message = `${label} es requerido`;
    } else if (hasEmailFormatError) {
      hasErrorState = true;
      message = 'Ingrese el formato correcto';
    }

    setHasError(hasErrorState);
    setErrorMessage(message);
  }, [error, hasRequiredError, hasEmailFormatError, label]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Si el usuario está escribiendo y ya había un error de formato, lo limpiamos
    if (blurred && hasEmailFormatError && newValue.trim() !== '') {
      setBlurred(false);
    }
    
    if (onValueChange) {
      onValueChange(newValue);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    setBlurred(true);
    
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevenir el mensaje nativo del navegador
    setTouched(true);
    setHasError(true);
    
    // Usar el mensaje de validación nativo o uno personalizado
    const validityState = e.target.validity;
    let message = '';
    
    if (validityState.valueMissing) {
      message = `${label} es requerido`;
    } else if (validityState.typeMismatch && type === 'email') {
      message = 'Ingrese el formato correcto';
    } else {
      message = e.target.validationMessage || 'Campo inválido';
    }
    
    setErrorMessage(message);
    
    if (onInvalid) {
      onInvalid(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label 
        className="block text-sm font-medium"
        style={{ color: colors.text }}
      >
        {label}
        {(requiredText || required) && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Input
        type={type}
        icon={icon}
        value={value}
        required={required || requiredText} // Usar required nativo
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onInvalid={handleInvalid}
        style={{
          borderColor: hasError ? '#EF4444' : colors.border,
          boxShadow: hasError ? '0 0 0 1px #EF4444' : undefined,
        }}
        {...props}
      />
      
      {/* 🔧 Mostrar error con prioridad, sino mostrar helperText */}
      {errorMessage ? (
        <p className="text-sm text-red-500" style={{ margin: 0, fontSize: '12px' }}>
          {errorMessage}
        </p>
      ) : helperText ? (
        <p 
          className="text-sm" 
          style={{ 
            margin: 0, 
            fontSize: '12px',
            color: colors.textSecondary,
            fontStyle: 'italic'
          }}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}; 