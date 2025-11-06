using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Proceso;

[Table("Proceso", "DocumentosProcesos", "DocumentoProcesoId")]
public class DocumentosProcesos : BaseEntity
{
    public long DocumentoProcesoId { get; set; }
    public long DocumentoId { get; set; }
    public long? MacroprocesoId { get; set; }
    public long? ProcesoId { get; set; }
    public long? SubprocesoId { get; set; }
    public long? TareaId { get; set; }
    public string? ObservacionesDocumento { get; set; }
    public bool EsObligatorio { get; set; }
}