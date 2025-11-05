using Shared.Domain.Attributes;

namespace Identity.Domain.Entities;

[Table("Identidad", "Menu", "MenuId")]
public class Menu
{
    public long MenuId { get; set; }
    public long? MenuPadreId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Ruta { get; set; }
    public string? TipoIcono { get; set; }
    public string? Icono { get; set; }
    public string? Clase { get; set; }
    public bool? EsTituloGrupo { get; set; }
    public string? Badge { get; set; }
    public string? BadgeClase { get; set; }
}