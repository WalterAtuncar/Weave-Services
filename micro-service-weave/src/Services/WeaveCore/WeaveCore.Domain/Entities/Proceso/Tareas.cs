using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Proceso;

[Table("Proceso", "Tareas", "TareaId")]
public class Tareas : BaseEntity
{
    public long TareaId { get; set; }
    public long? MacroprocesoId { get; set; }
    public long? ProcesoId { get; set; }
    public long? SubprocesoId { get; set; }
    public string CodigoTarea { get; set; } = string.Empty;
    public string NombreTarea { get; set; } = string.Empty;
    public string? DescripcionTarea { get; set; }
    public string? InstruccionesTarea { get; set; }
    public string? VersionTarea { get; set; }
    public int? TiempoEstimadoMinutos { get; set; }
    public long PrioridadId { get; set; }
    public long EstadoId { get; set; }
    public int? OrdenTarea { get; set; }
    public bool EsObligatoria { get; set; }
    public bool RequiereAprobacion { get; set; }
}