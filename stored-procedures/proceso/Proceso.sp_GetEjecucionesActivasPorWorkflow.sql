-- SP: Proceso.sp_GetEjecucionesActivasPorWorkflow
-- Propósito: Obtener las ejecuciones activas (pendientes y activadas) de una instancia de workflow
-- Contrato:
--   Parámetros:
--     @GobernanzaWorkflowId BIGINT
--   Resultado: filas con WorkflowEjecucionId, UsuarioActualId, OrdenEjecucion
GO
CREATE OR ALTER PROCEDURE Proceso.sp_GetEjecucionesActivasPorWorkflow
  @GobernanzaWorkflowId BIGINT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT e.WorkflowEjecucionId,
         e.UsuarioActualId,
         g.OrdenEjecucion
  FROM Proceso.GobernanzaWorkflowEjecucion e
  INNER JOIN Proceso.GobernanzaWorkflowGrupo g ON g.WorkflowGrupoId = e.WorkflowGrupoId
  WHERE e.GobernanzaWorkflowId = @GobernanzaWorkflowId
    AND e.EsActivo = 1
    AND e.EstadoTarea = 0; -- pendiente
END
GO