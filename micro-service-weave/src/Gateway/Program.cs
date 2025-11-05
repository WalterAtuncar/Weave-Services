using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Serilog;
using Shared.Infrastructure.Extensions;
using Gateway.Api.Services;
using Gateway.Api.Middleware;
using Gateway.Api.Configuration;
using System.Text;
using lib.on.middleware.Extensions;
using lib.on.middleware.Middleware;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Ocelot configuration
builder.Configuration.AddJsonFile($"ocelot.{builder.Environment.EnvironmentName}.json", optional: false, reloadOnChange: true);

// Logging (Serilog)
builder.Host.UseSerilog((ctx, cfg) =>
{
    cfg.ReadFrom.Configuration(ctx.Configuration)
       .Enrich.FromLogContext()
       .WriteTo.Console();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Gateway API",
        Version = "v1",
        Description = "API Gateway del micro-service-weave"
    });
});
builder.Services.AddControllers();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// Database and Repository configuration
builder.Services.AddInfrastructureShared(builder.Configuration);

// Authentication services
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();

// Encryption services
builder.Services.AddScoped<IEncryptionService, EncryptionService>();

// Configuration settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// External middleware registration
builder.Services.AddWinMiddleware("micro-service-weave.Gateway", builder.Environment.IsDevelopment());
builder.Services.Configure<AuthenticationSettings>(builder.Configuration.GetSection("Authentication"));
builder.Services.Configure<EncryptionSettings>(builder.Configuration.GetSection("Encryption"));

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Ocelot
builder.Services.AddOcelot();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gateway API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// Enable CORS for all origins/headers/methods to resolve frontend preflight
app.UseCors("AllowAll");

// External middleware pipeline
app.UseWinMiddleware();

// Use conditional authentication middleware
app.UseMiddleware<ConditionalAuthMiddleware>();

// Use authentication and authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers BEFORE Ocelot to handle local endpoints
app.MapControllers();

// Use Ocelot middleware with custom configuration to skip local routes
app.UseWhen(context => !context.Request.Path.StartsWithSegments("/api/encryption") && 
                      !context.Request.Path.StartsWithSegments("/api/auth") &&
                      !context.Request.Path.StartsWithSegments("/swagger"), 
           appBuilder => 
           {
               appBuilder.UseOcelot().Wait();
           });

Console.WriteLine("Gateway initialized successfully");

app.Run();
