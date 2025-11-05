using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "TipoDominio", "TipoDominioId")]
public class TipoDominio
{
    public long TipoDominioId { get; set; }
    public string? TipoDominioCodigo { get; set; }
    public string? TipoDominioNombre { get; set; }
    public string? TipoDominioDescripcion { get; set; }
}