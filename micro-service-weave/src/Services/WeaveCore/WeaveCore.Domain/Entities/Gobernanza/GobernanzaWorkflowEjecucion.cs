using Shared.Domain.Attributes;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "GobernanzaWorkflowEjecucion", "WorkflowEjecucionId")]
public class GobernanzaWorkflowEjecucion
{
    public long WorkflowEjecucionId { get; set; }
    public long GobernanzaWorkflowId { get; set; }
    public long RolActualId { get; set; }
    public long UsuarioActualId { get; set; }
    public long? RolSiguienteId { get; set; }
    public long? UsuarioSiguienteId { get; set; }
    public int EstadoTarea { get; set; }
    public string? MotivoRechazo { get; set; }
    public bool EsActivo { get; set; }
    public DateTime FechaInicioTarea { get; set; }
    public DateTime? FechaCompletado { get; set; }
    public long? WorkflowGrupoId { get; set; }
}