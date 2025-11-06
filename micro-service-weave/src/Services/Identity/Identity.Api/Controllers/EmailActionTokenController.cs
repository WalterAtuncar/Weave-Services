using MediatR;
using Microsoft.AspNetCore.Mvc;
using Identity.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailActionTokenController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmailActionTokenController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<EmailActionToken?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<EmailActionToken>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<EmailActionToken>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<EmailActionToken>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] EmailActionToken entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<EmailActionToken>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<EmailActionToken> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<EmailActionToken>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] EmailActionToken entity, CancellationToken ct)
    {
        entity.Id = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<EmailActionToken>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<EmailActionToken>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}