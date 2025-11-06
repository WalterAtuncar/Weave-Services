import React from 'react';
import { MoreVertical, Edit, Trash2, Copy, Eye, Clock, CheckCircle, XCircle, FileText, Activity } from 'lucide-react';
import { Sistema, EstadoSistema, getTipoSistemaLabel, getFamiliaSistemaLabel, getEstadoSistemaLabel } from '../../../models/Sistemas';
import { StatusBadge } from '../status-badge';
import { SystemTypeIcon } from '../system-type-icon';
import { HierarchyIndicator } from '../hierarchy-indicator';
import { Button } from '../button';

import styles from './SystemCard.module.css';

export interface SystemCardProps {
  sistema: Sistema;
  onEdit?: (sistema: Sistema) => void;
  onDelete?: (sistema: Sistema) => void;
  onView?: (sistema: Sistema) => void;
  onGovernance?: (sistema: Sistema) => void;
  onApprovalTracking?: (sistema: Sistema) => void;
  className?: string;
}

export const SystemCard: React.FC<SystemCardProps> = ({
  sistema,
  onEdit,
  onDelete,
  onView,
  onGovernance,
  onApprovalTracking,
  className = ''
}) => {
  const [showActions, setShowActions] = React.useState(false);

  // Efecto para cerrar el menú cuando se hace clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActions) {
        const target = event.target as Element;
        if (!target.closest(`.${styles.actionsContainer}`)) {
          setShowActions(false);
        }
      }
    };

    if (showActions) {
      // Usar setTimeout para evitar que el clic que abre el menú lo cierre inmediatamente
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  const getHierarchyType = () => {
    if (sistema.sistemaDepende) {
      return 'child';
    }
    // Verificar si tiene sistemas hijos (esto se haría con los mocks)
    return 'independent';
  };

  // 🔧 NUEVA LÓGICA: Determinar estado de aprobación basado en el estado del sistema
  const getSistemaEstadoInfo = () => {
    switch (sistema.estado) {
      case -4: // Borrador
        return { 
          estado: 'BORRADOR', 
          color: '#6b7280', 
          icon: <FileText size={14} color="#6b7280" />,
          tooltip: 'Sistema en borrador - Pendiente de envío para aprobación'
        };
      case -3: // IniciarFlujo
        return { 
          estado: 'PENDIENTE', 
          color: '#f59e0b', 
          icon: <Clock size={14} color="#f59e0b" />,
          tooltip: 'Sistema enviado para aprobación - En proceso de revisión'
        };
      case -2: // Pendiente
        return { 
          estado: 'PENDIENTE', 
          color: '#f59e0b', 
          icon: <Clock size={14} color="#f59e0b" />,
          tooltip: 'Sistema en estado pendiente - Esperando aprobación'
        };
      case -1: // Rechazado
        return { 
          estado: 'RECHAZADO', 
          color: '#ef4444', 
          icon: <XCircle size={14} color="#ef4444" />,
          tooltip: 'Sistema rechazado - Requiere correcciones antes de reenviar'
        };
      case 0: // Inactivo
        return { 
          estado: 'INACTIVO', 
          color: '#6b7280', 
          icon: <XCircle size={14} color="#6b7280" />,
          tooltip: 'Sistema inactivo - No disponible para uso'
        };
      case 1: // Activo
        return { 
          estado: 'APROBADO', 
          color: '#10b981', 
          icon: <CheckCircle size={14} color="#10b981" />,
          tooltip: 'Sistema aprobado y activo - Disponible para uso'
        };
      default:
        return { 
          estado: 'SIN_ESTADO', 
          color: '#6b7280', 
          icon: null,
          tooltip: 'Estado del sistema no definido'
        };
    }
  };

  const estadoInfo = getSistemaEstadoInfo();

  // Generar tooltip detallado para el sistema
  const getSystemTooltip = () => {
    const baseInfo = `Sistema: ${sistema.nombreSistema}\nCódigo: ${sistema.codigoSistema}`;
    const tipoInfo = `Tipo: ${getTipoSistemaLabel(sistema.tipoSistema)}`;
    const familiaInfo = `Familia: ${getFamiliaSistemaLabel(sistema.familiaSistema)}`;
    const estadoText = `Estado: ${estadoInfo.estado}`;
    const descInfo = sistema.funcionPrincipal ? `\nDescripción: ${sistema.funcionPrincipal}` : '';
    const modulosInfo = sistema.modulos && sistema.modulos.length > 0 ? `\nMódulos: ${sistema.modulos.length}` : '';
    const dependenciaInfo = sistema.sistemaDepende_Nombre ? `\nDepende de: ${sistema.sistemaDepende_Nombre}` : '';

    return `${baseInfo}\n${tipoInfo}\n${familiaInfo}\n${estadoText}${descInfo}${modulosInfo}${dependenciaInfo}`;
  };

  const handleCardClick = () => {
    if (onView) {
      onView(sistema);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowActions(false);
  };

  return (
    <div 
      className={`${styles.systemCard} ${className}`}
      onClick={handleCardClick}
      title={getSystemTooltip()}
    >
      {/* Header with icon and status */}
      <div className={styles.cardHeader}>
        <div className={styles.iconAndTitle}>
          <SystemTypeIcon 
            familia={sistema.familiaSistema} 
            size={24} 
            title={`Familia: ${getFamiliaSistemaLabel(sistema.familiaSistema)}`}
          />
          <div className={styles.titleContainer}>
            <h3 className={styles.systemName}>{sistema.nombreSistema}</h3>
            <span className={styles.systemCode}>{sistema.codigoSistema}</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <StatusBadge
            status={sistema.estado === EstadoSistema.Activo ? 'active' : 'inactive'}
            size="s"
            className={styles.headerStatusBadge}
            title={`Estado general: ${getEstadoSistemaLabel(sistema.estado)}`}
          />

          {/* Indicador de estado de aprobación */}
          {estadoInfo.estado !== 'SIN_ESTADO' && (
            <div 
              className={styles.approvalStatus}
              style={{ 
                backgroundColor: `${estadoInfo.color}15`,
                borderColor: estadoInfo.color,
                color: estadoInfo.color
              }}
              title={estadoInfo.tooltip}
            >
              {estadoInfo.icon}
            </div>
          )}
          
          <div className={styles.actionsContainer}>
            <Button
              variant="ghost"
              size="s"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className={styles.actionsButton}
              title="Acciones del sistema"
            >
              <MoreVertical size={16} />
            </Button>

            {showActions && (
              <div className={styles.actionsMenu}>
                {onView && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onView(sistema))}
                    title="Ver detalles completos del sistema"
                  >
                    <Eye size={14} />
                    Ver detalles
                  </button>
                )}
                {/* Opción "Gobierno" eliminada del menú contextual */}
                {onApprovalTracking && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onApprovalTracking(sistema))}
                    title="Ver seguimiento del proceso de aprobación"
                  >
                    <Activity size={14} />
                    Seguimiento de Aprobación
                  </button>
                )}
                {onEdit && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onEdit(sistema))}
                    title="Editar configuración del sistema"
                  >
                    <Edit size={14} />
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    className={`${styles.actionItem} ${styles.deleteAction}`}
                    onClick={(e) => handleActionClick(e, () => onDelete(sistema))}
                    title="Eliminar sistema (acción irreversible)"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <p className={styles.systemDescription}>
          {sistema.funcionPrincipal || 'Sin descripción disponible'}
        </p>

        <div className={styles.systemMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tipo:</span>
            <span className={styles.metaValue} title={`Tipo de sistema: ${getTipoSistemaLabel(sistema.tipoSistema)}`}>
              {getTipoSistemaLabel(sistema.tipoSistema)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Familia:</span>
            <span className={styles.metaValue} title={`Familia de sistema: ${getFamiliaSistemaLabel(sistema.familiaSistema)}`}>
              {getFamiliaSistemaLabel(sistema.familiaSistema)}
            </span>
          </div>
          {sistema.modulos && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Módulos:</span>
              <span className={styles.metaValue} title={`Número de módulos: ${sistema.modulos.length}`}>
                {sistema.modulos.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer with hierarchy */}
      <div className={styles.cardFooter}>
        <HierarchyIndicator
          type={getHierarchyType()}
          dependencyName={sistema.sistemaDepende_Nombre}
          size="sm"
          showLabel={sistema.sistemaDepende !== null}
          title={sistema.sistemaDepende_Nombre ? `Depende de: ${sistema.sistemaDepende_Nombre}` : 'Sistema independiente'}
        />
      </div>
    </div>
  );
};