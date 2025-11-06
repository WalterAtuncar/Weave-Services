using Shared.Domain.Attributes;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "EntidadesRelacionadas", "EntidadesRelacionadasId")]
public class EntidadesRelacionadas
{
    public long EntidadesRelacionadasId { get; set; }
    public long TipoEntidadId { get; set; }
    public long EntidadId { get; set; }
    public long TipoEntidadRelacionadaId { get; set; }
    public long EntidadRelacionadaId { get; set; }
}