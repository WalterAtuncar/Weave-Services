namespace Gateway.Api.Configuration;

/// <summary>
/// Configuración para el servicio de encriptación BCrypt
/// </summary>
public class EncryptionSettings
{
    public BCryptSettings BCrypt { get; set; } = new();
}

public class BCryptSettings
{
    public string Salt { get; set; } = string.Empty;
    public int Rounds { get; set; } = 12;
}