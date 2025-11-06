using System.Data;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Features.Gobernanza.Dtos;
using WeaveCore.Api.Features.Gobernanza.Queries;

namespace WeaveCore.Api.Features.Gobernanza.Handlers;

public class GetRolesPorGobernanzaIdHandler : IRequestHandler<GetRolesPorGobernanzaIdQuery, IEnumerable<GobernanzaRolListadoDto>>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetRolesPorGobernanzaIdHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<IEnumerable<GobernanzaRolListadoDto>> Handle(GetRolesPorGobernanzaIdQuery request, CancellationToken ct)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@GobernanzaId", request.GobernanzaId, DbType.Int64);
        parameters.Add("@SoloActivos", request.SoloActivos, DbType.Boolean);
        parameters.Add("@IncludeDeleted", request.IncludeDeleted, DbType.Boolean);

        var result = await _spExecutor.QueryAsync<GobernanzaRolListadoDto>(
            "Gobernanza.sp_GetRolesPorGobernanzaId",
            parameters,
            ct);

        return result;
    }
}