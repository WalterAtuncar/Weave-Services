using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Shared.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSharedApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(AssemblyMarker).Assembly));
        return services;
    }
}