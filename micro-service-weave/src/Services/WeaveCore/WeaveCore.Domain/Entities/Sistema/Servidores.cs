using Shared.Domain.Attributes;

namespace WeaveCore.Domain.Entities.Sistema;

[Table("Sistema", "Servidores", "Id")]
public class Servidores
{
    public int Id { get; set; }
    public long? OrganizationId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int? Tipo { get; set; }
    public int? Ambiente { get; set; }
    public string? SistemaOperativo { get; set; }
    public string? IP { get; set; }
    public int? Estado { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int CreadoPor { get; set; }
    public int? ActualizadoPor { get; set; }
    public int? EstadoRegistro { get; set; }
}