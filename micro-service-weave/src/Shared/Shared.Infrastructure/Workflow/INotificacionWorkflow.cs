using System.Threading;
using System.Threading.Tasks;

namespace Shared.Infrastructure.Workflow;

public interface INotificacionWorkflow
{
    Task NotificarAsignacionAsync(long usuarioDestinoId, string asunto, string cuerpoHtml, long? workflowEjecucionId = null, CancellationToken cancellationToken = default);
    Task NotificarCierreAsync(long usuarioDestinoId, string asunto, string cuerpoHtml, long? workflowEjecucionId = null, CancellationToken cancellationToken = default);
}