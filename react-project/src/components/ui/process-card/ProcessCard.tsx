import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Copy, Eye, Shield, Clock, CheckCircle, XCircle, FileText, Activity } from 'lucide-react';
import { EstadoProceso, TipoProceso, CategoriaProceso, getTipoProcesoLabel, getCategoriaProcesoLabel, getEstadoProcesoLabel } from '../../../models/Procesos';
import { StatusBadge } from '../status-badge';
import { ProcessTypeIcon } from '../process-type-icon';
import { Button } from '../button';
import styles from './ProcessCard.module.css';

// Interfaz para el proceso que recibe el componente
export interface ProcessCardProceso {
  procesoId: number;
  codigoProceso: string | null;
  nombreProceso: string;
  descripcion: string | null;
  tipoProceso: number;
  categoriaProceso: number;
  estado: EstadoProceso;
  responsableId?: number | null;
  nombreResponsable?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  version: number;
  duracionEstimada?: number | null;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number | null;
}

export interface ProcessCardProps {
  proceso: ProcessCardProceso;
  onEdit?: (proceso: ProcessCardProceso) => void;
  onDelete?: (proceso: ProcessCardProceso) => void;
  onView?: (proceso: ProcessCardProceso) => void;
  onDuplicate?: (proceso: ProcessCardProceso) => void;
  onExport?: (proceso: ProcessCardProceso) => void;
  onApproval?: (proceso: ProcessCardProceso) => void;
  className?: string;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({
  proceso,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onExport,
  onApproval,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);

  // 🔧 NUEVA LÓGICA: Determinar estado de aprobación basado en el estado del proceso
  const getProcesoEstadoInfo = () => {
    switch (proceso.estado) {
      case -4: // Borrador
        return { 
          estado: 'BORRADOR', 
          color: '#6b7280', 
          icon: <FileText size={14} color="#6b7280" />,
          tooltip: 'Proceso en borrador - Pendiente de envío para aprobación'
        };
      case -3: // IniciarFlujo
        return { 
          estado: 'PENDIENTE', 
          color: '#f59e0b', 
          icon: <Clock size={14} color="#f59e0b" />,
          tooltip: 'Proceso enviado para aprobación - En proceso de revisión'
        };
      case -2: // Pendiente
        return { 
          estado: 'PENDIENTE', 
          color: '#f59e0b', 
          icon: <Clock size={14} color="#f59e0b" />,
          tooltip: 'Proceso en estado pendiente - Esperando aprobación'
        };
      case -1: // Rechazado
        return { 
          estado: 'RECHAZADO', 
          color: '#ef4444', 
          icon: <XCircle size={14} color="#ef4444" />,
          tooltip: 'Proceso rechazado - Requiere correcciones antes de reenviar'
        };
      case 0: // Inactivo
        return { 
          estado: 'INACTIVO', 
          color: '#6b7280', 
          icon: <XCircle size={14} color="#6b7280" />,
          tooltip: 'Proceso inactivo - No disponible para uso'
        };
      case 1: // Activo
        return { 
          estado: 'APROBADO', 
          color: '#10b981', 
          icon: <CheckCircle size={14} color="#10b981" />,
          tooltip: 'Proceso aprobado y activo - Disponible para uso'
        };
      default:
        return { 
          estado: 'SIN_ESTADO', 
          color: '#6b7280', 
          icon: null,
          tooltip: 'Estado del proceso no definido'
        };
    }
  };

  const estadoInfo = getProcesoEstadoInfo();

  // Generar tooltip detallado para el proceso
  const getProcessTooltip = () => {
    const baseInfo = `Proceso: ${proceso.nombreProceso}\nCódigo: ${proceso.codigoProceso}`;
    const tipoInfo = `Tipo: ${getTipoProcesoLabel(proceso.tipoProceso)}`;
    const categoriaInfo = `Categoría: ${getCategoriaProcesoLabel(proceso.categoriaProceso)}`;
    const estadoText = `Estado: ${estadoInfo.estado}`;
    const descInfo = proceso.descripcion ? `\nDescripción: ${proceso.descripcion}` : '';
    const responsableInfo = proceso.nombreResponsable ? `\nResponsable: ${proceso.nombreResponsable}` : '';

    return `${baseInfo}\n${tipoInfo}\n${categoriaInfo}\n${estadoText}${descInfo}${responsableInfo}`;
  };

  const handleCardClick = () => {
    if (onView) {
      onView(proceso);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowActions(false);
  };

  return (
    <div 
      className={`${styles.processCard} ${className}`}
      onClick={handleCardClick}
      title={getProcessTooltip()}
    >
      {/* Header with icon and status */}
      <div className={styles.cardHeader}>
        <div className={styles.iconAndTitle}>
          <ProcessTypeIcon 
            tipo={proceso.tipoProceso} 
            size={24} 
            title={`Tipo: ${getTipoProcesoLabel(proceso.tipoProceso)}`}
          />
          <div className={styles.titleContainer}>
            <h3 className={styles.processName}>{proceso.nombreProceso}</h3>
            <span className={styles.processCode}>{proceso.codigoProceso}</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <StatusBadge
            status={proceso.estado === EstadoProceso.Activo ? 'active' : 'inactive'}
            size="s"
            className={styles.headerStatusBadge}
            title={`Estado general: ${getEstadoProcesoLabel(proceso.estado)}`}
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
              title="Acciones del proceso"
            >
              <MoreVertical size={16} />
            </Button>

            {showActions && (
              <div className={styles.actionsMenu}>
                {onView && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onView(proceso))}
                    title="Ver detalles del proceso"
                  >
                    <Eye size={16} />
                    Ver Detalles
                  </button>
                )}
                {onEdit && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onEdit(proceso))}
                    title="Editar proceso"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                )}
                {onApproval && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onApproval(proceso))}
                    title="Seguimiento de aprobación"
                  >
                    <Shield size={16} />
                    Seguimiento
                  </button>
                )}
                {onDuplicate && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onDuplicate(proceso))}
                    title="Duplicar proceso"
                  >
                    <Copy size={16} />
                    Duplicar
                  </button>
                )}
                {onExport && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onExport(proceso))}
                    title="Exportar proceso"
                  >
                    <FileText size={16} />
                    Exportar
                  </button>
                )}
                {onDelete && (
                  <button
                    className={`${styles.actionItem} ${styles.deleteAction}`}
                    onClick={(e) => handleActionClick(e, () => onDelete(proceso))}
                    title="Eliminar proceso"
                  >
                    <Trash2 size={16} />
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
        {proceso.descripcion && (
          <p className={styles.processDescription} title={proceso.descripcion}>
            {proceso.descripcion}
          </p>
        )}

        <div className={styles.processMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tipo:</span>
            <span className={styles.metaValue} title={`Tipo de proceso: ${getTipoProcesoLabel(proceso.tipoProceso)}`}>
              {getTipoProcesoLabel(proceso.tipoProceso)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Categoría:</span>
            <span className={styles.metaValue} title={`Categoría de proceso: ${getCategoriaProcesoLabel(proceso.categoriaProceso)}`}>
              {getCategoriaProcesoLabel(proceso.categoriaProceso)}
            </span>
          </div>
          {proceso.nombreResponsable && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Responsable:</span>
              <span className={styles.metaValue} title={`Responsable: ${proceso.nombreResponsable}`}>
                {proceso.nombreResponsable}
              </span>
            </div>
          )}
          {proceso.fechaCreacion && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Creado:</span>
              <span className={styles.metaValue} title={`Fecha de creación: ${new Date(proceso.fechaCreacion).toLocaleDateString()}`}>
                {new Date(proceso.fechaCreacion).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.footerLabel}>
            Última actualización: {proceso.fechaActualizacion ? new Date(proceso.fechaActualizacion).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};