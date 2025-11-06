using MediatR;
using WeaveCore.Api.Features.Gobernanza.Dtos;

namespace WeaveCore.Api.Features.Gobernanza.Queries;

public class GetEstadisticasGobernanzaQuery : IRequest<GobernanzaEstadisticasDto>
{
    public long? TipoGobiernoId { get; set; }
    public long? UsuarioId { get; set; }
}