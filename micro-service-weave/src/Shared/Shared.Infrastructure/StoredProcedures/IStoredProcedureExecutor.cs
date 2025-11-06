using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shared.Infrastructure.StoredProcedures;

public interface IStoredProcedureExecutor
{
    Task<int> ExecuteAsync(string procedureName, object? parameters = null, CancellationToken cancellationToken = default);
    Task<T?> QuerySingleOrDefaultAsync<T>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> QueryAsync<T>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default);
    Task<(IEnumerable<T1> Result1, IEnumerable<T2> Result2)> QueryMultipleAsync<T1, T2>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default);
}