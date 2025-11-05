using System.Data;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;

namespace WeaveCore.Api.Features.Gobernanza.Commands;

public class AsignarGobernanzaHandler : IRequestHandler<AsignarGobernanzaCommand, long>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public AsignarGobernanzaHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<long> Handle(AsignarGobernanzaCommand request, CancellationToken cancellationToken)
    {
        var p = new DynamicParameters();
        p.Add("@TipoEntidadId", request.TipoEntidadId, DbType.Int64);
        p.Add("@EntidadId", request.EntidadId, DbType.Int64);
        p.Add("@RolId", request.RolId, DbType.Int64);
        p.Add("@UsuarioId", request.UsuarioId, DbType.Int64);
        p.Add("@OrganizacionId", request.OrganizacionId, DbType.Int64);
        p.Add("@CreadoPor", request.CreadoPor, DbType.String);

        var id = await _spExecutor.QuerySingleOrDefaultAsync<long>(
            "Gobernanza.sp_AsignarGobernanza",
            p,
            cancellationToken);

        if (id <= 0) throw new InvalidOperationException("No se pudo crear la asignación de gobernanza");
        return id;
    }
}