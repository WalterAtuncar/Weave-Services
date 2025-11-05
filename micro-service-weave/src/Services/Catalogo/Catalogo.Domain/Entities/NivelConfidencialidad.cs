using Shared.Domain.Attributes;

namespace Catalogo.Domain.Entities;

[Table("catalogo", "NivelConfidencialidad", "NivelConfidencialidadId")]
public class NivelConfidencialidad
{
    public long NivelConfidencialidadId { get; set; }
    public string CodigoNivel { get; set; } = string.Empty;
    public string NombreNivel { get; set; } = string.Empty;
    public string? DescripcionNivel { get; set; }
    public int OrdenJerarquico { get; set; }
}