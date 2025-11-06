using System.Data;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;
using GobernanzaEntity = WeaveCore.Domain.Entities.Gobernanza.Gobernanza;

namespace WeaveCore.Api.Features.Gobernanza.Queries;

public class GetAllGobernanzasHandler : IRequestHandler<GetAllGobernanzasQuery, IEnumerable<GobernanzaEntity>>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetAllGobernanzasHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<IEnumerable<GobernanzaEntity>> Handle(GetAllGobernanzasQuery request, CancellationToken cancellationToken)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@IncludeDeleted", request.IncludeDeleted, DbType.Boolean);
        parameters.Add("@OrganizacionId", request.OrganizacionId, DbType.Int64);
        parameters.Add("@EntidadId", request.EntidadId, DbType.Int64);
        parameters.Add("@TipoGobiernoId", request.TipoGobiernoId, DbType.Int64);
        parameters.Add("@TipoEntidadId", request.TipoEntidadId, DbType.Int64);
        parameters.Add("@UsuarioId", request.UsuarioId, DbType.Int64);
        parameters.Add("@SoloProximasAVencer", request.SoloProximasAVencer, DbType.Boolean);
        parameters.Add("@SoloVencidas", request.SoloVencidas, DbType.Boolean);

        var result = await _spExecutor.QueryAsync<GobernanzaEntity>(
            "Gobernanza.sp_GetAllGobernanzas",
            parameters,
            cancellationToken);

        return result;
    }
}