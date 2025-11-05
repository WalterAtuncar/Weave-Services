using MediatR;
using Shared.Domain.Common;
using Catalogo.Domain.Entities;
using GobernanzaEntidadEntity = Catalogo.Domain.Entities.GobernanzaEntidad;

namespace Catalogo.Api.Features.GobernanzaEntidad.Queries;

public class GetGobernanzaEntidadesPaginatedQuery : IRequest<PagedResult<GobernanzaEntidadEntity>>
{
    public int Page { get; }
    public int PageSize { get; }
    public long? GobernanzaId { get; }
    public long? EntidadId { get; }
    public string? TipoEntidad { get; }
    public bool? EsActiva { get; }
    public bool IncludeDeleted { get; }

    public GetGobernanzaEntidadesPaginatedQuery(
        int page,
        int pageSize,
        long? gobernanzaId = null,
        long? entidadId = null,
        string? tipoEntidad = null,
        bool? esActiva = null,
        bool includeDeleted = false)
    {
        Page = page;
        PageSize = pageSize;
        GobernanzaId = gobernanzaId;
        EntidadId = entidadId;
        TipoEntidad = tipoEntidad;
        EsActiva = esActiva;
        IncludeDeleted = includeDeleted;
    }
}