using Shared.Domain.Attributes;

namespace WeaveCore.Domain.Entities.Sistema;

[Table("Sistema", "SistemaServidor", "Id")]
public class SistemaServidor
{
    public long Id { get; set; }
    public long SistemaId { get; set; }
    public int ServidorId { get; set; }
}