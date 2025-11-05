namespace Catalogo.Api.Features.FamiliaSistema.Dtos;

public class FamiliaSistemaActivaDto
{
    public long FamiliaSistemaId { get; set; }
    public string FamiliaSistemaCodigo { get; set; } = string.Empty;
    public string FamiliaSistemaNombre { get; set; } = string.Empty;
    public string? FamiliaSistemaDescripcion { get; set; }
    public bool Estado { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
}