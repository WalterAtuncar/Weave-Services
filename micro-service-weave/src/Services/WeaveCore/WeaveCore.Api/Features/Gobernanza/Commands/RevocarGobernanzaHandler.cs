using System.Data;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;

namespace WeaveCore.Api.Features.Gobernanza.Commands;

public class RevocarGobernanzaHandler : IRequestHandler<RevocarGobernanzaCommand, bool>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public RevocarGobernanzaHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<bool> Handle(RevocarGobernanzaCommand request, CancellationToken cancellationToken)
    {
        var p = new DynamicParameters();
        p.Add("@GobernanzaId", request.GobernanzaId, DbType.Int64);
        p.Add("@Motivo", request.Motivo, DbType.String);
        p.Add("@ActualizadoPor", request.ActualizadoPor, DbType.String);

        var rows = await _spExecutor.ExecuteAsync(
            "Gobernanza.sp_RevocarGobernanza",
            p,
            cancellationToken: cancellationToken);

        return rows > 0;
    }
}