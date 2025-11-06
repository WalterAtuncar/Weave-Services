using System.Data;

namespace Shared.Infrastructure.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}