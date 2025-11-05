using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Gobernanza;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GobernanzaRolController : ControllerBase
{
    private readonly IMediator _mediator;

    public GobernanzaRolController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<GobernanzaRol?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<GobernanzaRol>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet("simple")]
    public async Task<ActionResult<PagedResult<GobernanzaRol>>> ListSimple([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<GobernanzaRol>(page, pageSize), ct);
        return Ok(result);
    }

    // Listado especializado: Buscar gobernanzas con roles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WeaveCore.Api.Features.Gobernanza.Dtos.GobernanzaRolListadoDto>>> List([FromQuery] WeaveCore.Api.Features.Gobernanza.Queries.BuscarGobernanzasConRolesQuery query, CancellationToken ct)
    {
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    // Listado especializado: Roles por GobernanzaId
    [HttpGet("gobernanza/{gobernanzaId:long}")]
    public async Task<ActionResult<IEnumerable<WeaveCore.Api.Features.Gobernanza.Dtos.GobernanzaRolListadoDto>>> GetRolesPorGobernanzaId(
        long gobernanzaId,
        [FromQuery] bool soloActivos = true,
        [FromQuery] bool includeDeleted = false,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new WeaveCore.Api.Features.Gobernanza.Queries.GetRolesPorGobernanzaIdQuery
        {
            GobernanzaId = gobernanzaId,
            SoloActivos = soloActivos,
            IncludeDeleted = includeDeleted
        }, ct);
        return Ok(result);
    }

    // Información compuesta: Gobernanza por TipoEntidad con roles
    [HttpGet("entidad/{tipoEntidadId:int}")]
    public async Task<ActionResult<WeaveCore.Api.Features.Gobernanza.Dtos.GobernanzaPorTipoEntidadDto?>> GetGobernanzaPorTipoEntidad(
        int tipoEntidadId,
        [FromQuery] long? organizacionId = null,
        [FromQuery] bool soloActivos = true,
        [FromQuery] bool includeDeleted = false,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new WeaveCore.Api.Features.Gobernanza.Queries.GetGobernanzaPorTipoEntidadQuery
        {
            TipoEntidadId = tipoEntidadId,
            OrganizacionId = organizacionId,
            SoloActivos = soloActivos,
            IncludeDeleted = includeDeleted
        }, ct);

        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] GobernanzaRol entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<GobernanzaRol>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<GobernanzaRol> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<GobernanzaRol>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] GobernanzaRol entity, CancellationToken ct)
    {
        entity.GobernanzaRolId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<GobernanzaRol>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<GobernanzaRol>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<GobernanzaRol>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}