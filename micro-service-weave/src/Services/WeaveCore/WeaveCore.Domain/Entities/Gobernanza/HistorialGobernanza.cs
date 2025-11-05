using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "HistorialGobernanza", "HistorialGobernanzaId")]
public class HistorialGobernanza : BaseEntity
{
    public long HistorialGobernanzaId { get; set; }
    public long GobernanzaId { get; set; }
    public long? UsuarioAnterior { get; set; }
    public long? UsuarioNuevo { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string? MotivoTransferencia { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
}