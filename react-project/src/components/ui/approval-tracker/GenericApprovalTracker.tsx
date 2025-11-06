import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../badge/badge';
import { RejectionModal } from '../rejection-modal';
import { Calendar, AlertCircle, XCircle } from 'lucide-react';
import styles from './ApprovalTracker.module.css';

// Tipos genéricos de UI para el tracker
export interface GenericApprovalStep {
  key: string | number;
  executionId: number;
  stepNumber: number;
  roleCode?: string;
  roleLabel?: string;
  userId?: number;
  userName?: string;
  userRole?: string;
  stateText: string;
  isCurrent: boolean;
  isCompleted: boolean;
  isRejected: boolean;
  canApprove: boolean;
  canReject: boolean;
  rejectionReason?: string; // Motivo de rechazo (si aplica)
}

export interface GenericApprovalHeader {
  operationLabel: string;
  entityName: string;
  entityId: number | string;
  createdAt: string | Date;
  statusText: string;
  progressPercent: number;
  workflowStateText: string;
}

export interface GenericApprovalApplicant {
  name: string;
  role: string;
  reason?: string;
}

export interface GenericApprovalActiveInfo {
  taskName?: string;
  stepNumber?: number;
}

export interface GenericApprovalUIModel {
  header: GenericApprovalHeader;
  applicant?: GenericApprovalApplicant;
  active?: GenericApprovalActiveInfo;
  steps: GenericApprovalStep[];
  lastStepIsExecutor?: boolean;
}

export interface GenericApprovalTrackerProps<TData> {
  entityId: number;
  entityLabel?: string; // Ej: 'Sistema', 'Proceso', etc.
  showDetailed?: boolean;
  onAction?: (entityId: number, accion: 'APROBAR' | 'RECHAZAR', comentarios?: string) => void;
  // Funciones de datos (adaptadores)
  fetchWorkflow: (entityId: number) => Promise<{ success: boolean; data: TData | null; message?: string }>;
  mapUI: (data: TData) => GenericApprovalUIModel;
  approveStep: (step: GenericApprovalStep, data: TData) => Promise<{ success: boolean; message?: string }>;
  rejectStep: (step: GenericApprovalStep, motivo: string, data: TData) => Promise<{ success: boolean; message?: string }>;
}

export function GenericApprovalTracker<TData>({
  entityId,
  entityLabel = 'Entidad',
  showDetailed = true,
  onAction,
  fetchWorkflow,
  mapUI,
  approveStep,
  rejectStep,
}: GenericApprovalTrackerProps<TData>) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [rawData, setRawData] = useState<TData | null>(null);
  const [ui, setUi] = useState<GenericApprovalUIModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedStepForRejection, setSelectedStepForRejection] = useState<GenericApprovalStep | null>(null);
  const [rejectionLoading, setRejectionLoading] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWorkflow(entityId);
      if (response.success) {
        if (response.data) {
          setRawData(response.data);
          setUi(mapUI(response.data));
        } else {
          // Caso de éxito sin datos: no hay seguimiento activo para este ID
          setRawData(null);
          setUi(null);
          // No establecer error; el UI mostrará "Sin seguimiento de aprobación"
        }
      } else {
        setError(response.message || 'No se pudo cargar el seguimiento de aprobación');
      }
    } catch (err) {
      console.error('Error al cargar seguimiento genérico:', err);
      setError('Error al cargar el seguimiento de aprobación');
    } finally {
      setLoading(false);
    }
  };

  const isUserResponsibleOfCurrentStep = (step: GenericApprovalStep): boolean => {
    if (!user || !step.isCurrent) return false;
    return user.usuarioId === step.userId;
  };

  const handleApprove = async (step: GenericApprovalStep) => {
    if (!rawData) return;
    try {
      setLoading(true);
      const res = await approveStep(step, rawData);
      if (res.success) {
        await loadData();
        onAction?.(Number(entityId), 'APROBAR');
      } else {
        console.error('Error al aprobar:', res.message);
      }
    } catch (err) {
      console.error('Error al aprobar tarea:', err);
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (step: GenericApprovalStep) => {
    setSelectedStepForRejection(step);
    setRejectionModalOpen(true);
  };

  const handleConfirmRejection = async (motivo: string) => {
    if (!selectedStepForRejection || !rawData) return;
    try {
      setRejectionLoading(true);
      const res = await rejectStep(selectedStepForRejection, motivo, rawData);
      if (res.success) {
        await loadData();
        onAction?.(Number(entityId), 'RECHAZAR', motivo);
        setRejectionModalOpen(false);
        setSelectedStepForRejection(null);
      } else {
        console.error('Error al rechazar:', res.message);
      }
    } catch (err) {
      console.error('Error al rechazar tarea:', err);
    } finally {
      setRejectionLoading(false);
    }
  };

  const closeRejectionModal = () => {
    if (!rejectionLoading) {
      setRejectionModalOpen(false);
      setSelectedStepForRejection(null);
    }
  };

  // Helpers de color
  const getEstadoColor = (estado: string) => {
    const map: Record<string, string> = {
      PENDIENTE: '#f59e0b',
      'EN PROCESO': '#3b82f6',
      COMPLETADO: '#10b981',
      RECHAZADO: '#ef4444',
    };
    return map[estado.toUpperCase()] || '#6b7280';
  };

  const getOperacionColor = (op: string) => {
    const map: Record<string, string> = {
      CREAR: '#3b82f6',
      ACTUALIZAR: '#10b981',
      ELIMINAR: '#ef4444',
    };
    return map[op.toUpperCase()] || '#6366f1';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando seguimiento de aprobación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.notFound}>
        <AlertCircle size={32} color="#ef4444" />
        <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error al cargar seguimiento</h3>
        <p style={{ color: '#6b7280', textAlign: 'center', lineHeight: '1.5' }}>
          {error || 'No se pudo cargar la información del seguimiento de aprobación.'}<br />
          <span style={{ fontSize: '0.875rem' }}>Por favor, intenta nuevamente más tarde.</span>
        </p>
      </div>
    );
  }

  if (!ui) {
    return (
      <div className={styles.notFound}>
        <AlertCircle size={32} color="#6b7280" />
        <h3 style={{ color: '#374151', marginBottom: '8px' }}>Sin seguimiento de aprobación</h3>
        <p style={{ color: '#6b7280', textAlign: 'center', lineHeight: '1.5' }}>
          Esta {entityLabel.toLowerCase()} aún no tiene un proceso de aprobación activo.<br />
          El seguimiento aparecerá cuando se inicie un flujo de gobernanza.
        </p>
      </div>
    );
  }

  const { header, applicant, active, steps, lastStepIsExecutor } = ui;

  const renderStep = (step: GenericApprovalStep, isLast: boolean, ocultarPaso: boolean = false) => {
    const isApproved = step.isCompleted && !step.isRejected;
    const isRejected = step.isRejected;

    return (
      <div key={step.key} className={styles.approvalStep}>
        <div className={`${styles.stepContent} ${step.isCurrent ? styles.activeStep : ''}`} data-oculto={ocultarPaso}>
          <div className={styles.stepHeader}>
            <div className={styles.stepIcon}>
              {/* Reutiliza badge con código de rol */}
              <Badge label={step.roleCode || 'ROL'} color={'#64748b'} size="s" variant="subtle" />
            </div>
            <div className={styles.stepInfo}>
              <div className={styles.stepTitleRow}>
                <h4>{step.userName || 'Usuario'}</h4>
                <Badge label={step.roleCode || step.roleLabel || 'ROL'} color={'#64748b'} size="s" variant="subtle" />
              </div>
              <p className={styles.stepSubtitle}>{step.userRole || ''}</p>
            </div>
            <div className={styles.stepStatus}>
              {!ocultarPaso && (
                <Badge label={step.stateText} color={getEstadoColor(step.stateText)} size="s" />
              )}
              {!ocultarPaso && (
                <div className={styles.stepMeta}>
                  <span>Paso {step.stepNumber}</span>
                  <span>{isApproved ? 'Aprobado' : isRejected ? 'Rechazado' : 'Pendiente'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detalles centrales del paso */}
          {isRejected && step.rejectionReason && (
            <div className={styles.stepDetails}>
              <div className={styles.rejectionReason}>
                <AlertCircle size={14} />
                <span>Motivo del Rechazo: {step.rejectionReason}</span>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className={styles.stepActions}>
            <button
              className={`${styles.approveButton} ${(!step.canApprove || !isUserResponsibleOfCurrentStep(step)) ? styles.disabledButton : ''}`}
              onClick={() => handleApprove(step)}
              disabled={!step.canApprove || !isUserResponsibleOfCurrentStep(step)}
              title={!step.canApprove ? 'Solo se puede aprobar la tarea activa y pendiente' : !isUserResponsibleOfCurrentStep(step) ? 'Solo el usuario asignado puede aprobar esta tarea' : 'Aprobar esta tarea'}
            >
              AprobAR
            </button>
            <button
              className={`${styles.rejectButton} ${(!step.canReject || !isUserResponsibleOfCurrentStep(step)) ? styles.disabledButton : ''}`}
              onClick={() => openRejectModal(step)}
              disabled={!step.canReject || !isUserResponsibleOfCurrentStep(step)}
              title={!step.canReject ? 'Solo se puede rechazar la tarea activa y pendiente' : !isUserResponsibleOfCurrentStep(step) ? 'Solo el usuario asignado puede rechazar esta tarea' : 'Rechazar esta tarea'}
            >
              <XCircle size={14} />
              Rechazar
            </button>
          </div>
        </div>

        {!isLast && (
          <div className={styles.stepConnector}>
            <div className={styles.connectorLine} />
          </div>
        )}
      </div>
    );
  };

  const progreso = header.progressPercent;
  const stepsOrdered = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  const last = stepsOrdered[stepsOrdered.length - 1];
  const ocultarUltimoPaso = lastStepIsExecutor || last?.roleCode === 'EJ';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.operacionInfo}>
            <Badge label={header.operationLabel} color={getOperacionColor(header.operationLabel)} size="m" variant="subtle" />
            <h3>{header.entityName}</h3>
          </div>
          <div className={styles.solicitudMeta}>
            <span className={styles.solicitudId}>{entityLabel} ID: #{header.entityId}</span>
            <span className={styles.solicitudFecha}>
              <Calendar size={14} />
              {new Date(header.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className={styles.headerStatus}>
          <Badge label={header.statusText} color={getEstadoColor(header.statusText)} size="m" />
        </div>
      </div>

      {/* Progreso */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span>Progreso de Aprobación</span>
          <span>{Math.round(progreso)}% Completado</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progreso}%`, backgroundColor: header.workflowStateText === 'RECHAZADO' ? '#ef4444' : '#10b981' }}
          />
        </div>
      </div>

      {/* Solicitante */}
      {showDetailed && applicant && (
        <div className={styles.solicitanteSection}>
          <h4>Solicitado por</h4>
          <div className={styles.solicitanteCard} style={{ backgroundColor: colors.surface }}>
            <div className={styles.solicitanteInfo}>
              <span className={styles.solicitanteNombre}>{applicant.name}</span>
              <span className={styles.solicitanteCargo}>{applicant.role}</span>
            </div>
            <Badge label={applicant.role} color="#047857" size="s" variant="subtle" />
          </div>
          {applicant.reason && (
            <div className={styles.motivoSection}>
              <h5>Motivo de la Solicitud</h5>
              <p>{applicant.reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Tarea activa */}
      {showDetailed && active && (
        <div className={styles.activeTaskSection}>
          <div className={styles.activeTaskHeader}>
            <span>Tarea Activa</span>
            {typeof active.stepNumber === 'number' && (
              <Badge label={`Paso ${active.stepNumber}`} color="#1d4ed8" size="s" variant="subtle" />
            )}
          </div>
          {active.taskName && <div className={styles.activeTaskName}>{active.taskName}</div>}
        </div>
      )}

      {/* Pasos */}
      <div className={styles.stepsSection}>
        <h4>Proceso de Aprobación</h4>
        <div className={styles.stepsContainer}>
          {stepsOrdered.map((step, idx) => {
            const isLast = idx === stepsOrdered.length - 1;
            const ocultar = isLast && ocultarUltimoPaso;
            return renderStep(step, isLast, ocultar);
          })}
        </div>
      </div>

      {/* Modal de Rechazo */}
      <RejectionModal
        isOpen={rejectionModalOpen}
        onClose={closeRejectionModal}
        onConfirm={handleConfirmRejection}
        loading={rejectionLoading}
        tareaNombre={selectedStepForRejection ? `Paso ${selectedStepForRejection.stepNumber} - ${header.entityName}` : 'la tarea'}
        usuarioNombre={selectedStepForRejection?.userName || 'Usuario'}
      />
    </div>
  );
}