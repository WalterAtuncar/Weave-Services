using MediatR;
using Microsoft.AspNetCore.Mvc;
using Identity.Domain.Entities;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using Identity.Api.Features.Organizaciones.Dtos;
using Identity.Api.Features.Organizaciones.Queries;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrganizacionesController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrganizacionesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<Organizaciones?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Organizaciones>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet("simple")]
    public async Task<ActionResult<PagedResult<Organizaciones>>> ListSimple([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<Organizaciones>(page, pageSize), ct);
        return Ok(result);
    }

    // Listado especializado con filtros avanzados y DTO
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrganizacionDto>>> ListEspecializado([FromQuery] GetOrganizacionesPaginatedQuery query, CancellationToken ct)
    {
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] Organizaciones entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<Organizaciones>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<Organizaciones> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<Organizaciones>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] Organizaciones entity, CancellationToken ct)
    {
        entity.OrganizacionId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<Organizaciones>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Organizaciones>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<Organizaciones>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}