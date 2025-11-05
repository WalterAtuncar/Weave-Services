using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Sistema;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServidoresController : ControllerBase
{
    private readonly IMediator _mediator;

    public ServidoresController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Servidores?>> GetById(int id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Servidores>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Servidores>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<Servidores>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] Servidores entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<Servidores>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<Servidores> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<Servidores>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] Servidores entity, CancellationToken ct)
    {
        entity.Id = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<Servidores>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<Servidores>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}