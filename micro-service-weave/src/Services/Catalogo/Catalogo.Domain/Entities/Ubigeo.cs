using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "Ubigeo", "UbigeoId")]
public class Ubigeo
{
    public long UbigeoId { get; set; }
    public long? UbigeoPadreId { get; set; }
    public int IdNivel { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string CodigoCompleto { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? NombreCorto { get; set; }
}