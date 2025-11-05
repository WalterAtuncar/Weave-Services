using MediatR;
using Catalogo.Api.Features.FamiliaSistema.Dtos;

namespace Catalogo.Api.Features.FamiliaSistema.Queries;

public record GetFamiliasSistemaActivasQuery(long OrganizacionId) : IRequest<IEnumerable<FamiliaSistemaActivaDto>>;