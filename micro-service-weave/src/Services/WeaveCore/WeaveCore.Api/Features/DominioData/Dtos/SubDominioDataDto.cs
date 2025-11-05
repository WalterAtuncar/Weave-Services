using System;

namespace WeaveCore.Api.Features.DominioData.Dtos;

public class SubDominioDataDto
{
    public long SubDominioDataId { get; set; }
    public long DominioDataId { get; set; }
    public string CodigoSubDominio { get; set; } = string.Empty;
    public string NombreSubDominio { get; set; } = string.Empty;
    public string? DescripcionSubDominio { get; set; }
    public bool? TieneGobernanzaPropia { get; set; }
    public int Estado { get; set; }
    public long? CreadoPor { get; set; }
    public DateTime FechaCreacion { get; set; }
    public long? ActualizadoPor { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int Version { get; set; }
    public bool RegistroEliminado { get; set; }
    public long? GobernanzaId { get; set; }

    // Padre
    public string? DominioCodigo { get; set; }
    public string? DominioNombre { get; set; }
}