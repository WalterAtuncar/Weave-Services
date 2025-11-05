namespace Gateway.Api.Models;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
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
    public long UsuarioId { get; set; }
    public string Username { get; set; } = string.Empty;
    public long RolId { get; set; }
    public IEnumerable<PermissionDto> Permissions { get; set; } = Enumerable.Empty<PermissionDto>();
    public string SidebarJson { get; set; } = "[]";
}