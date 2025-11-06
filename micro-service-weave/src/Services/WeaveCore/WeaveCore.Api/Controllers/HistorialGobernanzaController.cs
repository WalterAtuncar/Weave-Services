using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Gobernanza;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistorialGobernanzaController : ControllerBase
{
    private readonly IMediator _mediator;

    public HistorialGobernanzaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<HistorialGobernanza?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<HistorialGobernanza>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<HistorialGobernanza>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<HistorialGobernanza>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] HistorialGobernanza entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<HistorialGobernanza>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<HistorialGobernanza> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<HistorialGobernanza>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] HistorialGobernanza entity, CancellationToken ct)
    {
        entity.HistorialGobernanzaId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<HistorialGobernanza>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<HistorialGobernanza>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<HistorialGobernanza>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}