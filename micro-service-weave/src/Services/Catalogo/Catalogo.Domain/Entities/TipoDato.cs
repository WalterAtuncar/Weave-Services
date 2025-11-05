using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "TipoDato", "TipoDatoId")]
public class TipoDato
{
    public long TipoDatoId { get; set; }
    public string CodigoTipoDato { get; set; } = string.Empty;
    public string NombreTipoDato { get; set; } = string.Empty;
    public string? DescripcionTipoDato { get; set; }
}