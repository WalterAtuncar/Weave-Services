using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace Identity.Domain.Entities;

[Table("Identidad", "Perfiles", "PerfilId")]
public class Perfiles : BaseEntity
{
    public long PerfilId { get; set; }
    public string NombrePerfil { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}