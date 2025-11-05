using MediatR;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Features.DocumentosCarpetas.Dtos;
using WeaveCore.Api.Features.DocumentosCarpetas.Queries;

namespace WeaveCore.Api.Features.DocumentosCarpetas.Handlers;

public class GetArbolCarpetasHandler : IRequestHandler<GetArbolCarpetasQuery, IEnumerable<CarpetaArbolItemDto>>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetArbolCarpetasHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<IEnumerable<CarpetaArbolItemDto>> Handle(GetArbolCarpetasQuery request, CancellationToken cancellationToken)
    {
        var parameters = new
        {
            OrganizacionId = request.OrganizacionId,
            IncludeDeleted = request.IncludeDeleted
        };

        var result = await _spExecutor.QueryAsync<CarpetaArbolItemDto>(
            "Documento.sp_GetArbol_DocumentosCarpetas",
            parameters,
            cancellationToken);

        return result;
    }
}