namespace WeaveCore.Api.Features.Gobernanza.Workflow.Dtos
{
    /// <summary>
    /// Resultado de una acción de workflow ejecutada vía email.
    /// </summary>
    public class EmailActionResultDto
    {
        public bool Success { get; set; }
        public string Status { get; set; } = string.Empty; // APROBADO, RECHAZADO, EXPIRADO, INVALIDO, UTILIZADO, NO_ACTIVA
        public string Message { get; set; } = string.Empty;

        public long? GobernanzaWorkflowId { get; set; }
        public long? WorkflowEjecucionId { get; set; }
        public long? UsuarioId { get; set; }
    }
}