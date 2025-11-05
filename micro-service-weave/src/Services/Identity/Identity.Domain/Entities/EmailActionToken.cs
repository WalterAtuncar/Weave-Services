using Shared.Domain.Attributes;

namespace Identity.Domain.Entities;

[Table("Identidad", "EmailActionToken", "Id")]
public class EmailActionToken
{
    public long Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public long InstanciaWorkflowId { get; set; }
    public long UsuarioId { get; set; }
    public string TipoAccion { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaExpiracion { get; set; }
    public bool Utilizado { get; set; }
    public DateTime? FechaUtilizacion { get; set; }
    public string? IpUtilizacion { get; set; }
    public string? UserAgentUtilizacion { get; set; }
    public string? ResultadoAccion { get; set; }
    public int Estado { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime FechaCreacion_Base { get; set; }
    public string? ActualizadoPor { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int Version { get; set; }
    public bool RegistroEliminado { get; set; }
}