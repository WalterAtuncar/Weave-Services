using MediatR;
using Shared.Application.Commands;
using Shared.Application.Services;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.UnitOfWork;
using Shared.Domain.Entities;

namespace Shared.Application.Handlers;

public class AuditableUpdateEntityHandler<T> : IRequestHandler<UpdateEntityCommand<T>, int> where T : BaseEntity
{
    private readonly IGenericRepository<T> _repository;
    private readonly IUnitOfWork _uow;
    private readonly IAuditService _auditService;

    public AuditableUpdateEntityHandler(IGenericRepository<T> repository, IUnitOfWork uow, IAuditService auditService)
    {
        _repository = repository;
        _uow = uow;
        _auditService = auditService;
    }

    public async Task<int> Handle(UpdateEntityCommand<T> request, CancellationToken cancellationToken)
    {
        var entity = request.Entity;
        if (entity.RegistroEliminado)
            _auditService.ProcessDeleteAudit(entity);
        else
            _auditService.SetUpdateAuditFields(entity);

        _uow.Begin();
        try
        {
            var rows = await _repository.UpdateAsync(entity, cancellationToken);
            _uow.Commit();
            return rows;
        }
        catch
        {
            _uow.Rollback();
            throw;
        }
    }
}