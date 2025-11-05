using Gateway.Api.Models;
using Gateway.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authenticationService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthenticationService authenticationService,
        ILogger<AuthController> logger)
    {
        _authenticationService = authenticationService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authenticationService.AuthenticateAsync(request);
            
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login attempt for user: {Username}", request.Username);
            return StatusCode(500, new { message = "An error occurred during authentication" });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public ActionResult Logout()
    {
        // En un sistema JWT stateless, el logout se maneja en el cliente
        // eliminando el token. Aquí podríamos registrar el evento de logout.
        var username = User.Identity?.Name;
        _logger.LogInformation("User logged out: {Username}", username);
        
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("profile")]
    [Authorize]
    public ActionResult GetProfile()
    {
        try
        {
            var userId = User.FindFirst("UsuarioId")?.Value;
            var username = User.FindFirst("Username")?.Value;
            var rolId = User.FindFirst("RolId")?.Value;
            var personalId = User.FindFirst("PersonalId")?.Value;
            var personaId = User.FindFirst("PersonaId")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var profile = new
            {
                UsuarioId = long.Parse(userId),
                Username = username,
                RolId = long.Parse(rolId ?? "0"),
                PersonalId = long.Parse(personalId ?? "0"),
                PersonaId = long.Parse(personaId ?? "0")
            };

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user profile");
            return StatusCode(500, new { message = "An error occurred while retrieving profile" });
        }
    }
}