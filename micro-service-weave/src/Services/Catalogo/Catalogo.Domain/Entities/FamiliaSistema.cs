using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "FamiliaSistema", "FamiliaSistemaId")]
public class FamiliaSistema
{
    public long FamiliaSistemaId { get; set; }
    public string FamiliaSistemaCodigo { get; set; } = string.Empty;
    public string FamiliaSistemaNombre { get; set; } = string.Empty;
    public string? FamiliaSistemaDescripcion { get; set; }
}