using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FileServer.Api.Features.DocumentoVectorial.Models;

public class DocumentoVectorial
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public long DocumentoId { get; set; }
    public MetadataDocumento Metadata { get; set; } = new();
    public List<ChunkDocumento> Chunks { get; set; } = new();
    public string HashContenido { get; set; } = string.Empty;
}

public class MetadataDocumento
{
    public long OrganizacionId { get; set; }
    public long TipoDocumentoId { get; set; }
    public long CarpetaId { get; set; }
    public string NombreDocumento { get; set; } = string.Empty;
    public string NombreArchivoOriginal { get; set; } = string.Empty;
    public string RutaArchivo { get; set; } = string.Empty;
    public long? TamanoArchivo { get; set; }
    public string? DescripcionDocumento { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaActualizacion { get; set; }
}

public class ChunkDocumento
{
    public string Texto { get; set; } = string.Empty;
    public double[] Vector { get; set; } = Array.Empty<double>();
}

public class CreateDocumentoVectorialDto
{
    public string Id { get; set; } = string.Empty;
    public long DocumentoId { get; set; }
    public MetadataDocumento Metadata { get; set; } = new();
    public List<ChunkDocumento> Chunks { get; set; } = new();
    public string HashContenido { get; set; } = string.Empty;
}

public class CreateDocumentoVectorialSinIdDto
{
    public long DocumentoId { get; set; }
    public MetadataDocumento Metadata { get; set; } = new();
    public List<ChunkDocumento> Chunks { get; set; } = new();
    public string HashContenido { get; set; } = string.Empty;
}

public class BusquedaVectorialDto
{
    public long OrganizacionId { get; set; }
    public long? TipoDocumentoId { get; set; }
    public long? CarpetaId { get; set; }
    public int TopK { get; set; } = 5;
    public double MinSimilitud { get; set; } = 0.85;
    public bool FiltrarStopWords { get; set; } = true;
    public double[] ConsultaVector { get; set; } = Array.Empty<double>();
}

public class ResultadoBusquedaVectorial
{
    public string Id { get; set; } = string.Empty;
    public long DocumentoId { get; set; }
    public string NombreDocumento { get; set; } = string.Empty;
    public string FragmentoTexto { get; set; } = string.Empty;
    public double Similitud { get; set; }
}

public class CreateDocumentoDbDto
{
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

public class InsertarDocumentoCompuestoRequest
{
    public CreateDocumentoDbDto DocumentoDb { get; set; } = new();
    public CreateDocumentoVectorialSinIdDto DocumentoVectorial { get; set; } = new();
}

public class ActualizarDocumentoCompuestoRequest
{
    public CreateDocumentoDbDto DocumentoDb { get; set; } = new();
    public CreateDocumentoVectorialSinIdDto DocumentoVectorial { get; set; } = new();
}

public class DocumentoCompletoDto
{
    public long DocumentoId { get; set; }
    public string NombreDocumento { get; set; } = string.Empty;
    public string NombreArchivoOriginal { get; set; } = string.Empty;
    public string RutaArchivo { get; set; } = string.Empty;
    public long? TamanoArchivo { get; set; }
    public string? DescripcionDocumento { get; set; }
    public string? ContenidoBase64 { get; set; }
    public string? MimeType { get; set; }
}

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}