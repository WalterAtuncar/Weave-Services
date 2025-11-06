using MediatR;
using Shared.Application.Commands;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.UnitOfWork;

namespace Shared.Application.Handlers;

public class DeleteEntityHandler<T> : IRequestHandler<DeleteEntityCommand<T>, bool> where T : class
{
    private readonly IGenericRepository<T> _repository;
    private readonly IUnitOfWork _uow;

    public DeleteEntityHandler(IGenericRepository<T> repository, IUnitOfWork uow)
    {
        _repository = repository;
        _uow = uow;
    }

    public async Task<bool> Handle(DeleteEntityCommand<T> request, CancellationToken cancellationToken)
    {
        _uow.Begin();
        try
        {
            var ok = await _repository.DeleteAsync(request.Id, cancellationToken);
            _uow.Commit();
            return ok;
        }
        catch
        {
            _uow.Rollback();
            throw;
        }
    }
}