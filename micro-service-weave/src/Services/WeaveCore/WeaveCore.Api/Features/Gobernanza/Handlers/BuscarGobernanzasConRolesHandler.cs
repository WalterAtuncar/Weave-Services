using System.Data;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Features.Gobernanza.Dtos;
using WeaveCore.Api.Features.Gobernanza.Queries;

namespace WeaveCore.Api.Features.Gobernanza.Handlers;

public class BuscarGobernanzasConRolesHandler : IRequestHandler<BuscarGobernanzasConRolesQuery, IEnumerable<GobernanzaRolListadoDto>>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public BuscarGobernanzasConRolesHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<IEnumerable<GobernanzaRolListadoDto>> Handle(BuscarGobernanzasConRolesQuery request, CancellationToken ct)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@OrganizacionId", request.OrganizacionId, DbType.Int64);
        parameters.Add("@Filtro", request.Filtro, DbType.String);

        var result = await _spExecutor.QueryAsync<GobernanzaRolListadoDto>(
            "Gobernanza.sp_BuscarGobernanzasConRoles",
            parameters,
            ct);

        return result;
    }
}