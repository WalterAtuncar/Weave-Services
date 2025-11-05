using MediatR;
using Shared.Application.Services;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Features.DocumentosCarpetas.Commands;

namespace WeaveCore.Api.Features.DocumentosCarpetas.Handlers;

public class RestoreCarpetaHandler : IRequestHandler<RestoreCarpetaCommand, bool>
{
    private readonly IStoredProcedureExecutor _spExecutor;
    private readonly IUserContextService _userContext;

    public RestoreCarpetaHandler(IStoredProcedureExecutor spExecutor, IUserContextService userContext)
    {
        _spExecutor = spExecutor;
        _userContext = userContext;
    }

    public async Task<bool> Handle(RestoreCarpetaCommand request, CancellationToken cancellationToken)
    {
        var parameters = new
        {
            CarpetaId = request.CarpetaId,
            UsuarioId = _userContext.GetUserId()
        };

        var rows = await _spExecutor.ExecuteAsync(
            "Documento.sp_Restaurar_DocumentosCarpetas",
            parameters,
            cancellationToken);

        return rows > 0;
    }
}