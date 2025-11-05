using MediatR;
using WeaveCore.Api.Features.Gobernanza.Dtos;

namespace WeaveCore.Api.Features.Gobernanza.Queries;

public class BuscarGobernanzasConRolesQuery : IRequest<IEnumerable<GobernanzaRolListadoDto>>
{
    public long OrganizacionId { get; set; }
    public string? Filtro { get; set; }
}