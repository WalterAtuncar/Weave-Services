using MediatR;
using System.Collections.Generic;
using Shared.Domain.Common;

namespace Shared.Application.Queries;

public class ListEntitiesPaginatedQuery<T> : IRequest<PagedResult<T>> where T : class
{
    public int Page { get; }
    public int PageSize { get; }
    public IDictionary<string, object?> Filters { get; }

    public ListEntitiesPaginatedQuery(int page, int pageSize)
    {
        Page = page;
        PageSize = pageSize;
        Filters = new Dictionary<string, object?>();
    }

    public ListEntitiesPaginatedQuery(int page, int pageSize, IDictionary<string, object?>? filters)
    {
        Page = page;
        PageSize = pageSize;
        Filters = filters ?? new Dictionary<string, object?>();
    }
}