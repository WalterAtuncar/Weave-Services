using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "TipoGobierno", "TipoGobiernoId")]
public class TipoGobierno
{
    public long TipoGobiernoId { get; set; }
    public string TipoGobiernoCodigo { get; set; } = string.Empty;
    public string TipoGobiernoNombre { get; set; } = string.Empty;
    public string? TipoGobiernoDescripcion { get; set; }
}