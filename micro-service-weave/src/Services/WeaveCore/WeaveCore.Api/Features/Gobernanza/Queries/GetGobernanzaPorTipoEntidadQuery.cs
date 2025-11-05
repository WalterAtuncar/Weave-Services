using MediatR;
using WeaveCore.Api.Features.Gobernanza.Dtos;

namespace WeaveCore.Api.Features.Gobernanza.Queries;

public class GetGobernanzaPorTipoEntidadQuery : IRequest<GobernanzaPorTipoEntidadDto?>
{
    public int TipoEntidadId { get; set; }
    public long? OrganizacionId { get; set; }
    public bool SoloActivos { get; set; } = true;
    public bool IncludeDeleted { get; set; } = false;
}