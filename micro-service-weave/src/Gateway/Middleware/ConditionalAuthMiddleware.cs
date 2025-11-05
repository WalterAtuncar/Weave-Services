using Gateway.Api.Configuration;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Gateway.Api.Middleware;

public class ConditionalAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly AuthenticationSettings _authSettings;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<ConditionalAuthMiddleware> _logger;

    public ConditionalAuthMiddleware(
        RequestDelegate next,
        IOptions<AuthenticationSettings> authSettings,
        IOptions<JwtSettings> jwtSettings,
        ILogger<ConditionalAuthMiddleware> logger)
    {
        _next = next;
        _authSettings = authSettings.Value;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip authentication for health checks and other non-API endpoints
        if (ShouldSkipAuthentication(context.Request.Path))
        {
            await _next(context);
            return;
        }

        if (!_authSettings.EnableJwtValidation)
        {
            // Development mode: bypass JWT validation and set default headers
            await HandleDevelopmentMode(context);
        }
        else
        {
            // Production mode: validate JWT and extract claims
            await HandleProductionMode(context);
        }

        await _next(context);
    }

    private Task HandleDevelopmentMode(HttpContext context)
    {
        _logger.LogInformation("Running in development mode - bypassing JWT validation");

        var devSettings = _authSettings.DevelopmentMode;
        
        // Add default user headers for downstream services
        context.Request.Headers["X-User-Id"] = devSettings.DefaultUserId.ToString();
        context.Request.Headers["X-Personal-Id"] = devSettings.DefaultPersonalId.ToString();
        context.Request.Headers["X-Rol-Id"] = devSettings.DefaultRolId.ToString();
        context.Request.Headers["X-User-Name"] = devSettings.DefaultUserName;
        context.Request.Headers["X-User-Email"] = devSettings.DefaultEmail;
        context.Request.Headers["X-Auth-Mode"] = "development";

        // Create a fake identity for the current context
        var claims = new[]
        {
            new Claim("usuario_id", devSettings.DefaultUserId.ToString()),
            new Claim("personal_id", devSettings.DefaultPersonalId.ToString()),
            new Claim("rol_id", devSettings.DefaultRolId.ToString()),
            new Claim(ClaimTypes.Name, devSettings.DefaultUserName),
            new Claim(ClaimTypes.Email, devSettings.DefaultEmail)
        };

        var identity = new ClaimsIdentity(claims, "development");
        context.User = new ClaimsPrincipal(identity);

        _logger.LogDebug("Development headers added: UserId={UserId}, PersonalId={PersonalId}, RolId={RolId}", 
            devSettings.DefaultUserId, devSettings.DefaultPersonalId, devSettings.DefaultRolId);

        return Task.CompletedTask;
    }

    private async Task HandleProductionMode(HttpContext context)
    {
        var token = ExtractTokenFromRequest(context.Request);
        
        if (string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("No JWT token found in request");
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Unauthorized: No token provided");
            return;
        }

        try
        {
            var principal = ValidateToken(token);
            context.User = principal;

            // Extract claims and add as headers for downstream services
            var userId = principal.FindFirst("usuario_id")?.Value;
            var personalId = principal.FindFirst("personal_id")?.Value;
            var rolId = principal.FindFirst("rol_id")?.Value;
            var userName = principal.FindFirst(ClaimTypes.Name)?.Value;
            var userEmail = principal.FindFirst(ClaimTypes.Email)?.Value;

            if (!string.IsNullOrEmpty(userId))
                context.Request.Headers["X-User-Id"] = userId;
            if (!string.IsNullOrEmpty(personalId))
                context.Request.Headers["X-Personal-Id"] = personalId;
            if (!string.IsNullOrEmpty(rolId))
                context.Request.Headers["X-Rol-Id"] = rolId;
            if (!string.IsNullOrEmpty(userName))
                context.Request.Headers["X-User-Name"] = userName;
            if (!string.IsNullOrEmpty(userEmail))
                context.Request.Headers["X-User-Email"] = userEmail;
            
            context.Request.Headers["X-Auth-Mode"] = "production";

            _logger.LogDebug("Production JWT validated and headers added: UserId={UserId}, PersonalId={PersonalId}, RolId={RolId}", 
                userId, personalId, rolId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "JWT token validation failed");
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Unauthorized: Invalid token");
            return;
        }
    }

    private string? ExtractTokenFromRequest(HttpRequest request)
    {
        var authHeader = request.Headers["Authorization"].FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            return authHeader.Substring("Bearer ".Length).Trim();
        }
        return null;
    }

    private ClaimsPrincipal ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = _jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = _jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
        return principal;
    }

    private static bool ShouldSkipAuthentication(PathString path)
    {
        var skipPaths = new[]
        {
            "/health",
            "/swagger",
            // Bypass ALL auth controller endpoints (login/register and any future ones)
            "/api/auth",
            "/api/auth/login",
            "/api/auth/register"
        };

        return skipPaths.Any(skipPath => path.StartsWithSegments(skipPath, StringComparison.OrdinalIgnoreCase));
    }
}