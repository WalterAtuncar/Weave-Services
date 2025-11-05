using MediatR;
using Shared.Application.Commands;
using Shared.Application.Services;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.UnitOfWork;
using Shared.Domain.Entities;

namespace Shared.Application.Handlers;

public class AuditableCreateEntityHandler<T> : IRequestHandler<CreateEntityCommand<T>, long> where T : BaseEntity
{
    private readonly IGenericRepository<T> _repository;
    private readonly IUnitOfWork _uow;
    private readonly IAuditService _auditService;

    public AuditableCreateEntityHandler(IGenericRepository<T> repository, IUnitOfWork uow, IAuditService auditService)
    {
        _repository = repository;
        _uow = uow;
        _auditService = auditService;
    }

    public async Task<long> Handle(CreateEntityCommand<T> request, CancellationToken cancellationToken)
    {
        _auditService.SetCreateAuditFields(request.Entity);
        _uow.Begin();
        try
        {
            var id = await _repository.InsertAsync(request.Entity, cancellationToken);
            _uow.Commit();
            return id;
        }
        catch
        {
            _uow.Rollback();
            throw;
        }
    }
}