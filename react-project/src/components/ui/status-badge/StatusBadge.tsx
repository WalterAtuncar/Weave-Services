import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Pause, 
  Play,
  AlertTriangle,
  Info,
  Zap,
  Shield
} from 'lucide-react';

// =============================================
// INTERFACES
// =============================================

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'completed' 
  | 'cancelled' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'success'
  | 'paused'
  | 'running'
  | 'expired'
  | 'critical';

export interface StatusBadgeProps {
  /** Tipo de estado que determina color e ícono */
  status: StatusType;
  /** Texto personalizado (opcional, se infiere del status si no se proporciona) */
  label?: string;
  /** Tamaño del badge */
  size?: 'xs' | 's' | 'm' | 'l';
  /** Variante de visualización */
  variant?: 'filled' | 'outline' | 'subtle' | 'dot';
  /** Si debe mostrar el ícono */
  showIcon?: boolean;
  /** Si debe mostrar el texto */
  showText?: boolean;
  /** Si debe pulsar (animación) */
  pulse?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Título/tooltip */
  title?: string;
  /** Click handler */
  onClick?: () => void;
}

// =============================================
// CONFIGURACIÓN DE ESTADOS
// =============================================

const statusConfig = {
  active: {
    label: 'Activo',
    color: '#10b981',
    icon: CheckCircle,
    bgColor: '#10b981'
  },
  inactive: {
    label: 'Inactivo',
    color: '#6b7280',
    icon: Pause,
    bgColor: '#6b7280'
  },
  pending: {
    label: 'Pendiente',
    color: '#f59e0b',
    icon: Clock,
    bgColor: '#f59e0b'
  },
  completed: {
    label: 'Completado',
    color: '#10b981',
    icon: CheckCircle,
    bgColor: '#10b981'
  },
  cancelled: {
    label: 'Cancelado',
    color: '#ef4444',
    icon: XCircle,
    bgColor: '#ef4444'
  },
  error: {
    label: 'Error',
    color: '#ef4444',
    icon: AlertCircle,
    bgColor: '#ef4444'
  },
  warning: {
    label: 'Advertencia',
    color: '#f59e0b',
    icon: AlertTriangle,
    bgColor: '#f59e0b'
  },
  info: {
    label: 'Información',
    color: '#3b82f6',
    icon: Info,
    bgColor: '#3b82f6'
  },
  success: {
    label: 'Exitoso',
    color: '#10b981',
    icon: CheckCircle,
    bgColor: '#10b981'
  },
  paused: {
    label: 'Pausado',
    color: '#8b5cf6',
    icon: Pause,
    bgColor: '#8b5cf6'
  },
  running: {
    label: 'En Ejecución',
    color: '#06b6d4',
    icon: Play,
    bgColor: '#06b6d4'
  },
  expired: {
    label: 'Vencido',
    color: '#ef4444',
    icon: Clock,
    bgColor: '#ef4444'
  },
  critical: {
    label: 'Crítico',
    color: '#dc2626',
    icon: Shield,
    bgColor: '#dc2626'
  }
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'm',
  variant = 'filled',
  showIcon = true,
  showText = true,
  pulse = false,
  className = '',
  title,
  onClick
}) => {
  const { colors } = useTheme();

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
          iconSize: 10,
          gap: '2px'
        };
      case 's':
        return {
          padding: '4px 8px',
          fontSize: '11px',
          height: '20px',
          iconSize: 12,
          gap: '4px'
        };
      case 'm':
        return {
          padding: '6px 12px',
          fontSize: '12px',
          height: '24px',
          iconSize: 14,
          gap: '6px'
        };
      case 'l':
        return {
          padding: '8px 16px',
          fontSize: '14px',
          height: '32px',
          iconSize: 16,
          gap: '8px'
        };
      default:
        return {
          padding: '6px 12px',
          fontSize: '12px',
          height: '24px',
          iconSize: 14,
          gap: '6px'
        };
    }
  };

  const getStatusConfig = () => {
    return statusConfig[status] || statusConfig.info;
  };

  const getStyles = () => {
    const sizeConfig = getSize();
    const config = getStatusConfig();
    
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
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
      gap: sizeConfig.gap,
      ...sizeConfig
    };

    // Aplicar animación de pulso si está habilitada
    if (pulse) {
      baseStyles.animation = 'pulse 2s infinite';
    }

    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: config.bgColor,
          color: '#ffffff'
        };
      
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: config.color,
          border: `1px solid ${config.color}`
        };
      
      case 'subtle':
        return {
          ...baseStyles,
          backgroundColor: `${config.color}15`,
          color: config.color
        };
      
      case 'dot':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: colors.text,
          padding: showText ? sizeConfig.padding : sizeConfig.gap
        };
      
      default:
        return {
          ...baseStyles,
          backgroundColor: config.bgColor,
          color: '#ffffff'
        };
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // =============================================
  // RENDER
  // =============================================

  const sizeConfig = getSize();
  const config = getStatusConfig();
  const styles = getStyles();
  const displayLabel = label || config.label;
  const IconComponent = config.icon;

  const Component = onClick ? 'button' : 'span';

  return (
    <>
      <Component
        className={className}
        style={styles}
        onClick={handleClick}
        title={title || displayLabel}
      >
        {/* Ícono */}
        {showIcon && (
          <>
            {variant === 'dot' ? (
              <span
                style={{
                  width: `${sizeConfig.iconSize}px`,
                  height: `${sizeConfig.iconSize}px`,
                  borderRadius: '50%',
                  backgroundColor: config.color,
                  flexShrink: 0
                }}
              />
            ) : (
              <IconComponent size={sizeConfig.iconSize} />
            )}
          </>
        )}

        {/* Texto */}
        {showText && <span>{displayLabel}</span>}
      </Component>

      {/* Estilos para animaciones */}
      {pulse && (
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}
        </style>
      )}
    </>
  );
}; 