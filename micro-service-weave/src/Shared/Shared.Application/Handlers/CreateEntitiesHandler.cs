using MediatR;
using Shared.Application.Commands;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.UnitOfWork;

namespace Shared.Application.Handlers;

public class CreateEntitiesHandler<T> : IRequestHandler<CreateEntitiesCommand<T>, IReadOnlyList<long>> where T : class
{
    private readonly IGenericRepository<T> _repository;
    private readonly IUnitOfWork _uow;

    public CreateEntitiesHandler(IGenericRepository<T> repository, IUnitOfWork uow)
    {
        _repository = repository;
        _uow = uow;
    }

    public async Task<IReadOnlyList<long>> Handle(CreateEntitiesCommand<T> request, CancellationToken cancellationToken)
    {
        if (request.Entities == null || request.Entities.Count == 0)
            return Array.Empty<long>();

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