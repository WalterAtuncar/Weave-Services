using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Shared.Infrastructure.Workflow;
using WeaveCore.Api.Features.Gobernanza.Workflow.Commands;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Handlers
{
    public class RechazarWorkflowCommandHandler : IRequestHandler<RechazarWorkflowCommand, bool>
    {
        private readonly IGobernanzaWorkflowService _workflowService;

        public RechazarWorkflowCommandHandler(IGobernanzaWorkflowService workflowService)
        {
            _workflowService = workflowService;
        }

        public async Task<bool> Handle(RechazarWorkflowCommand request, CancellationToken cancellationToken)
        {
            await _workflowService.RechazarWorkflowAsync(
                workflowEjecucionId: request.WorkflowEjecucionId,
                usuarioId: request.UsuarioId,
                motivoRechazo: request.MotivoRechazo,
                sistemaId: request.SistemaId,
                nombreSistema: request.NombreSistema,
                accionWorkflow: request.AccionWorkflow,
                usuarioSolicitanteId: request.UsuarioSolicitanteId,
                emailSolicitante: request.EmailSolicitante,
                nombreSolicitante: request.NombreSolicitante,
                gobernanzaWorkflowId: request.GobernanzaWorkflowId,
                cancellationToken: cancellationToken);

            return true;
        }
    }
}