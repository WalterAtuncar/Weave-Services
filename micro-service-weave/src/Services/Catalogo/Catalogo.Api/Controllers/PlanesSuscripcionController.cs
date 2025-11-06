using MediatR;
using Microsoft.AspNetCore.Mvc;
using Catalogo.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Catalogo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanesSuscripcionController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlanesSuscripcionController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<PlanesSuscripcion?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<PlanesSuscripcion>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PlanesSuscripcion>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<PlanesSuscripcion>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] PlanesSuscripcion entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<PlanesSuscripcion>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<PlanesSuscripcion> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<PlanesSuscripcion>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] PlanesSuscripcion entity, CancellationToken ct)
    {
        entity.PlanId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<PlanesSuscripcion>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<PlanesSuscripcion>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}