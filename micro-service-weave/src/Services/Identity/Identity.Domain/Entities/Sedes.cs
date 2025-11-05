using Shared.Domain.Attributes;

namespace Identity.Domain.Entities;

[Table("Organizacion", "Sedes", "SedeId")]
public class Sedes
{
    public long SedeId { get; set; }
    public long? OrganizacionId { get; set; }
    public string? Nombre { get; set; }
    public string? Descripcion { get; set; }
    public string? Ubigeo { get; set; }
}