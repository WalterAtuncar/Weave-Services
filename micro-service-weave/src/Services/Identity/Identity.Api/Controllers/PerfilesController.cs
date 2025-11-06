using MediatR;
using Microsoft.AspNetCore.Mvc;
using Identity.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PerfilesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PerfilesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<Perfiles?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Perfiles>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Perfiles>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<Perfiles>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] Perfiles entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<Perfiles>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<Perfiles> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<Perfiles>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] Perfiles entity, CancellationToken ct)
    {
        entity.PerfilId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<Perfiles>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Perfiles>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<Perfiles>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}