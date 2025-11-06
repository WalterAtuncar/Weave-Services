using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Gobernanza;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GobernanzaWorkflowEjecucionController : ControllerBase
{
    private readonly IMediator _mediator;

    public GobernanzaWorkflowEjecucionController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<GobernanzaWorkflowEjecucion?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<GobernanzaWorkflowEjecucion>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<GobernanzaWorkflowEjecucion>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<GobernanzaWorkflowEjecucion>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] GobernanzaWorkflowEjecucion entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<GobernanzaWorkflowEjecucion>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<GobernanzaWorkflowEjecucion> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<GobernanzaWorkflowEjecucion>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] GobernanzaWorkflowEjecucion entity, CancellationToken ct)
    {
        entity.WorkflowEjecucionId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<GobernanzaWorkflowEjecucion>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<GobernanzaWorkflowEjecucion>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}