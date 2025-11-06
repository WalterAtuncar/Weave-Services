namespace WeaveCore.Api.Features.DominioData.Dtos;

public class UpdateDominioDataNegocioRequest
{
    public long DominioDataId { get; set; }
    public long OrganizacionId { get; set; }

    // Campos opcionales de actualización
    public string? CodigoDominio { get; set; }
    public string? NombreDominio { get; set; }
    public string? DescripcionDominio { get; set; }
    public long? TipoDominioId { get; set; }

    // Estado para reglas de negocio (iniciar workflow cuando == -3)
    public int Estado { get; set; }

    // Orquestación de gobernanza
    public long? GobernanzaId { get; set; }

    // Orquestación de workflow
    public long? WorkflowEjecucionId { get; set; }
    public string? AccionWorkflow { get; set; }

    // Observaciones generales
    public string? Observaciones { get; set; }
}