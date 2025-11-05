using MediatR;
using Microsoft.AspNetCore.Mvc;
using Catalogo.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Catalogo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TipoEntidadController : ControllerBase
{
    private readonly IMediator _mediator;

    public TipoEntidadController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<TipoEntidad?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<TipoEntidad>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TipoEntidad>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? codigo = null, [FromQuery] string? nombre = null, CancellationToken ct = default)
    {
        var filters = new Dictionary<string, object?>();
        if (!string.IsNullOrWhiteSpace(codigo)) filters["TipoEntidadCodigo"] = codigo;
        if (!string.IsNullOrWhiteSpace(nombre)) filters["TipoEntidadNombre"] = nombre;

        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<TipoEntidad>(page, pageSize, filters), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] TipoEntidad entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<TipoEntidad>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<TipoEntidad> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<TipoEntidad>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] TipoEntidad entity, CancellationToken ct)
    {
        entity.TipoEntidadId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<TipoEntidad>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<TipoEntidad>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}