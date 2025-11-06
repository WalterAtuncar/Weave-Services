using MediatR;
using Microsoft.AspNetCore.Mvc;
using Identity.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnidadesOrgController : ControllerBase
{
    private readonly IMediator _mediator;

    public UnidadesOrgController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<UnidadesOrg?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<UnidadesOrg>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UnidadesOrg>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<UnidadesOrg>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] UnidadesOrg entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<UnidadesOrg>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<UnidadesOrg> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<UnidadesOrg>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] UnidadesOrg entity, CancellationToken ct)
    {
        entity.UnidadesOrgId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<UnidadesOrg>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<UnidadesOrg>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<UnidadesOrg>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}