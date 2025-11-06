import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export interface RoleBadgeProps {
  /** Nombre del rol */
  rolNombre: string;
  /** Código del rol */
  rolCodigo: string;
  /** Color del rol */
  color: string;
  /** Orden de aprobación del rol */
  nivel: number;
  /** Tamaño del badge */
  size?: 'sm' | 'md' | 'lg';
  /** Variante del badge */
  variant?: 'default' | 'outlined' | 'filled';
  /** Si debe mostrar el nivel */
  showLevel?: boolean;
  /** Si debe mostrar el código */
  showCode?: boolean;
  /** Función onClick opcional */
  onClick?: () => void;
  /** Clase CSS adicional */
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  rolNombre,
  rolCodigo,
  color,
  nivel,
  size = 'md',
  variant = 'default',
  showLevel = false,
  showCode = false,
  onClick,
  className = ''
}) => {
  const { colors } = useTheme();

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      fontSize: '10px',
      padding: '2px 6px',
      height: '18px',
      iconSize: 10
    },
    md: {
      fontSize: '12px',
      padding: '4px 8px',
      height: '22px',
      iconSize: 12
    },
    lg: {
      fontSize: '14px',
      padding: '6px 12px',
      height: '28px',
      iconSize: 14
    }
  };

  // Configuración de variantes
  const getVariantStyles = () => {
    const alpha = variant === 'filled' ? '1' : '0.15';
    const textColor = variant === 'filled' ? '#FFFFFF' : color;
    const borderColor = variant === 'outlined' ? color : 'transparent';
    
    return {
      backgroundColor: variant === 'outlined' ? 'transparent' : `${color}${alpha === '1' ? '' : '26'}`,
      color: textColor,
      border: `1px solid ${borderColor}`,
      fontWeight: variant === 'filled' ? '600' : '500'
    };
  };

  // Función para obtener el icono del rol
  const getRoleIcon = () => {
    switch (rolCodigo) {
      case 'OWNER':
        return '👑';
      case 'SUPERVISOR':
        return '👥';
      case 'EDITOR':
        return '✏️';
      case 'REVISOR':
        return '👁️';
      case 'CONSULTOR':
        return '🎯';
      default:
        return '📋';
    }
  };

  // Función para obtener el texto del orden de aprobación
  const getOrdenText = () => {
    switch (nivel) {
      case 1:
        return 'O1';
      case 2:
        return 'O2';
      case 3:
        return 'O3';
      case 4:
        return 'O4';
      case 5:
        return 'O5';
      default:
        return `O${nivel}`;
    }
  };

  const currentSize = sizeConfig[size];
  const variantStyles = getVariantStyles();

  return (
    <div
      className={`role-badge ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: currentSize.padding,
        height: currentSize.height,
        borderRadius: '12px',
        fontSize: currentSize.fontSize,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...variantStyles
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${color}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Icono del rol */}
      <span style={{ fontSize: currentSize.iconSize }}>
        {getRoleIcon()}
      </span>

      {/* Código del rol (si se solicita) */}
      {showCode && (
        <span style={{ 
          fontSize: currentSize.fontSize,
          fontWeight: '600',
          opacity: 0.8 
        }}>
          {rolCodigo}
        </span>
      )}

      {/* Nombre del rol */}
      <span style={{ fontSize: currentSize.fontSize }}>
        {rolNombre}
      </span>

      {/* Orden de aprobación del rol (si se solicita) */}
      {showLevel && (
        <span style={{ 
          fontSize: currentSize.fontSize,
          fontWeight: '600',
          opacity: 0.7,
          marginLeft: '2px'
        }}>
          {getOrdenText()}
        </span>
      )}
    </div>
  );
};