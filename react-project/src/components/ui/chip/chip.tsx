import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { X, Monitor } from 'lucide-react';
import './chip.css';

// =============================================
// INTERFACES
// =============================================

export interface ChipProps {
  /** Texto a mostrar en el chip */
  label: string;
  /** Descripción o subtítulo del chip */
  description?: string;
  /** Color del chip - puede ser hex, nombre de color o del tema */
  color?: string;
  /** Tamaño del chip */
  size?: 'xs' | 's' | 'm' | 'l';
  /** Variante del chip */
  variant?: 'filled' | 'outline' | 'subtle';
  /** Si el chip es removible */
  removable?: boolean;
  /** Función cuando se remueve el chip */
  onRemove?: () => void;
  /** Si el chip está deshabilitado */
  disabled?: boolean;
  /** Ícono opcional al inicio */
  icon?: React.ReactNode;
  /** Si mostrar ícono de servidor por defecto */
  showServerIcon?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Título/tooltip */
  title?: string;
  /** Click handler */
  onClick?: () => void;
  /** Si el chip está seleccionado */
  selected?: boolean;
  /** Tipo de chip para estilos específicos */
  type?: 'server' | 'system' | 'default';
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const Chip: React.FC<ChipProps> = ({
  label,
  description,
  color,
  size = 'm',
  variant = 'filled',
  removable = false,
  onRemove,
  disabled = false,
  icon,
  showServerIcon = false,
  className = '',
  title,
  onClick,
  selected = false,
  type = 'default'
}) => {
  const { colors, theme } = useTheme();

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const getSize = () => {
    switch (size) {
      case 'xs':
        return {
          padding: '4px 8px',
          fontSize: '11px',
          height: '20px',
          iconSize: 12,
          gap: '4px'
        };
      case 's':
        return {
          padding: '6px 10px',
          fontSize: '12px',
          height: '24px',
          iconSize: 14,
          gap: '6px'
        };
      case 'm':
        return {
          padding: '8px 12px',
          fontSize: '13px',
          height: '28px',
          iconSize: 16,
          gap: '8px'
        };
      case 'l':
        return {
          padding: '10px 16px',
          fontSize: '14px',
          height: '36px',
          iconSize: 18,
          gap: '10px'
        };
      default:
        return {
          padding: '8px 12px',
          fontSize: '13px',
          height: '28px',
          iconSize: 16,
          gap: '8px'
        };
    }
  };

  const getChipColor = () => {
    // Si se proporciona un color específico, usarlo
    if (color) {
      // Si es un color hex
      if (color.startsWith('#')) {
        return color;
      }
      // Si es un color del tema
      if (color === 'primary') return colors.primary;
      if (color === 'success') return '#10b981';
      if (color === 'warning') return '#f59e0b';
      if (color === 'error') return '#ef4444';
      if (color === 'info') return '#3b82f6';
      // Si es cualquier otro color
      return color;
    }

    // Para una apariencia empresarial, usar siempre el color primario
    return colors.primary;
  };

  const getStyles = () => {
    const sizeConfig = getSize();
    const chipColor = getChipColor();
    
    const baseStyles: React.CSSProperties = {
      ...sizeConfig
    };

    // Estilos base según la variante
    let variantStyles: React.CSSProperties = {};
    
    switch (variant) {
      case 'filled':
        variantStyles = {
          backgroundColor: chipColor,
          color: theme === 'dark' ? colors.background : '#ffffff'
        };
        break;
      
      case 'outline':
        variantStyles = {
          backgroundColor: 'transparent',
          color: theme === 'dark' ? colors.text : chipColor,
          border: `1px solid ${theme === 'dark' ? colors.text : chipColor}`
        };
        break;
      
      case 'subtle':
        variantStyles = {
          backgroundColor: theme === 'light' ? `${chipColor}15` : `${chipColor}25`,
          color: theme === 'dark' ? colors.text : chipColor,
          border: `1px solid ${theme === 'light' ? `${chipColor}30` : `${chipColor}40`}`
        };
        break;
      
      default:
        variantStyles = {
          backgroundColor: chipColor,
          color: theme === 'dark' ? colors.background : '#ffffff'
        };
    }

    return {
      ...baseStyles,
      ...variantStyles
    };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    onRemove?.();
  };

  // =============================================
  // RENDER
  // =============================================

  const sizeConfig = getSize();
  const styles = getStyles();

  const Component = onClick ? 'button' : 'span';
  const chipClasses = [
    'chip',
    selected ? 'selected' : '',
    disabled ? 'disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component
      className={chipClasses}
      style={styles}
      onClick={handleClick}
      title={title}
      disabled={disabled}
    >
      {/* Ícono de servidor por defecto o ícono personalizado */}
      {(showServerIcon || icon) && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon ? (
            React.isValidElement(icon) 
              ? React.cloneElement(icon as React.ReactElement, { 
                  size: sizeConfig.iconSize 
                })
              : icon
          ) : showServerIcon ? (
            <Monitor size={sizeConfig.iconSize} />
          ) : null}
        </span>
      )}

      {/* Contenido del chip */}
      <div className="chip-content">
        {/* Texto principal */}
        <span className="chip-label">{label}</span>
        
        {/* Descripción si existe - solo mostrar para chips de servidor */}
        {description && type === 'server' && (
          <span className="chip-description">
            {description}
          </span>
        )}
      </div>

      {/* Botón de remover */}
      {removable && !disabled && (
        <span
          className="chip-remove-button"
          onClick={handleRemove}
          title="Remover"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleRemove(e as any);
            }
          }}
        >
          <X size={sizeConfig.iconSize - 2} />
        </span>
      )}
    </Component>
  );
};