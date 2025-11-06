using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Gobernanza;
using WeaveCore.Api.Features.Gobernanza.Dtos;
using WeaveCore.Api.Features.Gobernanza.Queries;
using WeaveCore.Api.Features.Gobernanza.Commands;
using Microsoft.AspNetCore.Authorization;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GobernanzaController : ControllerBase
{
    private readonly IMediator _mediator;

    public GobernanzaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<Gobernanza?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Gobernanza>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet("simple")]
    public async Task<ActionResult<PagedResult<Gobernanza>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<Gobernanza>(page, pageSize), ct);
        return Ok(result);
    }

    // Listado especializado: GetAllGobernanzas (SP)
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Gobernanza>>> GetAllGobernanzas(
        [FromQuery] bool includeDeleted = false,
        [FromQuery] long? organizacionId = null,
        [FromQuery] long? entidadId = null,
        [FromQuery] long? tipoGobiernoId = null,
        [FromQuery] long? tipoEntidadId = null,
        [FromQuery] long? usuarioId = null,
        [FromQuery] bool soloProximasAVencer = false,
        [FromQuery] bool soloVencidas = false,
        CancellationToken ct = default)
    {
        var items = await _mediator.Send(new GetAllGobernanzasQuery
        {
            IncludeDeleted = includeDeleted,
            OrganizacionId = organizacionId,
            EntidadId = entidadId,
            TipoGobiernoId = tipoGobiernoId,
            TipoEntidadId = tipoEntidadId,
            UsuarioId = usuarioId,
            SoloProximasAVencer = soloProximasAVencer,
            SoloVencidas = soloVencidas
        }, ct);

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] Gobernanza entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<Gobernanza>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<Gobernanza> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<Gobernanza>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] Gobernanza entity, CancellationToken ct)
    {
        entity.GobernanzaId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<Gobernanza>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Gobernanza>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<Gobernanza>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }

    // Consulta especializada: estadísticas de gobernanza
    [HttpGet("estadisticas")]
    public async Task<ActionResult<GobernanzaEstadisticasDto>> GetEstadisticas([FromQuery] long? tipoGobiernoId, [FromQuery] long? usuarioId, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetEstadisticasGobernanzaQuery
        {
            TipoGobiernoId = tipoGobiernoId,
            UsuarioId = usuarioId
        }, ct);
        return Ok(dto);
    }

    // Comando: asignar gobernanza
    [HttpPost("asignar")]
    public async Task<ActionResult<long>> Asignar([FromBody] AsignarGobernanzaCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    // Comando: transferir gobernanza
    [HttpPost("transferir")]
    public async Task<ActionResult> Transferir([FromBody] TransferirGobernanzaCommand command, CancellationToken ct)
    {
        var ok = await _mediator.Send(command, ct);
        return ok ? NoContent() : BadRequest("Transferencia no realizada");
    }

    // Comando: revocar gobernanza
    [HttpPost("revocar")]
    public async Task<ActionResult> Revocar([FromBody] RevocarGobernanzaCommand command, CancellationToken ct)
    {
        var ok = await _mediator.Send(command, ct);
        return ok ? NoContent() : BadRequest("Revocación no realizada");
    }
}