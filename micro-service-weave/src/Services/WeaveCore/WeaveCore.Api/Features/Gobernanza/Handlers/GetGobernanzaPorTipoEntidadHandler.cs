using System.Data;
using System.Linq;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Features.Gobernanza.Dtos;
using WeaveCore.Api.Features.Gobernanza.Queries;

namespace WeaveCore.Api.Features.Gobernanza.Handlers;

public class GetGobernanzaPorTipoEntidadHandler : IRequestHandler<GetGobernanzaPorTipoEntidadQuery, GobernanzaPorTipoEntidadDto?>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetGobernanzaPorTipoEntidadHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<GobernanzaPorTipoEntidadDto?> Handle(GetGobernanzaPorTipoEntidadQuery request, CancellationToken ct)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@TipoEntidadId", request.TipoEntidadId, DbType.Int32);
        parameters.Add("@OrganizacionId", request.OrganizacionId, DbType.Int64);
        parameters.Add("@SoloActivos", request.SoloActivos, DbType.Boolean);
        parameters.Add("@IncludeDeleted", request.IncludeDeleted, DbType.Boolean);

        var (gobernanzaRows, rolesRows) = await _spExecutor.QueryMultipleAsync<GobernanzaPorTipoEntidadDto, GobernanzaRolListadoDto>(
            "Gobernanza.sp_GetGobernanzaPorTipoEntidad",
            parameters,
            ct);

        var dto = gobernanzaRows.FirstOrDefault();
        if (dto == null) return null;

        dto.Roles = rolesRows.ToList();
        return dto;
    }
}