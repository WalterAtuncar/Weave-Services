using Shared.Domain.Entities;

namespace Shared.Application.Services;

public interface IAuditService
{
    void SetCreateAuditFields<T>(T entity) where T : BaseEntity;
    void SetUpdateAuditFields<T>(T entity) where T : BaseEntity;
    void ProcessDeleteAudit<T>(T entity) where T : BaseEntity;
}