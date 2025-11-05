using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace Identity.Domain.Entities;

[Table("Organizacion", "Posiciones", "PosicionId")]
public class Posiciones : BaseEntity
{
    public long PosicionId { get; set; }
    public long UnidadesOrgId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int? Categoria { get; set; }
    public string? Objetivo { get; set; }
    public int? OrdenImpresion { get; set; }
}