using MediatR;
using Microsoft.AspNetCore.Mvc;
using Catalogo.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Catalogo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TiposDocumentosController : ControllerBase
{
    private readonly IMediator _mediator;

    public TiposDocumentosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<TiposDocumentos?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<TiposDocumentos>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TiposDocumentos>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<TiposDocumentos>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] TiposDocumentos entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<TiposDocumentos>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<TiposDocumentos> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<TiposDocumentos>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] TiposDocumentos entity, CancellationToken ct)
    {
        entity.TipoDocumentoId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<TiposDocumentos>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<TiposDocumentos>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}