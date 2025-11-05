using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace Identity.Domain.Entities;

[Table("Organizacion", "SuscripcionesOrganizacion", "SuscripcionId")]
public class SuscripcionesOrganizacion : BaseEntity
{
    public long SuscripcionId { get; set; }
    public long OrganizacionId { get; set; }
    public long PlanId { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public int LimiteUsuarios { get; set; }
    public bool? EsDemo { get; set; }
    public int? TipoOperacion { get; set; }
    public int? EstadoSuscripcion { get; set; }
    public long? SuscripcionAnteriorId { get; set; }
    public string? MotivoOperacion { get; set; }
}