using MediatR;
using Microsoft.Extensions.Logging;
using Shared.Infrastructure.Workflow;
using Shared.Domain.Common;
using WeaveCore.Api.Features.DominioData.Commands;
using WeaveCore.Api.Infrastructure.Clients;
using WeaveCore.Domain.Entities.Datos;
using DominioDataEntity = WeaveCore.Domain.Entities.Datos.DominioData;
using Shared.Application.Queries;
using Shared.Application.Commands;

namespace WeaveCore.Api.Features.DominioData.Handlers;

public class UpdateDominioDataNegocioHandler : IRequestHandler<UpdateDominioDataNegocioCommand, bool>
{
    private readonly IMediator _mediator;
    private readonly IGobernanzaWorkflowService _workflowService;
    private readonly ICatalogoClient _catalogoClient;
    private readonly ILogger<UpdateDominioDataNegocioHandler> _logger;

    public UpdateDominioDataNegocioHandler(
        IMediator mediator,
        IGobernanzaWorkflowService workflowService,
        ICatalogoClient catalogoClient,
        ILogger<UpdateDominioDataNegocioHandler> logger)
    {
        _mediator = mediator;
        _workflowService = workflowService;
        _catalogoClient = catalogoClient;
        _logger = logger;
    }

    public async Task<bool> Handle(UpdateDominioDataNegocioCommand request, CancellationToken cancellationToken)
    {
        // 1) Actualización principal vía handler genérico + auditoría
        _logger.LogInformation("Actualizando DominioData {DominioDataId} en Organizacion {OrganizacionId}", request.DominioDataId, request.OrganizacionId);

        var entity = await _mediator.Send(new GetEntityByIdQuery<DominioDataEntity>(request.DominioDataId), cancellationToken);
        if (entity is null)
        {
            _logger.LogWarning("DominioData {DominioDataId} no encontrado", request.DominioDataId);
            return false;
        }
        if (entity.OrganizacionId != request.OrganizacionId)
        {
            _logger.LogWarning("DominioData {DominioDataId} no pertenece a Organizacion {OrganizacionId}", request.DominioDataId, request.OrganizacionId);
            return false;
        }

        if (!string.IsNullOrWhiteSpace(request.CodigoDominio))
            entity.Codigo = request.CodigoDominio!;
        if (!string.IsNullOrWhiteSpace(request.NombreDominio))
            entity.Nombre = request.NombreDominio!;
        if (request.DescripcionDominio is not null)
            entity.Descripcion = request.DescripcionDominio;
        if (request.TipoDominioId.HasValue)
            entity.TipoDominioId = request.TipoDominioId.Value;

        entity.Estado = request.Estado;
        entity.ActualizadoPor = request.UsuarioId;
        entity.FechaActualizacion = DateTime.UtcNow;

        var rows = await _mediator.Send(new UpdateEntityCommand<DominioDataEntity>(entity), cancellationToken);
        if (rows <= 0)
        {
            _logger.LogWarning("Update genérico no afectó filas para DominioData {DominioDataId}", request.DominioDataId);
            return false;
        }

        // 2) Orquestación de GobernanzaEntidad vía Catalogo.Api
        try
        {
            if (request.GobernanzaId.HasValue && request.GobernanzaId.Value > 0)
            {
                long? asociacionActivaId = null;
                long? asociacionActivaGobId = null;
                var filtrado = await _catalogoClient.ListGobernanzaEntidadAsync("DominioData", request.DominioDataId, true, page: 1, pageSize: 1, cancellationToken);
                var match = filtrado.Items.FirstOrDefault();
                if (match != null)
                {
                    asociacionActivaId = match.GobernanzaEntidadId;
                    asociacionActivaGobId = match.GobernanzaId;
                }

                if (asociacionActivaId is null)
                {
                    await _catalogoClient.CreateGobernanzaEntidadAsync(new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaId = request.GobernanzaId.Value,
                        EntidadId = request.DominioDataId,
                        TipoEntidad = "DominioData",
                        FechaAsociacion = DateTime.UtcNow,
                        EsActiva = true,
                        Observaciones = request.Observaciones
                    }, cancellationToken);
                }
                else if (asociacionActivaGobId != request.GobernanzaId.Value)
                {
                    await _catalogoClient.UpdateGobernanzaEntidadAsync(asociacionActivaId.Value, new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaEntidadId = asociacionActivaId.Value,
                        GobernanzaId = asociacionActivaGobId!.Value,
                        EntidadId = request.DominioDataId,
                        TipoEntidad = "DominioData",
                        FechaAsociacion = DateTime.UtcNow,
                        FechaDesasociacion = DateTime.UtcNow,
                        EsActiva = false,
                        Observaciones = request.Observaciones
                    }, cancellationToken);

                    await _catalogoClient.CreateGobernanzaEntidadAsync(new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaId = request.GobernanzaId.Value,
                        EntidadId = request.DominioDataId,
                        TipoEntidad = "DominioData",
                        FechaAsociacion = DateTime.UtcNow,
                        EsActiva = true,
                        Observaciones = request.Observaciones
                    }, cancellationToken);
                }
                else
                {
                    await _catalogoClient.UpdateGobernanzaEntidadAsync(asociacionActivaId.Value, new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaEntidadId = asociacionActivaId.Value,
                        GobernanzaId = request.GobernanzaId.Value,
                        EntidadId = request.DominioDataId,
                        TipoEntidad = "DominioData",
                        FechaAsociacion = DateTime.UtcNow,
                        FechaDesasociacion = null,
                        EsActiva = true,
                        Observaciones = request.Observaciones
                    }, cancellationToken);
                }
            }
            else
            {
                long? asociacionActivaId = null;
                var filtrado = await _catalogoClient.ListGobernanzaEntidadAsync("DominioData", request.DominioDataId, true, page: 1, pageSize: 1, cancellationToken);
                var match = filtrado.Items.FirstOrDefault();
                if (match != null)
                {
                    asociacionActivaId = match.GobernanzaEntidadId;
                }

                if (asociacionActivaId.HasValue)
                {
                    await _catalogoClient.UpdateGobernanzaEntidadAsync(asociacionActivaId.Value, new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaEntidadId = asociacionActivaId.Value,
                        FechaDesasociacion = DateTime.UtcNow,
                        EsActiva = false,
                        TipoEntidad = "DominioData"
                    }, cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error orquestando GobernanzaEntidad para DominioData {DominioDataId}", request.DominioDataId);
        }

        // 3) Orquestación de workflow
        // 3.1) Iniciar workflow cuando Estado == -3 y hay GobernanzaId
        try
        {
            if (request.Estado == -3 && request.GobernanzaId.HasValue && request.GobernanzaId.Value > 0)
            {
                _logger.LogInformation("Iniciando workflow para DominioData {DominioDataId} con Gobernanza {GobernanzaId}", request.DominioDataId, request.GobernanzaId.Value);

                var accionTexto = string.IsNullOrWhiteSpace(request.AccionWorkflow)
                    ? ($"Editar DominioData, {entity.Nombre}")
                    : request.AccionWorkflow!;

                var workflowId = await _workflowService.IniciarWorkflowAsync(
                    request.GobernanzaId.Value,
                    request.DominioDataId,
                    accionTexto,
                    request.UsuarioId,
                    cancellationToken);

                _logger.LogInformation("Workflow iniciado. GobernanzaWorkflowId={WorkflowId} para DominioData {DominioDataId}", workflowId, request.DominioDataId);

                // Actualizar estado del dominio a Pendiente (-2)
                entity.Estado = -2;
                entity.FechaActualizacion = DateTime.UtcNow;
                entity.ActualizadoPor = request.UsuarioId;
                await _mediator.Send(new UpdateEntityCommand<DominioDataEntity>(entity), cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error iniciando workflow para DominioData {DominioDataId}", request.DominioDataId);
        }

        // 3.2) Avanzar workflow si corresponde
        try
        {
            if (request.WorkflowEjecucionId.HasValue && request.WorkflowEjecucionId.Value > 0)
            {
                await _workflowService.AvanzarWorkflowAsync(
                    request.WorkflowEjecucionId.Value,
                    request.UsuarioId,
                    request.Observaciones,
                    sistemaId: null,
                    nombreSistema: null,
                    accionWorkflow: request.AccionWorkflow ?? "ACTUALIZAR_DOMINIODATA",
                    cancellationToken: cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error avanzando workflow para DominioData {DominioDataId}", request.DominioDataId);
        }

        return true;
    }
}