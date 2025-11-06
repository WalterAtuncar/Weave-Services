import React from 'react';
import { MoreVertical, Edit, Trash2, Copy, Eye, Shield, Clock, CheckCircle, XCircle, FileText, Activity, Users, GitBranch } from 'lucide-react';
import { StatusBadge } from '../status-badge';
import { Button } from '../button';
import styles from './ProcesoCard.module.css';

// Interfaces para Procesos
interface Proceso {
  procesoId: number;
  organizacionId: number;
  codigoProceso: string | null;
  nombreProceso: string;
  descripcion: string | null;
  objetivos?: string | null; // Agregado para coincidir con el modelo
  procesoDepende: number | null;
  tipoProceso: number;
  categoriaProceso: number;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number | null;
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  responsable?: string | null;
  duracionEstimada?: number | null;
  procesoDepende_Nombre?: string;
  subprocesos?: Proceso[];
  // New backend properties
  tipoProcesoName?: string;
  rutaJerarquica?: string;
  padreId?: number | null;
  padreName?: string | null;
  ordenProceso?: number;
  // Nuevos campos mapeados
  nombreTipoProceso?: string;
  descripcionProceso?: string | null;
  nombrePadre?: string | null;
}

export interface ProcesoCardProps {
  proceso: Proceso;
  onEdit?: (proceso: Proceso) => void;
  onDelete?: (proceso: Proceso) => void;
  onGovernance?: (proceso: Proceso) => void;
  onApprovalTracking?: (proceso: Proceso) => void;
  className?: string;
}

export const ProcesoCard: React.FC<ProcesoCardProps> = ({
  proceso,
  onEdit,
  onDelete,
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
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  const getHierarchyType = () => {
    if (proceso.procesoDepende) {
      return 'child';
    }
    return 'independent';
  };

  // Determinar estado de aprobación basado en el estado del proceso
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

  const getTipoProcesoLabel = (tipo: number) => {
    // Priorizar nombreTipoProceso desde backend; fallback a tipoProcesoName y valores por defecto
    if (proceso.nombreTipoProceso) {
      return proceso.nombreTipoProceso;
    }
    if (proceso.tipoProcesoName) {
      return proceso.tipoProcesoName;
    }
    switch (tipo) {
      case 1: return 'Estratégico';
      case 2: return 'Operativo';
      case 3: return 'Soporte';
      default: return 'No definido';
    }
  };

  const getCategoriaProcesoLabel = (categoria: number) => {
    switch (categoria) {
      case 1: return 'Gestión';
      case 2: return 'Control';
      case 3: return 'Mejora';
      default: return 'No definida';
    }
  };

  const getProcesoTypeIcon = (tipo: number) => {
    switch (tipo) {
      case 1: return <Activity size={24} color="#3b82f6" />; // Estratégico
      case 2: return <GitBranch size={24} color="#10b981" />; // Operativo
      case 3: return <Shield size={24} color="#f59e0b" />; // Soporte
      default: return <FileText size={24} color="#6b7280" />;
    }
  };

  const estadoInfo = getProcesoEstadoInfo();

  // Generar tooltip detallado para el proceso
  const getProcesoTooltip = () => {
    const baseInfo = `Proceso: ${proceso.nombreProceso}\nCódigo: ${proceso.codigoProceso}`;
    const tipoInfo = `Tipo: ${getTipoProcesoLabel(proceso.tipoProceso)}`;
    const estadoText = `Estado: ${estadoInfo.estado}`;
    const descInfo = (proceso.objetivos ?? proceso.descripcion) ? `\nDescripción: ${proceso.objetivos ?? proceso.descripcion}` : '';
    const responsableInfo = proceso.responsable ? `\nResponsable: ${proceso.responsable}` : '';
    const duracionInfo = proceso.duracionEstimada ? `\nDuración: ${proceso.duracionEstimada} días` : '';
    const dependenciaInfo = proceso.procesoDepende_Nombre ? `\nDepende de: ${proceso.procesoDepende_Nombre}` : '';

    return `${baseInfo}\n${tipoInfo}\n${estadoText}${descInfo}${responsableInfo}${duracionInfo}${dependenciaInfo}`;
  };

  const handleCardClick = () => {
    // Card click functionality removed - no longer opens modal
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowActions(false);
  };

  return (
    <div 
      className={`${styles.procesoCard} ${className}`}
      title={getProcesoTooltip()}
    >
      {/* Header with icon and status */}
      <div className={styles.cardHeader}>
        <div className={styles.iconAndTitle}>
          {getProcesoTypeIcon(proceso.tipoProceso)}
          <div className={styles.titleContainer}>
            <h3 className={styles.procesoName}>{proceso.nombreProceso}</h3>
            <span className={styles.procesoCode}>{proceso.codigoProceso}</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <StatusBadge
            status={proceso.estado === 1 ? 'active' : 'inactive'}
            size="s"
            className={styles.headerStatusBadge}
            title={`Estado general: ${proceso.estado === 1 ? 'Activo' : 'Inactivo'}`}
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

            {/* Menú de acciones */}
            {showActions && (
              <div className={styles.actionsMenu}>
                {onEdit && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onEdit(proceso))}
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                )}
                {onGovernance && proceso.tieneGobernanzaPropia && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onGovernance(proceso))}
                  >
                    <Shield size={16} />
                    Gobernanza
                  </button>
                )}
                {onApprovalTracking && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onApprovalTracking(proceso))}
                  >
                    <Activity size={16} />
                    Seguimiento
                  </button>
                )}
                <div className={styles.actionDivider} />
                {onDelete && (
                  <button
                    className={`${styles.actionItem} ${styles.dangerAction}`}
                    onClick={(e) => handleActionClick(e, () => onDelete(proceso))}
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
          <p className={styles.procesoDescription}>{proceso.descripcion}</p>
        )}

        <div className={styles.procesoMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tipo:</span>
            <span className={styles.metaValue}>{getTipoProcesoLabel(proceso.tipoProceso)}</span>
          </div>
          <div className={`${styles.metaItem} ${styles.metaItemDescription}`}>
            <span className={styles.metaLabel}>Descripción:</span>
            <span className={styles.metaValueDescription}>{proceso.objetivos ?? proceso.descripcion ?? 'Sin descripción'}</span>
          </div>
          {proceso.responsable && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Responsable:</span>
              <span className={styles.metaValue}>{proceso.responsable}</span>
            </div>
          )}
          {proceso.duracionEstimada && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Duración:</span>
              <span className={styles.metaValue}>{proceso.duracionEstimada} días</span>
            </div>
          )}
          {proceso.subprocesos && proceso.subprocesos.length > 0 && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Subprocesos:</span>
              <span className={styles.metaValue}>{proceso.subprocesos.length}</span>
            </div>
          )}
          {proceso.padreName && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Proceso Padre:</span>
              <span className={styles.metaValue}>{proceso.padreName}</span>
            </div>
          )}
          {proceso.nombrePadre && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Padre:</span>
              <span className={styles.metaValue}>{proceso.nombrePadre}</span>
            </div>
          )}
          {proceso.ordenProceso !== undefined && proceso.ordenProceso !== null && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Orden:</span>
              <span className={styles.metaValue}>{proceso.ordenProceso}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.footerBadges}>
          {proceso.tieneGobernanzaPropia ? (
            <div className={styles.governanceBadge} title="Proceso con gobernanza propia">
              <Users size={12} />
              <span>Gobierno</span>
            </div>
          ) : (
            <div className={styles.dependencyBadge} title="Proceso sin gobernanza propia">
              <GitBranch size={12} />
              <span>Sin Gobierno</span>
            </div>
          )}
        </div>
        
        <div className={styles.footerDate}>
          <span className={styles.dateLabel}>Creado:</span>
          <span className={styles.dateValue}>
            {new Date(proceso.fechaCreacion).toLocaleDateString('es-PE')}
          </span>
        </div>
      </div>
    </div>
  );
};