using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Sistema;

[Table("Sistema", "Sistemas", "SistemaId")]
public class Sistemas : BaseEntity
{
    public long SistemaId { get; set; }
    public long OrganizacionId { get; set; }
    public bool TieneGobernanzaPropia { get; set; }
    public string? CodigoSistema { get; set; }
    public string NombreSistema { get; set; } = string.Empty;
    public string? FuncionPrincipal { get; set; }
    public long? SistemaDepende { get; set; }
    public long TipoSistemaId { get; set; }
    public long FamiliaSistemaId { get; set; }
}