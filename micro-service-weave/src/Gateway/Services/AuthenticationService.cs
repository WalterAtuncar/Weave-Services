using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Gateway.Api.Models;
using Shared.Infrastructure.Data;
using Microsoft.IdentityModel.Tokens;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Gateway.Api.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthenticationService> _logger;
    private readonly IEncryptionService _encryptionService;

    public AuthenticationService(
        IDbConnectionFactory connectionFactory,
        IConfiguration configuration,
        ILogger<AuthenticationService> logger,
        IEncryptionService encryptionService)
    {
        _connectionFactory = connectionFactory;
        _configuration = configuration;
        _logger = logger;
        _encryptionService = encryptionService;
    }

    public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request)
    {
        try
        {
            using var connection = _connectionFactory.CreateConnection();
            
            // Primero obtenemos el usuario por username para verificar la contraseña
            var userQuery = "SELECT [usuario_id], [username], [password_hash] FROM [medico].[usuario] WHERE [username] = @username AND [estado] = 'activo' AND [eliminado] = 0";
            var user = await connection.QuerySingleOrDefaultAsync<dynamic>(userQuery, new { username = request.Username });
            
            if (user == null)
            {
                _logger.LogWarning("User not found: {Username}", request.Username);
                return null;
            }
            
            // Verificar la contraseña usando nuestro EncryptionService
            var isValidPassword = _encryptionService.VerifyBcryptHash(request.Password, user.password_hash);
            
            if (!isValidPassword)
            {
                _logger.LogWarning("Invalid password for user: {Username}", request.Username);
                return null;
            }
            
            // Ejecutar el stored procedure de autenticación con el hash correcto
            var authResult = await connection.QuerySingleOrDefaultAsync<AuthenticationResult>(
                "EXEC [medico].[sp_AuthenticateUser] @p_username, @p_password_hash",
                new { p_username = request.Username, p_password_hash = user.password_hash });

            if (authResult == null)
            {
                _logger.LogWarning("Authentication failed for user: {Username}", request.Username);
                return null;
            }

            // Generar el token JWT
            var token = GenerateJwtToken(authResult);

            // Crear la respuesta
            var response = new LoginResponse
            {
                Token = token,
                PersonaId = authResult.PersonaId,
                ApellidoPaterno = authResult.ApellidoPaterno,
                ApellidoMaterno = authResult.ApellidoMaterno,
                Nombres = authResult.Nombres,
                FotoUrl = authResult.FotoUrl,
                CodigoEmpleado = authResult.CodigoEmpleado,
                TipoPersonalId = authResult.TipoPersonalId,
                CargoId = authResult.CargoId,
                Colegiatura = authResult.Colegiatura,
                Rne = authResult.Rne,
                UsuarioId = authResult.UsuarioId,
                Username = authResult.Username,
                RolId = authResult.RolId
            };

            // Obtener permisos por rol usando la función SQL
            try
            {
                var permissions = await connection.QueryAsync<PermissionDto>(
                    "EXEC [medico].[sp_GetPermissionsByRole] @p_rol_id",
                    new { p_rol_id = authResult.RolId });

                // Obtener JSON del sidebar agrupado por módulo (función escalar o vista)
                var sidebarJson = await connection.QuerySingleOrDefaultAsync<string>(
                    "SELECT [medico].[fn_GetSidebarByRoleJson](@p_rol_id)",
                    new { p_rol_id = authResult.RolId });

                response.Permissions = permissions ?? Enumerable.Empty<PermissionDto>();
                response.SidebarJson = sidebarJson ?? "[]";
            }
            catch (SqlException sqlEx)
            {
                _logger.LogWarning(sqlEx, "Permissions functions not available or type mismatch. Returning defaults.");
                response.Permissions = Enumerable.Empty<PermissionDto>();
                response.SidebarJson = "[]";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error fetching permissions. Returning defaults.");
                response.Permissions = Enumerable.Empty<PermissionDto>();
                response.SidebarJson = "[]";
            }

            _logger.LogInformation("User authenticated successfully: {Username}", request.Username);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during authentication for user: {Username}", request.Username);
            return null;
        }
    }

    private string GenerateJwtToken(AuthenticationResult authResult)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? "Gateway.Api";
        var audience = jwtSettings["Audience"] ?? "Gateway.Api";
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("UsuarioId", authResult.UsuarioId.ToString()),
            new Claim("PersonalId", authResult.PersonalId.ToString()),
            new Claim("Username", authResult.Username),
            new Claim("RolId", authResult.RolId.ToString()),
            new Claim("PersonaId", authResult.PersonaId.ToString()),
            new Claim(ClaimTypes.Name, authResult.Username),
            new Claim(ClaimTypes.NameIdentifier, authResult.UsuarioId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}