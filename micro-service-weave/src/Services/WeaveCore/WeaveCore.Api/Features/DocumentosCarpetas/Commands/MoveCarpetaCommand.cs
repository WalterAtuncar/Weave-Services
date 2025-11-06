using MediatR;

namespace WeaveCore.Api.Features.DocumentosCarpetas.Commands;

public record MoveCarpetaCommand(long CarpetaId, long? NuevoPadreId) : IRequest<bool>;