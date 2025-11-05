using MediatR;
using WeaveCore.Api.Features.Gobernanza.Dtos;

namespace WeaveCore.Api.Features.Gobernanza.Queries;

public class GetRolesPorGobernanzaIdQuery : IRequest<IEnumerable<GobernanzaRolListadoDto>>
{
    public long GobernanzaId { get; set; }
    public bool SoloActivos { get; set; } = true;
    public bool IncludeDeleted { get; set; } = false;
}