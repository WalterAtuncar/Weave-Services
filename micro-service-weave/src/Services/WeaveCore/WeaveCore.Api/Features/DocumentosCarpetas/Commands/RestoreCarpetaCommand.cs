using MediatR;

namespace WeaveCore.Api.Features.DocumentosCarpetas.Commands;

public class RestoreCarpetaCommand : IRequest<bool>
{
    public long CarpetaId { get; }

    public RestoreCarpetaCommand(long carpetaId)
    {
        CarpetaId = carpetaId;
    }
}