using MediatR;
using Microsoft.AspNetCore.Mvc;
using Catalogo.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Catalogo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TiposProcesosController : ControllerBase
{
    private readonly IMediator _mediator;

    public TiposProcesosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<TiposProcesos?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<TiposProcesos>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TiposProcesos>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<TiposProcesos>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] TiposProcesos entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<TiposProcesos>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<TiposProcesos> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<TiposProcesos>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] TiposProcesos entity, CancellationToken ct)
    {
        entity.TipoProcesoId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<TiposProcesos>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<TiposProcesos>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}