using System.Data;

namespace Shared.Infrastructure.UnitOfWork;

public interface IUnitOfWork : IDisposable
{
    IDbConnection Connection { get; }
    IDbTransaction? Transaction { get; }
    void Begin();
    void Commit();
    void Rollback();
}