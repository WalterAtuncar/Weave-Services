using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Proceso;

[Table("Proceso", "Procesos", "ProcesoId")]
public class Procesos : BaseEntity
{
    public long ProcesoId { get; set; }
    public long? PadreId { get; set; }
    public long OrganizacionId { get; set; }
    public long TipoProcesoId { get; set; }
    public string CodigoProceso { get; set; } = string.Empty;
    public string NombreProceso { get; set; } = string.Empty;
    public string? DescripcionProceso { get; set; }
    public string? VersionProceso { get; set; }
    public int Nivel { get; set; }
    public string? RutaJerarquica { get; set; }
    public int? OrdenProceso { get; set; }
    public long EstadoId { get; set; }
}