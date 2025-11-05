using Shared.Domain.Attributes;

namespace Identity.Domain.Entities;

[Table("Identidad", "MenuPerfil", "MenuPerfilId")]
public class MenuPerfil
{
    public long MenuPerfilId { get; set; }
    public long MenuId { get; set; }
    public long PerfilId { get; set; }
    public int? AccesoId { get; set; }
}