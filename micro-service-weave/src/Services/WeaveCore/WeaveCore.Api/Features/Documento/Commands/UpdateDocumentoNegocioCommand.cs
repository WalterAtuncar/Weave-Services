using MediatR;

namespace WeaveCore.Api.Features.Documento.Commands;

public class UpdateDocumentoNegocioCommand : IRequest<bool>
{
    public long DocumentoId { get; set; }
    public int OrganizacionId { get; set; }
    public string? NombreDocumento { get; set; }
    public string? Descripcion { get; set; }
    public long? CarpetaId { get; set; }
    public int Estado { get; set; }
    public long UsuarioId { get; set; }

    public long? GobernanzaId { get; set; }

    public long? WorkflowEjecucionId { get; set; }
    public string? AccionWorkflow { get; set; }
    public string? Observaciones { get; set; }
}