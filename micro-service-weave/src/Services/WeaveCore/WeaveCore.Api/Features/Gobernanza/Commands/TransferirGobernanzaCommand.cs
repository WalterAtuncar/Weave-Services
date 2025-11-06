using MediatR;

namespace WeaveCore.Api.Features.Gobernanza.Commands;

public class TransferirGobernanzaCommand : IRequest<bool>
{
    public long GobernanzaId { get; set; }
    public long UsuarioOrigenId { get; set; }
    public long UsuarioDestinoId { get; set; }
    public string? ActualizadoPor { get; set; }
}