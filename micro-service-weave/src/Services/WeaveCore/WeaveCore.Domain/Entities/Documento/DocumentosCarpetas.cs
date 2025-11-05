using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Documento;

[Table("Documento", "DocumentosCarpetas", "CarpetaId")]
public class DocumentosCarpetas : BaseEntity
{
    public long CarpetaId { get; set; }
    public long OrganizacionId { get; set; }
    public string NombreCarpeta { get; set; } = string.Empty;
    public long? CarpetaPadreId { get; set; }
    public bool CarpetaPrivada { get; set; }
}