using Identity.Domain.Entities;
using Microsoft.Extensions.Logging;
using Shared.Infrastructure.Email;
using Shared.Infrastructure.Repositories;
using System.Threading;
using System.Threading.Tasks;
using WeaveCore.Domain.Entities.Gobernanza;

namespace Shared.Infrastructure.Workflow;

public class NotificacionWorkflow : INotificacionWorkflow
{
    private readonly IGenericRepository<Usuarios> _usuariosRepo;
    private readonly IGenericRepository<Personas> _personasRepo;
    private readonly IGenericRepository<NotificacionGobernanza> _notifRepo;
    private readonly IEmailService _emailService;
    private readonly ILogger<NotificacionWorkflow> _logger;

    public NotificacionWorkflow(
        IGenericRepository<Usuarios> usuariosRepo,
        IGenericRepository<Personas> personasRepo,
        IGenericRepository<NotificacionGobernanza> notifRepo,
        IEmailService emailService,
        ILogger<NotificacionWorkflow> logger)
    {
        _usuariosRepo = usuariosRepo;
        _personasRepo = personasRepo;
        _notifRepo = notifRepo;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task NotificarAsignacionAsync(long usuarioDestinoId, string asunto, string cuerpoHtml, long? workflowEjecucionId = null, CancellationToken cancellationToken = default)
    {
        var email = await GetUsuarioEmailAsync(usuarioDestinoId, cancellationToken);
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning("Usuario {UsuarioId} no tiene email disponible para notificación", usuarioDestinoId);
            return;
        }

        await _emailService.SendAsync(email!, asunto, cuerpoHtml, cancellationToken);

        if (workflowEjecucionId.HasValue)
        {
            var notif = new NotificacionGobernanza
            {
                WorkflowEjecucionId = workflowEjecucionId.Value,
                TipoNotificacion = 1, // Asignación
                FechaEnvio = DateTime.UtcNow,
                CreadoPor = null,
                FechaCreacion = DateTime.UtcNow,
                Estado = 1,
                Version = 1
            };
            await _notifRepo.InsertAsync(notif, cancellationToken);
        }
    }

    public async Task NotificarCierreAsync(long usuarioDestinoId, string asunto, string cuerpoHtml, long? workflowEjecucionId = null, CancellationToken cancellationToken = default)
    {
        var email = await GetUsuarioEmailAsync(usuarioDestinoId, cancellationToken);
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning("Usuario {UsuarioId} no tiene email disponible para notificación de cierre", usuarioDestinoId);
            return;
        }

        await _emailService.SendAsync(email!, asunto, cuerpoHtml, cancellationToken);

        if (workflowEjecucionId.HasValue)
        {
            var notif = new NotificacionGobernanza
            {
                WorkflowEjecucionId = workflowEjecucionId.Value,
                TipoNotificacion = 2, // Cierre
                FechaEnvio = DateTime.UtcNow,
                CreadoPor = null,
                FechaCreacion = DateTime.UtcNow,
                Estado = 1,
                Version = 1
            };
            await _notifRepo.InsertAsync(notif, cancellationToken);
        }
    }

    private async Task<string?> GetUsuarioEmailAsync(long usuarioId, CancellationToken ct)
    {
        var usuario = await _usuariosRepo.GetByIdAsync(usuarioId, ct);
        if (usuario is null || !usuario.PersonaId.HasValue) return null;
        var persona = await _personasRepo.GetByIdAsync(usuario.PersonaId.Value, ct);
        return persona?.EmailPersonal;
    }
}