using Shared.Domain.Attributes;

namespace Identity.Domain.Entities;

[Table("Identidad", "RecuperacionContrasena", "RecuperacionId")]
public class RecuperacionContrasena
{
    public long RecuperacionId { get; set; }
    public long UsuarioId { get; set; }
    public string CodigoRecuperacion { get; set; } = string.Empty;
    public DateTime FechaGeneracion { get; set; }
    public DateTime FechaExpiracion { get; set; }
    public int IntentosFallidos { get; set; }
    public int VecesCambioContrasena { get; set; }
    public DateTime? FechaUltimoCambio { get; set; }
    public bool Estado { get; set; }
}