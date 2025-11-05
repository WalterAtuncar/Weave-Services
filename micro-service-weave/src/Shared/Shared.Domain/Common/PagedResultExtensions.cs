namespace Shared.Domain.Common;

public static class PagedResultExtensions
{
    public static Paginated<T> ToPaginated<T>(this PagedResult<T> source)
        => Paginated<T>.From(source);
}