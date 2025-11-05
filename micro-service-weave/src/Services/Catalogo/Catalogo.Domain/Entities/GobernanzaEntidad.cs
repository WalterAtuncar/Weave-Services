using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "GobernanzaEntidad", "GobernanzaEntidadId")]
public class GobernanzaEntidad
{
    public long GobernanzaEntidadId { get; set; }
    public long GobernanzaId { get; set; }
    public long EntidadId { get; set; }
    public string TipoEntidad { get; set; } = string.Empty;
    public DateTime FechaAsociacion { get; set; }
    public DateTime? FechaDesasociacion { get; set; }
    public string? Observaciones { get; set; }
    public bool? EsActiva { get; set; }
}