using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "GobernanzaRol", "GobernanzaRolId")]
public class GobernanzaRol : BaseEntity
{
    public long GobernanzaRolId { get; set; }
    public long GobernanzaId { get; set; }
    public long RolGobernanzaId { get; set; }
    public long UsuarioId { get; set; }
    public int OrdenEjecucion { get; set; }
    public bool PuedeEditar { get; set; }
    public DateTime FechaAsignacion { get; set; }
}