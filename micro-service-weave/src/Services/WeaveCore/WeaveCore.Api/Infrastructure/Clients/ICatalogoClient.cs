using Shared.Domain.Common;

namespace WeaveCore.Api.Infrastructure.Clients;

public interface ICatalogoClient
{
    Task<PagedResult<GobernanzaEntidadListItemDto>> ListGobernanzaEntidadAsync(int page, int pageSize, CancellationToken ct);
    Task<PagedResult<GobernanzaEntidadListItemDto>> ListGobernanzaEntidadAsync(string? tipoEntidad, long? entidadId, bool? esActiva, int page, int pageSize, CancellationToken ct);
    Task<bool> CreateGobernanzaEntidadAsync(GobernanzaEntidadSyncDto dto, CancellationToken ct);
    Task<bool> UpdateGobernanzaEntidadAsync(long gobernanzaEntidadId, GobernanzaEntidadSyncDto dto, CancellationToken ct);
}

public class GobernanzaEntidadListItemDto
{
    public long GobernanzaEntidadId { get; set; }
    public long GobernanzaId { get; set; }
    public string TipoEntidad { get; set; } = string.Empty; // "Documento"
    public long EntidadId { get; set; } // DocumentoId
    public bool EsActiva { get; set; }
}

public class GobernanzaEntidadSyncDto
{
    public long? GobernanzaEntidadId { get; set; }
    public long GobernanzaId { get; set; }
    public string TipoEntidad { get; set; } = string.Empty;
    public long EntidadId { get; set; }
    public DateTime? FechaAsociacion { get; set; }
    public DateTime? FechaDesasociacion { get; set; }
    public bool? EsActiva { get; set; }
    public string? Observaciones { get; set; }
}