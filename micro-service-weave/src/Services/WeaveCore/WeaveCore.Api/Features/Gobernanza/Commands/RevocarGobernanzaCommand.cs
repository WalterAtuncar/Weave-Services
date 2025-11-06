using MediatR;

namespace WeaveCore.Api.Features.Gobernanza.Commands;

public class RevocarGobernanzaCommand : IRequest<bool>
{
    public long GobernanzaId { get; set; }
    public string? Motivo { get; set; }
    public string? ActualizadoPor { get; set; }
}