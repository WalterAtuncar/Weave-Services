using MediatR;
using Microsoft.Extensions.Logging;
using Shared.Infrastructure.Workflow;
using Shared.Domain.Common;
using WeaveCore.Api.Features.Documento.Commands;
using WeaveCore.Api.Infrastructure.Clients;
using WeaveCore.Domain.Entities.Documento;
using Shared.Application.Queries;
using Shared.Application.Commands;

namespace WeaveCore.Api.Features.Documento.Handlers;

public class UpdateDocumentoNegocioHandler : IRequestHandler<UpdateDocumentoNegocioCommand, bool>
{
    private readonly IMediator _mediator;
    private readonly IGobernanzaWorkflowService _workflowService;
    private readonly ICatalogoClient _catalogoClient;
    private readonly ILogger<UpdateDocumentoNegocioHandler> _logger;

    public UpdateDocumentoNegocioHandler(
        IMediator mediator,
        IGobernanzaWorkflowService workflowService,
        ICatalogoClient catalogoClient,
        ILogger<UpdateDocumentoNegocioHandler> logger)
    {
        _mediator = mediator;
        _workflowService = workflowService;
        _catalogoClient = catalogoClient;
        _logger = logger;
    }

    public async Task<bool> Handle(UpdateDocumentoNegocioCommand request, CancellationToken cancellationToken)
    {
        // 1) Actualización principal vía handler genérico + auditoría
        _logger.LogInformation("Actualizando Documento {DocumentoId} en Organizacion {OrganizacionId}", request.DocumentoId, request.OrganizacionId);

        var entity = await _mediator.Send(new GetEntityByIdQuery<Documentos>(request.DocumentoId), cancellationToken);
        if (entity is null)
        {
            _logger.LogWarning("Documento {DocumentoId} no encontrado", request.DocumentoId);
            return false;
        }
        if (entity.OrganizacionId != request.OrganizacionId)
        {
            _logger.LogWarning("Documento {DocumentoId} no pertenece a Organizacion {OrganizacionId}", request.DocumentoId, request.OrganizacionId);
            return false;
        }

        if (!string.IsNullOrWhiteSpace(request.NombreDocumento))
            entity.NombreDocumento = request.NombreDocumento!;
        if (request.Descripcion is not null)
            entity.DescripcionDocumento = request.Descripcion;
        if (request.CarpetaId.HasValue)
            entity.CarpetaId = request.CarpetaId.Value;
        entity.Estado = request.Estado;
        entity.ActualizadoPor = request.UsuarioId;
        entity.FechaActualizacion = DateTime.UtcNow;

        var rows = await _mediator.Send(new UpdateEntityCommand<Documentos>(entity), cancellationToken);
        if (rows <= 0)
        {
            _logger.LogWarning("Update genérico no afectó filas para Documento {DocumentoId}", request.DocumentoId);
            return false;
        }

        // 2) Orquestación de GobernanzaEntidad vía Catalogo.Api
        try
        {
            if (request.GobernanzaId.HasValue && request.GobernanzaId.Value > 0)
            {
                // Buscar asociación activa para el documento usando filtros (sin bucles)
                long? asociacionActivaId = null;
                long? asociacionActivaGobId = null;
                var filtrado = await _catalogoClient.ListGobernanzaEntidadAsync("Documento", request.DocumentoId, true, page: 1, pageSize: 1, cancellationToken);
                var match = filtrado.Items.FirstOrDefault();
                if (match != null)
                {
                    asociacionActivaId = match.GobernanzaEntidadId;
                    asociacionActivaGobId = match.GobernanzaId;
                }

                if (asociacionActivaId is null)
                {
                    // Crear nueva asociación
                    await _catalogoClient.CreateGobernanzaEntidadAsync(new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaId = request.GobernanzaId.Value,
                        EntidadId = request.DocumentoId,
                        TipoEntidad = "Documento",
                        FechaAsociacion = DateTime.UtcNow,
                        EsActiva = true,
                        Observaciones = request.Observaciones
                    }, cancellationToken);
                }
                else if (asociacionActivaGobId != request.GobernanzaId.Value)
                {
                    // Desactivar anterior y crear nueva
                    await _catalogoClient.UpdateGobernanzaEntidadAsync(asociacionActivaId.Value, new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaEntidadId = asociacionActivaId.Value,
                        GobernanzaId = asociacionActivaGobId!.Value,
                        EntidadId = request.DocumentoId,
                        TipoEntidad = "Documento",
                        FechaAsociacion = DateTime.UtcNow,
                        FechaDesasociacion = DateTime.UtcNow,
                        EsActiva = false,
                        Observaciones = request.Observaciones
                    }, cancellationToken);

                    await _catalogoClient.CreateGobernanzaEntidadAsync(new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaId = request.GobernanzaId.Value,
                        EntidadId = request.DocumentoId,
                        TipoEntidad = "Documento",
                        FechaAsociacion = DateTime.UtcNow,
                        EsActiva = true,
                        Observaciones = request.Observaciones
                    }, cancellationToken);
                }
                else
                {
                    // Ya asociada al mismo gobierno, asegurar activa
                    await _catalogoClient.UpdateGobernanzaEntidadAsync(asociacionActivaId.Value, new Infrastructure.Clients.GobernanzaEntidadSyncDto
                    {
                        GobernanzaEntidadId = asociacionActivaId.Value,
                        GobernanzaId = request.GobernanzaId.Value,
                        EntidadId = request.DocumentoId,
                        TipoEntidad = "Documento",
                        FechaAsociacion = DateTime.UtcNow,
                        FechaDesasociacion = null,
                        EsActiva = true,
                        Observaciones = request.Observaciones
                    }, cancellationToken);
                }
            }
            else
            {
                // Si no se especifica gobernanza, intentar desactivar cualquier asociación activa
                long? asociacionActivaId = null;
                var filtrado = await _catalogoClient.ListGobernanzaEntidadAsync("Documento", request.DocumentoId, true, page: 1, pageSize: 1, cancellationToken);
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
                        TipoEntidad = "Documento"
                    }, cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error orquestando GobernanzaEntidad para Documento {DocumentoId}", request.DocumentoId);
            // No se hace rollback del SP; la sincronización puede reintentar luego
        }

        // 3) Orquestación de workflow (iniciar/avanzar)
        // 3.1) Iniciar workflow cuando Estado == -3 y hay GobernanzaId
        try
        {
            if (request.Estado == -3 && request.GobernanzaId.HasValue && request.GobernanzaId.Value > 0)
            {
                _logger.LogInformation("Iniciando workflow para Documento {DocumentoId} con Gobernanza {GobernanzaId}", request.DocumentoId, request.GobernanzaId.Value);

                var accionTexto = string.IsNullOrWhiteSpace(request.AccionWorkflow)
                    ? ($"Editar Documento, {entity.NombreDocumento}")
                    : request.AccionWorkflow!;

                var workflowId = await _workflowService.IniciarWorkflowAsync(
                    request.GobernanzaId.Value,
                    request.DocumentoId,
                    accionTexto,
                    request.UsuarioId,
                    cancellationToken);

                _logger.LogInformation("Workflow iniciado. GobernanzaWorkflowId={WorkflowId} para Documento {DocumentoId}", workflowId, request.DocumentoId);

                // Actualizar estado del documento a Pendiente (-2)
                entity.Estado = -2;
                entity.FechaActualizacion = DateTime.UtcNow;
                entity.ActualizadoPor = request.UsuarioId;
                await _mediator.Send(new UpdateEntityCommand<Documentos>(entity), cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error iniciando workflow para Documento {DocumentoId}", request.DocumentoId);
            // No bloquear por fallo de inicio; el cliente puede reintentar
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
                    accionWorkflow: request.AccionWorkflow ?? "ACTUALIZAR_DOCUMENTO",
                    cancellationToken: cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error avanzando workflow para Documento {DocumentoId}", request.DocumentoId);
            // No bloquear por fallo de notificación/workflow
        }

        return true;
    }
}