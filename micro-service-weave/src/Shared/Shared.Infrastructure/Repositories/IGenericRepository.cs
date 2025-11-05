using Shared.Domain.Common;

namespace Shared.Infrastructure.Repositories;

public interface IGenericRepository<T> where T : class
{
    Task<long> InsertAsync(T entity, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<long>> InsertManyAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    Task<int> UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task<T?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<PagedResult<T>> ListAsync(PaginationRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}