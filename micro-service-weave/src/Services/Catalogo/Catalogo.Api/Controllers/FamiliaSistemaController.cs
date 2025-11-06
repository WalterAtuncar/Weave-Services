using MediatR;
using Microsoft.AspNetCore.Mvc;
using Catalogo.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Catalogo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FamiliaSistemaController : ControllerBase
{
    private readonly IMediator _mediator;

    public FamiliaSistemaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<FamiliaSistema?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<FamiliaSistema>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<FamiliaSistema>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<FamiliaSistema>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("activas")]
    public async Task<ActionResult<IEnumerable<Catalogo.Api.Features.FamiliaSistema.Dtos.FamiliaSistemaActivaDto>>> GetActivas(
        [FromQuery] long organizacionId,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new Catalogo.Api.Features.FamiliaSistema.Queries.GetFamiliasSistemaActivasQuery(organizacionId), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] FamiliaSistema entity, CancellationToken ct)
    {
        // Validación de código único usando el listado genérico con filtro por código
        var filters = new Dictionary<string, object?> { { nameof(FamiliaSistema.FamiliaSistemaCodigo), entity.FamiliaSistemaCodigo } };
        var existing = await _mediator.Send(new ListEntitiesPaginatedQuery<FamiliaSistema>(page: 1, pageSize: 1, filters), ct);
        if (existing.TotalCount > 0)
        {
            return Conflict(new { message = "FamiliaSistemaCodigo ya existe", codigo = entity.FamiliaSistemaCodigo });
        }

        var id = await _mediator.Send(new CreateEntityCommand<FamiliaSistema>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<FamiliaSistema> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<FamiliaSistema>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] FamiliaSistema entity, CancellationToken ct)
    {
        entity.FamiliaSistemaId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<FamiliaSistema>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new DeleteEntityCommand<FamiliaSistema>(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}