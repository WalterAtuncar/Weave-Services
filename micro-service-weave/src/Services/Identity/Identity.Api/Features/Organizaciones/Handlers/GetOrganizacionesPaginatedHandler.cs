using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using MediatR;
using Shared.Domain.Common;
using Shared.Infrastructure.StoredProcedures;
using Identity.Api.Features.Organizaciones.Dtos;
using Identity.Api.Features.Organizaciones.Queries;

namespace Identity.Api.Features.Organizaciones.Handlers;

public class GetOrganizacionesPaginatedHandler : IRequestHandler<GetOrganizacionesPaginatedQuery, PagedResult<OrganizacionDto>>
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public GetOrganizacionesPaginatedHandler(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    public async Task<PagedResult<OrganizacionDto>> Handle(GetOrganizacionesPaginatedQuery request, CancellationToken cancellationToken)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@Page", request.Page);
        parameters.Add("@PageSize", request.PageSize);

        parameters.Add("@RazonSocial", Normalize(request.RazonSocial));
        parameters.Add("@Codigo", Normalize(request.Codigo));
        parameters.Add("@NumeroDocumento", Normalize(request.NumeroDocumento));
        parameters.Add("@TipoDocumento", request.TipoDocumento);
        parameters.Add("@Sector", request.Sector);
        parameters.Add("@Industria", request.Industria);

        parameters.Add("@Pais", request.Pais);
        parameters.Add("@Departamento", request.Departamento);
        parameters.Add("@Provincia", request.Provincia);
        parameters.Add("@Distrito", request.Distrito);

        parameters.Add("@FechaConstitucionDesde", request.FechaConstitucionDesde);
        parameters.Add("@FechaConstitucionHasta", request.FechaConstitucionHasta);
        parameters.Add("@FechaInicioOperacionesDesde", request.FechaInicioOperacionesDesde);
        parameters.Add("@FechaInicioOperacionesHasta", request.FechaInicioOperacionesHasta);

        parameters.Add("@IncludeDeleted", request.IncludeDeleted);
        parameters.Add("@Estado", request.Estado);

        parameters.Add("@SoloConSuscripcionVigente", request.SoloConSuscripcionVigente);
        parameters.Add("@SoloConSuscripcionPorVencer", request.SoloConSuscripcionPorVencer);
        parameters.Add("@DiasAnticipacionVencimiento", request.DiasAnticipacionVencimiento);

        parameters.Add("@Instancia", Normalize(request.Instancia));
        parameters.Add("@Dominio", Normalize(request.Dominio));
        parameters.Add("@TenantId", Normalize(request.TenantId));
        parameters.Add("@ClientId", Normalize(request.ClientId));

        var (items, counts) = await _spExecutor.QueryMultipleAsync<OrganizacionDto, int>(
            "Organizacion.sp_GetOrganizacionesPaginated",
            parameters,
            cancellationToken: cancellationToken);

        var list = items.ToList();
        foreach (var x in list)
        {
            // Ubicaciones
            var partes = new[] { x.NombrePais, x.NombreDepartamento, x.NombreProvincia, x.NombreDistrito }
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .ToArray();
            x.UbicacionCompleta = partes.Length > 0 ? string.Join(" / ", partes) : null;
            x.UbicacionCorta = partes.Length >= 2 ? string.Join(" / ", partes.Take(2)) : x.UbicacionCompleta;
            x.TieneUbicacionCompleta = partes.Length == 4;

            // Suscripción vigente y días restantes
            if (x.FechaInicioSuscripcion.HasValue && x.FechaFinSuscripcion.HasValue)
            {
                var hoy = DateTime.UtcNow;
                x.SuscripcionVigente = x.FechaInicioSuscripcion.Value <= hoy && x.FechaFinSuscripcion.Value >= hoy;
                var dias = (x.FechaFinSuscripcion.Value.Date - hoy.Date).TotalDays;
                x.DiasRestantesSuscripcion = dias >= 0 ? (int)Math.Floor(dias) : null;
            }
            else
            {
                x.SuscripcionVigente = false;
                x.DiasRestantesSuscripcion = null;
            }

            // Estado licencia texto básico
            x.EstadoLicenciaTexto = x.EstadoLicencia switch
            {
                1 => "Activa",
                2 => "Suspendida",
                3 => "Expirada",
                _ => null
            };
        }

        var total = counts.FirstOrDefault();
        return new PagedResult<OrganizacionDto>(list, request.Page, request.PageSize, total);
    }

    private static string? Normalize(string? s)
        => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
}