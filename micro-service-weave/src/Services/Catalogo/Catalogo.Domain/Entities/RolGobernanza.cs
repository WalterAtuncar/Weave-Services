using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "RolGobernanza", "RolGobernanzaId")]
public class RolGobernanza
{
    public long RolGobernanzaId { get; set; }
    public string RolGobernanzaCodigo { get; set; } = string.Empty;
    public string RolGobernanzaNombre { get; set; } = string.Empty;
    public string? RolGobernanzaDescripcion { get; set; }
    public int Nivel { get; set; }
    public string? Color { get; set; }
}