using MediatR;
using Microsoft.AspNetCore.Mvc;
using Identity.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuscripcionesOrganizacionController : ControllerBase
{
    private readonly IMediator _mediator;

    public SuscripcionesOrganizacionController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<SuscripcionesOrganizacion?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<SuscripcionesOrganizacion>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<SuscripcionesOrganizacion>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<SuscripcionesOrganizacion>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] SuscripcionesOrganizacion entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<SuscripcionesOrganizacion>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<SuscripcionesOrganizacion> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<SuscripcionesOrganizacion>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] SuscripcionesOrganizacion entity, CancellationToken ct)
    {
        entity.SuscripcionId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<SuscripcionesOrganizacion>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<SuscripcionesOrganizacion>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<SuscripcionesOrganizacion>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}