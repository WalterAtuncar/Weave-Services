using System.Collections.Generic;

namespace Shared.Domain.Common;

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; }
    public int CurrentPage { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages => (int)System.Math.Ceiling(TotalCount / (double)PageSize);

    public PagedResult(IEnumerable<T> items, int currentPage, int pageSize, int totalCount)
    {
        Items = items;
        CurrentPage = currentPage;
        PageSize = pageSize;
        TotalCount = totalCount;
    }
}