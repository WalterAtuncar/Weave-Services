using MediatR;
using Shared.Application.Commands;
using Shared.Application.Services;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.UnitOfWork;
using Shared.Domain.Entities;

namespace Shared.Application.Handlers;

public class AuditableCreateEntitiesHandler<T> : IRequestHandler<CreateEntitiesCommand<T>, IReadOnlyList<long>> where T : BaseEntity
{
    private readonly IGenericRepository<T> _repository;
    private readonly IUnitOfWork _uow;
    private readonly IAuditService _auditService;

    public AuditableCreateEntitiesHandler(IGenericRepository<T> repository, IUnitOfWork uow, IAuditService auditService)
    {
        _repository = repository;
        _uow = uow;
        _auditService = auditService;
    }

    public async Task<IReadOnlyList<long>> Handle(CreateEntitiesCommand<T> request, CancellationToken cancellationToken)
    {
        if (request.Entities == null || request.Entities.Count == 0)
            return Array.Empty<long>();

        foreach (var e in request.Entities)
            _auditService.SetCreateAuditFields(e);

        _uow.Begin();
        try
        {
            var ids = await _repository.InsertManyAsync(request.Entities, cancellationToken);
            _uow.Commit();
            return ids;
        }
        catch
        {
            _uow.Rollback();
            throw;
        }
    }
}