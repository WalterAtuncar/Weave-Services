using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "PlanesSuscripcion", "PlanId")]
public class PlanesSuscripcion
{
    public long PlanId { get; set; }
    public string NombrePlan { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int LimiteUsuarios { get; set; }
    public int DuracionDias { get; set; }
    public decimal? Precio { get; set; }
    public string? TipoPlan { get; set; }
    public bool? Activo { get; set; }
}