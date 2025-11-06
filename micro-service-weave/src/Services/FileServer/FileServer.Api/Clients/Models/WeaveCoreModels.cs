namespace FileServer.Api.Clients.Models;

public class WeaveCoreDocumento
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

public class WeaveCoreCarpeta
{
    public long CarpetaId { get; set; }
    public long OrganizacionId { get; set; }
    public string NombreCarpeta { get; set; } = string.Empty;
    public long? CarpetaPadreId { get; set; }
    public bool CarpetaPrivada { get; set; }
}

public class PagedMetadata
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public PagedMetadata Metadata { get; set; } = new();
}