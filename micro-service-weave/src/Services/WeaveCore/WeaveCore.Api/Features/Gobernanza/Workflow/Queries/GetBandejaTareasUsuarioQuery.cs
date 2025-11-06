using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using WeaveCore.Api.Features.Gobernanza.Workflow.Dtos;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Queries
{
    /// <summary>
    /// Query para obtener la bandeja de tareas de un usuario específico
    /// </summary>
    public class GetBandejaTareasUsuarioQuery : IRequest<IEnumerable<BandejaTareasDto>>
    {
        [Required]
        [Range(1, long.MaxValue)]
        public long UsuarioId { get; set; }

        // Filtros opcionales
        public bool IncluirCompletadas { get; set; } = true;
        public bool IncluirPendientes { get; set; } = true;
        public bool IncluirEnProceso { get; set; } = true;
        public bool IncluirRechazadas { get; set; } = false;

        // Filtros de fecha
        public DateTime? FechaInicioDesde { get; set; }
        public DateTime? FechaInicioHasta { get; set; }
        public DateTime? FechaCompletadoDesde { get; set; }
        public DateTime? FechaCompletadoHasta { get; set; }

        // Paginación/Límites
        public int? LimitePendientes { get; set; } = 50;
        public int? LimiteCompletadas { get; set; } = 20;

        // Filtros adicionales
        public string? AccionWorkflow { get; set; }
        public long? GobernanzaId { get; set; }
        public long? WorkflowGrupoId { get; set; }

        // Ordenamiento (por ahora fijo en SP: FechaInicioTarea DESC)
        public string OrdenarPor { get; set; } = "FechaInicioTarea";
        public bool OrdenDescendente { get; set; } = true;
    }
}