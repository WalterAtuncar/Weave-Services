import React from 'react';
import { 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  ArrowRight,
  Zap,
  Shield,
  Gauge,
  Play,
  Pause,
  MoreVertical
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  EstadoInstanciaWorkflow, 
  PrioridadWorkflow, 
  InstanciaWorkflow 
} from '../../../models/Workflow';
import styles from './WorkflowCard.module.css';

interface WorkflowCardProps {
  /** Datos del workflow */
  workflow: InstanciaWorkflow & {
    asignadoNombre?: string;
    iniciadoPorNombre?: string;
    tipoAccionLabel?: string;
    entidadTipoLabel?: string;
  };
  /** Callback al hacer click en el card */
  onClick?: (workflowId: number) => void;
  /** Callback para acciones del menú */
  onAction?: (action: string, workflowId: number) => void;
  /** Mostrar acciones */
  showActions?: boolean;
  /** Modo compacto */
  compact?: boolean;
  /** Mostrar progreso detallado */
  showProgress?: boolean;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onClick,
  onAction,
  showActions = true,
  compact = false,
  showProgress = true
}) => {
  const { colors, theme } = useTheme();

  // Obtener color según el estado
  const getEstadoColor = (estado: EstadoInstanciaWorkflow) => {
    switch (estado) {
      case EstadoInstanciaWorkflow.COMPLETADO:
        return '#10B981';
      case EstadoInstanciaWorkflow.EN_PROCESO:
        return '#3B82F6';
      case EstadoInstanciaWorkflow.PENDIENTE_APROBACION:
        return '#F59E0B';
      case EstadoInstanciaWorkflow.ESCALADO:
        return '#EF4444';
      case EstadoInstanciaWorkflow.ERROR:
        return '#DC2626';
      case EstadoInstanciaWorkflow.PAUSADO:
        return '#6B7280';
      case EstadoInstanciaWorkflow.CANCELADO:
        return '#9CA3AF';
      default:
        return colors.primary;
    }
  };

  // Obtener icono según el estado
  const getEstadoIcon = (estado: EstadoInstanciaWorkflow) => {
    const iconProps = { size: 16, className: styles.estadoIcon };
    
    switch (estado) {
      case EstadoInstanciaWorkflow.COMPLETADO:
        return <CheckCircle {...iconProps} />;
      case EstadoInstanciaWorkflow.EN_PROCESO:
        return <Play {...iconProps} />;
      case EstadoInstanciaWorkflow.PENDIENTE_APROBACION:
        return <Clock {...iconProps} />;
      case EstadoInstanciaWorkflow.ESCALADO:
        return <AlertTriangle {...iconProps} />;
      case EstadoInstanciaWorkflow.ERROR:
        return <XCircle {...iconProps} />;
      case EstadoInstanciaWorkflow.PAUSADO:
        return <Pause {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  // Obtener color de prioridad
  const getPrioridadColor = (prioridad: PrioridadWorkflow) => {
    switch (prioridad) {
      case PrioridadWorkflow.CRITICA:
        return '#DC2626';
      case PrioridadWorkflow.URGENTE:
        return '#EF4444';
      case PrioridadWorkflow.ALTA:
        return '#F59E0B';
      case PrioridadWorkflow.NORMAL:
        return '#6B7280';
      case PrioridadWorkflow.BAJA:
        return '#9CA3AF';
      default:
        return '#6B7280';
    }
  };

  // Obtener etiqueta del estado
  const getEstadoLabel = (estado: EstadoInstanciaWorkflow) => {
    switch (estado) {
      case EstadoInstanciaWorkflow.INICIADO:
        return 'Iniciado';
      case EstadoInstanciaWorkflow.EN_PROCESO:
        return 'En Proceso';
      case EstadoInstanciaWorkflow.PENDIENTE_APROBACION:
        return 'Pendiente Aprobación';
      case EstadoInstanciaWorkflow.ESPERANDO_RESPUESTA:
        return 'Esperando Respuesta';
      case EstadoInstanciaWorkflow.ESCALADO:
        return 'Escalado';
      case EstadoInstanciaWorkflow.APROBADO:
        return 'Aprobado';
      case EstadoInstanciaWorkflow.RECHAZADO:
        return 'Rechazado';
      case EstadoInstanciaWorkflow.PAUSADO:
        return 'Pausado';
      case EstadoInstanciaWorkflow.CANCELADO:
        return 'Cancelado';
      case EstadoInstanciaWorkflow.COMPLETADO:
        return 'Completado';
      case EstadoInstanciaWorkflow.ERROR:
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  // Calcular tiempo transcurrido
  const getTiempoTranscurrido = () => {
    const dias = Math.floor(workflow.tiempoTranscurridoMinutos / (24 * 60));
    const horas = Math.floor((workflow.tiempoTranscurridoMinutos % (24 * 60)) / 60);
    
    if (dias > 0) {
      return `${dias}d ${horas}h`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${workflow.tiempoTranscurridoMinutos}m`;
    }
  };

  // Formatear fecha
  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const estadoColor = getEstadoColor(workflow.estado);
  const prioridadColor = getPrioridadColor(workflow.prioridad);

  const handleCardClick = () => {
    if (onClick) {
      onClick(workflow.instanciaWorkflowId);
    }
  };

  const handleActionClick = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction(action, workflow.instanciaWorkflowId);
    }
  };

  return (
    <div
      className={`
        ${styles.workflowCard}
        ${compact ? styles.compact : ''}
        ${onClick ? styles.clickable : ''}
      `}
      onClick={handleCardClick}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderLeftColor: estadoColor
      }}
    >
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.workflowInfo}>
            <h3 className={styles.workflowTitle} style={{ color: colors.text }}>
              {workflow.nombre}
            </h3>
            <div className={styles.workflowMeta}>
              <span className={styles.workflowCode} style={{ color: colors.textSecondary }}>
                {workflow.codigo}
              </span>
              <span className={styles.separator} style={{ color: colors.border }}>•</span>
              <span className={styles.entidadInfo} style={{ color: colors.textSecondary }}>
                {workflow.entidadTipoLabel || workflow.entidadTipo} - {workflow.entidadNombre}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Badge de prioridad */}
          <div 
            className={styles.prioridadBadge}
            style={{
              backgroundColor: `${prioridadColor}20`,
              color: prioridadColor,
              borderColor: `${prioridadColor}40`
            }}
          >
            <Zap size={12} />
            {workflow.prioridad}
          </div>

          {/* Menú de acciones */}
          {showActions && (
            <button
              className={styles.actionButton}
              onClick={(e) => handleActionClick('menu', e)}
              style={{ color: colors.textSecondary }}
            >
              <MoreVertical size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Estado y progreso */}
      <div className={styles.statusSection}>
        <div className={styles.estadoContainer}>
          <div 
            className={styles.estadoBadge}
            style={{
              backgroundColor: `${estadoColor}20`,
              color: estadoColor,
              borderColor: `${estadoColor}40`
            }}
          >
            {getEstadoIcon(workflow.estado)}
            {getEstadoLabel(workflow.estado)}
          </div>

          {showProgress && (
            <div className={styles.progresoContainer}>
              <div className={styles.progresoInfo}>
                <Gauge size={14} color={colors.textSecondary} />
                <span style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                  {workflow.progreso}% completado
                </span>
              </div>
              <div className={styles.progresoBar}>
                <div 
                  className={styles.progresoFill}
                  style={{
                    width: `${workflow.progreso}%`,
                    backgroundColor: estadoColor
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Descripción */}
      {!compact && workflow.descripcion && (
        <p className={styles.descripcion} style={{ color: colors.textSecondary }}>
          {workflow.descripcion}
        </p>
      )}

      {/* Información adicional */}
      <div className={styles.infoGrid}>
        {/* Asignado a */}
        {workflow.asignadoNombre && (
          <div className={styles.infoItem}>
            <User size={14} color={colors.textSecondary} />
            <span style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
              Asignado a: <strong style={{ color: colors.text }}>{workflow.asignadoNombre}</strong>
            </span>
          </div>
        )}

        {/* Tiempo transcurrido */}
        <div className={styles.infoItem}>
          <Clock size={14} color={colors.textSecondary} />
          <span style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
            Tiempo: <strong style={{ color: colors.text }}>{getTiempoTranscurrido()}</strong>
          </span>
        </div>

        {/* Fecha de inicio */}
        <div className={styles.infoItem}>
          <Calendar size={14} color={colors.textSecondary} />
          <span style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
            Iniciado: <strong style={{ color: colors.text }}>{formatFecha(workflow.fechaInicio)}</strong>
          </span>
        </div>

        {/* Fecha límite */}
        {workflow.fechaFinProgramada && (
          <div className={styles.infoItem}>
            <AlertTriangle size={14} color="#F59E0B" />
            <span style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
              Límite: <strong style={{ color: '#F59E0B' }}>{formatFecha(workflow.fechaFinProgramada)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Footer con acciones rápidas */}
      {showActions && !compact && (
        <div className={styles.cardFooter}>
          <div className={styles.quickActions}>
            <button
              className={styles.quickAction}
              onClick={(e) => handleActionClick('view', e)}
              style={{ color: colors.primary }}
            >
              <ArrowRight size={14} />
              Ver Detalles
            </button>

            {workflow.estado === EstadoInstanciaWorkflow.PENDIENTE_APROBACION && (
              <button
                className={styles.quickAction}
                onClick={(e) => handleActionClick('approve', e)}
                style={{ color: '#10B981' }}
              >
                <CheckCircle size={14} />
                Aprobar
              </button>
            )}

            {(workflow.estado === EstadoInstanciaWorkflow.EN_PROCESO || 
              workflow.estado === EstadoInstanciaWorkflow.PENDIENTE_APROBACION) && (
              <button
                className={styles.quickAction}
                onClick={(e) => handleActionClick('pause', e)}
                style={{ color: '#F59E0B' }}
              >
                <Pause size={14} />
                Pausar
              </button>
            )}
          </div>

          {/* Indicador de gobernanza */}
          <div className={styles.governanceIndicator}>
            <Shield size={12} color={colors.textSecondary} />
            <span style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
              Gobernanza activa
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 