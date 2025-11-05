using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace Identity.Domain.Entities;

[Table("Organizacion", "UnidadesOrg", "UnidadesOrgId")]
public class UnidadesOrg : BaseEntity
{
    public long UnidadesOrgId { get; set; }
    public long? OrganizacionId { get; set; }
    public long? SedeId { get; set; }
    public long? UnidadPadreId { get; set; }
    public int TipoUnidad { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? NombreCorto { get; set; }
    public string? Objetivo { get; set; }
    public int? PosicionCategoria { get; set; }
    public string? CentroCosto { get; set; }
}