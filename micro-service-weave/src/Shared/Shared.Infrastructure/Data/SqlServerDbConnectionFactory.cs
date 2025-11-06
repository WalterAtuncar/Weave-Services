using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace Shared.Infrastructure.Data;

public class SqlServerDbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public SqlServerDbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("SqlServer")
            ?? throw new InvalidOperationException("ConnectionStrings:SqlServer not configured");
    }

    public IDbConnection CreateConnection()
    {
        var conn = new SqlConnection(_connectionString);
        return conn;
    }
}