using MediatR;
using Shared.Application.Queries;
using Shared.Infrastructure.Repositories;

namespace Shared.Application.Handlers;

public class GetEntityByIdHandler<T> : IRequestHandler<GetEntityByIdQuery<T>, T?> where T : class
{
    private readonly IGenericRepository<T> _repository;

    public GetEntityByIdHandler(IGenericRepository<T> repository)
    {
        _repository = repository;
    }

    public async Task<T?> Handle(GetEntityByIdQuery<T> request, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(request.Id, cancellationToken);
    }
}