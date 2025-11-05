using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Datos;

[Table("Datos", "ActivoData", "ActivoDataId")]
public class ActivoData : BaseEntity
{
    public long ActivoDataId { get; set; }
    public long DominioDataId { get; set; }
    public long SubDominioDataId { get; set; }
    public string? CodigoActivo { get; set; }
    public string NombreActivo { get; set; } = string.Empty;
    public string? DescripcionActivo { get; set; }
    public long TipoDatoId { get; set; }
    public bool EsDatoSensible { get; set; }
    public long NivelConfidencialidadId { get; set; }
    public string? FormatoEstandar { get; set; }
    public int? LongitudMaxima { get; set; }
    public bool EsObligatorio { get; set; }
    public bool PermiteNulos { get; set; }
    public string? ValoresPosibles { get; set; }
}