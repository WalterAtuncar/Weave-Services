using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "NotificacionGobernanza", "NotificacionGobernanzaId")]
public class NotificacionGobernanza : BaseEntity
{
    public long NotificacionGobernanzaId { get; set; }
    public long WorkflowEjecucionId { get; set; }
    public int TipoNotificacion { get; set; }
    public DateTime FechaEnvio { get; set; }
}