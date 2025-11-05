using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Datos;
using WeaveCore.Api.Features.DominioData.Dtos;
using WeaveCore.Api.Features.DominioData.Queries;
using WeaveCore.Api.Features.DominioData.Commands;
using Shared.Application.Services;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DominioDataController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserContextService _userContext;

    public DominioDataController(IMediator mediator, IUserContextService userContext)
    {
        _mediator = mediator;
        _userContext = userContext;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<DominioDataDto>>> List([FromQuery] GetDominiosDataPaginatedQuery query, CancellationToken ct = default)
    {
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    [HttpGet("tipo/{tipoDominioId:long}")]
    public async Task<ActionResult<IEnumerable<DominioDataDto>>> GetByTipo(long tipoDominioId, [FromQuery] long? organizacionId = null, CancellationToken ct = default)
    {
        var query = new GetDominiosDataPaginatedQuery
        {
            TipoDominioId = tipoDominioId,
            OrganizacionId = organizacionId,
            Page = 1,
            PageSize = 1000,
            LoadSubDominios = true
        };

        var result = await _mediator.Send(query, ct);
        return Ok(result.Items);
    }

    [HttpGet("con-subdominios")]
    public async Task<ActionResult<IEnumerable<DominioDataDto>>> GetConSubDominios([FromQuery] long? organizacionId = null, CancellationToken ct = default)
    {
        var query = new GetDominiosDataPaginatedQuery
        {
            TieneSubDominios = true,
            OrganizacionId = organizacionId,
            Page = 1,
            PageSize = 1000,
            LoadSubDominios = true
        };

        var result = await _mediator.Send(query, ct);
        return Ok(result.Items);
    }

    [HttpGet("estadisticas")]
    public async Task<ActionResult<Dictionary<string, int>>> GetEstadisticas([FromQuery] long? organizacionId = null, CancellationToken ct = default)
    {
        var total = await _mediator.Send(new GetDominiosDataPaginatedQuery
        {
            OrganizacionId = organizacionId,
            Page = 1,
            PageSize = 1,
            LoadSubDominios = false
        }, ct);

        var activos = await _mediator.Send(new GetDominiosDataPaginatedQuery
        {
            OrganizacionId = organizacionId,
            Estado = 1,
            Page = 1,
            PageSize = 1,
            LoadSubDominios = false
        }, ct);

        var conSubs = await _mediator.Send(new GetDominiosDataPaginatedQuery
        {
            OrganizacionId = organizacionId,
            TieneSubDominios = true,
            Page = 1,
            PageSize = 1,
            LoadSubDominios = false
        }, ct);

        var sinSubs = await _mediator.Send(new GetDominiosDataPaginatedQuery
        {
            OrganizacionId = organizacionId,
            SoloSinSubDominios = true,
            Page = 1,
            PageSize = 1,
            LoadSubDominios = false
        }, ct);

        var estadisticas = new Dictionary<string, int>
        {
            ["Total"] = total.TotalCount,
            ["Activos"] = activos.TotalCount,
            ["ConSubDominios"] = conSubs.TotalCount,
            ["SinSubDominios"] = sinSubs.TotalCount
        };

        return Ok(estadisticas);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<DominioData?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<DominioData>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet("simple")]
    public async Task<ActionResult<PagedResult<DominioData>>> ListSimple([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<DominioData>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] DominioData entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<DominioData>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<DominioData> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<DominioData>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] DominioData entity, CancellationToken ct)
    {
        entity.DominioDataId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<DominioData>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<DominioData>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<DominioData>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }

    // Endpoint especializado de negocio para actualización con gobernanza/workflow
    [HttpPut("negocio")]
    public async Task<ActionResult> UpdateNegocio([FromBody] UpdateDominioDataNegocioRequest request, CancellationToken ct)
    {
        var usuarioId = _userContext.GetUserId();
        if (usuarioId is null || usuarioId <= 0) return Forbid();

        var cmd = new UpdateDominioDataNegocioCommand
        {
            DominioDataId = request.DominioDataId,
            OrganizacionId = request.OrganizacionId,
            CodigoDominio = request.CodigoDominio,
            NombreDominio = request.NombreDominio,
            DescripcionDominio = request.DescripcionDominio,
            TipoDominioId = request.TipoDominioId,
            Estado = request.Estado,
            UsuarioId = (long)usuarioId,
            GobernanzaId = request.GobernanzaId,
            WorkflowEjecucionId = request.WorkflowEjecucionId,
            AccionWorkflow = request.AccionWorkflow,
            Observaciones = request.Observaciones
        };

        var ok = await _mediator.Send(cmd, ct);
        return ok ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}