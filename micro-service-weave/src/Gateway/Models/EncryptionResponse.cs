namespace Gateway.Api.Models;

/// <summary>
/// Modelo de response para el resultado de la encriptación
/// </summary>
public class EncryptionResponse
{
    /// <summary>
    /// Texto original
    /// </summary>
    public string OriginalText { get; set; } = string.Empty;

    /// <summary>
    /// Texto encriptado
    /// </summary>
    public string EncryptedText { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de encriptación utilizada
    /// </summary>
    public string EncryptionType { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora de la encriptación
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Indica si la encriptación fue exitosa
    /// </summary>
    public bool Success { get; set; } = true;

    /// <summary>
    /// Mensaje de error si la encriptación falló
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Información adicional sobre el algoritmo utilizado
    /// </summary>
    public string? AlgorithmInfo { get; set; }
}