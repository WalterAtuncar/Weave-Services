using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace Identity.Domain.Entities;

[Table("Identidad", "Usuarios", "UsuarioId")]
public class Usuarios : BaseEntity
{
    public long UsuarioId { get; set; }
    public int? TipoUsuarioId { get; set; }
    public long? PersonaId { get; set; }
    public long? PerfilId { get; set; }
    public string NombreUsuario { get; set; } = string.Empty;
    public string HashPassword { get; set; } = string.Empty;
    public DateTime? FechaExpiracion { get; set; }
}