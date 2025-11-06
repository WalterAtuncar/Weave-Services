using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "Gobernanza", "GobernanzaId")]
public class Gobernanza : BaseEntity
{
    public long GobernanzaId { get; set; }
    public string TipoFlujo { get; set; } = string.Empty;
    public long OrganizacionId { get; set; }
    public string? Nombre { get; set; }
    public long TipoGobiernoId { get; set; }
    public long TipoEntidadId { get; set; }
    public DateTime FechaAsignacion { get; set; }
    public DateTime? FechaVencimiento { get; set; }
    public string? Observaciones { get; set; }
}