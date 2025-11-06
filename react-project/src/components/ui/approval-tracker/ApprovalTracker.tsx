import React from 'react';
import { GenericApprovalTracker, GenericApprovalUIModel, GenericApprovalStep } from './GenericApprovalTracker';
import { seguimientoSOEService, SeguimientoSOEDto } from '../../../services/seguimiento-soe.service';
import { gobernanzaWorkflowActionsService } from '../../../services/gobernanza-workflow-actions.service';

export interface ApprovalTrackerProps {
  sistemaId?: number;
  dominioId?: number;
  documentoId?: number;
  showDetailed?: boolean;
  onApprovalAction?: (entityId: number, accion: 'APROBAR' | 'RECHAZAR', comentarios?: string) => void;
}

export const ApprovalTracker: React.FC<ApprovalTrackerProps> = ({
  sistemaId,
  dominioId,
  documentoId,
  showDetailed = true,
  onApprovalAction,
}) => {
  const mapUI = (data: SeguimientoSOEDto): GenericApprovalUIModel => {
    const steps: GenericApprovalStep[] = data.pasos.map((p) => ({
      key: p.workflowEjecucionId,
      executionId: p.workflowEjecucionId,
      stepNumber: p.numeroPaso,
      roleCode: p.codigoRol,
      roleLabel: p.nombreRol,
      userId: p.usuarioId,
      userName: p.nombreUsuario,
      userRole: p.cargoUsuario,
      stateText: p.estadoTareaTexto,
      isCurrent: p.esPasoActual,
      isCompleted: p.estaCompletado,
      isRejected: p.estaRechazado,
      canApprove: p.puedeAprobar,
      canReject: p.puedeRechazar,
      rejectionReason: p.motivoRechazo,
    }));

    const lastStepIsExecutor = steps.at(-1)?.roleCode === 'EJ';

    return {
      header: {
        operationLabel: data.accionWorkflow,
        entityName: data.nombreSistema,
        entityId: data.sistemaId,
        createdAt: data.fechaCreacion,
        statusText: data.estadoGeneral,
        progressPercent: data.progresoPorcentaje,
        workflowStateText: data.estadoWorkflowTexto,
      },
      applicant: {
        name: data.nombreSolicitante,
        role: data.rolSolicitante,
        reason: data.motivoSolicitud,
      },
      active: data.nombreUsuarioActivo || data.numeroPasoActivo
        ? { taskName: data.nombreUsuarioActivo || undefined, stepNumber: data.numeroPasoActivo }
        : undefined,
      steps,
      lastStepIsExecutor,
    };
  };

  const approveStep = async (step: GenericApprovalStep, data: SeguimientoSOEDto) => {
    const response = await gobernanzaWorkflowActionsService.aprobarTarea({
      workflowEjecucionId: step.executionId,
      observaciones: 'Aprobado desde el sistema',
      sistemaId: data.sistemaId,
      nombreSistema: data.nombreSistema,
      accionWorkflow: data.accionWorkflow,
      usuarioSolicitanteId: data.usuarioSolicitanteId,
      emailSolicitante: data.emailSolicitante,
      nombreSolicitante: data.nombreSolicitante,
      gobernanzaWorkflowId: data.gobernanzaWorkflowId,
    });
    return { success: response.success, message: response.message };
  };

  const rejectStep = async (step: GenericApprovalStep, motivo: string, data: SeguimientoSOEDto) => {
    const response = await gobernanzaWorkflowActionsService.rechazarTarea({
      workflowEjecucionId: step.executionId,
      motivoRechazo: motivo,
      sistemaId: data.sistemaId,
      nombreSistema: data.nombreSistema,
      accionWorkflow: data.accionWorkflow,
      usuarioSolicitanteId: data.usuarioSolicitanteId,
      emailSolicitante: data.emailSolicitante,
      nombreSolicitante: data.nombreSolicitante,
      gobernanzaWorkflowId: data.gobernanzaWorkflowId,
    });
    return { success: response.success, message: response.message };
  };

  return (
    <GenericApprovalTracker<SeguimientoSOEDto>
      entityId={sistemaId ?? dominioId ?? documentoId!}
      entityLabel={sistemaId ? "Sistema" : dominioId ? "Dominio" : "Documento"}
      showDetailed={showDetailed}
      onAction={onApprovalAction}
      fetchWorkflow={(id) => 
        sistemaId
          ? seguimientoSOEService.getSeguimientoSOE(id)
          : dominioId
            ? seguimientoSOEService.getSeguimientoSOEByDominio(id)
            : seguimientoSOEService.getSeguimientoSOEByDocumento(id)
      }
      mapUI={mapUI}
      approveStep={approveStep}
      rejectStep={rejectStep}
    />
  );
};