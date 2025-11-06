using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "ReglaGobernanza", "ReglaGobernanzaId")]
public class ReglaGobernanza : BaseEntity
{
    public long ReglaGobernanzaId { get; set; }
    public long RolGobernanzaId { get; set; }
    public int MaximoUsuarios { get; set; }
    public int MinimoUsuarios { get; set; }
    public bool EsObligatorio { get; set; }
    public int? DiasAlertaVencimiento { get; set; }
    public string? ConfiguracionJson { get; set; }
}