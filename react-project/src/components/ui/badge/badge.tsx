import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { X } from 'lucide-react';

// =============================================
// INTERFACES
// =============================================

export interface BadgeProps {
  /** Contenido del badge */
  children?: React.ReactNode;
  /** Texto a mostrar en el badge (alternativa a children) */
  label?: string;
  /** Color del badge - puede ser hex, nombre de color o del tema */
  color?: string;
  /** Tamaño del badge */
  size?: 'xs' | 's' | 'm' | 'l';
  /** Variante del badge */
  variant?: 'filled' | 'outline' | 'subtle' | 'success' | 'secondary' | 'danger' | 'info' | 'warning';
  /** Si el badge es removible */
  removable?: boolean;
  /** Función cuando se remueve el badge */
  onRemove?: () => void;
  /** Si el badge está deshabilitado */
  disabled?: boolean;
  /** Ícono opcional al inicio */
  icon?: React.ReactNode;
  /** Clase CSS adicional */
  className?: string;
  /** Título/tooltip */
  title?: string;
  /** Click handler */
  onClick?: () => void;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const Badge: React.FC<BadgeProps> = ({
  children,
  label,
  color,
  size = 'm',
  variant = 'filled',
  removable = false,
  onRemove,
  disabled = false,
  icon,
  className = '',
  title,
  onClick
}) => {
  const { colors, theme } = useTheme();

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const getSize = () => {
    switch (size) {
      case 'xs':
        return {
          padding: '2px 6px',
          fontSize: '10px',
          height: '16px',
          iconSize: 10
        };
      case 's':
        return {
          padding: '4px 8px',
          fontSize: '11px',
          height: '20px',
          iconSize: 12
        };
      case 'm':
        return {
          padding: '6px 12px',
          fontSize: '12px',
          height: '24px',
          iconSize: 14
        };
      case 'l':
        return {
          padding: '8px 16px',
          fontSize: '14px',
          height: '32px',
          iconSize: 16
        };
      default:
        return {
          padding: '6px 12px',
          fontSize: '12px',
          height: '24px',
          iconSize: 14
        };
    }
  };

  const getBadgeColor = () => {
    const isDark = theme === 'dark';
    
    // Si se proporciona un color específico, usarlo
    if (color) {
      // Si es un color hex
      if (color.startsWith('#')) {
        return color;
      }
      // Si es un color del tema, ajustar para modo oscuro
      if (color === 'primary') {
        return isDark ? '#6366f1' : colors.primary;
      }
      if (color === 'success') return isDark ? '#22c55e' : '#10b981';
      if (color === 'warning') return isDark ? '#f59e0b' : '#f59e0b';
      if (color === 'error') return isDark ? '#ef4444' : '#ef4444';
      if (color === 'info') return isDark ? '#3b82f6' : '#3b82f6';
      // Si es cualquier otro color
      return color;
    }

    // Colores basados en variante
    switch (variant) {
      case 'success':
        return isDark ? '#22c55e' : '#10b981';
      case 'danger':
        return isDark ? '#ef4444' : '#ef4444';
      case 'warning':
        return isDark ? '#f59e0b' : '#f59e0b';
      case 'info':
        return isDark ? '#3b82f6' : '#3b82f6';
      case 'secondary':
        return isDark ? '#6b7280' : '#6b7280';
      default:
        // Color por defecto ajustado para tema oscuro
        return isDark ? '#6366f1' : colors.primary;
    }
  };

  const getStyles = () => {
    const sizeConfig = getSize();
    const badgeColor = getBadgeColor();
    
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      borderRadius: '12px',
      fontWeight: '500',
      fontFamily: 'inherit',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
      cursor: onClick ? 'pointer' : 'default',
      userSelect: 'none',
      border: 'none',
      outline: 'none',
      ...sizeConfig
    };

    if (disabled) {
      return {
        ...baseStyles,
        opacity: 0.5,
        cursor: 'not-allowed'
      };
    }

    switch (variant) {
      case 'filled':
      case 'success':
      case 'danger':
      case 'warning':
      case 'info':
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: badgeColor,
          color: '#ffffff'
        };
      
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: badgeColor,
          border: `1px solid ${badgeColor}`
        };
      
      case 'subtle':
        const isDark = theme === 'dark';
        return {
          ...baseStyles,
          backgroundColor: isDark ? `${badgeColor}25` : `${badgeColor}15`,
          color: badgeColor,
          border: isDark ? `1px solid ${badgeColor}40` : 'none'
        };
      
      default:
        return {
          ...baseStyles,
          backgroundColor: badgeColor,
          color: '#ffffff'
        };
    }
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

  return (
    <Component
      className={className}
      style={styles}
      onClick={handleClick}
      title={title}
      disabled={disabled}
    >
      {/* Ícono opcional */}
      {icon && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {(() => {
            const commonProps = { size: sizeConfig.iconSize, style: { display: 'block' } } as const;
            // Si es un elemento React, clonar con tamaño
            if (React.isValidElement(icon)) {
              return React.cloneElement(icon as React.ReactElement, commonProps);
            }
            const maybeComp: any = icon;
            // Si es un componente funcional/clase
            if (typeof maybeComp === 'function') {
              const Comp = maybeComp as React.ComponentType<any>;
              return <Comp {...commonProps} />;
            }
            // Si es un componente forwardRef/exotic (objeto con $$typeof o render)
            if (typeof maybeComp === 'object' && maybeComp !== null && ('render' in maybeComp || '$$typeof' in maybeComp)) {
              const Comp = maybeComp as React.ComponentType<any>;
              return <Comp {...commonProps} />;
            }
            // En último caso, renderizar tal cual (texto, etc.)
            return icon;
          })()}
        </span>
      )}

      {/* Contenido del badge */}
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {typeof children === 'string' || typeof children === 'number' ? children : 
         typeof label === 'string' || typeof label === 'number' ? label : 
         React.isValidElement(children) ? children : 
         React.isValidElement(label) ? label : 
         String(children || label || '')}
      </span>

      {/* Botón de remover */}
      {removable && !disabled && (
        <button
          onClick={handleRemove}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.7,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          title="Remover"
        >
          <X size={sizeConfig.iconSize} />
        </button>
      )}
    </Component>
  );
};