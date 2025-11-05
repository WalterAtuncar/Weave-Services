using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "TiposDocumentos", "TipoDocumentoId")]
public class TiposDocumentos
{
    public long TipoDocumentoId { get; set; }
    public string NombreTipoDocumento { get; set; } = string.Empty;
    public string? DescripcionTipoDocumento { get; set; }
    public string? ExtensionesPermitidas { get; set; }
    public int? TamanoMaximoMB { get; set; }
    public bool EstadoTipoDocumento { get; set; }
}