import * as React from "react";
import { cn } from "../../../lib/utils";
import * as LucideIcons from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import DateInput from "./DateInput";
import "./input.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  requiredText?: boolean;
  min?: number;
  max?: number;
  icon?: string;
  onInvalid?: (event: React.InvalidEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, requiredText = false, min, max, icon, id, onBlur, onChange, onFocus, onInvalid, style, ...props }, ref) => {
    const { colors } = useTheme();
    
    // 📅 Si el tipo es 'date', usar el componente DateInput personalizado
    if (type === "date") {
      // Filtrar props para DateInput
      const { value, defaultValue, ...dateInputProps } = props;
      
      return (
        <DateInput
          label={label}
          requiredText={requiredText}
          icon={icon}
          value={value ? value.toString() : ''}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onInvalid={onInvalid}
          placeholder={dateInputProps.placeholder}
          disabled={dateInputProps.disabled}
          readonly={dateInputProps.readOnly}
          className={className}
          style={style}
          {...dateInputProps}
        />
      );
    }
    const [touched, setTouched] = React.useState(false);
    const [blurred, setBlurred] = React.useState(false);
    const [value, setValue] = React.useState(props.defaultValue || props.value || "");
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);

    // Generar un id único si no se proporciona uno
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Efecto para actualizar el estado interno cuando cambien las props
    React.useEffect(() => {
      if (props.value !== undefined) {
        setValue(props.value);
      }
    }, [props.value]);

    // Obtener el ícono dinámicamente
    const IconComponent = icon ? (LucideIcons as any)[icon] : null;

    // Determinar el tipo real del input (para password toggle)
    const actualType = type === "password" && showPassword ? "text" : type;
    const isPasswordType = type === "password";

    // Color dinámico para iconos basado en el tema
    const iconColor = colors.textSecondary;

    // Función para validar formato de email
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Función para auto-corregir valores numéricos
    const autoCorrectNumber = (inputValue: string | number) => {
      if (type !== "number" || (!min && min !== 0) && (!max && max !== 0)) {
        return inputValue;
      }

      const numValue = Number(inputValue);
      
      // Si no es un número válido, no hacer corrección
      if (isNaN(numValue)) {
        return inputValue;
      }

      // Auto-corregir si está fuera del rango
      if (min !== undefined && numValue < min) {
        return min.toString();
      }
      
      if (max !== undefined && numValue > max) {
        return max.toString();
      }

      return inputValue;
    };

    // Función para toggle de contraseña
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Determinar errores
    const isEmpty = !value || value.toString().trim() === "";
    const isEmailType = type === "email";
    const hasEmailFormatError = isEmailType && blurred && !isEmpty && !isValidEmail(value.toString());
    const hasRequiredError = requiredText && touched && isEmpty;

    React.useEffect(() => {
      let error = false;
      let message = "";

      if (hasRequiredError) {
        error = true;
        message = label ? `El ${label} es requerido` : "Este campo es requerido";
      } else if (hasEmailFormatError) {
        error = true;
        message = "ingrese el formato correcto";
      }

      setHasError(error);
      setErrorMessage(message);
    }, [hasRequiredError, hasEmailFormatError, label]);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      setBlurred(true);
      
      // Auto-corregir en blur para números
      if (type === "number") {
        const correctedValue = autoCorrectNumber(e.target.value);
        if (correctedValue !== e.target.value) {
          setValue(correctedValue);
          // Actualizar el valor del input directamente
          e.target.value = correctedValue.toString();
        }
      }
      
      if (onBlur) {
        onBlur(e);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Para números, permitir valores temporales durante la escritura
      // pero auto-corregir si se sale mucho del rango
      if (type === "number") {
        const correctedValue = autoCorrectNumber(newValue);
        setValue(correctedValue);
        
        // Si se auto-corrigió, actualizar el input
        if (correctedValue !== newValue) {
          e.target.value = correctedValue.toString();
        }
      } else {
        setValue(newValue);
      }
      
      // Si el usuario está escribiendo y ya había un error de formato, lo limpiamos
      if (blurred && hasEmailFormatError && newValue.trim() !== "") {
        setBlurred(false);
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onFocus) {
        onFocus(e);
      }
    };

    // Determinar clase CSS basada en el estado de error y si tiene íconos
    const inputClasses = cn(
      hasError ? "input-default input-error" : "input-default",
      icon ? "input-with-icon" : "",
      isPasswordType ? "input-with-password-toggle" : "",
      className,
    );

    // Los estilos se manejan por CSS con data-theme
    const inputStyles = {
      ...(hasError && { borderColor: '#EF4444' }),
      ...style
    };

    const inputElement = (
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconComponent className="h-4 w-4" style={{ color: iconColor }} />
          </div>
        )}
        <input
          id={inputId}
          type={actualType}
          min={type === "number" ? min : undefined}
          max={type === "number" ? max : undefined}
          className={inputClasses}
          style={inputStyles}
          ref={ref}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onInvalid={onInvalid}
          {...props}
        />
        {isPasswordType && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="focus:outline-none transition-colors"
              style={{ 
                color: iconColor,
              }}
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <LucideIcons.EyeOff className="h-4 w-4" />
              ) : (
                <LucideIcons.Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    );

    // Si no hay label, devolver solo el input
    if (!label) {
      return inputElement;
    }

    // Si hay label, devolver el conjunto completo
    return (
      <div className="space-y-2">
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium"
          style={{ color: colors.text }}
        >
          {label}
          {requiredText && <span className="text-red-500 ml-1">*</span>}
          {type === "number" && (min !== undefined || max !== undefined) && (
            <span 
              className="text-xs ml-2"
              style={{ color: colors.textSecondary }}
            >
              ({min !== undefined && `min: ${min}`}{min !== undefined && max !== undefined && ", "}{max !== undefined && `max: ${max}`})
            </span>
          )}
        </label>
        {inputElement}
        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input }; 