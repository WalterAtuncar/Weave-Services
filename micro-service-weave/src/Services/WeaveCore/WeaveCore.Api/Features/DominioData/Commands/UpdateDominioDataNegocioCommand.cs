using MediatR;

namespace WeaveCore.Api.Features.DominioData.Commands;

public class UpdateDominioDataNegocioCommand : IRequest<bool>
{
    public long DominioDataId { get; set; }
    public long OrganizacionId { get; set; }

    public string? CodigoDominio { get; set; }
    public string? NombreDominio { get; set; }
    public string? DescripcionDominio { get; set; }
    public long? TipoDominioId { get; set; }

    public int Estado { get; set; }
    public long UsuarioId { get; set; }

    public long? GobernanzaId { get; set; }

    public long? WorkflowEjecucionId { get; set; }
    public string? AccionWorkflow { get; set; }
    public string? Observaciones { get; set; }
}