using MediatR;
using System.ComponentModel.DataAnnotations;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Commands
{
    public class AvanzarWorkflowCommand : IRequest<bool>
    {
        [Required(ErrorMessage = "El ID de la ejecución del workflow es requerido")]
        [Range(1, long.MaxValue, ErrorMessage = "El ID de la ejecución debe ser mayor a 0")]
        public long WorkflowEjecucionId { get; set; }

        // Usuario que aprueba (en microservicio se envía desde el front/claim)
        [Range(1, long.MaxValue, ErrorMessage = "El ID de usuario debe ser mayor a 0")]
        public long UsuarioId { get; set; }

        [MaxLength(1000, ErrorMessage = "Las observaciones no pueden exceder 1000 caracteres")]
        public string? Observaciones { get; set; }

        // ==========================================
        // INFORMACIÓN ADICIONAL PARA COMPLETAR EL FLUJO
        // ==========================================

        // ID del sistema en contexto (opcional)
        public long? SistemaId { get; set; }

        // Nombre del sistema (opcional)
        [MaxLength(200, ErrorMessage = "El nombre del sistema no puede exceder 200 caracteres")]
        public string? NombreSistema { get; set; }

        // Acción del workflow (CREAR, ACTUALIZAR, etc.)
        [MaxLength(50, ErrorMessage = "La acción del workflow no puede exceder 50 caracteres")]
        public string? AccionWorkflow { get; set; }

        // Datos del solicitante original (opcionales)
        public long? UsuarioSolicitanteId { get; set; }

        [EmailAddress(ErrorMessage = "El email del solicitante no es válido")]
        [MaxLength(200, ErrorMessage = "El email del solicitante no puede exceder 200 caracteres")]
        public string? EmailSolicitante { get; set; }

        [MaxLength(200, ErrorMessage = "El nombre del solicitante no puede exceder 200 caracteres")]
        public string? NombreSolicitante { get; set; }

        // ID del workflow de gobernanza (opcional)
        public long? GobernanzaWorkflowId { get; set; }
    }
}