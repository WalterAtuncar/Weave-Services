using Shared.Domain.Attributes;
using Shared.Domain.Entities;

namespace Identity.Domain.Entities;

[Table("Organizacion", "Organizaciones", "OrganizacionId")]
public class Organizaciones : BaseEntity
{
    public long OrganizacionId { get; set; }
    public string? Codigo { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string? NombreComercial { get; set; }
    public int? TipoDocumento { get; set; }
    public string? NumeroDocumento { get; set; }
    public int? Sector { get; set; }
    public int? Industria { get; set; }
    public long? Pais { get; set; }
    public long? Departamento { get; set; }
    public long? Provincia { get; set; }
    public long? Distrito { get; set; }
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? PaginaWeb { get; set; }
    public string? Mision { get; set; }
    public string? Vision { get; set; }
    public string? ValoresCorporativos { get; set; }
    public DateTime? FechaConstitucion { get; set; }
    public DateTime? FechaInicioOperaciones { get; set; }
    public string? LogoUrl { get; set; }
    public string? ColorPrimario { get; set; }
    public string? ColorSecundario { get; set; }
    public long? SuscripcionActualId { get; set; }
    public int? EstadoLicencia { get; set; }
    public string? Instancia { get; set; }
    public string? Dominio { get; set; }
    public string? TenantId { get; set; }
    public string? ClientId { get; set; }
    public string? ClientSecret { get; set; }
    public string? CallbackPath { get; set; }
}