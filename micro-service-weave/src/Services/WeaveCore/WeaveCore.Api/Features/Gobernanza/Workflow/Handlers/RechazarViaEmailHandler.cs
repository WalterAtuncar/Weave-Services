using System.Data;
using Dapper;
using Identity.Domain.Entities;
using MediatR;
using Shared.Domain.Common;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.Workflow;
using WeaveCore.Api.Features.Gobernanza.Workflow.Commands;
using WeaveCore.Api.Features.Gobernanza.Workflow.Dtos;
using WeaveCore.Domain.Entities.Gobernanza;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Handlers
{
    public class RechazarViaEmailHandler : IRequestHandler<RechazarViaEmailCommand, EmailActionResultDto>
    {
        private readonly IGenericRepository<EmailActionToken> _tokenRepo;
        private readonly IGenericRepository<GobernanzaWorkflowEjecucion> _ejecRepo;
        private readonly IGobernanzaWorkflowService _workflowService;

        public RechazarViaEmailHandler(
            IGenericRepository<EmailActionToken> tokenRepo,
            IGenericRepository<GobernanzaWorkflowEjecucion> ejecRepo,
            IGobernanzaWorkflowService workflowService)
        {
            _tokenRepo = tokenRepo;
            _ejecRepo = ejecRepo;
            _workflowService = workflowService;
        }

        public async Task<EmailActionResultDto> Handle(RechazarViaEmailCommand request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            var token = await _tokenRepo.ListAsync(new PaginationRequest
            {
                Page = 1,
                PageSize = 1,
                Filters = new Dictionary<string, object> { { nameof(EmailActionToken.Token), request.Token } }
            }, cancellationToken).ContinueWith(t => t.Result.Items.FirstOrDefault(), cancellationToken);

            if (token == null)
            {
                return new EmailActionResultDto { Success = false, Status = "INVALIDO", Message = "Token no válido." };
            }

            if (token.Utilizado)
            {
                return new EmailActionResultDto { Success = false, Status = "UTILIZADO", Message = "El enlace ya fue utilizado." };
            }

            if (token.FechaExpiracion <= now)
            {
                return new EmailActionResultDto { Success = false, Status = "EXPIRADO", Message = "El enlace ha expirado." };
            }

            if (!string.Equals(token.TipoAccion, "RECHAZAR", StringComparison.OrdinalIgnoreCase))
            {
                return new EmailActionResultDto { Success = false, Status = "INVALIDO", Message = "El token corresponde a otra acción." };
            }

            var ejecucion = await _ejecRepo.GetByIdAsync(token.InstanciaWorkflowId, cancellationToken);
            if (ejecucion == null || !ejecucion.EsActivo)
            {
                return new EmailActionResultDto { Success = false, Status = "NO_ACTIVA", Message = "La tarea ya no está activa." };
            }

            await _workflowService.RechazarWorkflowAsync(
                workflowEjecucionId: ejecucion.WorkflowEjecucionId,
                usuarioId: token.UsuarioId,
                motivoRechazo: request.MotivoRechazo,
                cancellationToken: cancellationToken);

            // Si no lanzó excepción, consideramos éxito

            token.Utilizado = true;
            token.FechaUtilizacion = now;
            token.IpUtilizacion = request.IpAddress;
            token.UserAgentUtilizacion = request.UserAgent;
            token.ResultadoAccion = "RECHAZADO";
            token.ActualizadoPor = "WeaveCore.Api";
            token.FechaActualizacion = now;
            token.Version += 1;
            await _tokenRepo.UpdateAsync(token, cancellationToken);

            return new EmailActionResultDto
            {
                Success = true,
                Status = "RECHAZADO",
                Message = "Tarea rechazada correctamente.",
                GobernanzaWorkflowId = ejecucion.GobernanzaWorkflowId,
                WorkflowEjecucionId = ejecucion.WorkflowEjecucionId,
                UsuarioId = token.UsuarioId
            };
        }
    }
}