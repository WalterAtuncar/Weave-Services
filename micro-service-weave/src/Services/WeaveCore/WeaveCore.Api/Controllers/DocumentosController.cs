using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Domain.Common;
using WeaveCore.Domain.Entities.Documento;
using WeaveCore.Api.Features.Documento.Commands;
using WeaveCore.Api.Features.Documento.Dtos;
using Shared.Application.Services;

namespace WeaveCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentosController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserContextService _userContext;

    public DocumentosController(IMediator mediator, IUserContextService userContext)
    {
        _mediator = mediator;
        _userContext = userContext;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<Documentos?>> GetById(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Documentos>(id), ct);
        if (entity is null) return NotFound();
        return Ok(entity);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Documentos>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListEntitiesPaginatedQuery<Documentos>(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] Documentos entity, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateEntityCommand<Documentos>(entity), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IReadOnlyList<long>>> CreateMany([FromBody] IReadOnlyCollection<Documentos> entities, CancellationToken ct)
    {
        var ids = await _mediator.Send(new CreateEntitiesCommand<Documentos>(entities), ct);
        return Ok(ids);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> Update(long id, [FromBody] Documentos entity, CancellationToken ct)
    {
        entity.DocumentoId = id;
        var rows = await _mediator.Send(new UpdateEntityCommand<Documentos>(entity), ct);
        if (rows == 0) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id, CancellationToken ct)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Documentos>(id), ct);
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<Documentos>(entity), ct);
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }

    // Endpoint especializado de negocio para actualización con gobernanza/workflow
    [HttpPut("negocio")]
    public async Task<ActionResult> UpdateNegocio([FromBody] UpdateDocumentoNegocioRequest request, CancellationToken ct)
    {
        var usuarioId = _userContext.GetUserId();
        if (usuarioId is null || usuarioId <= 0) return Forbid();

        var cmd = new UpdateDocumentoNegocioCommand
        {
            DocumentoId = request.DocumentoId,
            OrganizacionId = request.OrganizacionId,
            NombreDocumento = request.NombreDocumento,
            Descripcion = request.Descripcion,
            CarpetaId = request.CarpetaId,
            Estado = request.Estado,
            UsuarioId = (long)usuarioId,
            GobernanzaId = request.GobernanzaId,
            WorkflowEjecucionId = request.WorkflowEjecucionId,
            AccionWorkflow = request.AccionWorkflow,
            Observaciones = request.Observaciones
        };

        var ok = await _mediator.Send(cmd, ct);
        return ok ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
}