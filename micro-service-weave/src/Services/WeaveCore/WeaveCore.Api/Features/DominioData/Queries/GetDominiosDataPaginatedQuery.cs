using System;
using MediatR;
using Shared.Domain.Common;
using WeaveCore.Api.Features.DominioData.Dtos;

namespace WeaveCore.Api.Features.DominioData.Queries;

public class GetDominiosDataPaginatedQuery : IRequest<PagedResult<DominioDataDto>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public bool IncludeDeleted { get; init; } = false;

    public long? OrganizacionId { get; init; }
    public string? CodigoDominio { get; init; }
    public string? NombreDominio { get; init; }
    public long? TipoDominioId { get; init; }
    public int? Estado { get; init; }
    public bool? SoloActivos { get; init; }
    public bool? TieneSubDominios { get; init; }
    public bool? SoloSinSubDominios { get; init; }

    public DateTime? FechaCreacionDesde { get; init; }
    public DateTime? FechaCreacionHasta { get; init; }
    public DateTime? FechaActualizacionDesde { get; init; }
    public DateTime? FechaActualizacionHasta { get; init; }

    public long? CreadoPor { get; init; }
    public long? ActualizadoPor { get; init; }
    public string? SearchTerm { get; init; }

    public string? OrderBy { get; init; }
    public bool? OrderDescending { get; init; }

    public bool LoadSubDominios { get; init; } = true;
}