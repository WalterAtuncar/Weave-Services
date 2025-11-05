using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "TiposProcesos", "TipoProcesoId")]
public class TiposProcesos
{
    public long TipoProcesoId { get; set; }
    public long OrganizacionId { get; set; }
    public string NombreTipoProceso { get; set; } = string.Empty;
    public string? DescripcionTipoProceso { get; set; }
    public int Nivel { get; set; }
    public bool EstadoTipoProceso { get; set; }
}