using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Infrastructure.Data;
using Shared.Infrastructure.Repositories;
using Shared.Infrastructure.StoredProcedures;
using Shared.Infrastructure.UnitOfWork;
using Shared.Infrastructure.Email;
using Shared.Infrastructure.Cloudinary;
using Shared.Infrastructure.Workflow;

namespace Shared.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureShared(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IDbConnectionFactory, SqlServerDbConnectionFactory>();
        services.AddScoped<IUnitOfWork, UnitOfWork.UnitOfWork>();
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IStoredProcedureExecutor, DapperStoredProcedureExecutor>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<INotificacionWorkflow, NotificacionWorkflow>();
        services.AddScoped<IGobernanzaWorkflowService, GobernanzaWorkflowService>();
        return services;
    }
}