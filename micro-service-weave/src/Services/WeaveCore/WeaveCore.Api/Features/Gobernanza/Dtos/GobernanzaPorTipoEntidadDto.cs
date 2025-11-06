namespace WeaveCore.Api.Features.Gobernanza.Dtos;

public class GobernanzaPorTipoEntidadDto
{
    public long TipoEntidadId { get; set; }
    public long? GobernanzaId { get; set; }
    public string? NombreGobernanza { get; set; }
    public DateTime? FechaAsignacion { get; set; }
    public DateTime? FechaVencimiento { get; set; }
    public string? Observaciones { get; set; }
    public int? Estado { get; set; }

    public List<GobernanzaRolListadoDto> Roles { get; set; } = new();
}