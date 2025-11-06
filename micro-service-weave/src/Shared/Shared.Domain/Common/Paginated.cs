using System.Collections.Generic;

namespace Shared.Domain.Common;

public class Paginated<T>
{
    public IEnumerable<T> List { get; init; } = new List<T>();
    public PaginationMetadata Pagination { get; init; } = new PaginationMetadata();

    public Paginated() { }

    public Paginated(IEnumerable<T> list, PaginationMetadata pagination)
    {
        List = list;
        Pagination = pagination;
    }

    public static Paginated<T> From(PagedResult<T> pagedResult)
    {
        var meta = PaginationMetadata.From(pagedResult.CurrentPage, pagedResult.PageSize, pagedResult.TotalCount);
        return new Paginated<T>(pagedResult.Items, meta);
    }
}