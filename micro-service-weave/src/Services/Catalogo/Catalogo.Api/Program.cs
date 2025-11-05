using Shared.Application.Extensions;
using Shared.Infrastructure.Extensions;
using Shared.Domain.Attributes;
using System.Reflection;
using MediatR;
using Shared.Application.Commands;
using Shared.Application.Queries;
using Shared.Application.Handlers;
using Shared.Domain.Common;
using lib.on.middleware.Extensions;
using lib.on.middleware.Middleware;
using Shared.Application.Services;
using Shared.Domain.Entities;
using Catalogo.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Servicios de API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Shared Application & Infrastructure
builder.Services.AddSharedApplication();
builder.Services.AddInfrastructureShared(builder.Configuration);
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Middleware externo (lib.on.middleware)
builder.Services.AddWinMiddleware("micro-service-weave.Catalogo.API", builder.Environment.IsDevelopment());

// Servicios de auditoría
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();
builder.Services.AddScoped<IAuditService, AuditService>();

// Escaneo de tipos con TableAttribute en Catalogo.Domain (extensible para cierres de genéricos)
var domainAssembly = Assembly.Load("Catalogo.Domain");
var entityTypes = domainAssembly
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && t.GetCustomAttribute<TableAttribute>() != null)
    .ToArray();

// Registrar handlers cerrados de MediatR para cada entidad con TableAttribute
foreach (var t in entityTypes)
{
    var isAuditable = typeof(BaseEntity).IsAssignableFrom(t);

    // Create
    var createServiceType = typeof(IRequestHandler<,>).MakeGenericType(
        typeof(CreateEntityCommand<>).MakeGenericType(t), typeof(long));
    var createHandlerType = (isAuditable ? typeof(AuditableCreateEntityHandler<>) : typeof(CreateEntityHandler<>)).MakeGenericType(t);
    builder.Services.AddTransient(createServiceType, createHandlerType);

    // Create bulk
    var createManyServiceType = typeof(IRequestHandler<,>).MakeGenericType(
        typeof(CreateEntitiesCommand<>).MakeGenericType(t), typeof(IReadOnlyList<long>));
    var createManyHandlerType = (isAuditable ? typeof(AuditableCreateEntitiesHandler<>) : typeof(CreateEntitiesHandler<>)).MakeGenericType(t);
    builder.Services.AddTransient(createManyServiceType, createManyHandlerType);

    // Delete (físico). Mantener para controladores que lo usen; Organizaciones usará borrado lógico.
    builder.Services.AddTransient(
        typeof(IRequestHandler<,>).MakeGenericType(
            typeof(DeleteEntityCommand<>).MakeGenericType(t), typeof(bool)),
        typeof(DeleteEntityHandler<>).MakeGenericType(t));

    // Update
    var updateServiceType = typeof(IRequestHandler<,>).MakeGenericType(
        typeof(UpdateEntityCommand<>).MakeGenericType(t), typeof(int));
    var updateHandlerType = (isAuditable ? typeof(AuditableUpdateEntityHandler<>) : typeof(UpdateEntityHandler<>)).MakeGenericType(t);
    builder.Services.AddTransient(updateServiceType, updateHandlerType);

    // GetById
    builder.Services.AddTransient(
        typeof(IRequestHandler<,>).MakeGenericType(
            typeof(GetEntityByIdQuery<>).MakeGenericType(t), t),
        typeof(GetEntityByIdHandler<>).MakeGenericType(t));

    // List paginated
    builder.Services.AddTransient(
        typeof(IRequestHandler<,>).MakeGenericType(
            typeof(ListEntitiesPaginatedQuery<>).MakeGenericType(t), typeof(PagedResult<>).MakeGenericType(t)),
        typeof(ListEntitiesPaginatedHandler<>).MakeGenericType(t));
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Pipeline del middleware externo
app.UseWinMiddleware();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
