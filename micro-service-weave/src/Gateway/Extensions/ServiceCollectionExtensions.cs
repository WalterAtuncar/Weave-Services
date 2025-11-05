using Gateway.Api.Configuration;
using Gateway.Api.Middleware;

namespace Gateway.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddConditionalAuthentication(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        // Configure settings
        services.Configure<AuthenticationSettings>(
            configuration.GetSection(AuthenticationSettings.SectionName));
        
        services.Configure<JwtSettings>(
            configuration.GetSection("JwtSettings"));

        // Add middleware as scoped service for DI
        services.AddScoped<ConditionalAuthMiddleware>();

        return services;
    }

    public static IApplicationBuilder UseConditionalAuthentication(
        this IApplicationBuilder app)
    {
        return app.UseMiddleware<ConditionalAuthMiddleware>();
    }
}