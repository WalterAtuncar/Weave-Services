using Shared.Application.Services;
using Shared.Domain.Entities;

namespace WeaveCore.Api.Services;

public class AuditService : IAuditService
{
    private readonly IUserContextService _userContext;

    public AuditService(IUserContextService userContext)
    {
        _userContext = userContext;
    }

    public void SetCreateAuditFields<T>(T entity) where T : BaseEntity
    {
        var userId = _userContext.GetUserId();
        entity.CreadoPor = userId;
        entity.FechaCreacion = System.DateTime.UtcNow;
        entity.ActualizadoPor = userId;
        entity.FechaActualizacion = System.DateTime.UtcNow;
        entity.RegistroEliminado = false;
        if (entity.Estado == 0) entity.Estado = 1;
    }

    public void SetUpdateAuditFields<T>(T entity) where T : BaseEntity
    {
        entity.ActualizadoPor = _userContext.GetUserId();
        entity.FechaActualizacion = System.DateTime.UtcNow;
        entity.RegistroEliminado = entity.RegistroEliminado;
    }

    public void ProcessDeleteAudit<T>(T entity) where T : BaseEntity
    {
        entity.RegistroEliminado = true;
        entity.ActualizadoPor = _userContext.GetUserId();
        entity.FechaActualizacion = System.DateTime.UtcNow;
    }
}