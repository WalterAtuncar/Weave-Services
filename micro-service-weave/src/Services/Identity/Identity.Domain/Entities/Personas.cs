using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace Identity.Domain.Entities;

[Table("Identidad", "Personas", "PersonaId")]
public class Personas : BaseEntity
{
    public long PersonaId { get; set; }
    public long? OrganizacionId { get; set; }
    public long? SedeId { get; set; }
    public int? TipoDoc { get; set; }
    public string? NroDoc { get; set; }
    public string? CodEmpleado { get; set; }
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string? ApellidoMaterno { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public int EstadoLaboral { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public string? EmailPersonal { get; set; }
    public string? Celular { get; set; }
    public string? Direccion { get; set; }
    public string? Ubigeo { get; set; }
}