using Gateway.Api.Models;

namespace Gateway.Api.Services;

/// <summary>
/// Interfaz para el servicio de encriptación de contraseñas
/// </summary>
public interface IEncryptionService
{
    /// <summary>
    /// Encripta una contraseña usando BCrypt con configuración del appsettings
    /// </summary>
    /// <param name="password">Contraseña a encriptar</param>
    /// <returns>Response con la contraseña encriptada</returns>
    Task<EncryptionResponse> EncryptPasswordAsync(string password);

    /// <summary>
    /// Verifica si una contraseña coincide con un hash BCrypt
    /// </summary>
    /// <param name="plainPassword">Contraseña en claro</param>
    /// <param name="hash">Hash BCrypt</param>
    /// <returns>True si coincide, false en caso contrario</returns>
    bool VerifyBcryptHash(string plainPassword, string hash);
}