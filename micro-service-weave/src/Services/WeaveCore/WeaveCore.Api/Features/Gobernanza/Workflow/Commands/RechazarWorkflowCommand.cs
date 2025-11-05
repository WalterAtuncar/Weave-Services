using MediatR;
using System.ComponentModel.DataAnnotations;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Commands
{
    public class RechazarWorkflowCommand : IRequest<bool>
    {
        [Required(ErrorMessage = "El ID de la ejecución del workflow es requerido")]
        [Range(1, long.MaxValue, ErrorMessage = "El ID de la ejecución debe ser mayor a 0")]
        public long WorkflowEjecucionId { get; set; }

        [Range(1, long.MaxValue, ErrorMessage = "El ID de usuario debe ser mayor a 0")]
        public long UsuarioId { get; set; }

        [MaxLength(1000, ErrorMessage = "El motivo de rechazo no puede exceder 1000 caracteres")]
        public string? MotivoRechazo { get; set; }

        // Información adicional para simetría con aprobación
        public long? SistemaId { get; set; }

        [MaxLength(200, ErrorMessage = "El nombre del sistema no puede exceder 200 caracteres")]
        public string? NombreSistema { get; set; }

        [MaxLength(50, ErrorMessage = "La acción del workflow no puede exceder 50 caracteres")]
        public string? AccionWorkflow { get; set; }

        public long? UsuarioSolicitanteId { get; set; }

        [EmailAddress(ErrorMessage = "El email del solicitante no es válido")]
        [MaxLength(200, ErrorMessage = "El email del solicitante no puede exceder 200 caracteres")]
        public string? EmailSolicitante { get; set; }

        [MaxLength(200, ErrorMessage = "El nombre del solicitante no puede exceder 200 caracteres")]
        public string? NombreSolicitante { get; set; }

        public long? GobernanzaWorkflowId { get; set; }
    }
}