import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Circle, CheckCircle, AlertCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export type StatusType = 'active' | 'inactive' | 'warning' | 'error' | 'pending' | 'expired';

export interface StatusIndicatorProps {
  /** Tipo de estado */
  status: StatusType;
  /** Texto del estado */
  text?: string;
  /** Tamaño del indicador */
  size?: 'sm' | 'md' | 'lg';
  /** Variante del indicador */
  variant?: 'dot' | 'icon' | 'full';
  /** Si debe mostrar el texto */
  showText?: boolean;
  /** Si debe mostrar animación */
  animated?: boolean;
  /** Función onClick opcional */
  onClick?: () => void;
  /** Clase CSS adicional */
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  text,
  size = 'md',
  variant = 'full',
  showText = true,
  animated = false,
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
      iconSize: 10,
      dotSize: 6
    },
    md: {
      fontSize: '12px',
      padding: '4px 8px',
      height: '22px',
      iconSize: 12,
      dotSize: 8
    },
    lg: {
      fontSize: '14px',
      padding: '6px 12px',
      height: '28px',
      iconSize: 14,
      dotSize: 10
    }
  };

  // Configuración de estados
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: '#10B981',
          backgroundColor: '#10B98115',
          icon: CheckCircle,
          text: text || 'Activo',
          pulse: false
        };
      case 'inactive':
        return {
          color: '#6B7280',
          backgroundColor: '#6B728015',
          icon: Circle,
          text: text || 'Inactivo',
          pulse: false
        };
      case 'warning':
        return {
          color: '#F59E0B',
          backgroundColor: '#F59E0B15',
          icon: AlertTriangle,
          text: text || 'Advertencia',
          pulse: true
        };
      case 'error':
        return {
          color: '#EF4444',
          backgroundColor: '#EF444415',
          icon: XCircle,
          text: text || 'Error',
          pulse: false
        };
      case 'pending':
        return {
          color: '#3B82F6',
          backgroundColor: '#3B82F615',
          icon: Clock,
          text: text || 'Pendiente',
          pulse: true
        };
      case 'expired':
        return {
          color: '#DC2626',
          backgroundColor: '#DC262615',
          icon: AlertCircle,
          text: text || 'Vencido',
          pulse: true
        };
      default:
        return {
          color: '#6B7280',
          backgroundColor: '#6B728015',
          icon: Circle,
          text: text || 'Desconocido',
          pulse: false
        };
    }
  };

  const currentSize = sizeConfig[size];
  const statusConfig = getStatusConfig();
  const IconComponent = statusConfig.icon;

  // Renderizar solo punto
  if (variant === 'dot') {
    return (
      <div
        className={`status-indicator-dot ${className}`}
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        <div
          style={{
            width: currentSize.dotSize,
            height: currentSize.dotSize,
            borderRadius: '50%',
            backgroundColor: statusConfig.color,
            animation: animated && statusConfig.pulse ? 'pulse 2s infinite' : 'none'
          }}
        />
        {showText && (
          <span style={{
            marginLeft: '6px',
            fontSize: currentSize.fontSize,
            color: colors.text,
            fontWeight: '500'
          }}>
            {statusConfig.text}
          </span>
        )}
      </div>
    );
  }

  // Renderizar solo icono
  if (variant === 'icon') {
    return (
      <div
        className={`status-indicator-icon ${className}`}
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        <IconComponent
          size={currentSize.iconSize}
          color={statusConfig.color}
          style={{
            animation: animated && statusConfig.pulse ? 'pulse 2s infinite' : 'none'
          }}
        />
        {showText && (
          <span style={{
            marginLeft: '6px',
            fontSize: currentSize.fontSize,
            color: colors.text,
            fontWeight: '500'
          }}>
            {statusConfig.text}
          </span>
        )}
      </div>
    );
  }

  // Renderizar completo (badge)
  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      <div
        className={`status-indicator-full ${className}`}
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: currentSize.padding,
          height: currentSize.height,
          borderRadius: '12px',
          backgroundColor: statusConfig.backgroundColor,
          border: `1px solid ${statusConfig.color}30`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          animation: animated && statusConfig.pulse ? 'pulse 2s infinite' : 'none'
        }}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 2px 8px ${statusConfig.color}30`;
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <IconComponent
          size={currentSize.iconSize}
          color={statusConfig.color}
        />
        {showText && (
          <span style={{
            fontSize: currentSize.fontSize,
            color: statusConfig.color,
            fontWeight: '500'
          }}>
            {statusConfig.text}
          </span>
        )}
      </div>
    </>
  );
}; 