using BCrypt.Net;
using Gateway.Api.Models;
using Gateway.Api.Configuration;
using Microsoft.Extensions.Options;

namespace Gateway.Api.Services;

/// <summary>
/// Servicio de encriptación de contraseñas usando BCrypt
/// </summary>
public class EncryptionService : IEncryptionService
{
    private readonly ILogger<EncryptionService> _logger;
    private readonly EncryptionSettings _encryptionSettings;

    public EncryptionService(
        ILogger<EncryptionService> logger,
        IOptions<EncryptionSettings> encryptionSettings)
    {
        _logger = logger;
        _encryptionSettings = encryptionSettings.Value;
    }

    public Task<EncryptionResponse> EncryptPasswordAsync(string password)
    {
        try
        {
            // Combinar la contraseña con la semilla del appsettings
            var saltedPassword = password + _encryptionSettings.BCrypt.Salt;
            
            // Encriptar usando BCrypt con las rondas configuradas
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(saltedPassword, _encryptionSettings.BCrypt.Rounds);

            var response = new EncryptionResponse
            {
                OriginalText = password,
                EncryptedText = hashedPassword,
                EncryptionType = "bcrypt",
                AlgorithmInfo = $"BCrypt con {_encryptionSettings.BCrypt.Rounds} rondas y semilla personalizada",
                Success = true,
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Contraseña encriptada exitosamente usando BCrypt con semilla personalizada");
            return Task.FromResult(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al encriptar contraseña");
            return Task.FromResult(new EncryptionResponse
            {
                OriginalText = password,
                EncryptionType = "bcrypt",
                Success = false,
                ErrorMessage = $"Error interno: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    public bool VerifyBcryptHash(string plainPassword, string hash)
    {
        try
        {
            // Combinar la contraseña con la misma semilla usada para encriptar
            var saltedPassword = plainPassword + _encryptionSettings.BCrypt.Salt;
            
            // Verificar usando BCrypt
            return BCrypt.Net.BCrypt.Verify(saltedPassword, hash);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar hash BCrypt");
            return false;
        }
    }
}