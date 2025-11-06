using System;
using Shared.Domain.Entities;

namespace Identity.Api.Features.Organizaciones.Dtos;

public class OrganizacionDto
{
    public long OrganizacionId { get; set; }
    public string? Codigo { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public int? TipoDocumento { get; set; }
    public string? NumeroDocumento { get; set; }
    public int? Sector { get; set; }
    public int? Industria { get; set; }

    public long? Pais { get; set; }
    public long? Departamento { get; set; }
    public long? Provincia { get; set; }
    public long? Distrito { get; set; }
    public string? Direccion { get; set; }

    public string? NombrePais { get; set; }
    public string? NombreDepartamento { get; set; }
    public string? NombreProvincia { get; set; }
    public string? NombreDistrito { get; set; }

    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? PaginaWeb { get; set; }

    public DateTime? FechaConstitucion { get; set; }
    public DateTime? FechaInicioOperaciones { get; set; }

    public string? Mision { get; set; }
    public string? Vision { get; set; }
    public string? ValoresCorporativos { get; set; }

    public string? LogoUrl { get; set; }
    public string? ColorPrimario { get; set; }
    public string? ColorSecundario { get; set; }

    public long? SuscripcionActualId { get; set; }
    public int? EstadoLicencia { get; set; }

    public string? Instancia { get; set; }
    public string? Dominio { get; set; }
    public string? TenantId { get; set; }
    public string? ClientId { get; set; }

    public int Estado { get; set; }
    public int Version { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string? ActualizadoPor { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public bool RegistroEliminado { get; set; }

    // Datos derivados / enriquecidos
    public string? UbicacionCompleta { get; set; }
    public string? UbicacionCorta { get; set; }
    public bool TieneUbicacionCompleta { get; set; }

    public bool SuscripcionVigente { get; set; }
    public int? DiasRestantesSuscripcion { get; set; }
    public string? EstadoLicenciaTexto { get; set; }

    public int TotalUnidadesOrganizacionales { get; set; }
    public int TotalUsuarios { get; set; }

    // Datos de suscripción enriquecidos
    public long? SuscripcionId { get; set; }
    public DateTime? FechaInicioSuscripcion { get; set; }
    public DateTime? FechaFinSuscripcion { get; set; }
    public int? LimiteUsuarios { get; set; }
    public string? NombrePlanActual { get; set; }

    // Usuarios de auditoría (creador/actualizador)
    public string? NombreUsuarioCreador { get; set; }
    public string? NombreUsuarioActualizador { get; set; }
}