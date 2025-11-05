using System.ComponentModel.DataAnnotations;

namespace Gateway.Api.Models;

/// <summary>
/// Request para verificar una contraseña contra un hash BCrypt
/// </summary>
public class PasswordVerificationRequest
{
    /// <summary>
    /// Contraseña en texto plano
    /// </summary>
    [Required(ErrorMessage = "La contraseña es requerida")]
    public string PlainPassword { get; set; } = string.Empty;

    /// <summary>
    /// Hash BCrypt a verificar
    /// </summary>
    [Required(ErrorMessage = "El hash es requerido")]
    public string Hash { get; set; } = string.Empty;
}