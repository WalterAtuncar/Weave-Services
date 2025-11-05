namespace WeaveCore.Api.Features.DocumentosCarpetas.Dtos;

public class CarpetaArbolItemDto
{
    public long CarpetaId { get; set; }
    public long OrganizacionId { get; set; }
    public string NombreCarpeta { get; set; } = string.Empty;
    public long? CarpetaPadreId { get; set; }
    public bool CarpetaPrivada { get; set; }
    public int Nivel { get; set; }
}