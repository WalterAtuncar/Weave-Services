using Shared.Infrastructure.Data;
using System.Data;

namespace Shared.Infrastructure.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly IDbConnectionFactory _connectionFactory;
    private bool _disposed;

    public IDbConnection Connection { get; private set; }
    public IDbTransaction? Transaction { get; private set; }

    public UnitOfWork(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
        Connection = _connectionFactory.CreateConnection();
        Connection.Open();
    }

    public void Begin()
    {
        Transaction = Connection.BeginTransaction();
    }

    public void Commit()
    {
        Transaction?.Commit();
        Transaction?.Dispose();
        Transaction = null;
    }

    public void Rollback()
    {
        Transaction?.Rollback();
        Transaction?.Dispose();
        Transaction = null;
    }

    public void Dispose()
    {
        if (_disposed) return;
        Transaction?.Dispose();
        Connection.Dispose();
        _disposed = true;
    }
}