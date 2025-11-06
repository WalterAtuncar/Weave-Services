using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using MediatR;
using Shared.Domain.Common;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Features.DominioData.Dtos;
using WeaveCore.Api.Features.DominioData.Queries;

namespace WeaveCore.Api.Features.DominioData.Handlers;

internal class GetDominiosDataPaginatedHandler : IRequestHandler<GetDominiosDataPaginatedQuery, PagedResult<DominioDataDto>>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetDominiosDataPaginatedHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<PagedResult<DominioDataDto>> Handle(GetDominiosDataPaginatedQuery request, CancellationToken cancellationToken)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@Page", request.Page, DbType.Int32);
        parameters.Add("@PageSize", request.PageSize, DbType.Int32);
        parameters.Add("@IncludeDeleted", request.IncludeDeleted, DbType.Boolean);
        parameters.Add("@OrganizacionId", request.OrganizacionId, DbType.Int64);
        parameters.Add("@CodigoDominio", request.CodigoDominio, DbType.String);
        parameters.Add("@NombreDominio", request.NombreDominio, DbType.String);
        parameters.Add("@TipoDominioId", request.TipoDominioId, DbType.Int64);
        parameters.Add("@Estado", request.Estado, DbType.Int32);
        parameters.Add("@SoloActivos", request.SoloActivos, DbType.Boolean);
        parameters.Add("@TieneSubDominios", request.TieneSubDominios, DbType.Boolean);
        parameters.Add("@SoloSinSubDominios", request.SoloSinSubDominios, DbType.Boolean);
        parameters.Add("@FechaCreacionDesde", request.FechaCreacionDesde, DbType.DateTime2);
        parameters.Add("@FechaCreacionHasta", request.FechaCreacionHasta, DbType.DateTime2);
        parameters.Add("@FechaActualizacionDesde", request.FechaActualizacionDesde, DbType.DateTime2);
        parameters.Add("@FechaActualizacionHasta", request.FechaActualizacionHasta, DbType.DateTime2);
        parameters.Add("@CreadoPor", request.CreadoPor, DbType.Int64);
        parameters.Add("@ActualizadoPor", request.ActualizadoPor, DbType.Int64);
        parameters.Add("@SearchTerm", request.SearchTerm, DbType.String);
        parameters.Add("@OrderBy", request.OrderBy, DbType.String);
        parameters.Add("@OrderDescending", request.OrderDescending, DbType.Boolean);

        var (items, totals) = await _spExecutor.QueryMultipleAsync<DominioDataDto, TotalCountResult>(
            "Datos.sp_GetDominiosDataPaginated",
            parameters,
            cancellationToken: cancellationToken);

        var list = items.ToList();
        var totalCount = totals.FirstOrDefault()?.TotalCount ?? 0;

        if (request.LoadSubDominios && list.Count > 0)
        {
            var idsCsv = string.Join(",", list.Select(x => x.DominioDataId));
            var subParams = new DynamicParameters();
            subParams.Add("@DominioIdsCsv", idsCsv, DbType.String);
            subParams.Add("@IncludeDeleted", request.IncludeDeleted, DbType.Boolean);

            var subs = await _spExecutor.QueryAsync<SubDominioDataDto>(
                "Datos.sp_GetSubDominiosByDominioIds",
                subParams,
                cancellationToken: cancellationToken);

            var grouped = subs.GroupBy(s => s.DominioDataId).ToDictionary(g => g.Key, g => g.ToList());
            foreach (var d in list)
            {
                if (grouped.TryGetValue(d.DominioDataId, out var childList))
                {
                    d.SubDominios = childList;
                    d.TotalSubDominios = childList.Count;
                }
            }
        }

        return new PagedResult<DominioDataDto>(list, request.Page, request.PageSize, totalCount);
    }

    private class TotalCountResult { public int TotalCount { get; set; } }
}