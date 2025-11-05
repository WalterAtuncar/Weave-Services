using Dapper;
using Shared.Domain.Attributes;
using Shared.Domain.Common;
using Shared.Infrastructure.UnitOfWork;
using System.Reflection;

namespace Shared.Infrastructure.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    private readonly IUnitOfWork _uow;
    private readonly TableAttribute _meta;
    private readonly PropertyInfo[] _props;

    public GenericRepository(IUnitOfWork uow)
    {
        _uow = uow;
        _meta = typeof(T).GetCustomAttribute<TableAttribute>()
            ?? throw new InvalidOperationException($"Entity {typeof(T).Name} missing TableAttribute");
        _props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
    }

    public async Task<long> InsertAsync(T entity, CancellationToken cancellationToken = default)
    {
        var idProp = _props.FirstOrDefault(p => string.Equals(p.Name, _meta.IdColumn, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException($"Entity {typeof(T).Name} does not expose id property '{_meta.IdColumn}'");

        string Table(string schema, string name) => $"[{schema}].[{name}]";
        string Col(string name) => $"[{name}]";

        var cols = new List<string>();
        var vals = new List<string>();

        var hasSequence = !string.IsNullOrWhiteSpace(_meta.IdSequence);
        if (hasSequence)
        {
            cols.Add(Col(_meta.IdColumn));
            // assume IdSequence provided as schema.sequence
            var seqParts = _meta.IdSequence.Contains('.') ? _meta.IdSequence.Split('.') : new[] { "dbo", _meta.IdSequence };
            var seqSql = $"NEXT VALUE FOR [{seqParts[0]}].[{seqParts[1]}]";
            vals.Add(seqSql);
        }

        foreach (var p in _props)
        {
            if (string.Equals(p.Name, _meta.IdColumn, StringComparison.OrdinalIgnoreCase)) continue;
            cols.Add(Col(p.Name));
            vals.Add($"@{p.Name}");
        }

        var insertCols = string.Join(",", cols);
        var insertVals = string.Join(",", vals);

        // Use OUTPUT INSERTED to get generated id. If sequence not provided, assume identity and skip id column.
        var sql = $"INSERT INTO {Table(_meta.Schema, _meta.Name)} ({insertCols}) OUTPUT INSERTED.{Col(_meta.IdColumn)} VALUES ({insertVals});";

        var id = await _uow.Connection.ExecuteScalarAsync<long>(new CommandDefinition(sql, entity, _uow.Transaction, cancellationToken: cancellationToken));
        if (idProp.CanWrite) idProp.SetValue(entity, id);
        return id;
    }

    public async Task<IReadOnlyList<long>> InsertManyAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
    {
        var list = entities?.ToList() ?? throw new ArgumentNullException(nameof(entities));
        if (list.Count == 0) return Array.Empty<long>();

        var idProp = _props.FirstOrDefault(p => string.Equals(p.Name, _meta.IdColumn, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException($"Entity {typeof(T).Name} does not expose id property '{_meta.IdColumn}'");
        string Table(string schema, string name) => $"[{schema}].[{name}]";
        string Col(string name) => $"[{name}]";

        var hasSequence = !string.IsNullOrWhiteSpace(_meta.IdSequence);

        var cols = new List<string>();
        foreach (var p in _props)
        {
            if (string.Equals(p.Name, _meta.IdColumn, StringComparison.OrdinalIgnoreCase)) continue;
            cols.Add(Col(p.Name));
        }

        var parameters = new DynamicParameters();
        var valuesRows = new List<string>();

        for (int i = 0; i < list.Count; i++)
        {
            var entity = list[i];
            var parts = new List<string>();

            foreach (var p in _props)
            {
                if (string.Equals(p.Name, _meta.IdColumn, StringComparison.OrdinalIgnoreCase)) continue;
                var value = p.GetValue(entity);
                var paramName = $"{p.Name}_{i}";
                parameters.Add(paramName, value);
                parts.Add($"@{paramName}");
            }

            valuesRows.Add("(" + string.Join(",", parts) + ")");
        }

        var insertCols = string.Join(",", cols);
        var insertVals = string.Join(",", valuesRows);

        // Rely on identity when no sequence (common case). If sequence present, include it as DEFAULT constraint externally.
        var sql = $"INSERT INTO {Table(_meta.Schema, _meta.Name)} ({insertCols}) OUTPUT INSERTED.{Col(_meta.IdColumn)} VALUES {insertVals};";

        var ids = (await _uow.Connection.QueryAsync<long>(new CommandDefinition(sql, parameters, _uow.Transaction, cancellationToken: cancellationToken))).ToList();

        if (idProp.CanWrite)
        {
            for (int i = 0; i < list.Count && i < ids.Count; i++)
            {
                idProp.SetValue(list[i], ids[i]);
            }
        }

        return ids;
    }

    public async Task<int> UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        var idProp = _props.FirstOrDefault(p => string.Equals(p.Name, _meta.IdColumn, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException($"Entity {typeof(T).Name} missing id property '{_meta.IdColumn}'");

        var setClauses = new List<string>();
        foreach (var p in _props)
        {
            if (string.Equals(p.Name, _meta.IdColumn, StringComparison.OrdinalIgnoreCase)) continue;
            setClauses.Add($"[{p.Name}]=@{p.Name}");
        }

        string Table(string schema, string name) => $"[{schema}].[{name}]";
        var sql = $"UPDATE {Table(_meta.Schema, _meta.Name)} SET " + string.Join(",", setClauses) + $" WHERE [{_meta.IdColumn}]=@{idProp.Name};";
        var rows = await _uow.Connection.ExecuteAsync(new CommandDefinition(sql, entity, _uow.Transaction, cancellationToken: cancellationToken));
        return rows;
    }

    public async Task<T?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        string Table(string schema, string name) => $"[{schema}].[{name}]";
        var sql = $"SELECT TOP 1 * FROM {Table(_meta.Schema, _meta.Name)} WHERE [{_meta.IdColumn}]=@id;";
        var result = await _uow.Connection.QuerySingleOrDefaultAsync<T>(new CommandDefinition(sql, new { id }, _uow.Transaction, cancellationToken: cancellationToken));
        return result;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        string Table(string schema, string name) => $"[{schema}].[{name}]";
        var sql = $"DELETE FROM {Table(_meta.Schema, _meta.Name)} WHERE [{_meta.IdColumn}]=@id;";
        var rows = await _uow.Connection.ExecuteAsync(new CommandDefinition(sql, new { id }, _uow.Transaction, cancellationToken: cancellationToken));
        return rows > 0;
    }

    public async Task<PagedResult<T>> ListAsync(PaginationRequest request, CancellationToken cancellationToken = default)
    {
        var whereClauses = new List<string>();
        var parameters = new DynamicParameters();

        // Build dynamic WHERE only when filter values are provided (non-null, non-empty)
        foreach (var kv in request.Filters)
        {
            if (kv.Value is null) continue;
            if (kv.Value is string s && string.IsNullOrWhiteSpace(s)) continue;

            var prop = _props.FirstOrDefault(p => string.Equals(p.Name, kv.Key, StringComparison.OrdinalIgnoreCase));
            var columnName = prop?.Name ?? kv.Key; // default to provided key

            // Convert value to property type if possible
            object? converted = kv.Value;
            if (kv.Value is string sv && prop != null)
            {
                var targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                try
                {
                    if (targetType == typeof(Guid))
                        converted = Guid.Parse(sv);
                    else if (targetType.IsEnum)
                        converted = Enum.Parse(targetType, sv, ignoreCase: true);
                    else if (targetType == typeof(DateTime))
                        converted = DateTime.Parse(sv);
                    else if (targetType == typeof(bool))
                        converted = bool.Parse(sv);
                    else if (targetType == typeof(int))
                        converted = int.Parse(sv);
                    else if (targetType == typeof(long))
                        converted = long.Parse(sv);
                    else if (targetType == typeof(decimal))
                        converted = decimal.Parse(sv);
                    else if (targetType == typeof(double))
                        converted = double.Parse(sv);
                    else
                        converted = sv; // leave as string
                }
                catch
                {
                    converted = sv; // fallback to string if conversion fails
                }
            }

            var paramName = $"p_{columnName}";
            whereClauses.Add($"[{columnName}]=@{paramName}");
            parameters.Add(paramName, converted);
        }

        parameters.Add("Skip", request.Skip);
        parameters.Add("PageSize", request.PageSize);

        string Table(string schema, string name) => $"[{schema}].[{name}]";
        var whereSql = whereClauses.Count > 0 ? " WHERE " + string.Join(" AND ", whereClauses) : string.Empty;
        var sqlList = $"SELECT * FROM {Table(_meta.Schema, _meta.Name)}{whereSql} ORDER BY [{_meta.IdColumn}] OFFSET @Skip ROWS FETCH NEXT @PageSize ROWS ONLY;";
        var sqlCount = $"SELECT COUNT(1) FROM {Table(_meta.Schema, _meta.Name)}{whereSql};";

        var items = await _uow.Connection.QueryAsync<T>(new CommandDefinition(sqlList, parameters, _uow.Transaction, cancellationToken: cancellationToken));
        var total = await _uow.Connection.ExecuteScalarAsync<int>(new CommandDefinition(sqlCount, parameters, _uow.Transaction, cancellationToken: cancellationToken));

        return new PagedResult<T>(items, request.Page, request.PageSize, total);
    }
}