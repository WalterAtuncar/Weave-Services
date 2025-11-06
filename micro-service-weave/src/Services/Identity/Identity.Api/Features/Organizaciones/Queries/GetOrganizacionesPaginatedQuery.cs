using System;
using MediatR;
using Shared.Domain.Common;
using Identity.Api.Features.Organizaciones.Dtos;

namespace Identity.Api.Features.Organizaciones.Queries;

public class GetOrganizacionesPaginatedQuery : IRequest<PagedResult<OrganizacionDto>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? RazonSocial { get; set; }
    public string? Codigo { get; set; }
    public string? NumeroDocumento { get; set; }
    public int? TipoDocumento { get; set; }
    public int? Sector { get; set; }
    public int? Industria { get; set; }

    public long? Pais { get; set; }
    public long? Departamento { get; set; }
    public long? Provincia { get; set; }
    public long? Distrito { get; set; }

    public DateTime? FechaConstitucionDesde { get; set; }
    public DateTime? FechaConstitucionHasta { get; set; }
    public DateTime? FechaInicioOperacionesDesde { get; set; }
    public DateTime? FechaInicioOperacionesHasta { get; set; }

    public bool IncludeDeleted { get; set; } = false;
    public int? Estado { get; set; }

    public bool SoloConSuscripcionVigente { get; set; } = false;
    public bool SoloConSuscripcionPorVencer { get; set; } = false;
    public int? DiasAnticipacionVencimiento { get; set; }

    public string? Instancia { get; set; }
    public string? Dominio { get; set; }
    public string? TenantId { get; set; }
    public string? ClientId { get; set; }

    // Ordenamiento (no dinámico en SP; reservado para futuras mejoras)
    public string? OrderBy { get; set; }
    public bool OrderDescending { get; set; } = false;
}