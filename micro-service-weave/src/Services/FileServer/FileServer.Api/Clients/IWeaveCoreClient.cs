using FileServer.Api.Clients.Models;

namespace FileServer.Api.Clients;

public interface IWeaveCoreClient
{
    Task<WeaveCoreDocumento?> GetDocumentoAsync(long documentoId, CancellationToken ct = default);
    Task<WeaveCoreCarpeta?> GetCarpetaAsync(long carpetaId, CancellationToken ct = default);
    Task<PagedResult<WeaveCoreDocumento>> GetDocumentosAsync(int page, int pageSize, CancellationToken ct = default);
    Task<WeaveCoreDocumento?> CreateDocumentoAsync(WeaveCoreDocumento newDoc, CancellationToken ct = default);
    Task<WeaveCoreDocumento?> UpdateDocumentoAsync(long documentoId, WeaveCoreDocumento updateDoc, CancellationToken ct = default);
}