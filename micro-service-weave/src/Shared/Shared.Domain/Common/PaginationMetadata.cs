namespace Shared.Domain.Common;

public class PaginationMetadata
{
    public int CurrentPage { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages { get; init; }
    public bool HasPrevious { get; init; }
    public bool HasNext { get; init; }
    public int? PreviousPage { get; init; }
    public int? NextPage { get; init; }
    public int StartRecord { get; init; }
    public int EndRecord { get; init; }

    public static PaginationMetadata From(int currentPage, int pageSize, int totalCount)
    {
        var totalPages = (int)System.Math.Ceiling(totalCount / (double)pageSize);
        var hasPrevious = currentPage > 1;
        var hasNext = currentPage < totalPages;
        int? previousPage = hasPrevious ? currentPage - 1 : null;
        int? nextPage = hasNext ? currentPage + 1 : null;
        var startRecord = totalCount == 0 ? 0 : (currentPage - 1) * pageSize + 1;
        var endRecord = System.Math.Min(currentPage * pageSize, totalCount);

        return new PaginationMetadata
        {
            CurrentPage = currentPage,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPrevious = hasPrevious,
            HasNext = hasNext,
            PreviousPage = previousPage,
            NextPage = nextPage,
            StartRecord = startRecord,
            EndRecord = endRecord
        };
    }
}