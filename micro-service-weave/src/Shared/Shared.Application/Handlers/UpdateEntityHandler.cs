using MediatR;
using Shared.Application.Commands;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.UnitOfWork;

namespace Shared.Application.Handlers;

public class UpdateEntityHandler<T> : IRequestHandler<UpdateEntityCommand<T>, int> where T : class
{
    private readonly IGenericRepository<T> _repository;
    private readonly IUnitOfWork _uow;

    public UpdateEntityHandler(IGenericRepository<T> repository, IUnitOfWork uow)
    {
        _repository = repository;
        _uow = uow;
    }

    public async Task<int> Handle(UpdateEntityCommand<T> request, CancellationToken cancellationToken)
    {
        _uow.Begin();
        try
        {
            var rows = await _repository.UpdateAsync(request.Entity, cancellationToken);
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