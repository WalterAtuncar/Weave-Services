using System.Net.Http.Json;
using FileServer.Api.Clients.Models;

namespace FileServer.Api.Clients;

public class WeaveCoreClient : IWeaveCoreClient
{
    private readonly HttpClient _http;

    public WeaveCoreClient(IHttpClientFactory factory)
    {
        _http = factory.CreateClient("WeaveCore");
    }

    public async Task<WeaveCoreDocumento?> GetDocumentoAsync(long documentoId, CancellationToken ct = default)
    {
        return await _http.GetFromJsonAsync<WeaveCoreDocumento>($"api/Documentos/{documentoId}", cancellationToken: ct);
    }

    public async Task<PagedResult<WeaveCoreDocumento>> GetDocumentosAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var url = $"api/Documentos?page={page}&pageSize={pageSize}";
        var res = await _http.GetAsync(url, ct);
        res.EnsureSuccessStatusCode();
        var paged = await res.Content.ReadFromJsonAsync<PagedResult<WeaveCoreDocumento>>(cancellationToken: ct);
        return paged ?? new PagedResult<WeaveCoreDocumento> { Items = Array.Empty<WeaveCoreDocumento>(), Metadata = new PagedMetadata { Page = page, PageSize = pageSize, TotalCount = 0 } };
    }

    public async Task<WeaveCoreDocumento?> CreateDocumentoAsync(WeaveCoreDocumento newDoc, CancellationToken ct = default)
    {
        var res = await _http.PostAsJsonAsync("api/Documentos", newDoc, cancellationToken: ct);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<WeaveCoreDocumento>(cancellationToken: ct);
    }

    public async Task<WeaveCoreDocumento?> UpdateDocumentoAsync(long documentoId, WeaveCoreDocumento updateDoc, CancellationToken ct = default)
    {
        var res = await _http.PutAsJsonAsync($"api/Documentos/{documentoId}", updateDoc, cancellationToken: ct);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<WeaveCoreDocumento>(cancellationToken: ct);
    }

    public async Task<WeaveCoreCarpeta?> GetCarpetaAsync(long carpetaId, CancellationToken ct = default)
    {
        return await _http.GetFromJsonAsync<WeaveCoreCarpeta>($"api/DocumentosCarpetas/{carpetaId}", cancellationToken: ct);
    }
}