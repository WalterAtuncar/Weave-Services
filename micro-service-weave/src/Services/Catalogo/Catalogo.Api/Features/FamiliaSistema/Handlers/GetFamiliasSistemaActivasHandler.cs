using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;
using Catalogo.Api.Features.FamiliaSistema.Dtos;
using Catalogo.Api.Features.FamiliaSistema.Queries;

namespace Catalogo.Api.Features.FamiliaSistema.Handlers;

internal class GetFamiliasSistemaActivasHandler : IRequestHandler<GetFamiliasSistemaActivasQuery, IEnumerable<FamiliaSistemaActivaDto>>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetFamiliasSistemaActivasHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<IEnumerable<FamiliaSistemaActivaDto>> Handle(GetFamiliasSistemaActivasQuery request, CancellationToken cancellationToken)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@OrganizacionId", request.OrganizacionId);

        var result = await _spExecutor.QueryAsync<FamiliaSistemaActivaDto>(
            "Catalogo.sp_GetFamiliasSistemaActivasPorOrganizacion",
            parameters,
            cancellationToken: cancellationToken);

        return result;
    }
}