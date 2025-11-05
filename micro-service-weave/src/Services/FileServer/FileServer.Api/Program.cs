using FileServer.Api.Options;
using FileServer.Api.Services;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using FileServer.Api.Clients;
using FileServer.Api.Features.DocumentoVectorial.Services;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<FileStorageOptions>(builder.Configuration.GetSection("FileStorage"));
builder.Services.AddSingleton<IFileStorageService, PhysicalFileStorageService>();

// MongoDB configuration
builder.Services.Configure<MongoDbOptions>(builder.Configuration.GetSection("MongoDb"));
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var opts = sp.GetRequiredService<IOptions<MongoDbOptions>>().Value;
    return new MongoClient(opts.ConnectionString);
});
builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var opts = sp.GetRequiredService<IOptions<MongoDbOptions>>().Value;
    return client.GetDatabase(opts.DatabaseName);
});

// WeaveCore API client registration
builder.Services.Configure<WeaveCoreApiOptions>(builder.Configuration.GetSection("WeaveCoreApi"));
builder.Services.AddHttpClient("WeaveCore", (sp, client) =>
{
    var opts = sp.GetRequiredService<IOptions<WeaveCoreApiOptions>>().Value;
    if (!string.IsNullOrWhiteSpace(opts.BaseUrl))
        client.BaseAddress = new Uri(opts.BaseUrl);
});
builder.Services.AddScoped<IWeaveCoreClient, WeaveCoreClient>();

// Vectorial service
builder.Services.AddSingleton<IDocumentoVectorialService, DocumentoVectorialService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FileServer API", Version = "v1" });
});

// Configure limits (can be overridden per request)
builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 104_857_600; // 100MB default
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseAuthorization();

app.MapControllers();

// Ensure indices for Mongo collections
using (var scope = app.Services.CreateScope())
{
    var svc = scope.ServiceProvider.GetRequiredService<IDocumentoVectorialService>();
    svc.EnsureIndexesAsync().GetAwaiter().GetResult();
}

app.Run();