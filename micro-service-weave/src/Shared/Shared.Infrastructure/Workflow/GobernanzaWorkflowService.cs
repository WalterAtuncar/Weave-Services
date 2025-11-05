using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.StoredProcedures;
using Shared.Infrastructure.UnitOfWork;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using WeaveCore.Domain.Entities.Gobernanza;
using Identity.Domain.Entities;
using System.Linq;

namespace Shared.Infrastructure.Workflow;

public class GobernanzaWorkflowService : IGobernanzaWorkflowService
{
    private readonly IStoredProcedureExecutor _spExecutor;
    private readonly IUnitOfWork _uow;
    private readonly IGenericRepository<GobernanzaWorkflowEjecucion> _ejecucionRepo;
    private readonly IGenericRepository<GobernanzaWorkflow> _workflowRepo;
    private readonly IGenericRepository<Gobernanza> _gobernanzaRepo;
    private readonly INotificacionWorkflow _notificaciones;
    private readonly ILogger<GobernanzaWorkflowService> _logger;
    private readonly IGenericRepository<Usuarios> _usuariosRepo;
    private readonly IGenericRepository<Personas> _personasRepo;
    private readonly IGenericRepository<EmailActionToken> _emailTokenRepo;
    private readonly IConfiguration _configuration;

    private const string LOGO_PRINCIPAL_URL = "https://res.cloudinary.com/daibn7axq/image/upload/v1754548678/logow-light_q3x6ru.png";
    private const string LOGO_COMBINADO_URL = "https://res.cloudinary.com/daibn7axq/image/upload/v1754548706/logoww2-light_zmgqwi.png";

    public GobernanzaWorkflowService(
        IStoredProcedureExecutor spExecutor,
        IUnitOfWork uow,
        IGenericRepository<GobernanzaWorkflowEjecucion> ejecucionRepo,
        IGenericRepository<GobernanzaWorkflow> workflowRepo,
        IGenericRepository<Gobernanza> gobernanzaRepo,
        INotificacionWorkflow notificaciones,
        ILogger<GobernanzaWorkflowService> logger,
        IGenericRepository<Usuarios> usuariosRepo,
        IGenericRepository<Personas> personasRepo,
        IGenericRepository<EmailActionToken> emailTokenRepo,
        IConfiguration configuration)
    {
        _spExecutor = spExecutor;
        _uow = uow;
        _ejecucionRepo = ejecucionRepo;
        _workflowRepo = workflowRepo;
        _gobernanzaRepo = gobernanzaRepo;
        _notificaciones = notificaciones;
        _logger = logger;
        _usuariosRepo = usuariosRepo;
        _personasRepo = personasRepo;
        _emailTokenRepo = emailTokenRepo;
        _configuration = configuration;
    }

    public async Task<long> IniciarWorkflowAsync(
        long gobernanzaId,
        long entidadId,
        string accionWorkflow,
        long usuarioIniciadorId,
        CancellationToken cancellationToken = default)
    {
        var p = new DynamicParameters();
        p.Add("@GobernanzaId", gobernanzaId, DbType.Int64);
        p.Add("@EntidadId", entidadId, DbType.Int64);
        p.Add("@AccionWorkflow", accionWorkflow, DbType.String);
        p.Add("@UsuarioIniciadorId", usuarioIniciadorId, DbType.Int64);

        _logger.LogInformation("Iniciando workflow para GobernanzaId={GobernanzaId}, EntidadId={EntidadId}, Accion={Accion} por UsuarioId={Usuario}", gobernanzaId, entidadId, accionWorkflow, usuarioIniciadorId);
        var workflowId = await _spExecutor.QuerySingleOrDefaultAsync<long>(
            "Proceso.sp_IniciarWorkflow",
            p,
            cancellationToken);

        if (workflowId <= 0)
        {
            _logger.LogWarning("No se pudo iniciar el workflow para GobernanzaId={GobernanzaId}", gobernanzaId);
            return 0L;
        }

        // Cargar ejecuciones activas iniciales para notificar
        var p2 = new DynamicParameters();
        p2.Add("@GobernanzaWorkflowId", workflowId, DbType.Int64);

        var activas = await _spExecutor.QueryAsync<(long WorkflowEjecucionId, long UsuarioActualId, int OrdenEjecucion)>(
            "Proceso.sp_GetEjecucionesActivasPorWorkflow",
            p2,
            cancellationToken);

        // Armar contenido de notificaciones
        var gob = await _gobernanzaRepo.GetByIdAsync(gobernanzaId, cancellationToken);
        var tipoEntidadNombre = ObtenerNombreTipoEntidad(gob?.TipoEntidadId ?? 0L);
        var accionFmt = ObtenerAccionFormateada(accionWorkflow ?? string.Empty);

        foreach (var act in activas)
        {
            var nombreDestinatario = await GetUsuarioNombreAsync(act.UsuarioActualId, cancellationToken) ?? "Usuario";
            var asunto = $"Nueva Tarea de Aprobación - {tipoEntidadNombre} #{entidadId}";
            var cuerpo = await GenerarHtmlNuevaTareaAsync(nombreDestinatario, tipoEntidadNombre, entidadId, accionFmt, act.OrdenEjecucion, workflowId, act.UsuarioActualId, cancellationToken);
            await _notificaciones.NotificarAsignacionAsync(act.UsuarioActualId, asunto, cuerpo, act.WorkflowEjecucionId, cancellationToken);
        }

        return workflowId;
    }

    public async Task AvanzarWorkflowAsync(
        long workflowEjecucionId,
        long usuarioId,
        string? observaciones = null,
        long? sistemaId = null,
        string? nombreSistema = null,
        string? accionWorkflow = null,
        long? usuarioSolicitanteId = null,
        string? emailSolicitante = null,
        string? nombreSolicitante = null,
        long? gobernanzaWorkflowId = null,
        CancellationToken cancellationToken = default)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@WorkflowEjecucionId", workflowEjecucionId, DbType.Int64);
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@Observaciones", observaciones, DbType.String);

        _logger.LogInformation("Aprobando tarea WorkflowEjecucionId={Id} por UsuarioId={Usuario}. Accion={Accion}, SistemaId={SistemaId}, NombreSistema={NombreSistema}",
            workflowEjecucionId, usuarioId, accionWorkflow, sistemaId, nombreSistema);
        await _spExecutor.ExecuteAsync("Proceso.sp_AprobarTareaWorkflow", parameters, cancellationToken);

        // Post-aprobación: cargar ejecución para notificar siguiente asignado si existe
        var ejecucion = await _ejecucionRepo.GetByIdAsync(workflowEjecucionId, cancellationToken);
        if (ejecucion is null)
        {
            _logger.LogWarning("No se encontró la ejecución {Id} tras la aprobación", workflowEjecucionId);
            return;
        }

        // Notificar siguiente usuario si está definido
        if (ejecucion.UsuarioSiguienteId.HasValue)
        {
            var wfId = gobernanzaWorkflowId ?? ejecucion.GobernanzaWorkflowId;
            var wf = await _workflowRepo.GetByIdAsync(wfId, cancellationToken);
            var gob = wf is not null ? await _gobernanzaRepo.GetByIdAsync(wf.GobernanzaId, cancellationToken) : null;
            var tipoEntidadNombre = ObtenerNombreTipoEntidad(gob?.TipoEntidadId ?? 0L);
            var entidadId = gob?.GobernanzaId ?? wfId;
            var accionFmt = ObtenerAccionFormateada(accionWorkflow ?? string.Empty);
            var nivelTarea = ejecucion.WorkflowGrupoId.HasValue ? (int)ejecucion.WorkflowGrupoId.Value : 0;
            var nombreDestinatario = await GetUsuarioNombreAsync(ejecucion.UsuarioSiguienteId.Value, cancellationToken) ?? "Usuario";

            var asunto = $"Nueva Tarea de Aprobación - {tipoEntidadNombre} #{entidadId}";
            var cuerpo = await GenerarHtmlNuevaTareaAsync(nombreDestinatario, tipoEntidadNombre, entidadId, accionFmt, nivelTarea, wfId, ejecucion.UsuarioSiguienteId.Value, cancellationToken);
            await _notificaciones.NotificarAsignacionAsync(ejecucion.UsuarioSiguienteId.Value, asunto, cuerpo, workflowEjecucionId, cancellationToken);

            // Notificar al solicitante, si existe, con plantilla de tarea completada
            if (usuarioSolicitanteId.HasValue)
            {
                var nombreSol = nombreSolicitante ?? await GetUsuarioNombreAsync(usuarioSolicitanteId.Value, cancellationToken) ?? "Usuario";
                var asuntoSol = $"Tarea Aprobada - {tipoEntidadNombre} #{entidadId}";
                var cuerpoSol = GenerarHtmlTareaCompletada(nombreSol, tipoEntidadNombre, entidadId, accionFmt, nivelTarea, wfId, observaciones);
                await _notificaciones.NotificarAsignacionAsync(usuarioSolicitanteId.Value, asuntoSol, cuerpoSol, workflowEjecucionId, cancellationToken);
            }
        }

        // Si no hay siguiente usuario, se asume cierre de workflow actual; actualizar gobernanza si aplica
        if (!ejecucion.UsuarioSiguienteId.HasValue)
        {
            var wfId = gobernanzaWorkflowId ?? ejecucion.GobernanzaWorkflowId;
            var wf = await _workflowRepo.GetByIdAsync(wfId, cancellationToken);
            if (wf != null)
            {
                // Actualización simple de estado/observaciones en Gobernanza (ejemplo); usar repositorio genérico
                var gobUpdate = await _gobernanzaRepo.GetByIdAsync(wf.GobernanzaId, cancellationToken);
                if (gobUpdate != null)
                {
                    gobUpdate.Estado = 1; // activo
                    gobUpdate.Version = (gobUpdate.Version <= 0 ? 1 : gobUpdate.Version + 1);
                    var extraObs = string.IsNullOrWhiteSpace(accionWorkflow) ? string.Empty : $"\nAcción: {accionWorkflow}";
                    if (!string.IsNullOrWhiteSpace(nombreSistema))
                    {
                        extraObs += $"\nSistema: {nombreSistema}" + (sistemaId.HasValue ? $" (ID: {sistemaId})" : string.Empty);
                    }
                    gobUpdate.Observaciones = (gobUpdate.Observaciones ?? string.Empty)
                        + (string.IsNullOrWhiteSpace(observaciones) ? string.Empty : ("\n" + observaciones))
                        + extraObs;
                    gobUpdate.ActualizadoPor = usuarioId;
                    gobUpdate.FechaActualizacion = DateTime.UtcNow;

                    _uow.Begin();
                    try
                    {
                        await _gobernanzaRepo.UpdateAsync(gobUpdate, cancellationToken);
                        _uow.Commit();
                    }
                    catch
                    {
                        _uow.Rollback();
                        throw;
                    }
                }

                // Notificar cierre al usuario actual (opcional) con HTML replicado
                var wf2 = await _workflowRepo.GetByIdAsync(wfId, cancellationToken);
                var gob2 = wf2 is not null ? await _gobernanzaRepo.GetByIdAsync(wf2.GobernanzaId, cancellationToken) : null;
                var tipoEntidadNombre2 = ObtenerNombreTipoEntidad(gob2?.TipoEntidadId ?? 0L);
                var entidadId2 = gob2?.GobernanzaId ?? wfId;
                var accionFmt2 = ObtenerAccionFormateada(accionWorkflow ?? string.Empty);
                var nivelTarea2 = ejecucion.WorkflowGrupoId.HasValue ? (int)ejecucion.WorkflowGrupoId.Value : 0;
                var nombreActor = await GetUsuarioNombreAsync(usuarioId, cancellationToken) ?? "Usuario";
                var asuntoCierre = $"Tarea Aprobada - {tipoEntidadNombre2} #{entidadId2}";
                var cuerpoCierre = GenerarHtmlTareaCompletada(nombreActor, tipoEntidadNombre2, entidadId2, accionFmt2, nivelTarea2, wfId, observaciones);
                await _notificaciones.NotificarCierreAsync(usuarioId, asuntoCierre, cuerpoCierre, workflowEjecucionId, cancellationToken);

                // Notificar cierre al solicitante si corresponde
                if (usuarioSolicitanteId.HasValue)
                {
                    var nombreSol2 = nombreSolicitante ?? await GetUsuarioNombreAsync(usuarioSolicitanteId.Value, cancellationToken) ?? "Usuario";
                    var cuerpoSol2 = GenerarHtmlTareaCompletada(nombreSol2, tipoEntidadNombre2, entidadId2, accionFmt2, nivelTarea2, wfId, observaciones);
                    await _notificaciones.NotificarCierreAsync(usuarioSolicitanteId.Value, asuntoCierre, cuerpoSol2, workflowEjecucionId, cancellationToken);
                }
            }
        }
    }

    public async Task RechazarWorkflowAsync(
        long workflowEjecucionId,
        long usuarioId,
        string? motivoRechazo = null,
        long? sistemaId = null,
        string? nombreSistema = null,
        string? accionWorkflow = null,
        long? usuarioSolicitanteId = null,
        string? emailSolicitante = null,
        string? nombreSolicitante = null,
        long? gobernanzaWorkflowId = null,
        CancellationToken cancellationToken = default)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@WorkflowEjecucionId", workflowEjecucionId, DbType.Int64);
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@MotivoRechazo", motivoRechazo, DbType.String);

        _logger.LogInformation(
            "Rechazando tarea WorkflowEjecucionId={Id} por UsuarioId={Usuario}. Accion={Accion}, SistemaId={SistemaId}, NombreSistema={NombreSistema}",
            workflowEjecucionId, usuarioId, accionWorkflow, sistemaId, nombreSistema);
        await _spExecutor.ExecuteAsync("Proceso.sp_RechazarTareaWorkflow", parameters, cancellationToken);

        // Post-rechazo: cargar ejecución para notificaciones y actualización
        var ejecucion = await _ejecucionRepo.GetByIdAsync(workflowEjecucionId, cancellationToken);
        if (ejecucion is null)
        {
            _logger.LogWarning("No se encontró la ejecución {Id} tras el rechazo", workflowEjecucionId);
            return;
        }

        var wfId = gobernanzaWorkflowId ?? ejecucion.GobernanzaWorkflowId;
        var wfEntity = await _workflowRepo.GetByIdAsync(wfId, cancellationToken);
        var gob = wfEntity is not null ? await _gobernanzaRepo.GetByIdAsync(wfEntity.GobernanzaId, cancellationToken) : null;
        var tipoEntidadNombre = ObtenerNombreTipoEntidad(gob?.TipoEntidadId ?? 0L);
        var entidadId = gob?.GobernanzaId ?? wfId;
        var accionFmt = ObtenerAccionFormateada(accionWorkflow ?? string.Empty);
        var nivelTarea = ejecucion.WorkflowGrupoId.HasValue ? (int)ejecucion.WorkflowGrupoId.Value : 0;

        // Notificar al solicitante si existe
        if (usuarioSolicitanteId.HasValue)
        {
            var nombreSol = nombreSolicitante ?? await GetUsuarioNombreAsync(usuarioSolicitanteId.Value, cancellationToken) ?? "Usuario";
            var asuntoSol = $"Tarea Rechazada - {tipoEntidadNombre} #{entidadId}";
            var cuerpoSol = GenerarHtmlTareaRechazada(nombreSol, tipoEntidadNombre, entidadId, accionFmt, nivelTarea, wfId, motivoRechazo ?? string.Empty);
            await _notificaciones.NotificarCierreAsync(usuarioSolicitanteId.Value, asuntoSol, cuerpoSol, workflowEjecucionId, cancellationToken);
        }

        // Notificar al usuario actual (quien rechaza)
        var nombreActor = await GetUsuarioNombreAsync(usuarioId, cancellationToken) ?? "Usuario";
        var asunto = $"Tarea Rechazada - {tipoEntidadNombre} #{entidadId}";
        var cuerpo = GenerarHtmlTareaRechazada(nombreActor, tipoEntidadNombre, entidadId, accionFmt, nivelTarea, wfId, motivoRechazo ?? string.Empty);
        await _notificaciones.NotificarCierreAsync(usuarioId, asunto, cuerpo, workflowEjecucionId, cancellationToken);

        // Actualizar gobernanza con observaciones de rechazo
        var wf = await _workflowRepo.GetByIdAsync(wfId, cancellationToken);
        if (wf != null)
        {
            var gobUpdate = await _gobernanzaRepo.GetByIdAsync(wf.GobernanzaId, cancellationToken);
            if (gobUpdate != null)
            {
                gobUpdate.Version = (gobUpdate.Version <= 0 ? 1 : gobUpdate.Version + 1);
                var extraObs = string.IsNullOrWhiteSpace(accionWorkflow) ? string.Empty : $"\nAcción: {accionWorkflow}";
                if (!string.IsNullOrWhiteSpace(nombreSistema))
                {
                    extraObs += $"\nSistema: {nombreSistema}" + (sistemaId.HasValue ? $" (ID: {sistemaId})" : string.Empty);
                }
                var motivo = string.IsNullOrWhiteSpace(motivoRechazo) ? "(sin motivo)" : motivoRechazo;
                gobUpdate.Observaciones = (gobUpdate.Observaciones ?? string.Empty) + $"\nRechazo: {motivo}" + extraObs;
                gobUpdate.ActualizadoPor = usuarioId;
                gobUpdate.FechaActualizacion = DateTime.UtcNow;

                _uow.Begin();
                try
                {
                    await _gobernanzaRepo.UpdateAsync(gobUpdate, cancellationToken);
                    _uow.Commit();
                }
                catch
                {
                    _uow.Rollback();
                    throw;
                }
            }
        }
    }
    // ====== Helpers: Paridad HTML con monolito ======
    private string ObtenerNombreTipoEntidad(long tipoEntidad)
    {
        return tipoEntidad switch
        {
            1L => "Sistema",
            2L => "Organización",
            3L => "Dominio de Datos",
            4L => "Documentos",
            5L => "Usuario",
            _ => "Entidad"
        };
    }

    private string ObtenerAccionFormateada(string accionWorkflow)
    {
        return (accionWorkflow ?? string.Empty).ToUpper() switch
        {
            "ACTUALIZAR" => "Actualización",
            "CREAR" => "Creación",
            "ELIMINAR" => "Eliminación",
            "ACTIVAR" => "Activación",
            "DESACTIVAR" => "Desactivación",
            _ => accionWorkflow ?? string.Empty
        };
    }

    private async Task<string?> GetUsuarioNombreAsync(long usuarioId, CancellationToken ct)
    {
        var usuario = await _usuariosRepo.GetByIdAsync(usuarioId, ct);
        if (usuario is null || !usuario.PersonaId.HasValue) return null;
        var persona = await _personasRepo.GetByIdAsync(usuario.PersonaId.Value, ct);
        if (persona is null) return null;
        var nombre = string.Join(" ", new[] { persona.Nombres, persona.ApellidoPaterno, persona.ApellidoMaterno }.Where(s => !string.IsNullOrWhiteSpace(s)));
        return string.IsNullOrWhiteSpace(nombre) ? (persona.Nombres ?? persona.ApellidoPaterno ?? persona.ApellidoMaterno) : nombre;
    }

    private async Task<EmailActionToken> GenerarTokenAsync(long workflowId, long usuarioId, string tipoAccion, CancellationToken ct)
    {
        var token = Guid.NewGuid().ToString("N");
        var ahora = DateTime.UtcNow;
        var expMinutesStr = _configuration["GobernanzaWorkflow:TokenExpirationMinutes"] ?? _configuration["EmailActionToken:ExpirationMinutes"];
        int expMinutes = int.TryParse(expMinutesStr, out var m) ? m : 60;

        var entity = new EmailActionToken
        {
            Token = token,
            InstanciaWorkflowId = workflowId,
            UsuarioId = usuarioId,
            TipoAccion = tipoAccion,
            FechaCreacion = ahora,
            FechaExpiracion = ahora.AddMinutes(expMinutes),
            Utilizado = false,
            Estado = 1,
            FechaCreacion_Base = ahora,
            Version = 1
        };

        await _emailTokenRepo.InsertAsync(entity, ct);
        return entity;
    }

    private string ObtenerBaseUrlGobernanza()
    {
        var fromConfig = _configuration["GobernanzaWorkflow:BaseUrl"]
                         ?? _configuration["ApiUrls:GobernanzaWorkflowBaseUrl"]
                         ?? _configuration["GobernanzaWorkflowBaseUrl"];
        if (!string.IsNullOrWhiteSpace(fromConfig))
        {
            return fromConfig!.TrimEnd('/');
        }
        return "http://walter150976-002-site2.ltempurl.com/api/GobernanzaWorkflow";
    }

    private async Task<string> GenerarHtmlNuevaTareaAsync(string nombreUsuario, string tipoEntidad, long entidadId,
        string accion, int nivelTarea, long workflowId, long usuarioId, CancellationToken ct)
    {
        var tokenAprobar = await GenerarTokenAsync(workflowId, usuarioId, "APROBAR", ct);
        var tokenRechazar = await GenerarTokenAsync(workflowId, usuarioId, "RECHAZAR", ct);

        var baseUrl = ObtenerBaseUrlGobernanza();
        var urlAprobar = $"{baseUrl}/email/aprobar/{tokenAprobar.Token}";
        var urlRechazar = $"{baseUrl}/email/rechazar/{tokenRechazar.Token}";

        return $@"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Nueva Tarea de Aprobación</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #414976; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .logo1 {{ width: 60px; height: auto; margin: 0 5px; display: inline-block; vertical-align: middle; }}
        .logo2 {{ width: 120px; height: auto; margin: 0 5px; display: inline-block; vertical-align: middle; }}
        .content {{ padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; }}
        .highlight {{ background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        .button {{ display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
        .button.reject {{ background-color: #f87171; color: white; }}
        .footer {{ background-color: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px; }}
    </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <img src='{LOGO_PRINCIPAL_URL}' alt='WeaveApp Logo' class='logo1'>
                <img src='{LOGO_COMBINADO_URL}' alt='WeaveApp Logo' class='logo2'>
                <h1>🔄 Nueva Tarea de Aprobación</h1>
            </div>
            <div class='content'>
                <p>Hola <strong>{nombreUsuario}</strong>,</p>
                <p>Se te ha asignado una nueva tarea de aprobación en el sistema de gobernanza.</p>
                <div class='highlight'>
                    <h3>📋 Detalles de la Tarea:</h3>
                    <ul>
                        <li><strong>Tipo de Entidad:</strong> {tipoEntidad}</li>
                        <li><strong>ID de Entidad:</strong> #{entidadId}</li>
                        <li><strong>Acción:</strong> {accion}</li>
                        <li><strong>Nivel de Aprobación:</strong> {nivelTarea}</li>
                        <li><strong>ID del Workflow:</strong> {workflowId}</li>
                    </ul>
                </div>
                <p>Por favor, revisa la solicitud y toma la acción correspondiente:</p>
                <div style='text-align: center; margin: 20px 0;'>
                    <a href='{urlAprobar}' class='button'>✅ Aprobar</a>
                    <a href='{urlRechazar}' class='button reject'>❌ Rechazar</a>
                </div>
                <p><strong>Nota:</strong> Esta tarea requiere tu atención inmediata para mantener el flujo de trabajo activo.</p>
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático del Sistema de Gestión de Procesos Weave</p>
                <p>Workflow ID: {workflowId} | Fecha: {DateTime.Now:dd/MM/yyyy HH:mm}</p>
                <div style='text-align: center; margin-top: 10px;'>
                    <img src='{LOGO_COMBINADO_URL}' alt='WeaveApp Logo' style='width: 120px; height: auto;'>
                </div>
            </div>
        </div>
    </body>
    </html>";
    }

    private string GenerarHtmlTareaCompletada(string nombreUsuario, string tipoEntidad, long entidadId,
        string accion, int nivelTarea, long workflowId, string? observaciones)
    {
        var observacionesHtml = !string.IsNullOrEmpty(observaciones)
            ? $"<li><strong>Observaciones:</strong> {observaciones}</li>"
            : "";

        return $@"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Tarea Aprobada</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #414976; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .logo1 {{ width: 60px; height: auto; margin: 0 5px; display: inline-block; vertical-align: middle; }}
        .logo2 {{ width: 120px; height: auto; margin: 0 5px; display: inline-block; vertical-align: middle; }}
        .content {{ padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; }}
        .highlight {{ background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        .footer {{ background-color: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px; }}
    </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <img src='{LOGO_PRINCIPAL_URL}' alt='WeaveApp Logo' class='logo1'>
                <img src='{LOGO_COMBINADO_URL}' alt='WeaveApp Logo' class='logo2'>
                <h1>✅ Tarea Aprobada</h1>
            </div>
            <div class='content'>
                <p>Hola <strong>{nombreUsuario}</strong>,</p>
                <p>Tu tarea de aprobación ha sido completada exitosamente.</p>
                <div class='highlight'>
                    <h3>📋 Detalles de la Aprobación:</h3>
                    <ul>
                        <li><strong>Tipo de Entidad:</strong> {tipoEntidad}</li>
                        <li><strong>ID de Entidad:</strong> #{entidadId}</li>
                        <li><strong>Acción:</strong> {accion}</li>
                        <li><strong>Nivel de Aprobación:</strong> {nivelTarea}</li>
                        <li><strong>ID del Workflow:</strong> {workflowId}</li>
                        {observacionesHtml}
                    </ul>
                </div>
                <p>El workflow continuará con el siguiente nivel de aprobación.</p>
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático del Sistema de Gestión de Procesos Weave</p>
                <p>Workflow ID: {workflowId} | Fecha: {DateTime.Now:dd/MM/yyyy HH:mm}</p>
                <div style='text-align: center; margin-top: 10px;'>
                    <img src='{LOGO_COMBINADO_URL}' alt='WeaveApp Logo' style='width: 120px; height: auto;'>
                </div>
            </div>
        </div>
    </body>
    </html>";
    }

    private string GenerarHtmlTareaRechazada(string nombreUsuario, string tipoEntidad, long entidadId,
        string accion, int nivelTarea, long workflowId, string motivoRechazo)
    {
        return $@"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Tarea Rechazada</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #414976; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .logo1 {{ width: 60px; height: auto; margin: 0 5px; display: inline-block; vertical-align: middle; }}
        .logo2 {{ width: 120px; height: auto; margin: 0 5px; display: inline-block; vertical-align: middle; }}
        .content {{ padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; }}
        .highlight {{ background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        .footer {{ background-color: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px; }}
    </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <img src='{LOGO_PRINCIPAL_URL}' alt='WeaveApp Logo' class='logo1'>
                <img src='{LOGO_COMBINADO_URL}' alt='WeaveApp Logo' class='logo2'>
                <h1>❌ Tarea Rechazada</h1>
            </div>
            <div class='content'>
                <p>Hola <strong>{nombreUsuario}</strong>,</p>
                <p>La tarea de aprobación ha sido rechazada.</p>
                <div class='highlight'>
                    <h3>📋 Detalles del Rechazo:</h3>
                    <ul>
                        <li><strong>Tipo de Entidad:</strong> {tipoEntidad}</li>
                        <li><strong>ID de Entidad:</strong> #{entidadId}</li>
                        <li><strong>Acción:</strong> {accion}</li>
                        <li><strong>Nivel de Aprobación:</strong> {nivelTarea}</li>
                        <li><strong>ID del Workflow:</strong> {workflowId}</li>
                        <li><strong>Motivo del Rechazo:</strong> {motivoRechazo}</li>
                    </ul>
                </div>
                <p>El workflow ha sido detenido. Contacta al solicitante para más información.</p>
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático del Sistema de Gestión de Procesos Weave</p>
                <p>Workflow ID: {workflowId} | Fecha: {DateTime.Now:dd/MM/yyyy HH:mm}</p>
                <div style='text-align: center; margin-top: 10px;'>
                    <img src='{LOGO_COMBINADO_URL}' alt='WeaveApp Logo' style='width: 120px; height: auto;'>
                </div>
            </div>
        </div>
    </body>
    </html>";
    }
}