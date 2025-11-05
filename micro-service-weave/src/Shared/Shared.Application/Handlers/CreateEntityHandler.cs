using MediatR;
using Shared.Application.Commands;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.UnitOfWork;

namespace Shared.Application.Handlers;

public class CreateEntityHandler<T> : IRequestHandler<CreateEntityCommand<T>, long> where T : class
{
    private readonly IGenericRepository<T> _repository;
    private readonly IUnitOfWork _uow;

    public CreateEntityHandler(IGenericRepository<T> repository, IUnitOfWork uow)
    {
        _repository = repository;
        _uow = uow;
    }

    public async Task<long> Handle(CreateEntityCommand<T> request, CancellationToken cancellationToken)
    {
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