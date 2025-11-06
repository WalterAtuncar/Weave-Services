namespace WeaveCore.Api.Features.Documento.Dtos;

public class UpdateDocumentoNegocioRequest
{
    public long DocumentoId { get; set; }
    public int OrganizacionId { get; set; }
    public string? NombreDocumento { get; set; }
    public string? Descripcion { get; set; }
    public long? CarpetaId { get; set; }
    public int Estado { get; set; }

    // Orquestación de gobernanza
    public long? GobernanzaId { get; set; }

    // Orquestación de workflow
    public long? WorkflowEjecucionId { get; set; }
    public string? AccionWorkflow { get; set; }

    // Observaciones generales
    public string? Observaciones { get; set; }
}