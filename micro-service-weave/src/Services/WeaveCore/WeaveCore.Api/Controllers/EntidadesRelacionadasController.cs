using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Gobernanza;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EntidadesRelacionadasController : ControllerBase
{
    private readonly IMediator _mediator;

    public EntidadesRelacionadasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<EntidadesRelacionadas?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<EntidadesRelacionadas>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<EntidadesRelacionadas>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<EntidadesRelacionadas>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] EntidadesRelacionadas entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<EntidadesRelacionadas>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<EntidadesRelacionadas> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<EntidadesRelacionadas>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] EntidadesRelacionadas entity, CancellationToken ct)
    {
        entity.EntidadesRelacionadasId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<EntidadesRelacionadas>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<EntidadesRelacionadas>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}