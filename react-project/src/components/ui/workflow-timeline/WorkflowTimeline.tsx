import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  User,
  Calendar,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { EstadoPasoWorkflow, PasoInstanciaWorkflow } from '../../../models/Workflow';
import styles from './WorkflowTimeline.module.css';

interface WorkflowTimelineProps {
  /** Pasos del workflow */
  pasos: (PasoInstanciaWorkflow & {
    nombre: string;
    descripcion: string;
    tipo: string;
    asignadoNombre?: string;
    procesadoPorNombre?: string;
  })[];
  /** Paso actualmente activo */
  currentStep?: number;
  /** Mostrar detalles completos */
  showDetails?: boolean;
  /** Callback cuando se hace click en un paso */
  onStepClick?: (pasoId: number) => void;
  /** Modo compacto */
  compact?: boolean;
  /** Orientación */
  orientation?: 'vertical' | 'horizontal';
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  pasos,
  currentStep,
  showDetails = true,
  onStepClick,
  compact = false,
  orientation = 'vertical'
}) => {
  const { colors, theme } = useTheme();

  // Obtener icono y color según el estado del paso
  const getStepIcon = (estado: EstadoPasoWorkflow, isActive: boolean) => {
    const iconProps = { 
      size: compact ? 16 : 20,
      className: styles.stepIcon 
    };

    switch (estado) {
      case EstadoPasoWorkflow.COMPLETADO:
        return <CheckCircle {...iconProps} style={{ color: '#10B981' }} />;
      case EstadoPasoWorkflow.EN_PROCESO:
        return <Clock {...iconProps} style={{ color: '#3B82F6' }} />;
      case EstadoPasoWorkflow.ERROR:
        return <XCircle {...iconProps} style={{ color: '#EF4444' }} />;
      case EstadoPasoWorkflow.TIMEOUT:
        return <AlertTriangle {...iconProps} style={{ color: '#F59E0B' }} />;
      case EstadoPasoWorkflow.OMITIDO:
        return <ChevronRight {...iconProps} style={{ color: colors.textSecondary }} />;
      default:
        return <Circle {...iconProps} style={{ 
          color: isActive ? colors.primary : colors.textSecondary 
        }} />;
    }
  };

  const getStepColor = (estado: EstadoPasoWorkflow, isActive: boolean) => {
    switch (estado) {
      case EstadoPasoWorkflow.COMPLETADO:
        return '#10B981';
      case EstadoPasoWorkflow.EN_PROCESO:
        return '#3B82F6';
      case EstadoPasoWorkflow.ERROR:
        return '#EF4444';
      case EstadoPasoWorkflow.TIMEOUT:
        return '#F59E0B';
      case EstadoPasoWorkflow.OMITIDO:
        return colors.textSecondary;
      default:
        return isActive ? colors.primary : colors.textSecondary;
    }
  };

  const getStepLabel = (estado: EstadoPasoWorkflow) => {
    switch (estado) {
      case EstadoPasoWorkflow.COMPLETADO:
        return 'Completado';
      case EstadoPasoWorkflow.EN_PROCESO:
        return 'En Proceso';
      case EstadoPasoWorkflow.ERROR:
        return 'Error';
      case EstadoPasoWorkflow.TIMEOUT:
        return 'Vencido';
      case EstadoPasoWorkflow.OMITIDO:
        return 'Omitido';
      default:
        return 'Pendiente';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStepClick = (paso: PasoInstanciaWorkflow) => {
    if (onStepClick) {
      onStepClick(paso.pasoInstanciaId);
    }
  };

  const renderStep = (paso: PasoInstanciaWorkflow & {
    nombre: string;
    descripcion: string;
    tipo: string;
    asignadoNombre?: string;
    procesadoPorNombre?: string;
  }, index: number) => {
    const isActive = currentStep === index;
    const isClickable = !!onStepClick;
    const stepColor = getStepColor(paso.estado, isActive);

    return (
      <div
        key={paso.pasoInstanciaId}
        className={`
          ${styles.timelineStep} 
          ${compact ? styles.compact : ''} 
          ${isActive ? styles.active : ''} 
          ${isClickable ? styles.clickable : ''}
          ${orientation === 'horizontal' ? styles.horizontal : styles.vertical}
        `}
        onClick={() => isClickable && handleStepClick(paso)}
        style={{
          borderColor: isActive ? stepColor : colors.border,
          backgroundColor: isActive ? `${stepColor}10` : colors.surface
        }}
      >
        {/* Indicador del paso */}
        <div 
          className={styles.stepIndicator}
          style={{
            backgroundColor: stepColor,
            borderColor: stepColor
          }}
        >
          {getStepIcon(paso.estado, isActive)}
        </div>

        {/* Línea conectora */}
        {index < pasos.length - 1 && (
          <div 
            className={`${styles.connector} ${orientation === 'horizontal' ? styles.connectorHorizontal : styles.connectorVertical}`}
            style={{
              backgroundColor: paso.estado === EstadoPasoWorkflow.COMPLETADO ? '#10B981' : colors.border
            }}
          />
        )}

        {/* Contenido del paso */}
        <div className={styles.stepContent}>
          {/* Header del paso */}
          <div className={styles.stepHeader}>
            <div className={styles.stepTitle}>
              <h4 style={{ color: colors.text, margin: 0, fontSize: compact ? '0.875rem' : '1rem' }}>
                {paso.nombre}
              </h4>
              <span 
                className={styles.stepStatus}
                style={{
                  backgroundColor: `${stepColor}20`,
                  color: stepColor,
                  fontSize: compact ? '0.6875rem' : '0.75rem'
                }}
              >
                {getStepLabel(paso.estado)}
              </span>
            </div>
            
            {!compact && (
              <div className={styles.stepOrder}>
                <span style={{ 
                  color: colors.textSecondary, 
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  Paso {paso.orden}
                </span>
              </div>
            )}
          </div>

          {/* Descripción */}
          {!compact && showDetails && (
            <p style={{ 
              color: colors.textSecondary, 
              margin: '0.5rem 0',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}>
              {paso.descripcion}
            </p>
          )}

          {/* Detalles adicionales */}
          {showDetails && !compact && (
            <div className={styles.stepDetails}>
              {/* Asignación */}
              {paso.asignadoNombre && (
                <div className={styles.stepDetail}>
                  <User size={14} color={colors.textSecondary} />
                  <span style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                    Asignado a: <strong style={{ color: colors.text }}>{paso.asignadoNombre}</strong>
                  </span>
                </div>
              )}

              {/* Procesado por */}
              {paso.procesadoPorNombre && paso.estado === EstadoPasoWorkflow.COMPLETADO && (
                <div className={styles.stepDetail}>
                  <CheckCircle size={14} color="#10B981" />
                  <span style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                    Procesado por: <strong style={{ color: colors.text }}>{paso.procesadoPorNombre}</strong>
                  </span>
                </div>
              )}

              {/* Fechas */}
              <div className={styles.stepDates}>
                {paso.fechaInicio && (
                  <div className={styles.stepDetail}>
                    <Calendar size={14} color={colors.textSecondary} />
                    <span style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                      Iniciado: {formatDate(paso.fechaInicio)}
                    </span>
                  </div>
                )}
                
                {paso.fechaFin && (
                  <div className={styles.stepDetail}>
                    <Calendar size={14} color="#10B981" />
                    <span style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                      Finalizado: {formatDate(paso.fechaFin)}
                    </span>
                  </div>
                )}

                {paso.tiempoLimite && !paso.fechaFin && (
                  <div className={styles.stepDetail}>
                    <Clock size={14} color="#F59E0B" />
                    <span style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                      Límite: {formatDate(paso.tiempoLimite)}
                    </span>
                  </div>
                )}
              </div>

              {/* Comentarios */}
              {paso.comentarios && (
                <div className={styles.stepDetail}>
                  <MessageSquare size={14} color={colors.textSecondary} />
                  <span style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                    {paso.comentarios}
                  </span>
                </div>
              )}

              {/* Resultado */}
              {paso.resultado && paso.estado === EstadoPasoWorkflow.COMPLETADO && (
                <div className={styles.stepResult}>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#F3F4F6',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    color: colors.text,
                    fontStyle: 'italic'
                  }}>
                    "{paso.resultado}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.workflowTimeline} ${orientation === 'horizontal' ? styles.horizontal : styles.vertical}`}>
      {pasos.map((paso, index) => renderStep(paso, index))}
    </div>
  );
}; 