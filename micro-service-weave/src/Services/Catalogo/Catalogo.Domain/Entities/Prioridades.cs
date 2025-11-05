using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "Prioridades", "PrioridadId")]
public class Prioridades
{
    public long PrioridadId { get; set; }
    public string NombrePrioridad { get; set; } = string.Empty;
    public string? DescripcionPrioridad { get; set; }
    public int NivelPrioridad { get; set; }
    public string? ColorPrioridad { get; set; }
    public bool EstadoPrioridad { get; set; }
}