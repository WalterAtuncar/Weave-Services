using MediatR;
using Microsoft.AspNetCore.Mvc;
using Catalogo.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using Catalogo.Api.Features.GobernanzaEntidad.Queries;

namespace Catalogo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GobernanzaEntidadController : ControllerBase
{
    private readonly IMediator _mediator;

    public GobernanzaEntidadController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<GobernanzaEntidad?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<GobernanzaEntidad>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    // Listado genérico (CRUD básico) debe ir en ruta segmentada para evitar colisión con el especializado
    [HttpGet("simple")]
    public async Task<ActionResult<PagedResult<GobernanzaEntidad>>> ListSimple(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? tipoEntidad = null,
        [FromQuery] long? entidadId = null,
        [FromQuery] bool? esActiva = null,
        CancellationToken ct = default)
    {
        var filters = new Dictionary<string, object?>();
        if (!string.IsNullOrWhiteSpace(tipoEntidad)) filters["TipoEntidad"] = tipoEntidad;
        if (entidadId.HasValue) filters["EntidadId"] = entidadId.Value;
        if (esActiva.HasValue) filters["EsActiva"] = esActiva.Value;

        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<GobernanzaEntidad>(page, pageSize, filters), ct);
        return Ok(result);
    }

    // Listado especializado (SP paginado) principal del controlador
    [HttpGet]
    public async Task<ActionResult<PagedResult<GobernanzaEntidad>>> GetAllGobernanzaEntidades(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? tipoEntidad = null,
        [FromQuery] long? entidadId = null,
        [FromQuery] long? gobernanzaId = null,
        [FromQuery] bool? esActiva = null,
        [FromQuery] bool includeDeleted = false,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetGobernanzaEntidadesPaginatedQuery(
            page,
            pageSize,
            gobernanzaId,
            entidadId,
            tipoEntidad,
            esActiva,
            includeDeleted), ct);
        return Ok(result);
    }

    // Rutas especializadas
    [HttpGet("gobernanza/{gobernanzaId:long}/entidades")]
    public async Task<ActionResult<PagedResult<GobernanzaEntidad>>> ListPorGobernanza(
        [FromRoute] long gobernanzaId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? tipoEntidad = null,
        [FromQuery] bool? esActiva = null,
        [FromQuery] bool includeDeleted = false,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetGobernanzaEntidadesPaginatedQuery(
            page,
            pageSize,
            gobernanzaId,
            entidadId: null,
            tipoEntidad,
            esActiva,
            includeDeleted), ct);
        return Ok(result);
    }

    [HttpGet("entidad/{entidadId:long}/gobernanzas")]
    public async Task<ActionResult<PagedResult<GobernanzaEntidad>>> ListPorEntidad(
        [FromRoute] long entidadId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? tipoEntidad = null,
        [FromQuery] bool? esActiva = null,
        [FromQuery] bool includeDeleted = false,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetGobernanzaEntidadesPaginatedQuery(
            page,
            pageSize,
            gobernanzaId: null,
            entidadId,
            tipoEntidad,
            esActiva,
            includeDeleted), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] GobernanzaEntidad entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<GobernanzaEntidad>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<GobernanzaEntidad> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<GobernanzaEntidad>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] GobernanzaEntidad entity, CancellationToken ct)
    {
        entity.GobernanzaEntidadId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<GobernanzaEntidad>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<GobernanzaEntidad>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}