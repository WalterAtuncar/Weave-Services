using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Sistema;

[Table("Sistema", "SistemaModulo", "SistemaModuloId")]
public class SistemaModulo : BaseEntity
{
    public long SistemaModuloId { get; set; }
    public long SistemaId { get; set; }
    public string NombreModulo { get; set; } = string.Empty;
    public string? FuncionModulo { get; set; }
}