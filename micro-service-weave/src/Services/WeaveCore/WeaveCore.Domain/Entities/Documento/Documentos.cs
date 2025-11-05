using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace WeaveCore.Domain.Entities.Documento;

[Table("Documento", "Documentos", "DocumentoId")]
public class Documentos : BaseEntity
{
    public long DocumentoId { get; set; }
    public long OrganizacionId { get; set; }
    public string NombreDocumento { get; set; } = string.Empty;
    public string NombreArchivoOriginal { get; set; } = string.Empty;
    public string RutaArchivo { get; set; } = string.Empty;
    public long? TamanoArchivo { get; set; }
    public long TipoDocumentoId { get; set; }
    public string? DescripcionDocumento { get; set; }
    public long CarpetaId { get; set; }
    public string? MiniaturaBase64 { get; set; }
    public string? MiniaturaMimeType { get; set; }
    public int? MiniaturaAncho { get; set; }
    public int? MiniaturaAlto { get; set; }
}