using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Documento;
using WeaveCore.Api.Features.DocumentosCarpetas.Dtos;
using WeaveCore.Api.Features.DocumentosCarpetas.Queries;
using WeaveCore.Api.Features.DocumentosCarpetas.Commands;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentosCarpetasController : ControllerBase
{
    private readonly IMediator _mediator;

    public DocumentosCarpetasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<DocumentosCarpetas?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<DocumentosCarpetas>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<DocumentosCarpetas>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<DocumentosCarpetas>(page, pageSize), ct);
        return Ok(result);
    }

    // Especializado: Árbol de carpetas
    [HttpGet("arbol")]
    public async Task<ActionResult<IEnumerable<CarpetaArbolItemDto>>> GetArbol([FromQuery] long organizacionId, [FromQuery] bool includeDeleted = false, CancellationToken ct = default)
    {
        if (organizacionId <= 0) return BadRequest("OrganizacionId debe ser mayor que cero");
        var result = await _mediator.Send(new GetArbolCarpetasQuery(organizacionId, includeDeleted), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] DocumentosCarpetas entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<DocumentosCarpetas>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<DocumentosCarpetas> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<DocumentosCarpetas>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] DocumentosCarpetas entity, CancellationToken ct)
    {
        if (id <= 0) return BadRequest("Id inválido");
        if (string.IsNullOrWhiteSpace(entity.NombreCarpeta)) return BadRequest("NombreCarpeta es requerido");
        if (entity.OrganizacionId <= 0) return BadRequest("OrganizacionId es requerido");
        entity.CarpetaId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<DocumentosCarpetas>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    // Especializado: mover carpeta
    [HttpPatch("{id:long}/move")]
    public async Task<ActionResult> Move(long id, [FromBody] MoveCarpetaRequest body, CancellationToken ct)
    {
        var ok = await _mediator.Send(new MoveCarpetaCommand(id, body?.NuevoPadreId), ct);
        if (!ok) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<DocumentosCarpetas>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<DocumentosCarpetas>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }

    // Especializado: restaurar carpeta (soft-delete → activo)
    [HttpPatch("{id:long}/restore")]
    public async Task<ActionResult> Restore(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new RestoreCarpetaCommand(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }

    // Especializado: eliminación definitiva (hard delete)
    [HttpDelete("{id:long}/hard")]
    public async Task<ActionResult> HardDelete(long id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new HardDeleteCarpetaCommand(id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}