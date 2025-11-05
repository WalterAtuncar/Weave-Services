using MediatR;
using GobernanzaEntity = WeaveCore.Domain.Entities.Gobernanza.Gobernanza;

namespace WeaveCore.Api.Features.Gobernanza.Queries;

public class GetAllGobernanzasQuery : IRequest<IEnumerable<GobernanzaEntity>>
{
    public bool IncludeDeleted { get; set; } = false;
    public long? OrganizacionId { get; set; }
    public long? EntidadId { get; set; }
    public long? TipoGobiernoId { get; set; }
    public long? TipoEntidadId { get; set; }
    public long? UsuarioId { get; set; }
    public bool SoloProximasAVencer { get; set; } = false;
    public bool SoloVencidas { get; set; } = false;
}