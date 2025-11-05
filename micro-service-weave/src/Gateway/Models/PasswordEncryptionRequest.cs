using System.ComponentModel.DataAnnotations;

namespace Gateway.Api.Models;

/// <summary>
/// Request para encriptar una contraseña
/// </summary>
public class PasswordEncryptionRequest
{
    /// <summary>
    /// Contraseña a encriptar
    /// </summary>
    [Required(ErrorMessage = "La contraseña es requerida")]
    [StringLength(100, ErrorMessage = "La contraseña no puede exceder los 100 caracteres")]
    public string Password { get; set; } = string.Empty;
}