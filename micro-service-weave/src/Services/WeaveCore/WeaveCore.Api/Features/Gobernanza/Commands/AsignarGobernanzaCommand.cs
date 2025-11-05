using MediatR;

namespace WeaveCore.Api.Features.Gobernanza.Commands;

public class AsignarGobernanzaCommand : IRequest<long>
{
    public long TipoEntidadId { get; set; }
    public long EntidadId { get; set; }
    public long RolId { get; set; }
    public long UsuarioId { get; set; }
    public long? OrganizacionId { get; set; }
    public string? CreadoPor { get; set; }
}