using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Sistema;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SistemaServidorController : ControllerBase
{
    private readonly IMediator _mediator;

    public SistemaServidorController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<SistemaServidor?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<SistemaServidor>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<SistemaServidor>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<SistemaServidor>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] SistemaServidor entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<SistemaServidor>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<SistemaServidor> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<SistemaServidor>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] SistemaServidor entity, CancellationToken ct)
    {
        entity.Id = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<SistemaServidor>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<SistemaServidor>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}