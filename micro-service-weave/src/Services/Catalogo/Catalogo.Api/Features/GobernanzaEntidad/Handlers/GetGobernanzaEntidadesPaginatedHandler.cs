using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using MediatR;
using Shared.Domain.Common;
using Shared.Infrastructure.StoredProcedures;
using Catalogo.Domain.Entities;
using Catalogo.Api.Features.GobernanzaEntidad.Queries;
using GobernanzaEntidadEntity = Catalogo.Domain.Entities.GobernanzaEntidad;

namespace Catalogo.Api.Features.GobernanzaEntidad.Handlers;

internal class GetGobernanzaEntidadesPaginatedHandler : IRequestHandler<GetGobernanzaEntidadesPaginatedQuery, PagedResult<GobernanzaEntidadEntity>>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetGobernanzaEntidadesPaginatedHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<PagedResult<GobernanzaEntidadEntity>> Handle(GetGobernanzaEntidadesPaginatedQuery request, CancellationToken cancellationToken)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@Page", request.Page);
        parameters.Add("@PageSize", request.PageSize);
        parameters.Add("@GobernanzaId", request.GobernanzaId);
        parameters.Add("@EntidadId", request.EntidadId);
        parameters.Add("@TipoEntidad", request.TipoEntidad);
        parameters.Add("@EsActiva", request.EsActiva);
        parameters.Add("@IncludeDeleted", request.IncludeDeleted);

        var (items, totals) = await _spExecutor.QueryMultipleAsync<GobernanzaEntidadEntity, TotalCountResult>(
            "Catalogo.sp_GetGobernanzaEntidadesPaginated",
            parameters,
            cancellationToken: cancellationToken);

        var list = items.ToList();
        var totalCount = totals.FirstOrDefault()?.TotalCount ?? 0;
        return new PagedResult<GobernanzaEntidadEntity>(list, request.Page, request.PageSize, totalCount);
    }

    private class TotalCountResult { public int TotalCount { get; set; } }
}