using Shared.Application.Extensions;
using Shared.Infrastructure.Extensions;
using MediatR;
using Shared.Application.Services;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Infrastructure;
using WeaveCore.Api.Services;
using WeaveCore.Api.Infrastructure.Clients;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Servicios
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();
builder.Services.AddScoped<IAuditService, AuditService>();

// Shared DI
builder.Services.AddSharedApplication();
builder.Services.AddInfrastructureShared(builder.Configuration);
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
// Sobrescribir el ejecutor de SP compartido con el ejecutor local del servicio WeaveCore
builder.Services.AddScoped<IStoredProcedureExecutor, WeaveCoreStoredProcedureExecutor>();

// Cliente HTTP hacia Catalogo.Api para sincronización de GobernanzaEntidad
var catalogoBaseUrl = builder.Configuration["CatalogoApi:BaseUrl"] ?? "http://localhost:5245";
builder.Services.AddTransient<ForwardAuthHeadersHandler>();
builder.Services.AddHttpClient<ICatalogoClient, CatalogoClient>(client =>
{
    client.BaseAddress = new Uri(catalogoBaseUrl);
}).AddHttpMessageHandler<ForwardAuthHeadersHandler>();

// Configuración JWT local (alineada con Gateway) para [Authorize]
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSection["SecretKey"];
if (!string.IsNullOrWhiteSpace(secretKey))
{
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
}

var app = builder.Build();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();