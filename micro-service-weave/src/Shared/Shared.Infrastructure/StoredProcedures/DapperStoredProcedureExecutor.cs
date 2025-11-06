using Dapper;
using Shared.Infrastructure.UnitOfWork;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;

namespace Shared.Infrastructure.StoredProcedures;

public class DapperStoredProcedureExecutor : IStoredProcedureExecutor
{
    private readonly IUnitOfWork _uow;

    public DapperStoredProcedureExecutor(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public Task<int> ExecuteAsync(string procedureName, object? parameters = null, CancellationToken cancellationToken = default)
    {
        var cmd = new CommandDefinition(procedureName, parameters, _uow.Transaction, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        return _uow.Connection.ExecuteAsync(cmd);
    }

    public Task<T?> QuerySingleOrDefaultAsync<T>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default)
    {
        var cmd = new CommandDefinition(procedureName, parameters, _uow.Transaction, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        return _uow.Connection.QuerySingleOrDefaultAsync<T>(cmd);
    }

    public async Task<IEnumerable<T>> QueryAsync<T>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default)
    {
        var cmd = new CommandDefinition(procedureName, parameters, _uow.Transaction, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        var result = await _uow.Connection.QueryAsync<T>(cmd);
        return result;
    }

    public async Task<(IEnumerable<T1> Result1, IEnumerable<T2> Result2)> QueryMultipleAsync<T1, T2>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default)
    {
        var cmd = new CommandDefinition(procedureName, parameters, _uow.Transaction, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        using var grid = await _uow.Connection.QueryMultipleAsync(cmd);
        var r1 = await grid.ReadAsync<T1>();
        var r2 = await grid.ReadAsync<T2>();
        return (r1, r2);
    }
}