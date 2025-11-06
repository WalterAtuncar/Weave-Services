using MediatR;
using WeaveCore.Api.Features.DocumentosCarpetas.Dtos;

namespace WeaveCore.Api.Features.DocumentosCarpetas.Queries;

public record GetArbolCarpetasQuery(long OrganizacionId, bool IncludeDeleted = false) : IRequest<IEnumerable<CarpetaArbolItemDto>>;