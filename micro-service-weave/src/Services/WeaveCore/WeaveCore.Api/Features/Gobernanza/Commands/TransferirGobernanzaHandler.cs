using System.Data;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;

namespace WeaveCore.Api.Features.Gobernanza.Commands;

public class TransferirGobernanzaHandler : IRequestHandler<TransferirGobernanzaCommand, bool>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public TransferirGobernanzaHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<bool> Handle(TransferirGobernanzaCommand request, CancellationToken cancellationToken)
    {
        var p = new DynamicParameters();
        p.Add("@GobernanzaId", request.GobernanzaId, DbType.Int64);
        p.Add("@UsuarioOrigenId", request.UsuarioOrigenId, DbType.Int64);
        p.Add("@UsuarioDestinoId", request.UsuarioDestinoId, DbType.Int64);
        p.Add("@ActualizadoPor", request.ActualizadoPor, DbType.String);

        // ExecuteAsync returns affected rows; here we use it for bool
        var rows = await _spExecutor.ExecuteAsync(
            "Gobernanza.sp_TransferirGobernanza",
            p,
            cancellationToken: cancellationToken);

        return rows > 0;
    }
}