using System.Data;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Features.Gobernanza.Dtos;

namespace WeaveCore.Api.Features.Gobernanza.Queries;

public class GetEstadisticasGobernanzaHandler : IRequestHandler<GetEstadisticasGobernanzaQuery, GobernanzaEstadisticasDto>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetEstadisticasGobernanzaHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<GobernanzaEstadisticasDto> Handle(GetEstadisticasGobernanzaQuery request, CancellationToken cancellationToken)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@TipoGobiernoId", request.TipoGobiernoId, DbType.Int64);
        parameters.Add("@UsuarioId", request.UsuarioId, DbType.Int64);

        var result = await _spExecutor.QuerySingleOrDefaultAsync<GobernanzaEstadisticasDto>(
            "Gobernanza.sp_ObtenerEstadisticas_Gobernanza",
            parameters,
            cancellationToken);

        return result ?? new GobernanzaEstadisticasDto();
    }
}