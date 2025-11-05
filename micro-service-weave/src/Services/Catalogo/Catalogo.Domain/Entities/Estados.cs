using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "Estados", "EstadoId")]
public class Estados
{
    public long EstadoId { get; set; }
    public string NombreEstado { get; set; } = string.Empty;
    public string? DescripcionEstado { get; set; }
    public string? ColorEstado { get; set; }
    public bool EstadoEstado { get; set; }
}