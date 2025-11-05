using System;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Dtos
{
    /// <summary>
    /// DTO para la bandeja de tareas de workflow de un usuario
    /// Combina información de GobernanzaWorkflow y GobernanzaWorkflowEjecucion
    /// </summary>
    public class BandejaTareasDto
    {
        // Ejecución
        public long WorkflowEjecucionId { get; set; }
        public long GobernanzaWorkflowId { get; set; }
        public long? WorkflowGrupoId { get; set; }
        public long RolActualId { get; set; }
        public long UsuarioActualId { get; set; }
        public long? RolSiguienteId { get; set; }
        public long? UsuarioSiguienteId { get; set; }
        public int EstadoTarea { get; set; }
        public bool EsActivo { get; set; }
        public DateTime FechaInicioTarea { get; set; }
        public DateTime? FechaCompletado { get; set; }

        // Workflow
        public long GobernanzaId { get; set; }
        public long EntidadId { get; set; }
        public string? AccionWork { get; set; }
        public int EstadoWorkflow { get; set; }

        // Relacionados (nombres opcionales; pueden ser null)
        public string? GobernanzaNombre { get; set; }
        public string? RolActualNombre { get; set; }
        public string? UsuarioActualNombre { get; set; }
        public string? RolSiguienteNombre { get; set; }
        public string? UsuarioSiguienteNombre { get; set; }
        public string? TipoEntidadNombre { get; set; }
        public string? TipoGobiernoNombre { get; set; }
    }
}