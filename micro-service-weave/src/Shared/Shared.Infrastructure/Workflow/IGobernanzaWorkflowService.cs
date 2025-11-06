using System.Threading;
using System.Threading.Tasks;

namespace Shared.Infrastructure.Workflow;

public interface IGobernanzaWorkflowService
{
    Task<long> IniciarWorkflowAsync(
        long gobernanzaId,
        long entidadId,
        string accionWorkflow,
        long usuarioIniciadorId,
        CancellationToken cancellationToken = default);

    Task AvanzarWorkflowAsync(
        long workflowEjecucionId,
        long usuarioId,
        string? observaciones = null,
        long? sistemaId = null,
        string? nombreSistema = null,
        string? accionWorkflow = null,
        long? usuarioSolicitanteId = null,
        string? emailSolicitante = null,
        string? nombreSolicitante = null,
        long? gobernanzaWorkflowId = null,
        CancellationToken cancellationToken = default);
    Task RechazarWorkflowAsync(
        long workflowEjecucionId,
        long usuarioId,
        string? motivoRechazo = null,
        long? sistemaId = null,
        string? nombreSistema = null,
        string? accionWorkflow = null,
        long? usuarioSolicitanteId = null,
        string? emailSolicitante = null,
        string? nombreSolicitante = null,
        long? gobernanzaWorkflowId = null,
        CancellationToken cancellationToken = default);
}