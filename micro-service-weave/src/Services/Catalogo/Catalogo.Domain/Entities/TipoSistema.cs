using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "TipoSistema", "TipoSistemaId")]
public class TipoSistema
{
    public long TipoSistemaId { get; set; }
    public string TipoSistemaCodigo { get; set; } = string.Empty;
    public string TipoSistemaNombre { get; set; } = string.Empty;
    public string? TipoSistemaDescripcion { get; set; }
}