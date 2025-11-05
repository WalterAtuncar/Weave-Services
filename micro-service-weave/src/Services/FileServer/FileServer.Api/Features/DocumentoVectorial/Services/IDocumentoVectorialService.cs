using Models = FileServer.Api.Features.DocumentoVectorial.Models;

namespace FileServer.Api.Features.DocumentoVectorial.Services;

public interface IDocumentoVectorialService
{
    Task EnsureIndexesAsync(CancellationToken ct = default);

    Task<Models.DocumentoVectorial> InsertAsync(Models.CreateDocumentoVectorialSinIdDto dto, CancellationToken ct = default);

    Task<Models.DocumentoVectorial?> GetByIdAsync(string id, CancellationToken ct = default);

    Task<Models.DocumentoVectorial?> GetByDocumentoIdAsync(long documentoId, CancellationToken ct = default);

    Task<IReadOnlyList<Models.ResultadoBusquedaVectorial>> BuscarSimilaresAsync(Models.BusquedaVectorialDto dto, CancellationToken ct = default);

    Task<bool> UpdateAsync(string id, Models.CreateDocumentoVectorialSinIdDto dto, CancellationToken ct = default);

    Task<bool> DeleteAsync(string id, CancellationToken ct = default);

    Task<FileServer.Api.Features.DocumentoVectorial.Models.PagedResult<Models.DocumentoVectorial>> GetAsync(int page, int pageSize, CancellationToken ct = default);

    Task<IReadOnlyList<Models.DocumentoVectorial>> BuscarPorMetadatosAsync(long? organizacionId, long? tipoDocumentoId, long? carpetaId, DateTime? desde, DateTime? hasta, CancellationToken ct = default);

    Task<bool> ExisteHashAsync(string hashContenido, CancellationToken ct = default);

    Task<IReadOnlyList<Models.DocumentoVectorial>> GetByDocumentoIdsAsync(IEnumerable<long> documentoIds, CancellationToken ct = default);
}