using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "TipoEntidad", "TipoEntidadId")]
public class TipoEntidad
{
    public long TipoEntidadId { get; set; }
    public string TipoEntidadCodigo { get; set; } = string.Empty;
    public string TipoEntidadNombre { get; set; } = string.Empty;
    public string? TipoEntidadDescripcion { get; set; }
}