using System;

namespace WeaveCore.Api.Features.Gobernanza.Dtos;

public class GobernanzaEstadisticasDto
{
    public int Total { get; set; }
    public int Activas { get; set; }
    public int Vencidas { get; set; }
    public int ProximasAVencer { get; set; }
}