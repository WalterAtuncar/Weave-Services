using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Shared.Infrastructure.Workflow;
using WeaveCore.Api.Features.Gobernanza.Workflow.Commands;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Handlers
{
    public class AvanzarWorkflowCommandHandler : IRequestHandler<AvanzarWorkflowCommand, bool>
    {
        private readonly IGobernanzaWorkflowService _workflowService;

        public AvanzarWorkflowCommandHandler(IGobernanzaWorkflowService workflowService)
        {
            _workflowService = workflowService;
        }

        public async Task<bool> Handle(AvanzarWorkflowCommand request, CancellationToken cancellationToken)
        {
            await _workflowService.AvanzarWorkflowAsync(
                workflowEjecucionId: request.WorkflowEjecucionId,
                usuarioId: request.UsuarioId,
                observaciones: request.Observaciones,
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