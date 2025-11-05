using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Shared.Infrastructure.Data;
using Shared.Infrastructure.StoredProcedures;

namespace WeaveCore.Api.Infrastructure;

public class WeaveCoreStoredProcedureExecutor : IStoredProcedureExecutor
{
    private readonly IDbConnectionFactory _dbFactory;
    private readonly ILogger<WeaveCoreStoredProcedureExecutor> _logger;
    private const int DefaultTimeoutSeconds = 60;

    public WeaveCoreStoredProcedureExecutor(IDbConnectionFactory dbFactory, ILogger<WeaveCoreStoredProcedureExecutor> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task<int> ExecuteAsync(string procedureName, object? parameters = null, CancellationToken cancellationToken = default)
    {
        EnsureSchema(procedureName);
        using var conn = _dbFactory.CreateConnection();
        conn.Open();
        var cmd = new CommandDefinition(procedureName, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken, commandTimeout: DefaultTimeoutSeconds);
        return await conn.ExecuteAsync(cmd);
    }

    public async Task<T?> QuerySingleOrDefaultAsync<T>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default)
    {
        EnsureSchema(procedureName);
        using var conn = _dbFactory.CreateConnection();
        conn.Open();
        var cmd = new CommandDefinition(procedureName, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken, commandTimeout: DefaultTimeoutSeconds);
        return await conn.QuerySingleOrDefaultAsync<T>(cmd);
    }

    public async Task<IEnumerable<T>> QueryAsync<T>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default)
    {
        EnsureSchema(procedureName);
        using var conn = _dbFactory.CreateConnection();
        conn.Open();
        var cmd = new CommandDefinition(procedureName, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken, commandTimeout: DefaultTimeoutSeconds);
        var result = await conn.QueryAsync<T>(cmd);
        return result;
    }

    public async Task<(IEnumerable<T1> Result1, IEnumerable<T2> Result2)> QueryMultipleAsync<T1, T2>(string procedureName, object? parameters = null, CancellationToken cancellationToken = default)
    {
        EnsureSchema(procedureName);
        using var conn = _dbFactory.CreateConnection();
        conn.Open();
        var cmd = new CommandDefinition(procedureName, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken, commandTimeout: DefaultTimeoutSeconds);
        using var grid = await conn.QueryMultipleAsync(cmd);
        var r1 = await grid.ReadAsync<T1>();
        var r2 = await grid.ReadAsync<T2>();
        return (r1, r2);
    }

    private static readonly string[] AllowedSchemaPrefixes = new[]
    {
        "Datos.",
        "Gobernanza.",
        "Sistema.",
        "Proceso.",
        "Documento."
    };

    private static void EnsureSchema(string spName)
    {
        foreach (var prefix in AllowedSchemaPrefixes)
        {
            if (spName.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                return;
        }
        throw new ArgumentException($"Stored Procedure '{spName}' debe pertenecer a uno de los schemas permitidos: {string.Join(", ", AllowedSchemaPrefixes).Replace(".", "")}");
    }
}