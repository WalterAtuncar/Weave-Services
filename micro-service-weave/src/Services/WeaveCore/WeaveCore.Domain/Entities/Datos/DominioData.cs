using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Datos;

[Table("Datos", "DominioData", "DominioDataId")]
public class DominioData : BaseEntity
{
    public long DominioDataId { get; set; }
    public long? DominioPadreId { get; set; }
    public long OrganizacionId { get; set; }
    public long? TipoDominioId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool TieneGobernanzaPropia { get; set; }
    public int Nivel { get; set; }
    public string? RutaJerarquica { get; set; }
}