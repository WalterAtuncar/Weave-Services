using System;
using System.Collections.Generic;

namespace WeaveCore.Api.Features.DominioData.Dtos;

public class DominioDataDto
{
    // Clave y organización
    public long DominioDataId { get; set; }
    public long OrganizacionId { get; set; }

    // Datos de dominio
    public string CodigoDominio { get; set; } = string.Empty;
    public string NombreDominio { get; set; } = string.Empty;
    public string? DescripcionDominio { get; set; }
    public long? TipoDominioId { get; set; }
    public int Estado { get; set; }

    // Auditoría
    public long? CreadoPor { get; set; }
    public DateTime FechaCreacion { get; set; }
    public long? ActualizadoPor { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int Version { get; set; }
    public bool RegistroEliminado { get; set; }

    // Organización
    public string? CodigoOrganizacion { get; set; }
    public string? RazonSocialOrganizacion { get; set; }

    // Tipo dominio
    public string? TipoDominioCodigo { get; set; }
    public string? TipoDominioNombre { get; set; }
    public string? TipoDominioDescripcion { get; set; }

    // Gobernanza
    public long? GobernanzaId { get; set; }

    // Subdominios
    public int TotalSubDominios { get; set; }
    public List<SubDominioDataDto> SubDominios { get; set; } = new();
}