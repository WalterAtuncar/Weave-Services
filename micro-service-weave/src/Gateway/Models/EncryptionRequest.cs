using System.ComponentModel.DataAnnotations;

namespace Gateway.Api.Models;

/// <summary>
/// Modelo de request para encriptar texto
/// </summary>
public class EncryptionRequest
{
    /// <summary>
    /// Texto a encriptar
    /// </summary>
    [Required(ErrorMessage = "El texto es requerido")]
    [StringLength(10000, ErrorMessage = "El texto no puede exceder los 10,000 caracteres")]
    public string Text { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de encriptación: bcrypt, sha256, base64, md5
    /// </summary>
    [Required(ErrorMessage = "El tipo de encriptación es requerido")]
    public string EncryptionType { get; set; } = "bcrypt";

    /// <summary>
    /// Número de rondas para BCrypt (opcional, por defecto 12)
    /// </summary>
    public int? BcryptRounds { get; set; } = 12;
}