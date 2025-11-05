using Shared.Domain.Attributes;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "GobernanzaWorkflow", "GobernanzaWorkflowId")]
public class GobernanzaWorkflow
{
    public long GobernanzaWorkflowId { get; set; }
    public long GobernanzaId { get; set; }
    public long EntidadId { get; set; }
    public string? AccionWork { get; set; }
    public int EstadoWorkflow { get; set; }
    public int Version { get; set; }
    public int Estado { get; set; }
    public long? CreadoPor { get; set; }
    public DateTime FechaCreacion { get; set; }
    public long? ActualizadoPor { get; set; }
    public DateTime? FechaActualizacion { get; set; }
}