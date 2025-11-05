using System.Collections.Generic;

namespace Shared.Domain.Common;

public class PaginationRequest
{
    private int _page = 1;
    private int _pageSize = 10;
    public IDictionary<string, object?> Filters { get; set; } = new Dictionary<string, object?>();

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 10,
            > 100 => 100,
            _ => value
        };
    }

    public int Skip => (Page - 1) * PageSize;
}