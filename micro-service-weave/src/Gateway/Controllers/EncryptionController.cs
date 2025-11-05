using Microsoft.AspNetCore.Mvc;
using Gateway.Api.Models;
using Gateway.Api.Services;
using System.ComponentModel.DataAnnotations;

namespace Gateway.Api.Controllers;

/// <summary>
/// Controller para encriptación de contraseñas usando BCrypt
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EncryptionController : ControllerBase
{
    private readonly IEncryptionService _encryptionService;
    private readonly ILogger<EncryptionController> _logger;

    public EncryptionController(
        IEncryptionService encryptionService,
        ILogger<EncryptionController> logger)
    {
        _encryptionService = encryptionService;
        _logger = logger;
    }

    /// <summary>
    /// Encripta una contraseña usando BCrypt con semilla del appsettings
    /// </summary>
    /// <param name="request">Request con la contraseña a encriptar</param>
    /// <returns>Response con la contraseña encriptada</returns>
    /// <response code="200">Contraseña encriptada exitosamente</response>
    /// <response code="400">Parámetros inválidos</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("encrypt-password")]
    [ProducesResponseType(typeof(EncryptionResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<EncryptionResponse>> EncryptPassword([FromBody] PasswordEncryptionRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new EncryptionResponse
                {
                    Success = false,
                    ErrorMessage = "La contraseña no puede estar vacía",
                    Timestamp = DateTime.UtcNow
                });
            }

            var result = await _encryptionService.EncryptPasswordAsync(request.Password);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al encriptar contraseña");
            return StatusCode(500, new EncryptionResponse
            {
                Success = false,
                ErrorMessage = "Error interno del servidor",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Verifica si una contraseña coincide con un hash BCrypt
    /// </summary>
    /// <param name="request">Request con la contraseña en claro y el hash</param>
    /// <returns>True si coincide, false en caso contrario</returns>
    /// <response code="200">Verificación completada</response>
    /// <response code="400">Parámetros inválidos</response>
    [HttpPost("verify-password")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(400)]
    public ActionResult<object> VerifyPassword([FromBody] PasswordVerificationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.PlainPassword) || string.IsNullOrWhiteSpace(request?.Hash))
        {
            return BadRequest(new
            {
                Success = false,
                ErrorMessage = "La contraseña y el hash son requeridos",
                Timestamp = DateTime.UtcNow
            });
        }

        var isValid = _encryptionService.VerifyBcryptHash(request.PlainPassword, request.Hash);
        
        return Ok(new
        {
            Success = true,
            IsValid = isValid,
            Timestamp = DateTime.UtcNow
        });
    }
}