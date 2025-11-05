using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Proceso;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentosProcesosController : ControllerBase
{
    private readonly IMediator _mediator;

    public DocumentosProcesosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<DocumentosProcesos?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<DocumentosProcesos>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<DocumentosProcesos>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<DocumentosProcesos>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] DocumentosProcesos entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<DocumentosProcesos>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<DocumentosProcesos> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<DocumentosProcesos>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] DocumentosProcesos entity, CancellationToken ct)
    {
        entity.DocumentoProcesoId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<DocumentosProcesos>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<DocumentosProcesos>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<DocumentosProcesos>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}