using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Shared.Domain.Common;
using System.Net.Http.Json;

namespace WeaveCore.Api.Infrastructure.Clients;

public class CatalogoClient : ICatalogoClient
{
    private readonly HttpClient _http;
    private readonly ILogger<CatalogoClient> _logger;

    public CatalogoClient(HttpClient http, ILogger<CatalogoClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<PagedResult<GobernanzaEntidadListItemDto>> ListGobernanzaEntidadAsync(int page, int pageSize, CancellationToken ct)
    {
        var response = await _http.GetAsync($"api/GobernanzaEntidad?page={page}&pageSize={pageSize}", ct);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<PagedResult<GobernanzaEntidadListItemDto>>(cancellationToken: ct);
        return result ?? new PagedResult<GobernanzaEntidadListItemDto>(Array.Empty<GobernanzaEntidadListItemDto>(), page, pageSize, 0);
    }

    public async Task<PagedResult<GobernanzaEntidadListItemDto>> ListGobernanzaEntidadAsync(string? tipoEntidad, long? entidadId, bool? esActiva, int page, int pageSize, CancellationToken ct)
    {
        var url = $"api/GobernanzaEntidad?page={page}&pageSize={pageSize}";
        var qs = new List<string>();
        if (!string.IsNullOrWhiteSpace(tipoEntidad)) qs.Add($"tipoEntidad={Uri.EscapeDataString(tipoEntidad)}");
        if (entidadId.HasValue) qs.Add($"entidadId={entidadId.Value}");
        if (esActiva.HasValue) qs.Add($"esActiva={(esActiva.Value ? "true" : "false")}");
        if (qs.Count > 0)
        {
            url += "&" + string.Join("&", qs);
        }

        var response = await _http.GetAsync(url, ct);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<PagedResult<GobernanzaEntidadListItemDto>>(cancellationToken: ct);
        return result ?? new PagedResult<GobernanzaEntidadListItemDto>(Array.Empty<GobernanzaEntidadListItemDto>(), page, pageSize, 0);
    }

    public async Task<bool> CreateGobernanzaEntidadAsync(GobernanzaEntidadSyncDto dto, CancellationToken ct)
    {
        var response = await _http.PostAsJsonAsync("api/GobernanzaEntidad", dto, ct);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("CreateGobernanzaEntidad failed: {Status}", response.StatusCode);
            return false;
        }
        return true;
    }

    public async Task<bool> UpdateGobernanzaEntidadAsync(long gobernanzaEntidadId, GobernanzaEntidadSyncDto dto, CancellationToken ct)
    {
        var response = await _http.PutAsJsonAsync($"api/GobernanzaEntidad/{gobernanzaEntidadId}", dto, ct);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("UpdateGobernanzaEntidad failed: {Status}", response.StatusCode);
            return false;
        }
        return true;
    }
}