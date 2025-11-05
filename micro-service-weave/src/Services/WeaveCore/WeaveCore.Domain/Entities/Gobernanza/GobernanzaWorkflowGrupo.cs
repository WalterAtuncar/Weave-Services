using Shared.Domain.Attributes;

namespace WeaveCore.Domain.Entities.Gobernanza;

[Table("Gobernanza", "GobernanzaWorkflowGrupo", "WorkflowGrupoId")]
public class GobernanzaWorkflowGrupo
{
    public long WorkflowGrupoId { get; set; }
    public long GobernanzaWorkflowId { get; set; }
    public int OrdenEjecucion { get; set; }
    public int TotalUsuarios { get; set; }
    public int UsuariosCompletados { get; set; }
    public int EstadoGrupo { get; set; }
    public bool EsActivo { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaCompletado { get; set; }
    public int Version { get; set; }
    public int Estado { get; set; }
    public long? CreadoPor { get; set; }
    public DateTime FechaCreacion { get; set; }
    public long? ActualizadoPor { get; set; }
    public DateTime? FechaActualizacion { get; set; }
}