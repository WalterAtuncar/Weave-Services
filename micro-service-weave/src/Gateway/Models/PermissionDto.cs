namespace Gateway.Api.Models;

public class PermissionDto
{
    public int PermisoId { get; set; }
    public string Modulo { get; set; } = string.Empty;
    public string Accion { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}