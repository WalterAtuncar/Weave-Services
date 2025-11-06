namespace WeaveCore.Api.Features.Gobernanza.Dtos;

public class GobernanzaRolListadoDto
{
    public long GobernanzaId { get; set; }
    public string? NombreGobernanza { get; set; }
    public long GobernanzaRolId { get; set; }
    public long RolGobernanzaId { get; set; }
    public long UsuarioId { get; set; }
    public int OrdenEjecucion { get; set; }
    public bool PuedeEditar { get; set; }
    public DateTime FechaAsignacion { get; set; }
}