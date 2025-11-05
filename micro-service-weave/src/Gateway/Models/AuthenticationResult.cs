namespace Gateway.Api.Models;

public class AuthenticationResult
{
    public long UsuarioId { get; set; }
    public long PersonalId { get; set; }
    public string Username { get; set; } = string.Empty;
    public long RolId { get; set; }
    public long PersonaId { get; set; }
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string ApellidoMaterno { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public string? CodigoEmpleado { get; set; }
    public long? TipoPersonalId { get; set; }
    public long? CargoId { get; set; }
    public string? Colegiatura { get; set; }
    public string? Rne { get; set; }
}