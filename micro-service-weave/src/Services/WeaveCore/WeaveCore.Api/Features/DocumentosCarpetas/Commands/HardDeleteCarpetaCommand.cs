using MediatR;

namespace WeaveCore.Api.Features.DocumentosCarpetas.Commands;

public class HardDeleteCarpetaCommand : IRequest<bool>
{
    public long CarpetaId { get; }

    public HardDeleteCarpetaCommand(long carpetaId)
    {
        CarpetaId = carpetaId;
    }
}