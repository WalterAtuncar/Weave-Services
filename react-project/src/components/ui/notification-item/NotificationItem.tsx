import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { StatusIndicator } from '../status-indicator';
import { RoleBadge } from '../role-badge';
import { 
  Bell, 
  BellOff, 
  UserPlus, 
  UserX, 
  AlertCircle, 
  Calendar, 
  RefreshCw,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';

export interface NotificationItemProps {
  /** ID de la notificación */
  notificacionId: number;
  /** Tipo de notificación */
  tipoNotificacion: string;
  /** Título de la notificación */
  titulo: string;
  /** Mensaje de la notificación */
  mensaje: string;
  /** Fecha de envío */
  fechaEnvio: string;
  /** Si está leída */
  leida: boolean;
  /** Si fue enviada */
  enviada: boolean;
  /** Nombre de la entidad */
  entidadNombre?: string;
  /** Nombre del usuario */
  usuarioNombre?: string;
  /** Nombre del rol */
  rolNombre?: string;
  /** Color del rol */
  rolColor?: string;
  /** Código del rol */
  rolCodigo?: string;
  /** Orden de aprobación del rol */
  rolNivel?: number;
  /** Función para marcar como leída */
  onMarkAsRead?: () => void;
  /** Función para eliminar */
  onDelete?: () => void;
  /** Función onClick */
  onClick?: () => void;
  /** Tamaño del item */
  size?: 'sm' | 'md' | 'lg';
  /** Variante del item */
  variant?: 'default' | 'compact';
  /** Clase CSS adicional */
  className?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notificacionId,
  tipoNotificacion,
  titulo,
  mensaje,
  fechaEnvio,
  leida,
  enviada,
  entidadNombre,
  usuarioNombre,
  rolNombre,
  rolColor,
  rolCodigo,
  rolNivel,
  onMarkAsRead,
  onDelete,
  onClick,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const { colors } = useTheme();

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      padding: '8px 12px',
      fontSize: '12px',
      titleSize: '13px',
      iconSize: 14,
      gap: '8px'
    },
    md: {
      padding: '12px 16px',
      fontSize: '13px',
      titleSize: '14px',
      iconSize: 16,
      gap: '12px'
    },
    lg: {
      padding: '16px 20px',
      fontSize: '14px',
      titleSize: '16px',
      iconSize: 18,
      gap: '16px'
    }
  };

  // Obtener configuración del tipo de notificación
  const getNotificationConfig = () => {
    switch (tipoNotificacion) {
      case 'NUEVO_ROL':
        return {
          icon: UserPlus,
          color: '#10B981',
          backgroundColor: '#10B98115',
          priority: 'normal'
        };
      case 'CAMBIO_PROPIETARIO':
        return {
          icon: RefreshCw,
          color: '#3B82F6',
          backgroundColor: '#3B82F615',
          priority: 'high'
        };
      case 'VENCIMIENTO_PROXIMO':
        return {
          icon: Calendar,
          color: '#F59E0B',
          backgroundColor: '#F59E0B15',
          priority: 'high'
        };
      case 'ROL_VENCIDO':
        return {
          icon: AlertCircle,
          color: '#EF4444',
          backgroundColor: '#EF444415',
          priority: 'critical'
        };
      case 'TRANSFERENCIA_ROL':
        return {
          icon: RefreshCw,
          color: '#8B5CF6',
          backgroundColor: '#8B5CF615',
          priority: 'normal'
        };
      case 'REVOCACION_ROL':
        return {
          icon: UserX,
          color: '#EF4444',
          backgroundColor: '#EF444415',
          priority: 'high'
        };
      default:
        return {
          icon: Bell,
          color: '#6B7280',
          backgroundColor: '#6B728015',
          priority: 'normal'
        };
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 60) {
      return `Hace ${minutos} min`;
    } else if (horas < 24) {
      return `Hace ${horas} h`;
    } else if (dias < 7) {
      return `Hace ${dias} d`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  const currentSize = sizeConfig[size];
  const notificationConfig = getNotificationConfig();
  const IconComponent = notificationConfig.icon;

  return (
    <div
      className={`notification-item ${className}`}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: currentSize.gap,
        padding: currentSize.padding,
        backgroundColor: leida ? 'transparent' : `${notificationConfig.color}08`,
        border: `1px solid ${leida ? colors.border : notificationConfig.color}20`,
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        opacity: leida ? 0.8 : 1
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = `${notificationConfig.color}12`;
          e.currentTarget.style.borderColor = `${notificationConfig.color}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = leida ? 'transparent' : `${notificationConfig.color}08`;
          e.currentTarget.style.borderColor = leida ? colors.border : `${notificationConfig.color}20`;
        }
      }}
    >
      {/* Indicador de no leída */}
      {!leida && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: notificationConfig.color,
          animation: 'pulse 2s infinite'
        }} />
      )}

      {/* Icono */}
      <div style={{
        flexShrink: 0,
        width: currentSize.iconSize + 8,
        height: currentSize.iconSize + 8,
        borderRadius: '50%',
        backgroundColor: notificationConfig.backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '2px'
      }}>
        <IconComponent
          size={currentSize.iconSize}
          color={notificationConfig.color}
        />
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '4px'
        }}>
          <h4 style={{
            fontSize: currentSize.titleSize,
            fontWeight: leida ? '500' : '600',
            color: colors.text,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            marginRight: '8px'
          }}>
            {titulo}
          </h4>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}>
            <span style={{
              fontSize: '11px',
              color: colors.textSecondary,
              fontWeight: '500'
            }}>
              {formatearFecha(fechaEnvio)}
            </span>
            {!enviada && (
              <Clock size={10} color={colors.textSecondary} />
            )}
          </div>
        </div>

        {/* Mensaje */}
        <p style={{
          fontSize: currentSize.fontSize,
          color: colors.textSecondary,
          margin: 0,
          marginBottom: '8px',
          lineHeight: '1.4',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: variant === 'compact' ? 1 : 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {mensaje}
        </p>

        {/* Detalles adicionales */}
        {variant !== 'compact' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {entidadNombre && (
              <span style={{
                fontSize: '11px',
                color: colors.textSecondary,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                padding: '2px 6px',
                fontWeight: '500'
              }}>
                {entidadNombre}
              </span>
            )}

            {usuarioNombre && (
              <span style={{
                fontSize: '11px',
                color: colors.textSecondary,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                padding: '2px 6px',
                fontWeight: '500'
              }}>
                👤 {usuarioNombre}
              </span>
            )}

            {rolNombre && rolColor && rolCodigo && rolNivel && (
              <RoleBadge
                rolNombre={rolNombre}
                rolCodigo={rolCodigo}
                color={rolColor}
                nivel={rolNivel}
                size="sm"
                variant="outlined"
              />
            )}
          </div>
        )}

        {/* Acciones */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {!leida && onMarkAsRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                color: colors.primary,
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${colors.primary}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Eye size={10} />
              Marcar leída
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                color: colors.textSecondary,
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${colors.textSecondary}10`;
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              <UserX size={10} />
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Styles para animaciones */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};