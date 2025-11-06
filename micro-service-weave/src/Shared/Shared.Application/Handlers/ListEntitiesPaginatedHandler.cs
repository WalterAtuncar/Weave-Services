using MediatR;
using Shared.Application.Queries;
using Shared.Domain.Common;
using Shared.Infrastructure.Repositories;

namespace Shared.Application.Handlers;

public class ListEntitiesPaginatedHandler<T> : IRequestHandler<ListEntitiesPaginatedQuery<T>, PagedResult<T>> where T : class
{
    private readonly IGenericRepository<T> _repository;

    public ListEntitiesPaginatedHandler(IGenericRepository<T> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<T>> Handle(ListEntitiesPaginatedQuery<T> request, CancellationToken cancellationToken)
    {
        var pr = new PaginationRequest { Page = request.Page, PageSize = request.PageSize, Filters = request.Filters };
        return await _repository.ListAsync(pr, cancellationToken);
    }
}