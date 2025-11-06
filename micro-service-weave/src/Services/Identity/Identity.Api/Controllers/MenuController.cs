using MediatR;
using Microsoft.AspNetCore.Mvc;
using Identity.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly IMediator _mediator;

    public MenuController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<Menu?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Menu>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Menu>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<Menu>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] Menu entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<Menu>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<Menu> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<Menu>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] Menu entity, CancellationToken ct)
    {
        entity.MenuId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<Menu>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<Menu>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}